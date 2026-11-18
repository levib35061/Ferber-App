/**
 * Public app configuration. The Supabase publishable key is designed to ship
 * inside the app; data is protected by row-level security (supabase/schema.sql).
 * Never put the secret / service_role key here.
 */
export const SUPABASE_URL = 'https://xtqtrclokyimnqmgayiw.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_OIrvxAzhhUstkuhlSEtLGg_tjj-sDpJ';

/**
 * RevenueCat public SDK keys (safe to ship; never put a secret `sk_` key here).
 * - TEST: the "Test Store" key, used in development builds only. RevenueCat
 *   refuses it in App Store builds on purpose.
 * - IOS: the App Store key (starts with `appl_`), added after Apple approval.
 * Empty means purchases aren't open yet.
 */
/**
 * Screenshot builds only (the "screenshots" profile in eas.json): shows the
 * Testing page so a sample week can be loaded on a simulator. Never set in
 * App Store builds.
 */
export const DEMO_TOOLS = process.env.EXPO_PUBLIC_DEMO_TOOLS === '1';

const REVENUECAT_TEST_KEY = 'test_KZsSLpbqdfkbWUpuGEsgbuhRxAf';
const REVENUECAT_IOS_KEY = '';
export const REVENUECAT_API_KEY = __DEV__ ? REVENUECAT_TEST_KEY || REVENUECAT_IOS_KEY : REVENUECAT_IOS_KEY;
