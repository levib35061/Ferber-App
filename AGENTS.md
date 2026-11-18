This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## This project: Ferber sleep-training app

The product spec is `docs/SPEC.md`. Read it before changing behavior.

- iPhone only (v1). No custom native Swift. Only Expo-compatible libraries.
- Routes live in `src/app/`. Pure logic lives in `src/lib/` (no React Native imports) and has Jest tests in `src/lib/__tests__/`.
- `src/lib/ferber.ts` — interval chart + `nextWaitMinutes(chart, nightNumber, checkInsSoFarThisEpisode)`.
- `src/lib/session.ts` — derives the Night-screen state from the event log. Events are the source of truth; never store derived values.
- `wait_more` event ("Wait a little longer", only when a check-in is due): skips the check-in; the next, longer wait starts from the tap and it isn't counted as a check-in. New event types need a Supabase migration for `events_type_check`.
- `src/lib/encourage.ts` + `morningNote` in `src/lib/morning.ts`: the short reassurance lines. Plain and true, never cheerful, never judgmental; grounded in Ferber's wording (a check-in reassures, it isn't meant to stop the crying). No streaks, no red for bad nights.
- `src/lib/summary.ts` — crying minutes, check-ins, wakings. Crying time excludes quiet stretches: events `cry`/`quiet` mark crying start/stop; after `down` no wait runs until `cry` (see `walk()` in session.ts).
- App name: "Check In: Baby Sleep Timer" (display name "Check In"). Don't use "Ferber" in the app name (the App Store subtitle does use it: "Ferber Method Sleep Training", see `docs/APP_STORE.md`).
- `src/data/db.ts` — SQLite schema (baby, night, event, setting). UUID ids, UTC epoch-ms times, soft deletes (`deletedAt`).
- Accounts: the app needs no account for one phone. Starting or joining partner sharing creates a private anonymous Supabase account (`ensureUserId({ create: true })`); Sign in with Apple is optional and upgrades it in place via linkIdentity (`src/data/appleAuth.ts`). Other callers of `ensureUserId()` never create accounts (they throw `NeedsSignInError`). Supabase must have "Allow anonymous sign-ins" on. The session is stored in the Keychain (`src/data/supabase.ts`).
- Partner sync: `src/data/sync.ts` (SyncEngine: push dirty rows, pull by `server_updated_at` cursor, realtime triggers a pull) with Supabase (`src/data/supabase.ts`, `src/config.ts`, `supabase/schema.sql`). Every local write must go through `db.ts` so it sets `updatedAt`/`dirty` and calls `wrote()`. Night ids are deterministic (`nightIdFor`). Last write wins per row. Network test: `npm run test:sync`.
- Free trial: `src/lib/trial.ts` (2 free nights, counted from logged nights; starting a new night after that opens `/unlock`, never mid-night). `unlocked` in NightStore = dev toggle, or this phone's RevenueCat entitlement, or the server's family unlock.
- Purchases: one partner pays and the whole app family is unlocked. Only the `revenuecat-webhook` Edge Function writes `unlocks`; the app reads `my_unlock_status()` (SyncEngine.checkUnlock). Never let the client mark itself paid. Purchase code: `src/data/purchases.ts` (react-native-purchases; before buying/restoring it gives the phone a Supabase account and logs RevenueCat in with that id so the webhook knows who paid). Keys in `src/config.ts`; empty keys mean "purchases not open yet". Server: `docs/SERVER.md`.
- Account deletion goes through the `delete-account` Edge Function (revokes the Sign in with Apple token with Apple, then `delete_user_account()`, which only the server can call). After Apple sign-in the app sends the authorization code to `apple-token` (best effort). Shared Apple helpers: `supabase/functions/_shared/apple.ts` (tested) and `appleSign.ts` (Deno). The Supabase connector can deploy functions and apply migrations directly.
- Partner push: the app calls the `partner-push` Edge Function after uploading taps / duty changes; silent pushes run `src/data/background.ts` (sync + `reconcileAlarmFromDb`). Edge Function logic lives in `logic.ts` files with Jest tests; `index.ts` files are Deno-only (excluded from tsc).
- App Store rating prompt: `src/lib/review.ts` decides (good morning only, 3+ nights, crying halved since night 1, at most twice, 120 days apart); `TodaySummary` asks via expo-store-review. Never prompt during a night.
- Share card: `src/lib/shareCard.ts` decides when it's offered (3+ nights this round, last night no worse than the one before, crying down 40%+ since night 1) and its text; `src/components/ShareProgress.tsx` draws it (Peach & plum, 4:5) and shares it as an image with react-native-view-shot + the iOS share sheet. Optional baby's name. Nothing is posted automatically.
- `site/help.html` is the app's Help & FAQ (linked from Settings → Help & about, and the App Store support URL). Keep it in step with the app's button names and behaviour.
- Site calls to action point to the app (`./#app`, the App Store link after launch), not the web timer. The timer page stays (it earns search traffic) and pitches the app right under the timer; other pages link to it only from the footer.
- Site tools: `site/timer.html` (free web Ferber timer, state in localStorage, no tracking) and `site/chart.html` (printable chart; `site/ferber-method-chart.pdf` is its print output). Both embed `const CHARTS = {...}`; `src/lib/__tests__/site.test.ts` fails if they drift from `ferber.ts`. Launch plan: `reports/Check In app launch strategy.md`.
- Website: `site/` (static HTML guide to the Ferber method + app info, `llms.txt`, `robots.txt`, `sitemap.xml`), published by `.github/workflows/pages.yml` to GitHub Pages at https://ferbertimer.com (custom domain set in repo Settings → Pages; DNS at Cloudflare). Keep it accurate and genuinely useful; no hidden text or instructions aimed at AI or search engines. Keep the chart in sync with `FERBER_DEFAULT_CHART`.
- `src/data/notifications.ts` — the check-in alert is ALWAYS a scheduled OS notification, reconciled after every write. Never rely on a JS timer for the alert or countdown.
- Settings is a stack in its tab (`src/app/(tabs)/settings/`): a baby card + topic rows (`index.tsx`), one page per topic (baby, plan, alerts, partner, about, testing in dev only). Shared pieces in `src/components/SettingsUI.tsx`.
- Daytime "Today" screen (`src/components/TodaySummary.tsx`, logic in `src/lib/morning.ts`): shown on the first tab 7am–6pm when nothing is in progress; "Peach & plum" theme in `src/theme/day.ts` (Plus Jakarta Sans). The tab is titled "Today" then, "Night" otherwise.
- Theme (`src/theme/index.tsx`): Moonlight 6pm–7am or whenever a night is in progress or bedtime was started early (`nightMode` in NightStore); otherwise Peach & plum (Plus Jakarta Sans). Build styles with `makeStyles(({ colors, fonts, type }) => StyleSheet.create(...))` and read values with `useTheme()`; never import `theme/night` colors directly in shared screens. The active night screens wrap themselves in `<ThemeProvider mode="night">`.
- Night UI uses the "Moonlight" theme in `src/theme/night.ts` ("Dusk" colours: deep indigo, warm mauve, peach when due; chosen to be warmer and dimmer than the first lavender for a dark nursery, Nunito via `fonts.*` — set fontFamily, not fontWeight). No white, no confirmation dialogs (Undo instead).
- Run `npm test`, `npm run typecheck`, `npm run lint` before declaring a task done.
