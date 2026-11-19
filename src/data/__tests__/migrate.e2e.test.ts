/**
 * @jest-environment node
 *
 * The SQLite upgrade must survive being interrupted: if iOS kills the app midway,
 * the next launch repeats steps whose columns already exist. Runs with the e2e config
 * (plain Node, real SQLite via node:sqlite): npx jest -c jest.e2e.config.js migrate
 */
import { DatabaseSync } from 'node:sqlite';

jest.mock('react-native', () => ({ AppState: { addEventListener: () => ({ remove() {} }) } }));
jest.mock('expo-crypto', () => {
  const c = jest.requireActual('crypto');
  return {
    randomUUID: () => c.randomUUID(),
    CryptoDigestAlgorithm: { SHA1: 'SHA-1' },
    digestStringAsync: async (_a: string, d: string) => c.createHash('sha1').update(d).digest('hex'),
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
    withTransactionAsync: async (fn: () => Promise<void>) => fn(),
  };
}

describe('local database (real SQLite)', () => {
  it('can be interrupted and run again without failing', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { migrate } = require('../db') as typeof import('../db');
    const db = sqlite() as never as Parameters<typeof migrate>[0];
    await migrate(db);
    // As if the app was killed after the columns were added but before the version was saved.
    await (db as unknown as { execAsync: (s: string) => Promise<void> }).execAsync('PRAGMA user_version = 1');
    await expect(migrate(db)).resolves.toBeUndefined();
    const cols = await (db as unknown as { getAllAsync: (s: string) => Promise<{ name: string }[]> }).getAllAsync(
      'PRAGMA table_info(night)',
    );
    expect(cols.map((c) => c.name)).toEqual(expect.arrayContaining(['updatedAt', 'dirty', 'onDuty', 'addedLater']));
  });

  it("undo removes a tap only while it's still the night's latest", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dbm = require('../db') as typeof import('../db');
    const db = sqlite() as never as Parameters<typeof dbm.migrate>[0];
    await dbm.migrate(db);
    const baby = await dbm.getOrCreateBaby(db);
    const n = await dbm.createNight(db, baby.id, Date.UTC(2026, 10, 18, 2), false);
    const mine = await dbm.insertEvent(db, n.id, 'down', Date.UTC(2026, 10, 18, 2));
    const partners = await dbm.insertEvent(db, n.id, 'cry', Date.UTC(2026, 10, 18, 2, 1), 'partner');
    expect(await dbm.softDeleteIfLatest(db, n.id, mine.id)).toBe(false); // the partner's tap came after
    expect(await dbm.softDeleteIfLatest(db, n.id, partners.id)).toBe(true);
    const live = (await dbm.listEvents(db, n.id)).filter((e) => !e.deletedAt).map((e) => e.type);
    expect(live).toEqual(['down']);
  });
});

