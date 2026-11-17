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
 *
 * Night feeds: "Feeding" stops the timer and feeding time isn't crying.
 * "Done feeding" goes back to quiet (no timer until crying), and the waits
 * start again from the first interval, like a new waking. A feed started
 * while asleep begins a new episode (counted as a waking).
 *
 * "Wait a little longer" (`wait_more`): when a check-in is due, the parent can
 * skip it. The next, longer wait starts from that tap. It isn't a check-in.
 *
 * "Up for the day" (`up`) ends the night: it closes any open episode (crying
 * stops counting) and the state becomes `up` until the next night.
 */
import { Chart, nextWaitMinutes } from './ferber';

export type EventType =
  | 'down'
  | 'cry'
  | 'quiet'
  | 'check_in_start'
  | 'check_in_end'
  | 'wait_more'
  | 'feed_start'
  | 'feed_end'
  | 'asleep'
  | 'woke'
  | 'up';

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
  /** The down, woke or feed_start event that started it */
  start: NightEvent;
  /** asleep (or up-for-the-day) event, if the episode has ended */
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
      /** True for a night waking (the episode didn't start with "Down") */
      waking: boolean;
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
      waking: boolean;
      cryingMs: number;
    }
  | { kind: 'in_room'; since: number; checkInNumber: number; episodeStartAt: number; waking: boolean; cryingMs: number }
  | { kind: 'feeding'; since: number; episodeStartAt: number; waking: boolean; cryingMs: number }
  | { kind: 'asleep'; since: number; episode: Episode }
  /** Up for the day: tonight's tracking is over */
  | { kind: 'up'; since: number };

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
    const startsEpisode = e.type === 'down' || e.type === 'woke' || (e.type === 'feed_start' && (!cur || cur.end));
    if (startsEpisode) {
      // A new start while one is open (missed "asleep"): start fresh.
      cur = { start: e, end: null, checkIns: 0, events: [e] };
      out.push(cur);
      continue;
    }
    if (!cur || cur.end) continue;
    cur.events.push(e);
    if (e.type === 'check_in_start') cur.checkIns += 1;
    if (e.type === 'asleep' || e.type === 'up') cur.end = e;
  }
  return out;
}

type Phase = 'quiet' | 'crying' | 'in_room' | 'feeding' | 'asleep';

interface Walk {
  phase: Phase;
  /** When the current phase began */
  phaseSince: number;
  /** For 'crying': when the current wait started (crying began, or Back out) */
  waitStartedAt: number;
  checkIns: number;
  /** Waits finished (by a check-in or "wait longer") since the episode started or the last feed: picks the next wait */
  waitIndex: number;
  /** How many of those waits ended with "wait longer" instead of a check-in */
  skips: number;
  /** Crying + in-the-room time, up to the end of the episode (or `now`) */
  cryingMs: number;
}

/**
 * Replays an episode's events. Crying time counts while crying or in the
 * room; quiet stretches don't count. A check-in tapped while "quiet" (e.g. a
 * tap added afterwards) is treated as crying since the quiet stretch began.
 */
function walk(ep: Episode, now: number): Walk {
  let phase: Phase = ep.start.type === 'woke' ? 'crying' : ep.start.type === 'feed_start' ? 'feeding' : 'quiet';
  let phaseSince = ep.start.at;
  let waitStartedAt = ep.start.at;
  let checkIns = 0;
  let waitIndex = 0;
  let skips = 0;
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
        waitIndex += 1;
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
      case 'wait_more':
        // Skip this check-in: still crying, the next (longer) wait starts now.
        if (phase === 'crying') {
          waitIndex += 1;
          skips += 1;
          waitStartedAt = e.at;
        }
        break;
      case 'feed_start':
        if (phase !== 'feeding') {
          close(e.at);
          phase = 'feeding';
          phaseSince = e.at;
        }
        break;
      case 'feed_end':
        if (phase === 'feeding') {
          phase = 'quiet';
          phaseSince = e.at;
          waitIndex = 0;
          skips = 0;
        }
        break;
      case 'asleep':
      case 'up':
        close(e.at);
        phase = 'asleep';
        phaseSince = e.at;
        break;
    }
  }
  if (phase !== 'asleep') close(now);
  return { phase, phaseSince, waitStartedAt, checkIns, waitIndex, skips, cryingMs };
}

/** Crying time for an episode (open episodes count up to `now`, or not at all without it). */
export function episodeCryingMs(ep: Episode, now?: number): number {
  return walk(ep, now ?? ep.end?.at ?? ep.start.at).cryingMs;
}

export function deriveNightState(events: NightEvent[], chart: Chart, chartNight: number, now: number): NightState {
  const eps = episodes(events);
  const ep = eps[eps.length - 1];
  if (!ep) {
    const up = liveEvents(events).find((e) => e.type === 'up');
    return up ? { kind: 'up', since: up.at } : { kind: 'idle' };
  }
  const up = liveEvents(events)
    .filter((e) => e.type === 'up')
    .pop();
  if (up && up.at >= ep.start.at) return { kind: 'up', since: up.at };
  if (ep.end) return { kind: 'asleep', since: ep.end.at, episode: ep };

  const w = walk(ep, now);
  const base = { episodeStartAt: ep.start.at, waking: ep.start.type !== 'down', cryingMs: w.cryingMs };
  // The number shown counts real check-ins; skipped ones only lengthen the wait.
  const done = w.waitIndex - w.skips;
  if (w.phase === 'quiet') return { kind: 'quiet', since: w.phaseSince, checkInNumber: done + 1, ...base };
  if (w.phase === 'in_room') return { kind: 'in_room', since: w.phaseSince, checkInNumber: done, ...base };
  if (w.phase === 'feeding') return { kind: 'feeding', since: w.phaseSince, ...base };

  // Crying: a wait is running from the crying start or the last Back out.
  const waitMinutes = nextWaitMinutes(chart, chartNight, w.waitIndex);
  const nextCheckInAt = w.waitStartedAt + waitMinutes * MINUTE;
  return {
    kind: now >= nextCheckInAt ? 'due' : 'waiting',
    waitStartedAt: w.waitStartedAt,
    waitMinutes,
    nextCheckInAt,
    checkInNumber: done + 1,
    ...base,
  };
}

/** Which taps make sense in each state. The UI only shows these. */
export function allowedActions(state: NightState): Action[] {
  switch (state.kind) {
    case 'idle':
      return ['down', 'woke'];
    case 'quiet':
      return ['cry', 'asleep', 'feed_start', 'up'];
    case 'waiting':
      return ['check_in_start', 'quiet', 'asleep', 'feed_start', 'up'];
    case 'due':
      return ['check_in_start', 'wait_more', 'quiet', 'asleep', 'feed_start', 'up'];
    case 'in_room':
      return ['check_in_end', 'asleep', 'up'];
    case 'feeding':
      return ['feed_end', 'asleep', 'up'];
    case 'asleep':
      return ['woke', 'feed_start', 'up'];
    case 'up':
      return [];
  }
}

/** Undo is offered for the most recent live event for this long after it was logged. */
export const UNDO_WINDOW_MS = 10_000;
