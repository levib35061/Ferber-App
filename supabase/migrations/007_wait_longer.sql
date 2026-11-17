-- Check In — migration 007: the "Wait a little longer" tap (skips a check-in).
-- Run once in Supabase → SQL Editor. Safe to re-run.

alter table public.events drop constraint if exists events_type_check;
alter table public.events add constraint events_type_check
  check (type in ('down', 'cry', 'quiet', 'check_in_start', 'check_in_end', 'wait_more', 'feed_start', 'feed_end', 'asleep', 'woke', 'up'));
