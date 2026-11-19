import {
  alertsHere,
  alertsOnThisPhone,
  dutyFor,
  dutyHere,
  dutyLine,
  handOffTargets,
  isShared,
  memberName,
  partnerId,
  waitStartedBy,
} from '../duty';

describe('dutyFor', () => {
  it('is solo without a partner, whatever is stored', () => {
    expect(dutyFor('me-id', 'me-id', false)).toBe('solo');
  });
  it('is unset until someone takes it', () => {
    expect(dutyFor(null, 'me-id', true)).toBe('unset');
  });
  it("knows whether it's me or my partner", () => {
    expect(dutyFor('me-id', 'me-id', true)).toBe('me');
    expect(dutyFor('p-id', 'me-id', true)).toBe('partner');
  });
  it("treats an unknown own id as unset, so alerts aren't silenced by mistake", () => {
    expect(dutyFor('p-id', null, true)).toBe('unset');
  });
});

describe('alerts', () => {
  it('only the partner being on duty silences this phone', () => {
    expect(alertsOnThisPhone('solo')).toBe(true);
    expect(alertsOnThisPhone('unset')).toBe(true);
    expect(alertsOnThisPhone('me')).toBe(true);
    expect(alertsOnThisPhone('partner')).toBe(false);
  });
  it('finds the partner id', () => {
    expect(partnerId(['a', 'b'], 'a')).toBe('b');
    expect(partnerId(['a'], 'a')).toBeNull();
  });
});

describe('named family members', () => {
  const two = [
    { id: 'me', name: 'Levi' },
    { id: 'p', name: null },
  ];
  const four = [
    { id: 'me', name: 'Levi' },
    { id: 'mom', name: 'Sara' },
    { id: 'gma', name: 'Grandma' },
    { id: 'x', name: null },
  ];
  it('says who is on duty, by name when there is one', () => {
    expect(dutyLine('partner', 'gma', four)).toBe('Grandma is on duty · alerts off here');
    expect(dutyLine('partner', 'p', two)).toBe('Your partner is on duty · alerts off here');
    expect(dutyLine('partner', 'x', four)).toBe('Someone else is on duty · alerts off here');
    expect(dutyLine('me', 'me', four)).toBe("You're on duty tonight");
    expect(dutyLine('unset', null, four)).toBe("Who's on duty tonight?");
  });
  it('lists who to hand off to, named first, never yourself', () => {
    expect(handOffTargets(four, 'me').map((m) => m.id)).toEqual(['gma', 'mom', 'x']);
    expect(handOffTargets(two, 'me')).toEqual([{ id: 'p', name: null }]);
  });
  it('names a member, or a stand-in that fits the family size', () => {
    expect(memberName({ id: 'a', name: '  Sara ' }, 2)).toBe('Sara');
    expect(memberName(undefined, 2)).toBe('Your partner');
    expect(memberName({ id: 'a', name: '' }, 3)).toBe('Someone else');
  });
});

describe('alerts for whoever started the wait', () => {
  const waiting = { kind: 'waiting', waitStartedAt: 2000 };
  const events = [
    { at: 1000, createdBy: 'b', deletedAt: null },
    { at: 2000, createdBy: 'a', deletedAt: null },
  ];
  it('finds who tapped the step that started the running wait', () => {
    expect(waitStartedBy(events, waiting)).toBe('a');
    expect(waitStartedBy(events, { kind: 'due', waitStartedAt: 1000 })).toBe('b');
  });
  it('is nobody when no wait is running or the tap was undone', () => {
    expect(waitStartedBy(events, { kind: 'asleep' })).toBeNull();
    expect(waitStartedBy([{ at: 2000, createdBy: 'a', deletedAt: 5 }], waiting)).toBeNull();
  });
  it('keeps alerts on an off-duty phone that started the wait', () => {
    expect(alertsOnThisPhone('partner')).toBe(false);
    expect(alertsOnThisPhone('partner', true)).toBe(true);
    expect(alertsOnThisPhone('me', false)).toBe(true);
  });
});

describe('which phone rings (alertsHere)', () => {
  const fam = { userId: 'me', familyId: 'f', memberCount: 3, memberIds: ['me', 'p', 'g'] };
  const waiting = { kind: 'waiting', waitStartedAt: 2000 };
  const byPartner = [{ at: 2000, createdBy: 'p', deletedAt: null }];
  const byMe = [{ at: 2000, createdBy: 'me', deletedAt: null }];
  it('rings on the on-duty phone and on the phone that started the wait', () => {
    expect(alertsHere('me', fam, byPartner, waiting)).toBe(true);
    expect(alertsHere('p', fam, byPartner, waiting)).toBe(false);
    expect(alertsHere('p', fam, byMe, waiting)).toBe(true);
  });
  it("someone who left the family can't keep the others silent", () => {
    const left = { ...fam, memberCount: 2, memberIds: ['me', 'g'] };
    expect(dutyHere('p', left)).toBe('unset');
    expect(alertsHere('p', left, byPartner, waiting)).toBe(true);
  });
  it('alone (or members not known yet): always rings', () => {
    expect(isShared({ ...fam, memberCount: 1 })).toBe(false);
    expect(alertsHere('p', { ...fam, memberCount: 1 }, byPartner, waiting)).toBe(true);
    expect(dutyHere('p', { ...fam, memberIds: [] })).toBe('partner');
  });
});
