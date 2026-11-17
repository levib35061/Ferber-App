# ASO, App Store featuring, ratings and pricing evidence for "Check In: Baby Sleep Timer" (as of Nov 2026)

Evidence labels used below: **[Apple]** = Apple developer documentation or a live App Store page fetched for these notes; **[Vendor]** = ASO/monetization vendor blog (marketing incentive, treat with caution); **[Anecdote]** = single developer write-up; **[Old]** = pre-2024 evidence.

Research caveat: most findings come from search-result summaries plus a handful of fully fetched pages (Apple's search, ratings, getting-featured, Small Business Program and Product Page Optimization pages; the ConsultMyApp test; an Appfigures article; two competitor App Store pages). Where only a search summary was seen, the claim is marked "(search summary only)".

## 1. Current App Store search ranking factors (title, subtitle, keyword field, screenshots, description, locales)

### Takeaway
Apple itself confirms only that search uses text matches on title, subtitle, keyword field and primary category, plus user behavior (downloads, ratings and reviews). Screenshot-caption indexing (reported June 2025) is unconfirmed by Apple and the one test found is close to negative; the extra Spanish (Mexico) keyword field for the US storefront is consistently reported by vendors but not documented by Apple.

### Cited Findings
- [Apple] Search results are based on text relevance (matches for title, subtitle, keywords, primary category) and user behavior (downloads, ratings and reviews, "and more"). Primary and optional secondary category are indexed. — [Apple: Discovery on the App Store / Search](https://developer.apple.com/app-store/search/)
- [Apple] Promotional text does not affect search ranking. — [Apple: Search](https://developer.apple.com/app-store/search/)
- [Apple] Keyword field: 100 characters, comma-separated with no spaces after commas (spaces allowed inside a phrase, e.g. `Property,House,Real Estate`). Do not repeat words already in the app name, subtitle or category. Avoid plurals of words already included ("climbs" and "climb" count as duplicates), generic terms like "app", filler words like "the" and "to", and special characters. — [Apple: Search](https://developer.apple.com/app-store/search/)
- [Apple] Do not include unauthorized trademarked terms, celebrity names, irrelevant terms or competing app names; improper keyword use is "a common reason for App Store rejections". — [Apple: Search](https://developer.apple.com/app-store/search/)
- [Apple] Popular terms are highly competitive "especially for newer or smaller apps"; less common terms bring less traffic but less competition. — [Apple: Search](https://developer.apple.com/app-store/search/)
- [Vendor, search summary only] Fields most often listed by ASO sources as indexed on iOS: title, subtitle, keyword field, in-app purchase names, in-app event titles. The long description is said not to feed iOS ranking (unlike Google Play). — [Appradar ranking factors](https://appradar.com/academy/app-store-optimization-guide/app-store-ranking-factors/); [SplitMetrics ranking factors](https://splitmetrics.com/blog/apple-app-store-ranking-factors/)
- [Vendor, search summary only] Several ASO blogs claim Apple began extracting screenshot caption text (OCR) and using it in search around a detected algorithm change in early June 2025. — [appdrift](https://appdrift.co/blog/app-store-screenshot-text-indexing); [Shotlingo on dev.to](https://dev.to/shotlingo/apple-now-indexes-screenshot-text-why-screenshot-captions-are-an-aso-ranking-factor-in-2026-4lh7)
- [Vendor test, fetched] ConsultMyApp tested 64 screenshot-derived phrases across 8 large US apps (Audible, Libby, Indeed, DoorDash, Duolingo, PictureThis, Cash App, PayPal) around mid-June 2025: 36 phrases did not rank at all, 27 were explained by other metadata, and only 1 (an Audible phrase) was unexplained. Conclusion: "no strong evidence" Apple broadly indexes screenshot titles; keep captions keyword-aligned but do not rely on them. — [ConsultMyApp](https://consultmyapp.squarespace.com/blog/-is-apple-now-indexing-screenshot-titles-on-the-app-store)
- [Vendor, search summary only] AppTweak says there is no conclusive proof screenshot text is a direct ranking factor; Apple has published no statement on it. — [AppTweak](https://www.apptweak.com/en/aso-blog/ai-reshaping-app-store-relevance?format=md)
- [Vendor, search summary only] Cross-localization: the US storefront is reported to index the Spanish (Mexico) locale's metadata alongside English (US), giving roughly another 100 keyword characters. English terms placed there reportedly index for US English searches. Words do not combine into phrases across locales (each locale's title + subtitle + keywords are indexed as a separate set). Other US secondary locales listed by ASO sites: Russian, Chinese, Arabic, French, Portuguese (Brazil), Vietnamese, Korean. — [AppTweak cross-localization](https://www.apptweak.com/en/aso-blog/how-to-benefit-from-cross-localization-on-the-app-store); [MobileAction](https://www.mobileaction.co/blog/app-store-cross-localization/); [aso.dev](https://aso.dev/aso/cross-localization/)
- [Vendor, search summary only] The list of locales indexed per storefront has changed over time (the US store once used Spanish (Spain)), so it should be re-checked before relying on it. — [Sensor Tower](https://sensortower.com/blog/ios-keyword-localization-guide)

### Inferences
- The relative weight "title > subtitle > keyword field" is ASO folklore; Apple's page lists the fields without weights. Treat title-first ordering as reasonable practice, not a documented rule.
- Because phrases do not combine across locales, a Spanish (Mexico) field should hold self-contained terms (e.g. `ferber method`, Spanish terms such as "dormir bebe") rather than halves of phrases whose other half lives in the English (US) name.
- Screenshot captions should be written for humans first; any ranking effect is a possible bonus, not something to plan around.

### Gaps
- No Apple statement on weights, on screenshot-text indexing, or on which secondary locales each storefront indexes.
- I did not fetch Apple's page stating the 30-character limits for name and subtitle in this session; these limits are long-standing but should be confirmed in App Store Connect.

## 2. Niche keyword strategy ("ferber", "sleep training", "cry it out") and trademark risk

### Takeaway
No public popularity or difficulty numbers were found for these terms; they must be looked up in the Apple Ads keyword tool or an ASO tool. Live competitor listings show "Ferber" used freely in app names and subtitles, but no source was found confirming whether the term is trademark-safe.

### Cited Findings
- [Vendor, search summary only] Apple's Search Popularity is a relative index (5-100 in ASO tools; 1-5 in Apple Ads UI), not a search count; no public source reports exact App Store search counts. — [MobileAction glossary](https://www.mobileaction.co/glossary/what-is-search-popularity-apple-search-ads/); [Sonar](https://trysonar.app/blog/real-search-volume)
- [Vendor, search summary only] From 29 Sep 2025 the number of US keywords with Apple Ads popularity above 5 reportedly dropped from 165,875 to 39,254, so older popularity figures are not comparable and many niche terms now show the floor value. — [aso.dev](https://static.aso.dev/blog/apple-ads-popularity-massive-drop/)
- [Apple, live page] "Oona" is now listed as **"Oona: Ferber Method Timer"**, subtitle "Baby Sleep Training Guide", $1.99, 4.9 from 24 ratings, Health & Fitness, by Thomas Pang; 1.0 released 17 Jun 2025 with eight versions since. (The brief called it "Oona: Sleep Training Timer"; it appears to have moved "Ferber Method" into the name.) — [App Store: Oona](https://apps.apple.com/us/app/oona-sleep-training-timer/id6747005575)
- [Apple, live page] "Sleep trainer - Ferber method", subtitle "Baby Sleep Coach and Guide", $2.99, 4.5 from 11 ratings, Lifestyle, by Nisha Kamra; last updated 12 Oct 2024. — [App Store: Sleep trainer - Ferber method](https://apps.apple.com/us/app/id1555062851)
- [Apple, live page] Another competitor not in the brief: "Ferber Friend: Sleep Training", subtitle "Ferber Method Sleep Timer" (shown under Oona's "You Might Also Like"). — [App Store: Oona](https://apps.apple.com/us/app/oona-sleep-training-timer/id6747005575)
- [Search summary only] "Baby Sleep Trainer - Ferber" (id 6760542352) is free with no subscriptions and has too few ratings to display a summary. — [App Store](https://apps.apple.com/app/id6760542352)
- [Apple] Keyword field must not contain "unauthorized trademarked terms ... or other protected words and phrases" or competing app names. — [Apple: Search](https://developer.apple.com/app-store/search/)

### Inferences
- At least four live apps carry "Ferber" in the name or subtitle and have passed review repeatedly (Oona shipped eight versions), which suggests App Review does not currently treat "Ferber method" as a protected term. This is an observation, not legal clearance.
- Oona renaming itself to lead with "Ferber Method" is a signal that the developer found "ferber" terms to be the ones that convert or rank; the niche's searchers appear to search by method name.
- The project rule keeps "Ferber" out of the app name. The subtitle is then the strongest remaining place for "Ferber Method", since the keyword field is commonly believed to weigh less.
- With rivals at 11-24 ratings, ranking in the top few results for "ferber" terms is plausibly achievable with exact-match metadata and a few dozen ratings.

### Gaps
- No popularity/difficulty scores found for "ferber", "ferber method", "sleep training", "cry it out", "baby sleep timer". Action: check each in the Apple Ads keyword recommendation tool (free with an Apple Ads account) or an Astro/Appfigures trial.
- No source found on whether "Ferber" or "Ferber method" is a registered trademark, or on any App Store rejection for using it. A USPTO search is needed before relying on it.
- Competitor chart ranks and download estimates were not available on the pages fetched.

## 3. Is the drafted name / subtitle / keyword set good? Suggested improvements

### Takeaway
The draft wastes indexed space by repeating words across name and subtitle and leaves "Ferber" only in the keyword field while every direct competitor has it in name or subtitle. Move "Ferber Method" into the subtitle, remove repeats, and use a Spanish (Mexico) field for overflow terms.

### Cited Findings
- [Apple] Words in the name, subtitle or category should not be repeated in the keyword field; plurals are duplicates; filler words like "the"/"to" should be avoided. — [Apple: Search](https://developer.apple.com/app-store/search/)
- [Apple] Category names are indexed, so words in "Health & Fitness" / "Lifestyle" need not be spent in keywords. — [Apple: Search](https://developer.apple.com/app-store/search/)
- [Apple, live pages] Competitor metadata: "Oona: Ferber Method Timer" / "Baby Sleep Training Guide"; "Sleep trainer - Ferber method" / "Baby Sleep Coach and Guide"; "Ferber Friend: Sleep Training" / "Ferber Method Sleep Timer". — [Oona](https://apps.apple.com/us/app/oona-sleep-training-timer/id6747005575); [Sleep trainer](https://apps.apple.com/us/app/id1555062851)

### Inferences
- Draft name "Check In: Baby Sleep Timer" + subtitle "Sleep training check-in timer": "sleep", "timer" and "check in" each appear twice. Only "training" is new in the subtitle. Apple's guidance is about not repeating in the keyword field, but the same logic (a word indexed once gains nothing from repetition) is standard ASO reasoning.
- Suggested subtitle (28 characters): **"Ferber Method Sleep Training"**. This adds "ferber", "method", "training" and forms the exact phrases "ferber method" and "sleep training". Alternative that avoids repeating "sleep": "Ferber Method Training & Log".
- The drafted keyword field is exactly 100 characters, correctly formatted (no spaces after commas). Issues: "ferber" would move to the subtitle; "cry it out" spends characters on the filler word "it" (keep only if the exact phrase matters; "cry,out" is cheaper but may not match the phrase as well, unverified); "log" and "tracker" pit the app against Huckleberry-class trackers on terms where it cannot win.
- Suggested English (US) keyword field (if subtitle changes as above), 98 characters (counted): `cry it out,cio,graduated,interval,nap,toddler,infant,newborn,night waking,trainer,schedule,bedtime` .
- Suggested Spanish (Mexico) locale (name/subtitle may stay in English if the app is English-only; the keyword field can hold more English terms plus Spanish ones), 95 characters: e.g. `ferber method,sleep trainer,controlled crying,wake window,coach,dormir,bebe,sueño,entrenamiento`.
- Categories: Oona is in Health & Fitness, "Sleep trainer" in Lifestyle. Health & Fitness as primary is consistent with the closest, best-rated rival; no evidence found that one category ranks better for these terms.

### Gaps
- No experiment data on whether "cry it out" as a phrase outperforms split words.
- No evidence on which primary category gives better visibility for parenting utilities.

## 4. Screenshots, conversion rates, Product Page Optimization, Custom Product Pages, In-App Events

### Takeaway
Published conversion benchmarks are inconsistent (8.6% to 31% depending on definition) and largely recycled from one 2024 dataset; the only trustworthy benchmark is the peer-group one in App Store Connect. Product Page Optimization needs traffic a niche app will not have at launch; Custom Product Pages now work in organic search but are a later optimization.

### Cited Findings
- [Vendor, search summary only] Health & Fitness conversion rate quoted as 30.8% (Adapty, Adjust; Adjust also gives 23.2% elsewhere on the same page). AppTweak quoted US App Store average 25% for H1 2024 but 8.56% in its 2025 figures, indicating different definitions (page view to download vs impression to download). — [Adapty](https://adapty.io/blog/app-store-conversion-rate/); [Adjust](https://www.adjust.com/blog/what-is-a-good-conversion-rate); [AppTweak 2025 report](https://www.apptweak.com/aso-blog/aso-trends-benchmarks-report-2025)
- [Vendor, search summary only] One critical review says nearly all published category tables trace back to AppTweak's H1 2024 dataset, and recommends using the peer-group benchmark in App Store Connect instead. — [App Screenshot Studio benchmark check](https://appscreenshotstudio.com/app-store-conversion-benchmarks)
- [Apple] Product Page Optimization: test icons, screenshots and preview videos; up to 3 treatments against the original; one test at a time; up to 90 days; you choose the traffic share; results report impressions, conversion rate, improvement and confidence, targeting at least 90% confidence. New assets need App Review; icon tests need the icons in the binary. More localizations lengthen tests. — [Apple: Product Page Optimization](https://developer.apple.com/app-store/product-page-optimization/)
- [Vendor, search summary only] Custom Product Pages: since 30 Jul 2025 (announced WWDC25) keywords from the keyword field can be assigned to a CPP so it appears in organic search for those terms; keywords in the title or subtitle cannot be assigned; each keyword maps to one CPP; per-app limit raised from 35 to 70 on 29 Oct 2025. — [Phiture](https://phiture.com/blog/keyword-based-custom-product-pages-cpps-arrive-in-app-store-connect/); [MobileAction](https://www.mobileaction.co/blog/custom-product-pages-meet-organic-search/); [AppTweak CPP guide](https://www.apptweak.com/en/aso-blog/guide-to-custom-product-pages-cpp?format=md)
- [Vendor, fetched] Appfigures: 83 of the top 100 grossing US apps use CPPs, 30 of them with 30+ pages; the article gives no measured conversion uplift. — [Appfigures, 18 Jul 2025](https://appfigures.com/resources/insights/20250718)
- [Apple] In-App Events can appear on the Today, Games and Apps tabs, in search results and on the product page, and are a nominable content type for featuring. — [Apple: Getting featured](https://developer.apple.com/app-store/getting-featured/)
- [Apple] Editors consider the product page itself: "compelling screenshots, app previews, and descriptions, plus positive ratings and reviews". — [Apple: Getting featured](https://developer.apple.com/app-store/getting-featured/)

### Inferences
- First three screenshots (they are what shows in search results): (1) the countdown to the next check-in with a caption naming the method, e.g. "Ferber method check-in timer"; (2) the alert that fires when it is time to go in, with "Works with the screen locked"; (3) partner sync / "One purchase covers both parents" or the morning summary showing crying minutes falling night by night. Rationale: the competitors' differentiators are thin, and the app's unique points are lock-screen alerts, partner sync and no subscription. This is reasoning, not tested data.
- A PPO test needs enough impressions to reach 90% confidence; at tens of impressions a day a test would not conclude within 90 days. Change screenshots by judgment at launch and use PPO only once daily impressions are in the hundreds or more.
- A CPP for a keyword such as "cry it out" or "nap" is only worth building once those keywords show impressions; keywords in the title/subtitle (e.g. "ferber" if moved to the subtitle) cannot be assigned to a CPP.
- In-App Events suit time-bound content; a single-purpose timer has little natural event material. Low priority.
- App preview video: no evidence found either way for a utility; a 15-second clip of the timer and lock-screen alert is cheap but unproven.

### Gaps
- No reliable impression-to-download benchmark for small Health & Fitness utilities; no data on preview-video uplift; no data on caption wording tests.
- CPP organic-search rules were seen only via vendor summaries, not Apple's help page.

## 5. Ratings and reviews

### Takeaway
Apple confirms ratings influence search ranking and that few ratings discourage downloads, and limits the system prompt to three times per 365 days. Direct competitors sit at only 11-24 ratings, so the first 25-50 ratings are the realistic goal; no rigorous public study quantifies rating-count effects.

### Cited Findings
- [Apple] The system rating prompt (SKStoreReviewController) can be shown up to three times in a 365-day period; ask when users are most likely to feel satisfied (after completing a task) and do not interrupt them. — [Apple: Ratings and reviews](https://developer.apple.com/app-store/ratings-and-reviews/)
- [Apple] Ratings and reviews "can influence how your app ranks in App Store search"; the summary rating shows in search results; resetting ratings should be used sparingly because "having few ratings may discourage potential users". — [Apple: Search](https://developer.apple.com/app-store/search/); [Apple: Ratings and reviews](https://developer.apple.com/app-store/ratings-and-reviews/)
- [Apple] Developers can reply to any review; the reviewer is notified and can update the review; prioritize low-star and technical-issue reviews; replying can "improve your app's discoverability". — [Apple: Ratings and reviews](https://developer.apple.com/app-store/ratings-and-reviews/)
- [Apple, live pages] Competitor rating counts: Oona 4.9 (24), Sleep trainer - Ferber method 4.5 (11), Baby Sleep Trainer - Ferber not enough to display. — [Oona](https://apps.apple.com/us/app/oona-sleep-training-timer/id6747005575); [Sleep trainer](https://apps.apple.com/us/app/id1555062851); [Baby Sleep Trainer - Ferber](https://apps.apple.com/app/id6760542352)
- [Vendor, search summary only; weak] Claims about star-rating effects disagree: one says 4.5 vs 4.0 stars is a 20-30% conversion difference, another says 4.0-4.4 converts at 85-90% of the 4.5+ tier; none is sourced to data. — [Sonar](https://trysonar.app/blog/app-store-ratings-how-they-move-rankings); [AppFollow](https://appfollow.io/blog/app-rating-impact)

### Inferences
- Best prompt moment for this app: the morning after a clearly good night (e.g. night 3+, with fewer crying minutes than night 1), on the daytime Today summary, never during a night. Because the app is used for 1-2 weeks, most of the three yearly prompts will never be reached, so the first prompt must be well timed.
- Prompting only after the purchase or after night 3 biases toward satisfied users but shrinks the pool; with low volume, prompting on the first good morning (even during the free nights) likely yields more ratings.
- Passing Oona's 24 ratings with a 4.8+ average would make the listing look like the category leader among the dedicated timers.
- Replying to every review is feasible at this volume and is explicitly encouraged by Apple.

### Gaps
- No rigorous data on how many ratings change conversion or ranking; no data on prompt response rates for parenting apps.
- Apple's rules on custom pre-prompts and incentives are in the HIG / Review Guidelines, which were not fetched here.

## 6. Getting featured by Apple

### Takeaway
Nominate through Featuring Nominations in App Store Connect at least two weeks (ideally up to three months) before launch or a major update; it is free and takes minutes, but selection is editorial and odds for a small utility are unknown and probably low. Download-uplift figures are from 2018.

### Cited Findings
- [Apple] No checklist; editors consider user experience, UI design, innovation, uniqueness, accessibility, localization, and the product page (screenshots, previews, descriptions, positive ratings and reviews). — [Apple: Getting featured](https://developer.apple.com/app-store/getting-featured/)
- [Apple] Nominate via Featuring Nominations in App Store Connect for new apps, significant updates, In-App Events and "great stories". Minimum two weeks' notice; up to three months ahead for wider consideration. — [Apple: Getting featured](https://developer.apple.com/app-store/getting-featured/)
- [Apple] If considered, Apple may email Admin / App Manager / Marketing roles asking for promotional artwork; selected Today placements trigger a notification in the App Store Connect app. Editors' Choice and stories are curated per storefront. — [Apple: Getting featured](https://developer.apple.com/app-store/getting-featured/)
- [Search summary only] Nominations (launched in App Store Connect in late 2024) can be submitted singly or in bulk by CSV, in three types: new content, app enhancements, new app launches; a nomination does not guarantee featuring. — [TechCrunch, 13 Nov 2024](https://techcrunch.com/2024/11/13/apple-now-lets-app-developers-apply-to-be-featured-on-the-app-store); [AppTweak](https://www.apptweak.com/en/aso-blog/how-to-get-your-app-featured-on-the-apple-app-store)
- [Vendor, search summary only] Unofficial lead-time advice varies: 3 weeks, or 6-8 weeks before a new launch. — [App Screenshot Studio](https://appscreenshotstudio.com/blog/get-featured-on-the-app-store-2026-nominations-guide)
- [Old, 2018] Sensor Tower: featuring in the redesigned App Store raised downloads by up to 800%; App of the Day about 685%; 29% of featured apps came from publishers with under 10,000 downloads at the time. — [MacRumors, 20 Apr 2018](https://www.macrumors.com/2018/04/20/new-app-store-download-boost/)
- [Vendor, search summary only] Appfigures counted about 557K new app submissions in 2025, up 24% on 2024, implying more competition for editorial attention. — [Appfigures, 5 Dec 2025](https://appfigures.com/resources/insights/20251205/2-the-app-store-just-logged-its-biggest-release-year-in-nearly-a-decade)

### Inferences
- A percentage uplift on a tiny base is small in absolute terms; a collection placement for a niche utility might mean hundreds, not tens of thousands, of downloads. No current data supports a number.
- The app's strongest editorial angles map to Apple's listed criteria: "uniqueness" (calm, no-white night UI; undo instead of dialogs), "accessibility" (VoiceOver, Dynamic Type if implemented), privacy (no ads/tracking), and a founder story (a parent building it). Accessibility and localization are explicit criteria where a small app can still score.
- Realistic placement is a parenting or "new parents" themed collection or story rather than App of the Day. Submitting a nomination for launch and again for each significant update costs nothing.

### Gaps
- No published acceptance rates for nominations; no 2024-2026 data on download value of a feature for a small paid-unlock utility; no list found of recent Today-tab parenting stories.
- A MacTrast piece titled "Being Featured in Apple's App Store Increases Downloads, Unless You're an 'Indie' App" surfaced by headline only; its data was not reviewed.

## 7. Pricing evidence

### Takeaway
No controlled $2.99 vs $4.99 vs $9.99 test for a one-time unlock was found; the available benchmarks are for subscriptions. $4.99 sits above the $1.99-$2.99 paid-upfront rivals but with a free trial they lack, and the Small Business Program must be enrolled in manually to get the 15% rate.

### Cited Findings
- [Apple] Small Business Program: 15% commission on paid apps and in-app purchases for developers with up to USD 1M proceeds in the prior calendar year; new developers qualify; enrollment is required (not automatic); the reduced rate starts 15 days after the end of the fiscal month in which enrollment is approved. — [Apple: Small Business Program](https://developer.apple.com/app-store/small-business-program/)
- [Apple, live pages] Competitor pricing: Oona $1.99 paid upfront; Sleep trainer - Ferber method $2.99 paid upfront; Baby Sleep Trainer - Ferber free. — [Oona](https://apps.apple.com/us/app/oona-sleep-training-timer/id6747005575); [Sleep trainer](https://apps.apple.com/us/app/id1555062851); [Baby Sleep Trainer - Ferber](https://apps.apple.com/app/id6760542352)
- [Vendor, search summary only] RevenueCat State of Subscription Apps 2026: median download-to-paid by day 35 is 10.7% for hard paywalls (12.1% in 2025) vs 2.1% for freemium; median revenue per install at day 60 is $3.09 (hard paywall) vs $0.38 (freemium). These are subscription apps, medians across apps. — [RevenueCat 2026 benchmarks](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026.md); [RevenueCat SOSA 2026](https://revenuecat.com/sosa-26-insights/)
- [Anecdote, search summary only; weak] One indie developer estimates one-time IAPs at $1.99-$9.99 convert around 12% vs 1-3% for subscriptions on cold-start iOS apps (own estimate from an Adapty report plus 60 days of data, not a controlled test). — [dev.to: one-time IAP over subscription](https://dev.to/snake_sun/why-i-picked-one-time-iap-over-subscription-for-4-indie-ios-apps-storekit-2-2026-data-1nk6)
- [Anecdote, search summary only; weak] Rule of thumb from an indie guide: start at $4.99; under 2% conversion consider lowering, over 5% you may be underpriced. — [screenshot-maker blog](https://screenshot-maker.pages.dev/blog/app-pricing-strategies)
- [Vendor, search summary only] Counterpoint: Amplitude data cited as showing subscription apps with 76% higher six-month MAU retention than one-time-purchase apps (a retention, not a revenue, finding). — [Monetizely](https://www.getmonetizely.com/articles/one-time-purchase-vs-subscription-what-vibe-coders-get-wrong-about-recurring-revenue)

### Inferences
- At $4.99 with the 15% rate, proceeds are about $4.24 per US sale (before any tax effects); at the standard 30% about $3.49. Enrolling before launch matters because the rate is not retroactive.
- A subscription is a poor fit for a 1-2 week use cycle: the user would cancel before the first renewal, so the subscription's LTV advantage (which depends on retention) does not apply, while "no subscription" is a marketable contrast with Huckleberry/Napper-class trackers.
- The trial design (2 free nights, paywall only when starting night 3) puts the paywall at peak commitment: Ferber plans run several nights, and the parent has already seen the app work. Conversion among users who reach night 3 should be far above the 2.1% freemium median, but that median is the only public benchmark and it is for subscriptions, so no numeric target is supported.
- $4.99 vs $2.99: the price difference is trivial relative to what parents spend on sleep problems (consultants, $130/yr trackers); the risk is at the store-listing stage only if shoppers compare against $1.99 rivals, and the free download removes that comparison. $9.99 is untested; with low volume a sequential price test (e.g. 6-8 weeks each) is the only way to find out, and results will be noisy.
- Regional pricing: Apple's automatic price equalization from a US base price is the low-effort default; no evidence was gathered on manual regional pricing for this category.

### Gaps
- No public controlled price test for a one-time unlock in a short-lifecycle utility; no benchmark for "N free uses then one-time unlock" conversion; RevenueCat's full report was not read directly.
- No evidence gathered on regional pricing or purchasing-power pricing outcomes.

## 8. Localization

### Takeaway
No evidence was found on the return from localizing a niche English-language parenting utility; the only clearly justified step is the cheap metadata one (Spanish (Mexico) keyword field for the US store, plus UK/AU/CA English keyword variants).

### Cited Findings
- [Apple] Localization ("high-quality support for multiple languages with culturally relevant content") is one of the listed featuring considerations. — [Apple: Getting featured](https://developer.apple.com/app-store/getting-featured/)
- [Vendor, search summary only] Adding a Spanish (Mexico) metadata localization is required for that locale's keywords to be indexed in the US; keyword sets are indexed per locale. — [AppTweak](https://www.apptweak.com/en/aso-blog/how-to-benefit-from-cross-localization-on-the-app-store); [AppFollow](https://appfollow.io/blog/how-to-expand-on-iOS-localization-for-usa)
- [Apple] More localizations make Product Page Optimization tests slower to reach significance. — [Apple: Product Page Optimization](https://developer.apple.com/app-store/product-page-optimization/)

### Inferences
- English (UK) and English (Australia) metadata are nearly free to add and let keywords match local vocabulary ("controlled crying" and "self settling" are the common UK/AU terms for this method; "cot" vs "crib"). This vocabulary point is from general knowledge, not a source fetched here.
- "Ferber" is a US-centric name; in German-speaking markets the method is associated with a different book title, so a German listing would need its own keyword research. Full app translation should wait for evidence of demand (downloads by territory in App Store Connect).

### Gaps
- No data on download uplift from localization for comparable apps; no keyword data for non-US storefronts.

## 9. App Store Connect Analytics: what to watch and targets

### Takeaway
Use App Store Connect's own peer-group benchmarks rather than published category averages, and read conversion by source, since search traffic on exact-match niche terms should convert much better than browse traffic. No sourced numeric targets exist for an app this size.

### Cited Findings
- [Vendor, search summary only] Benchmarks differ by definition: some use downloads / product page views, others downloads / impressions, which explains 25-31% vs 8.56% figures. — [Adapty](https://adapty.io/blog/app-store-conversion-rate/); [AppTweak 2025 report](https://www.apptweak.com/aso-blog/aso-trends-benchmarks-report-2025)
- [Vendor, search summary only] App Store Connect provides peer-group benchmarks; a "good" rate is your peer group's median there. — [App Screenshot Studio](https://appscreenshotstudio.com/app-store-conversion-benchmarks)
- [Apple] PPO results report impressions, conversion rate, percent improvement and confidence per treatment in App Analytics. — [Apple: Product Page Optimization](https://developer.apple.com/app-store/product-page-optimization/)

### Inferences
- Suggested weekly dashboard: impressions (unique devices), product page views, first-time downloads, conversion rate, each split by source (App Store Search, App Store Browse, Web Referrer, App Referrer); then in-app: share of installs that start night 1, share reaching night 3 (paywall), purchases / installs, ratings count and average.
- Web Referrer is the channel the founder controls (the guide website in `site/`); tagging site links with campaign tokens lets App Analytics attribute those downloads.
- Because the app has no in-app analytics, App Store Connect (downloads, sales, opt-in usage data) plus RevenueCat purchase counts are the only funnel data; night-3 reach can only be approximated from purchases unless a privacy-preserving count is added.
- Planning assumptions rather than targets: treat search conversion below the peer-group 25th percentile as a listing problem (screenshots/subtitle), and low impressions as a keyword problem.

### Gaps
- Apple's App Analytics documentation (metric definitions, source types, benchmark feature) was not fetched in this session; metric names above are from general knowledge and should be checked against App Store Connect.
- No sourced targets for impressions or conversion for a niche utility with under 1,000 downloads a month.
