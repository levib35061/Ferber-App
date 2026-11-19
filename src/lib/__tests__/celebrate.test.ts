import { shouldCelebrate } from '../morning';

describe('shouldCelebrate', () => {
  const c = (cryingMinutes: number) => ({ cryingMinutes });
  it('celebrates a clearly better night', () => {
    expect(shouldCelebrate(c(30), c(60))).toBe(true);
    expect(shouldCelebrate(c(0), c(4))).toBe(true); // no crying at all
  });
  it('stays quiet for small changes, worse nights, or nothing to compare', () => {
    expect(shouldCelebrate(c(57), c(60))).toBe(false); // 3 min less: noise
    expect(shouldCelebrate(c(16), c(20))).toBe(false); // 4 min
    expect(shouldCelebrate(c(80), c(100))).toBe(false); // 20% less
    expect(shouldCelebrate(c(70), c(60))).toBe(false);
    expect(shouldCelebrate(c(0), c(0))).toBe(false);
    expect(shouldCelebrate(c(10), null)).toBe(false); // night 1
  });
});
