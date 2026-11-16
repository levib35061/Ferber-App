# Ferber Sleep Training App — Build Spec (v1)

Nov 16, 2026 · @Levi

## Overview

An iPhone app that tells parents when to check in during Ferber sleep training, logs each night, and shows whether crying time is dropping. Both parents share one baby's data. Version 1 ships on the App Store as a free download with a one-time unlock.

**Who it's for:** parents of babies about 6 months and older doing graduated check-ins (Ferber), usually two parents trading off at night.

**v1 goals**

- A countdown to the next check-in, using the Ferber chart for the current night
- An alert that works with the phone locked
- A log of every event (down, check-in, asleep, woke) with nightly summaries
- A chart of crying time across nights
- Two parents sharing one baby
- A one-time purchase unlock

**Not in v1:** Android, Apple Watch, Live Activity / Dynamic Island, widgets, Siri, nap schedules, wake windows, other sleep-training methods.

## Tech stack and workflow

The stack is Expo (React Native + TypeScript), built in Claude Code on the web, with no Xcode anywhere. The developer's Mac runs macOS Monterey 12.7.6, so it can't run Xcode 26, which App Store submissions require. Every build goes through Expo's cloud service (EAS).

| Layer | Choice | Notes |
| --- | --- | --- |
| App framework | Expo SDK (latest) + TypeScript | Expo Router for navigation |
| Local storage | expo-sqlite | Offline first; the app must work with no signal at 2am |
| Notifications | expo-notifications | Local scheduled notifications, time-sensitive level |
| Haptics | expo-haptics | Taps confirm actions without sound |
| Charts | victory-native or react-native-svg | Crying minutes per night |
| Sync (Milestone 3) | Supabase (Postgres + auth + realtime) | Sign in with Apple; one shared "family" per baby |
| Purchases (Milestone 3) | RevenueCat | One-time non-consumable unlock, Family Sharing on |
| Builds and submission | EAS Build + EAS Submit | Triggered from GitHub |

**Daily dev loop**

1. Claude Code (web) writes code and pushes to the GitHub repo.
2. On the Mac: `git pull`, then `npx expo start`.
3. On the iPhone: scan the QR code in Expo Go, and the app reloads live.
4. From Milestone 3 on, Expo Go can't run native modules (purchases, Sign in with Apple). Switch to an EAS development build installed on the phone. This needs the Apple Developer account ($99/yr).

**Rules for Claude Code**

- Use only Expo-compatible libraries. Write no custom native Swift in v1.
- Keep the Ferber interval logic in a pure TypeScript module with unit tests (Jest).
- Store all times as UTC timestamps, and show them in local time.

## Ferber interval logic

The wait before each check-in comes from the night number and how many check-ins have already happened in this episode. After the last listed interval, every further wait repeats it.

**Default chart (minutes)**, the widely cited progressive-waiting chart from Ferber's *Solve Your Child's Sleep Problems* (from memory, approximate; verify against the book before launch):

| Night | 1st wait | 2nd wait | 3rd and later |
| --- | --- | --- | --- |
| 1 | 3 | 5 | 10 |
| 2 | 5 | 10 | 12 |
| 3 | 10 | 12 | 15 |
| 4 | 12 | 15 | 17 |
| 5 | 15 | 17 | 20 |
| 6 | 17 | 20 | 25 |
| 7+ | 20 | 25 | 30 |

**Rules**

- **Episode:** one stretch from "Down" or "Woke up" until "Asleep." The check-in count resets each episode, so a 2am waking starts over at the 1st wait.
- **Night number:** set at the first "Down" of the evening. It moves up by 1 when a new night starts. A night runs from 5pm to 11am local time, so a 2am event belongs to the previous evening's night.
- **Repeat a night:** the parent can choose "Repeat last night's intervals" for a rough night.
- **Nights past 7** use the night 7 values.
- **Editable chart:** in settings, the parent can edit any cell, pick a preset (Ferber default, Gentle = 1.5× longer ramp-up, or Custom), or reset to default.
- **Check-ins themselves are untimed.** The parent taps "Back out" when they leave the room, and the next wait starts from that tap.

**Function contract** (pure, unit-tested):

```
nextWaitMinutes(chart, nightNumber, checkInsSoFarThisEpisode) -> number
```

## Screens and features

The app has five screens. The Night screen is the product: it opens by default from 6pm to 7am and must be usable half-asleep with one thumb.

1. **Night (home)**
   - Idle: one huge "Down for the night" button, plus the night number and a small "Night waking" button.
   - Waiting: a large countdown to the next check-in, labeled "Check-in #2 in 4:12." Below it are "Asleep" and "Going in now" (an early check-in).
   - Check-in due: the screen pulses and the phone vibrates. One button reads "I'm going in."
   - In the room: a "Back out" button starts the next wait. A small elapsed timer shows how long the check-in has lasted.
   - Asleep: shows a summary of this episode (crying minutes, check-ins) and "Woke up" for the next episode.
   - Undo for the last tap, available for 10 seconds.
2. **History**
   - A list of nights, newest first: date, night number, total crying minutes, check-ins, wakings.
   - Tap a night to see its event timeline, edit or delete an event, and read or write a note.
3. **Progress**
   - A chart of crying minutes per night (bars), with check-ins per night as a second view.
   - One plain-language line, such as "Crying time is down 60% since night 1."
4. **Settings**
   - Interval chart editor and presets
   - Sound on or off, haptics on or off, notification test button
   - Baby name, start date, reset or start a new training round
   - Partner invite (Milestone 3), restore purchases, privacy policy, disclaimer
5. **Onboarding** (first launch)
   - What Ferber is in 3 short cards, plus a "check with your pediatrician" note
   - Baby's name and age. Under 6 months shows a warning but doesn't block.
   - Notification permission request, explaining why it matters (lock-screen check-in alerts)

## Data model

The data model is four tables. Events are the source of truth: night and episode summaries are computed from them, never stored by hand. The same schema runs in local SQLite and later in Supabase. Use UUIDs for every id so offline records sync without collisions.

| Table | Key fields | Notes |
| --- | --- | --- |
| baby | id, name, birthDate, trainingStartDate, chartPreset, customChart (JSON), familyId | One active baby in v1; the schema allows more |
| night | id, babyId, nightNumber, startedAt, note | Created by the first "Down" of the evening |
| event | id, nightId, type, at (UTC), createdBy, deletedAt | type: down, check\_in\_start, check\_in\_end, asleep, woke |
| family (M3) | id, ownerUserId, inviteCode | Links parent accounts to a baby |

**Derived values** (computed in one tested module):

- Crying minutes for an episode = asleep.at − (down or woke).at, including time spent on check-ins (simple and consistent for v1).
- Check-ins per night, wakings per night, longest episode.

**Sync rules (M3):** last write wins per event row, and events are soft-deleted (deletedAt) so a delete on one phone reaches the other.

## Notifications and night mode

The check-in alert has to fire reliably with the phone locked and the app closed. That's the one thing the app cannot get wrong. Test it on a real iPhone before anything else gets built.

**Notifications**

- When a wait starts, schedule a local notification for its end time. Cancel or reschedule it on Asleep, Going in now, or Undo.
- Set the interruption level to time-sensitive, so it breaks through Focus/Sleep mode if the user allows it. Explain this during onboarding.
- The notification reads "Time to check in (#3, night 2)."
- Use a short soft sound by default, with an option for vibrate only. No loud alarm, since the baby is in earshot.
- When the app reopens, compute the countdown from the stored start time. Never rely on a running JS timer.
- (M3) The partner's phone gets a silent notification when the other parent logs a check-in or Asleep.

**Night-mode UI**

- Dark theme with dim red or amber text on true black. No white flashes on launch.
- Countdown digits at least 72pt. Main buttons fill the bottom third of the screen for one thumb.
- Keep the screen awake while waiting (expo-keep-awake), with an option to let it sleep.
- Haptic tap on every button press. Show no confirmation dialogs at night; rely on Undo instead.

## Milestones

There are four milestones, each finished only when its checks pass on a real iPhone. Milestones 1–2 run in Expo Go for free. Milestone 3 is where the $99 Apple Developer account starts.

1. **Timer you can use tonight**
   - Night screen states, Ferber default chart, interval logic with unit tests
   - Local notifications, night-mode UI, keep-awake, Undo
   - Done when: with the phone locked, the alert fires within 5 seconds of the scheduled time across 3 check-ins, and the countdown is still right after force-quitting and reopening.
2. **Tracking**
   - SQLite storage, History list and night detail, event editing, notes
   - Progress chart and summary line, settings chart editor
   - Done when: a full week of real nights is logged, and the per-night numbers match a hand count.
3. **Real app features**
   - Switch to EAS development builds, onboarding, disclaimer
   - Supabase + Sign in with Apple, partner invite link, sync, partner alerts
   - RevenueCat one-time unlock (after the free trial nights), restore purchases, Family Sharing
   - Done when: two phones on different Apple IDs see each other's taps within 5 seconds, a TestFlight sandbox purchase unlocks the app on both, and offline taps sync once the signal returns.
4. **Launch**
   - App icon, name, screenshots, App Store listing, privacy policy, terms
   - TestFlight beta with 3–5 parent friends for 1–2 weeks
   - Done when: no crash reports for a week of beta use, then submit for App Store review.

## Monetization, launch, open questions

The model is a free download with a one-time unlock. No subscription, because most families need the app for only 1–3 weeks.

**Monetization**

- Free: the full timer and logging for the first 2 nights
- Unlock (one-time, $4.99–$9.99): unlimited nights, partner sync, Progress chart, custom intervals
- Family Sharing on, so one parent buys and the other gets it free
- Listing pitch: "Buy once, use it for every kid"

**Launch checklist**

- [ ] Apple Developer account ($99/yr)
- [ ] App name checked for availability in the App Store
- [ ] Privacy policy and terms (hosted page)
- [ ] In-app medical disclaimer: not medical advice; talk to your pediatrician; meant for babies about 6 months and older
- [ ] Verify the default Ferber chart against the book
- [ ] App Store privacy labels (account info, usage data stored in Supabase)
- [ ] Screenshots for the required iPhone sizes

**Open questions**

- App name?
- Exact price, and is a 2-night free trial right?
- Support more than one baby (twins, siblings) in v1, or later?
- Show check-in duration in stats, or keep it hidden?
- Later: Live Activity and an Apple Watch app once a newer Mac is bought
