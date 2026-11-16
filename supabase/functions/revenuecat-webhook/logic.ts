/**
 * RevenueCat webhook → changes to the `unlocks` table. Pure (no Deno or
 * network), so it's unit-tested with Jest.
 *
 * The app logs in to RevenueCat with the Supabase user id, so app user ids
 * are UUIDs. Anonymous RevenueCat ids ($RCAnonymousID:...) are ignored.
 * Docs: https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
 */

export interface RcEvent {
  id?: string;
  type: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  product_id?: string;
  entitlement_ids?: string[] | null;
  store?: string;
  environment?: string;
  cancel_reason?: string;
  transferred_from?: string[];
  transferred_to?: string[];
}

export interface UnlockChange {
  userId: string;
  productId: string;
  active: boolean;
  store: string | null;
  environment: string | null;
  eventId: string | null;
}

/** The entitlement configured in RevenueCat for the one-time unlock. */
export const ENTITLEMENT = 'unlock';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const GRANT = new Set(['INITIAL_PURCHASE', 'NON_RENEWING_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE']);
// For a one-time purchase, CANCELLATION means a refund; EXPIRATION means access ended.
const REVOKE = new Set(['CANCELLATION', 'EXPIRATION']);

function users(...lists: (string | string[] | undefined | null)[]): string[] {
  const out = new Set<string>();
  for (const l of lists) for (const id of Array.isArray(l) ? l : l ? [l] : []) if (UUID.test(id)) out.add(id.toLowerCase());
  return [...out];
}

function concernsUnlock(e: RcEvent): boolean {
  // TRANSFER events carry no entitlement list; everything else should name ours.
  if (e.type === 'TRANSFER') return true;
  return !e.entitlement_ids || e.entitlement_ids.length === 0 || e.entitlement_ids.includes(ENTITLEMENT);
}

export function changesFor(e: RcEvent): UnlockChange[] {
  if (!e || !concernsUnlock(e)) return [];
  const base = {
    productId: e.product_id ?? ENTITLEMENT,
    store: e.store ?? null,
    environment: e.environment ?? null,
    eventId: e.id ?? null,
  };
  if (GRANT.has(e.type)) {
    return users(e.app_user_id, e.original_app_user_id, e.aliases).map((userId) => ({ ...base, userId, active: true }));
  }
  if (REVOKE.has(e.type)) {
    return users(e.app_user_id, e.original_app_user_id, e.aliases).map((userId) => ({ ...base, userId, active: false }));
  }
  if (e.type === 'TRANSFER') {
    // Restore on a new account: the purchase moves from the old user(s) to the new one(s).
    const from = users(e.transferred_from).map((userId) => ({ ...base, productId: ENTITLEMENT, userId, active: false }));
    const to = users(e.transferred_to).map((userId) => ({ ...base, productId: ENTITLEMENT, userId, active: true }));
    return [...from, ...to];
  }
  return []; // TEST, BILLING_ISSUE, etc.
}

/** Constant-time comparison for the shared webhook secret. */
export function secretMatches(given: string | null, expected: string | undefined): boolean {
  if (!given || !expected) return false;
  const a = given.replace(/^Bearer\s+/i, '');
  if (a.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
