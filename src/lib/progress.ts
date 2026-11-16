/**
 * Plain-language trend for the Progress screen, e.g.
 * "Crying time is down 60% since night 1."
 */
export interface NightPoint {
  nightNumber: number;
  cryingMinutes: number;
  checkIns: number;
}

export function trendLine(points: NightPoint[]): string {
  const nights = [...points].sort((a, b) => a.nightNumber - b.nightNumber);
  if (nights.length < 2) return 'Log a couple of nights to see a trend.';
  const first = nights[0];
  const last = nights[nights.length - 1];
  const since = `since night ${first.nightNumber}`;
  if (first.cryingMinutes === 0) {
    return last.cryingMinutes === 0 ? 'No crying logged yet. Nice.' : `Night ${first.nightNumber} had no crying logged, so there's no trend to compare.`;
  }
  const change = (last.cryingMinutes - first.cryingMinutes) / first.cryingMinutes;
  const pct = Math.round(Math.abs(change) * 100);
  if (pct < 10) return `Crying time is about the same as night ${first.nightNumber}.`;
  if (change < 0) return `Crying time is down ${pct}% ${since}.`;
  return `Crying time is up ${pct}% ${since}. A few rough nights early on are common.`;
}
