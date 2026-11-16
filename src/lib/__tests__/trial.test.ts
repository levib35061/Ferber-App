import { FREE_NIGHTS, freeNightsLeft, needsUnlock } from '../trial';

describe('free trial', () => {
  it('gives two free nights', () => {
    expect(FREE_NIGHTS).toBe(2);
    expect(freeNightsLeft(0)).toBe(2);
    expect(freeNightsLeft(1)).toBe(1);
    expect(freeNightsLeft(5)).toBe(0);
  });
  it('asks to unlock only when starting a third night without the unlock', () => {
    expect(needsUnlock({ unlocked: false, nightsUsed: 1, startsNewNight: true })).toBe(false);
    expect(needsUnlock({ unlocked: false, nightsUsed: 2, startsNewNight: true })).toBe(true);
    expect(needsUnlock({ unlocked: true, nightsUsed: 9, startsNewNight: true })).toBe(false);
  });
  it('never interrupts a night already under way', () => {
    expect(needsUnlock({ unlocked: false, nightsUsed: 3, startsNewNight: false })).toBe(false);
  });
});
