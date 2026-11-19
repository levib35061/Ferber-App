# Sleep-consultant outreach (launch week)

A playbook so any session can run this without the original conversation.

## What it is

About 20 independent pediatric sleep consultants who openly use timed check-ins / the
Ferber method get one short, personal email from Levi offering their clients the full app
for free, with a code made just for them. Template and follow-up: `docs/LAUNCH_COPY.md`
→ "3. Sleep consultants".

## Where the list is

**Not in this repo** (the repo is public; `docs/outreach/` is gitignored). The list of 21,
with each consultant's published business email, evidence link and a ready-written personal
opener, is an email in Levi's Gmail with the subject
**"Check In launch: consultant list with openers (21)"**, forwarded to askcheckin@gmail.com.
Read it from Gmail with the Gmail tools (search for that subject).

## Decisions already made (don't re-ask)

- Send from **askcheckin@gmail.com** (the Gmail connector must be signed in to that account).
- **Personal opener** per consultant, from what their own site says (already written in the list email).
- **One offer code per consultant** (e.g. `ROCKABYE`), so we can see who sends clients.
- Sign as **Levi**. Subject: `A free Ferber timer for your clients`.
- One follow-up only, a week later, only if no reply.

## Steps

1. **Prerequisites:** the app is live on the App Store (`python3 tools/site/app_links.py live`
   has been run), video 3 is public, and the offer codes exist. Codes: App Store Connect →
   In-App Purchases → `checkin_unlock` → Offer Codes, one custom code per consultant, free,
   created **at least 3 days before** sending (free codes can take 48–72 hours to work).
   Ask Levi for the list of codes and the App Store / video links.
2. **Recheck each consultant** before drafting: open their evidence link and make sure the
   page still says they use check-ins and the email is still on their site. Drop any that
   no longer fit; never guess an email address. The two "form only" consultants get the
   text to paste into their contact form instead of a draft.
3. **Create one Gmail draft per consultant** (never send) from the template with their
   opener, code and the links filled in.
4. **Show Levi the drafts and wait.** Send only the ones he explicitly approves, and only
   after he says so in that conversation.
5. Note the send date per consultant in Levi's list email thread (reply to himself), and
   draft the single follow-up a week later for those who didn't reply.

## Rules

- Never send anything without Levi's explicit go-ahead in the current conversation.
- Never commit consultant names or emails to this repo.
- Never add consultants to a mailing list or send more than the one follow-up.
- If a consultant replies asking not to be contacted, stop and tell Levi.
