import { chooseView, isPastNight } from '../nightView';

const at = (h: number, m = 0) => new Date(2026, 10, 17, h, m).getTime(); // Nov 17
const LAST_NIGHT = '2026-11-16';

describe('chooseView', () => {
  it('shows Today in the afternoon after a logged night', () => {
    expect(chooseView({ now: at(15), stateKind: 'idle', bedtimeEarly: false, lastNightKey: LAST_NIGHT })).toEqual({
      view: 'today',
      canShowToday: true,
    });
  });

  it('"Starting bedtime early?" shows the night screen, and turning it off goes back to Today', () => {
    expect(chooseView({ now: at(17), stateKind: 'idle', bedtimeEarly: true, lastNightKey: LAST_NIGHT })).toEqual({
      view: 'night',
      canShowToday: true,
    });
    expect(chooseView({ now: at(17), stateKind: 'idle', bedtimeEarly: false, lastNightKey: LAST_NIGHT }).view).toBe('today');
  });

  it('stays on the night screen while a night is running, and after 6pm', () => {
    expect(chooseView({ now: at(16), stateKind: 'waiting', bedtimeEarly: false, lastNightKey: LAST_NIGHT })).toEqual({
      view: 'night',
      canShowToday: false,
    });
    expect(chooseView({ now: at(19), stateKind: 'idle', bedtimeEarly: false, lastNightKey: LAST_NIGHT }).view).toBe('night');
  });

  it('has no Today without a recent logged night', () => {
    expect(chooseView({ now: at(15), stateKind: 'idle', bedtimeEarly: true, lastNightKey: '2026-11-10' })).toEqual({
      view: 'night',
      canShowToday: false,
    });
    expect(chooseView({ now: at(15), stateKind: 'idle', bedtimeEarly: false, lastNightKey: null }).canShowToday).toBe(false);
  });

  it('shows Today right after "Up for the day", even before 7am', () => {
    expect(chooseView({ now: at(6, 15), stateKind: 'up', bedtimeEarly: false, lastNightKey: LAST_NIGHT }).view).toBe(
      'today',
    );
  });
});

describe('tonight vs last night', () => {
  const TONIGHT = '2026-11-17';
  it('a bedtime started this afternoon stays on the night screen, even once asleep', () => {
    expect(chooseView({ now: at(16, 30), stateKind: 'asleep', bedtimeEarly: false, lastNightKey: LAST_NIGHT }).view).toBe(
      'night',
    );
  });
  it('a baby still asleep in the morning keeps the night screen until "Up for the day"', () => {
    for (const h of [7, 8, 10]) {
      const now = new Date(2026, 10, 17, h, 30).getTime();
      expect(chooseView({ now, stateKind: 'asleep', bedtimeEarly: false, lastNightKey: LAST_NIGHT })).toEqual({
        view: 'night',
        canShowToday: false,
      });
      expect(chooseView({ now, stateKind: 'up', bedtimeEarly: false, lastNightKey: LAST_NIGHT }).view).toBe('today');
    }
  });
  it("only counts tonight's key as last night before 11am", () => {
    expect(isPastNight(LAST_NIGHT, at(16))).toBe(true);
    expect(isPastNight(TONIGHT, at(16))).toBe(false);
    expect(isPastNight(LAST_NIGHT, new Date(2026, 10, 17, 9).getTime())).toBe(true);
  });
});
