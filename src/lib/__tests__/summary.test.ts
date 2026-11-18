import { asleepLines } from '../summary';

describe('asleepLines', () => {
  const night = (o: Partial<import('../summary').NightSummary>) => ({
    cryingMinutes: 36,
    checkIns: 3,
    wakings: 4,
    longestEpisodeMinutes: 20,
    episodeCount: 5,
    ...o,
  });
  it('credits a waking that settled with no help', () => {
    expect(asleepLines(night({}), { cryingMinutes: 0, checkIns: 0, wasWaking: true })).toEqual({
      latest: 'Last waking: settled on their own',
      tonight: 'Tonight: 3 check-ins · 4 wakings',
    });
  });
  it('describes the latest stretch plainly', () => {
    expect(asleepLines(night({}), { cryingMinutes: 6, checkIns: 1, wasWaking: true }).latest).toBe(
      'Last waking: 6 min crying, 1 check-in',
    );
    expect(asleepLines(night({}), { cryingMinutes: 4, checkIns: 0, wasWaking: true }).latest).toBe(
      'Last waking: 4 min crying, no check-ins',
    );
  });
  it('at bedtime, talks about bedtime and has no "tonight" line yet', () => {
    expect(
      asleepLines(night({ episodeCount: 1, wakings: 0 }), { cryingMinutes: 12, checkIns: 2, wasWaking: false }),
    ).toEqual({
      latest: 'Bedtime: 12 min crying, 2 check-ins',
      tonight: null,
    });
    expect(asleepLines(night({ episodeCount: 1 }), { cryingMinutes: 0, checkIns: 0, wasWaking: false }).latest).toBe(
      'Bedtime: asleep with no crying',
    );
  });
});
