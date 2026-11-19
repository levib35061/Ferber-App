-- Unlocks are keyed by the RevenueCat entitlement ('unlock'), not the store product id,
-- so a purchase, a restore (TRANSFER) and a refund all update the same row.
insert into public.unlocks (user_id, product_id, active, store, environment, last_event_id, updated_at)
select user_id, 'unlock', active, store, environment, last_event_id, updated_at
from public.unlocks where product_id <> 'unlock'
on conflict (user_id, product_id) do update
  set active = excluded.active or public.unlocks.active,
      updated_at = greatest(excluded.updated_at, public.unlocks.updated_at);
delete from public.unlocks where product_id <> 'unlock';
