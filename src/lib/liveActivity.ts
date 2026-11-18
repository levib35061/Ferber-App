/**
 * What the lock-screen Live Activity shows for a night state (pure, tested).
 * The layout is src/widgets/NightActivity.tsx; src/data/liveActivity.ts starts,
 * updates and ends it.
 */
import type { Action, NightState } from './session';

export interface NightActivityProps {
  mode: 'waiting' | 'due' | 'in_room' | 'quiet' | 'feeding';
  /** The check-in being waited for (or under way) */
  checkIn: number;
  /** Start of the timer: the wait's start, or when this state began (epoch ms) */
  since: number;
  /** When the check-in is due (waiting/due only, else 0) */
  dueAt: number;
}

export interface ActivityPlan {
  props: NightActivityProps;
  /** The system marks the activity stale at this time (a wait running out) */
  staleAt: number | null;
}

/** null means: no Live Activity (no night in progress). */
export function activityFor(state: NightState): ActivityPlan | null {
  switch (state.kind) {
    case 'waiting':
    case 'due':
      return {
        props: { mode: state.kind, checkIn: state.checkInNumber, since: state.waitStartedAt, dueAt: state.nextCheckInAt },
        staleAt: state.kind === 'waiting' ? state.nextCheckInAt : null,
      };
    case 'in_room':
      return { props: { mode: 'in_room', checkIn: state.checkInNumber, since: state.since, dueAt: 0 }, staleAt: null };
    case 'quiet':
      return { props: { mode: 'quiet', checkIn: state.checkInNumber, since: state.since, dueAt: 0 }, staleAt: null };
    case 'feeding':
      return { props: { mode: 'feeding', checkIn: 0, since: state.since, dueAt: 0 }, staleAt: null };
    default:
      return null;
  }
}

/** Same props: nothing to update. */
export function sameActivity(a: NightActivityProps | null, b: NightActivityProps | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const ACTIONS: Action[] = ['check_in_start', 'check_in_end', 'wait_more', 'asleep', 'cry', 'feed_end'];

/** A lock-screen button's target, if it's an event the app logs. */
export function actionForTarget(target: string | undefined): Action | null {
  return ACTIONS.includes(target as Action) ? (target as Action) : null;
}
