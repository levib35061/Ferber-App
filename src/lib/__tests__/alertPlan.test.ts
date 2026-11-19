import { REPEAT_AFTER_MS, alertPlan } from '../alertPlan';
import type { NightState } from '../session';

const waiting = (next: number, kind: 'waiting' | 'due' = 'waiting'): NightState => ({
  kind,
  episodeStartAt: 0,
  waitStartedAt: 0,
  waitMinutes: 3,
  nextCheckInAt: next,
  checkInNumber: 2,
  waking: false,
  cryingMs: 0,
});

describe('alertPlan', () => {
  it('plans the check-in alert and one reminder 3 minutes later', () => {
    expect(alertPlan(waiting(1000))).toEqual([
      { kind: 'checkin', at: 1000, checkInNumber: 2 },
      { kind: 'repeat', at: 1000 + REPEAT_AFTER_MS, checkInNumber: 2 },
    ]);
    expect(REPEAT_AFTER_MS).toBe(180_000);
  });
  it('keeps the reminder while the check-in is due (the first alert was missed)', () => {
    expect(alertPlan(waiting(1000, 'due')).map((a) => a.kind)).toEqual(['checkin', 'repeat']);
  });
  it('plans nothing once the wait is over (in the room, asleep, feeding, quiet, up)', () => {
    for (const s of [
      { kind: 'idle' },
      { kind: 'in_room', since: 0, checkInNumber: 1, episodeStartAt: 0, waking: false, cryingMs: 0 },
      { kind: 'up', since: 0 },
    ] as NightState[]) {
      expect(alertPlan(s)).toEqual([]);
    }
  });
});
