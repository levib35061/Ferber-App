# Apple Ads: launch-week test on the free $100 credit

Goal: **keyword research, not profit.** A sale nets about $4.24 and US installs cost a few dollars,
so ads can't pay for themselves (reasoning: `reports/Check In app launch strategy.md`). The credit
tells us which words parents actually type and which ones turn into downloads, and those words go
into the free App Store keyword fields. Stop when the credit is used up.

## Before launch day (10 minutes)

1. Go to **ads.apple.com** → sign in with the same Apple ID as App Store Connect → choose
   **Apple Ads Advanced** (not Basic: Basic shows no keyword data, and keyword data is the point).
2. Link it to App Store Connect at the top-level account when asked. That's what makes the account
   eligible for the one-time **$100 promotional credit** (Apple decides eligibility; the credit shows
   under Billing if you got it).
3. Billing: add a card (required even with the credit). Set the account to **US only**.

## Campaigns (create both on launch day, once the app is live)

### Campaign 1: "Exact - Ferber" (about 70% of the budget)

- Country: United States · Placement: **Search results**
- Daily budget: **$3** · Campaign end: none (you'll pause it when the credit is gone)
- Ad group "Exact": **Search Match OFF**, audience: all users, ages 18+ (default)
- Keywords, **Exact match**, starting max cost-per-tap bid **$0.75**:

| Keyword | Why |
| --- | --- |
| `ferber method` | the main search |
| `ferber` | short form |
| `ferber timer` | people who want exactly this |
| `ferber method app` | |
| `ferber sleep training` | |
| `sleep training timer` | the generic version |
| `sleep training app` | broader, more competition |
| `baby sleep training` | broader still |
| `cry it out` | related method; watch whether it converts |
| `check and console` | what consultants call it |
| `controlled crying` | UK/AU wording, used in the US too |
| `graduated extinction` | the formal name |

- Negative keywords (campaign level, exact): `white noise`, `lullaby`, `baby monitor`, `huckleberry`,
  `napper`, `sleep sounds`. These are other needs, or rival brands (bidding on rival names is
  allowed, but their installs cost more than a sale is worth).

### Campaign 2: "Discovery" (about 30% of the budget)

- Country: United States · Placement: Search results · Daily budget: **$1.50**
- Ad group "Search Match": **Search Match ON**, no keywords, bid **$0.60**
- Add every keyword from Campaign 1 as a **negative exact** keyword here, so the two campaigns
  don't compete. This campaign's only job is to show which other searches Apple matches the app to.

## Each week (15 minutes, for 3–4 weeks)

1. **Campaign 2 → Search Terms report:** for any term with 1+ install that isn't in Campaign 1,
   add it to Campaign 1 as exact, and as a negative in Campaign 2.
2. **Campaign 1 → Keywords:** look at impressions, taps, installs and cost per install (CPI).
   - No impressions after a week: raise the bid to $1.00 once; if still nothing, that term has
     little search volume. That's useful to know.
   - Many taps but no installs: the screenshots or the first lines aren't convincing for that search.
     Note it; don't spend more on it.
   - Installs: these are the keepers. Note them.
3. Note the totals in `docs/MARKETING_TODO.md` (see "What we learned" below).

## When the credit runs out

Pause both campaigns. Only keep a keyword running with your own money if its **cost per install is
below (share of installers who buy) × $4.24**. You'll know that share from App Store Connect after a
few weeks; until then, assume ads lose money and stop.

## What to do with the results (free, permanent)

- Keywords that brought installs but aren't in the app name or subtitle → put them in the English (US)
  keyword field (100 characters), replacing words that showed no volume.
- If "sleep training" clearly beats "Ferber", consider the subtitle "Sleep Training Timer" at the next
  update (subtitle changes need an app update to go live).
- Terms that worked in the US: also good for the UK/Australia keyword fields.

## What we learned (fill in)

| Keyword | Impressions | Taps | Installs | CPI | Keep in keywords? |
| --- | --- | --- | --- | --- | --- |
| | | | | | |
