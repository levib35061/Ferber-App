import { shouldAskForReview } from '../review';

const DAY = 24 * 60 * 60_000;
const now = Date.UTC(2026, 10, 20);
const base = { asks: 0, lastAskedAt: 0, now };

describe('shouldAskForReview', () => {
  it('asks on a good morning after at least three nights', () => {
    expect(shouldAskForReview({ ...base, crying: [40, 30, 15] })).toBe(true);
  });
  it('waits for three nights', () => {
    expect(shouldAskForReview({ ...base, crying: [40, 10] })).toBe(false);
  });
  it('never asks after a harder night', () => {
    expect(shouldAskForReview({ ...base, crying: [60, 10, 25] })).toBe(false);
  });
  it('needs crying down by half since night 1', () => {
    expect(shouldAskForReview({ ...base, crying: [40, 35, 30] })).toBe(false);
  });
  it('asks rarely', () => {
    const crying = [40, 30, 15];
    expect(shouldAskForReview({ ...base, crying, asks: 1, lastAskedAt: now - 30 * DAY })).toBe(false);
    expect(shouldAskForReview({ ...base, crying, asks: 1, lastAskedAt: now - 130 * DAY })).toBe(true);
    expect(shouldAskForReview({ ...base, crying, asks: 2, lastAskedAt: now - 400 * DAY })).toBe(false);
  });
});
