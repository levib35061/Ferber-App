import { FERBER_DEFAULT_CHART, chartForPreset, gentleChart, isValidChart, nextWaitMinutes, setChartCell } from '../ferber';

describe('nextWaitMinutes (Ferber default chart)', () => {
  const c = FERBER_DEFAULT_CHART;

  it.each([
    // night, checkInsSoFar, expected
    [1, 0, 3],
    [1, 1, 5],
    [1, 2, 10],
    [1, 9, 10],
    [2, 0, 5],
    [2, 1, 10],
    [2, 2, 12],
    [3, 0, 10],
    [4, 1, 15],
    [5, 2, 20],
    [6, 0, 17],
    [7, 0, 20],
    [7, 1, 25],
    [7, 2, 30],
    [7, 50, 30],
  ])('night %i after %i check-ins waits %i min', (night, k, expected) => {
    expect(nextWaitMinutes(c, night, k)).toBe(expected);
  });

  it('uses night 7 values for nights past 7', () => {
    expect(nextWaitMinutes(c, 8, 0)).toBe(20);
    expect(nextWaitMinutes(c, 30, 5)).toBe(30);
  });

  it('clamps nonsense inputs to the first row / first wait', () => {
    expect(nextWaitMinutes(c, 0, 0)).toBe(3);
    expect(nextWaitMinutes(c, -2, -1)).toBe(3);
  });

  it('repeats the last value of a short custom row', () => {
    expect(nextWaitMinutes([[4]], 1, 3)).toBe(4);
  });

  it('rejects invalid charts', () => {
    expect(() => nextWaitMinutes([], 1, 0)).toThrow();
    expect(() => nextWaitMinutes([[0]], 1, 0)).toThrow();
  });
});

describe('presets', () => {
  it('gentle chart starts at night 1 values, ends at night 7 values, over ~1.5x nights', () => {
    const g = gentleChart();
    expect(g.length).toBe(10);
    expect(g[0]).toEqual([3, 5, 10]);
    expect(g[g.length - 1]).toEqual([20, 25, 30]);
    expect(isValidChart(g)).toBe(true);
    // never ramps faster than Ferber on the same night
    for (let n = 1; n <= 7; n++) {
      for (let k = 0; k < 3; k++) {
        expect(nextWaitMinutes(g, n, k)).toBeLessThanOrEqual(nextWaitMinutes(FERBER_DEFAULT_CHART, n, k));
      }
    }
  });

  it('custom falls back to default when the custom chart is invalid', () => {
    expect(chartForPreset('custom', [[1, 2]])).toEqual([[1, 2]]);
    expect(chartForPreset('custom', null)).toBe(FERBER_DEFAULT_CHART);
    expect(chartForPreset('ferber')).toBe(FERBER_DEFAULT_CHART);
  });
});

describe('setChartCell', () => {
  it('changes one cell without mutating the original, padding rows to 3 columns', () => {
    const c = [[3, 5, 10], [4]];
    const out = setChartCell(c, 1, 2, 9);
    expect(out).toEqual([
      [3, 5, 10],
      [4, 4, 9],
    ]);
    expect(c).toEqual([[3, 5, 10], [4]]);
  });
  it('clamps to 1..120 whole minutes', () => {
    expect(setChartCell([[3, 5, 10]], 0, 0, 0)[0][0]).toBe(1);
    expect(setChartCell([[3, 5, 10]], 0, 0, 500)[0][0]).toBe(120);
    expect(setChartCell([[3, 5, 10]], 0, 0, 4.6)[0][0]).toBe(5);
  });
});
