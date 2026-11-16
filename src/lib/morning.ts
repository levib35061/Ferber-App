/**
 * The morning summary ("Today" screen): a one-sentence headline, a timeline
 * of the night (crying / settling / feeding / asleep), the key moments, and a
 * comparison with the night before. Pure and tested.
 */
import { NightEvent, episodeCryingMs, episodes, liveEvents } from './session';
import { summarizeNight } from './summary';

const MIN = 60_000;

export type SegmentKind = 'crying' | 'settling' | 'feeding' | 'asleep';
export interface Segment {
  kind: SegmentKind;
  from: number;
  to: number;
}

export interface Moment {
  at: number;
  text: string;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "Ava fell asleep after 32 minutes of crying, and woke once." */
export function morningHeadline(name: string, events: NightEvent[]): string {
  const who = name.trim() || 'Your baby';
  const eps = episodes(events);
  if (!eps.length) return 'No night logged yet.';
  const bed = eps.find((e) => e.start.type === 'down');
  const wakings = summarizeNight(events).wakings;
  const wakePart =
    wakings === 0
      ? 'and slept through'
      : wakings === 1
        ? 'and woke once'
        : wakings === 2
          ? 'and woke twice'
          : `and woke ${wakings} times`;
  if (!bed || !bed.end) return `${who} woke ${wakings === 1 ? 'once' : plural(wakings, 'time')} in the night.`;
  const cry = Math.round(episodeCryingMs(bed) / MIN);
  const first = cry === 0 ? `${who} fell asleep without crying` : `${who} fell asleep after ${plural(cry, 'minute')} of crying`;
  return `${first}, ${wakePart}.`;
}

/**
 * Night timeline from the first event to `end`. Gaps between an "asleep" and
 * the next episode are asleep; the time after the last "asleep" runs to `end`.
 */
export function timeline(events: NightEvent[], end: number): Segment[] {
  const evs = liveEvents(events);
  const out: Segment[] = [];
  if (!evs.length) return out;
  let kind: SegmentKind | null = null;
  let since = evs[0].at;
  const push = (k: SegmentKind | null, from: number, to: number) => {
    if (!k || to <= from) return;
    const last = out[out.length - 1];
    if (last && last.kind === k && last.to === from) last.to = to;
    else out.push({ kind: k, from, to });
  };
  const next = (e: NightEvent): SegmentKind | null => {
    switch (e.type) {
      case 'down':
      case 'quiet':
      case 'feed_end':
        return 'settling';
      case 'woke':
      case 'cry':
      case 'check_in_start':
      case 'check_in_end':
        return 'crying';
      case 'feed_start':
        return 'feeding';
      case 'asleep':
        return 'asleep';
      case 'up':
        return null;
    }
  };
  for (const e of evs) {
    const k = next(e);
    if (e.type === 'up') {
      // Up for the day: the timeline stops here.
      push(kind, since, e.at);
      return out;
    }
    // "Stopped crying" only matters while crying; "cry" only while settling.
    if (e.type === 'quiet' && kind !== 'crying') continue;
    if (e.type === 'cry' && kind !== 'settling' && kind !== null) continue;
    if ((e.type === 'check_in_start' || e.type === 'check_in_end') && kind === 'crying') continue;
    push(kind, since, e.at);
    kind = k;
    since = e.at;
  }
  push(kind, since, Math.max(end, since));
  return out;
}

/** The handful of moments worth reading over coffee. */
export function moments(events: NightEvent[], fmt: (at: number) => string): Moment[] {
  const out: Moment[] = [];
  for (const ep of episodes(events)) {
    const evs = ep.events;
    // A waking that ended with "Up for the day" gets its own final line instead.
    const tail = !ep.end ? ', not logged as asleep' : ep.end.type === 'asleep' ? `, asleep by ${fmt(ep.end.at)}` : '';
    if (ep.start.type === 'down') {
      out.push({ at: ep.start.at, text: 'Down for the night' });
      const cry = evs.find((e) => e.type === 'cry');
      if (cry) out.push({ at: cry.at, text: 'Started crying' });
      for (let i = 0; i < evs.length; i++) {
        const e = evs[i];
        if (e.type === 'check_in_start') {
          const endEv = evs.slice(i + 1).find((x) => x.type === 'check_in_end' || x.type === 'asleep');
          const mins = endEv ? Math.max(1, Math.round((endEv.at - e.at) / MIN)) : null;
          out.push({ at: e.at, text: mins ? `Check-in, ${mins} min` : 'Check-in' });
        }
        if (e.type === 'feed_start') {
          const endEv = evs.slice(i + 1).find((x) => x.type === 'feed_end' || x.type === 'asleep');
          const mins = endEv ? Math.max(1, Math.round((endEv.at - e.at) / MIN)) : null;
          out.push({ at: e.at, text: mins ? `Night feed, ${mins} min` : 'Night feed' });
        }
      }
      if (ep.end?.type === 'asleep') out.push({ at: ep.end.at, text: 'Asleep' });
    } else {
      const fed = ep.start.type === 'feed_start' || evs.some((e) => e.type === 'feed_start');
      const extras = [fed ? 'fed' : null, ep.checkIns ? plural(ep.checkIns, 'check-in') : null].filter(Boolean).join(', ');
      out.push({ at: ep.start.at, text: `Woke up${extras ? ` (${extras})` : ''}${tail}` });
    }
  }
  const up = upAt(events);
  if (up != null && !out.some((m) => m.at === up)) out.push({ at: up, text: 'Up for the day' });
  return out;
}

/** When the baby got up for the day, if it was logged. */
export function upAt(events: NightEvent[]): number | null {
  return liveEvents(events).find((e) => e.type === 'up')?.at ?? null;
}

/** Total time asleep from bedtime to "Up for the day" (null if up wasn't logged). */
export function totalSleepMs(events: NightEvent[]): number | null {
  const up = upAt(events);
  if (up == null) return null;
  return timeline(events, up)
    .filter((s) => s.kind === 'asleep')
    .reduce((sum, s) => sum + (s.to - s.from), 0);
}

/** 37_500_000 → "10 h 25 min" */
export function formatHours(ms: number): string {
  const total = Math.round(ms / MIN);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h} h ${m} min` : `${m} min`;
}

/** "9 less than night 2", "4 more than night 2", "Same as night 2", or null for the first night. */
export function compareCrying(minutes: number, previous: { nightNumber: number; cryingMinutes: number } | null): string | null {
  if (!previous) return null;
  const d = previous.cryingMinutes - minutes;
  if (d === 0) return `Same as night ${previous.nightNumber}`;
  return d > 0 ? `${d} less than night ${previous.nightNumber}` : `${-d} more than night ${previous.nightNumber}`;
}
