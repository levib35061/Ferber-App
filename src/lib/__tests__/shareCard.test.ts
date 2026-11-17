import { currentRound, shareCard } from '../shareCard';

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
  it('is not offered too early, after a harder night, or for a small change', () => {
    expect(shareCard(nights(40, 10))).toBeNull();
    expect(shareCard(nights(40, 10, 15))).toBeNull();
    expect(shareCard(nights(40, 35, 30))).toBeNull();
    expect(shareCard(nights(0, 0, 0))).toBeNull();
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
