import { FERBER_DEFAULT_CHART } from '../ferber';
import { NightEvent, EventType, allowedActions, deriveNightState, episodes } from '../session';
import { summarizeNight } from '../summary';

const MIN = 60_000;
const T0 = Date.UTC(2026, 10, 16, 2, 0); // arbitrary
let n = 0;
const ev = (type: EventType, minute: number, deleted = false): NightEvent => ({
  id: `e${n++}`, nightId: 'n1', type, at: T0 + minute * MIN, deletedAt: deleted ? T0 : null,
});
const chart = FERBER_DEFAULT_CHART;

describe('deriveNightState', () => {
  it('is idle with no events', () => {
    expect(deriveNightState([], chart, 1, T0).kind).toBe('idle');
  });

  it('is quiet (no timer) after Down until crying starts', () => {
    const s = deriveNightState([ev('down', 0)], chart, 1, T0 + 10 * MIN);
    expect(s).toMatchObject({ kind: 'quiet', checkInNumber: 1, cryingMs: 0 });
    expect(allowedActions(s)).toEqual(['cry', 'asleep']);
  });

  it('counts down to the first check-in from when crying started', () => {
    const s = deriveNightState([ev('down', 0), ev('cry', 4)], chart, 1, T0 + 5 * MIN);
    expect(s).toMatchObject({ kind: 'waiting', checkInNumber: 1, waitMinutes: 3, nextCheckInAt: T0 + 7 * MIN, cryingMs: 1 * MIN });
  });

  it('becomes due once the wait has passed (e.g. after reopening the app)', () => {
    const s = deriveNightState([ev('down', 0), ev('cry', 0)], chart, 1, T0 + 3 * MIN);
    expect(s.kind).toBe('due');
  });

  it('Woke up starts the wait straight away', () => {
    const s = deriveNightState([ev('woke', 0)], chart, 2, T0 + 1 * MIN);
    expect(s).toMatchObject({ kind: 'waiting', waitMinutes: 5, nextCheckInAt: T0 + 5 * MIN });
  });

  it('Stopped crying pauses; crying again restarts the same check-in wait', () => {
    const evs = [ev('down', 0), ev('cry', 1), ev('quiet', 3)];
    expect(deriveNightState(evs, chart, 1, T0 + 10 * MIN)).toMatchObject({ kind: 'quiet', checkInNumber: 1, cryingMs: 2 * MIN });
    evs.push(ev('cry', 12));
    expect(deriveNightState(evs, chart, 1, T0 + 13 * MIN)).toMatchObject({
      kind: 'waiting', checkInNumber: 1, waitMinutes: 3, nextCheckInAt: T0 + 15 * MIN, cryingMs: 3 * MIN,
    });
  });

  it('pausing after a check-in keeps the check-in count', () => {
    const evs = [ev('down', 0), ev('cry', 0), ev('check_in_start', 3), ev('check_in_end', 4), ev('quiet', 6), ev('cry', 20)];
    expect(deriveNightState(evs, chart, 1, T0 + 21 * MIN)).toMatchObject({ kind: 'waiting', checkInNumber: 2, waitMinutes: 5, nextCheckInAt: T0 + 25 * MIN });
  });

  it('is in the room after a check-in start, and the next wait runs from Back out', () => {
    const evs = [ev('down', 0), ev('cry', 0), ev('check_in_start', 3)];
    expect(deriveNightState(evs, chart, 1, T0 + 4 * MIN)).toMatchObject({ kind: 'in_room', checkInNumber: 1 });
    evs.push(ev('check_in_end', 4));
    expect(deriveNightState(evs, chart, 1, T0 + 5 * MIN)).toMatchObject({
      kind: 'waiting', checkInNumber: 2, waitMinutes: 5, nextCheckInAt: T0 + 9 * MIN,
    });
  });

  it('an early check-in ("Going in now") counts as a check-in', () => {
    const evs = [ev('down', 0), ev('cry', 0), ev('check_in_start', 1), ev('check_in_end', 2)];
    expect(deriveNightState(evs, chart, 1, T0 + 2 * MIN)).toMatchObject({ checkInNumber: 2, waitMinutes: 5 });
  });

  it('third and later waits repeat the last interval', () => {
    const evs = [ev('down', 0), ev('cry', 0)];
    for (let i = 0; i < 4; i++) evs.push(ev('check_in_start', 10 * i + 1), ev('check_in_end', 10 * i + 2));
    expect(deriveNightState(evs, chart, 2, T0 + 40 * MIN)).toMatchObject({ checkInNumber: 5, waitMinutes: 12 });
  });

  it('resets the check-in count for a night waking', () => {
    const evs = [ev('down', 0), ev('cry', 0), ev('check_in_start', 3), ev('check_in_end', 4), ev('asleep', 8), ev('woke', 200)];
    expect(deriveNightState(evs, chart, 3, T0 + 201 * MIN)).toMatchObject({ kind: 'waiting', checkInNumber: 1, waitMinutes: 10 });
  });

  it('ignores soft-deleted events (undo)', () => {
    const evs = [ev('down', 0), ev('cry', 0), ev('asleep', 5, true)];
    expect(deriveNightState(evs, chart, 1, T0 + 6 * MIN).kind).toBe('due');
  });

  it('is asleep after Asleep and only offers Woke up', () => {
    const s = deriveNightState([ev('down', 0), ev('asleep', 12)], chart, 1, T0 + 20 * MIN);
    expect(s.kind).toBe('asleep');
    expect(allowedActions(s)).toEqual(['woke']);
  });
});

describe('summarizeNight', () => {
  it('counts crying and check-in time but not quiet settling', () => {
    const evs = [
      // settle quietly 5 min, cry 15 (incl. a 2-min check-in) -> 15
      ev('down', 0), ev('cry', 5), ev('check_in_start', 8), ev('check_in_end', 10), ev('asleep', 20),
      // waking: cry 10, in room 1, quiet 4, cry 1 -> 12
      ev('woke', 300), ev('check_in_start', 310), ev('check_in_end', 311), ev('quiet', 311), ev('cry', 315), ev('asleep', 316),
      // waking: 2 min
      ev('woke', 400), ev('asleep', 402),
    ];
    expect(episodes(evs)).toHaveLength(3);
    expect(summarizeNight(evs)).toEqual({
      cryingMinutes: 15 + 12 + 2, checkIns: 2, wakings: 2, longestEpisodeMinutes: 15, episodeCount: 3,
    });
  });

  it('a baby who settles without crying has 0 crying minutes', () => {
    expect(summarizeNight([ev('down', 0), ev('asleep', 25)]).cryingMinutes).toBe(0);
  });

  it('a check-in added while quiet counts crying from when the quiet stretch began', () => {
    expect(summarizeNight([ev('down', 0), ev('check_in_start', 6), ev('check_in_end', 7), ev('asleep', 10)]).cryingMinutes).toBe(10);
  });
});
