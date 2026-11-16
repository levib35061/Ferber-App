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

## RevenueCat (after Apple approval)

- Non-consumable product, e.g. `checkin_unlock`, $4.99, Family Sharing on (App Store Connect).
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

New users sign in with Apple before turning on partner sharing (no anonymous
sign-ups). The app asks Apple for no name or email.

- Supabase → Authentication → Sign In / Providers → **Apple** → enable, with
  **Client IDs**: `com.levibrown.checkin,host.exp.Exponent` (the second is Expo Go,
  for testing). No secret key is needed for the native sign-in.
- Then Supabase → Authentication → Sign In / Providers → turn **off** "Allow anonymous
  sign-ins". Existing anonymous test accounts keep working and can upgrade from
  Settings → Partner sharing.
- **Before App Store submission:** Apple requires revoking the Apple token when an
  account is deleted. That needs an Apple "Sign in with Apple" key (after approval);
  add a revoke step to account deletion then.

Login sessions are stored in the iOS Keychain (`src/data/supabase.ts`).
