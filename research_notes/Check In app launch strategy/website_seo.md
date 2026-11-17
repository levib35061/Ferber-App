# Website SEO (Google and Bing) for the Check In companion site — research notes, 17 Nov 2026

Method note for the report writer: searches were run on 17 Nov 2026 with a US web-search tool. It returns an index of matching pages, NOT Google's or Bing's actual ranked SERP, and shows no AI Overview, People Also Ask, or ad blocks. Treat "what ranks" observations as "who is present in the results set", not exact positions. No paid keyword tool (Ahrefs/Semrush/Keyword Planner) was available, so there are no volume or difficulty numbers in these notes. Strength labels: [Primary] = Google/Apple/GitHub documentation or my own direct test; [Study] = named data study; [Trade] = SEO trade press; [Weak] = vendor blog, aggregator, or search-snippet-only.

## 1. What currently ranks for Ferber queries, who dominates, and where the weak spots are

### Takeaway
Head terms ("ferber method", "ferber sleep training", "ferber method chart") are held by big health/parenting publishers and brand blogs, and a small github.io site should not plan on winning them. The visible weak spots are (a) "chart printable" intent, where the results set is polluted by spam pages on hijacked subdomains, and (b) "app / timer" intent, where results are almost entirely App Store listings and app aggregators with no good web page and no free web timer.

### Cited Findings
- "ferber method chart" results set (17 Nov 2026) included: Sleep.com, Mother & Baby, Sleep Advisor, Newton Baby, Pampers, The Bump, Yahoo Lifestyle (syndicated Parents content), mindbodygreen, MadeForMums, GoodTo, HuffPost, Momcozy ("Ferber Method Chart: Check-In Times by Night"), plus mattress/blackout-curtain/swaddle e-commerce blogs (Mattress Miracle, Sleepout, Swaddlean). [Primary observation] — [Sleep.com](https://www.sleep.com/sleep-health/ferber-method), [Momcozy](https://momcozy.com/fr-ca/blogs/babycare/ferber-method-chart-check-in-times), [Newton Baby](https://www.newtonbaby.com/blogs/hush/ferber-sleep-training), [The Bump](https://thebump.com/a/ferber-method)
- The same results set contained several "Ferber Method Chart Printable" pages hosted on unrelated domains (a Loughborough University subdomain, an Intersport Sweden subdomain, a cTrader subdomain) — classic hacked/parasite doorway pages. Their presence indicates real demand for a printable chart and poor legitimate supply. [Primary observation; the demand inference is mine] — [lboro.ac.uk spam page](https://lbas.lboro.ac.uk/en/ferber-method-chart-printable.html), [intersport.se spam page](https://tjejmilen.intersport.se/eng/ferber-method-chart-printable.html), [ctrader.com spam page](https://ctradersite.ctrader.com/viewer/ferber-method-chart-printable.html)
- A spam page for "ferber method night feeding" appeared on the same hijacked university subdomain, suggesting that long-tail is also being targeted by spammers. [Primary observation] — [lboro.ac.uk](https://lbas.lboro.ac.uk/feed/ferber-method-night-feeding.html)
- "ferber method night 1 2 3 what to expect" results set included: Sleep Foundation, Romper, Yahoo/Parents, Huckleberry ("what age to start"), PureWow, Sleep.com, Care.com, WonderBaby, Rochester Regional Health, Pampers' Smart Sleep Coach ("Cry It Out vs Ferber Method"), plus very small/unknown sites on pages.dev and blogspot. No result was a dedicated per-night page; the per-night information sits inside general guides. [Primary observation] — [Sleep Foundation](https://sleepfoundation.org/baby-sleep/ferber-method), [Huckleberry](https://huckleberrycare.com/blog/ferber-method-for-sleep-training-what-age-to-start), [Smart Sleep Coach comparison](https://www.smartsleepcoach.com/blog/sleep-training/cry-it-out-vs-ferber-method), [Rochester Regional](https://www.rochesterregional.org/hub/sleep-training-your-child)
- Cleveland Clinic has a dedicated Ferber page that showed up even for the app/timer query. [Primary observation] — [Cleveland Clinic](https://health.clevelandclinic.org/ferber-method)
- Other established pages present for the head term: Wikipedia, Parenting Science (evidence-focused, single-author site by an anthropologist), EBSCO Research Starters. [Primary observation] — [Parenting Science](https://parentingscience.com/ferber-method), [EBSCO](https://www.ebsco.com/research-starters/health-and-medicine/ferber-method)
- "ferber method app timer" and "sleep training timer online free" results sets were dominated by Apple App Store listings and app aggregator sites (AppAdvice, appshunter, mwm.ai, marlvel.ai, appfelstrudel). Only two content sites appeared (Smart Sleep Coach, Cleveland Clinic). No free web-based Ferber timer was found. [Primary observation] — [AppAdvice listing](https://appadvice.com/app/sleep-trainer-ferber-method/1555062851), [Smart Sleep Coach](https://smartsleepcoach.com/blog/sleep-training/ferber-method)
- Direct competitor apps surfaced by those queries (developer-stated features/prices; verify before quoting): "Baby Sleep Trainer - Ferber" (free, no subscription, partner sync, Dynamic Island countdown, Apple Watch); "Sleep trainer - Ferber method" by Nisha Kamra ($2.99; Regular/Mild/Custom); "Oona: Sleep Training Timer" ($1.99; Regular/Gentle/Fast-Track presets); "Ferber Friend" (free, per an aggregator); "Sleep Little Finch". — [Baby Sleep Trainer - Ferber](https://apps.apple.com/app/id6760542352), [Sleep trainer - Ferber method](https://apps.apple.com/us/app/id1555062851), [Oona](https://apps.apple.com/us/app/id6747005575), [Ferber Friend (aggregator)](https://marlvel.ai/apps/ferber-friend-sleep-training), [Sleep Little Finch](https://apps.apple.com/app/id6775387353)
- At least one competitor (Oona) also hosts its support site on a github.io project path, and one ("Baby Sleep Trainer") on pages.dev, so competitors' web presence is no stronger than Check In's. [Primary observation] — [Oona support](https://stevecooktimjob.github.io/oona-team/support), [Baby Sleep Trainer site](https://smushmonkey.pages.dev/apps/baby-sleep-trainer/)
- Reddit: SISTRIX reported Reddit became the #2 site in Google US visibility by April 2025; the trend turned negative from August 2025, and Amsive measured a large drop in the March 2026 core update with a partial rebound from late April 2026. [Study/Trade, from search summaries, not fetched in full] — [SISTRIX Reddit domain analysis](https://www.sistrix.com/blog/reddit-domain-analysis/), [The Stacc summary](https://thestacc.com/blog/reddit-google-visibility/)

### Inferences
- Site types in order of dominance for head terms: (1) medical/health publishers (Cleveland Clinic, Sleep Foundation), (2) large parenting media (What to Expect/BabyCenter were not in my results sets but are well-known incumbents; The Bump, Parents via Yahoo, Romper, PureWow), (3) product-brand blogs using Ferber content as top-of-funnel (Pampers/Smart Sleep Coach, Huckleberry, Newton, Momcozy, mattress and blackout-curtain shops), (4) sleep-consultant sites. A new non-clinician site has no realistic path to page 1 for "ferber method" itself.
- Best-fit targets for Check In: "ferber method chart printable / pdf", "ferber timer", "ferber method app", "sleep training timer", "ferber interval calculator", "ferber method night 2 / night 3 worse", "ferber check-in how long to stay", "ferber what if baby stops crying then starts again" (a blogspot page with exactly that title appeared in results, a sign of low competition: [blogspot page](https://pullumofectown.blogspot.com/2022/03/ferber-method-what-if-baby-stops-crying.html)).
- Check In is the most expensive of the visible Ferber timer apps ($4.99 vs free/$1.99/$2.99), so web pages aimed at "ferber method app" need to state plainly what the extra money buys (partner sync, lock-screen alert, crying-time summary) and that 2 nights are free.
- Reddit threads likely still appear for experiential queries ("ferber method not working", "night 3 worse"), but Reddit's dominance was lower in 2026 than at its 2025 peak.

### Gaps
- No true Google or Bing SERP capture (positions, AI Overview presence, PAA questions, video/Reddit blocks) was possible with the tools available. Someone should check the 12 target queries manually in an incognito US browser and in Bing and record the top 10.
- "ferber method age", "ferber method naps", "ferber method night wakings", "ferber method not working", and "cry it out vs ferber" were not searched individually; only "night 1/2/3", "chart", and "app/timer" were. Taking Cara Babies, What to Expect, BabyCenter, and Healthline did not appear in my results sets, so their current ranking is unverified here.
- Bing-specific ranking differences were not researched.

## 2. Search volume and difficulty estimates

### Takeaway
I found no public, citable volume or difficulty numbers for any of the target queries; every figure would need a keyword tool. Do not put numbers in the report unless someone pulls them.

### Cited Findings
- Two targeted searches for public volume/difficulty data on "ferber method" returned only generic explainers, no figures. [Primary observation] — [Semrush free volume checker (tool, not data)](https://sv.semrush.com/free-tools/keyword-search-volume-checker)
- Volume estimates differ substantially between tools; Wix cites a case where one tool's estimate was about 55% of another's, and Google Keyword Planner reports ranges rather than exact numbers. [Trade] — [Wix SEO hub](https://www.wix.com/seo/learn/resource/search-volume)

### Inferences
- The site is already verified in Google Search Console and Bing Webmaster Tools. The cheapest real data source is its own Search Console "Queries" report (impressions by query) and Bing Webmaster Tools' free Keyword Research tool; both are better than third-party estimates for long-tail terms.
- Qualitative difficulty ranking (my judgement, not data): very hard = "ferber method", "ferber sleep training", "cry it out vs ferber"; hard = "ferber method chart", "ferber method age"; moderate = "ferber method naps / night wakings / not working / night 2"; easier = "ferber method chart printable/pdf", "ferber timer", "ferber method app", "sleep training timer", calculator-type queries.

### Gaps
- All volume and keyword-difficulty numbers. Recommended follow-up: Google Keyword Planner (free with an Ads account), Bing Webmaster Tools keyword research, or a one-month Ahrefs/Semrush trial.

## 3. How Google treats health-adjacent YMYL content from non-experts (E-E-A-T, 2025-2026)

### Takeaway
Baby sleep advice is health-adjacent YMYL, where Google says it gives more weight to strong E-E-A-T; trust is the most important component and E-E-A-T itself is not a direct ranking factor. A parent author can legitimately lean on first-hand experience, accurate bylines, and transparent sourcing, and must not invent credentials.

### Cited Findings
- Google: "E-E-A-T itself isn't a specific ranking factor", but its systems give more weight to content with strong E-E-A-T for YMYL topics (health, financial stability, safety, societal well-being). "Of these aspects, trust is most important." [Primary] — [Google Search Central: Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- Google: "Any form of deception makes a page untrustworthy to both users and our automated quality systems"; it warns against "Fabricating creator profiles" (made-up names, false credentials). [Primary] — [Google Search Central](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- Google's "Who, How, Why" self-check: it should be "self-evident to your visitors who authored your content" (accurate bylines); use of automation/AI should be evident "through disclosures or in other ways"; "Why" (made to help people, not to attract search visits) is "perhaps the most important question". First-hand experience examples include "having actually used a product or service". [Primary] — [Google Search Central](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- Quality Rater Guidelines were substantially updated in January 2025 and again in September 2025. Secondary summaries say the January 2025 version tells raters to give Lowest ratings where nearly all main content is auto/AI-generated, copied, or reposted with little added value, and that YMYL is framed by potential for harm. [Weak — secondary SEO blogs; the PDF itself was not read] — [iPullRank on QRG and YMYL](https://ipullrank.com/eeat-ymyl-ai-search), [Wix summary](https://www.wix.com/seo/learn/resource/google-search-quality-guidelines)
- Site reputation abuse policy targets third-party content published on a host "mainly because of that host's already-established ranking signals". [Primary] — [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- Evidence that a single-author, non-clinician, evidence-citing site can hold a Ferber ranking: Parenting Science's Ferber page appears in results. [Primary observation] — [Parenting Science](https://parentingscience.com/ferber-method)

### Inferences
- Legitimate E-E-A-T steps for this author: a real-name byline and an "About the author" stating plainly "parent, not a clinician"; a first-hand account (what the author's own nights looked like, with the app's logged crying minutes as original data); inline citations to Ferber's book (edition and page/chapter) and peer-reviewed trials; a visible "last reviewed" date; a short editorial/sourcing policy page; a clear "talk to your pediatrician" boundary (age under ~4-6 months, illness, feeding concerns); contact details and the privacy policy already on the site.
- A paid one-off medical review (pediatrician, pediatric nurse practitioner, or certified sleep consultant) with a named "Reviewed by" line is legitimate only if the review really happened and the reviewer agrees to be named. It is the single strongest trust upgrade available, but there is no Google documentation promising a ranking effect.
- The site should not host guest/sponsored third-party articles, and the author should not seek "parasite" placements on other hosts; both sit close to the site reputation abuse policy.

### Gaps
- Lily Ray / Glenn Gabe analyses of non-expert health sites after the 2025-2026 core updates were not found by search. No data on how small non-clinician parenting sites fared in the March 2026 core update.
- Whether Google's "helpful content" classifier (folded into core ranking in March 2024, per my prior knowledge; not re-verified here) still applies site-wide signals was not re-sourced.
- Bing's guidance on YMYL/author quality was not researched.

## 4. AI Overviews: click loss and which queries still send clicks

### Takeaway
Multiple independent studies agree that informational queries with an AI Overview send roughly half or fewer of the clicks they used to, and health informational queries trigger AI Overviews at very high rates. Plain "what is the Ferber method" content is therefore the worst-paying part of this niche; do-something queries (timer, printable, app) are the safer bet, though that last point is inference, not measured.

### Cited Findings
- Ahrefs (300,000 keywords, aggregated Search Console desktop CTR, Dec 2023 vs Dec 2025): position-1 CTR on AI Overview keywords fell from 0.073 to 0.016; versus a no-AIO forecast of 0.037 this is about 58% lower. Effect by position: #1 -58.0%, #2 -50.8%, #3 -46.4%, #10 -19.4%. Informational keywords without AIO also fell (0.076 to 0.039). Correlational, desktop only. Ahrefs' earlier April 2025 study found -34.5%. [Study] — [Ahrefs: AI Overviews Reduce Clicks by 58%](https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/)
- Pew Research (July 2025, panel browsing data): users clicked a result on about 8% of visits with an AI summary vs 15% without; about 1% clicked a source link inside the AI summary. Google disputed the study. [Study, via trade coverage] — [The Decoder on Pew](https://the-decoder.com/pew-finds-that-only-1-percent-of-users-click-a-source-link-directly-from-googles-ai-overviews/), [PPC Land on Google's dispute](https://ppc.land/google-disputes-pew-study-showing-ai-overviews-reduce-clicks-by-half/)
- Seer Interactive (Nov 2025; 3,119 informational terms across 42 client organisations, June 2024-Sept 2025): organic CTR on AIO queries down 61%, paid down 68%. Client-sample bias applies. [Study, via trade coverage] — [PPC Land on Seer](https://ppc.land/google-ai-overviews-reduce-organic-ctr-61-paid-traffic-68/)
- WebFX study of 130,070 health queries (July 2025 data): AI Overviews on 51% of healthcare searches; 66.9% of informational, 45.4% of commercial, 35.3% of transactional health queries. [Weak-to-moderate — agency study, seen via syndication summary] — [WebFX](https://webfx.com/blog/healthcare/ai-overviews-in-healthcare)
- A roundup attributes to Seer (April 2026) that question-format queries trigger AIOs 85.9% of the time, and gives a cross-study range of roughly 17% to 89% for healthcare trigger rates, showing how method-dependent these numbers are. [Weak — aggregator] — [getairefs roundup](https://getairefs.com/blog/google-ai-overviews-statistics-june-2026/)
- SE Ranking: health-related AI Overviews cite YouTube 2-3x more often than trusted medical sites. [Study, headline only read] — [SE Ranking](https://seranking.com/blog/health-ai-overviews-youtube-vs-medical-sites/)

### Inferences
- Queries like "what is the Ferber method", "ferber method age", and "does Ferber work" are question-style health informational queries and are very likely answered in an AI Overview; even a top-3 ranking would yield few clicks.
- Queries whose answer is an object or an action (a printable chart file, a running timer, an app download, a personalised "tonight's intervals" result) cannot be fully satisfied inside an AI Overview, so they should retain a higher click share. I found no study that measures this specific split; treat it as a reasoned hypothesis.
- Being cited inside AI Overviews/ChatGPT/Perplexity still has brand value even at about 1% click-through; the site's existing llms.txt and open robots.txt are consistent with that. The YouTube citation finding suggests a short, accurate explainer video could earn AI Overview citations that a new text site cannot.

### Gaps
- No parenting-specific AI Overview trigger or CTR data was found.
- No measured evidence on tool/calculator/app queries versus informational queries inside AI Overviews.
- BrightEdge's claim (100% of treatment/procedure queries showing AIOs in Dec 2025) was seen only via a vendor blog and is unverified.

## 5. Free interactive tools and printables as link and traffic magnets

### Takeaway
The "tools earn links" claim is supported mostly by big-brand examples and practitioner anecdotes, not rigorous data for small sites. For Check In the stronger argument is competitive: there is no free web Ferber timer in results, and the "chart printable" space is occupied by spam.

### Cited Findings
- No controlled study on calculators/tools and backlinks for small sites was found; available evidence is vendor blogs and anecdotes. [Primary observation of the literature]
- Large-brand examples: SoFi's free tools reportedly get over 2 million annual visits and 188,029 backlinks. [Weak — agency case study] — [Foundation Inc on SoFi](https://foundationinc.co/lab/sofi)
- Search Engine Journal's link-building guide profiles niche tools (a tyre-size calculator, an embed-code generator) as having healthy link counts for small companies, without hard figures. [Trade, anecdotal] — [SEJ: free tools](https://searchenginejournal.com/link-building-guide/free-tools)
- No free web-based Ferber timer appeared in results for "sleep training timer online free ferber interval timer web"; results were iOS apps and aggregators. [Primary observation, 17 Nov 2026] — [example result: Smart Sleep Coach](https://smartsleepcoach.com/blog/sleep-training/ferber-method)
- "Ferber Method Chart Printable" results are occupied by doorway spam on hijacked subdomains. [Primary observation] — [example](https://lbas.lboro.ac.uk/en/ferber-method-chart-printable.html)
- Doorway abuse is defined as "sites or pages ... created to rank for specific, similar search queries", e.g. "substantially similar pages that are closer to search results than a clearly defined, browseable hierarchy". [Primary] — [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)

### Inferences
- Three tools are worth building, all as static client-side pages that fit GitHub Pages and need no analytics:
  1. Web Ferber timer: pick night number, tap "check-in done", see the next wait. Reuses the logic in `src/lib/ferber.ts`. Honest limitation to state on the page: a browser tab cannot reliably alert with the phone locked, which is exactly why the app exists (natural, truthful call to action).
  2. Chart generator + printable PDF: standard chart, plus a "gentler" or custom start, with a print stylesheet and a downloadable one-page PDF. Also the right asset for Pinterest (section 10).
  3. "Which night am I on / what are tonight's waits" calculator: start date in, tonight's intervals out, including what to do after a missed night.
- Each tool page should carry real explanatory text (how to use, where the numbers come from, Ferber's own caveat that intervals are flexible) so it is a useful page, not a thin widget.
- Build one tool per distinct job. Do not create "ferber timer night 1", "ferber timer night 2" ... as separate near-identical pages; that pattern matches the doorway definition above.
- The site's chart must match `FERBER_DEFAULT_CHART` in the app (project rule), and should cite the book as the source. Note that at least one published chart differs: Sleep Foundation lists day 2 as 5/10/12 minutes, so the page should say which edition/source its numbers come from.

### Gaps
- No small-site case study with referring-domain counts over time for a parenting or health calculator was found.
- Whether an embeddable version of the chart (iframe/snippet with credit link) would be adopted by sleep-consultant blogs is untested; widget links with keyword-rich anchors are a known link-spam risk, so any embed should use a plain branded credit link.

## 6. Long-tail / hub-and-spoke content plan and thin-content risk

### Takeaway
A small set of deep, experience-backed spoke pages around the existing guide is defensible; mass-produced near-duplicates (per-night, per-month-of-age) risk the scaled content abuse and doorway policies. Even good new pages rarely reach the top 10 within a year.

### Cited Findings
- Scaled content abuse: "when many pages are generated for the primary purpose of manipulating search rankings" (applies regardless of whether AI, humans, or both produce them). [Primary] — [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- Doorway abuse definition as in section 5. [Primary] — [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- Existing results for "night 1/2/3" are general guides rather than dedicated per-night pages; common claims in them: night 1 crying often 30-90 minutes, night 2 or 3 often worse ("extinction burst"), improvement commonly in 3-5 nights, naps can take about 2 weeks. These are blog-level claims, not trial data. [Weak] — [Sleep Foundation](https://sleepfoundation.org/baby-sleep/ferber-method), [Care.com](https://www.care.com/c/breaking-down-the-ferber-method-easy-step-by/)
- Ahrefs (2025 update, about 1M URLs first crawled Sept 2023): only 1.74% of new pages reached Google's top 10 within a year (5.7% in the 2017 study); of those that did, 40.82% got there within one month; 13.7% of top-10 pages were under a year old. A differently sampled Ahrefs figure of 6.11% also circulates. [Study] — [Ahrefs: How long does it take to rank](https://ahrefs.com/blog/how-long-does-it-take-to-rank/)

### Inferences
- Suggested page list, in priority order (each must stand alone as a page a tired parent would bookmark):
  1. Printable chart + chart generator (tool).
  2. Web timer (tool).
  3. "Ferber method night by night: what nights 1-7 usually look like" — ONE page with anchors per night, not seven pages. Add original content: anonymised real logs or the author's own nights.
  4. "Ferber method not working: 9 things to check" (troubleshooting: inconsistent check-ins, bedtime too early/late, feeding to sleep, illness, check-ins that stimulate, night 2-3 spike).
  5. "Night wakings and night feeds during Ferber" (when to restart the intervals, feed-vs-wait; strong pediatrician caveat).
  6. "Ferber for naps".
  7. "What age to start Ferber" (one page covering 4, 5, 6, 8, 12, 18 months and toddlers — not one page per age).
  8. "Ferber vs cry it out (extinction) vs chair method vs pick-up-put-down" (one comparison page with a table; cite trials).
  9. "Check-ins: what to say, how long to stay, who goes in" and "Two parents, one plan" (maps to the app's partner sync; genuinely under-covered).
  10. Situational pages only if the author has something real to say: room-sharing, twins, regressions/teething/illness/travel resets, daycare.
  11. "Ferber method apps and timers compared" — honest comparison including free competitors and a plain phone timer; disclose that the author makes one of them.
- Per-night and per-age-month pages as separate URLs would be substantially similar pages targeting similar queries — the pattern the doorway and scaled-content policies describe. Consolidated pages with jump links capture the same long tail more safely.
- Publish at a pace the author can keep honest (for example one solid page every week or two), each with sources and a reviewed date, rather than a batch of 30 AI-drafted pages.

### Gaps
- No query-level demand data to rank these pages (section 2 gap).
- No evidence found specific to parenting sites being hit by the scaled content abuse policy.

## 7. Domain strategy: github.io project path vs custom domain, and migration

### Takeaway
Move to a custom domain now, while there is almost no history to lose: GitHub Pages issues real 301s that preserve the path from a project site to its custom domain, but Search Console's Change of Address tool cannot be used for a path-level property, so the move rests on redirects, canonicals, and the sitemap alone.

### Cited Findings
- Direct test, 17 Nov 2026: a GitHub Pages project site with a custom domain returns HTTP 301 with the path preserved. `https://twbs.github.io/bootstrap/` → `301` to `http://getbootstrap.com/`; `https://twbs.github.io/bootstrap/docs/5.3/getting-started/introduction/` → `301` to `http://getbootstrap.com/docs/5.3/getting-started/introduction/`. Note the `/bootstrap/` path segment is dropped, and the Location header was http:// (a second hop to https follows where HTTPS is enforced). [Primary — my own curl test] — [twbs.github.io/bootstrap](https://twbs.github.io/bootstrap/)
- Several third-party posts claim project sites do not redirect or that GitHub Pages cannot do 301s; the test above contradicts that for the custom-domain case. GitHub Pages still offers no arbitrary per-URL redirect rules. [Weak, conflicting] — [opensource.com](https://opensource.com/article/19/7/permanently-redirect-github-pages)
- GitHub docs: a custom domain set on a user/organisation site is inherited by all project sites of that account, and a project repo can override with its own custom domain; GitHub recommends a `www` subdomain plus apex (the other redirects to the configured one) and recommends verifying the domain first to prevent takeover. [Primary] — [GitHub Docs: About custom domains and GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)
- Google: for site moves use server-side permanent redirects (301/308); avoid chains (ideally direct, at most a few hops); don't redirect many old URLs to one unrelated page; "Keep the redirects for as long as possible", generally at least one year; "Expect temporary fluctuation in site ranking during the move." [Primary] — [Google: Site moves with URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- Google Change of Address tool: works only at domain/subdomain level — "You cannot move properties at the path level, such as http://example.com/petstore/". Requires ownership of both properties and a 301 from the old homepage. Effect lasts 180 days. [Primary] — [Search Console Help: Change of Address](https://support.google.com/webmasters/answer/9370220?hl=en)
- Current state check: `https://levib35061.github.io/Ferber-App/robots.txt` serves correctly, but `https://levib35061.github.io/robots.txt` (the host root, which is where crawlers actually look for robots.txt) returns GitHub's 404 page. A project-path robots.txt is not read by crawlers; the sitemap line in it therefore is not discovered that way (the sitemap can still be submitted directly in Search Console/Bing). [Primary — my own curl test] — [project robots.txt](https://levib35061.github.io/Ferber-App/robots.txt)

### Inferences
- Limits of staying on `levib35061.github.io/Ferber-App/`: the URL contains "Ferber-App" (the project rule says not to brand the app as "Ferber"), looks unofficial to parents, journalists, and bloggers deciding whether to link; robots.txt is ineffective at a subpath; the Search Console property is a URL-prefix path property with no Change of Address option later; and the brand cannot build its own host-level reputation. I found no Google statement that github.io subdomains are ranked lower as such — the disadvantage is trust, linkability, and control, not a documented penalty.
- Migration recipe for this repo: buy domain → verify it in GitHub account settings → add it as the custom domain on the Ferber-App repo (creates `CNAME`) → DNS: apex A/AAAA records to GitHub Pages + `www` CNAME → enable Enforce HTTPS → update every absolute URL in `site/` (canonical tags, `sitemap.xml`, `robots.txt`, `llms.txt`, JSON-LD `url`, Open Graph) and the App Store marketing/support/privacy URLs → add the new domain as a Domain property in Search Console and a site in Bing Webmaster Tools, submit the new sitemap → keep the old URL-prefix property to watch the 301s being processed. The redirect persists only while the custom domain stays configured on the repo.
- Because the site is new and has little ranking history, the cost of moving now is near zero and grows with every link earned to the github.io URL.
- Domain name: prefer a brandable name that includes a descriptive word (for example something with "checkin" plus "sleep"/"baby") over a pure exact-match "ferbermethod..." domain. Reasons: the project rule against "Ferber" in the app name, possible trademark/association sensitivity around Dr. Ferber's name, and my understanding (not re-sourced here) that Google reduced the exact-match-domain advantage in 2012 and treats keyword domains as a minor signal at most.

### Gaps
- Domain price not sourced; my general knowledge is roughly $10-15 per year for a .com at cost-price registrars — verify at purchase.
- No current authoritative source was fetched on exact-match/partial-match domain value in 2025-2026.
- Bing's site-move tool and whether it accepts path-level moves was not checked.
- Whether GitHub's 301 from the project path lands on https directly when Enforce HTTPS is on (one hop vs two) should be tested after setup.

## 8. Honest, realistic link building for this niche

### Takeaway
Journalist-request platforms still exist after Connectively's closure (HARO revived under Featured, plus Qwoted and Source of Sources), but a non-clinician parent is a weak fit for health quotes; the tools/printable plus direct outreach to sleep consultants and parenting bloggers is the better use of limited time. Evidence on which channels pay off for a site like this is thin.

### Cited Findings
- Connectively (formerly HARO, owned by Cision) shut down on 9 December 2024. [Trade/Weak, multiple agreeing sources] — [Inbound Blogging](https://inboundblogging.com/?p=8410), [BuzzStream](https://www.buzzstream.com/blog/haro/)
- Featured.com acquired the HARO brand and relaunched it in April 2025 (described by one source as a paid platform — pricing unverified). [Weak] — [blckalpaca overview](https://blckalpaca.at/en/knowledge-base/seo-geo/off-page-seo-link-building/haro-alternatives-2026-featured-qwoted-and-source-of-sources)
- Source of Sources (SOS), launched by HARO's original founder Peter Shankman, is free; other active options named: Qwoted, Featured, ProfNet, SourceBottle, Help a B2B Writer. [Weak/Trade] — [Zapier: HARO alternatives](https://zapier.com/blog/haro-alternatives/), [blckalpaca overview](https://blckalpaca.at/en/knowledge-base/seo-geo/off-page-seo-link-building/haro-alternatives-2026-featured-qwoted-and-source-of-sources)
- Link spam is "creating links to or from a site primarily for the purpose of manipulating search rankings", including low-value content created mainly for links. [Primary] — [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- App aggregator/directory sites (AppAdvice, appshunter, mwm.ai, marlvel.ai) already list and rank for competitor Ferber apps. [Primary observation] — [AppAdvice](https://appadvice.com/app/sleep-trainer-ferber-method/1555062851)

### Inferences
- Ranked by expected value for this founder (judgement, not data):
  1. Sleep consultants and parenting bloggers: offer the free printable chart and web timer as a resource for their clients/readers, and free app codes. They already write Ferber posts and need something to link to for "print the chart" or "use a timer". Highest relevance.
  2. Founder/"parent who built it" story: indie-maker channels (Product Hunt, Indie Hackers, Show HN, relevant subreddits where self-promotion is allowed, local news, alumni newsletters). Links are often nofollow and off-topic, but they bring first users, App Store ratings, and brand searches.
  3. App directories and review sites: low effort, low value per link, but they already rank for "ferber app" queries, so being listed puts Check In where those searchers land.
  4. Journalist requests (SOS, Qwoted, Featured/HARO): respond only where the ask is for a parent's experience or an app-maker's view, and never imply clinical expertise. Low hit rate expected for a non-clinician on health topics.
  5. Podcast guesting (parenting, dad, indie-dev shows): modest link value, good trust and story value.
  6. University/hospital/public-health resource pages: rarely link to commercial app sites by non-clinicians; low odds unless a medical reviewer or a genuinely unique free tool exists. Low priority.
- Avoid (spam-policy risk or dishonest): buying links or "guest post" placements, link exchanges at scale, widget embeds with keyword-stuffed anchors, fake reviews or testimonials, paying for directory "featured" dofollow links, posting as a fake parent on Reddit/forums. Disclose being the maker whenever recommending the app in a community.

### Gaps
- No data on reply or placement rates for Qwoted/Featured/SOS in parenting topics, and current pricing/tiers of each platform were not verified on their own sites.
- No case study found of a baby-sleep app or small parenting site earning links via any of these channels.
- Help a B2B Writer is B2B-focused; relevance to a consumer parenting app is likely near zero (my judgement).

## 9. Structured data, Smart App Banners, and measuring web → App Store without analytics

### Takeaway
FAQ rich results are now completely gone (ended 7 May 2026), so the site's FAQPage JSON-LD is harmless but earns no visible result; the SoftwareApplication rich result requires a rating or review, which a new app cannot honestly supply yet. App Store Connect campaign links (pt/ct) work in plain links and in the Smart App Banner and give download attribution with no site analytics.

### Cited Findings
- FAQ rich results stopped appearing in Google Search on 7 May 2026 for all sites (they had been limited to authoritative government/health sites since August 2023). Search Console's FAQ report/filter and Rich Results Test support were removed in June 2026; API support ends August 2026. Google says the markup can remain on pages without causing problems. [Trade, reporting Google documentation] — [Search Engine Journal](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/)
- HowTo rich results were deprecated in 2023 (SEJ notes the August 2023 mobile deprecation as part of the same change). [Trade] — [Search Engine Journal](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/)
- SoftwareApplication rich result: `name` and `offers.price` are required, and "You must include one of the following properties: aggregateRating or review." `applicationCategory` and `operatingSystem` are recommended. "Google also supports MobileApplication and WebApplication." Spammy markup can lead to manual action. [Primary] — [Google: Software app structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- App Store Connect campaign links: format `https://apps.apple.com/app/apple-store/id<APPID>?pt=<provider>&ct=<campaign>&mt=8`. `ct` = campaign name, up to 30 characters; `pt` identifies the developer account and is the same for all campaigns. Reported per campaign: impressions, product page views, downloads, usage, sales. Thresholds: a campaign appears only after first-time downloads from at least 5 users, each metric needs at least 5 in the date range, and after at least 24 hours. A first-time download is credited if it happens within 24 hours of the click; the most recent link gets credit. Links can only be generated once the app has analytics data. [Primary] — [Apple: Campaign links](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/)
- Apple's campaign-links page covers adding the `ct` and `pt` tokens to Smart App Banners. A developer-forum example shows the form `<meta name="apple-itunes-app" content="app-id=..., app-argument=..., affiliate-data=pt=...&ct=...&mt=8">`. [Primary for the capability; forum-level for the exact syntax] — [Apple: Campaign links](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/), [Apple Developer Forums thread](https://developer.apple.com/forums/thread/803466)
- Smart App Banner `app-argument` passes a URL to the installed app; it is not an attribution mechanism. [Primary] — [Apple: Promoting apps with Smart App Banners](https://developer.apple.com/documentation/webkit/promoting-apps-with-smart-app-banners.md)

### Inferences
- Keep the existing FAQPage JSON-LD only if the questions are visibly on the page; expect no rich result. It may still help machine parsing, but there is no Google statement that it does.
- Add `MobileApplication` JSON-LD (name, operatingSystem iOS, applicationCategory, offers with the real price model) for clarity. Do NOT add `aggregateRating`/`review` until real App Store ratings exist, and then only mirror the true App Store numbers; without them the page simply is not eligible for the app rich result. Marking up invented or self-written reviews would breach the honesty constraint and risks manual action.
- Add `Article` markup with `author` (Person, real name), `datePublished`, `dateModified` on the guide pages; `Organization`/`WebSite` on the home page; `BreadcrumbList` once there are spokes. These support clear authorship rather than a rich result.
- Measurement plan without analytics: use a different `ct` per placement and page type — for example `web-guide`, `web-timer`, `web-chart`, `web-help`, `pinterest-chart`, `youtube-explainer`, `banner-guide`. Low volumes will sit below the 5-download threshold, so use long date ranges and few campaigns at first (too many tokens will each stay under the threshold).
- The Smart App Banner shows only in Safari on iOS; visible App Store badge links with campaign tokens are still needed for other browsers and desktop (desktop visitors cannot install, so a QR code to the campaign link is useful).
- Search Console (clicks by page/query) plus App Store Connect (product page views and downloads by campaign, and the "Web Referrer" source type, from my prior knowledge — not confirmed on the page fetched) gives a two-stage funnel with no tracking script on the site, which fits the privacy posture.

### Gaps
- Apple's current official reference confirming the exact `affiliate-data` syntax for the banner was not located; test on a device.
- Whether App Store Connect still reports "Web Referrer" domains separately was not confirmed in the fetched page.
- Google's review-snippet rules on self-serving reviews for SoftwareApplication were not read.
- Bing's supported structured data and any Bing app-result features were not researched.

## 10. Pinterest and YouTube as search engines for parenting content

### Takeaway
Pinterest is large and parents are an active audience, and health AI Overviews cite YouTube heavily, but I found no data on traffic from printable-chart pins or Ferber explainer videos; treat both as cheap experiments attached to assets being built anyway.

### Cited Findings
- Pinterest scale: sources conflict — 537 million MAU (Q1 2025), 619 million (Q4 2025 results), 631 million (Q1 2026). Not checked against investor releases. [Weak, conflicting] — [Hootsuite Pinterest statistics](https://blog.hootsuite.com/pinterest-statistics/), [Everything PR](https://everything-pr.com/what-619-million-pinterest-users-actually-search-for-2026-category-map)
- Pinterest published its first Parenting Trend Report for 2026 ("thoughtful parenting"; searches for "positive discipline" +295%, "authoritative parenting" +115%), showing it treats parents as a core audience. [Trade] — [Social Media Today](https://www.socialmediatoday.com/news/pinterest-publishes-inaugural-parenting-trend-report/813030/)
- One guide claims a well-made pin drives traffic for 3-6 months or longer. [Weak] — [poster.ly guide](https://poster.ly/guides/pinterest-guide)
- Health-related AI Overviews cite YouTube 2-3x more than trusted medical sites. [Study, headline only] — [SE Ranking](https://seranking.com/blog/health-ai-overviews-youtube-vs-medical-sites/)

### Inferences
- The printable chart (section 5) doubles as a Pinterest asset: a tall chart image pinned to the chart page with a campaign-tagged App Store link on that page. Marginal cost is small once the chart exists.
- One short, accurate YouTube video ("Ferber check-in intervals explained in 90 seconds", screen recording of the chart/timer, real-name narration, links to the site and sources) is worth making for AI Overview/YouTube search exposure; the same clip can serve as the App Store preview source material. The same YMYL honesty rules apply: no clinical claims, cite the book.

### Gaps
- No statistics on outbound click rates for parenting or printable pins, and no evidence on search demand for Ferber charts inside Pinterest or YouTube (check Pinterest Trends and YouTube autosuggest directly).
- No case study of a small parenting app getting installs from Pinterest or YouTube.

## 11. Timeline, traffic expectations, and what to track

### Takeaway
Expect little organic traffic for the first 6-12 months and plan for long-tail and tool queries rather than head terms; the best available data says under 2% of new pages reach the top 10 within a year, and even ranked informational pages now get roughly half the clicks they did before AI Overviews.

### Cited Findings
- Only 1.74% of new pages reached Google's top 10 within one year (Ahrefs, about 1M URLs first seen Sept 2023); of those that did, about 41% did so within a month; 13.7% of top-10 pages are under a year old. [Study] — [Ahrefs](https://ahrefs.com/blog/how-long-does-it-take-to-rank/)
- Position-1 CTR on informational keywords fell to about 3.9% (no AIO) and about 1.6% (with AIO) in Dec 2025 desktop data. [Study] — [Ahrefs](https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/)
- Site moves cause "temporary fluctuation in site ranking"; medium sites may take a few weeks or longer for new URLs to replace old ones. [Primary] — [Google: site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- App Store Connect campaign data needs at least 5 first-time downloaders per campaign before it shows. [Primary] — [Apple: Campaign links](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/)

### Inferences
- Realistic expectation (judgement, no benchmark found): months 0-3 mostly indexing and brand/app-name queries; months 3-9 first impressions and a trickle of clicks on tool/printable and troubleshooting long-tail if the pages are good and a handful of relevant links arrive; meaningful, steady organic installs are plausible only after roughly a year, and may never come from head terms. Web search is a slow secondary channel next to App Store search for this app.
- Illustrative arithmetic to keep expectations honest: at a 1.6-3.9% position-1 CTR, a query with 1,000 monthly searches yields roughly 16-39 visits a month even when ranked first, before any click-through to the App Store and before the install rate. Tool and app-intent queries should do better per impression, but the volumes are smaller.
- Search Console tracking list: (1) Pages → indexing status of every URL after each publish and after the domain move; (2) Performance by query: impressions first, then average position, for the target long-tail set; (3) queries containing "timer", "app", "chart", "printable", "pdf", "calculator" as a saved regex filter; (4) brand queries ("check in baby sleep timer", "check in app ferber") as the signal that other channels are working; (5) CTR by page to spot AI Overview-suppressed pages; (6) Links report for new referring domains; (7) the old github.io property for 301 processing after migration. In Bing Webmaster Tools: same, plus its keyword research tool and IndexNow submission on publish (IndexNow from my prior knowledge, not sourced here).
- Outcome metric: App Store Connect downloads and product-page views by campaign token, compared with Search Console clicks per page, monthly.

### Gaps
- No benchmark traffic data for new small sites in the baby-sleep niche was found.
- No web-to-App-Store conversion-rate benchmark for content sites was researched.
- Bing/Copilot traffic share for parenting queries was not researched.
