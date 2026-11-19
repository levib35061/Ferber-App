import { FERBER_DEFAULT_CHART } from '../ferber';
import { NightEvent, EventType, allowedActions, deriveNightState, episodes } from '../session';
import { summarizeNight } from '../summary';

const MIN = 60_000;
const T0 = Date.UTC(2026, 10, 16, 2, 0); // arbitrary
let n = 0;
const ev = (type: EventType, minute: number, deleted = false): NightEvent => ({
  id: `e${n++}`,
  nightId: 'n1',
  type,
  at: T0 + minute * MIN,
  deletedAt: deleted ? T0 : null,
});
const chart = FERBER_DEFAULT_CHART;

describe('deriveNightState', () => {
  it('is idle with no events', () => {
    expect(deriveNightState([], chart, 1, T0).kind).toBe('idle');
  });

  it('is quiet (no timer) after Down until crying starts', () => {
    const s = deriveNightState([ev('down', 0)], chart, 1, T0 + 10 * MIN);
    expect(s).toMatchObject({ kind: 'quiet', checkInNumber: 1, cryingMs: 0 });
    expect(allowedActions(s)).toEqual(['cry', 'asleep', 'feed_start', 'up']);
  });

  it('counts down to the first check-in from when crying started', () => {
    const s = deriveNightState([ev('down', 0), ev('cry', 4)], chart, 1, T0 + 5 * MIN);
    expect(s).toMatchObject({
      kind: 'waiting',
      checkInNumber: 1,
      waitMinutes: 3,
      nextCheckInAt: T0 + 7 * MIN,
      cryingMs: 1 * MIN,
    });
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
    expect(deriveNightState(evs, chart, 1, T0 + 10 * MIN)).toMatchObject({
      kind: 'quiet',
      checkInNumber: 1,
      cryingMs: 2 * MIN,
    });
    evs.push(ev('cry', 12));
    expect(deriveNightState(evs, chart, 1, T0 + 13 * MIN)).toMatchObject({
      kind: 'waiting',
      checkInNumber: 1,
      waitMinutes: 3,
      nextCheckInAt: T0 + 15 * MIN,
      cryingMs: 3 * MIN,
    });
  });

  it('pausing after a check-in keeps the check-in count', () => {
    const evs = [ev('down', 0), ev('cry', 0), ev('check_in_start', 3), ev('check_in_end', 4), ev('quiet', 6), ev('cry', 20)];
    expect(deriveNightState(evs, chart, 1, T0 + 21 * MIN)).toMatchObject({
      kind: 'waiting',
      checkInNumber: 2,
      waitMinutes: 5,
      nextCheckInAt: T0 + 25 * MIN,
    });
  });

  it('is in the room after a check-in start, and the next wait runs from Back out', () => {
    const evs = [ev('down', 0), ev('cry', 0), ev('check_in_start', 3)];
    expect(deriveNightState(evs, chart, 1, T0 + 4 * MIN)).toMatchObject({ kind: 'in_room', checkInNumber: 1 });
    evs.push(ev('check_in_end', 4));
    expect(deriveNightState(evs, chart, 1, T0 + 5 * MIN)).toMatchObject({
      kind: 'waiting',
      checkInNumber: 2,
      waitMinutes: 5,
      nextCheckInAt: T0 + 9 * MIN,
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
    const evs = [
      ev('down', 0),
      ev('cry', 0),
      ev('check_in_start', 3),
      ev('check_in_end', 4),
      ev('asleep', 8),
      ev('woke', 200),
    ];
    expect(deriveNightState(evs, chart, 3, T0 + 201 * MIN)).toMatchObject({
      kind: 'waiting',
      checkInNumber: 1,
      waitMinutes: 10,
    });
  });

  it('ignores soft-deleted events (undo)', () => {
    const evs = [ev('down', 0), ev('cry', 0), ev('asleep', 5, true)];
    expect(deriveNightState(evs, chart, 1, T0 + 6 * MIN).kind).toBe('due');
  });

  it('is asleep after Asleep and offers Woke up or a night feed', () => {
    const s = deriveNightState([ev('down', 0), ev('asleep', 12)], chart, 1, T0 + 20 * MIN);
    expect(s.kind).toBe('asleep');
    expect(allowedActions(s)).toEqual(['woke', 'feed_start', 'up']);
  });
});

describe('up for the day', () => {
  it('ends the night from sleep, from a waking, or from settling', () => {
    expect(deriveNightState([ev('down', 0), ev('asleep', 10), ev('up', 600)], chart, 1, T0 + 601 * MIN)).toMatchObject({
      kind: 'up',
    });
    const early = [ev('down', 0), ev('asleep', 10), ev('woke', 560), ev('up', 575)];
    expect(deriveNightState(early, chart, 1, T0 + 600 * MIN)).toMatchObject({ kind: 'up', since: T0 + 575 * MIN });
    expect(summarizeNight(early).cryingMinutes).toBe(15);
    expect(allowedActions({ kind: 'up', since: 0 })).toEqual([]);
  });
  it('is offered while asleep and during a waking', () => {
    expect(allowedActions(deriveNightState([ev('down', 0), ev('asleep', 10)], chart, 1, T0 + 20 * MIN))).toContain('up');
    expect(allowedActions(deriveNightState([ev('woke', 0)], chart, 1, T0 + MIN))).toContain('up');
  });
});

describe('night feeds', () => {
  it('feeding stops the timer; done feeding goes back to quiet', () => {
    const evs = [ev('woke', 0), ev('feed_start', 2)];
    expect(deriveNightState(evs, chart, 2, T0 + 10 * MIN)).toMatchObject({
      kind: 'feeding',
      since: T0 + 2 * MIN,
      cryingMs: 2 * MIN,
    });
    evs.push(ev('feed_end', 20));
    const s = deriveNightState(evs, chart, 2, T0 + 21 * MIN);
    expect(s).toMatchObject({ kind: 'quiet', checkInNumber: 1, cryingMs: 2 * MIN });
    expect(allowedActions(s)).toContain('feed_start');
  });

  it('after a feed the waits start again from the first interval', () => {
    const evs = [
      ev('down', 0),
      ev('cry', 0),
      ev('check_in_start', 5),
      ev('check_in_end', 6),
      ev('check_in_start', 16),
      ev('check_in_end', 17),
      ev('feed_start', 20),
      ev('feed_end', 35),
      ev('cry', 40),
    ];
    expect(deriveNightState(evs, chart, 2, T0 + 41 * MIN)).toMatchObject({
      kind: 'waiting',
      checkInNumber: 1,
      waitMinutes: 5,
      nextCheckInAt: T0 + 45 * MIN,
    });
  });

  it('a feed while asleep starts a new episode, counted as a waking, and feeding time is not crying', () => {
    const evs = [
      ev('down', 0),
      ev('cry', 0),
      ev('asleep', 10),
      ev('feed_start', 300),
      ev('feed_end', 320),
      ev('cry', 322),
      ev('asleep', 330),
    ];
    expect(episodes(evs)).toHaveLength(2);
    expect(summarizeNight(evs)).toMatchObject({ cryingMinutes: 10 + 8, wakings: 1, checkIns: 0 });
  });

  it('a feed in the middle of a waking stays in that episode', () => {
    const evs = [
      ev('down', 0),
      ev('asleep', 5),
      ev('woke', 100),
      ev('feed_start', 103),
      ev('feed_end', 118),
      ev('asleep', 125),
    ];
    expect(episodes(evs)).toHaveLength(2);
    expect(summarizeNight(evs)).toMatchObject({ cryingMinutes: 3, wakings: 1 });
  });
});

describe('summarizeNight', () => {
  it('counts crying and check-in time but not quiet settling', () => {
    const evs = [
      // settle quietly 5 min, cry 15 (incl. a 2-min check-in) -> 15
      ev('down', 0),
      ev('cry', 5),
      ev('check_in_start', 8),
      ev('check_in_end', 10),
      ev('asleep', 20),
      // waking: cry 10, in room 1, quiet 4, cry 1 -> 12
      ev('woke', 300),
      ev('check_in_start', 310),
      ev('check_in_end', 311),
      ev('quiet', 311),
      ev('cry', 315),
      ev('asleep', 316),
      // waking: 2 min
      ev('woke', 400),
      ev('asleep', 402),
    ];
    expect(episodes(evs)).toHaveLength(3);
    expect(summarizeNight(evs)).toEqual({
      cryingMinutes: 15 + 12 + 2,
      checkIns: 2,
      wakings: 2,
      longestEpisodeMinutes: 15,
      episodeCount: 3,
    });
  });

  it('a baby who settles without crying has 0 crying minutes', () => {
    expect(summarizeNight([ev('down', 0), ev('asleep', 25)]).cryingMinutes).toBe(0);
  });

  it('a check-in added while quiet counts crying from when the quiet stretch began', () => {
    expect(
      summarizeNight([ev('down', 0), ev('check_in_start', 6), ev('check_in_end', 7), ev('asleep', 10)]).cryingMinutes,
    ).toBe(10);
  });
});

describe('wait a little longer', () => {
  it('is only offered when a check-in is due', () => {
    const waiting = deriveNightState([ev('down', 0), ev('cry', 0)], chart, 1, T0 + 1 * MIN);
    const due = deriveNightState([ev('down', 0), ev('cry', 0)], chart, 1, T0 + 4 * MIN);
    expect(allowedActions(waiting)).not.toContain('wait_more');
    expect(allowedActions(due)).toContain('wait_more');
  });

  it('starts the next, longer wait without counting a check-in', () => {
    // Night 1: 3, 5, 10. Crying at 0, due at 3, "wait longer" at 4.
    const events = [ev('down', 0), ev('cry', 0), ev('wait_more', 4)];
    const s = deriveNightState(events, chart, 1, T0 + 5 * MIN);
    expect(s).toMatchObject({ kind: 'waiting', waitMinutes: 5, checkInNumber: 1, waitStartedAt: T0 + 4 * MIN });
    expect(s).toMatchObject({ nextCheckInAt: T0 + 9 * MIN, cryingMs: 5 * MIN });
    expect(summarizeNight(events).checkIns).toBe(0);
  });

  it('keeps counting real check-ins after a skipped one', () => {
    const events = [ev('down', 0), ev('cry', 0), ev('wait_more', 4), ev('check_in_start', 9), ev('check_in_end', 10)];
    const s = deriveNightState(events, chart, 1, T0 + 11 * MIN);
    expect(s).toMatchObject({ kind: 'waiting', waitMinutes: 10, checkInNumber: 2 });
    expect(summarizeNight(events).checkIns).toBe(1);
  });

  it('marks night wakings', () => {
    expect(deriveNightState([ev('down', 0), ev('cry', 0)], chart, 1, T0 + MIN)).toMatchObject({ waking: false });
    expect(deriveNightState([ev('down', 0), ev('asleep', 5), ev('woke', 60)], chart, 1, T0 + 61 * MIN)).toMatchObject({
      waking: true,
    });
  });
});

describe('the night as a state machine', () => {
  const C = FERBER_DEFAULT_CHART;
  it('two phones both tapping "Going in" count one check-in, and the next wait is unchanged', () => {
    const one = [ev('down', 0), ev('cry', 0), ev('check_in_start', 3), ev('check_in_end', 4)];
    const twice = [ev('down', 0), ev('cry', 0), ev('check_in_start', 3), ev('check_in_start', 3.2), ev('check_in_end', 4)];
    const a = deriveNightState(one, C, 1, T0 + 5 * MIN);
    const b = deriveNightState(twice, C, 1, T0 + 5 * MIN);
    expect(b).toEqual(a);
    expect(episodes(twice)[0].checkIns).toBe(1);
  });
  it('a check-in tapped during a feed is ignored', () => {
    const evs = [ev('down', 0), ev('cry', 0), ev('feed_start', 2), ev('check_in_start', 3)];
    expect(deriveNightState(evs, C, 1, T0 + 4 * MIN).kind).toBe('feeding');
    expect(episodes(evs)[0].checkIns).toBe(0);
  });
  it('every state offers only actions that move the night on (no dead ends before Up)', () => {
    for (const kind of ['idle', 'quiet', 'waiting', 'due', 'in_room', 'feeding', 'asleep'] as const) {
      expect(allowedActions({ kind } as never).length).toBeGreaterThan(0);
    }
    expect(allowedActions({ kind: 'up', since: 0 })).toEqual([]);
  });
});
