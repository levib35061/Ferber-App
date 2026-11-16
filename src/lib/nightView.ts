/**
 * Which screen the first tab shows: last night's summary ("Today") or the
 * night screen. One function, so the "Back to Today" link can never show
 * when Today isn't actually available.
 */
import { isNightTime, nightKey } from './time';

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
  const restful = stateKind === 'idle' || stateKind === 'asleep';
  // After "Up for the day" the night is over, so Today shows at any hour.
  const canShowToday = recent && (stateKind === 'up' || (!isNightTime(now) && restful));
  const view = canShowToday && (stateKind === 'up' || !bedtimeEarly) ? 'today' : 'night';
  return { view, canShowToday };
}
