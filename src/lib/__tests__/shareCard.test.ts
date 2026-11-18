import { currentRound, isGoodRun, shareCard } from '../shareCard';

const nights = (...m: number[]) => m.map((cryingMinutes, i) => ({ nightNumber: i + 1, cryingMinutes }));

describe('shareCard', () => {
  it('is offered after a clearly better run of nights', () => {
    const card = shareCard(nights(43, 30, 18, 8), 'Ava');
    expect(card).not.toBeNull();
    expect(card!.headline).toBe('Crying down from 43\u00A0min to 8\u00A0min');
    expect(card!.span).toBe('Night 1 → night 4');
    expect(card!.message).toContain("Ava's sleep training, night 4");
    expect(card!.message).toContain('ferbertimer.com');
  });
  it('celebrates no crying at all', () => {
    expect(shareCard(nights(40, 20, 0))!.headline).toBe('From 40\u00A0min of crying to none');
    expect(shareCard(nights(40, 20, 0))!.message).toMatch(/^Sleep training, night 3/);
  });
  it('only celebrates a clearly good run', () => {
    expect(isGoodRun(nights(43, 30, 18, 8))).toBe(true);
    expect(isGoodRun(nights(40, 10))).toBe(false);
    expect(isGoodRun(nights(40, 10, 15))).toBe(false);
    expect(isGoodRun(nights(40, 35, 30))).toBe(false);
    expect(isGoodRun(nights(0, 0, 0))).toBe(false);
  });
  it('is available on any other morning, stating last night plainly', () => {
    const hard = shareCard(nights(40, 72), 'Ava')!;
    expect(hard.celebrate).toBe(false);
    expect(hard.headline).toBe('Night 2: 1\u00A0h 12\u00A0min of crying');
    expect(hard.message).toBe(
      "Ava's sleep training, night 2: 1\u00A0h 12\u00A0min of crying. Timed with Check In: ferbertimer.com",
    );
    expect(hard.bars).toHaveLength(2);
    const first = shareCard(nights(25))!;
    expect(first.headline).toBe('Night 1: 25\u00A0min of crying');
    expect(first.span).toBe('Night 1');
    expect(first.bars).toHaveLength(0);
    expect(shareCard(nights(0, 0, 0))!.headline).toBe('Night 3: no crying');
    expect(shareCard([])).toBeNull();
  });
  it('shows hours past an hour', () => {
    expect(shareCard(nights(95, 50, 20))!.headline).toBe('Crying down from 1\u00A0h 35\u00A0min to 20\u00A0min');
  });
  it('shows at most the last 7 nights', () => {
    expect(shareCard(nights(60, 50, 40, 30, 25, 20, 15, 10, 5))!.bars).toHaveLength(7);
  });
});

describe('currentRound', () => {
  it('starts at the latest night 1', () => {
    const all = [...nights(40, 20, 10), ...nights(30, 25)];
    expect(currentRound(all)).toEqual(nights(30, 25));
    expect(currentRound([])).toEqual([]);
  });
});
