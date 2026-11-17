# Paid user acquisition economics for "Check In: Baby Sleep Timer" ($4.99 one-time unlock, ~$4.24 net)

Researched 2026-11-17. Source-quality labels used below: **[primary]** = platform's own documentation; **[vendor data]** = benchmark report from a company that sells ad/ASO tooling (measured on its own customers, not a neutral sample; usually skewed to larger, funded advertisers); **[vendor blog]** = marketing content with no disclosed dataset; **[anecdote]** = a single developer's report; **[snippet]** = figure came from a search-result summary and the page itself was not opened, so treat as unverified.

## 1. Apple Search Ads (now "Apple Ads") in 2025-2026: products, placements, benchmarks

### Takeaway
US Apple Ads installs for the app's likely categories cost roughly $2.60-$3.80 at the median (generic and competitor keywords $5-$7), i.e. close to or above the entire $4.24 net revenue of a *paying* family. In March 2026 Apple added extra ad slots further down search results, which adds inventory but also pushes organic results lower.

### Cited Findings
**Product names and placements**
- Apple's current help centre calls the product "Apple Ads" (Advanced and Basic). Advanced: placements are the Today tab, Search tab, search results, and other apps' product pages; cost-per-tap pricing ("Pay only when a user taps your ad, up to a maximum price you choose"); unlimited budget; keyword choice; daily budget at campaign level; detailed reports; Apple Ads Platform API. [primary] — [Apple: Compare Apple Ads solutions](https://ads.apple.com/app-store/help/apple-ads-basic/0001-compare-apple-ads-solutions)
- Basic: search results only; cost-per-install pricing ("Pay only for installs at a cost you choose"); max "Up to $10,000 (U.S.) per app, per month"; "No keywords or audience settings"; "No keyword data or access to the Apple Ads Platform API"; quick-view dashboard only. [primary] — [Apple: Compare Apple Ads solutions](https://ads.apple.com/app-store/help/apple-ads-basic/0001-compare-apple-ads-solutions)
- Apple's comparison page states no minimum spend for either product. [primary] — [Apple: Compare Apple Ads solutions](https://ads.apple.com/app-store/help/apple-ads-basic/0001-compare-apple-ads-solutions). Third-party guides disagree ("$1/day minimum" vs "no minimum") [snippet, vendor blog] — [Adapty](https://adapty.io/blog/apple-search-ads/)
- Promo credit: Apple offers a one-time new-account credit ($100 in USD; converted for other currencies) to eligible developers; the Apple Ads account must be linked to the App Store Connect account at the top level ("If you link a campaign group instead of your top-level account, the credit won't be applied"). [primary, read via snippet] — [Apple Ads promo credit](https://ads.apple.com/app-store/help/billing/0032-apple-ads-promo-credit)

**2026 change: more search ad slots**
- Announced December 2025 from Apple documentation: ads can appear beyond the top-of-results position; existing search results campaigns are automatically eligible; advertisers cannot pick or bid for a specific position; number of slots not disclosed; billing model unchanged (CPT, or CPI for Basic). Apple cited "nearly 65%" of App Store downloads happening directly after a search (Apple 2022 data) and >60% average conversion rate for top-position search ads (Nov 2024-Oct 2025, all markets). — [PPC Land, 18 Dec 2025](https://ppc.land/apple-expands-app-store-search-ads-with-multiple-placements-arriving-in-2026/)
- Rollout reported as starting 3 March 2026, on iOS/iPadOS 26.2+. [snippet] — [PPC Land](https://ppc.land/apple-will-squeeze-more-ads-into-app-store-search-heres-what-changes/); [Zoomd](https://www.zoomd.com/apple-to-expand-app-store-search-ads-from-march-2026-mobile-marketing-takeaways-for-app-advertisers/)
- Apple states irrelevant apps are excluded from the auction "regardless of how much you may be willing to pay". — [PPC Land, 18 Dec 2025](https://ppc.land/apple-expands-app-store-search-ads-with-multiple-placements-arriving-in-2026/)

**Benchmarks (all vendor data; do not compare across vendors)**
- AppTweak, US, search results, Jan-Dec 2025, ~2,800 US advertisers, medians not weighted by spend [vendor data] — [AppTweak Apple Ads benchmarks](https://www.apptweak.com/aso-blog/apple-ads-benchmarks):

| US category | Median CPT | Median CPI | Median TTR | Median CR (tap to install) |
|---|---|---|---|---|
| Health & Fitness | $1.68 | $3.77 | 7.5% | 50.3% |
| Lifestyle | $1.18 | $2.62 | 7.4% | 54.8% |

- Same source, US apps by campaign type (2025) [vendor data] — [AppTweak](https://www.apptweak.com/aso-blog/apple-ads-benchmarks):

| Campaign type | CPT | CPI | TTR | CR |
|---|---|---|---|---|
| Brand (own name) | $2.05 | $2.84 | 25.3% | 73.5% |
| Generic | $2.75 | $5.31 | 8.5% | 59.8% |
| Competitor | $3.26 | $6.78 | 3.8% | 50.1% |
| Discovery (Search Match/broad) | $1.16 | $3.10 | 4.2% | 44.5% |

- SplitMetrics (2025 campaign data, global, top-15 categories; sample size not disclosed): average TTR 9.7%, CR 66.2%, CPT $2.25, CPA $3.76; Medical CPT $4.45 / CPA $8.90; Finance CPA $13.28; Sports CPA $19.74. North America has the highest CPT and CPA of any region. Costs peak in September; April is cheapest. [vendor data] — [SplitMetrics Apple Ads cost](https://splitmetrics.com/blog/apple-search-ads-cost)
- MobileAction (2023-2024 data, sample undisclosed, older): average CPT $1.77 (2023) and $1.84 (2024); Utilities $1.07, Productivity $0.94, Finance $3.38 in 2024. [vendor data, older] — [MobileAction 2025 benchmark report](https://www.mobileaction.co/report/apple-search-ads-2025-benchmark-report/cost-per-tap/)
- One indie's real account (budgeting app, ~$10/day, April 2025): Apple Ads CPC $1.59, cost per install $4.36, ~75 impressions and ~6 taps on a typical day. [anecdote] — [Matt Corey, May 2025](https://mattcorey.substack.com/p/rethinking-my-indie-app-advertising)

### Inferences
- Realistic planning CPI for this app in the US: about $2.50-$4.00 on niche exact-match terms; $5-$7+ on competitor brand terms ("huckleberry", "napper"), where TTR is also lowest (3.8%) because searchers want that specific app. These are inferred from category/campaign-type medians, not measured for these keywords.
- Niche exact-match terms ("ferber method", "ferber timer", "sleep training timer") probably have few bidders, and Apple's second-price-style auction means the actual CPT can be well below the bid. But low-volume terms also deliver very few impressions (compare the anecdote: ~75 impressions/day on $10/day), so the constraint is volume rather than price. A $100-$500/month budget may simply not spend.
- Basic is a poor fit: no keyword data (the main strategic value for this founder) and no keyword control. Advanced is the only sensible option.
- Medical category should be avoided as the primary category from an ads-cost point of view (CPA $8.90 vs ~$3-4).

### Gaps
- No source gives CPT/CPI for the specific keywords "ferber method", "sleep training app", "cry it out", "huckleberry" or "napper". Apple shows suggested bid ranges per keyword only inside an Apple Ads Advanced account; this has to be read from the account directly.
- No parenting-specific Apple Ads benchmark was found; Health & Fitness and Lifestyle are proxies.
- Apple's own page for the March 2026 additional-slots change was not opened directly; details are via trade press.
- Whether the $100 credit is currently offered to every new US account was not confirmed beyond Apple's eligibility wording.

## 2. Worked economics: break-even cost per install at $4.99 one-time

### Takeaway
Break-even CPI = $4.24 x (install-to-purchase rate). At a realistic 2-10% conversion that is $0.08-$0.42 per install, against market CPIs of roughly $2.60-$6.80, so Apple Ads loses 85-97% of spend on a direct-return basis. It only breaks even if roughly 60-90% of ad-driven installs buy, which is not plausible.

### Cited Findings
- RevenueCat State of Subscription Apps 2026 (115,000+ apps, $16B+ revenue): freemium apps' median Day-35 download-to-paid conversion is 2.1% (unchanged from 2025); hard-paywall apps 10.7% (down from 12.1%). Revenue per install at Day 60: $0.38 freemium vs $3.09 hard paywall. These are subscription apps, not one-time unlocks. [vendor data, large sample] — [RevenueCat 2026 benchmarks](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026.md)
- North America median download-to-paid reported at 2.6% vs 2.0% Western Europe. [snippet] — [Subscription Insider summary](https://subscriptioninsider.com/article-type/news/revenuecats-state-of-subscription-apps-2025-report-ais-dominance-retention-challenges-and-the-shift-away-from-pure-subscriptions)
- Market CPIs used below: US Health & Fitness $3.77, Lifestyle $2.62, Discovery $3.10, Generic $5.31, Competitor $6.78 [vendor data] — [AppTweak](https://www.apptweak.com/aso-blog/apple-ads-benchmarks)
- Allen Pike (2016, older): a $10 paid app could only justify search ads below ~$3 per acquisition, and "most search terms that indie app developers would be interested in will probably fall into the 'not profitable' category". [anecdote, old] — [Allen Pike](https://allenpike.com/2016/socking-simians)
- A 2025 indie with a far cheaper channel (Reddit, $0.82 per install) still reported that cost as "higher than my Average Revenue Per User". [anecdote] — [Matt Corey](https://mattcorey.substack.com/p/rethinking-my-indie-app-advertising)

### Inferences
**Break-even table (net $4.24 per purchase, LTV = one purchase; my arithmetic)**

| Install-to-purchase rate | Revenue per install = break-even CPI | Return on $1 at $2.62 CPI (Lifestyle) | Return on $1 at $3.77 CPI (H&F) |
|---|---|---|---|
| 2% (RevenueCat freemium median) | $0.085 | $0.03 | $0.02 |
| 5% | $0.21 | $0.08 | $0.06 |
| 10% (hard-paywall median) | $0.42 | $0.16 | $0.11 |
| 20% | $0.85 | $0.32 | $0.22 |
| 30% | $1.27 | $0.49 | $0.34 |

**Conversion rate needed to break even at a given CPI (my arithmetic)**

| CPI | Required install-to-purchase rate |
|---|---|
| $0.50 | 11.8% |
| $0.82 (the Reddit anecdote) | 19.3% |
| $1.00 | 23.6% |
| $2.62 | 61.8% |
| $3.77 | 88.9% |
| $5.31 and above | over 100% (impossible) |

- Why this app might beat the 2.1% freemium median: high-intent search ("ferber timer"), a real two-night trial then a hard gate, and a low price. Why it might not: the need is over in 1-2 weeks and some families will finish or quit within the 2 free nights. No benchmark for "free trial then cheap one-time unlock" was found, so the app's own App Store Connect/RevenueCat numbers are the only reliable input. A 10-25% range for exact-intent keyword installs is my guess, not a sourced figure.
- Illustration: $100 at $3.77 CPI buys ~27 installs; at 10% conversion that is ~2.7 purchases, about $11 back. With the $100 new-account credit the cash cost is zero, which changes the decision for the first test only.
- Conditions under which Apple Ads could be rational: (a) spending Apple's free credit; (b) exact-match niche terms that clear at well under $0.50 per tap with high conversion, which must be verified in the account; (c) brand defence on "check in baby sleep timer" only if a competitor is actually bidding on the name (brand CPI median $2.84 is still most of a purchase, and most brand searchers would have installed organically); (d) valuing installs for non-revenue reasons: early ratings, keyword data, word of mouth in a category where parents recommend tools to each other.
- No secondary revenue exists (no subscription, no ads), and one purchase covers both parents, so there is no LTV expansion to rescue the math. A higher price is the only lever on the revenue side: at $9.99 (about $8.49 net) break-even CPIs double but remain far below market CPIs.

### Gaps
- No public benchmark for install-to-purchase conversion in freemium apps with a one-time unlock. RevenueCat's reports cover subscriptions; its article has no lifetime/one-time data.
- The RevenueCat article is inconsistent about whether the 2.1%/10.7% figures are download-to-paid or trial-to-paid.
- No data on word-of-mouth multiplier (k-factor) for baby apps, which would be needed to credit paid installs with referred organic installs.

## 3. Does Apple Ads spend lift organic keyword ranking?

### Takeaway
Plausible but unproven: the evidence is vendor case studies and anecdotes without control groups, and Apple has never said ads affect organic rank. Do not budget on the assumption that it does.

### Cited Findings
- SplitMetrics case study (mobile game): after paid campaigns on specific keywords, one previously unranked keyword reached top 10; organic installs went from ~1.24K to ~1.88K/month with no ASO changes; no control group. [vendor data, self-interested] — [SplitMetrics case](https://splitmetrics.com/cases/how-apple-search-ads-helps-to-increase-organic-traffic-with-splitmetrics/)
- AppTweak presents the organic uplift as a theory about how the algorithm may treat conversions/relevance, not measured results. [vendor blog] — [AppTweak](https://www.apptweak.com/aso-blog/how-search-ads-can-boost-your-apps-organic-keyword-rankings)
- AppRadar: Apple Ads "operates separately from organic search ranking algorithms"; "we can't say Apple Search Ads' bidding strategy influences organic ranking in all cases", though some apps show a dependency. [vendor blog, sceptical] — [AppRadar](https://appradar.com/blog/correlation-between-keywords-bidding-and-organic-keywords-rankings)
- Matt Corey saw keyword rankings rise slightly and stabilise while running Reddit ads (not Apple Ads), and was separately testing Apple Ads' effect on three keywords; no result reported. [anecdote] — [Matt Corey](https://mattcorey.substack.com/p/rethinking-my-indie-app-advertising)

### Inferences
- The likely mechanism, if any, is indirect: more installs and keyword-level conversions feed the same signals organic ranking uses. At $100-$500/month (tens of installs) the effect would be too small to distinguish from noise, except possibly on very low-competition terms where a handful of installs matter.
- With extra ad slots since March 2026, organic rank is worth somewhat less than before on contested terms, which slightly raises the defensive case for bidding on the app's own niche terms.

### Gaps
- No controlled experiment (holdout keywords or geo split) was found. No Apple statement either way.

## 4. Apple Ads as a cheap keyword research tool

### Takeaway
This is the strongest case for a small Apple Ads Advanced spend: it is the only first-party source of real App Store search-term and conversion data, and it works at tiny budgets. Basic gives none of it.

### Cited Findings
- Advanced gives keyword choice, "detailed reports and insights for key metrics", and the Platform API; Basic has "No keyword data". [primary] — [Apple: Compare Apple Ads solutions](https://ads.apple.com/app-store/help/apple-ads-basic/0001-compare-apple-ads-solutions)
- Discovery-type campaigns (Search Match/broad) have the lowest median CPT of any campaign type in US data ($1.16) but the lowest conversion (44.5%). [vendor data] — [AppTweak](https://www.apptweak.com/aso-blog/apple-ads-benchmarks)
- Standard small-budget advice: start with 5-10 keywords, one country, separate campaigns for brand, competitor and category terms, a daily cap you are "comfortable losing", and pause keywords that spend without installing. [vendor blog; AppSprint sells ASO tooling] — [AppSprint](https://appsprint.app/blog/apple-search-ads-indie-developers)

### Inferences
- What the founder gets for the money: the actual search terms people type (via Search Match in a discovery campaign), impression volume per term (a proxy for demand), tap-through rate (does the icon/title/subtitle appeal for that term), and tap-to-install rate per keyword. Joined with RevenueCat purchase counts by date, this gives a rough purchase rate. That directly informs which words go in the title, subtitle and keyword field, which is free and permanent.
- Because the app has no ad SDK, per-keyword purchase attribution is not available. Apple's AdServices attribution API is a first-party framework rather than a third-party SDK, and RevenueCat can ingest it, but adopting it is a product/privacy-positioning decision; without it, measure at campaign level by comparing dates.

### Gaps
- Apple's documentation for the search popularity score and Search Match was not retrieved; the description above of what the account shows is from general knowledge and should be checked in the account. In particular, Apple hides search terms below a privacy volume threshold, which may blank out many rows for a niche this small (unsourced; verify).

## 5. Meta (Facebook/Instagram) and TikTok

### Takeaway
Not viable at this price and budget. Reported US iOS health/wellness CPIs are several dollars or more, the platforms cannot optimise for installs without their SDK, and TikTok's minimums ($50/day per campaign) exceed the whole monthly budget in a few days.

### Cited Findings
- Meta US cost per app install, wellness/holistic health: average ~$10.10, median month ~$6.18; healthcare US median ~$8.19 (Oct 2025-Sep 2026). [vendor data from one ad-tool's customers; snippet] — [Superads wellness US](https://www.superads.ai/facebook-ads-costs/cost-per-app-install/wellness-holistic-health/united-states); [Superads healthcare US](https://www.superads.ai/facebook-ads-costs/cost-per-app-install/healthcare/united-states)
- Another compilation gives US iOS healthcare CPI $4-$14. [vendor blog, snippet] — [SEM Nexus](https://semnexus.com/app-user-acquisition-benchmarks-by-vertical-2026/)
- Without app registration and the Meta SDK, app ads are optimised for link clicks rather than installs; the SDK is needed for install attribution and in-app event optimisation. [snippet, secondary description of Meta guidance] — [Coinis](https://coinis.com/how-to/set-facebook-ads-objective-for-app-installs)
- SDK-free measurement fallback: App Store Connect campaign links (App Analytics) measure product-page views and installs per link at Apple's level, not per ad. [vendor blog, snippet] — [URLgenius](https://app.urlgeni.us/blog/generate-links-open-mobile-apps-facebook-advertising)
- Meta targeting: parental-status segments (parents by child age, expecting parents) were still listed in 2026 guides; Meta removed many detailed interests on 15 Jan 2026 and treats detailed-targeting inputs increasingly as suggestions rather than hard filters. [vendor blogs, snippet; dates conflict between sources] — [Linear Design](https://lineardesign.com/blog/facebook-detailed-targeting-list-2024/); [AdLibrary](https://adlibrary.com/posts/meta-interest-targeting-removed); [Social Media Today](https://www.socialmediatoday.com/news/meta-removes-more-detailed-ad-targeting-options-facebook-instagram/757856/)
- TikTok: commonly reported minimums of $50/day per campaign and $20/day per ad group; learning phase wants ~50 conversions per ad group per week; CPI ranges quoted from $0.50-$1.80 to $1.50-$4.50, none isolating US iOS; iOS measurement relies on SKAdNetwork with delayed postbacks. [vendor blogs, snippet, mutually inconsistent] — [Zapier](https://zapier.com/blog/tiktok-ads-cost/); [Benly](https://benly.ai/learn/tiktok-ads/tiktok-ads-budget-guide)

### Inferences
- A Meta link-click campaign to the App Store (or to the website guide) optimises for cheap clickers, not installers or buyers. Expect click-to-install well below Apple Ads' 50%+ because social traffic is interruption-based, not intent-based. Even at an optimistic $1 click and 20% click-to-install, CPI is $5, i.e. above the net purchase value before any conversion.
- Timing mismatch: the product is needed during a 1-2 week window when a baby is roughly 4-12 months old. Social targeting can find "parents of infants" but not "parents starting sleep training this week"; search (App Store, Google, Reddit threads) captures that moment.
- Boosting an organic post is the same economics with worse controls. The only defensible use is as paid distribution for content that already performed organically, valued as awareness rather than installs.
- 50 conversions/week learning thresholds are unreachable on $100-$500/month on either platform.

### Gaps
- No Meta or TikTok benchmark specific to parenting/baby apps was found.
- Meta's own current documentation on parental targeting and on SDK-less app campaigns was not opened; the above is from secondary sources and should be checked in Ads Manager.
- One tracker showed US all-industry Meta CPI rising to ~$100 by July 2026, which is implausible and unverified; excluded from the analysis.

## 6. Reddit ads (r/sleeptrain, r/NewParents, etc.)

### Takeaway
The cheapest paid installs found anywhere (one indie measured $0.82 per install), with a $5/day minimum and subreddit targeting that matches this niche unusually well, but even that CPI needs ~19% install-to-purchase to break even. Worth one small bounded test, not a channel to scale.

### Cited Findings
- Matt Corey (budgeting app, May 2025, $10/day moved from Apple Ads): Reddit eCPM $0.47 vs Apple $141.43; CPC $0.70 vs $1.59; cost per install $0.82 vs $4.36. Day one: 17,000+ impressions, 59 clicks, 4 installs. Measured with App Store Connect "By App Referrer" rather than SKAN. He still concluded CPA exceeded ARPU. [anecdote, but real account numbers] — [Matt Corey](https://mattcorey.substack.com/p/rethinking-my-indie-app-advertising)
- Self-serve minimum $5/day; some guides claim $50/day is needed for the algorithm to optimise. [vendor blogs, snippet] — [Dataslayer](https://www.dataslayer.ai/blog/reddit-ads-in-2025-complete-guide-for-marketers); [Stackmatix](https://www.stackmatix.com/blog/reddit-ads-cost)
- CPC ranges quoted: $0.10-$0.80 consumer; $0.50-$2.50 for subreddit targeting; health and wellness $0.30-$1.00 CPC, $3-$8 CPM. App install CPA "average $2.50, range $1-$8 for wellness apps". [vendor blogs, snippet, undisclosed data] — [Benly](https://benly.ai/learn/reddit-ads/reddit-ads-cost-benchmarks); [Webtonic](https://www.webtonic.io/blog/health-wellness-reddit-ads-statistics)

### Inferences
- Day-one figures above imply ~0.35% CTR and ~7% click-to-install; the three-week $0.82 CPI was better than day one. One app in a different category is thin evidence.
- For this app the audience fit is better than for a budgeting app (r/sleeptrain is exactly the buyer at exactly the moment), so conversion could be higher, but those subreddits are small, so spend may not deliver. Measurement works without an SDK via App Store Connect referrer/campaign links.
- Organic participation in the same subreddits (subject to each subreddit's self-promotion rules) reaches the same people for free and is likely the better use of time; ads are the fallback if rules prohibit mentioning the app.

### Gaps
- Reddit's official ads documentation was not opened; minimums are from third-party guides (which disagree on a lifetime minimum of $20 vs $50).
- No evidence found for Reddit ads on a baby/parenting app specifically, nor on whether r/sleeptrain is targetable or large enough to deliver.

## 7. Google Search ads to the website; Google App campaigns

### Takeaway
No keyword-level data was found for "ferber method" queries, and Google App campaigns do not suit an SDK-free iOS app. A web search ad adds an extra step (site, then App Store) on top of click costs, so it is very unlikely to pay back.

### Cited Findings
- All-industry average Google Search CPC is ~$5.26-$5.42 in the WordStream/LocaliQ 2025 report (sources differ on which year each figure belongs to); it was $2.32 a decade ago. [vendor data via trade press, snippet] — [Search Engine Land](https://searchengineland.com/google-ads-costs-keep-rising-but-conversion-rates-improved-in-2025-477927)
- One compilation puts health-and-wellness search CPC at $1.63. [vendor blog, snippet] — [Webtonic](https://www.webtonic.io/blog/health-wellness-google-ads-statistics)
- An indie running Google Ads for ~6 months reported two 2025 campaigns with nearly zero impressions and zero clicks. [anecdote] — [Matt Corey](https://mattcorey.substack.com/p/rethinking-my-indie-app-advertising)

### Inferences
- Informational queries such as "ferber method chart" are typically cheap because few advertisers bid, but that is unverified here. Even at $0.30 per click, if 10% of site visitors install and 10% of those buy, cost per purchase is $30 against $4.24 net. The website's value is organic search, not paid.
- Google App campaigns for iOS optimise on install/in-app events reported through Firebase or an attribution partner; without those the campaign has nothing to optimise on. This is general knowledge, not sourced in this research.

### Gaps
- CPC and volume for "ferber method", "ferber method chart", "sleep training app": not found. Google Keyword Planner (free with an Ads account) is the place to read these.
- Whether Google's healthcare/medicines policy or YMYL review applies to baby sleep-training content: no source found. Sleep training is behavioural rather than a regulated treatment, so restriction seems unlikely, but this is unverified.

## 8. Indie developer evidence on paid acquisition for low-ARPU apps

### Takeaway
The consistent conclusion from indies who published numbers is that paid installs cost more than a low-priced app earns per user; the people who keep spending do so for data or cheap alternative channels, not profit. Evidence is anecdotal and thin for one-time-purchase apps specifically.

### Cited Findings
- Matt Corey (2025): ran Apple Ads for years at ~$10/day with four ad groups (Discovery, Brand, Competitor, Category), found it "frustrating and expensive" ($4.36 per install), moved the budget to Reddit ($0.82), and still had CPA above ARPU. Judged SKAN too complicated at low volume. — [Matt Corey](https://mattcorey.substack.com/p/rethinking-my-indie-app-advertising)
- Allen Pike (2016): most keywords an indie wants are unprofitable for a paid app; of the people he knew using search ads he could not recall anyone finding them particularly satisfying. [old] — [Allen Pike](https://allenpike.com/2016/socking-simians)
- An Indie Hackers founder reported Apple Ads "used to work" but CPC roughly doubled over a year and it was no longer profitable. [anecdote, snippet] — [Indie Hackers product page](https://www.indiehackers.com/product/swipe-photo-cleaner-wipe-ai)
- A 2025 r/iOSProgramming thread shows a developer with a single lifetime purchase unable to make CPI work because only a fraction of installs buy. [anecdote, snippet] — [r/iOSProgramming mirror](https://redlib.cypherpunktools.com/r/iOSProgramming/comments/1juin7d/marketing_an_app_seems_like_a_gamble)
- Vendor rule of thumb: max CPI should sit below average revenue per user (example: about half). [vendor blog, snippet] — [AppSprint](https://appsprint.app/blog/apple-search-ads-cheap-installs)
- RevenueCat: freemium apps earn a median $0.38 per install by Day 60, even with subscriptions. [vendor data] — [RevenueCat 2026 benchmarks](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026.md)

### Inferences
- Applying the "CPI below half of revenue per install" rule: at 10% conversion, revenue per install is $0.42, so target CPI is ~$0.21. No channel surveyed delivers that in the US.
- Paid acquisition in this market is built for subscription LTVs of $20-$30+ (RevenueCat year-1 median LTV $21-$30); a $4.24 one-time app is bidding in the same auctions as Huckleberry and Napper with a fraction of their revenue per user.

### Gaps
- No published case study of paid acquisition for a baby/parenting one-time-purchase app was found. Sub Club podcast material was not searched.

## 9. Cheap, bounded experiments worth running anyway

### Takeaway
Yes, but as paid market research with a fixed cap, not as acquisition: use Apple's $100 new-account credit on an exact-match plus small discovery test at launch, optionally a $50 Reddit test. Everything else should wait until the app's own install-to-purchase rate is known.

### Cited Findings
- One-time $100 new-account credit, requires linking Apple Ads to App Store Connect at the top-level account. [primary] — [Apple Ads promo credit](https://ads.apple.com/app-store/help/billing/0032-apple-ads-promo-credit)
- Advanced has daily campaign budgets and no stated minimum; keyword data only in Advanced. [primary] — [Apple: Compare Apple Ads solutions](https://ads.apple.com/app-store/help/apple-ads-basic/0001-compare-apple-ads-solutions)
- Costs are lowest in April and highest in September. [vendor data] — [SplitMetrics](https://splitmetrics.com/blog/apple-search-ads-cost)
- Reddit self-serve minimum $5/day; installs measurable through App Store Connect referrer data without an SDK. — [Dataslayer](https://www.dataslayer.ai/blog/reddit-ads-in-2025-complete-guide-for-marketers); [Matt Corey](https://mattcorey.substack.com/p/rethinking-my-indie-app-advertising)

### Inferences
Suggested experiments (my design, derived from the findings above):

1. **Apple Ads Advanced, US, $100 credit, about 3-4 weeks at $3-$5/day.**
   - Campaign A (exact match, ~70% of budget): 5-10 niche terms such as "ferber method", "ferber timer", "sleep training timer", "sleep training app", "cry it out", "check and console". Bid low ($0.50-$1.00) and raise only if there are no impressions.
   - Campaign B (discovery, ~30%): Search Match on, with Campaign A's terms as negatives, to learn what people actually type.
   - Skip competitor brand terms (median CPI $6.78, TTR 3.8%) and skip brand defence until a competitor is seen on the app's name.
   - Record per keyword: impressions, TTR, tap-to-install, CPT. Compare purchase counts in RevenueCat by date. Success means learning which terms have volume and convert, to feed title/subtitle/keyword field. Expected direct return: roughly $5-$15 of revenue per $100.
   - Kill rule: stop when the credit is spent. Continue with cash only for exact terms whose observed CPI is below (observed install-to-purchase rate x $4.24), which per the table means under ~$0.40-$1.00.
2. **Reddit, $50 total at $5/day,** targeting sleep-training/new-parent communities, using an App Store Connect campaign link. Break-even needs CPI below ~$0.40-$0.85 at 10-20% conversion. Only after checking organic participation is not the better route.
3. **Do not test** Meta, TikTok or Google App campaigns at this budget and price: minimums, learning thresholds and SDK requirements make the result uninformative.

- Early installs from a launch test may also help reach the first few ratings sooner; valuing that is a judgment call, and no source quantifies it.

### Gaps
- Whether $3-$5/day will actually win impressions on these niche terms is unknown until tried; the test may under-spend, which is itself a finding about search volume.
- No sourced evidence that a small launch burst of paid installs improves ratings count or ranking.
