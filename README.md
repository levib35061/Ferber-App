# Ferber

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

**Milestone 1 (timer you can use tonight) — code done, needs a real-iPhone test**

- [x] Ferber default chart + `nextWaitMinutes` with unit tests
- [x] Night screen states: idle → waiting → due → in the room → asleep → woke up
- [x] Countdown derived from stored timestamps (survives force-quit)
- [x] Local check-in notification, rescheduled after every tap
- [x] Night-mode UI, keep-awake while waiting, haptics, 10-second Undo
- [x] SQLite storage (pulled forward from M2 so force-quit works)
- [x] Basic History list and Settings (sound, haptics, keep-awake, test alert)
- [ ] **On-device acceptance test** — see below

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
