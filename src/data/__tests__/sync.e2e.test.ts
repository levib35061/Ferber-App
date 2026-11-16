/**
 * @jest-environment node
 *
 * End-to-end sync test: two simulated phones (each with its own SQLite and
 * Supabase session) running the real db.ts + sync.ts against the real
 * Supabase project. Needs network, so it only runs with SYNC_E2E=1:
 *
 *   npm run test:sync
 */
import { DatabaseSync } from 'node:sqlite';

const RUN = process.env.SYNC_E2E === '1';
const d = RUN ? describe : describe.skip;

jest.mock('react-native', () => ({
  AppState: { addEventListener: () => ({ remove() {} }), currentState: 'background' },
}));
jest.mock('expo-crypto', () => {
  const nodeCrypto = jest.requireActual('crypto');
  return {
    randomUUID: () => nodeCrypto.randomUUID(),
    CryptoDigestAlgorithm: { SHA1: 'SHA-1' },
    digestStringAsync: async (_alg: string, data: string) => nodeCrypto.createHash('sha1').update(data).digest('hex'),
  };
});

function sqlite() {
  const db = new DatabaseSync(':memory:');
  const args = (p: unknown[]) => p as never[];
  return {
    execAsync: async (sql: string) => void db.exec(sql),
    runAsync: async (sql: string, ...p: unknown[]) => db.prepare(sql).run(...args(p)),
    getFirstAsync: async (sql: string, ...p: unknown[]) => (db.prepare(sql).get(...args(p)) as unknown) ?? null,
    getAllAsync: async (sql: string, ...p: unknown[]) => db.prepare(sql).all(...args(p)),
    withTransactionAsync: async (fn: () => Promise<void>) => {
      db.exec('BEGIN');
      try {
        await fn();
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };
}

type DbModule = typeof import('../db');
type SyncModule = typeof import('../sync');

/** One simulated phone: its own module instances, SQLite and Supabase session. */
function phone() {
  let dbm!: DbModule;
  let syncm!: SyncModule;
  jest.isolateModules(() => {
    // Push registration needs a real phone build; not part of this test.
    jest.doMock('../push', () => ({ registerPushToken: async () => false }));
    jest.doMock('../supabase', () => {
      const { createClient } = jest.requireActual('@supabase/supabase-js');
      const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = jest.requireActual('../../config');
      const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      return {
        supabase,
        ensureUserId: async () => {
          const { data } = await supabase.auth.getSession();
          if (data.session) return data.session.user.id;
          const { data: s, error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
          return s.user.id;
        },
      };
    });
    /* eslint-disable @typescript-eslint/no-require-imports -- fresh module instances per simulated phone */
    dbm = require('../db');
    syncm = require('../sync');
    /* eslint-enable @typescript-eslint/no-require-imports */
  });
  const db = sqlite() as never;
  const engine = new syncm.SyncEngine(db);
  let remoteChanges = 0;
  engine.setOnRemoteChange(() => remoteChanges++);
  return { dbm, db, engine, remote: () => remoteChanges };
}

const at = (h: number, m: number) => new Date(2026, 10, h < 11 ? 17 : 16, h, m).getTime();
const live = async (p: ReturnType<typeof phone>, nightId: string) =>
  (await p.dbm.listEvents(p.db, nightId))
    .filter((e) => !e.deletedAt)
    .map((e) => `${e.type}@${e.at}`)
    .sort();
const waitFor = async (cond: () => Promise<boolean>, ms = 8000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await cond()) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
};

d('partner sync (real Supabase)', () => {
  jest.setTimeout(60_000);
  const A = phone();
  const B = phone();
  let nightId = '';

  afterAll(() => {
    A.engine.stop();
    B.engine.stop();
  });

  it('A logs offline, then starts sharing and uploads', async () => {
    await A.dbm.migrate(A.db);
    await B.dbm.migrate(B.db);
    const baby = await A.dbm.getOrCreateBaby(A.db);
    await A.dbm.updateBaby(A.db, { ...baby, name: 'Sync Test' });
    const n = await A.dbm.createNight(A.db, baby.id, at(19, 30), false);
    nightId = n.id;
    await A.dbm.insertEvent(A.db, n.id, 'down', at(19, 30));
    await A.dbm.insertEvent(A.db, n.id, 'cry', at(19, 33));
    await A.engine.start();
    await A.engine.createFamily();
    expect(A.engine.getStatus().inviteCode).toMatch(/^[0-9A-F]{8}$/);
    expect((await A.dbm.listDirty(A.db)).events).toHaveLength(0);
  });

  it("B joins with the code and gets A's baby, night and taps", async () => {
    await B.dbm.getOrCreateBaby(B.db); // B had its own empty baby
    await B.engine.start();
    await B.engine.joinFamily(A.engine.getStatus().inviteCode!.toLowerCase());
    const bBaby = await B.dbm.getOrCreateBaby(B.db);
    expect(bBaby.name).toBe('Sync Test');
    expect(await live(B, nightId)).toEqual(await live(A, nightId));
    expect(A.engine.getStatus().memberCount + 0).toBeGreaterThanOrEqual(1);
  });

  it("A sees B's tap within seconds via realtime (no manual sync on A)", async () => {
    await B.dbm.insertEvent(B.db, nightId, 'check_in_start', at(19, 36));
    await B.engine.syncNow();
    const t0 = Date.now();
    const ok = await waitFor(async () => (await live(A, nightId)).length === 3);
    console.log(`realtime delivery to A: ${ok ? Date.now() - t0 + ' ms' : 'not received'}`);
    expect(ok).toBe(true);
  });

  it('offline taps on both phones merge once they sync', async () => {
    await A.dbm.insertEvent(A.db, nightId, 'check_in_end', at(19, 37));
    await B.dbm.setNightNote(B.db, nightId, 'from B');
    await A.engine.syncNow();
    await B.engine.syncNow();
    await A.engine.syncNow();
    expect(await live(A, nightId)).toEqual(await live(B, nightId));
    expect((await A.dbm.getNight(A.db, nightId))?.note).toBe('from B');
  });

  it('the newer edit wins on both phones; deletes propagate', async () => {
    const ev = (await A.dbm.listEvents(A.db, nightId)).find((e) => e.type === 'check_in_end')!;
    await B.dbm.updateEventTime(B.db, ev.id, at(19, 38));
    await new Promise((r) => setTimeout(r, 20));
    await A.dbm.updateEventTime(A.db, ev.id, at(19, 39)); // later edit
    await B.engine.syncNow();
    await A.engine.syncNow();
    await B.engine.syncNow();
    const aEv = (await A.dbm.listEvents(A.db, nightId)).find((e) => e.id === ev.id)!;
    const bEv = (await B.dbm.listEvents(B.db, nightId)).find((e) => e.id === ev.id)!;
    expect(aEv.at).toBe(at(19, 39));
    expect(bEv.at).toBe(at(19, 39));

    const cry = (await B.dbm.listEvents(B.db, nightId)).find((e) => e.type === 'cry')!;
    await B.dbm.softDeleteEvent(B.db, cry.id, Date.now());
    await B.engine.syncNow();
    await A.engine.syncNow();
    expect((await live(A, nightId)).some((s) => s.startsWith('cry@'))).toBe(false);
  });

  it('night feeds and who is on duty sync to the partner', async () => {
    await A.dbm.insertEvent(A.db, nightId, 'feed_start', at(23, 0));
    await A.dbm.insertEvent(A.db, nightId, 'feed_end', at(23, 15));
    const bId = B.engine.userId!;
    expect(bId).toBeTruthy();
    await A.dbm.setNightDuty(A.db, nightId, bId);
    await A.engine.syncNow();
    await B.engine.syncNow();
    const types = (await live(B, nightId)).map((x) => x.split('@')[0]);
    expect(types).toEqual(expect.arrayContaining(['feed_start', 'feed_end']));
    // "Up for the day" (needs migration 003)
    await B.dbm.insertEvent(B.db, nightId, 'up', at(6, 40));
    await B.engine.syncNow();
    await A.engine.syncNow();
    expect((await live(A, nightId)).some((x) => x.startsWith('up@'))).toBe(true);
    expect((await B.dbm.getNight(B.db, nightId))?.onDuty).toBe(bId);
    expect(A.engine.getStatus().memberIds).toHaveLength(2);
  });

  it('both phones starting the same new night offline end up with one night', async () => {
    const baby = await A.dbm.getOrCreateBaby(A.db);
    const t = new Date(2026, 10, 17, 19, 30).getTime();
    const nA = await A.dbm.createNight(A.db, baby.id, t, false);
    const nB = await B.dbm.createNight(B.db, baby.id, t + 60_000, false);
    expect(nA.id).toBe(nB.id);
    await A.dbm.insertEvent(A.db, nA.id, 'down', t);
    await B.dbm.insertEvent(B.db, nB.id, 'cry', t + 60_000);
    await A.engine.syncNow();
    await B.engine.syncNow();
    await A.engine.syncNow();
    expect(await live(A, nA.id)).toHaveLength(2);
    expect(await live(B, nA.id)).toHaveLength(2);
    console.log(`family invite code used in this test: ${A.engine.getStatus().inviteCode}`);
  });

  it('deleting an account: the partner keeps the shared nights; the last one out deletes the family', async () => {
    await B.engine.deleteAccount();
    expect(B.engine.getStatus().familyId).toBeNull();
    await A.engine.syncNow();
    expect(A.engine.getStatus().memberCount).toBe(1);
    expect((await live(A, nightId)).length).toBeGreaterThan(0);
    await A.engine.deleteAccount();
    expect(A.engine.getStatus().familyId).toBeNull();
  });
});
