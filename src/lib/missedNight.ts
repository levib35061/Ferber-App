/**
 * "Add a missed night" (History): turns a short summary of a night that wasn't
 * logged live (bedtime, crying, check-ins, number of wakings, up time) into the
 * usual events, so summaries, the recap and the charts treat it like any other
 * night. The wakings' times aren't known, so they're spread evenly through the
 * night; the night is marked "added later" and screens show it as a summary,
 * never with those made-up times. Pure and tested.
 *
 * Only nights after the latest logged night can be added (up to last night),
 * so the night numbers of later nights never need to change.
 */
import type { EventType } from './session';
import { atTimeInNight, nightKey } from './time';
import { isPastNight } from './nightView';

export interface ClockTime {
  h: number;
  m: number;
}

export interface MissedStretch {
  at: ClockTime;
  cryingMin: number;
  checkIns: number;
}

/** All night wakings together: how many, total minutes crying, total check-ins. */
export interface MissedWakings {
  count: number;
  cryingMin: number;
  checkIns: number;
}

export const MAX_WAKINGS = 10;

/** Split a total into `n` near-equal whole parts (larger ones first). */
function split(total: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => Math.floor(total / n) + (i < total % n ? 1 : 0));
}

/** Most check-ins that fit across the wakings, given their total crying. */
export function maxWakingCheckIns(w: Pick<MissedWakings, 'count' | 'cryingMin'>): number {
  if (w.count <= 0) return 0;
  return split(w.cryingMin, w.count).reduce((sum, c) => sum + maxCheckIns(c), 0);
}

export interface MissedNightInput {
  nightKey: string;
  /** Times after this are rejected (the night may still be going on) */
  now: number;
  bedtime: MissedStretch;
  wakings: MissedWakings;
  /** Up for the day (optional) */
  up: ClockTime | null;
}

export interface PlannedEvent {
  type: EventType;
  at: number;
}

const SEC = 1000;
const MIN = 60 * SEC;
export const MAX_CRYING_MIN = 240;

/** Most check-ins that fit: each takes about a minute, with crying before it. */
export function maxCheckIns(cryingMin: number): number {
  return Math.max(0, Math.floor(cryingMin / 2));
}

/** Check-ins spread evenly through a crying stretch, about a minute each. */
function checkInEvents(start: number, cryingMin: number, count: number): PlannedEvent[] {
  const out: PlannedEvent[] = [];
  const n = Math.min(count, maxCheckIns(cryingMin));
  for (let i = 1; i <= n; i++) {
    const mid = start + (cryingMin * MIN * i) / (n + 1);
    out.push({ type: 'check_in_start', at: Math.round(mid - 30 * SEC) });
    out.push({ type: 'check_in_end', at: Math.round(mid + 30 * SEC) });
  }
  return out;
}

export type MissedNightResult = { events: PlannedEvent[] } | { error: string };

export function missedNightEvents(input: MissedNightInput): MissedNightResult {
  const at = (t: ClockTime) => atTimeInNight(input.nightKey, t.h, t.m);
  const events: PlannedEvent[] = [];

  // Bedtime: down, then crying (if any) with its check-ins, then asleep.
  const b = input.bedtime;
  if (b.cryingMin < 0 || b.cryingMin > MAX_CRYING_MIN) return { error: 'Bedtime crying should be 0 to 240 minutes.' };
  const down = at(b.at);
  if (nightKey(down) !== input.nightKey) return { error: 'Bedtime should be in the evening of that night.' };
  events.push({ type: 'down', at: down });
  if (b.cryingMin > 0) {
    events.push({ type: 'cry', at: down + SEC });
    events.push(...checkInEvents(down + SEC, b.cryingMin, b.checkIns));
  }
  let asleep = down + SEC + Math.max(1, b.cryingMin) * MIN;
  events.push({ type: 'asleep', at: asleep });

  // Wakings: times unknown, so spread evenly between falling asleep and the morning.
  const w = input.wakings;
  if (w.count < 0 || w.count > MAX_WAKINGS) return { error: `Night wakings should be 0 to ${MAX_WAKINGS}.` };
  if (w.cryingMin < 0 || w.cryingMin > MAX_CRYING_MIN)
    return { error: 'Crying at night wakings should be 0 to 240 minutes.' };
  if (w.count > 0) {
    const end = input.up ? at(input.up) : atTimeInNight(input.nightKey, 6, 30);
    const crying = split(w.cryingMin, w.count);
    // Check-ins go to the wakings with room for them, in turn.
    const checks = crying.map(() => 0);
    let left = Math.min(w.checkIns, maxWakingCheckIns(w));
    while (left > 0) {
      for (let i = 0; i < w.count && left > 0; i++) {
        if (checks[i] < maxCheckIns(crying[i])) {
          checks[i] += 1;
          left -= 1;
        }
      }
    }
    const slot = (end - asleep) / (w.count + 1);
    if (crying.some((c) => (Math.max(1, c) + 1) * MIN >= slot)) {
      return { error: "That much crying at night wakings doesn't fit between bedtime and the morning." };
    }
    crying.forEach((c, i) => {
      const woke = Math.round(asleep + slot * (i + 1));
      events.push({ type: 'woke', at: woke });
      if (c === 0) {
        events.push({ type: 'quiet', at: woke + SEC });
        events.push({ type: 'asleep', at: woke + MIN });
      } else {
        events.push(...checkInEvents(woke, c, checks[i]));
        events.push({ type: 'asleep', at: woke + c * MIN });
      }
    });
    asleep = events[events.length - 1].at;
  }

  if (input.up) {
    const up = at(input.up);
    if (up <= asleep) return { error: 'Up for the day should be after the last time the baby fell asleep.' };
    events.push({ type: 'up', at: up });
  }
  if (events.some((e) => e.at > input.now)) {
    return {
      error: "Some of those times haven't happened yet. If tonight is still going on, log it from the Night tab instead.",
    };
  }
  return { events };
}

/**
 * Nights that can be added: the last 7 evenings that are already over, newer
 * than the latest logged night. Newest first.
 */
export function addableNightKeys(latestLoggedKey: string | null, now: number): string[] {
  const out: string[] = [];
  for (let d = 0; d < 8; d++) {
    const key = nightKey(now - d * 24 * 3600_000);
    if (out.includes(key) || !isPastNight(key, now)) continue;
    if (latestLoggedKey && key <= latestLoggedKey) continue;
    out.push(key);
    if (out.length === 7) break;
  }
  return out;
}
