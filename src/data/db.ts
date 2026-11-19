/**
 * Local SQLite storage. Offline first: the app must work with no signal at 2am.
 * The schema mirrors Supabase (supabase/schema.sql). All ids are UUIDs so
 * offline records sync without collisions. All times are UTC epoch ms.
 *
 * Sync bookkeeping: every synced row has `updatedAt` (client ms, for
 * last-write-wins) and `dirty` (1 = not yet pushed). Every local write goes
 * through this module, sets both, and notifies `onLocalWrite` listeners so
 * the sync engine can push soon.
 */
import { CryptoDigestAlgorithm, digestStringAsync, randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { ChartPreset, Chart } from '../lib/ferber';
import { nightIdSeed, uuidFromHex } from '../lib/ids';
import { EventType, NightEvent } from '../lib/session';
import { nightKey } from '../lib/time';

export const DB_NAME = 'ferber.db';
const SCHEMA_VERSION = 4;

export interface Baby {
  id: string;
  name: string;
  birthDate: string | null;
  trainingStartDate: string | null;
  chartPreset: ChartPreset;
  customChart: Chart | null;
  /** Set once this phone creates or joins a family (partner sync) */
  familyId: string | null;
}

export interface Night {
  id: string;
  babyId: string;
  /** Training night count: 1, 2, 3, ... */
  nightNumber: number;
  /** Which chart row this night uses. Differs from nightNumber after "repeat last night". */
  chartNight: number;
  /** Local date of the evening ("YYYY-MM-DD") */
  nightKey: string;
  startedAt: number;
  note: string | null;
  /** User id of the parent on duty tonight (partner sharing). Null = not set. */
  onDuty?: string | null;
  /**
   * Entered afterwards ("Add a missed night"): 1/true. Its totals are real but the
   * times of wakings and check-ins were spread out evenly, so screens don't show them.
   */
  addedLater?: number | boolean | null;
}

export const isAddedLater = (n: Pick<Night, 'addedLater'> | null | undefined): boolean => !!n?.addedLater;

// ---------- change notification ----------

type Listener = () => void;
const localWriteListeners = new Set<Listener>();

/** Called after every local write (for the sync engine). Returns an unsubscribe function. */
export function onLocalWrite(fn: Listener): () => void {
  localWriteListeners.add(fn);
  return () => localWriteListeners.delete(fn);
}

function wrote() {
  for (const fn of localWriteListeners) fn();
}

// ---------- schema ----------

export async function migrate(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  if (version < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS baby (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL DEFAULT '',
        birthDate TEXT,
        trainingStartDate TEXT,
        chartPreset TEXT NOT NULL DEFAULT 'ferber',
        customChart TEXT,
        familyId TEXT
      );
      CREATE TABLE IF NOT EXISTS night (
        id TEXT PRIMARY KEY NOT NULL,
        babyId TEXT NOT NULL REFERENCES baby(id),
        nightNumber INTEGER NOT NULL,
        chartNight INTEGER NOT NULL,
        nightKey TEXT NOT NULL,
        startedAt INTEGER NOT NULL,
        note TEXT
      );
      CREATE INDEX IF NOT EXISTS night_baby_key ON night(babyId, nightKey);
      CREATE TABLE IF NOT EXISTS event (
        id TEXT PRIMARY KEY NOT NULL,
        nightId TEXT NOT NULL REFERENCES night(id),
        type TEXT NOT NULL,
        at INTEGER NOT NULL,
        createdBy TEXT,
        deletedAt INTEGER
      );
      CREATE INDEX IF NOT EXISTS event_night_at ON event(nightId, at);
      CREATE TABLE IF NOT EXISTS setting (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
    version = 1;
  }

  if (version < 2) {
    // Sync bookkeeping. Existing rows start dirty so they upload when a family is created.
    await db.execAsync(`
      ALTER TABLE baby ADD COLUMN updatedAt INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE baby ADD COLUMN dirty INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE night ADD COLUMN updatedAt INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE night ADD COLUMN dirty INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE event ADD COLUMN updatedAt INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE event ADD COLUMN dirty INTEGER NOT NULL DEFAULT 1;
    `);
    version = 2;
  }

  if (version < 3) {
    await db.execAsync('ALTER TABLE night ADD COLUMN onDuty TEXT;');
    version = 3;
  }

  if (version < 4) {
    // 1 = entered afterwards with "Add a missed night": only totals are real, not the times in between.
    await db.execAsync('ALTER TABLE night ADD COLUMN addedLater INTEGER NOT NULL DEFAULT 0;');
    version = 4;
  }

  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

// ---------- baby ----------

type BabyRow = Omit<Baby, 'customChart' | 'chartPreset'> & { customChart: string | null; chartPreset: string };

function babyFromRow(row: BabyRow): Baby {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birthDate,
    trainingStartDate: row.trainingStartDate,
    familyId: row.familyId,
    chartPreset: (row.chartPreset as ChartPreset) ?? 'ferber',
    customChart: row.customChart ? (JSON.parse(row.customChart) as Chart) : null,
  };
}

export async function getOrCreateBaby(db: SQLiteDatabase): Promise<Baby> {
  // A phone can hold more than one baby row (e.g. an empty one made while joining a
  // partner's family). Use the one actually being logged: latest tap first, then a
  // named baby, then the most recently edited.
  const row = await db.getFirstAsync<BabyRow>(
    `SELECT b.* FROM baby b
       LEFT JOIN night n ON n.babyId = b.id
       LEFT JOIN event e ON e.nightId = n.id AND e.deletedAt IS NULL
     GROUP BY b.id
     ORDER BY MAX(e.at) IS NULL, MAX(e.at) DESC, b.name = '', b.updatedAt DESC
     LIMIT 1`,
  );
  if (row) return babyFromRow(row);
  const baby: Baby = {
    id: randomUUID(),
    name: '',
    birthDate: null,
    trainingStartDate: null,
    chartPreset: 'ferber',
    customChart: null,
    familyId: null,
  };
  await db.runAsync(
    'INSERT INTO baby (id, name, chartPreset, updatedAt, dirty) VALUES (?, ?, ?, ?, 1)',
    baby.id,
    baby.name,
    baby.chartPreset,
    Date.now(),
  );
  return baby;
}

export async function updateBaby(db: SQLiteDatabase, baby: Baby): Promise<void> {
  await db.runAsync(
    `UPDATE baby SET name = ?, birthDate = ?, trainingStartDate = ?, chartPreset = ?, customChart = ?,
       updatedAt = ?, dirty = 1 WHERE id = ?`,
    baby.name,
    baby.birthDate,
    baby.trainingStartDate,
    baby.chartPreset,
    baby.customChart ? JSON.stringify(baby.customChart) : null,
    Date.now(),
    baby.id,
  );
  wrote();
}

/** Links (or unlinks) this phone's baby to a family. Kept separate so ordinary edits never touch it. */
export async function setBabyFamily(db: SQLiteDatabase, babyId: string, familyId: string | null): Promise<void> {
  await db.runAsync('UPDATE baby SET familyId = ?, updatedAt = ?, dirty = 1 WHERE id = ?', familyId, Date.now(), babyId);
  wrote();
}

// ---------- nights ----------

/** Same baby + same night date → same id on every phone. */
export async function nightIdFor(babyId: string, key: string): Promise<string> {
  return uuidFromHex(await digestStringAsync(CryptoDigestAlgorithm.SHA1, nightIdSeed(babyId, key)));
}

export async function getNightForKey(db: SQLiteDatabase, babyId: string, key: string): Promise<Night | null> {
  return db.getFirstAsync<Night>(
    'SELECT * FROM night WHERE babyId = ? AND nightKey = ? ORDER BY startedAt LIMIT 1',
    babyId,
    key,
  );
}

export async function getNight(db: SQLiteDatabase, nightId: string): Promise<Night | null> {
  return db.getFirstAsync<Night>('SELECT * FROM night WHERE id = ?', nightId);
}

/**
 * Most recent night before the given key that has at least one live event.
 * Nights before `roundStartKey` (an earlier training round) don't count, so a
 * new round starts again at night 1.
 */
export async function getPreviousNight(
  db: SQLiteDatabase,
  babyId: string,
  beforeKey: string,
  roundStartKey: string | null = null,
): Promise<Night | null> {
  return db.getFirstAsync<Night>(
    `SELECT n.* FROM night n
     WHERE n.babyId = ? AND n.nightKey < ? AND n.nightKey >= ?
       AND EXISTS (SELECT 1 FROM event e WHERE e.nightId = n.id AND e.deletedAt IS NULL)
     ORDER BY n.nightKey DESC LIMIT 1`,
    babyId,
    beforeKey,
    roundStartKey ?? '',
  );
}

export async function setNightNote(db: SQLiteDatabase, nightId: string, note: string): Promise<void> {
  await db.runAsync(
    'UPDATE night SET note = ?, updatedAt = ?, dirty = 1 WHERE id = ?',
    note.trim() ? note : null,
    Date.now(),
    nightId,
  );
  wrote();
}

/** What tonight's numbers would be, before a night row exists. */
export function plannedNumbers(prev: Night | null, repeatLastNight: boolean): { nightNumber: number; chartNight: number } {
  if (!prev) return { nightNumber: 1, chartNight: 1 };
  return {
    nightNumber: prev.nightNumber + 1,
    chartNight: repeatLastNight ? prev.chartNight : prev.chartNight + 1,
  };
}

/** Marks a night as entered afterwards (see Night.addedLater). */
export async function setNightAddedLater(db: SQLiteDatabase, nightId: string): Promise<void> {
  await db.runAsync('UPDATE night SET addedLater = 1, updatedAt = ?, dirty = 1 WHERE id = ?', Date.now(), nightId);
  wrote();
}

async function upsertNightRow(db: SQLiteDatabase, night: Night): Promise<void> {
  await db.runAsync(
    `INSERT INTO night (id, babyId, nightNumber, chartNight, nightKey, startedAt, note, onDuty, updatedAt, dirty)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
     ON CONFLICT(id) DO UPDATE SET nightNumber = excluded.nightNumber, chartNight = excluded.chartNight,
       startedAt = excluded.startedAt, note = excluded.note, onDuty = excluded.onDuty, updatedAt = excluded.updatedAt, dirty = 1`,
    night.id,
    night.babyId,
    night.nightNumber,
    night.chartNight,
    night.nightKey,
    night.startedAt,
    night.note,
    night.onDuty ?? null,
    Date.now(),
  );
}

export async function createNight(
  db: SQLiteDatabase,
  babyId: string,
  at: number,
  repeatLastNight: boolean,
  roundStartKey: string | null = null,
): Promise<Night> {
  const key = nightKey(at);
  const existing = await getNightForKey(db, babyId, key);
  if (existing) return existing;
  const prev = await getPreviousNight(db, babyId, key, roundStartKey);
  const nums = plannedNumbers(prev, repeatLastNight);
  const night: Night = { id: await nightIdFor(babyId, key), babyId, nightKey: key, startedAt: at, note: null, ...nums };
  await upsertNightRow(db, night);
  wrote();
  return night;
}

/** Who's on duty tonight (a user id), or null to clear. */
export async function setNightDuty(db: SQLiteDatabase, nightId: string, userId: string | null): Promise<void> {
  await db.runAsync('UPDATE night SET onDuty = ?, updatedAt = ?, dirty = 1 WHERE id = ?', userId, Date.now(), nightId);
  dutyChanged.add(nightId);
  wrote();
}

/** Nights whose on-duty parent changed on this phone, waiting to tell the partner (partner push). */
const dutyChanged = new Set<string>();
export function pendingDutyChanges(): string[] {
  return [...dutyChanged];
}
export function clearDutyChanges(ids: string[]): void {
  for (const id of ids) dutyChanged.delete(id);
}

export async function setNightChartNight(db: SQLiteDatabase, nightId: string, chartNight: number): Promise<void> {
  await db.runAsync(
    'UPDATE night SET chartNight = ?, updatedAt = ?, dirty = 1 WHERE id = ?',
    chartNight,
    Date.now(),
    nightId,
  );
  wrote();
}

// ---------- events ----------

export async function listEvents(db: SQLiteDatabase, nightId: string): Promise<NightEvent[]> {
  return db.getAllAsync<NightEvent>('SELECT * FROM event WHERE nightId = ? ORDER BY at, id', nightId);
}

export async function insertEvent(
  db: SQLiteDatabase,
  nightId: string,
  type: EventType,
  at: number,
  createdBy: string | null = null,
): Promise<NightEvent> {
  const e: NightEvent = { id: randomUUID(), nightId, type, at, createdBy, deletedAt: null };
  await db.runAsync(
    'INSERT INTO event (id, nightId, type, at, createdBy, deletedAt, updatedAt, dirty) VALUES (?, ?, ?, ?, ?, NULL, ?, 1)',
    e.id,
    e.nightId,
    e.type,
    e.at,
    e.createdBy ?? null,
    Date.now(),
  );
  wrote();
  return e;
}

export async function updateEventTime(db: SQLiteDatabase, eventId: string, at: number): Promise<void> {
  await db.runAsync('UPDATE event SET at = ?, updatedAt = ?, dirty = 1 WHERE id = ?', at, Date.now(), eventId);
  wrote();
}

/** Soft delete, so a delete reaches the partner's phone. */
export async function softDeleteEvent(db: SQLiteDatabase, eventId: string, at: number): Promise<void> {
  await db.runAsync('UPDATE event SET deletedAt = ?, updatedAt = ?, dirty = 1 WHERE id = ?', at, Date.now(), eventId);
  wrote();
}

/** Removes a whole night (every tap, soft-deleted so it reaches the partner too). */
export async function softDeleteNightEvents(db: SQLiteDatabase, nightId: string): Promise<void> {
  const now = Date.now();
  await db.runAsync(
    'UPDATE event SET deletedAt = ?, updatedAt = ?, dirty = 1 WHERE nightId = ? AND deletedAt IS NULL',
    now,
    now,
    nightId,
  );
  wrote();
}

// ---------- settings (key/value) ----------

export interface Settings {
  sound: boolean;
  haptics: boolean;
  keepAwake: boolean;
  /** First-launch onboarding finished */
  onboarded: boolean;
  /** Development only: pretend the unlock was bought (until purchases are wired up) */
  devUnlocked: boolean;
  /** App Store rating prompt: how many times we've asked, and when we last did (epoch ms, 0 = never) */
  reviewAsks: number;
  reviewAskedAt: number;
  /** This person's name, shown to the rest of the family ("Levi", "Grandma"). '' = not set */
  myName: string;
  /** The night whose better morning was already celebrated (confetti shows once per night) */
  celebratedNight: string;
}

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  haptics: true,
  keepAwake: true,
  onboarded: false,
  devUnlocked: false,
  reviewAsks: 0,
  reviewAskedAt: 0,
  myName: '',
  celebratedNight: '',
};

export async function getSettings(db: SQLiteDatabase): Promise<Settings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM setting');
  const out: Settings = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    if (r.key in out) (out as unknown as Record<string, unknown>)[r.key] = JSON.parse(r.value);
  }
  return out;
}

export async function setSetting<K extends keyof Settings>(db: SQLiteDatabase, key: K, value: Settings[K]): Promise<void> {
  await setRaw(db, key, value);
}

/** Sync bookkeeping (invite code, pull cursors), kept in the setting table under "sync." keys. */
export async function getSyncValue<T>(db: SQLiteDatabase, key: string): Promise<T | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM setting WHERE key = ?', `sync.${key}`);
  return row ? (JSON.parse(row.value) as T) : null;
}

export async function setSyncValue(db: SQLiteDatabase, key: string, value: unknown): Promise<void> {
  if (value == null) await db.runAsync('DELETE FROM setting WHERE key = ?', `sync.${key}`);
  else await setRaw(db, `sync.${key}`, value);
}

async function setRaw(db: SQLiteDatabase, key: string, value: unknown): Promise<void> {
  await db.runAsync(
    'INSERT INTO setting (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    JSON.stringify(value),
  );
}

/** All nights, newest first, with their live events. Fine for v1 volumes (weeks of data). */
export async function listNightsWithEvents(
  db: SQLiteDatabase,
  babyId: string,
): Promise<{ night: Night; events: NightEvent[] }[]> {
  const nights = await db.getAllAsync<Night>('SELECT * FROM night WHERE babyId = ? ORDER BY nightKey DESC', babyId);
  const events = await db.getAllAsync<NightEvent>(
    `SELECT e.* FROM event e JOIN night n ON n.id = e.nightId
     WHERE n.babyId = ? AND e.deletedAt IS NULL ORDER BY e.at, e.id`,
    babyId,
  );
  const byNight = new Map<string, NightEvent[]>();
  for (const e of events) {
    const list = byNight.get(e.nightId) ?? [];
    list.push(e);
    byNight.set(e.nightId, list);
  }
  return nights.map((night) => ({ night, events: byNight.get(night.id) ?? [] })).filter((n) => n.events.length > 0);
}

/** Nights with at least one logged tap, ever (for the free trial). */
export async function countNightsUsed(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(DISTINCT nightId) AS n FROM event WHERE deletedAt IS NULL',
  );
  return row?.n ?? 0;
}

// ---------- sync support (used by src/data/sync.ts) ----------

export interface DirtyRows {
  babies: (BabyRow & { updatedAt: number })[];
  nights: (Night & { updatedAt: number })[];
  events: (NightEvent & { updatedAt: number })[];
}

export async function listDirty(db: SQLiteDatabase): Promise<DirtyRows> {
  return {
    babies: await db.getAllAsync('SELECT * FROM baby WHERE dirty = 1'),
    nights: await db.getAllAsync('SELECT * FROM night WHERE dirty = 1'),
    events: await db.getAllAsync('SELECT * FROM event WHERE dirty = 1 LIMIT 500'),
  };
}

/** Clears the dirty flag only if the row hasn't changed again since it was read. */
export async function markClean(
  db: SQLiteDatabase,
  table: 'baby' | 'night' | 'event',
  rows: { id: string; updatedAt: number }[],
): Promise<void> {
  for (const r of rows) {
    await db.runAsync(`UPDATE ${table} SET dirty = 0 WHERE id = ? AND updatedAt = ?`, r.id, r.updatedAt);
  }
}

export async function markAllDirty(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('UPDATE baby SET dirty = 1; UPDATE night SET dirty = 1; UPDATE event SET dirty = 1;');
}

/** Rows from the server. Applied only if newer than (or equal to) the local copy; they arrive clean. */
export async function applyRemoteBaby(db: SQLiteDatabase, b: Baby & { updatedAt: number }): Promise<void> {
  await db.runAsync(
    `INSERT INTO baby (id, name, birthDate, trainingStartDate, chartPreset, customChart, familyId, updatedAt, dirty)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, birthDate = excluded.birthDate,
       trainingStartDate = excluded.trainingStartDate, chartPreset = excluded.chartPreset,
       customChart = excluded.customChart, familyId = excluded.familyId, updatedAt = excluded.updatedAt, dirty = 0
     WHERE excluded.updatedAt >= baby.updatedAt`,
    b.id,
    b.name,
    b.birthDate,
    b.trainingStartDate,
    b.chartPreset,
    b.customChart ? JSON.stringify(b.customChart) : null,
    b.familyId,
    b.updatedAt,
  );
}

export async function applyRemoteNight(db: SQLiteDatabase, n: Night & { updatedAt: number }): Promise<void> {
  await db.runAsync(
    `INSERT INTO night (id, babyId, nightNumber, chartNight, nightKey, startedAt, note, onDuty, addedLater, updatedAt, dirty)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
     ON CONFLICT(id) DO UPDATE SET nightNumber = excluded.nightNumber, chartNight = excluded.chartNight,
       startedAt = excluded.startedAt, note = excluded.note, onDuty = excluded.onDuty, addedLater = excluded.addedLater,
       updatedAt = excluded.updatedAt, dirty = 0
     WHERE excluded.updatedAt >= night.updatedAt`,
    n.id,
    n.babyId,
    n.nightNumber,
    n.chartNight,
    n.nightKey,
    n.startedAt,
    n.note,
    n.onDuty ?? null,
    n.addedLater ? 1 : 0,
    n.updatedAt,
  );
}

export async function applyRemoteEvent(db: SQLiteDatabase, e: NightEvent & { updatedAt: number }): Promise<void> {
  await db.runAsync(
    `INSERT INTO event (id, nightId, type, at, createdBy, deletedAt, updatedAt, dirty)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)
     ON CONFLICT(id) DO UPDATE SET type = excluded.type, at = excluded.at, createdBy = excluded.createdBy,
       deletedAt = excluded.deletedAt, updatedAt = excluded.updatedAt, dirty = 0
     WHERE excluded.updatedAt >= event.updatedAt`,
    e.id,
    e.nightId,
    e.type,
    e.at,
    e.createdBy ?? null,
    e.deletedAt ?? null,
    e.updatedAt,
  );
}

/** Joining a partner's family: this phone's own (never-shared) data is replaced by the family's. */
/**
 * After joining a family: drop baby rows that aren't part of any family (an empty
 * baby can be created in the moment between clearing this phone and downloading
 * the partner's data). Never touches babies with nights.
 */
export async function removeStrayBabies(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM baby WHERE familyId IS NULL AND id NOT IN (SELECT DISTINCT babyId FROM night)');
}

/** Replace this phone's babies, nights and taps with what `fill` writes, in one transaction. */
export async function replaceLocalData(db: SQLiteDatabase, fill: () => Promise<void>): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM event');
    await db.runAsync('DELETE FROM night');
    await db.runAsync('DELETE FROM baby');
    await fill();
  });
}

/** "Delete my account and data": wipes everything on this phone, including settings. */
export async function wipeAllLocalData(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM event');
    await db.runAsync('DELETE FROM night');
    await db.runAsync('DELETE FROM baby');
    await db.runAsync('DELETE FROM setting');
  });
}

/**
 * After leaving a family: give this phone's baby, nights and taps new ids. The old
 * family keeps its rows on the server under the old ids, so without this a family
 * started later ("Invite my partner" again) would collide with them and never upload.
 * Night ids stay deterministic for the new baby id; undone taps are dropped.
 */
export async function rekeyLocalData(db: SQLiteDatabase): Promise<void> {
  const babies = await db.getAllAsync<{ id: string }>('SELECT id FROM baby');
  const nights = await db.getAllAsync<{ id: string; babyId: string; nightKey: string }>(
    'SELECT id, babyId, nightKey FROM night',
  );
  const events = await db.getAllAsync<{ id: string; nightId: string }>('SELECT id, nightId FROM event WHERE deletedAt IS NULL');
  const babyIds = new Map(babies.map((b) => [b.id, randomUUID()]));
  const nightIds = new Map<string, string>();
  for (const n of nights) nightIds.set(n.id, await nightIdFor(babyIds.get(n.babyId) ?? n.babyId, n.nightKey));
  const now = Date.now();
  // Copy each row to its new id, move the children across, then delete the old row,
  // so the links between tables hold at every step.
  const copyRow = async (table: 'baby' | 'night', oldId: string, newId: string, extra: string, args: string[]) => {
    await db.execAsync('DROP TABLE IF EXISTS temp.rekey');
    await db.runAsync(`CREATE TEMP TABLE rekey AS SELECT * FROM ${table} WHERE id = ?`, oldId);
    await db.runAsync(`UPDATE temp.rekey SET id = ?, ${extra}, updatedAt = ?, dirty = 1`, newId, ...args, now);
    await db.execAsync(`INSERT INTO ${table} SELECT * FROM temp.rekey; DROP TABLE temp.rekey;`);
  };
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM event WHERE deletedAt IS NOT NULL');
    for (const b of babies) await copyRow('baby', b.id, babyIds.get(b.id)!, 'familyId = NULL', []);
    for (const n of nights) {
      await copyRow('night', n.id, nightIds.get(n.id)!, 'babyId = ?, onDuty = NULL', [babyIds.get(n.babyId) ?? n.babyId]);
    }
    for (const e of events) {
      await db.runAsync(
        'UPDATE event SET id = ?, nightId = ?, updatedAt = ?, dirty = 1 WHERE id = ?',
        randomUUID(),
        nightIds.get(e.nightId) ?? e.nightId,
        now,
        e.id,
      );
    }
    for (const n of nights) await db.runAsync('DELETE FROM night WHERE id = ?', n.id);
    for (const b of babies) await db.runAsync('DELETE FROM baby WHERE id = ?', b.id);
  });
}

// ---------- testing helpers (shown only in development builds) ----------

/** Removes every logged tap (soft delete, so it syncs). Keeps the baby (name, chart) and settings. */
export async function eraseAllNights(db: SQLiteDatabase): Promise<void> {
  const now = Date.now();
  await db.runAsync('UPDATE event SET deletedAt = ?, updatedAt = ?, dirty = 1 WHERE deletedAt IS NULL', now, now);
  wrote();
}

/** Replaces all nights with the given sample nights; the training round starts at the first one. */
export async function loadSampleNights(
  db: SQLiteDatabase,
  baby: Baby,
  nights: { nightKey: string; nightNumber: number; note: string | null; events: { type: EventType; at: number }[] }[],
): Promise<void> {
  await eraseAllNights(db);
  const ids = await Promise.all(nights.map((n) => nightIdFor(baby.id, n.nightKey)));
  const now = Date.now();
  await db.withTransactionAsync(async () => {
    for (const [i, n] of nights.entries()) {
      await upsertNightRow(db, {
        id: ids[i],
        babyId: baby.id,
        nightNumber: n.nightNumber,
        chartNight: n.nightNumber,
        nightKey: n.nightKey,
        startedAt: n.events[0].at,
        note: n.note,
      });
      for (const e of n.events) {
        await db.runAsync(
          'INSERT INTO event (id, nightId, type, at, createdBy, deletedAt, updatedAt, dirty) VALUES (?, ?, ?, ?, NULL, NULL, ?, 1)',
          randomUUID(),
          ids[i],
          e.type,
          e.at,
          now,
        );
      }
    }
  });
  await updateBaby(db, { ...baby, trainingStartDate: nights[0]?.nightKey ?? null });
}
