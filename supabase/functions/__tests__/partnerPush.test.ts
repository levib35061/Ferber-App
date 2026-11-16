import { deadTokens, messagesFor, visibleFor } from '../partner-push/logic';

const recipients = [
  { userId: 'me', tokens: ['tok-me'] },
  { userId: 'partner', tokens: ['tok-p1', 'tok-p2'] },
];

describe('partner push', () => {
  it('sends a silent sync to every partner phone, never to yourself', () => {
    const m = messagesFor({ actorId: 'me', babyName: 'Tommy', recipients, events: [{ type: 'check_in_start', at: 1 }] });
    expect(m.map((x) => x.to)).toEqual(['tok-p1', 'tok-p2']);
    expect(m[0]).toEqual({ to: 'tok-p1', data: { kind: 'sync' }, _contentAvailable: true, priority: 'high' });
  });

  it('shows a quiet line for asleep and up-for-the-day (latest wins)', () => {
    expect(
      visibleFor(
        [
          { type: 'cry', at: 1 },
          { type: 'asleep', at: 2 },
        ],
        'Tommy',
      )?.title,
    ).toBe('Tommy is asleep');
    expect(
      visibleFor(
        [
          { type: 'asleep', at: 2 },
          { type: 'up', at: 3 },
        ],
        '',
      )?.title,
    ).toBe('Baby is up for the day');
    expect(visibleFor([{ type: 'check_in_end', at: 1 }], 'Tommy')).toBeNull();
    const m = messagesFor({ actorId: 'me', babyName: 'Tommy', recipients, events: [{ type: 'asleep', at: 5 }] });
    expect(m[0].title).toBe('Tommy is asleep');
  });

  it("tells the new on-duty parent they're on", () => {
    const m = messagesFor({ actorId: 'me', babyName: 'Tommy', recipients, onDutyUserId: 'partner' });
    expect(m.every((x) => x.title === "You're on duty tonight")).toBe(true);
    const handBack = messagesFor({ actorId: 'me', babyName: 'Tommy', recipients, onDutyUserId: 'me' });
    expect(handBack.every((x) => x.title === undefined)).toBe(true); // partner just syncs silently
  });

  it('finds dead tokens to remove', () => {
    const m = messagesFor({ actorId: 'me', babyName: null, recipients, events: [] });
    expect(deadTokens(m, [{ status: 'ok' }, { status: 'error', details: { error: 'DeviceNotRegistered' } }])).toEqual(['tok-p2']);
  });
});
