import { addableNightKeys, maxCheckIns, maxWakingCheckIns, missedNightEvents } from '../missedNight';
import { totalSleepMs } from '../morning';
import { NightEvent } from '../session';
import { summarizeNight } from '../summary';

const KEY = '2026-11-17';
const NOW = new Date(2026, 10, 18, 12).getTime();
const NONE = { count: 0, cryingMin: 0, checkIns: 0 };
const toEvents = (planned: { type: NightEvent['type']; at: number }[]): NightEvent[] =>
  planned.map((p, i) => ({ id: `e${String(i).padStart(3, '0')}`, nightId: 'n', type: p.type, at: p.at }));

describe('missedNightEvents', () => {
  it('builds a night that summarizes to exactly what was entered', () => {
    const r = missedNightEvents({
      nightKey: KEY,
      now: NOW,
      bedtime: { at: { h: 19, m: 30 }, cryingMin: 25, checkIns: 2 },
      wakings: { count: 3, cryingMin: 14, checkIns: 2 },
      up: { h: 6, m: 45 },
    });
    if ('error' in r) throw new Error(r.error);
    expect(summarizeNight(toEvents(r.events))).toMatchObject({ cryingMinutes: 39, checkIns: 4, wakings: 3 });
    expect(r.events[0]).toEqual({ type: 'down', at: new Date(2026, 10, 17, 19, 30).getTime() });
    expect(r.events[r.events.length - 1]).toEqual({ type: 'up', at: new Date(2026, 10, 18, 6, 45).getTime() });
    // 11 h 15 min in bed, minus 39 min crying
    expect(Math.round(totalSleepMs(toEvents(r.events))! / 60_000)).toBe(675 - 39);
    // events are in time order
    expect(r.events.map((e) => e.at)).toEqual([...r.events.map((e) => e.at)].sort((a, b) => a - b));
  });
  it('handles no crying, no wakings and no up time', () => {
    const r = missedNightEvents({
      nightKey: KEY,
      now: NOW,
      bedtime: { at: { h: 20, m: 0 }, cryingMin: 0, checkIns: 3 },
      wakings: NONE,
      up: null,
    });
    if ('error' in r) throw new Error(r.error);
    expect(r.events.map((e) => e.type)).toEqual(['down', 'asleep']);
  });
  it('counts wakings that settled with no crying', () => {
    const r = missedNightEvents({
      nightKey: KEY,
      now: NOW,
      bedtime: { at: { h: 19, m: 0 }, cryingMin: 5, checkIns: 0 },
      wakings: { count: 2, cryingMin: 0, checkIns: 0 },
      up: null,
    });
    if ('error' in r) throw new Error(r.error);
    expect(summarizeNight(toEvents(r.events))).toMatchObject({ cryingMinutes: 5, wakings: 2 });
  });
  it("rejects times that haven't happened yet, and crying that doesn't fit", () => {
    expect(
      missedNightEvents({
        nightKey: KEY,
        now: new Date(2026, 10, 18, 3).getTime(),
        bedtime: { at: { h: 19, m: 30 }, cryingMin: 10, checkIns: 0 },
        wakings: NONE,
        up: { h: 6, m: 30 },
      }),
    ).toHaveProperty('error');
    expect(
      missedNightEvents({
        nightKey: KEY,
        now: NOW,
        bedtime: { at: { h: 19, m: 30 }, cryingMin: 10, checkIns: 0 },
        wakings: { count: 1, cryingMin: 240, checkIns: 0 },
        up: { h: 21, m: 0 },
      }),
    ).toHaveProperty('error');
  });
  it('caps check-ins to what fits in the crying time', () => {
    expect(maxCheckIns(5)).toBe(2);
    expect(maxWakingCheckIns({ count: 2, cryingMin: 7 })).toBe(2 + 1);
    const r = missedNightEvents({
      nightKey: KEY,
      now: NOW,
      bedtime: { at: { h: 19, m: 0 }, cryingMin: 4, checkIns: 9 },
      wakings: { count: 2, cryingMin: 7, checkIns: 9 },
      up: null,
    });
    if ('error' in r) throw new Error(r.error);
    expect(summarizeNight(toEvents(r.events)).checkIns).toBe(2 + 3);
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
