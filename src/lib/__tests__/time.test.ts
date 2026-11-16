import { formatDuration, nightKey } from '../time';

describe('nightKey (night runs 5pm–11am local)', () => {
  it('puts 2am with the previous evening', () => {
    expect(nightKey(new Date(2026, 10, 15, 2, 0).getTime())).toBe('2026-11-14');
  });
  it('puts 7pm with the same date', () => {
    expect(nightKey(new Date(2026, 10, 14, 19, 0).getTime())).toBe('2026-11-14');
  });
  it('switches at 11am', () => {
    expect(nightKey(new Date(2026, 10, 15, 10, 59).getTime())).toBe('2026-11-14');
    expect(nightKey(new Date(2026, 10, 15, 11, 0).getTime())).toBe('2026-11-15');
  });
  it('handles month boundaries', () => {
    expect(nightKey(new Date(2026, 11, 1, 3, 0).getTime())).toBe('2026-11-30');
  });
});

describe('formatDuration', () => {
  it('formats m:ss and h:mm:ss, rounding up so it never shows 0:00 early', () => {
    expect(formatDuration(252_000)).toBe('4:12');
    expect(formatDuration(251_100)).toBe('4:12');
    expect(formatDuration(3_725_000)).toBe('1:02:05');
    expect(formatDuration(-5)).toBe('0:00');
  });
});
