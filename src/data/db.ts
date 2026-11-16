/**
 * Local SQLite storage. Offline first: the app must work with no signal at 2am.
 * The schema mirrors the planned Supabase schema (Milestone 3). All ids are
 * UUIDs so offline records can sync without collisions. All times are UTC ms.
 */
import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { ChartPreset, Chart } from '../lib/ferber';
import { EventType, NightEvent } from '../lib/session';
import { nightKey } from '../lib/time';

export const DB_NAME = 'ferber.db';
const SCHEMA_VERSION = 1;

export interface Baby {
  id: string;
  name: string;
  birthDate: string | null;
  trainingStartDate: string | null;
  chartPreset: ChartPreset;
  customChart: Chart | null;
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
}

export async function migrate(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;
  if (version >= SCHEMA_VERSION) return;

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
    PRAGMA user_version = ${SCHEMA_VERSION};
  `);
}

// ---------- baby ----------

type BabyRow = Omit<Baby, 'customChart' | 'chartPreset'> & { customChart: string | null; chartPreset: string };

export async function getOrCreateBaby(db: SQLiteDatabase): Promise<Baby> {
  const row = await db.getFirstAsync<BabyRow>('SELECT * FROM baby LIMIT 1');
  if (row) {
    return {
      ...row,
      chartPreset: (row.chartPreset as ChartPreset) ?? 'ferber',
      customChart: row.customChart ? (JSON.parse(row.customChart) as Chart) : null,
    };
  }
  const baby: Baby = {
    id: randomUUID(),
    name: '',
    birthDate: null,
    trainingStartDate: null,
    chartPreset: 'ferber',
    customChart: null,
    familyId: null,
  };
  await db.runAsync('INSERT INTO baby (id, name, chartPreset) VALUES (?, ?, ?)', baby.id, baby.name, baby.chartPreset);
  return baby;
}

export async function updateBaby(db: SQLiteDatabase, baby: Baby): Promise<void> {
  await db.runAsync(
    'UPDATE baby SET name = ?, birthDate = ?, trainingStartDate = ?, chartPreset = ?, customChart = ? WHERE id = ?',
    baby.name,
    baby.birthDate,
    baby.trainingStartDate,
    baby.chartPreset,
    baby.customChart ? JSON.stringify(baby.customChart) : null,
    baby.id,
  );
}

// ---------- nights ----------

export async function getNightForKey(db: SQLiteDatabase, babyId: string, key: string): Promise<Night | null> {
  return db.getFirstAsync<Night>('SELECT * FROM night WHERE babyId = ? AND nightKey = ? LIMIT 1', babyId, key);
}

/** Most recent night before the given key that has at least one live event. */
export async function getPreviousNight(db: SQLiteDatabase, babyId: string, beforeKey: string): Promise<Night | null> {
  return db.getFirstAsync<Night>(
    `SELECT n.* FROM night n
     WHERE n.babyId = ? AND n.nightKey < ?
       AND EXISTS (SELECT 1 FROM event e WHERE e.nightId = n.id AND e.deletedAt IS NULL)
     ORDER BY n.nightKey DESC LIMIT 1`,
    babyId,
    beforeKey,
  );
}

/** What tonight's numbers would be, before a night row exists. */
export function plannedNumbers(prev: Night | null, repeatLastNight: boolean): { nightNumber: number; chartNight: number } {
  if (!prev) return { nightNumber: 1, chartNight: 1 };
  return {
    nightNumber: prev.nightNumber + 1,
    chartNight: repeatLastNight ? prev.chartNight : prev.chartNight + 1,
  };
}

export async function createNight(
  db: SQLiteDatabase,
  babyId: string,
  at: number,
  repeatLastNight: boolean,
): Promise<Night> {
  const key = nightKey(at);
  const prev = await getPreviousNight(db, babyId, key);
  const nums = plannedNumbers(prev, repeatLastNight);
  const night: Night = { id: randomUUID(), babyId, nightKey: key, startedAt: at, note: null, ...nums };
  await db.runAsync(
    'INSERT INTO night (id, babyId, nightNumber, chartNight, nightKey, startedAt, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
    night.id,
    night.babyId,
    night.nightNumber,
    night.chartNight,
    night.nightKey,
    night.startedAt,
    night.note,
  );
  return night;
}

export async function setNightChartNight(db: SQLiteDatabase, nightId: string, chartNight: number): Promise<void> {
  await db.runAsync('UPDATE night SET chartNight = ? WHERE id = ?', chartNight, nightId);
}

// ---------- events ----------

export async function listEvents(db: SQLiteDatabase, nightId: string): Promise<NightEvent[]> {
  return db.getAllAsync<NightEvent>('SELECT * FROM event WHERE nightId = ? ORDER BY at, id', nightId);
}

export async function insertEvent(db: SQLiteDatabase, nightId: string, type: EventType, at: number): Promise<NightEvent> {
  const e: NightEvent = { id: randomUUID(), nightId, type, at, createdBy: null, deletedAt: null };
  await db.runAsync(
    'INSERT INTO event (id, nightId, type, at, createdBy, deletedAt) VALUES (?, ?, ?, ?, ?, NULL)',
    e.id,
    e.nightId,
    e.type,
    e.at,
    e.createdBy ?? null,
  );
  return e;
}

/** Soft delete, so a delete can sync to the partner's phone later. */
export async function softDeleteEvent(db: SQLiteDatabase, eventId: string, at: number): Promise<void> {
  await db.runAsync('UPDATE event SET deletedAt = ? WHERE id = ?', at, eventId);
}

// ---------- settings (key/value) ----------

export interface Settings {
  sound: boolean;
  haptics: boolean;
  keepAwake: boolean;
}

export const DEFAULT_SETTINGS: Settings = { sound: true, haptics: true, keepAwake: true };

export async function getSettings(db: SQLiteDatabase): Promise<Settings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM setting');
  const out: Settings = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    if (r.key in out) (out as unknown as Record<string, unknown>)[r.key] = JSON.parse(r.value);
  }
  return out;
}

export async function setSetting<K extends keyof Settings>(db: SQLiteDatabase, key: K, value: Settings[K]): Promise<void> {
  await db.runAsync(
    'INSERT INTO setting (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    JSON.stringify(value),
  );
}

/** All nights, newest first, with their live events. Fine for v1 volumes (weeks of data). */
export async function listNightsWithEvents(db: SQLiteDatabase, babyId: string): Promise<{ night: Night; events: NightEvent[] }[]> {
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
  return nights
    .map((night) => ({ night, events: byNight.get(night.id) ?? [] }))
    .filter((n) => n.events.length > 0);
}
