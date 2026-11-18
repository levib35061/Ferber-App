/**
 * The morning summary ("Today" screen): a one-sentence headline, a timeline
 * of the night (crying / settling / feeding / asleep), the key moments, and a
 * comparison with the night before. Pure and tested.
 */
import { NightEvent, episodeCryingMs, episodes, liveEvents } from './session';
import { NightSummary, summarizeNight } from './summary';
import { formatMinutes, formatMinutesShort, spokenMinutes } from './time';

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
  const first = cry === 0 ? `${who} fell asleep without crying` : `${who} fell asleep after ${spokenMinutes(cry)} of crying`;
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
      case 'wait_more':
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
    if (e.type === 'wait_more') continue; // still crying, nothing changes on the timeline
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
          out.push({ at: e.at, text: mins ? `Check-in, ${formatMinutes(mins)}` : 'Check-in' });
        }
        if (e.type === 'feed_start') {
          const endEv = evs.slice(i + 1).find((x) => x.type === 'feed_end' || x.type === 'asleep');
          const mins = endEv ? Math.max(1, Math.round((endEv.at - e.at) / MIN)) : null;
          out.push({ at: e.at, text: mins ? `Night feed, ${formatMinutes(mins)}` : 'Night feed' });
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

/** When the night "ends" on the timeline: "Up for the day" if logged, else 6:30am (or the last event if later). */
export function timelineEnd(nightKey: string, events: NightEvent[]): number {
  const up = upAt(events);
  if (up != null) return up;
  const [y, m, d] = nightKey.split('-').map(Number);
  const morning = new Date(y, m - 1, d + 1, 6, 30).getTime();
  const lastAt = Math.max(...events.map((e) => e.at));
  return Math.max(morning, lastAt);
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
  return formatMinutes(ms / MIN);
}

/**
 * One kind, honest line under the numbers, or null. `crying` is minutes per
 * finished night, oldest first, ending with last night.
 */
export function morningNote(crying: number[]): string | null {
  const n = crying.length;
  if (!n) return null;
  const last = crying[n - 1];
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  // Ferber: usually a few days, two weeks at the most. No real change by then is worth a conversation.
  if (n >= 14 && avg(crying.slice(-3)) >= 10 && avg(crying.slice(-3)) >= avg(crying.slice(0, 3)) * 0.8) {
    return "Two weeks in without much change? That happens, and it isn't your fault. It's worth asking your pediatrician what to adjust.";
  }
  if (n === 1) return 'Night 1 is done. Nights 2 and 3 are often harder before it gets easier.';
  if (last > crying[n - 2]) return 'A harder night is normal. Progress is rarely a straight line.';
  return null;
}

/** "9 min less than night 2", "1 h 5 min more than night 2", "Same as night 2", or null for the first night. */
export function compareCrying(
  minutes: number,
  previous: { nightNumber: number; cryingMinutes: number } | null,
): string | null {
  if (!previous) return null;
  const d = previous.cryingMinutes - minutes;
  if (d === 0) return `Same as night ${previous.nightNumber}`;
  return d > 0
    ? `${formatMinutes(d)} less than night ${previous.nightNumber}`
    : `${formatMinutes(-d)} more than night ${previous.nightNumber}`;
}

export interface Tile {
  label: string;
  value: string;
  /** "↓ 22m", "↑ 1", "same", or null on the first night */
  delta: string | null;
  /** For VoiceOver: "22 minutes less than night 3" */
  spoken: string;
}

/**
 * The three numbers at the top of the morning recap, each compared with the
 * night before. Plain arrows, no colours for better or worse.
 */
export function morningTiles(cur: NightSummary, prev: { nightNumber: number; summary: NightSummary } | null): Tile[] {
  const diff = (a: number, b: number, fmt: (n: number) => string) =>
    a === b ? 'same' : a < b ? `↓ ${fmt(b - a)}` : `↑ ${fmt(a - b)}`;
  const said = (a: number, b: number, fmt: (n: number) => string) =>
    !prev
      ? ''
      : a === b
        ? `, same as night ${prev.nightNumber}`
        : `, ${fmt(Math.abs(a - b))} ${a < b ? 'fewer' : 'more'} than night ${prev.nightNumber}`;
  const n = (x: number) => String(x);
  const p = prev?.summary;
  return [
    {
      label: 'Crying',
      value: formatMinutesShort(cur.cryingMinutes),
      delta: p ? diff(cur.cryingMinutes, p.cryingMinutes, formatMinutesShort) : null,
      spoken: `Crying, ${spokenMinutes(cur.cryingMinutes)}${said(cur.cryingMinutes, p?.cryingMinutes ?? 0, spokenMinutes).replace(' fewer ', ' less ')}`,
    },
    {
      label: 'Check-ins',
      value: n(cur.checkIns),
      delta: p ? diff(cur.checkIns, p.checkIns, n) : null,
      spoken: `${plural(cur.checkIns, 'check-in')}${said(cur.checkIns, p?.checkIns ?? 0, n)}`,
    },
    {
      label: 'Wakings',
      value: n(cur.wakings),
      delta: p ? diff(cur.wakings, p.wakings, n) : null,
      spoken: `${plural(cur.wakings, 'waking')}${said(cur.wakings, p?.wakings ?? 0, n)}`,
    },
  ];
}

export interface StretchLine {
  /** "Bedtime" or the waking's clock time */
  label: string;
  text: string;
}

/** One line per stretch of the night: "41 min crying · 2 check-ins", "Woke · 9 min crying · settled". */
export function stretchLines(events: NightEvent[], fmt: (at: number) => string): StretchLine[] {
  return episodes(events).map((ep) => {
    const cry = Math.round(episodeCryingMs(ep) / MIN);
    const fed = ep.start.type === 'feed_start' || ep.events.some((e) => e.type === 'feed_start');
    const parts: string[] = [];
    if (ep.start.type !== 'down') parts.push(fed ? 'Woke, fed' : 'Woke');
    else if (fed) parts.push('Fed');
    parts.push(cry ? `${formatMinutes(cry)} crying` : 'no crying');
    if (ep.checkIns) parts.push(plural(ep.checkIns, 'check-in'));
    if (!ep.end) parts.push('not logged as asleep');
    else if (ep.end.type === 'up') parts.push('up for the day');
    else if (ep.start.type !== 'down' && !ep.checkIns && !fed) parts.push('settled');
    return { label: ep.start.type === 'down' ? 'Bedtime' : fmt(ep.start.at), text: parts.join(' · ') };
  });
}
