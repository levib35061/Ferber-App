/**
 * Partner sync with Supabase. Offline first: local SQLite is always the
 * source the UI reads; this engine pushes dirty rows and pulls changes.
 *
 * - Push: every dirty row is upserted (babies → nights → events). The server
 *   keeps the newest write per row (last write wins on updated_at).
 * - Pull: rows changed on the server since our cursor are applied locally if
 *   they're at least as new as the local copy.
 * - When: soon after any local write, when the app comes to the foreground,
 *   when realtime reports a partner's change, and every 15 s while open.
 *   Failures (no signal) just leave rows dirty for the next attempt.
 */
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { SQLiteDatabase } from 'expo-sqlite';
import { AppState } from 'react-native';

import {
  applyRemoteBaby,
  applyRemoteEvent,
  applyRemoteNight,
  replaceLocalData,
  removeStrayBabies,
  getOrCreateBaby,
  getSettings,
  getSyncValue,
  listDirty,
  markAllDirty,
  markClean,
  pendingDutyChanges,
  clearDutyChanges,
  onLocalWrite,
  rekeyLocalData,
  setBabyFamily,
  setSyncValue,
} from './db';
import type { Member } from '../lib/duty';
import { registerPushToken } from './push';
import { ensureUserId, supabase } from './supabase';
import { isSignInProblem } from '../lib/syncErrors';

export interface SyncStatus {
  familyId: string | null;
  inviteCode: string | null;
  memberCount: number;
  /** This phone's signed-in user id, once known */
  userId: string | null;
  /** All family members' user ids */
  memberIds: string[];
  /** All family members with the names they chose (same order as memberIds) */
  members: Member[];
  lastSyncedAt: number | null;
  syncing: boolean;
  error: string | null;
  /** Server says this family has the unlock (null = not known yet) */
  unlocked: boolean | null;
  /**
   * Sharing is on but this phone can't act for the family: its sign-in is gone, or the
   * account it's signed in to isn't a member. Retrying won't fix it; the person has to
   * sign in again or rejoin. Distinct from `error` (offline, will retry by itself).
   */
  needsSignIn: boolean;
}

const PULL_OVERLAP_MS = 5_000;
const PAGE = 1000;
const TABLES = ['babies', 'nights', 'events'] as const;
type Table = (typeof TABLES)[number];

/** The newest server_updated_at among rows (or the cursor if none are newer). */
function latestStamp(rows: Record<string, unknown>[], cursor: string | null): string | null {
  let maxSeen = cursor;
  for (const r of rows) {
    const ts = r.server_updated_at as string;
    if (!maxSeen || new Date(ts) > new Date(maxSeen)) maxSeen = ts;
  }
  return maxSeen;
}

export class SyncEngine {
  private db: SQLiteDatabase;
  private onRemoteChange: () => void = () => {};
  private status: SyncStatus = {
    familyId: null,
    inviteCode: null,
    memberCount: 0,
    userId: null,
    memberIds: [],
    members: [],
    lastSyncedAt: null,
    syncing: false,
    error: null,
    unlocked: null,
    needsSignIn: false,
  };
  private statusListeners = new Set<(s: SyncStatus) => void>();
  private channel: RealtimeChannel | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;
  private running: Promise<void> | null = null;
  private again = false;
  private cleanups: (() => void)[] = [];

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async start(): Promise<void> {
    const baby = await getOrCreateBaby(this.db);
    this.setStatus({
      familyId: baby.familyId,
      inviteCode: await getSyncValue<string>(this.db, 'inviteCode'),
      unlocked: await getSyncValue<boolean>(this.db, 'unlocked'),
    });
    await this.restoreMembers(baby.familyId);
    this.checkUnlock().catch(() => {});
    this.cleanups.push(onLocalWrite(() => this.soon(400)));
    const sub = AppState.addEventListener('change', (s) => s === 'active' && this.soon(0));
    this.cleanups.push(() => sub.remove());
    // Backstop for a missed realtime event (rare, e.g. while the socket reconnects).
    this.interval = setInterval(() => AppState.currentState === 'active' && this.soon(0), 15_000);
    if (baby.familyId) {
      // Works offline: uses the saved session.
      ensureUserId()
        .then((id) => {
          this.userId = id;
          this.setStatus({ userId: id });
        })
        .catch(() => {});
      this.subscribe(baby.familyId);
      this.soon(0);
    }
  }

  stop(): void {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    if (this.interval) clearInterval(this.interval);
    if (this.timer) clearTimeout(this.timer);
    this.unsubscribe();
  }

  /** Called after a partner's changes were applied locally. */
  setOnRemoteChange(fn: () => void): void {
    this.onRemoteChange = fn;
  }

  getStatus(): SyncStatus {
    return this.status;
  }

  onStatus(fn: (s: SyncStatus) => void): () => void {
    this.statusListeners.add(fn);
    return () => this.statusListeners.delete(fn);
  }

  /** Start sharing: creates a family on the server and uploads everything on this phone. */
  async createFamily(): Promise<void> {
    await ensureUserId({ create: true });
    const { data, error } = await supabase.rpc('create_family');
    if (error) throw new Error(error.message);
    const fam = data as { id: string; invite_code: string };
    const baby = await getOrCreateBaby(this.db);
    await setBabyFamily(this.db, baby.id, fam.id);
    await markAllDirty(this.db);
    await setSyncValue(this.db, 'inviteCode', fam.invite_code);
    this.setStatus({ familyId: fam.id, inviteCode: fam.invite_code });
    this.subscribe(fam.id);
    await this.syncNow();
  }

  /** Join the partner's family. This phone's own logged nights are replaced by the family's. */
  async joinFamily(code: string): Promise<void> {
    const me = await ensureUserId({ create: true });
    const { data, error } = await supabase.rpc('join_family', { code });
    if (error?.message.includes('too many')) {
      throw new Error('Too many wrong codes. Please wait an hour, then try again.');
    }
    // A wrong code comes back empty (older servers raised "not found").
    if ((error && error.message.includes('not found')) || (!error && !data)) {
      throw new Error("That code wasn't found. Check it and try again.");
    }
    if (error) throw new Error(error.message);
    const familyId = data as string;
    const { data: fam } = await supabase.from('families').select('invite_code').eq('id', familyId).single();
    // Download the family's nights first. Nothing on this phone changes until all of it
    // has arrived, so a dropped connection here leaves the phone exactly as it was.
    const downloaded = {} as Record<Table, Record<string, unknown>[]>;
    try {
      for (const t of TABLES) downloaded[t] = await this.fetchRows(familyId, t, '1970-01-01T00:00:00Z');
    } catch (e) {
      throw new Error(`Couldn't download your family's nights (${e instanceof Error ? e.message : String(e)}). Check your signal and try again.`);
    }
    if (!downloaded.babies.length) {
      // Not joined after all: undo the membership so the partner's phone doesn't list us.
      await supabase.from('family_members').delete().eq('family_id', familyId).eq('user_id', me).then(
        () => {},
        () => {},
      );
      throw new Error(
        "Your partner's phone hasn't finished sharing yet. Open the app on their phone (with signal), then try again.",
      );
    }
    // Then swap this phone's data for the family's in one step.
    await replaceLocalData(this.db, async () => {
      for (const t of TABLES) for (const r of downloaded[t]) await this.applyRow(t, r);
    });
    for (const t of TABLES) await setSyncValue(this.db, `cursor.${t}`, latestStamp(downloaded[t], null));
    await setSyncValue(this.db, 'inviteCode', fam?.invite_code ?? code.toUpperCase());
    this.setStatus({ familyId, inviteCode: fam?.invite_code ?? code.toUpperCase() });
    await removeStrayBabies(this.db);
    this.subscribe(familyId);
    this.onRemoteChange();
    await this.syncNow();
  }

  /**
   * Delete this user's account on the server (Apple requires in-app deletion).
   * Only if they ever signed in; never creates an account just to delete it.
   * Throws if the server can't be reached, so nothing is half-deleted.
   */
  async deleteAccount(): Promise<void> {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      // The server revokes any Sign in with Apple token with Apple, then deletes
      // the account and its data (supabase/functions/delete-account).
      const { data: res, error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
      if (error || !(res as { ok?: boolean } | null)?.ok) {
        throw new Error(
          (res as { error?: string } | null)?.error ?? "Couldn't reach the server to delete your account. Please try again.",
        );
      }
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    }
    this.unsubscribe();
    this.userId = null;
    this.setStatus({
      familyId: null,
      inviteCode: null,
      memberCount: 0,
      memberIds: [],
      members: [],
      userId: null,
      lastSyncedAt: null,
      error: null,
      needsSignIn: false,
    });
  }

  /** Stop sharing on this phone. Local data stays; the partner keeps theirs. */
  async leaveFamily(): Promise<void> {
    const familyId = this.status.familyId;
    if (familyId) {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await supabase.from('family_members').delete().eq('family_id', familyId).eq('user_id', data.session.user.id);
      }
    }
    this.unsubscribe();
    // This phone's copy becomes its own (new ids, no family), so sharing can start again later.
    await rekeyLocalData(this.db);
    await setSyncValue(this.db, 'inviteCode', null);
    for (const t of TABLES) await setSyncValue(this.db, `cursor.${t}`, null);
    this.setStatus({
      familyId: null,
      inviteCode: null,
      memberCount: 0,
      memberIds: [],
      members: [],
      lastSyncedAt: null,
      error: null,
      needsSignIn: false,
    });
  }

  /** Debounced sync request. */
  soon(delayMs: number): void {
    if (!this.status.familyId) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      this.syncNow().catch(() => {});
    }, delayMs);
  }

  /** Push then pull. Concurrent calls coalesce into one extra run. */
  async syncNow(): Promise<void> {
    if (!this.status.familyId) return;
    if (this.running) {
      this.again = true;
      return this.running;
    }
    this.running = (async () => {
      do {
        this.again = false;
        await this.runOnce();
      } while (this.again);
    })().finally(() => {
      this.running = null;
    });
    return this.running;
  }

  /** The signed-in user's id once known (stamped on events as createdBy). */
  userId: string | null = null;

  /** One sync from a background push (no listeners, timers or realtime). Returns true if anything changed. */
  /** The family's members as last seen online (only for the same family). */
  private async restoreMembers(familyId: string | null): Promise<void> {
    if (!familyId) return;
    const saved = await getSyncValue<{ familyId: string; members: Member[] }>(this.db, 'members');
    if (saved?.familyId !== familyId || !saved.members?.length) return;
    this.setStatus({ memberCount: saved.members.length, memberIds: saved.members.map((m) => m.id), members: saved.members });
  }

  async backgroundSync(): Promise<boolean> {
    const baby = await getOrCreateBaby(this.db);
    this.setStatus({ familyId: baby.familyId });
    if (!baby.familyId) return false;
    await this.restoreMembers(baby.familyId);
    this.userId = await ensureUserId();
    this.setStatus({ userId: this.userId });
    let changed = false;
    const prev = this.onRemoteChange;
    this.onRemoteChange = () => {
      changed = true;
    };
    await this.runOnce();
    this.onRemoteChange = prev;
    return changed;
  }

  /** Ask the server whether anyone in this family bought the unlock (only if signed in). Cached for offline. */
  async checkUnlock(): Promise<void> {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    const { data: unlocked, error } = await supabase.rpc('my_unlock_status');
    if (error) return;
    await setSyncValue(this.db, 'unlocked', !!unlocked);
    if (this.status.unlocked !== !!unlocked) this.setStatus({ unlocked: !!unlocked });
  }

  private pushRegistered = false;

  private async runOnce(): Promise<void> {
    const familyId = this.status.familyId;
    if (!familyId) return;
    this.setStatus({ syncing: true });
    try {
      this.userId = await ensureUserId();
      if (this.status.userId !== this.userId) this.setStatus({ userId: this.userId });
      await this.push(familyId);
      const changed = await this.pullAll(familyId);
      let { data: members } = await supabase
        .from('family_members')
        .select('user_id, display_name')
        .eq('family_id', familyId)
        .order('joined_at');
      // This phone's name lives in settings; keep the server's copy in step (also after creating or joining).
      const myName = (await getSettings(this.db)).myName.trim();
      const mine = members?.find((m: { user_id: string }) => m.user_id === this.userId);
      if (mine && (mine.display_name ?? '') !== myName) {
        await supabase.rpc('set_my_name', { n: myName });
        members = members!.map((m) => (m.user_id === this.userId ? { ...m, display_name: myName || null } : m));
      }
      const list: Member[] = (members ?? []).map((m: { user_id: string; display_name: string | null }) => ({
        id: m.user_id,
        name: m.display_name,
      }));
      // Remembered for the next launch, so an offline phone still knows it shares (and who's on duty).
      if (members && this.status.familyId) {
        await setSyncValue(this.db, 'members', { familyId: this.status.familyId, members: list });
      }
      this.setStatus({
        syncing: false,
        error: null,
        needsSignIn: false,
        lastSyncedAt: Date.now(),
        memberCount: members ? list.length : this.status.memberCount,
        memberIds: members ? list.map((m) => m.id) : this.status.memberIds,
        members: members ? list : this.status.members,
      });
      if (changed) this.onRemoteChange();
      await this.checkUnlock().catch(() => {});
      if (!this.pushRegistered) this.pushRegistered = await registerPushToken().catch(() => false);
    } catch (e) {
      this.setStatus({
        syncing: false,
        error: e instanceof Error ? e.message : String(e),
        needsSignIn: isSignInProblem(e),
      });
    }
  }

  /** Fire-and-forget: the partner-push Edge Function nudges the other parent's phone. */
  private notifyPartner(body: { eventIds?: string[]; nightId?: string }): void {
    if (this.status.memberCount < 2) return;
    supabase.functions.invoke('partner-push', { body }).catch(() => {});
  }

  private async push(familyId: string): Promise<void> {
    const dirty = await listDirty(this.db);
    if (dirty.babies.length) {
      const rows = dirty.babies.map((b) => ({
        id: b.id,
        family_id: familyId,
        name: b.name,
        birth_date: b.birthDate,
        training_start_date: b.trainingStartDate,
        chart_preset: b.chartPreset,
        custom_chart: b.customChart ? JSON.parse(b.customChart) : null,
        updated_at: b.updatedAt,
      }));
      const { error } = await supabase.from('babies').upsert(rows);
      if (error) throw new Error(error.message);
      await markClean(this.db, 'baby', dirty.babies);
    }
    if (dirty.nights.length) {
      const rows = dirty.nights.map((n) => ({
        id: n.id,
        family_id: familyId,
        baby_id: n.babyId,
        night_number: n.nightNumber,
        chart_night: n.chartNight,
        night_key: n.nightKey,
        started_at: n.startedAt,
        note: n.note,
        on_duty: n.onDuty ?? null,
        added_later: !!n.addedLater,
        updated_at: n.updatedAt,
      }));
      const { error } = await supabase.from('nights').upsert(rows);
      if (error) throw new Error(error.message);
      await markClean(this.db, 'night', dirty.nights);
      // Tell the partner about duty hand-offs that just reached the server.
      const pushed = new Set(dirty.nights.map((n) => n.id));
      const handoffs = pendingDutyChanges().filter((id) => pushed.has(id));
      clearDutyChanges(handoffs);
      for (const nightId of handoffs) this.notifyPartner({ nightId });
    }
    if (dirty.events.length) {
      const rows = dirty.events.map((e) => ({
        id: e.id,
        family_id: familyId,
        night_id: e.nightId,
        type: e.type,
        at: e.at,
        created_by: e.createdBy ?? null,
        deleted_at: e.deletedAt ?? null,
        updated_at: e.updatedAt,
      }));
      const { error } = await supabase.from('events').upsert(rows);
      if (error) throw new Error(error.message);
      await markClean(this.db, 'event', dirty.events);
      // Undos too, so the partner's phone drops an alert for a tap that no longer exists.
      const mine = dirty.events.filter((e) => e.createdBy && e.createdBy === this.userId).map((e) => e.id);
      if (mine.length) this.notifyPartner({ eventIds: mine });
      if (dirty.events.length >= 500) this.again = true; // more to push
    }
  }

  /** Returns true if anything was applied locally. */
  private async pullAll(familyId: string): Promise<boolean> {
    let changed = false;
    for (const t of TABLES) changed = (await this.pull(familyId, t)) || changed;
    return changed;
  }

  private async pull(familyId: string, table: Table): Promise<boolean> {
    const cursor = await getSyncValue<string>(this.db, `cursor.${table}`);
    const since = cursor ? new Date(new Date(cursor).getTime() - PULL_OVERLAP_MS).toISOString() : '1970-01-01T00:00:00Z';
    const rows = await this.fetchRows(familyId, table, since);
    for (const r of rows) await this.applyRow(table, r);
    const maxSeen = latestStamp(rows, cursor);
    if (maxSeen && maxSeen !== cursor) await setSyncValue(this.db, `cursor.${table}`, maxSeen);
    return rows.length > 0;
  }

  /** Download a table's rows for the family, changed since `since` (network only; writes nothing). */
  private async fetchRows(familyId: string, table: Table, since: string): Promise<Record<string, unknown>[]> {
    const out: Record<string, unknown>[] = [];
    let from = 0;
    for (;;) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('family_id', familyId)
        .gte('server_updated_at', since)
        .order('server_updated_at')
        .range(from, from + PAGE - 1);
      if (error) throw new Error(error.message);
      const rows = (data ?? []) as Record<string, unknown>[];
      out.push(...rows);
      if (rows.length < PAGE) break;
      from += PAGE;
    }
    return out;
  }

  private async applyRow(table: Table, r: Record<string, unknown>): Promise<void> {
    const n = (v: unknown) => (v == null ? null : Number(v));
    if (table === 'babies') {
      await applyRemoteBaby(this.db, {
        id: r.id as string,
        name: (r.name as string) ?? '',
        birthDate: (r.birth_date as string) ?? null,
        trainingStartDate: (r.training_start_date as string) ?? null,
        chartPreset: (r.chart_preset as 'ferber') ?? 'ferber',
        customChart: (r.custom_chart as number[][]) ?? null,
        familyId: r.family_id as string,
        updatedAt: Number(r.updated_at),
      });
    } else if (table === 'nights') {
      await applyRemoteNight(this.db, {
        id: r.id as string,
        babyId: r.baby_id as string,
        nightNumber: Number(r.night_number),
        chartNight: Number(r.chart_night),
        nightKey: r.night_key as string,
        startedAt: Number(r.started_at),
        note: (r.note as string) ?? null,
        onDuty: (r.on_duty as string) ?? null,
        addedLater: r.added_later === true,
        updatedAt: Number(r.updated_at),
      });
    } else {
      await applyRemoteEvent(this.db, {
        id: r.id as string,
        nightId: r.night_id as string,
        type: r.type as never,
        at: Number(r.at),
        createdBy: (r.created_by as string) ?? null,
        deletedAt: n(r.deleted_at),
        updatedAt: Number(r.updated_at),
      });
    }
  }

  private subscribe(familyId: string): void {
    this.unsubscribe();
    const filter = `family_id=eq.${familyId}`;
    let ch = supabase.channel(`family:${familyId}`);
    for (const table of TABLES) {
      ch = ch.on('postgres_changes', { event: '*', schema: 'public', table, filter }, () => this.soon(150));
    }
    // Catch anything that changed while connecting.
    this.channel = ch.subscribe((s) => s === 'SUBSCRIBED' && this.soon(500));
  }

  private unsubscribe(): void {
    if (this.channel) supabase.removeChannel(this.channel);
    this.channel = null;
  }

  private setStatus(patch: Partial<SyncStatus>): void {
    this.status = { ...this.status, ...patch };
    for (const fn of this.statusListeners) fn(this.status);
  }
}
