/**
 * When to ask for an App Store rating: only on a good morning, never during
 * a night, and rarely. iOS itself also limits how often the prompt can show.
 * Pure and tested.
 */
const DAY = 24 * 60 * 60_000;

export const REVIEW_MAX_ASKS = 2;
export const REVIEW_GAP_DAYS = 120;

export function shouldAskForReview(o: {
  /** Crying minutes for every finished night, oldest first, ending with last night */
  crying: number[];
  /** How many times we've asked before */
  asks: number;
  /** When we last asked (epoch ms), or 0 for never */
  lastAskedAt: number;
  now: number;
}): boolean {
  if (o.asks >= REVIEW_MAX_ASKS) return false;
  if (o.lastAskedAt && o.now - o.lastAskedAt < REVIEW_GAP_DAYS * DAY) return false;
  const n = o.crying.length;
  if (n < 3) return false;
  const first = o.crying[0];
  const last = o.crying[n - 1];
  // A good morning: last night was no worse than the one before, and crying
  // is down by half or more since night 1.
  return last <= o.crying[n - 2] && last <= first * 0.5;
}
