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

  it('counts down to the first check-in after Down', () => {
    const s = deriveNightState([ev('down', 0)], chart, 1, T0 + 1 * MIN);
    expect(s).toMatchObject({ kind: 'waiting', checkInNumber: 1, waitMinutes: 3, nextCheckInAt: T0 + 3 * MIN });
  });

  it('becomes due once the wait has passed (e.g. after reopening the app)', () => {
    const s = deriveNightState([ev('down', 0)], chart, 1, T0 + 3 * MIN);
    expect(s.kind).toBe('due');
  });

  it('is in the room after a check-in start, and the next wait runs from Back out', () => {
    const evs = [ev('down', 0), ev('check_in_start', 3)];
    expect(deriveNightState(evs, chart, 1, T0 + 4 * MIN)).toMatchObject({ kind: 'in_room', checkInNumber: 1 });
    evs.push(ev('check_in_end', 4));
    expect(deriveNightState(evs, chart, 1, T0 + 5 * MIN)).toMatchObject({
      kind: 'waiting', checkInNumber: 2, waitMinutes: 5, nextCheckInAt: T0 + 9 * MIN,
    });
  });

  it('an early check-in ("Going in now") counts as a check-in', () => {
    const evs = [ev('down', 0), ev('check_in_start', 1), ev('check_in_end', 2)];
    expect(deriveNightState(evs, chart, 1, T0 + 2 * MIN)).toMatchObject({ checkInNumber: 2, waitMinutes: 5 });
  });

  it('third and later waits repeat the last interval', () => {
    const evs = [ev('down', 0)];
    for (let i = 0; i < 4; i++) evs.push(ev('check_in_start', 10 * i + 1), ev('check_in_end', 10 * i + 2));
    expect(deriveNightState(evs, chart, 2, T0 + 40 * MIN)).toMatchObject({ checkInNumber: 5, waitMinutes: 12 });
  });

  it('resets the check-in count for a night waking', () => {
    const evs = [ev('down', 0), ev('check_in_start', 3), ev('check_in_end', 4), ev('asleep', 8), ev('woke', 200)];
    expect(deriveNightState(evs, chart, 3, T0 + 201 * MIN)).toMatchObject({ kind: 'waiting', checkInNumber: 1, waitMinutes: 10 });
  });

  it('ignores soft-deleted events (undo)', () => {
    const evs = [ev('down', 0), ev('asleep', 5, true)];
    expect(deriveNightState(evs, chart, 1, T0 + 6 * MIN).kind).toBe('due');
  });

  it('is asleep after Asleep and only offers Woke up', () => {
    const s = deriveNightState([ev('down', 0), ev('asleep', 12)], chart, 1, T0 + 20 * MIN);
    expect(s.kind).toBe('asleep');
    expect(allowedActions(s)).toEqual(['woke']);
  });
});

describe('summarizeNight', () => {
  it('sums crying minutes including check-in time, counts check-ins and wakings', () => {
    const evs = [
      ev('down', 0), ev('check_in_start', 3), ev('check_in_end', 5), ev('asleep', 20),
      ev('woke', 300), ev('check_in_start', 310), ev('check_in_end', 311), ev('asleep', 315),
      ev('woke', 400), ev('asleep', 402),
    ];
    expect(episodes(evs)).toHaveLength(3);
    expect(summarizeNight(evs)).toEqual({
      cryingMinutes: 20 + 15 + 2, checkIns: 2, wakings: 2, longestEpisodeMinutes: 20, episodeCount: 3,
    });
  });
});
