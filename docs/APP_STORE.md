# App Store listing and privacy answers

Everything to paste into App Store Connect on approval day. Character limits are
Apple's; every field below fits.

## App information

| Field | Value |
| --- | --- |
| Name (30) | Check In: Baby Sleep Timer |
| Subtitle (30) | Sleep training check-in timer |
| Primary category | Health & Fitness |
| Secondary category | Lifestyle |
| Age rating | 4+ (answer "None" to every content question) |
| Price | Free (the unlock is an in-app purchase) |
| Support URL | https://levib35061.github.io/Ferber-App/help.html |
| Marketing URL | https://levib35061.github.io/Ferber-App/ |
| Privacy Policy URL | https://levib35061.github.io/Ferber-App/privacy.html |
| Copyright | 2026 followed by your name as it appears on your developer account |

Don't tick "Made for Kids": the app is for parents, not children.

## Keywords (100)

```
ferber,cry it out,cio,graduated,interval,nap,toddler,infant,night waking,log,tracker,routine,bedtime
```

Words already in the name and subtitle (check, baby, sleep, timer, training) count
automatically, so they aren't repeated here.

## Promotional text (170)

Can be changed any time without a new review.

```
Tonight, know exactly when to go in. Check In times every wait, alerts you on the lock screen, and shows crying time dropping night by night.
```

## Description (4000)

```
Sleep training is hard enough at 2am. Check In keeps the time so you don't have to.

Check In is a calm, one-thumb timer for the Ferber method (also called graduated or interval sleep training). Put your baby down, tap once, and the app tells you when it's time for a short check-in. The waits get a little longer each time and each night, just like the chart in the book.

MADE FOR A DARK NURSERY
• Huge countdown and big buttons you can hit half-asleep
• A dark, soft night theme that won't blind you
• Alerts on the lock screen, even during a Sleep Focus when you allow time-sensitive alerts
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

SHARE WITH YOUR PARTNER
• Both phones see every tap within seconds
• Choose who's on duty, so only one of you gets woken up
• One purchase unlocks the app for your whole family

PRIVATE BY DESIGN
• No ads, no tracking, no analytics
• Everything stays on your phone unless you turn on partner sharing
• No account needed. Sign in with Apple is optional.

TRY IT FREE
Your first two nights are free. After that, a one-time $4.99 unlock keeps every feature, for every night, for you and your partner. No subscription.

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
| Price | $4.99 (Tier 5) |
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

Apple needs 6.9" iPhone screenshots (1320 × 2868). Suggested five, with a short
caption on each:

1. Waiting countdown: "Know exactly when to go in"
2. Check-in due (peach): "Alerts even on the lock screen"
3. Today morning summary: "See last night at a glance"
4. Progress chart: "Watch crying time drop"
5. Partner sharing / duty bar: "Share the nights with your partner"
