/**
 * "Add a missed night" (History): turns a short summary of a night that wasn't
 * logged live (bedtime, crying, check-ins, wakings, up time) into the usual
 * events, so summaries, the recap and the charts treat it like any other night.
 * Pure and tested.
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

export interface MissedNightInput {
  nightKey: string;
  /** Times after this are rejected (the night may still be going on) */
  now: number;
  bedtime: MissedStretch;
  wakings: MissedStretch[];
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

  // Each waking: woke (crying from then), check-ins, asleep again.
  const wakings = [...input.wakings].sort((x, y) => at(x.at) - at(y.at));
  for (const w of wakings) {
    if (w.cryingMin < 0 || w.cryingMin > MAX_CRYING_MIN) return { error: 'Crying at a waking should be 0 to 240 minutes.' };
    // A waking in the same minute the baby fell asleep is fine: place it just after.
    if (at(w.at) < asleep - MIN + SEC) return { error: 'Each waking should be after the baby was asleep again.' };
    const woke = Math.max(at(w.at), asleep + SEC);
    events.push({ type: 'woke', at: woke });
    if (w.cryingMin === 0) {
      // Settled straight away: no crying time.
      events.push({ type: 'quiet', at: woke + SEC });
      asleep = woke + MIN;
    } else {
      events.push(...checkInEvents(woke, w.cryingMin, w.checkIns));
      asleep = woke + w.cryingMin * MIN;
    }
    events.push({ type: 'asleep', at: asleep });
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
