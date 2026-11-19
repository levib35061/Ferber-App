import { deadTokens, messagesFor, visibleFor } from '../partner-push/logic';

const recipients = [
  { userId: 'me', tokens: ['tok-me'] },
  { userId: 'partner', tokens: ['tok-p1', 'tok-p2'] },
];

describe('partner push', () => {
  it('sends a silent sync to every partner phone, never to yourself', () => {
    const m = messagesFor({ actorId: 'me', babyName: 'Tommy', recipients, events: [{ type: 'check_in_start', at: 1 }] });
    expect(m.map((x) => x.to)).toEqual(['tok-p1', 'tok-p2']);
    expect(m[0]).toEqual({ to: 'tok-p1', data: { kind: 'sync' }, _contentAvailable: true, priority: 'normal' });
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

  it("names who logged it or handed off, when they've set a name", () => {
    expect(visibleFor([{ type: 'asleep', at: 2 }], 'Tommy', 'Grandma')?.body).toBe('Logged by Grandma.');
    expect(visibleFor([{ type: 'asleep', at: 2 }], 'Tommy')?.body).toBe('Logged by your partner.');
    const m = messagesFor({ actorId: 'me', actorName: 'Levi', babyName: 'Tommy', recipients, onDutyUserId: 'partner' });
    expect(m[0].body).toBe('Levi handed off to you. Open Check In so this phone gets the check-in alerts.');
  });

  it('finds dead tokens to remove', () => {
    const m = messagesFor({ actorId: 'me', babyName: null, recipients, events: [] });
    expect(deadTokens(m, [{ status: 'ok' }, { status: 'error', details: { error: 'DeviceNotRegistered' } }])).toEqual([
      'tok-p2',
    ]);
  });

  it('announces only recent taps; old ones (History edits, added nights) sync silently', () => {
    const now = 100 * 60_000;
    expect(visibleFor([{ type: 'asleep', at: now - 60_000 }], 'Tommy', null, now)?.title).toBe('Tommy is asleep');
    expect(visibleFor([{ type: 'asleep', at: now - 11 * 60_000 }], 'Tommy', null, now)).toBeNull();
    const m = messagesFor({ actorId: 'me', babyName: 'Tommy', recipients, events: [{ type: 'up', at: 0 }], now });
    expect(m.every((x) => x.title === undefined && x.priority === 'normal')).toBe(true);
  });
});
