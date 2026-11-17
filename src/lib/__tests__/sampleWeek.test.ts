import { trendLine } from '../progress';
import { SAMPLE_WEEK, buildSampleWeek } from '../sampleWeek';
import { NightEvent } from '../session';
import { summarizeNight } from '../summary';
import { nightKey } from '../time';

describe('sample week', () => {
  const week = buildSampleWeek('2026-11-15');

  it('is 7 consecutive nights ending on the given night', () => {
    expect(week.map((n) => n.nightKey)).toEqual([
      '2026-11-09',
      '2026-11-10',
      '2026-11-11',
      '2026-11-12',
      '2026-11-13',
      '2026-11-14',
      '2026-11-15',
    ]);
  });

  it('puts every event inside its own night', () => {
    for (const n of week) for (const e of n.events) expect(nightKey(e.at)).toBe(n.nightKey);
  });

  it('matches the hand-count numbers for every night', () => {
    week.forEach((n, i) => {
      const events: NightEvent[] = n.events.map((e, j) => ({ id: `e${j}`, nightId: 'n', type: e.type, at: e.at }));
      const s = summarizeNight(events);
      expect({ cryingMinutes: s.cryingMinutes, checkIns: s.checkIns, wakings: s.wakings }).toEqual(SAMPLE_WEEK[i].expected);
    });
  });

  it('gives the expected trend line', () => {
    const pts = SAMPLE_WEEK.map((s, i) => ({ nightNumber: i + 1, ...s.expected }));
    expect(trendLine(pts)).toBe('Crying time is down 93% since night 1.');
  });
});
