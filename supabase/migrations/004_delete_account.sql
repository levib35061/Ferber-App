-- Check In — migration 004: "Delete my account and data" (required by Apple
-- for apps with accounts). Run once in Supabase → SQL Editor. Safe to re-run.
--
-- Removes the calling user from every family. A family left with no members
-- is deleted with all its data (babies, nights, events cascade). If a partner
-- remains, the shared nights stay with them and this user's id is removed
-- from them. Finally deletes the user's sign-in account.

create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  fid uuid;
begin
  if uid is null then
    raise exception 'not signed in';
  end if;

  for fid in select family_id from public.family_members where user_id = uid loop
    delete from public.family_members where family_id = fid and user_id = uid;
    if not exists (select 1 from public.family_members where family_id = fid) then
      delete from public.families where id = fid;
    else
      update public.events set created_by = null where family_id = fid and created_by = uid;
      update public.nights set on_duty = null where family_id = fid and on_duty = uid;
    end if;
  end loop;

  -- Families this user created that nobody belongs to any more go too.
  delete from public.families f
   where f.created_by = uid
     and not exists (select 1 from public.family_members m where m.family_id = f.id);

  -- Families this user created that still have members keep going (the
  -- created_by link would otherwise delete them along with this account).
  update public.families set created_by = (
    select user_id from public.family_members m where m.family_id = families.id limit 1
  ) where created_by = uid;

  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
