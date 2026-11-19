# Backlog (from the pre-launch review, Nov 19 2026)

Fixed already: see git log for Nov 19 (alerts for the phone that started a wait, repeat-per-night,
double-tap guard, near-due alert, partner-push priority/recency/undo, unlocks keyed by entitlement,
stop sharing then re-invite, join rate limit, Sign in with Apple wording).

Not fixed yet, roughly in priority order:

1. **Member count after a cold start offline**: `SyncEngine.start()` starts with memberCount 0, so an
   off-duty phone opened with no signal treats itself as solo and buzzes. Persist memberCount/memberIds
   with `setSyncValue` and restore them in `start()` and the background task.
2. **Remove a family member** (e.g. a sitter who no longer helps): no way except leaving and re-inviting.
   Add "Remove" for the family's creator; consider rotating the invite code then.
3. **Apple sign-in onto an existing account**: when `linkIdentity` fails and the phone signs in as another
   user, look up that user's family and reconnect (or ask to leave first), and remove the old anonymous member.
4. **Purchases made outside the app** while RevenueCat is still anonymous may not unlock the partner:
   test on a device; fix with a server call that fetches the RevenueCat customer.
5. **reload() isn't serialised** in NightStore: add a generation counter so an older run can't overwrite a newer one.
6. **Clock skew between phones** can order a partner's "Going in" after this phone's "Back out":
   stamp `at = max(now, lastEvent.at + 1)` when logging.
7. **"Up for the day" by mistake** before 11am leaves no buttons: offer "Not up yet" on that screen.
8. **Follow-up alerts**: one extra reminder 2-3 minutes after a check-in is due, if not acknowledged.
9. Sync details: keyset pagination in pull (`server_updated_at, id`); local writes use
   `max(now, row.updatedAt + 1)`; createNight on a second phone shouldn't clear `onDuty`; leaving offline
   should retry the membership delete; clear `on_duty` when that member leaves.
10. Missed night: adding last night before 11am without an up time; an empty night row with old numbers;
    a missed night older than the round start moving the start back.
11. Free trial can be reset by deleting taps or reinstalling (low priority).
