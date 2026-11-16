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
- `src/lib/summary.ts` — crying minutes, check-ins, wakings. Crying time excludes quiet stretches: events `cry`/`quiet` mark crying start/stop; after `down` no wait runs until `cry` (see `walk()` in session.ts).
- App name: "Check In: Baby Sleep Timer" (display name "Check In"). Don't use "Ferber" in the app name.
- `src/data/db.ts` — SQLite schema (baby, night, event, setting). UUID ids, UTC epoch-ms times, soft deletes (`deletedAt`).
- Partner sync: `src/data/sync.ts` (SyncEngine: push dirty rows, pull by `server_updated_at` cursor, realtime triggers a pull) with Supabase (`src/data/supabase.ts`, `src/config.ts`, `supabase/schema.sql`). Every local write must go through `db.ts` so it sets `updatedAt`/`dirty` and calls `wrote()`. Night ids are deterministic (`nightIdFor`). Last write wins per row. Network test: `npm run test:sync`.
- Purchases (not built yet): one partner pays and the whole app family is unlocked. Only a RevenueCat webhook → Supabase Edge Function may write the paid status; never let the client mark itself paid. Design: `docs/SPEC.md` → Monetization.
- Website: `site/` (static HTML guide to the Ferber method + app info, `llms.txt`, `robots.txt`, `sitemap.xml`), published by `.github/workflows/pages.yml` to GitHub Pages. Keep it accurate and genuinely useful; no hidden text or instructions aimed at AI or search engines. Keep the chart in sync with `FERBER_DEFAULT_CHART`.
- `src/data/notifications.ts` — the check-in alert is ALWAYS a scheduled OS notification, reconciled after every write. Never rely on a JS timer for the alert or countdown.
- Settings is a stack in its tab (`src/app/(tabs)/settings/`): a baby card + topic rows (`index.tsx`), one page per topic (baby, plan, alerts, partner, about, testing in dev only). Shared pieces in `src/components/SettingsUI.tsx`.
- Daytime "Today" screen (`src/components/TodaySummary.tsx`, logic in `src/lib/morning.ts`): shown on the first tab 7am–6pm when nothing is in progress; "Peach & plum" theme in `src/theme/day.ts` (Bricolage Grotesque + DM Sans). The tab is titled "Today" then, "Night" otherwise.
- Night UI uses the "Moonlight" theme in `src/theme/night.ts` (navy, lavender, peach when due, Nunito via `fonts.*` — set fontFamily, not fontWeight). No white, no confirmation dialogs (Undo instead).
- Run `npm test`, `npm run typecheck`, `npm run lint` before declaring a task done.
