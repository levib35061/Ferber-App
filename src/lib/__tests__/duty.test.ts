import { alertsOnThisPhone, dutyFor, partnerId } from '../duty';

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
