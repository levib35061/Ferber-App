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
