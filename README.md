# Check In: Baby Sleep Timer

An iPhone app that tells parents when to check in during Ferber sleep training, logs each night, and shows whether crying time is dropping. See [`docs/SPEC.md`](docs/SPEC.md).

Built with Expo (React Native + TypeScript) and Expo Router. Builds go through EAS, so Xcode is never needed.

## Run it on your iPhone (Milestones 1–2, free, Expo Go)

On the Mac, the first time:

```bash
git clone <this repo> && cd Ferber-App
npm install
```

Each time:

```bash
git pull && npm install
npx expo start
```

Then scan the QR code with the iPhone camera to open the app in **Expo Go**. Edits reload live.

If the phone and Mac are on different networks, use `npx expo start --tunnel`.

## Checks

```bash
npm test            # Jest: interval logic, night state machine, summaries
npm run typecheck
npm run lint
```

## Status

**Milestone 1 (timer you can use tonight) — done, passed on a real iPhone**

- [x] Ferber default chart + `nextWaitMinutes` with unit tests
- [x] Night screen states: idle → waiting → due → in the room → asleep → woke up
- [x] Countdown derived from stored timestamps (survives force-quit)
- [x] Local check-in notification, rescheduled after every tap
- [x] Night-mode UI, keep-awake while waiting, haptics, 10-second Undo
- [x] SQLite storage (pulled forward from M2 so force-quit works)
- [x] Basic History list and Settings (sound, haptics, keep-awake, test alert)
- [x] On-device acceptance test (alerts with phone locked, force-quit recovery)
- [x] "Moonlight" look: navy, lavender progress ring, peach when a check-in is due, Nunito font

**Milestone 2 (tracking) — code done, needs a week of real nights**

- [x] Night detail: timeline of every tap, fix a time, delete a tap, add a missed tap, notes
- [x] Progress tab: crying minutes (or check-ins) per night, plus a trend line
- [x] Settings: interval chart editor (Ferber / Gentle / Custom, reset), baby name, start a new training round
- [ ] **Acceptance test:** log a full week of real nights, and check each night's numbers in History match a hand count

**Milestone 3 (real app features) — in progress**

- [x] First-launch onboarding: 3 intro cards + pediatrician note, baby name and birth date (under-6-months warning), notification explainer
- [x] `eas.json` build profiles (development, preview, production)
- [x] App icon (moon & check) and launch screen; source in `assets/icon-source.svg`
- [ ] Apple Developer account (enrollment pending)
- [x] App name: **Check In: Baby Sleep Timer** (home screen: "Check In")
- [x] Bundle ID: `com.levibrown.checkin`
- [ ] EAS development build on the phone
- [x] Supabase project + schema (`supabase/schema.sql`), row-level security
- [x] Partner sharing: invite code, join, two-way sync, realtime, offline catch-up (anonymous sign-in for now)
- [ ] Sign in with Apple (needs a development build)
- [x] Server code written and tested: `revenuecat-webhook`, `partner-push` (see `docs/SERVER.md`)
- [ ] Turn on: run migration 005, deploy the two functions, RevenueCat + push setup (after Apple approval)
- [x] Free trial (2 nights) and unlock screen (`src/app/unlock.tsx`, rules in `src/lib/trial.ts`); dev toggle in Settings → Testing
- [ ] RevenueCat one-time unlock ($4.99), restore purchases, Family Sharing (wire the unlock screen's buttons)
- [x] In-app "Delete my account and data" (Settings → Help & about; needs `supabase/migrations/004_delete_account.sql`)
- [ ] Shared unlock: one partner pays, the whole family is unlocked (design in `docs/SPEC.md` → Monetization)

### Testing Milestone 2 without waiting a week

In the app (development only, hidden in App Store builds): **Settings → Testing → Load a sample week**.
It erases logged nights and adds 7 sample nights ending last night. Tonight becomes night 8.
**Erase all nights** clears them again.

Expected numbers (check each night in History, and its timeline adds up):

| Night | Crying min | Check-ins | Wakings | Note |
| --- | --- | --- | --- | --- |
| 1 | 70 | 5 | 1 | yes |
| 2 | 55 | 4 | 1 | |
| 3 | 46 | 3 | 1 | |
| 4 | 28 | 1 | 1 | yes |
| 5 | 18 | 1 | 0 | |
| 6 | 9 | 0 | 0 | |
| 7 | 5 | 0 | 0 | |

Progress should say **"Crying time is down 93% since night 1."**

Then try: change a time in a night (its crying minutes should change to match), delete a tap, add a missed tap, write a note, and switch the chart preset.

### Partner sharing

Settings → **Partner sharing** → **Invite my partner** shows an 8-character code. On the
partner's phone: Settings → Partner sharing → enter the code → **Join** (their phone's own
nights are replaced by the shared ones). Taps show up on the other phone within seconds
while the app is open, and taps made with no signal upload when it returns.

Until push notifications are added, a partner's phone that is **closed** keeps its own
scheduled alert; it catches up as soon as the app is opened.

Sync test against the real Supabase project (needs network): `npm run test:sync`.

### How crying time works

After **Down for the night** the app shows **Settling**: no timer runs until you tap **Crying**.
**Stopped crying** pauses a wait; the next **Crying** restarts that same check-in's wait.
**Woke up** starts the wait straight away. Crying minutes count only time spent crying or on a
check-in, not quiet settling. (This replaces the spec's original "Down to Asleep" definition.)

### Milestone 1 acceptance test (do this before building more)

1. Open the app, tap **Down for the night**, and allow notifications.
2. Lock the phone. The alert should arrive within 5 seconds of the countdown (3 min on night 1).
3. Tap the alert, tap **I'm going in**, then **Back out**. Lock again. Repeat for 3 check-ins.
4. While a wait is running, force-quit the app (swipe up) and reopen it. The countdown should still be right.
5. Settings → **Send a test alert in 5 seconds**, then lock the phone.

**Known Expo Go limits:** the *time-sensitive* level (breaking through Focus/Sleep) needs the entitlement in `app.json`, which only takes effect in an EAS build (Milestone 3). In Expo Go, turn off Sleep Focus while testing, or allow Expo Go in that Focus. The alert uses the default iOS sound for now; a soft custom sound also needs an EAS build.

## Before launch

- Change `ios.bundleIdentifier` in `app.json` (currently `com.example.ferber`).
- Verify the default Ferber chart against the book (`src/lib/ferber.ts`).
