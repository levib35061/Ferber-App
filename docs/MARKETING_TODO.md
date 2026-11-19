# Marketing to-do

The running list. The reasons and evidence are in `reports/Check In app launch strategy.md`.

## Done

- [x] App Store listing written: subtitle "Ferber Method Sleep Training", keywords, description (`docs/APP_STORE.md`)
- [x] "Ferber" trademark search: clear
- [x] Website on ferbertimer.com, with the free web timer and printable chart
- [x] Site added to Google Search Console and Bing Webmaster Tools, sitemap read successfully
- [x] Rating prompt after a good morning, shareable progress card (in the app)
- [x] YouTube channel set up: name, picture, banner, description
- [x] Videos 1 and 2 posted, with captions and thumbnails, and embedded on ferbertimer.com (tap-to-play, nothing loads from YouTube before)

## Waiting on something

- [x] **YouTube links** (approved): beta link + guide links in both video descriptions, pinned comments, channel Links (wording in the chat of Nov 19; swap the beta link for the App Store link at launch)

## Beta (once TestFlight's beta review approves build 3)

- [x] TestFlight → Friends & Family → **Public Link** on: https://testflight.apple.com/join/mCSprSvf
- [x] Website: `python3 tools/site/app_links.py beta <link>` (every page's app box becomes "Try the free beta")
- [x] Add the beta link to the YouTube descriptions and channel links

## At App Store launch (after Apple approval)

All the wording is ready in `docs/LAUNCH_COPY.md`.


- [x] Enroll in the Small Business Program (applied; 15% starts about 15 days after the end of the fiscal month it's approved in, not backdated)
- [x] Featuring nomination for the launch: App Store Connect wouldn't take it for 1.0 (skipped). Nominate the first real update instead (type App Enhancements, at least 2 weeks before it ships); reuse this:
  - Description: calm Ferber timer built by a parent; counts only while crying, restarts after wakings, lock-screen alerts and Live Activity; whole family in sync with one person on duty; morning summary and crying chart; no ads, tracking or account; 2 free nights then $4.99 once
- [x] Spanish (Mexico) and English (UK/Australia) keyword fields (`docs/APP_STORE.md`)
- [x] Screenshots: timer, lock screen, whole family, recap, progress
- [ ] Video 3 (app walkthrough): post at App Store launch, then embed it in the site's app section
- [ ] Add the App Store link to: the three YouTube descriptions and pinned comments, the YouTube channel links, ferbertimer.com (I run `python3 tools/site/app_links.py live`: App Store button on every page, Safari's app banner, and the link in the home page's structured data)
- [x] App Store header image uploaded
- [ ] Apple Ads: spend the free $100 credit on exact-match keywords, as keyword research; stop when it's used up. Step-by-step setup, keywords and bids: `docs/APPLE_ADS.md`
- [ ] Campaign links (App Store Connect) on the website's download buttons, so you can see which page sends downloads
- [ ] Launch listings: Product Hunt and AlternativeTo
- [ ] Sleep consultants: from Tuesday Dec 1 (after Thanksgiving), one code each capped at 20 unlocks, drafts from askcheckin@; playbook `docs/OUTREACH.md`
- [ ] Message beta-tester friends who used it on real nights: ask for an honest rating (never 5 stars, nothing in return; not you or Anna Kate; spread over a few days)
- [ ] Ask Facebook group admins for permission before posting anything (accept a no)

## First 90 days

- [ ] Reply to every App Store review
- [ ] Email authors of "best sleep training apps" articles about Check In
- [ ] Optional: video 3 with real screen recordings of the app (I'll rebuild it)
- [ ] Optional: App Store preview video (15–30 s, real screen recording, must work without sound). Same recording can replace the drawn screens in YouTube video 3
- [x] Eight guide pages on ferbertimer.com
  - [x] 1. Ferber method night by night (nights 1 to 7)
  - [x] 2. Ferber method not working: things to check
  - [x] 3. Night wakings and night feeds
  - [x] 4. Ferber for naps
  - [x] 5. What age to start
  - [x] 6. Ferber vs cry it out vs the chair method
  - [x] 7. Check-ins and two parents, one plan
  - [x] 8. Ferber timer apps compared (honest, says we make one)
- [ ] Keep the apps-compared page current (check rival prices every few months)

## Every month

- [ ] Search Console and Bing: pages indexed, searches with "timer", "chart", "app"
- [ ] App Store Connect: downloads by source (search, browse, web), conversion rate
- [ ] RevenueCat: share of downloads that buy
- [ ] Ask ChatGPT, Claude and Perplexity "is there an app for the Ferber method?" and note whether Check In shows up
