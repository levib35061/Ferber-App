import { chooseView } from '../nightView';

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
    expect(chooseView({ now: at(6, 15), stateKind: 'up', bedtimeEarly: false, lastNightKey: LAST_NIGHT }).view).toBe('today');
  });
});
