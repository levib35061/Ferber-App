import { changesFor, secretMatches } from '../revenuecat-webhook/logic';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';

describe('RevenueCat webhook → unlocks', () => {
  it('a purchase unlocks the buyer', () => {
    const c = changesFor({
      type: 'NON_RENEWING_PURCHASE',
      app_user_id: A,
      product_id: 'checkin_unlock',
      entitlement_ids: ['unlock'],
      environment: 'SANDBOX',
      id: 'e1',
    });
    expect(c).toEqual([
      { userId: A, productId: 'checkin_unlock', active: true, store: null, environment: 'SANDBOX', eventId: 'e1' },
    ]);
  });

  it('a refund (cancellation) takes it away', () => {
    expect(
      changesFor({ type: 'CANCELLATION', app_user_id: A, product_id: 'checkin_unlock', entitlement_ids: ['unlock'] })[0].active,
    ).toBe(false);
  });

  it('a restore on a new account moves the unlock', () => {
    const c = changesFor({ type: 'TRANSFER', transferred_from: [A], transferred_to: [B] });
    expect(c.map((x) => [x.userId, x.active])).toEqual([
      [A, false],
      [B, true],
    ]);
  });

  it('ignores anonymous RevenueCat ids, other entitlements and test events', () => {
    expect(changesFor({ type: 'INITIAL_PURCHASE', app_user_id: '$RCAnonymousID:abc', entitlement_ids: ['unlock'] })).toEqual([]);
    expect(changesFor({ type: 'INITIAL_PURCHASE', app_user_id: A, entitlement_ids: ['something_else'] })).toEqual([]);
    expect(changesFor({ type: 'TEST', app_user_id: A })).toEqual([]);
  });

  it('includes aliases, without duplicates', () => {
    const c = changesFor({
      type: 'INITIAL_PURCHASE',
      app_user_id: A,
      original_app_user_id: A,
      aliases: [A, B],
      entitlement_ids: ['unlock'],
    });
    expect(c.map((x) => x.userId).sort()).toEqual([A, B].sort());
  });

  it('checks the shared secret', () => {
    expect(secretMatches('s3cret', 's3cret')).toBe(true);
    expect(secretMatches('Bearer s3cret', 's3cret')).toBe(true);
    expect(secretMatches('nope', 's3cret')).toBe(false);
    expect(secretMatches(null, 's3cret')).toBe(false);
    expect(secretMatches('s3cret', undefined)).toBe(false);
  });
});
