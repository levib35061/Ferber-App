# App Store listing and privacy answers

Everything to paste into App Store Connect on approval day. Character limits are
Apple's; every field below fits.

## App information

| Field | Value |
| --- | --- |
| Name (30) | Check In: Baby Sleep Timer |
| Subtitle (30) | Ferber Method Sleep Training |
| Primary category | Health & Fitness |
| Secondary category | Lifestyle |
| Age rating | 4+ (answer "None" to every content question) |
| Price | Free (the unlock is an in-app purchase) |
| Support URL | https://ferbertimer.com/help.html |
| Marketing URL | https://ferbertimer.com/ |
| Privacy Policy URL | https://ferbertimer.com/privacy.html |
| Copyright | 2026 followed by your name as it appears on your developer account |

Don't tick "Made for Kids": the app is for parents, not children.

## Before you paste: two checks

1. **Trademark search for "Ferber".** The subtitle uses the method's name, as every rival
   timer does, but that isn't legal clearance. Search "Ferber" at
   https://tmsearch.uspto.gov and look for a live trademark covering software or apps.
   If there is one, use the fallback subtitle `Sleep training check-in timer` and put
   `ferber` back at the front of the keyword field.
2. **Small Business Program.** Enroll in App Store Connect before launch. Apple's 15%
   rate isn't automatic; without it Apple keeps 30%.

## Keywords (100 each)

The name and subtitle already cover: check, in, baby, sleep, timer, ferber, method,
training. Apple counts those automatically, so they aren't repeated.

**English (U.S.)**

```
cry it out,cio,graduated,interval,nap,toddler,infant,newborn,night waking,trainer,schedule,bedtime
```

**Spanish (Mexico)** — add this as a second language in App Store Connect and fill in
only its keyword field (copy the English name, subtitle and description). App Store
experts consistently report that the US store also searches this field, which roughly
doubles the keyword space. Apple doesn't document it.

```
ferber method,sleep trainer,controlled crying,wake window,coach,dormir,bebe,sueño,entrenamiento
```

**English (U.K.) and English (Australia)** — same idea, with the local terms.

```
controlled crying,cry it out,self settling,graduated,interval,nap,toddler,newborn,night waking
```

After launch, replace words that get no searches using what the Apple Ads test shows
(see `reports/Check In app launch strategy.md`).

## Promotional text (170)

Can be changed any time without a new review.

```
Tonight, know exactly when to go in. Check In times every wait, alerts you on the lock screen, and shows crying time dropping night by night.
```

## Description (4000)

```
Check In is an iPhone timer for the Ferber method of baby sleep training (also called graduated check-ins or progressive waiting). It counts down to each check-in using the Ferber interval chart, alerts you with the phone locked, and logs every night so you can see crying time drop.

It's free for your first 2 nights, then $2.99 once. One purchase covers the whole family. No subscription, no ads, no tracking.

Sleep training is hard enough at 2am. Put your baby down, tap once, and Check In tells you when it's time for a short check-in. The waits get a little longer each time and each night, just like the chart in the book.

MADE FOR A DARK NURSERY
• Huge countdown and big buttons you can hit half-asleep
• A dark, soft night theme that won't blind you
• Alerts on the lock screen, even during a Sleep Focus when you allow time-sensitive alerts
• A live countdown right on your lock screen
• No timer until your baby actually cries, and it pauses when they stop
• Undo instead of "are you sure?" pop-ups

KEEPS YOU CONSISTENT
• The standard Ferber interval chart built in, or a gentler one, or your own
• Night feeds pause the timer and start the waits over
• A gentle nudge after two minutes in the room
• Night wakings, check-ins and crying time logged automatically

SEE IT WORKING
• A warm morning summary: how last night went and how it compares
• Charts of crying time and check-ins across the week
• Every night in History, with each tap editable
• Missed logging a night? Add it later in a few taps
• A simple card to share your progress, if you want to

SHARE WITH YOUR PARTNER, OR THE WHOLE FAMILY
• Every phone sees every tap within seconds
• A grandparent or a sitter can join with a code too
• Choose who's on duty, so only one of you gets woken up, and hand the night off by name
• One purchase unlocks the app for your whole family

PRIVATE BY DESIGN
• No ads, no tracking, no analytics
• Everything stays on your phone unless you turn on partner sharing
• No account needed. Sign in with Apple is optional.

TRY IT FREE
Your first two nights are free. After that, a one-time $2.99 unlock keeps every feature, for every night, for your whole family. No subscription.

Sleep training is meant for babies about 6 months and older. Check In isn't medical advice. Please talk to your pediatrician before you start.
```

## What's New (first version)

```
First release. Sweet dreams.
```

## In-app purchase

| Field | Value |
| --- | --- |
| Type | Non-consumable |
| Product ID | checkin_unlock |
| Reference name | Full unlock |
| Price | $2.99 |
| Display name | Unlock Check In |
| Description | Every night, for your whole family. |
| Family Sharing | On (matches "one purchase for the family"; Apple doesn't let you turn it off again later) |

## Notes for App Review

```
No account is needed. To try the app: finish the short setup, then on the Night tab tap "Down for the night", then "Crying" to start the first wait. Check-in alerts are local notifications scheduled for the end of each wait.

Partner sharing (Settings → Partner sharing) is optional. "Invite my partner" shows an 8-character code; a second device enters it under "Have a code from your partner?". Sign in with Apple is optional and only keeps sharing across reinstalls.

The first two nights are free. Starting a third night opens the unlock screen (non-consumable in-app purchase "checkin_unlock"). Account deletion: Settings → Help & about → Delete my account and data.
```

## App Privacy questionnaire

"Do you or your third-party partners collect data from this app?" → **Yes**.
(Data only leaves the phone with partner sharing or a purchase, but Apple asks
about any collection at all.)

Tick these data types. For every one: **Linked to the user: Yes · Used for
tracking: No · Purpose: App Functionality only.**

| Category → Type | What it is in Check In |
| --- | --- |
| Health & Fitness → Health | The sleep log (taps, crying time, wakings) when shared with a partner |
| User Content → Other User Content | Baby's name, birth date and notes, when shared |
| Identifiers → User ID | The account id used for partner sharing and purchases |
| Purchases → Purchase History | RevenueCat's record that the unlock was bought |

Leave everything else unticked:

- **Contact Info → Email:** not collected. The app asks Apple for no name or
  email.
- **Identifiers → Device ID:** no. A push token isn't a device identifier in
  Apple's sense.
- **Diagnostics / Usage Data:** no. There are no crash or analytics tools in the
  app. Apple's own opt-in crash reports don't count.
- **Location, Contacts, Browsing, Search, Financial Info, Sensitive Info:** no.

"Data used to track you" → **None.**

## Screenshots (to make after the development build)

Apple needs 6.9" iPhone screenshots (1320 × 2868). The first three show in search
results, so they carry the message on their own:

1. Waiting countdown: "Ferber method check-in timer"
2. Lock-screen alert: "Alerts you with the screen locked"
3. Partner sharing / duty bar: "One purchase covers both parents"
4. Today morning summary: "See last night at a glance"
5. Progress chart: "Watch crying time drop"

## Featuring nomination

In App Store Connect, submit a Featuring Nomination at least two weeks before launch.
Lead with: a parent built it during their own sleep training; a calm, dim night design
with VoiceOver and large-text support; pay once, no ads, no tracking.

## App Review check (Nov 18, 2026)

Fixed or already in place:

- [x] Restore purchases: on the unlock screen, reachable any time from Settings → Unlock
- [x] Account deletion in the app: Settings → Help & about → Delete my account and data
- [x] Sign in with Apple is optional and the only sign-in, with Apple's own button
- [x] No account needed to use the app
- [x] Privacy policy, help and contact links in Settings → Help & about
- [x] Medical caution: pediatrician note in setup, under-6-months warning, "not medical advice"
- [x] Developer-only settings (Testing, test unlock) are hidden in App Store builds
- [x] iPhone only (`supportsTablet: false`)
- [x] Privacy manifest reasons in `app.json` (`ios.privacyManifests`, copied from the libraries' own manifests)
- [x] "Save Image" from the share card: photo-library permission text added (without it the app would crash)
- [x] Export compliance: `ITSAppUsesNonExemptEncryption: false` (only standard HTTPS), so no question on each upload
- [x] Rating prompt uses Apple's own prompt, only after a good morning

Done after Apple approval (Nov 18):

- [x] RevenueCat App Store key in `src/config.ts`; App Store app, In-App Purchase key and `checkin_unlock` product in RevenueCat; test purchase reached `unlocks` through the webhook
- [x] EAS project, push key, development build, Live Activity (widget extension + app group)
- [x] Sign in with Apple key secrets set; `apple_tokens` gets a row after sign-in
- [x] App created in App Store Connect; `checkin_unlock` created ($2.99, Family Sharing on, review screenshot uploaded)
- [x] Paid Apps agreement, Small Business Program, App Privacy, App Information, pricing (free)
- [x] Screenshots uploaded (`docs/app-store-screenshots/1206x2622/`)
- [x] TestFlight: build 3 in beta review for the "Friends & Family" group

Before submitting version 1.0:

- [x] Version page: build 4 selected, text, URLs, copyright, manual release
- [x] App Review information: no sign-in required, contact details, review notes (with the Live Activity line)
- [x] `checkin_unlock` added to the draft submission (reviewed with the app)
- [ ] After friends' testing: pick the newest build, **Add for Review**, then **Submit for Review**
- [ ] Optional: header image (3840 × 1646) for the product page
- [ ] If Apple emails about missing privacy-manifest reasons after an upload, add them under `ios.privacyManifests` in `app.json`
