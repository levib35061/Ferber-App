# Getting recommended by AI assistants (ChatGPT, Claude, Perplexity, Gemini)

Framework: OWN (our pages tell the story) · CLAIM (specific, checked advantages) · CONTEST
(honest comparisons with the alternatives) · EARN (independent mentions on sites AI already cites).

What we do, what we don't, and a 10-minute check every two weeks.

## Rules

- **Same content for everyone.** No pages, text or offers shown only to bots ("cloaking"):
  Google penalises it and it breaks this project's rule (AGENTS.md: no hidden text aimed at
  AI or search engines).
- **Plain Markdown copies are fine** because they're public and identical: every page has
  `site/<page>.md`, linked in its footer ("Plain-text version of this page") and in
  `<link rel="alternate" type="text/markdown">`, and listed in `llms.txt`.
  Regenerate after editing a page: `python3 tools/site/markdown.py` (CI-style check:
  `--check`).
- **Get mentioned where AI already looks.** AI answers lean on pages they already cite. Our
  outreach targets those: sleep consultants' Ferber pages, "best sleep training app" roundups,
  Product Hunt, AlternativeTo (`docs/OUTREACH.md`, `docs/LAUNCH_COPY.md`). When choosing who
  to contact first, prefer pages that show up in the answers below.

## The check (every two weeks, about 10 minutes)

Ask each question in a fresh chat, logged out or in a private window where possible, in
**ChatGPT**, **Claude**, **Perplexity** and **Google (AI Overview)**. Note whether the answer
mentions **Check In** (the app) or **ferbertimer.com**, and which other sites it cites.

1. What's the best app for the Ferber method?
2. Is there an iPhone timer for Ferber check-ins?
3. Ferber method chart: how long do I wait on night 3?
4. How long should check-ins last with the Ferber method?
5. My baby wakes at 2am during Ferber. Do I start the waits over?
6. Ferber method not working after 5 nights, what should I check?
7. Ferber vs cry it out: which is better?
8. Free Ferber method timer online
9. Best sleep training app with partner sync
10. Ferber method with twins / a shared room

**Which page should answer each question** (fix this page first when a question is missed;
write a new page only if none fits):

| Q# | Page |
| --- | --- |
| 1, 2, 9 | `ferber-timer-apps-compared.html`, `index.html#app`, App Store description |
| 3 | `chart.html`, `ferber-method-night-by-night.html` |
| 4 | `ferber-check-ins-and-partners.html` |
| 5 | `ferber-method-night-wakings-and-feeds.html` |
| 6 | `ferber-method-not-working.html` |
| 7 | `ferber-vs-cry-it-out.html` |
| 8 | `timer.html` |
| 10 | `ferber-method-shared-room-siblings-twins.html` |

Also worth asking once a month: "What is Check In: Baby Sleep Timer?" (does the AI describe it
correctly: $2.99 once, two free nights, no tracking, whole family?).

## Log

| Date | Assistant | Q# | Check In? | ferbertimer.com? | Competitors named | Sites cited (top 3) | Why missed* | Action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-11-25 (pre-launch) | ChatGPT | 2 | No | No | Ferber Friend, Baby Sleep Trainer: Ferber, Oona | App Store listings only | not live yet | re-ask after launch |
| 2026-11-25 (pre-launch) | ChatGPT | 1 | No | No | Ferber: Baby Sleep Training (top pick), Cocoo, Baby Sleep Trainer: Ferber | App Store listings, one official site | not live yet | re-ask after launch |
| 2026-11-25 (pre-launch) | ChatGPT | 8 | No | No | Ferberizer (web, its pick), Baby Sleep Trainer, Ferber Friend | ferberizer site, App Store listings | technical (site ~1 week old; timer.html indexed, Google pos. 4 on its one impression) | most winnable: re-ask in 2 weeks; check Bing indexing (ChatGPT search leans on Bing) |
| 2026-11-25 (pre-launch) | ChatGPT | 9 | No | No | Huckleberry (top), Napper, Baby Daybook, Nara Baby, Robin Baby ("Baby Tracker: Robin") | "Cradle blog" (couldn't find a real post; Cradle-named sites are rival trackers), robinbaby.com | weak coverage: answered as *trackers* with sync, not Ferber timers | after launch the App Store listing's sharing section should get picked up; re-ask "Ferber timer app my partner and I can share" too |
| 2026-11-25 (pre-launch) | ChatGPT | 10 | No | No | none (advice only) | HealthyChildren.org | technical (twins page ~1 week old) | re-ask in 2 weeks; good page match exists |
| 2026-11-25 (pre-launch) | Web search (proxy) | 1 | No | No | Sleep trainer - Ferber method ($2.99), Baby Sleep Trainer - Ferber, Ferbee, Sleep Little Finch, Oona | App Store listings, appshunter.io topic pages, appadvice | not live yet | after launch: check appshunter's Ferber topic lists Check In |
| 2026-11-25 (pre-launch) | Web search (proxy) | 2 | No | No | Baby Sleep Trainer - Ferber, Oona, Sleep trainer, Ferber Friend, Sleep Little Finch | App Store listings, appshunter, aggregator mirrors | not live yet | re-ask after launch |
| 2026-11-25 (pre-launch) | Web search (proxy) | 3 | No | No | – | Romper, Made for Mums, Mattress Miracle, Smart Sleep Coach, Cleveland Clinic, The Bump | technical (new site) | sources disagree on night 3; chart.html gives the book's 10/12/15 plainly |
| 2026-11-25 (pre-launch) | Web search (proxy) | 4 | No | No | – | Sleep Foundation, The Bump, Mayo Clinic, Romper, Care.com | technical (new site) | re-ask in 2 weeks |
| 2026-11-25 (pre-launch) | Web search (proxy) | 5 | No | No | – | Cleveland Clinic, Sleep Foundation, PureWow, Wikipedia | technical (new site) | answer agrees with our page (start over at the first wait) |
| 2026-11-25 (pre-launch) | Web search (proxy) | 6 | No | No | – | Mumsnet threads, Care.com, Sleep Foundation, Sleep Lady | technical (new site) | forums dominate; our page is a clean checklist |
| 2026-11-25 (pre-launch) | Web search (proxy) | 7 | No | No | – | ParentData, Sleep Lady, Smart Sleep Coach, Care.com, Psychology Today | weak coverage (established sites) | outreach: ParentData-style evidence pages |
| 2026-11-25 (pre-launch) | Web search (proxy) | 8 | No | No | Baby Sleep Trainer - Ferber, Ferbee, Oona, Sleep trainer | App Store listings, Smart Sleep Coach | technical (timer.html not surfacing) | Bing Webmaster Tools; re-ask in 2 weeks |
| 2026-11-25 (pre-launch) | Web search (proxy) | 9 | No | No | Baby Sleep Trainer - Ferber (iCloud sync, $1.99), Shluffy, SleepyTwins, Smart Sleep Coach | App Store listings, appshunter | not live yet | closest rival on sync; ours works across Apple IDs and for 3+ people |
| 2026-11-25 (pre-launch) | Web search (proxy) | 10 | No | No | SleepyTwins (app) | momlovesbest, Sleep Lady, WonderBaby, Twiniversity, Wikipedia | technical (twins page new) | re-ask in 2 weeks; Twiniversity is a possible outreach target |

*Diagnose every miss before acting: **missing info** (our page doesn't answer it clearly → improve
that page), **weak coverage** (only outside sites get cited → outreach to those sites), or
**technical** (the page isn't indexed or linked → Search Console, sitemap, internal links).
Re-ask the same question after the fix to see if it worked. Track Google (Search Console) and
AI answers separately: ranking on Google doesn't mean appearing in AI answers.

**What to do with it**
- A site that keeps getting cited for your questions → put it at the top of the outreach list.
- An answer that gets a fact about Check In wrong → fix the wording on the matching page (and
  the App Store description), then ping IndexNow (`python3 tools/site/indexnow.py`).
- A question where no answer cites anyone good → a candidate for a new guide page.

## Which AI crawlers visit (Cloudflare)

GitHub Pages has no visitor logs, but the domain's DNS is at Cloudflare.

1. Cloudflare dashboard → **ferbertimer.com** → **DNS**: check whether the records for the site
   show an **orange cloud** (proxied). If they're **grey** (DNS only), Cloudflare doesn't see the
   traffic and the dashboard below will be empty. Switching to proxied works with GitHub Pages
   but set **SSL/TLS → Full** first; ask before changing it so it's done carefully.
2. With proxying on: **AI Crawl Control** (sometimes listed under Security or as "AI Audit")
   shows visits by crawler (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…). Leave them
   **allowed**: blocking them would keep the site out of AI answers.
