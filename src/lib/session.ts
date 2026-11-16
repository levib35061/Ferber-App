/**
 * Derives the live Night-screen state from the stored event log.
 * Events are the source of truth; nothing here is stored. Because the
 * countdown is computed from stored timestamps, it stays correct after the
 * app is force-quit and reopened.
 */
import { Chart, nextWaitMinutes } from './ferber';

export type EventType = 'down' | 'check_in_start' | 'check_in_end' | 'asleep' | 'woke';

export interface NightEvent {
  id: string;
  nightId: string;
  type: EventType;
  /** UTC epoch ms */
  at: number;
  createdBy?: string | null;
  deletedAt?: number | null;
}

export interface Episode {
  /** The down or woke event that started it */
  start: NightEvent;
  /** asleep event, if the episode has ended */
  end: NightEvent | null;
  checkIns: number;
  events: NightEvent[];
}

export type NightState =
  | { kind: 'idle' }
  | {
      kind: 'waiting' | 'due';
      episodeStartAt: number;
      waitStartedAt: number;
      waitMinutes: number;
      nextCheckInAt: number;
      /** 1-based number of the check-in being waited for */
      checkInNumber: number;
    }
  | { kind: 'in_room'; since: number; checkInNumber: number; episodeStartAt: number }
  | { kind: 'asleep'; since: number; episode: Episode };

export type Action = 'down' | 'woke' | 'check_in_start' | 'check_in_end' | 'asleep';

const MINUTE = 60_000;

export function liveEvents(events: NightEvent[]): NightEvent[] {
  return events.filter((e) => !e.deletedAt).sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
}

/**
 * Splits a night's events into episodes. An episode runs from "down" or
 * "woke" until "asleep". Stray events before the first down/woke are ignored.
 */
export function episodes(events: NightEvent[]): Episode[] {
  const out: Episode[] = [];
  let cur: Episode | null = null;
  for (const e of liveEvents(events)) {
    if (e.type === 'down' || e.type === 'woke') {
      // A new start while one is open closes nothing (missed "asleep"); start fresh.
      cur = { start: e, end: null, checkIns: 0, events: [e] };
      out.push(cur);
      continue;
    }
    if (!cur || cur.end) continue;
    cur.events.push(e);
    if (e.type === 'check_in_start') cur.checkIns += 1;
    if (e.type === 'asleep') cur.end = e;
  }
  return out;
}

export function deriveNightState(
  events: NightEvent[],
  chart: Chart,
  chartNight: number,
  now: number,
): NightState {
  const eps = episodes(events);
  const ep = eps[eps.length - 1];
  if (!ep) return { kind: 'idle' };
  if (ep.end) return { kind: 'asleep', since: ep.end.at, episode: ep };

  const last = ep.events[ep.events.length - 1];
  if (last.type === 'check_in_start') {
    return { kind: 'in_room', since: last.at, checkInNumber: ep.checkIns, episodeStartAt: ep.start.at };
  }

  // last is down, woke, or check_in_end: a wait is running from that tap.
  const waitMinutes = nextWaitMinutes(chart, chartNight, ep.checkIns);
  const nextCheckInAt = last.at + waitMinutes * MINUTE;
  return {
    kind: now >= nextCheckInAt ? 'due' : 'waiting',
    episodeStartAt: ep.start.at,
    waitStartedAt: last.at,
    waitMinutes,
    nextCheckInAt,
    checkInNumber: ep.checkIns + 1,
  };
}

/** Which taps make sense in each state. The UI only shows these. */
export function allowedActions(state: NightState): Action[] {
  switch (state.kind) {
    case 'idle':
      return ['down', 'woke'];
    case 'waiting':
    case 'due':
      return ['check_in_start', 'asleep'];
    case 'in_room':
      return ['check_in_end', 'asleep'];
    case 'asleep':
      return ['woke'];
  }
}

/** Undo is offered for the most recent live event for this long after it was logged. */
export const UNDO_WINDOW_MS = 10_000;
