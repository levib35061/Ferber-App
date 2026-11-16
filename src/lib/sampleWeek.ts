/**
 * A realistic sample week for testing History and Progress without waiting
 * seven real nights. Pure and deterministic: the expected per-night numbers
 * are listed in SAMPLE_WEEK and checked by a unit test.
 *
 * Each bedtime has a few quiet minutes before crying starts. Check-ins follow
 * the Ferber default chart; each check-in lasts 2 minutes.
 */
import { FERBER_DEFAULT_CHART, nextWaitMinutes } from './ferber';
import { EventType } from './session';
import { atTimeInNight, localDateString } from './time';

interface EpisodeSpec {
  start: 'down' | 'woke';
  at: [number, number]; // local hour, minute
  /** Quiet minutes after Down before crying starts (ignored for woke) */
  settleMinutes?: number;
  checkIns: number;
  cryMinutes: number; // crying start → asleep
}

export interface SampleNightSpec {
  episodes: EpisodeSpec[];
  /** The numbers a hand count should give (also asserted in tests). */
  expected: { cryingMinutes: number; checkIns: number; wakings: number };
  note?: string;
}

export const SAMPLE_WEEK: SampleNightSpec[] = [
  {
    episodes: [
      { start: 'down', at: [19, 30], settleMinutes: 2, checkIns: 3, cryMinutes: 45 },
      { start: 'woke', at: [1, 50], checkIns: 2, cryMinutes: 25 },
    ],
    expected: { cryingMinutes: 70, checkIns: 5, wakings: 1 },
    note: 'Sample night. Rough start, as expected.',
  },
  {
    episodes: [
      { start: 'down', at: [19, 30], settleMinutes: 3, checkIns: 3, cryMinutes: 40 },
      { start: 'woke', at: [2, 30], checkIns: 1, cryMinutes: 15 },
    ],
    expected: { cryingMinutes: 55, checkIns: 4, wakings: 1 },
  },
  {
    episodes: [
      { start: 'down', at: [19, 35], settleMinutes: 4, checkIns: 2, cryMinutes: 32 },
      { start: 'woke', at: [3, 0], checkIns: 1, cryMinutes: 14 },
    ],
    expected: { cryingMinutes: 46, checkIns: 3, wakings: 1 },
  },
  {
    episodes: [
      { start: 'down', at: [19, 30], settleMinutes: 5, checkIns: 1, cryMinutes: 20 },
      { start: 'woke', at: [4, 15], checkIns: 0, cryMinutes: 8 },
    ],
    expected: { cryingMinutes: 28, checkIns: 1, wakings: 1 },
    note: 'Sample night. Teething?',
  },
  {
    episodes: [{ start: 'down', at: [19, 30], settleMinutes: 6, checkIns: 1, cryMinutes: 18 }],
    expected: { cryingMinutes: 18, checkIns: 1, wakings: 0 },
  },
  {
    episodes: [{ start: 'down', at: [19, 30], settleMinutes: 8, checkIns: 0, cryMinutes: 9 }],
    expected: { cryingMinutes: 9, checkIns: 0, wakings: 0 },
  },
  {
    episodes: [{ start: 'down', at: [19, 30], settleMinutes: 10, checkIns: 0, cryMinutes: 5 }],
    expected: { cryingMinutes: 5, checkIns: 0, wakings: 0 },
  },
];

export interface SampleNight {
  nightKey: string;
  nightNumber: number;
  note: string | null;
  events: { type: EventType; at: number }[];
}

const MIN = 60_000;
const CHECK_IN_MINUTES = 2;

/** The 7 sample nights, ending with the night of `lastNightKey` (e.g. last night). */
export function buildSampleWeek(lastNightKey: string): SampleNight[] {
  const [y, m, d] = lastNightKey.split('-').map(Number);
  return SAMPLE_WEEK.map((spec, i) => {
    const nightNumber = i + 1;
    const key = localDateString(new Date(y, m - 1, d - (SAMPLE_WEEK.length - 1 - i), 12));
    const events: SampleNight['events'] = [];
    for (const ep of spec.episodes) {
      let start = atTimeInNight(key, ep.at[0], ep.at[1]);
      events.push({ type: ep.start, at: start });
      if (ep.start === 'down') {
        start += (ep.settleMinutes ?? 0) * MIN;
        events.push({ type: 'cry', at: start });
      }
      let t = start;
      for (let k = 0; k < ep.checkIns; k++) {
        t += nextWaitMinutes(FERBER_DEFAULT_CHART, nightNumber, k) * MIN;
        events.push({ type: 'check_in_start', at: t });
        t += CHECK_IN_MINUTES * MIN;
        events.push({ type: 'check_in_end', at: t });
      }
      const asleep = start + ep.cryMinutes * MIN;
      if (asleep <= t) throw new Error(`Sample night ${nightNumber}: asleep before last check-in ended`);
      events.push({ type: 'asleep', at: asleep });
    }
    return { nightKey: key, nightNumber, note: spec.note ?? null, events };
  });
}
