import { addableNightKeys, maxCheckIns, missedNightEvents } from '../missedNight';
import { NightEvent } from '../session';
import { summarizeNight } from '../summary';
import { totalSleepMs } from '../morning';

const KEY = '2026-11-17';
const toEvents = (planned: { type: NightEvent['type']; at: number }[]): NightEvent[] =>
  planned.map((p, i) => ({ id: `e${String(i).padStart(3, '0')}`, nightId: 'n', type: p.type, at: p.at }));

describe('missedNightEvents', () => {
  it('builds a night that summarizes to what was entered', () => {
    const r = missedNightEvents({
      nightKey: KEY,
      bedtime: { at: { h: 19, m: 30 }, cryingMin: 25, checkIns: 2 },
      wakings: [
        { at: { h: 2, m: 10 }, cryingMin: 9, checkIns: 1 },
        { at: { h: 23, m: 0 }, cryingMin: 0, checkIns: 0 },
      ],
      up: { h: 6, m: 45 },
    });
    if ('error' in r) throw new Error(r.error);
    const s = summarizeNight(toEvents(r.events));
    expect(s).toMatchObject({ cryingMinutes: 34, checkIns: 3, wakings: 2 });
    expect(r.events[0]).toEqual({ type: 'down', at: new Date(2026, 10, 17, 19, 30).getTime() });
    expect(r.events[r.events.length - 1]).toEqual({ type: 'up', at: new Date(2026, 10, 18, 6, 45).getTime() });
    // 7:30pm to 6:45am minus about 35 minutes awake
    expect(Math.round(totalSleepMs(toEvents(r.events))! / 60_000)).toBeGreaterThan(600);
  });
  it('handles a bedtime with no crying and no up time', () => {
    const r = missedNightEvents({
      nightKey: KEY,
      bedtime: { at: { h: 20, m: 0 }, cryingMin: 0, checkIns: 3 },
      wakings: [],
      up: null,
    });
    if ('error' in r) throw new Error(r.error);
    expect(r.events.map((e) => e.type)).toEqual(['down', 'asleep']);
    expect(summarizeNight(toEvents(r.events)).cryingMinutes).toBe(0);
  });
  it('rejects times out of order', () => {
    expect(
      missedNightEvents({
        nightKey: KEY,
        bedtime: { at: { h: 19, m: 30 }, cryingMin: 40, checkIns: 0 },
        wakings: [{ at: { h: 19, m: 50 }, cryingMin: 5, checkIns: 0 }],
        up: null,
      }),
    ).toEqual({ error: 'Each waking should be after the baby was asleep again.' });
    expect(
      missedNightEvents({
        nightKey: KEY,
        bedtime: { at: { h: 19, m: 30 }, cryingMin: 5, checkIns: 0 },
        wakings: [],
        up: { h: 19, m: 31 },
      }),
    ).toHaveProperty('error');
  });
  it('caps check-ins to what fits in the crying time', () => {
    expect(maxCheckIns(5)).toBe(2);
    const r = missedNightEvents({
      nightKey: KEY,
      bedtime: { at: { h: 19, m: 0 }, cryingMin: 4, checkIns: 9 },
      wakings: [],
      up: null,
    });
    if ('error' in r) throw new Error(r.error);
    expect(summarizeNight(toEvents(r.events)).checkIns).toBe(2);
  });
});

describe('addableNightKeys', () => {
  it('offers last night and earlier evenings newer than the latest logged night', () => {
    const morning = new Date(2026, 10, 18, 8).getTime(); // before 11am: last night is the 17th
    expect(addableNightKeys('2026-11-15', morning)).toEqual(['2026-11-17', '2026-11-16']);
    const afternoon = new Date(2026, 10, 18, 15).getTime(); // tonight (18th) isn't over yet
    expect(addableNightKeys('2026-11-16', afternoon)).toEqual(['2026-11-17']);
    expect(addableNightKeys('2026-11-17', afternoon)).toEqual([]);
    expect(addableNightKeys(null, afternoon)).toHaveLength(7);
  });
});
