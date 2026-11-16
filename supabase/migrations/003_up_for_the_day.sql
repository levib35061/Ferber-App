-- Check In — migration 003: "Up for the day" ends the night.
-- Run once in Supabase → SQL Editor. Safe to re-run.

alter table public.events drop constraint if exists events_type_check;
alter table public.events add constraint events_type_check check (
  type in ('down', 'cry', 'quiet', 'check_in_start', 'check_in_end', 'feed_start', 'feed_end', 'asleep', 'woke', 'up')
);
