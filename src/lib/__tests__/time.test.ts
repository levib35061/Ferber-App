import { ageInMonths, atTimeInNight, formatDuration, nightKey, spokenDuration } from '../time';

describe('spokenDuration', () => {
  it('reads naturally', () => {
    expect(spokenDuration(252_000)).toBe('4 minutes 12 seconds');
    expect(spokenDuration(60_000)).toBe('1 minute');
    expect(spokenDuration(3_725_000)).toBe('1 hour 2 minutes 5 seconds');
    expect(spokenDuration(0)).toBe('0 seconds');
    expect(spokenDuration(1_000)).toBe('1 second');
  });
});

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

describe('atTimeInNight', () => {
  it('puts evening times on the night date and early-morning times on the next day', () => {
    expect(atTimeInNight('2026-11-14', 21, 30)).toBe(new Date(2026, 10, 14, 21, 30).getTime());
    expect(atTimeInNight('2026-11-14', 2, 15)).toBe(new Date(2026, 10, 15, 2, 15).getTime());
    expect(atTimeInNight('2026-11-30', 0, 5)).toBe(new Date(2026, 11, 1, 0, 5).getTime());
  });
  it('round-trips with nightKey', () => {
    for (const h of [0, 3, 10, 11, 17, 23]) expect(nightKey(atTimeInNight('2026-11-14', h, 0))).toBe('2026-11-14');
  });
});

describe('ageInMonths', () => {
  const now = new Date(2026, 10, 16, 12).getTime(); // Nov 16 2026
  it('counts whole months', () => {
    expect(ageInMonths('2026-05-16', now)).toBe(6);
    expect(ageInMonths('2026-05-17', now)).toBe(5);
    expect(ageInMonths('2025-11-16', now)).toBe(12);
  });
  it('never goes negative', () => {
    expect(ageInMonths('2027-01-01', now)).toBe(0);
  });
});
