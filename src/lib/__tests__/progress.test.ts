import { trendLine } from '../progress';

const p = (nightNumber: number, cryingMinutes: number) => ({ nightNumber, cryingMinutes, checkIns: 0 });

describe('trendLine', () => {
  it('needs two nights', () => {
    expect(trendLine([])).toMatch(/couple of nights/);
    expect(trendLine([p(1, 40)])).toMatch(/couple of nights/);
  });
  it('reports a drop since night 1, using the latest night', () => {
    expect(trendLine([p(3, 16), p(1, 40), p(2, 30)])).toBe('Crying time is down 60% since night 1.');
  });
  it('reports a rise gently', () => {
    expect(trendLine([p(1, 20), p(2, 30)])).toMatch(/^Crying time is up 50% since night 1\./);
  });
  it('calls small changes the same', () => {
    expect(trendLine([p(1, 40), p(2, 38)])).toBe('Crying time is about the same as night 1.');
  });
  it('handles a zero first night', () => {
    expect(trendLine([p(1, 0), p(2, 0)])).toMatch(/No crying/);
    expect(trendLine([p(1, 0), p(2, 5)])).toMatch(/no trend/);
  });
});
