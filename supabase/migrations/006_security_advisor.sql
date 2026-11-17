-- Check In — migration 006: Supabase Security Advisor fixes.
-- Run once in Supabase → SQL Editor. Safe to re-run.

-- lww_stamp only touches the row being written, so it needs no search path.
alter function public.lww_stamp() set search_path = '';

-- is_family_member is only used by row-level security for signed-in users;
-- signed-out visitors don't need to call it.
revoke execute on function public.is_family_member(uuid) from public, anon;
grant execute on function public.is_family_member(uuid) to authenticated;
