import { compareCrying, moments, morningHeadline, timeline } from '../morning';
import { EventType, NightEvent } from '../session';

const MIN = 60_000;
const T0 = Date.UTC(2026, 10, 16, 1, 30);
let n = 0;
const ev = (type: EventType, minute: number): NightEvent => ({ id: `m${n++}`, nightId: 'n', type, at: T0 + minute * MIN });
const fmt = (at: number) => `+${Math.round((at - T0) / MIN)}`;

// Night 3 from the mockup: settle 4 min, cry 32 (one 2-min check-in), wake at +450 for 14 min.
const night = [
  ev('down', 0), ev('cry', 4), ev('check_in_start', 14), ev('check_in_end', 16), ev('asleep', 36),
  ev('woke', 450), ev('asleep', 464),
];

describe('morningHeadline', () => {
  it('describes bedtime crying and wakings', () => {
    expect(morningHeadline('Ava', night)).toBe('Ava fell asleep after 32 minutes of crying, and woke once.');
  });
  it('handles no crying and sleeping through', () => {
    expect(morningHeadline('', [ev('down', 0), ev('asleep', 10)])).toBe('Your baby fell asleep without crying, and slept through.');
  });
  it('counts several wakings', () => {
    const evs = [ev('down', 0), ev('asleep', 5), ev('woke', 100), ev('asleep', 110), ev('woke', 200), ev('asleep', 210), ev('woke', 300), ev('asleep', 305)];
    expect(morningHeadline('Ava', evs)).toMatch(/woke 3 times\.$/);
  });
  it('has a fallback with nothing logged', () => {
    expect(morningHeadline('Ava', [])).toBe('No night logged yet.');
  });
});

describe('timeline', () => {
  it('splits the night into settling, crying and asleep, running to the end time', () => {
    const segs = timeline(night, T0 + 660 * MIN).map((s) => [s.kind, (s.from - T0) / MIN, (s.to - T0) / MIN]);
    expect(segs).toEqual([
      ['settling', 0, 4],
      ['crying', 4, 36],
      ['asleep', 36, 450],
      ['crying', 450, 464],
      ['asleep', 464, 660],
    ]);
  });
  it('shows feeds and quiet stretches', () => {
    const segs = timeline([ev('woke', 0), ev('feed_start', 2), ev('feed_end', 17), ev('asleep', 20)], T0 + 30 * MIN);
    expect(segs.map((s) => s.kind)).toEqual(['crying', 'feeding', 'settling', 'asleep']);
  });
});

describe('moments', () => {
  it('lists bedtime in detail and summarizes wakings', () => {
    expect(moments(night, fmt).map((m) => `${fmt(m.at)} ${m.text}`)).toEqual([
      '+0 Down for the night',
      '+4 Started crying',
      '+14 Check-in, 2 min',
      '+36 Asleep',
      '+450 Woke up, asleep by +464',
    ]);
  });
  it('mentions feeds and check-ins in a waking', () => {
    const evs = [ev('down', 0), ev('asleep', 5), ev('woke', 100), ev('check_in_start', 105), ev('check_in_end', 106), ev('feed_start', 110), ev('feed_end', 125), ev('asleep', 130)];
    expect(moments(evs, fmt).pop()?.text).toBe('Woke up (fed, 1 check-in), asleep by +130');
  });
});

describe('compareCrying', () => {
  it('compares with the previous night', () => {
    expect(compareCrying(46, { nightNumber: 2, cryingMinutes: 55 })).toBe('9 less than night 2');
    expect(compareCrying(60, { nightNumber: 2, cryingMinutes: 55 })).toBe('5 more than night 2');
    expect(compareCrying(55, { nightNumber: 2, cryingMinutes: 55 })).toBe('Same as night 2');
    expect(compareCrying(55, null)).toBeNull();
  });
});
