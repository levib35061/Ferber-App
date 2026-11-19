/**
 * Which check-in alerts should be scheduled right now. Pure and tested; the
 * notification code (src/data/notifications.ts) makes the OS schedule match it.
 *
 * - "checkin": when the wait runs out.
 * - "repeat": one gentle reminder REPEAT_AFTER_MS later, in case the first one
 *   was slept through. It stays scheduled while a check-in is due and is
 *   cancelled by any tap that ends the wait ("Going in", "Asleep", "Wait a
 *   little longer", Undo...), because the state stops being waiting/due.
 */
import type { NightState } from './session';

export const REPEAT_AFTER_MS = 3 * 60_000;

export type AlertKind = 'checkin' | 'repeat';

export interface PlannedAlert {
  kind: AlertKind;
  at: number;
  checkInNumber: number;
}

export function alertPlan(state: NightState): PlannedAlert[] {
  if (state.kind !== 'waiting' && state.kind !== 'due') return [];
  const n = state.checkInNumber;
  return [
    { kind: 'checkin', at: state.nextCheckInAt, checkInNumber: n },
    { kind: 'repeat', at: state.nextCheckInAt + REPEAT_AFTER_MS, checkInNumber: n },
  ];
}
