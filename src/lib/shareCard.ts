/**
 * The shareable card on every morning recap. Pure and tested.
 *
 * Two layouts (mockup: docs/design/share-card-options.png):
 * - "night" (nights 1–2 of a round): last night in full. Big crying number,
 *   the change since the night before, check-ins, wakings, when the baby fell
 *   asleep, total sleep, and the night's timeline.
 * - "progress" (3+ nights): a bar per night of the round, last night's
 *   numbers underneath.
 *
 * After a clearly good run (see isGoodRun) the headline celebrates the drop
 * and the button is bolder; otherwise it states last night plainly, so it
 * never reads as a scorecard.
 */
import { Segment, timeline, totalSleepMs, upAt } from './morning';
import { NightEvent, episodes } from './session';
import { NightSummary } from './summary';
import { formatMinutes, formatMinutesShort } from './time';

export interface RoundNight {
  nightNumber: number;
  cryingMinutes: number;
}

export interface ShareInput {
  /** This round's finished nights, oldest first, ending with last night */
  round: RoundNight[];
  name?: string;
  last: {
    nightNumber: number;
    /** "2026-11-17": the evening the night started */
    nightKey: string;
    events: NightEvent[];
    summary: NightSummary;
    /** End of the timeline (Up for the day, or the morning) */
    end: number;
    /** Entered afterwards: no timeline (its times aren't real) */
    addedLater?: boolean;
  };
  /** The night before, for the change in crying */
  previous: { nightNumber: number; cryingMinutes: number } | null;
  /** Clock formatter ("7:55 PM") */
  fmt: (at: number) => string;
}

export interface ShareStat {
  label: string;
  value: string;
}

export interface ShareCard {
  layout: 'night' | 'progress';
  /** "Ava · Night 4 · Nov 17" or "Ava · Nights 1 → 4" */
  kicker: string;
  /** progress: the line above the chart. night: the big number */
  headline: string;
  /** night only: "↓ 22 min from night 3", "Same as night 3", or null */
  delta: string | null;
  stats: ShareStat[];
  /** night only: the timeline, with its start and end clock times */
  segments: Segment[];
  from: string;
  to: string;
  /** progress only: up to the last 7 nights, oldest first */
  bars: RoundNight[];
  /** Text sent with the image */
  message: string;
  /** Clearly good news (offered more prominently) */
  celebrate: boolean;
}

const MAX_BARS = 7;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FOOTER = 'Timed with Check In: ferbertimer.com';
const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

/** The nights of the current training round (from the latest night 1), oldest first. */
export function currentRound(nightsOldestFirst: RoundNight[]): RoundNight[] {
  let start = 0;
  nightsOldestFirst.forEach((n, i) => {
    if (n.nightNumber === 1) start = i;
  });
  return nightsOldestFirst.slice(start);
}

/** Clearly good news: 3+ nights, last night no worse than the one before, crying down 40%+ since night 1. */
export function isGoodRun(round: RoundNight[]): boolean {
  if (round.length < 3) return false;
  const first = round[0];
  const last = round[round.length - 1];
  const prev = round[round.length - 2];
  return (
    first.cryingMinutes > 0 && last.cryingMinutes <= prev.cryingMinutes && last.cryingMinutes <= first.cryingMinutes * 0.6
  );
}

/** "2026-11-17" → "Nov 17" */
export function shortDate(nightKey: string): string {
  const [, m, d] = nightKey.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

function wokeText(n: number): string {
  return n === 0 ? 'slept through' : n === 1 ? 'woke once' : n === 2 ? 'woke twice' : `woke ${n} times`;
}

export function shareCard({ round, name = '', last, previous, fmt }: ShareInput): ShareCard {
  const who = name.trim();
  const s = last.summary;
  const progress = round.length >= 3;
  const first = round[0];
  const celebrate = isGoodRun(round);
  const sleepMs = totalSleepMs(last.events);
  const asleep = episodes(last.events).find((e) => e.start.type === 'down' && e.end?.type === 'asleep')?.end?.at ?? null;
  const segments = last.addedLater ? [] : timeline(last.events, last.end);
  const up = upAt(last.events);

  const crying = s.cryingMinutes === 0 ? 'no crying' : `${formatMinutes(s.cryingMinutes)} of crying`;
  const subject = who ? `${who}'s sleep training` : 'Sleep training';
  const facts = `${crying}, ${plural(s.checkIns, 'check-in')}, ${wokeText(s.wakings)}`;
  const from = formatMinutes(first?.cryingMinutes ?? 0);
  const message = celebrate
    ? s.cryingMinutes === 0
      ? `${subject}, night ${last.nightNumber}: from ${from} of crying on night ${first.nightNumber} to none. ${FOOTER}`
      : `${subject}, night ${last.nightNumber}: crying down from ${from} on night ${first.nightNumber} to ${formatMinutes(s.cryingMinutes)}. ${FOOTER}`
    : `${subject}, night ${last.nightNumber}: ${facts}. ${FOOTER}`;

  const prefix = who ? `${who} · ` : '';
  const sleep = sleepMs != null && sleepMs > 0 ? sleepMs / 60_000 : null;

  if (progress) {
    const headline = celebrate
      ? s.cryingMinutes === 0
        ? `From ${from} of crying to none`
        : `Crying down from ${from} to ${formatMinutes(s.cryingMinutes)}`
      : `Night ${last.nightNumber}: ${crying}`;
    const stats: ShareStat[] = [
      { label: 'Crying', value: formatMinutesShort(s.cryingMinutes) },
      { label: 'Check-ins', value: String(s.checkIns) },
      { label: 'Wakings', value: String(s.wakings) },
    ];
    if (sleep != null) stats.push({ label: 'Sleep', value: formatMinutesShort(sleep) });
    return {
      layout: 'progress',
      kicker: `${prefix}Nights ${first.nightNumber} → ${last.nightNumber}`,
      headline,
      delta: null,
      stats,
      segments: [],
      from: '',
      to: '',
      bars: round.slice(-MAX_BARS),
      message,
      celebrate,
    };
  }

  let delta: string | null = null;
  if (previous) {
    const d = s.cryingMinutes - previous.cryingMinutes;
    delta =
      d === 0
        ? `Same as night ${previous.nightNumber}`
        : `${d < 0 ? '↓' : '↑'} ${formatMinutes(Math.abs(d))} from night ${previous.nightNumber}`;
  }
  const stats: ShareStat[] = [
    { label: 'Check-ins', value: String(s.checkIns) },
    { label: 'Wakings', value: String(s.wakings) },
  ];
  if (asleep != null) stats.push({ label: 'Asleep', value: fmt(asleep) });
  if (sleep != null) stats.push({ label: 'Sleep', value: formatMinutes(sleep) });
  return {
    layout: 'night',
    kicker: `${prefix}Night ${last.nightNumber} · ${shortDate(last.nightKey)}`,
    headline: formatMinutes(s.cryingMinutes),
    delta,
    stats,
    segments,
    from: segments.length ? fmt(segments[0].from) : '',
    to: segments.length ? fmt(up ?? last.end) : '',
    bars: [],
    message,
    celebrate,
  };
}
