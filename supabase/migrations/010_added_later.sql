-- Nights entered afterwards with "Add a missed night": their totals are real,
-- but the times between bedtime and morning were spread out evenly, so the app
-- shows them as a summary rather than a timeline.
alter table public.nights add column if not exists added_later boolean not null default false;
