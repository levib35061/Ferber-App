/**
 * Derives the live Night-screen state from the stored event log.
 * Events are the source of truth; nothing here is stored. Because the
 * countdown is computed from stored timestamps, it stays correct after the
 * app is force-quit and reopened.
 *
 * Crying vs quiet: after "Down" the baby may settle quietly, so no wait runs
 * until "Crying" is tapped. "Stopped crying" pauses the wait; the next
 * "Crying" restarts the same check-in's wait from the beginning. "Woke up"
 * starts the wait straight away (you tap it because they're crying).
 */
import { Chart, nextWaitMinutes } from './ferber';

export type EventType = 'down' | 'cry' | 'quiet' | 'check_in_start' | 'check_in_end' | 'asleep' | 'woke';

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
      /** Down (or paused), not crying: no wait is running */
      kind: 'quiet';
      since: number;
      /** 1-based number of the check-in that would come next */
      checkInNumber: number;
      episodeStartAt: number;
      cryingMs: number;
    }
  | {
      kind: 'waiting' | 'due';
      episodeStartAt: number;
      waitStartedAt: number;
      waitMinutes: number;
      nextCheckInAt: number;
      /** 1-based number of the check-in being waited for */
      checkInNumber: number;
      cryingMs: number;
    }
  | { kind: 'in_room'; since: number; checkInNumber: number; episodeStartAt: number; cryingMs: number }
  | { kind: 'asleep'; since: number; episode: Episode };

export type Action = EventType;

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
      // A new start while one is open (missed "asleep"): start fresh.
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

type Phase = 'quiet' | 'crying' | 'in_room' | 'asleep';

interface Walk {
  phase: Phase;
  /** When the current phase began */
  phaseSince: number;
  /** For 'crying': when the current wait started (crying began, or Back out) */
  waitStartedAt: number;
  checkIns: number;
  /** Crying + in-the-room time, up to the end of the episode (or `now`) */
  cryingMs: number;
}

/**
 * Replays an episode's events. Crying time counts while crying or in the
 * room; quiet stretches don't count. A check-in tapped while "quiet" (e.g. a
 * tap added afterwards) is treated as crying since the quiet stretch began.
 */
function walk(ep: Episode, now: number): Walk {
  let phase: Phase = ep.start.type === 'woke' ? 'crying' : 'quiet';
  let phaseSince = ep.start.at;
  let waitStartedAt = ep.start.at;
  let checkIns = 0;
  let cryingMs = 0;
  const close = (at: number) => {
    if (phase === 'crying' || phase === 'in_room') cryingMs += Math.max(0, at - phaseSince);
  };
  for (const e of ep.events.slice(1)) {
    switch (e.type) {
      case 'cry':
        if (phase === 'quiet') {
          phase = 'crying';
          phaseSince = e.at;
          waitStartedAt = e.at;
        }
        break;
      case 'quiet':
        if (phase === 'crying') {
          close(e.at);
          phase = 'quiet';
          phaseSince = e.at;
        }
        break;
      case 'check_in_start':
        if (phase === 'quiet') phase = 'crying'; // crying since the quiet stretch began
        close(e.at);
        checkIns += 1;
        phase = 'in_room';
        phaseSince = e.at;
        break;
      case 'check_in_end':
        if (phase === 'in_room') {
          close(e.at);
          phase = 'crying';
          phaseSince = e.at;
          waitStartedAt = e.at;
        }
        break;
      case 'asleep':
        close(e.at);
        phase = 'asleep';
        phaseSince = e.at;
        break;
    }
  }
  if (phase !== 'asleep') close(now);
  return { phase, phaseSince, waitStartedAt, checkIns, cryingMs };
}

/** Crying time for an episode (open episodes count up to `now`, or not at all without it). */
export function episodeCryingMs(ep: Episode, now?: number): number {
  return walk(ep, now ?? ep.end?.at ?? ep.start.at).cryingMs;
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

  const w = walk(ep, now);
  const base = { episodeStartAt: ep.start.at, cryingMs: w.cryingMs };
  if (w.phase === 'quiet') return { kind: 'quiet', since: w.phaseSince, checkInNumber: w.checkIns + 1, ...base };
  if (w.phase === 'in_room') return { kind: 'in_room', since: w.phaseSince, checkInNumber: w.checkIns, ...base };

  // Crying: a wait is running from the crying start or the last Back out.
  const waitMinutes = nextWaitMinutes(chart, chartNight, w.checkIns);
  const nextCheckInAt = w.waitStartedAt + waitMinutes * MINUTE;
  return {
    kind: now >= nextCheckInAt ? 'due' : 'waiting',
    waitStartedAt: w.waitStartedAt,
    waitMinutes,
    nextCheckInAt,
    checkInNumber: w.checkIns + 1,
    ...base,
  };
}

/** Which taps make sense in each state. The UI only shows these. */
export function allowedActions(state: NightState): Action[] {
  switch (state.kind) {
    case 'idle':
      return ['down', 'woke'];
    case 'quiet':
      return ['cry', 'asleep'];
    case 'waiting':
    case 'due':
      return ['check_in_start', 'quiet', 'asleep'];
    case 'in_room':
      return ['check_in_end', 'asleep'];
    case 'asleep':
      return ['woke'];
  }
}

/** Undo is offered for the most recent live event for this long after it was logged. */
export const UNDO_WINDOW_MS = 10_000;
