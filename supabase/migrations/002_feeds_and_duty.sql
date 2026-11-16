-- Check In — migration 002: night feeds + who's on duty.
-- Run once in Supabase → SQL Editor (after schema.sql). Safe to re-run.

-- Night feeds: allow the new event types.
alter table public.events drop constraint if exists events_type_check;
alter table public.events add constraint events_type_check check (
  type in ('down', 'cry', 'quiet', 'check_in_start', 'check_in_end', 'feed_start', 'feed_end', 'asleep', 'woke')
);

-- Who's on duty tonight: the user id of the parent who gets check-in alerts.
alter table public.nights add column if not exists on_duty uuid;
