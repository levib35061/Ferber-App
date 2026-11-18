-- Check In — migration 008: Supabase performance advisor fixes. Safe to re-run.

-- Indexes for foreign keys (faster deletes and joins).
create index if not exists events_night_id on public.events (night_id);
create index if not exists families_created_by on public.families (created_by);
create index if not exists nights_baby_id on public.nights (baby_id);

-- Evaluate auth.uid() once per query, not once per row.
drop policy if exists "members leave a family" on public.family_members;
create policy "members leave a family" on public.family_members
  for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "own push tokens" on public.push_tokens;
create policy "own push tokens" on public.push_tokens
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
