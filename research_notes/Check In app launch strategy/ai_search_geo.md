# AI search visibility (GEO / AEO) for "Check In: Baby Sleep Timer"

Research date: 17 Nov 2026. Evidence grades used throughout:

- **[A] Primary / official**: platform documentation I opened directly.
- **[B] Measured, independent-ish**: a study with stated sample and method (often by an SEO vendor with a commercial interest, so still read with care).
- **[C] Vendor or secondary claim**: reported through a blog or news summary; I did not open the original.
- **[D] Speculation / practitioner opinion**.

Verification note: I opened these pages directly: OpenAI crawler docs, Google "AI features and your website" docs, the GEO paper's arXiv abstract, the SparkToro/Gumshoe study, and the AppTweak app-citation study. Everything else below comes from search-result summaries of the linked pages and is marked "(not opened)" where the number matters. Exact figures from unopened pages should be re-checked before being quoted in a final report.

## 1. Mechanics: which index and crawler each assistant uses, and what robots.txt settings matter

### Takeaway
Each assistant grounds live answers in a search index: Google's products in Google's index, Copilot in Bing, Claude in Brave (well evidenced, not formally documented as exclusive), Perplexity in its own index, and ChatGPT in a hybrid nobody outside OpenAI can fully describe. Being indexed is a hard prerequisite everywhere; ranking in the classic top 10 is not, because assistants issue many "fan-out" sub-queries and cite pages well outside the top 10.

### Cited Findings
- **[A] OpenAI has four agents.** `OAI-SearchBot` "is for search"; "Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers, though can still appear as navigational links." `GPTBot` is for model training only. `ChatGPT-User` is the user-triggered fetcher: "Because these actions are initiated by a user, robots.txt rules may not apply" and it "is not used to determine whether content may appear in Search." `OAI-AdsBot` only validates pages submitted as ads. robots.txt changes take "~24 hours" to register. Each setting is independent. — [OpenAI crawler docs](https://developers.openai.com/api/docs/bots.md)
- **[A] Google: no special requirements.** To be a supporting link in AI Overviews or AI Mode a page must be "indexed and eligible to be shown in Google Search with a snippet"; there are "no additional technical requirements". "You don't need to create new machine readable files, AI text files, or markup to appear in these features" and "There's also no special schema.org structured data that you need to add." Both features use "query fan-out" ("issuing multiple related searches across subtopics and data sources"). Google-Extended governs training and grounding in *other* Google systems (Gemini app/Vertex), not Search AI features; Googlebot rules and `nosnippet`/`max-snippet` govern AI Overviews/AI Mode. — [Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- **[A/C] Anthropic has three bots**: `ClaudeBot` (training), `Claude-User` (user-initiated fetches), `Claude-SearchBot` (improves search result quality). Anthropic says disabling Claude-User "prevents our system from retrieving your content in response to a user query, which may reduce your site's visibility for user-directed web search". Each has its own robots.txt token; Anthropic honours `Crawl-delay`. (Quoted via search summary of Anthropic's help article and trade coverage; article itself not opened.) — [Anthropic: About Anthropic's crawler](https://support.claude.com/en/articles/8896518-about-anthropic-crawler); [Search Engine Land](https://searchengineland.com/anthropic-claude-bots-470171); [SE Roundtable](https://www.seroundtable.com/anthropic-updates-its-crawler-docs-40978.html)
- **[B] Claude's web search runs on Brave Search.** Anthropic added Brave Search to its subprocessor list in March 2025; Simon Willison found ten Claude citations matched the same Brave query exactly, and the tool definition exposed a `BraveSearchParams` field. A second "web search" subprocessor (turbopuffer) is also listed, so the division of labour is not public. A widely quoted "86.7% of Claude's URLs are in Brave's top 10" figure rests on roughly 15 data points. — [Simon Willison](https://simonwillison.net/2025/Mar/21/anthropic-use-brave/); [TechCrunch](https://techcrunch.com/2025/03/21/anthropic-appears-to-be-using-brave-to-power-web-searches-for-its-claude-chatbot/); [Xponent21 on the second subprocessor](https://xponent21.com/insights/claude-web-search-brave-turbopuffer/)
- **[A/C] Perplexity**: `PerplexityBot` is the index crawler ("to ensure your site appears in search results, we recommend allowing PerplexityBot"), not used for foundation-model training; `Perplexity-User` is the user-triggered fetcher and generally ignores robots.txt. (Search summary; docs partially visible.) — [Perplexity crawler docs](https://docs.perplexity.ai/docs/resources/perplexity-crawlers.md)
- **[B/C] ChatGPT's search backend is a hybrid and contested.** OpenAI publicly launched ChatGPT search with Bing as a provider, but: Ahrefs found only 6.82% of ChatGPT search results were in Google's top 10 and suggested a mix of Google SERPs, Bing SERPs, own index and third-party APIs; "sting page" tests found ChatGPT surfacing content that existed only in Google's index; The Information reported OpenAI used SerpApi (a Google-results scraper) for some queries (unconfirmed by OpenAI); an academic paper (Jiang et al., "Understanding ChatGPT Citations") found Google organic results contained fewer than one in ten of the exact pages ChatGPT cited. One analysis reports 75% of cited domains for a newer model did not appear in Google or Bing results for the same query. (All not opened.) — [Ahrefs blog](https://ahrefs.com/blog/?p=190763); [On-Page.ai sting test](https://blog.on-page.ai/chatgpt-is-scraping-google-and-heres-the-technical-proof/); [Relevant Audience on the Jiang et al. study](https://www.relevantaudience.com/geo/chatgpt-citations-google-openai-api-proxies-study/); [Search Engine Journal](https://www.searchenginejournal.com/chatgpts-default-premium-models-search-the-web-differently/569594/)
- **[B] Ranking is not required for AI Overview citation.** In SE Ranking's health study only 36% of pages cited by AI Overviews were in Google's top 10 for the same query (German queries; not opened). — [Slashdot summary of The Guardian / SE Ranking](https://tech.slashdot.org/story/26/01/25/0043256)

### Inferences
- The robots.txt that matters for this site: allow `Googlebot`, `Bingbot`, `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Perplexity-User`, `Claude-SearchBot`, `Claude-User`. Allowing `GPTBot`, `ClaudeBot` and `Google-Extended` (training) is a separate, optional choice; for a tiny product that wants its name and facts in future model weights, allowing them is the sensible default. The site's current "allow all" already does this.
- Because Claude leans on Brave and Copilot on Bing, a site verified only in Google and Bing has one unchecked surface: Brave. Brave has no webmaster console; the practical check is searching `site:levib35061.github.io` on search.brave.com and, if absent, relying on inbound links for discovery.
- Five different indexes means one page will not appear everywhere at once. Google and Bing indexing (already under way) covers AI Overviews, AI Mode, Gemini, Copilot and a share of ChatGPT.
- A `github.io` subdomain is indexable but carries no brand signal and no reputation of its own. This is my inference, not a measured finding; no study I found tests custom domain vs github.io for AI citation.

### Gaps
- No primary statement from OpenAI on the current composition of ChatGPT's index (Bing share vs own crawl vs other providers).
- I did not open Anthropic's or Perplexity's docs directly; wording above is via summaries.
- Whether Brave has indexed the site is unknown; needs a manual check.
- Gemini app grounding specifics (as distinct from AI Overviews/AI Mode) were not researched beyond the Google-Extended note.

## 2. Evidence on what gets cited

### Takeaway
The best-supported finding is not about page formatting at all: being mentioned by name across the web (and on YouTube/Reddit) correlates with AI visibility far more than backlinks or on-page tweaks. The famous GEO paper's "up to 40%" on-page gains are a 2023-24 lab result that later work has narrowed considerably.

### Cited Findings
- **[A, older] The GEO paper.** Aggarwal, Murahari, Rajpurohit, Kalyan, Narasimhan, Deshpande, "GEO: Generative Engine Optimization", arXiv 2311.09735, accepted to KDD 2024. Abstract: GEO methods "can boost visibility by up to 40% in generative engine responses" and "efficacy of these strategies varies across domains". The widely repeated specifics (adding statistics, quotations and source citations helped most; keyword stuffing did not) are from the paper body, which I did not open. — [arXiv 2311.09735](https://arxiv.org/abs/2311.09735)
- **[B/C] Critiques.** A July 2026 single-author critical survey (Martinez, arXiv 2607.14035; preprint, peer-review status unknown) of GEO work 2023-2026 concludes heuristics transfer poorly, gains erode when competitors use the same tactics, engines cite different source ecosystems, vary across runs, and sometimes attribute claims to pages that do not support them. Trade coverage summarises it as: no reviewed technique produces a stable cross-platform effect, and the ~40% figure was a single point estimate; the headline says GEO rewrites can cut a page's AI retrieval by 16% (not opened). — [arXiv 2607.14035](https://arxiv.org/pdf/2607.14035); [PPC Land](https://ppc.land/survey-of-45-studies-finds-geo-rewrites-can-cut-a-pages-ai-retrieval-16/)
- **[B/C]** Vishwakarma, Kumar, Jamidar (arXiv 2605.25517, May 2026) argue most evaluations ignore the competitive setting where engines cite only a handful of sources, so a page must be preferred over other plausible candidates, not just "good enough". — [arXiv 2605.25517](https://arxiv.org/html/2605.25517)
- **[C]** Chen et al. (arXiv, Sept 2025) report AI search shows a bias toward earned media and big brands, and advise niche players to build earned (third-party) coverage. Evidence base not checked. — [aitopics listing](https://aitopics.org/doc/arxivorg:C322C8CB)
- **[B] Brand mentions beat links (Ahrefs, 75,000 brands, May 2025).** Spearman correlation with AI Overview brand visibility: branded web mentions 0.664, branded anchors 0.527, branded search volume 0.392, backlinks 0.218. Top-quartile brands by web mentions averaged 169 AI Overview mentions; the next quartile 14; the bottom two quartiles 0-3. Ahrefs states correlation is not causation. A claimed Dec 2025 follow-up putting YouTube mentions at ~0.737 is unverified. — [Ahrefs](https://ahrefs.com/blog/ai-overview-brand-correlation/)
- **[B/C] Most-cited domains.** Peec AI (30M sources, March 2026): Reddit #1, YouTube #2, LinkedIn #3, Wikipedia #4 across ChatGPT, AI Mode, Gemini, Perplexity and AI Overviews; ChatGPT's own top 5 is Wikipedia, Reddit, Forbes, TechRadar, LinkedIn. Google surfaces lean social; ChatGPT leans editorial. Other studies order them differently (one puts Wikipedia first at 8.9% of slots), and one source notes the big four combined rarely exceed ~5% of citations, i.e. the long tail is most of the pie. Search Engine Land's summary: there is no universal top source. (Not opened.) — [Peec AI](https://peec.ai/blog/top-domains-cited-by-ai-search-analysis-based-on-30m-sources); [Search Engine Land](https://searchengineland.com/ai-citation-data-no-universal-top-source-brands-471285)
- **[B] Volatility (SparkToro + Gumshoe, data Nov-Dec 2025, published Jan 2026).** ~600 volunteers ran 12 prompts 2,961 times through ChatGPT, Claude and Google AI. Fewer than 1 in 100 runs produced the same brand list twice; the same order about 1 in 1,000. Visibility percentage across many runs is a reasonable metric; ranking position is "full of baloney". Narrow categories (e.g. LA Volvo dealers) were more consistent than broad ones (sci-fi novels). Real users' prompts for the same intent had average semantic similarity of 0.081, yet returned similar brand sets. Authors state it is not peer reviewed. — [SparkToro](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/)

### Inferences
- For a brand with zero web mentions, the Ahrefs quartile data implies the starting position is effectively invisible for brand recommendation in AI Overviews, and that the lever is mentions on other sites, not more polish on the product's own pages.
- The narrow-category finding is good news here: "Ferber method timer app" is a very narrow category with few candidates, so an assistant that retrieves anything relevant has few alternatives to choose from.
- Adding statistics, quotations and citations to the guide is cheap, harmless and consistent with being a good source, but the expected gain should be treated as small and uncertain, not "40%".

### Gaps
- No studies by Seer Interactive, Kevin Indig, Semrush or Profound were opened; I found only a second-hand Semrush figure (LinkedIn cited in 14.3% of ChatGPT Search responses across 325K prompts) and no Profound domain-share data.
- No true replication of the GEO paper on live commercial engines was found.
- No study isolates causation between mentions and AI visibility.

## 3. llms.txt

### Takeaway
llms.txt is essentially unread by the assistants that matter and Google has said it is not needed. It costs nothing to keep, but it should not be counted as a visibility tactic.

### Cited Findings
- **[A]** Google: "You don't need to create new machine readable files, AI text files, or markup to appear in these features." — [Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)
- **[B/C] Ahrefs (137,000+ domains, May 2026 logs):** about a quarter of domains published the file; ~97% of those files received zero requests in the month. Fetchers seen included GPTBot, Claude-Code, PerplexityBot and non-AI agents such as Slackbot. (Second-hand.) — [PPC Land](https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/); [Let's Data Science](https://letsdatascience.com/news/ahrefs-finds-97-of-llmstxt-files-receive-no-requests-fc471b83)
- **[B/C] Common Crawl (584,107 llms.txt files, July 2026 crawl):** most were plugin-generated templates; the file "grants nothing and blocks nothing, and no crawler is obliged to read it." — [Common Crawl](https://commoncrawl.org/blog/a-content-analysis-of-llms-txt-files-from-the-july-2026-crawl-archive)
- **[C] Otterly 90-day log test:** 84 of 62,100+ AI bot visits touched llms.txt (~0.1%). — [Optimizely](https://www.optimizely.com/de/field-notes/articles/does-llms-txt-work)
- **[C] EZY Research (83 sites, Apr-Jul 2026):** OpenAI's crawler fetched llms.txt 7 times versus 3,990 robots.txt fetches; Meta's crawler was the outlier at 193. — [Something Inc.](https://somethinginc.com/blog/llms-txt-ai-crawlers-fetch-data/)

### Inferences
- Keep the existing file (it is accurate, tiny and useful to coding agents and the occasional fetcher) but spend no further effort on it. Time is better spent on a page a human or assistant would actually land on.
- GitHub Pages provides no server logs, so the site cannot even observe whether anything fetches it.

### Gaps
- I found no on-record statement from OpenAI or Anthropic that their search products read llms.txt, and no John Mueller quote in this run (his earlier scepticism is widely reported but was not retrieved here).

## 4. How assistants answer "best app for X", and how a new app enters the consideration set

### Takeaway
For app recommendations specifically, the App Store listing itself is the single most-cited source in ChatGPT, ahead of the whole open web, so the listing text is the highest-leverage asset. After that, third-party lists and community threads feed the candidate set; self-published "best" lists work less well than they did and carry risk.

### Cited Findings
- **[B, vendor] AppTweak (published 30 Sept 2026; May 2026 data; 125,000+ ChatGPT responses, US; 9,489 non-branded app prompts plus 9,000+ game prompts):** Apple App Store pages were 37.6% of cited sources, Google Play 9.6%, store listings combined 47.5%; open web (brand pages plus aggregator/review sites) 27%; no source cited 22.6% (answer came from model memory). Store share varied by category from 65.8% (Weather) to 29.3% (Food & Drink). Reddit and Wikipedia are cited about five times more for games than for apps. ChatGPT only; no Gemini or Perplexity data. The study does not show which listing fields are used; "optimise the long description" is AppTweak's advice, not a finding. — [AppTweak](https://www.apptweak.com/en/aso-blog/which-sources-do-ai-search-engines-cite-when-recommending-mobile-apps)
- **[C, vendor]** AppTweak also reports App Store chart rank does not predict ChatGPT recommendations (Feb 2026 dating-app comparison), and that in an Aug 2026 survey of 1,000 US adults, 59% still go to the store to check reviews, ratings or screenshots after an AI recommendation. — [AppTweak](https://www.apptweak.com/en/aso-blog/how-ai-engines-decide-which-app-to-recommend?format=md); [AppTweak survey](https://www.apptweak.com/en/aso-blog/ai-app-discovery-survey?format=md)
- **[C]** An academic preprint, "Evaluating LLM-Based Mobile App Recommendations: An Empirical Study", questions the consistency and explainability of LLM app rankings and their alignment with ASO metrics (small sample; not opened). — [Moonlight review](https://www.themoonlight.io/review/evaluating-llm-based-mobile-app-recommendations-an-empirical-study)
- **[B] "Best X" lists drive recommendations.** Ahrefs (Glen Allsopp, Dec 2025) studied 26,283 source URLs behind ChatGPT recommendations; a secondary source says "best" lists made up 43.8% of them (figure unverified). — [Ahrefs](https://ahrefs.com/blog/best-lists-research/)
- **[B/C] Self-promotional lists are a minority and declining.** Peec (232,000 citations, Dec 2025-Feb 2026): ~11% of citations were self-promotional listicles; ChatGPT lowest at ~4%, Google AI Mode and Perplexity ~10-11%. A Wix Studio analysis (secondary) says ChatGPT's listicle citations fell ~30% between Dec 2025 and Jan 2026 and that third-party lists took 80.9% of listicle citations versus 19.1% for self-promotional ones in one vertical. Ahrefs' own experiment is titled "Self-Promotional Content Works—Until It Backfires". Reports of Google demoting self-promotional best-of pages are anecdotal. (Not opened.) — [Peec](https://peec.ai/blog/self-promotional-listicles-analysis-from-232k-citations); [Ahrefs experiment](https://ahrefs.com/blog/self-promotional-content-ai-seo-experiment/)
- **[B]** Reddit and YouTube appear in the top five cited domains of all five engines in the Peec data. — [Peec AI](https://peec.ai/blog/top-domains-cited-by-ai-search-analysis-based-on-30m-sources)

### Inferences
- Priority order for an iOS app follows from the AppTweak split: (1) App Store listing, (2) own site pages that state plain facts, (3) third-party mentions. Roughly a fifth of answers come from model memory, which only future training crawls of web mentions can influence, and only slowly.
- The App Store listing should read as a factual answer, not ad copy: in the first lines of the description, say what it is ("a timer for the Ferber method of graduated check-ins"), who it is for, platform, price model ("2 free nights, then $4.99 once"), and distinguishing facts (partner sync, no ads, no tracking). The subtitle and name already carry "Baby Sleep Timer"; "Ferber method" should appear in the description body because that is the phrase parents and assistants use. This is inference from where citations land, not a tested result.
- Honest routes into the candidate set for a zero-mention app: submit to established directories (Product Hunt, AlternativeTo, indie app directories); email the authors of existing "best sleep training apps" articles with a factual one-paragraph description and a promo code; answer real questions on Reddit under a disclosed developer identity where sub rules allow; a short YouTube demo (YouTube is heavily cited by Google's AI surfaces). None of these has app-specific causal evidence; they follow from the mention-correlation and citation-source data.
- Astroturfed Reddit posts are both off-limits here and practically fragile: parenting subreddits moderate self-promotion heavily.

### Gaps
- No evidence on whether App Store user reviews (as opposed to description text) are read by assistants.
- No data on Product Hunt or AlternativeTo citation rates for app queries.
- No independent (non-ASO-vendor) replication of the App Store citation share; nothing for Gemini, Claude, Perplexity or Copilot on app queries.
- I did not check which pages currently get cited for "best sleep training app" or "Ferber method app" prompts; that is a 30-minute manual exercise worth doing before outreach.

## 5. Content formats that get extracted, and schema markup

### Takeaway
Assistants extract visible HTML text; structured data shows no measurable citation lift in the one large controlled study. Clear visible structure (question headings, a direct answer first, real HTML tables, explicit entity facts) is reasonable practice with weak direct evidence.

### Cited Findings
- **[B/C] Ahrefs schema test (published May 2026):** 1,885 pages that added JSON-LD between Aug 2025 and Mar 2026 versus ~4,000 controls showed no meaningful citation uplift in AI Overviews, AI Mode or ChatGPT; the only statistically significant change was a small decline in AI Overviews, which cannot confidently be attributed to schema. Limitation: all pages were already heavily cited, so it does not test never-cited pages. (Second-hand.) — [TechWyse summary](https://www.techwyse.com/news/ai-search/schema-markup-ai-citations-ahrefs-study); [CMSWire](https://www.cmswire.com/digital-marketing/does-structured-data-actually-improve-answer-engine-citations/)
- **[C]** A searchVIU test found that during direct page retrieval every AI system extracted only visible HTML content, not JSON-LD. This does not rule out use at indexing time. — [TechWyse summary](https://www.techwyse.com/news/ai-search/schema-markup-ai-citations-ahrefs-study)
- **[A]** Google: no special schema needed for AI features; structured data remains worthwhile for rich-result eligibility. — [Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)
- **[A, older]** The GEO paper found gains vary by domain; its abstract supports only "up to 40%" and domain dependence. — [arXiv 2311.09735](https://arxiv.org/abs/2311.09735)

### Inferences
- Keep the FAQ JSON-LD (harmless, helps classic search) but make sure every fact in it is also visible on the page, since visible text is what gets extracted.
- For "how long do I wait on night 3 of Ferber?" the page should contain a sentence that answers exactly that in words ("On night 3 the waits are 10, 15, then 20 minutes"), next to the HTML table, with one sentence per night. A fan-out sub-query retrieves a passage; a self-contained sentence survives extraction better than a table cell without its headers. This is practitioner reasoning [D], consistent with how passage retrieval works, not a measured result.
- State the entity plainly and identically everywhere (site, App Store, directories): "Check In: Baby Sleep Timer is an iPhone app that times Ferber-method check-ins. Two nights free, then $4.99 once. No ads or tracking." Consistent naming makes separate mentions resolve to one entity [D].
- Show a visible "last updated" date and cite the source of the chart (Ferber's book, and medical bodies for safety points). The GEO paper's citation/statistics finding and the health caution in section 7 both point the same way.
- Original data is the one format a tiny site can own. After launch, aggregate anonymised figures are not available (the app has no tracking), so this would need opt-in or public sources; flag rather than assume.

### Gaps
- No controlled evidence found for question-led headings, tables, definitions or freshness dates specifically affecting AI citation; these remain [D].
- I did not open the Ahrefs schema study itself.

## 6. First-party comparison content

### Takeaway
Self-published comparison and "best" pages do get cited, but less than third-party ones, least by ChatGPT, and with reported backfire risk. A fair, factual comparison page is still worth one page because for a new app nobody else will write it.

### Cited Findings
- **[B/C]** Self-promotional listicles were ~11% of citations overall; ~4% in ChatGPT, ~10-11% in AI Mode and Perplexity (Peec, 232K citations). — [Peec](https://peec.ai/blog/self-promotional-listicles-analysis-from-232k-citations)
- **[B/C]** Ahrefs' experiment on self-promotional content across 9,886 answers from ChatGPT, Gemini, Perplexity and Copilot is titled "works—until it backfires" (details not opened). — [Ahrefs](https://ahrefs.com/blog/self-promotional-content-ai-seo-experiment/)
- **[C]** Scrunch reportedly found brands that rank themselves first gain AI recommendations "from 4 to 7" (units unclear; vendor, not opened). — [PPC Land](https://ppc.land/self-ranked-brands-gain-ai-recommendations-from-4-to-7-scrunch-finds/)

### Inferences
- Write one page, "Ferber method timer apps compared", rather than a "best apps" list that crowns itself. Fair practice: a table of verifiable facts per app (price and model, platforms, whether it has a Ferber interval timer, partner sync, ads/tracking, date checked, link to each App Store page); say plainly what the larger apps do that Check In does not (Huckleberry's sleep tracking and schedule predictions, for instance); state "we make Check In" at the top; no ranking numbers; re-check and re-date quarterly.
- The honest framing is also the effective one: assistants answering "is there an app for the Ferber method?" need a passage that says which apps have a Ferber timer and which are general trackers. That is a factual gap this page can fill.
- Competitor facts must be checked against their current App Store listings at writing time; do not rely on these notes for competitor features.

### Gaps
- No evidence specific to "X vs Y" pages (as opposed to "best X" lists).
- Details of the Ahrefs backfire mechanism were not read.

## 7. Health-adjacent caution

### Takeaway
Google says its health AI answers lean on reputable medical sources, but measured citations are messier (YouTube is the top single domain in one large study). A non-clinician site can be cited for factual, mechanical questions (the interval chart) but should not expect to be the source for medical judgment, and should not try.

### Cited Findings
- **[B/C] SE Ranking (50,807 German health queries, reported Jan 2026):** YouTube was the most-cited domain in health AI Overviews at 4.43% of citations (20,621), ahead of any hospital, government or academic site; one secondary source puts "more reliable medical sources" at about 34.45% of citations. Results may not extrapolate beyond Germany. Google says its summaries draw on sources such as the CDC and Mayo Clinic, and has removed AI Overviews for some medical queries. (Not opened.) — [Slashdot / The Guardian summary](https://tech.slashdot.org/story/26/01/25/0043256); [eWeek](https://www.eweek.com/news/youtube-google-ai-health-searches/)
- **[C]** A separate Authoritas analysis of 1,000 keywords found YouTube in 16.5% of health AI summaries. — [ALM Corp summary](https://almcorp.com/blog/google-ai-overviews-youtube-health-study-2026/)

### Inferences
- "How long do I wait on night 3?" is a lookup against a published chart, the kind of question where a clear non-clinical page can be cited. "Is the Ferber method safe at 4 months?" is medical judgment where assistants should and mostly will prefer paediatric sources; the site should answer such questions by pointing to the AAP / a paediatrician, attribute the chart to Ferber's book, and say who wrote the page and that they are not a clinician.
- Visible sourcing and an honest "not medical advice, talk to your paediatrician" line are right for parents and also align the page with what quality systems look for.
- Given how heavily Google's health answers cite YouTube, a plain, accurate video walking through the chart is a plausible route to citation [D].

### Gaps
- No study found on infant-sleep or parenting queries specifically, or on US health queries.
- No data on how ChatGPT, Claude or Perplexity weight medical authority for parenting questions.

## 8. Shopping and app surfaces inside assistants

### Takeaway
The in-assistant commerce features of 2025-26 are built for physical retail and for apps that run inside ChatGPT; none is a channel for promoting a paid iOS app. Ordinary cited answers linking to the App Store remain the only route.

### Cited Findings
- **[C]** ChatGPT "shopping research" builds product guides for logged-in users on all plans; OpenAI dropped Instant Checkout in March 2026 in favour of merchants' own checkouts and retailer apps inside ChatGPT. — [MacRumors](https://www.macrumors.com/2026/03/25/chatgpt-revamps-shopping-features/); [Digital Commerce 360](https://www.digitalcommerce360.com/2026/03/06/openai-shifts-checkout-plans-agentic-commerce-strategy/)
- **[C]** The ChatGPT app directory (chatgpt.com/apps) holds about 900 apps, roughly 10% shopping-related; these are integrations that run inside ChatGPT, not listings of iOS apps. — [eWeek](https://www.eweek.com/news/chatgpt-app-store-developers-neuron/); [MarTech](https://martech.org/openai-expands-chatgpt-into-an-app-platform-and-a-new-channel-for-marketers/)
- **[A]** OpenAI now runs ads in ChatGPT (existence of `OAI-AdsBot` for validating ad landing pages). — [OpenAI crawler docs](https://developers.openai.com/api/docs/bots.md)
- **[B, vendor]** When ChatGPT recommends apps it cites apps.apple.com pages directly (37.6% of sources). — [AppTweak](https://www.apptweak.com/en/aso-blog/which-sources-do-ai-search-engines-cite-when-recommending-mobile-apps)

### Inferences
- Building a ChatGPT app for a sleep timer makes no sense for this product (the value is a lock-screen alert at 2am).
- The public App Store web page is the "product feed" for apps. Whatever is on it is what assistants quote.

### Gaps
- Nothing found on Gemini surfacing App Store/Play links or app cards, or on Perplexity shopping handling apps.
- ChatGPT ads pricing, minimums and availability to small advertisers were not researched.

## 9. Measurement without analytics

### Takeaway
Two free first-party reports now exist (Bing's AI Performance, Google's generative AI reports), and the rest is a manual prompt log. Track "how often do we appear across repeated runs", never "what position".

### Cited Findings
- **[C] Bing Webmaster Tools "AI Performance"** (public preview since Feb 2026, free for verified sites, at bing.com/webmasters/aiperformance): shows citation counts, cited pages and "grounding queries" across Copilot, Bing AI summaries and unnamed partner integrations; no click data; cannot filter by channel. Newer preview reports include Intents, Topics, Citation Share and Compare. — [Search Engine Land](https://searchengineland.com/bing-webmaster-tools-testing-new-ai-performance-report-468039); [Search Influence](https://www.searchinfluence.com/blog/bing-ai-performance-report-copilot-citations/); [Practical Ecommerce](https://www.practicalecommerce.com/bings-improved-ai-performance-section)
- **[A]** Google: AI feature appearances "are included in the overall search traffic in Search Console" under the Web search type. — [Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)
- **[C]** Google launched dedicated generative AI performance reports in Search Console on 3 June 2026 (data from 18 May 2026; reportedly UK-first rollout) covering AI Overviews, AI Mode and Discover AI features; one vendor says impressions only, without query data. AI Mode clicks/impressions have counted in the main Performance report since June 2025. A Search Console control to opt out of grounding these features was also added. — [PPC Land](https://ppc.land/google-finally-gives-search-console-its-own-generative-ai-visibility-reports/); [ThinkProfits](https://thinkprofits.com/digital-news/search-console-generative-ai-impressions-explained/); [SE Roundtable](https://www.seroundtable.com/google-search-console-counting-ai-mode-39599.html)
- **[C]** ChatGPT search links carry `utm_source=chatgpt.com` (some coverage renders it `chatgpt`); GA4 added an "AI Assistant" channel in mid-2026. — [Hartzer](https://hartzer.it.com/guides/what-ai-search-analytics-can-and-cannot-tell-you/); [Alphonso Labs](https://www.alphonsolabs.com/ai-mode-traffic-ga4-source-medium-check/amp/)
- **[B]** Visibility percentage over many runs is valid; position is not; identical lists recur in under 1% of runs. — [SparkToro](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/)

### Inferences
- With GitHub Pages (no logs) and no analytics, the site cannot see referrals or crawler hits at all. Options that keep the no-tracking stance: (a) rely on Bing AI Performance plus Search Console; (b) add an App Store campaign link (`ct=`/`pt=` campaign tokens in App Store Connect) on the website's download button so App Analytics shows installs that came via the site, with no web tracking; (c) optionally a cookieless, privacy-first counter if the owner is comfortable with it.
- Bing's "grounding queries" are the only free view of the actual sub-queries an assistant issued that led to the site. That makes it the best input for deciding which question to answer next.
- Manual prompt log: 10-15 fixed prompts (the three in the brief, plus variants such as "Ferber method timer iPhone", "app to time check-ins sleep training", "Ferber chart night 5", "Huckleberry alternative for Ferber"), run 5 times each per assistant in a fresh logged-out/temporary chat, monthly. Record: app named (y/n), site cited (y/n), which other sources were cited. The cited sources list is a to-do list of places to get mentioned. 5 runs is a compromise; SparkToro used 60-100 per prompt.
- Paid trackers are not worth it at this scale; SparkToro's data says small-sample position numbers are noise.

### Gaps
- Whether the Search Console generative AI reports have reached US properties and whether they show queries was not confirmed from Google's own announcement.
- Low-cost tracking tools were not compared; no pricing gathered.
- No way found to measure Claude, Perplexity or ChatGPT citations first-party without analytics.

## 10. Realistic odds, timeline, and the highest-leverage actions

### Takeaway
Being cited for the narrow chart questions is achievable within weeks to a few months of indexing; being named for "best sleep training app" depends on third-party mentions that take months to accumulate and may never displace established apps. The work that matters is the App Store listing, a handful of precise pages, and earning real mentions.

### Cited Findings
- **[B]** Brands in the bottom half for web mentions averaged 0-3 AI Overview mentions versus 169 for the top quartile. — [Ahrefs](https://ahrefs.com/blog/ai-overview-brand-correlation/)
- **[B]** Narrow categories give more consistent recommendation sets than broad ones. — [SparkToro](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/)
- **[B, vendor]** 47.5% of ChatGPT app-recommendation citations are store listings; 22.6% of answers cite nothing (model memory). — [AppTweak](https://www.apptweak.com/en/aso-blog/which-sources-do-ai-search-engines-cite-when-recommending-mobile-apps)
- **[B/C]** No reviewed GEO technique produces a stable cross-platform effect. — [PPC Land on arXiv 2607.14035](https://ppc.land/survey-of-45-studies-finds-geo-rewrites-can-cut-a-pages-ai-retrieval-16/)
- **[A]** Search-crawler robots changes register in ~24 hours at OpenAI; Google requires only indexing plus snippet eligibility. — [OpenAI](https://developers.openai.com/api/docs/bots.md); [Google](https://developers.google.com/search/docs/appearance/ai-features)

### Inferences
Odds, as judgment rather than measurement:

- "Is there an app for the Ferber method?" (narrow, few true candidates): reasonable chance of appearing in some share of runs within 1-3 months of the App Store page and site being indexed, provided the listing says "Ferber method" in plain words. Highest-probability win.
- "How long do I wait on night 3 of Ferber?": the guide can be one of several cited sources, competing with established parenting and medical sites. Plausible over 2-6 months; the assistant will often answer from memory with no citation at all.
- "Best sleep training timer app" (broad): low odds in the first 6 months; dominated by apps with years of mentions. Moves only as third-party lists and threads start naming the app.
- Model-memory answers (no live search) will not know the app until a future model trains on pages that mention it; a year or more.

Prioritised actions (evidence grade for the tactic in brackets):

1. **Write the App Store description as a factual answer.** First two sentences: what it is, "Ferber method / graduated check-ins", iPhone, 2 free nights then $4.99 once, partner sync, no ads or tracking. [B, vendor: store pages are the top cited source for app queries]
2. **Make the app page on the site state the same entity facts in visible text**, with the App Store link, and use identical naming everywhere. [D, cheap]
3. **Add one self-contained sentence per night under the interval chart** and question-form headings matching real queries ("How long do I wait on night 3?"), with a visible updated date and the chart's source. [D for format; A that visible, indexed, snippet-eligible text is what Google uses]
4. **Check indexing on all five surfaces**: Google and Bing consoles (done), plus manual `site:` checks on Brave (feeds Claude), and asking ChatGPT and Perplexity to summarise the URL. Submit the sitemap in Bing and use IndexNow if available. [A/B]
5. **Earn 5-10 genuine third-party mentions in the first two months**: Product Hunt, AlternativeTo and app directories; factual outreach to authors of existing sleep-training-app roundups; disclosed, rule-abiding participation where parents ask for a Ferber timer. Use the sources assistants cite today for the target prompts as the outreach list. [B: mentions correlate at 0.664; causation unproven]
6. **Publish one fair "Ferber timer apps compared" page** with dated, verifiable facts and disclosure. [B/C: self-published comparisons are cited, less so by ChatGPT; avoid self-crowning lists]
7. **Post a short, plain YouTube walkthrough of the chart and the app.** [B/C: YouTube is a top-cited domain on Google's AI surfaces, including health; no app-specific evidence]
8. **Start the monthly prompt log and watch Bing AI Performance grounding queries**; add an App Store campaign token to the site's download link. [B for the metric choice]
9. **Consider a custom domain** before mentions accumulate, since moving later splits them. [D: my inference; no measured evidence]
10. **Do not spend time on**: more llms.txt work [B: ~97% unread], more schema types [B: no lift], paid AI-visibility trackers [B: position data is noise], or a ChatGPT app.

### Gaps
- No published case study of a brand-new niche iOS app's AI-citation timeline was found; the timelines above are my estimates.
- Which pages assistants currently cite for the three target prompts was not tested in this research.
- Whether Product Hunt / directory listings themselves get cited for parenting-app queries is unknown.
