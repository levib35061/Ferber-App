/**
 * Which screen the first tab shows: last night's summary ("Today") or the
 * night screen. One function, so the "Back to Today" link can never show
 * when Today isn't actually available.
 */
import { NIGHT_ENDS_HOUR, isNightTime, nightKey } from './time';

export interface ViewInput {
  now: number;
  /** Kind of tonight's state: idle, quiet, waiting, due, in_room, feeding, asleep, up */
  stateKind: string;
  /** "Starting bedtime early?" is on */
  bedtimeEarly: boolean;
  /** Night key of the most recent logged night, or null */
  lastNightKey: string | null;
}

export interface ViewChoice {
  view: 'today' | 'night';
  /** Today could be shown right now (so "Back to Today" would work) */
  canShowToday: boolean;
}

export function chooseView({ now, stateKind, bedtimeEarly, lastNightKey }: ViewInput): ViewChoice {
  const recent = lastNightKey != null && [nightKey(now), nightKey(now - 24 * 3600_000)].includes(lastNightKey);
  // The night is over when someone taps "Up for the day" (at any hour). A baby
  // still asleep at 8am is still last night: the night screen stays, with
  // "Up for the day" on it. If nobody taps it, the night ends on its own at
  // 11am (tonight's night starts then, so the state is idle again).
  const canShowToday = recent && (stateKind === 'up' || (stateKind === 'idle' && !isNightTime(now)));
  const view = canShowToday && (stateKind === 'up' || !bedtimeEarly) ? 'today' : 'night';
  return { view, canShowToday };
}

/**
 * Is a night key "last night" as seen at `now`? Before 11am, tonight's key is
 * still last night; after 11am, tonight's key is the night ahead (or under way).
 */
export function isPastNight(key: string, now: number): boolean {
  const current = nightKey(now);
  if (key < current) return true;
  return key === current && new Date(now).getHours() < NIGHT_ENDS_HOUR;
}
