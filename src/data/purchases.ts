/**
 * The one-time unlock, through RevenueCat (react-native-purchases).
 *
 * - Before buying or restoring, the phone gets a Supabase account (a private
 *   anonymous one if it has none) and RevenueCat is logged in with that id.
 *   That's how the server learns who paid, so a partner is unlocked too
 *   (revenuecat-webhook writes `unlocks`; the app only ever reads it).
 * - This phone's own entitlement comes from RevenueCat's verified customer
 *   info, cached by its SDK, so the buyer stays unlocked offline.
 * - With no API key in config.ts, purchases are simply "not open yet".
 * - In Expo Go the library runs in its preview mode: nothing can be bought.
 */
import Purchases, { PURCHASES_ERROR_CODE, PurchasesPackage } from 'react-native-purchases';

import { REVENUECAT_API_KEY } from '../config';
import { ensureUserId, supabase } from './supabase';

/** The entitlement configured in RevenueCat (same name as in the webhook). */
export const ENTITLEMENT = 'unlock';

export const purchasesOpen = REVENUECAT_API_KEY.length > 0;

type Listener = (owned: boolean) => void;
const listeners = new Set<Listener>();
let owned = false;
let started = false;

function setOwned(v: boolean) {
  if (v === owned) return;
  owned = v;
  listeners.forEach((fn) => fn(v));
}

export function ownsUnlock(): boolean {
  return owned;
}

export function onUnlockChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Call once at launch. Safe to call again. Never throws. */
export async function startPurchases(): Promise<void> {
  if (!purchasesOpen || started) return;
  started = true;
  try {
    const { data } = await supabase.auth.getSession();
    Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: data.session?.user.id ?? null });
    Purchases.addCustomerInfoUpdateListener((info) => setOwned(!!info.entitlements.active[ENTITLEMENT]));
    const info = await Purchases.getCustomerInfo();
    setOwned(!!info.entitlements.active[ENTITLEMENT]);
  } catch {
    started = false; // try again next launch
  }
}

/** Tie RevenueCat to this phone's account (after sign-in, or before buying). */
async function identify(): Promise<void> {
  const userId = await ensureUserId({ create: true });
  await Purchases.logIn(userId);
}

/** After signing in or starting to share: keep RevenueCat on the same account. Never throws. */
export async function syncPurchaseAccount(): Promise<void> {
  if (!purchasesOpen || !started) return;
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) await Purchases.logIn(data.session.user.id);
  } catch {
    // Not critical; the next purchase or restore identifies again.
  }
}

async function unlockPackage(): Promise<PurchasesPackage | null> {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages[0] ?? null;
}

/** The store's own price text (e.g. "$4.99", or the local currency), or null if it can't be loaded. */
export async function unlockPrice(): Promise<string | null> {
  if (!purchasesOpen) return null;
  try {
    await startPurchases();
    return (await unlockPackage())?.product.priceString ?? null;
  } catch {
    return null;
  }
}

export type BuyResult = 'bought' | 'cancelled';

/** Buy the unlock. Throws an Error with a message fit to show. */
export async function buyUnlock(): Promise<BuyResult> {
  await startPurchases();
  try {
    await identify();
    const pkg = await unlockPackage();
    if (!pkg) throw new Error("The unlock isn't available right now. Please try again in a little while.");
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    setOwned(!!customerInfo.entitlements.active[ENTITLEMENT]);
    return 'bought';
  } catch (e) {
    const err = e as { code?: string; userCancelled?: boolean; message?: string };
    if (err.userCancelled || err.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return 'cancelled';
    throw new Error(friendly(err));
  }
}

/** Restore a past purchase. Returns whether the unlock is owned afterwards. */
export async function restoreUnlock(): Promise<boolean> {
  await startPurchases();
  try {
    await identify();
    const info = await Purchases.restorePurchases();
    setOwned(!!info.entitlements.active[ENTITLEMENT]);
    return owned;
  } catch (e) {
    throw new Error(friendly(e as { code?: string; message?: string }));
  }
}

function friendly(err: { code?: string; message?: string }): string {
  switch (err.code) {
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
    case PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR:
      return "Couldn't reach the App Store. Check your signal and try again.";
    case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
      return "Purchases aren't allowed on this phone (check Screen Time restrictions).";
    case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
      return 'Your payment is pending approval. The app unlocks as soon as it goes through.';
    default:
      return err.message || 'Something went wrong. You were not charged. Please try again.';
  }
}
