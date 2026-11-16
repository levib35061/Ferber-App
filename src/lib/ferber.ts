/**
 * Ferber interval logic. Pure TypeScript, no React Native imports, so it can be
 * unit-tested with Jest and reused on a server later.
 */

/** One row per night. Each row lists waits in minutes: [1st, 2nd, 3rd-and-later]. */
export type Chart = number[][];

export type ChartPreset = 'ferber' | 'gentle' | 'custom';

/**
 * Default progressive-waiting chart (minutes).
 * From memory, approximate — VERIFY AGAINST THE BOOK BEFORE LAUNCH.
 * Row index 0 = night 1. The last row applies to every night past it.
 */
export const FERBER_DEFAULT_CHART: Chart = [
  [3, 5, 10],
  [5, 10, 12],
  [10, 12, 15],
  [12, 15, 17],
  [15, 17, 20],
  [17, 20, 25],
  [20, 25, 30],
];

/**
 * "Gentle" preset: a 1.5x longer ramp-up. Night 1 starts at the Ferber
 * night-1 values and the chart takes ~1.5x as many nights to reach the
 * night-7 values (row i of Ferber is reached at row 1.5*i). Values in
 * between are interpolated and rounded to whole minutes.
 */
export function gentleChart(base: Chart = FERBER_DEFAULT_CHART): Chart {
  const lastIndex = base.length - 1;
  const rows = Math.round(lastIndex * 1.5) + 1;
  const out: Chart = [];
  for (let r = 0; r < rows; r++) {
    const pos = r / 1.5; // fractional row in the base chart
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, lastIndex);
    const t = pos - lo;
    const width = Math.max(base[lo].length, base[hi].length);
    const row: number[] = [];
    for (let c = 0; c < width; c++) {
      const a = cell(base[lo], c);
      const b = cell(base[hi], c);
      row.push(Math.round(a + (b - a) * t));
    }
    out.push(row);
  }
  return out;
}

export function chartForPreset(preset: ChartPreset, custom?: Chart | null): Chart {
  if (preset === 'gentle') return gentleChart();
  if (preset === 'custom' && custom && isValidChart(custom)) return custom;
  return FERBER_DEFAULT_CHART;
}

export function isValidChart(chart: unknown): chart is Chart {
  return (
    Array.isArray(chart) &&
    chart.length > 0 &&
    chart.every(
      (row) =>
        Array.isArray(row) &&
        row.length > 0 &&
        row.every((m) => typeof m === 'number' && Number.isFinite(m) && m > 0),
    )
  );
}

/** Value at column c, repeating the last value of the row past its end. */
function cell(row: number[], c: number): number {
  return row[Math.min(c, row.length - 1)];
}

/**
 * Minutes to wait before the next check-in.
 *
 * @param chart        rows of waits, row 0 = night 1
 * @param nightNumber  1-based night; nights past the chart use the last row
 * @param checkInsSoFarThisEpisode  check-ins already done in this episode (0 = first wait)
 */
export function nextWaitMinutes(
  chart: Chart,
  nightNumber: number,
  checkInsSoFarThisEpisode: number,
): number {
  if (!isValidChart(chart)) throw new Error('Invalid interval chart');
  const n = Math.max(1, Math.floor(nightNumber));
  const k = Math.max(0, Math.floor(checkInsSoFarThisEpisode));
  const row = chart[Math.min(n, chart.length) - 1];
  return cell(row, k);
}

export const MAX_WAIT_MINUTES = 120;

/** Returns a copy of the chart with one cell changed (rows are padded to 3 columns first). */
export function setChartCell(chart: Chart, row: number, col: number, minutes: number): Chart {
  const value = Math.min(MAX_WAIT_MINUTES, Math.max(1, Math.round(minutes)));
  return chart.map((r, i) => {
    const full = [0, 1, 2].map((c) => cell(r, c));
    if (i === row) full[col] = value;
    return full;
  });
}
