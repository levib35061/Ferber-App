import { currentRound, isGoodRun, shareCard, shortDate } from '../shareCard';
import { EventType, NightEvent } from '../session';
import { summarizeNight } from '../summary';

const MIN = 60_000;
const T0 = Date.UTC(2026, 10, 18, 1, 14);
let n = 0;
const ev = (type: EventType, minute: number): NightEvent => ({ id: `s${n++}`, nightId: 'n', type, at: T0 + minute * MIN });
const fmt = (at: number) => `+${Math.round((at - T0) / MIN)}`;
const nights = (...m: number[]) => m.map((cryingMinutes, i) => ({ nightNumber: i + 1, cryingMinutes }));

// Bedtime: 41 min crying, 2 check-ins, asleep at +41; waking at +400 for 9 min; up at +698.
const NIGHT = [
  ev('down', 0),
  ev('cry', 0),
  ev('check_in_start', 3),
  ev('check_in_end', 5),
  ev('check_in_start', 10),
  ev('check_in_end', 12),
  ev('asleep', 41),
  ev('woke', 400),
  ev('asleep', 409),
  ev('up', 698),
];

function input(round: ReturnType<typeof nights>, opts: { name?: string; events?: NightEvent[] } = {}) {
  const events = opts.events ?? NIGHT;
  const last = round[round.length - 1];
  const prev = round[round.length - 2] ?? null;
  return {
    round,
    name: opts.name,
    last: {
      nightNumber: last.nightNumber,
      nightKey: '2026-11-17',
      events,
      summary: summarizeNight(events),
      end: T0 + 698 * MIN,
    },
    previous: prev,
    fmt,
  };
}

describe('share card, nights 1–2: last night in full', () => {
  it('shows every number from last night', () => {
    const c = shareCard(input(nights(72, 50), { name: 'Ava' }));
    expect(c.layout).toBe('night');
    expect(c.kicker).toBe('Ava · Night 2 · Nov 17');
    expect(c.headline).toBe('50 min');
    expect(c.delta).toBe('↓ 22 min from night 1');
    expect(c.stats).toEqual([
      { label: 'Check-ins', value: '2' },
      { label: 'Wakings', value: '1' },
      { label: 'Asleep', value: '+41' },
      { label: 'Sleep', value: '10 h 48 min' },
    ]);
    expect(c.segments.length).toBeGreaterThan(2);
    expect([c.from, c.to]).toEqual(['+0', '+698']);
    expect(c.message).toBe(
      "Ava's sleep training, night 2: 50 min of crying, 2 check-ins, woke once. Timed with Check In: ferbertimer.com",
    );
    expect(c.celebrate).toBe(false);
  });
  it('has no comparison on night 1, and leaves out sleep when "Up for the day" was not logged', () => {
    const c = shareCard(input(nights(50), { events: NIGHT.slice(0, -1) }));
    expect(c.delta).toBeNull();
    expect(c.kicker).toBe('Night 1 · Nov 17');
    expect(c.stats.map((s) => s.label)).toEqual(['Check-ins', 'Wakings', 'Asleep']);
  });
  it('says "↑" plainly after a harder night', () => {
    expect(shareCard(input(nights(30, 50))).delta).toBe('↑ 20 min from night 1');
  });
});

describe('share card, night 3 on: the progress', () => {
  it('celebrates a clearly good run with bars and last night underneath', () => {
    const c = shareCard(input(nights(85, 100, 72, 50), { name: 'Ava' }));
    expect(c.layout).toBe('progress');
    expect(c.kicker).toBe('Ava · Nights 1 → 4');
    expect(c.headline).toBe('Crying down from 1 h 25 min to 50 min');
    expect(c.bars).toHaveLength(4);
    expect(c.stats.map((s) => s.value)).toEqual(['50m', '2', '1', '10h 48m']);
    expect(c.celebrate).toBe(true);
    expect(c.message).toContain('crying down from 1 h 25 min on night 1 to 50 min');
  });
  it('states last night plainly when the run is not clearly better', () => {
    const c = shareCard(input(nights(40, 35, 50)));
    expect(c.celebrate).toBe(false);
    expect(c.headline).toBe('Night 3: 50 min of crying');
  });
  it('shows at most the last 7 nights', () => {
    expect(shareCard(input(nights(60, 50, 40, 30, 25, 20, 15, 10, 50))).bars).toHaveLength(7);
  });
});

describe('isGoodRun', () => {
  it('only counts a clearly good run', () => {
    expect(isGoodRun(nights(43, 30, 18, 8))).toBe(true);
    expect(isGoodRun(nights(40, 10))).toBe(false);
    expect(isGoodRun(nights(40, 10, 15))).toBe(false);
    expect(isGoodRun(nights(40, 35, 30))).toBe(false);
    expect(isGoodRun(nights(0, 0, 0))).toBe(false);
  });
});

describe('currentRound and dates', () => {
  it('starts at the latest night 1', () => {
    const all = [...nights(40, 20, 10), ...nights(30, 25)];
    expect(currentRound(all)).toEqual(nights(30, 25));
    expect(currentRound([])).toEqual([]);
  });
  it('formats the night date', () => {
    expect(shortDate('2026-11-17')).toBe('Nov 17');
  });
});
