import { activityFor, actionForTarget, sameActivity } from '../liveActivity';

const T = 1_000_000;

describe('Live Activity props', () => {
  it('counts down to the check-in and goes stale when it is due', () => {
    const plan = activityFor({
      kind: 'waiting',
      episodeStartAt: T,
      waitStartedAt: T,
      waitMinutes: 5,
      nextCheckInAt: T + 300_000,
      checkInNumber: 2,
      waking: false,
      cryingMs: 0,
    });
    expect(plan).toEqual({ props: { mode: 'waiting', checkIn: 2, since: T, dueAt: T + 300_000 }, staleAt: T + 300_000 });
  });
  it('covers the room, quiet and feed states, and nothing otherwise', () => {
    expect(
      activityFor({ kind: 'in_room', since: T, checkInNumber: 1, episodeStartAt: T, waking: false, cryingMs: 0 })?.props
        .mode,
    ).toBe('in_room');
    expect(activityFor({ kind: 'feeding', since: T, episodeStartAt: T, waking: true, cryingMs: 0 })?.props.mode).toBe(
      'feeding',
    );
    expect(activityFor({ kind: 'idle' })).toBeNull();
    expect(activityFor({ kind: 'up', since: T })).toBeNull();
  });
  it('maps button targets to events and ignores anything else', () => {
    expect(actionForTarget('check_in_start')).toBe('check_in_start');
    expect(actionForTarget('wait_more')).toBe('wait_more');
    expect(actionForTarget('down')).toBeNull();
    expect(actionForTarget(undefined)).toBeNull();
  });
  it('compares props', () => {
    const p = { mode: 'quiet' as const, checkIn: 1, since: T, dueAt: 0 };
    expect(sameActivity(p, { ...p })).toBe(true);
    expect(sameActivity(p, null)).toBe(false);
  });
});
