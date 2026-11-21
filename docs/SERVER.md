# Server setup (Supabase)

What runs on the server, and how to turn each piece on. Everything here is
already written and tested; the steps below just switch it on.

## Database

Run, in order, in Supabase → SQL Editor (already done: 001 schema, 002, 003, 004):

- `supabase/migrations/005_unlocks_and_push.sql`: shared unlock (`unlocks`,
  `my_unlock_status()`) and push tokens (`push_tokens`, `register_push_token()`).

A brand-new project runs `supabase/schema.sql` instead (it includes all migrations).

## Edge Functions

| Function | What it does | Verify JWT |
| --- | --- | --- |
| `revenuecat-webhook` | RevenueCat calls it on purchase / restore (transfer) / refund; it's the only writer of `unlocks`. If anyone in a family has an active unlock, the whole family is unlocked. | **Off** (RevenueCat can't send a Supabase login; it sends our shared secret instead) |
| `delete-account` | "Delete my account and data": revokes the Apple sign-in with Apple (if any), then deletes the account via `delete_user_account()` (server-only). | **On** |
| `apple-token` | After Sign in with Apple, swaps Apple's one-time code for a refresh token kept in `apple_tokens`, so deletion can revoke it. | **On** |
| `partner-push` | The app calls it after uploading taps or a duty hand-off; it sends the partner's phones a silent push (so a closed app re-syncs and fixes its alert) and, for "asleep", "up for the day" and "you're on duty", a quiet visible line. | **On** |

Logic is in each function's `logic.ts` (tested in `supabase/functions/__tests__/`);
`index.ts` is the thin Deno wrapper.

### Deploy (once, from the project folder on the Mac)

```bash
npx supabase login
```
```bash
npx supabase link --project-ref xtqtrclokyimnqmgayiw
```
```bash
npx supabase functions deploy revenuecat-webhook --no-verify-jwt --use-api
```
```bash
npx supabase functions deploy partner-push --use-api
```

### Secret for the webhook

Make a random secret:
```bash
openssl rand -hex 24
```
Put it in **both** places:
- Supabase → Edge Functions → Secrets → `REVENUECAT_WEBHOOK_AUTH` = the secret
- RevenueCat → Project → Integrations → Webhooks → URL
  `https://xtqtrclokyimnqmgayiw.supabase.co/functions/v1/revenuecat-webhook`,
  Authorization header value = the same secret

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to functions automatically.

## RevenueCat in the app

The purchase code is in `src/data/purchases.ts` and the unlock screen uses it as soon
as a key is set in `src/config.ts`:

- `REVENUECAT_TEST_KEY`: the **Test Store** key (RevenueCat → Apps & providers). Used in
  development builds only; lets you buy the unlock with no App Store setup.
- `REVENUECAT_IOS_KEY`: the App Store key (`appl_…`), after Apple approval.

Both are public SDK keys. Never put a secret (`sk_…`) key in the app.

In RevenueCat: entitlement **`unlock`**; product **`checkin_unlock`** attached to it; an
offering (the "current" one) with one package for that product. The app buys the first
package of the current offering.

Expo Go can't make purchases (the library runs in a preview mode there); test buying in
the development build.

## RevenueCat (after Apple approval)

- Non-consumable product, e.g. `checkin_unlock`, $2.99, Family Sharing on (App Store Connect).
- RevenueCat entitlement id: **`unlock`** (the webhook only acts on this one).
- The app logs in to RevenueCat with the Supabase user id (so webhook ids match `auth.users`).

## Push (after Apple approval)

- `npx eas-cli@latest init` adds the EAS project id to app.json (push tokens need it).
- EAS creates the Apple push key during the first build; Expo's push service delivers.
- Background pushes are enabled in app.json (`expo-notifications` → `enableBackgroundRemoteNotifications`).
- iOS may throttle silent pushes (Apple suggests a few per hour), so they're best effort;
  the on-duty phone's own scheduled alert is always the primary alarm, and opening the
  app always catches up.

## Sign in with Apple (partner sharing accounts)

Sign in with Apple is optional. Starting or joining partner sharing makes a private
anonymous account; signing in with Apple upgrades it in place (keeps the family and
nights) so it survives a reinstall or a new phone. The app asks Apple for no name or email.

- Supabase → Authentication → Sign In / Providers → **Apple** → enable, with
  **Client IDs**: `com.levibrown.checkin,host.exp.Exponent` (the second is Expo Go,
  for testing). No secret key is needed for the native sign-in.
- Supabase → Authentication → Sign In / Providers → "Allow anonymous sign-ins" must be
  **on**. Supabase limits anonymous sign-ups per IP address (Authentication → Rate Limits).
- **Revoking Apple sign-ins on account deletion** (Apple's requirement) is built and
  deployed: the app sends Apple's one-time code to `apple-token` after signing in, which
  stores a refresh token in `apple_tokens` (server-only); `delete-account` revokes it with
  Apple, then deletes the account. Until the key below is set, both skip the Apple step.

### After Apple approval: the Sign in with Apple key

1. Apple Developer → Certificates, Identifiers & Profiles → **Keys** → **+** → name it
   "Check In sign-in", tick **Sign in with Apple**, Configure → primary App ID
   `com.levibrown.checkin` → Save → Continue → Register → **Download** the `.p8` file
   (Apple lets you download it only once). Note the **Key ID**, and your **Team ID**
   (top right of the developer site).
2. Set the secrets (Claude can do this with the Supabase connector, or in Terminal):
   `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` (the whole `.p8` file, including
   the BEGIN/END lines). `APPLE_CLIENT_ID` defaults to `com.levibrown.checkin`.
3. Sign in with Apple once on the development build; `apple_tokens` should get a row.

Login sessions are stored in the iOS Keychain (`src/data/supabase.ts`).

## Security Advisor: expected warnings

After migration 006, these warnings remain on purpose:

- **Signed-In Users Can Execute SECURITY DEFINER Function** for `create_family`, `join_family`, `delete_my_account`, `my_unlock_status`, `register_push_token` and `is_family_member`. The app calls these on purpose. Each one checks `auth.uid()` and only touches the caller's own data or family.
- **Leaked Password Protection Disabled**: the app has no passwords (Sign in with Apple only).
