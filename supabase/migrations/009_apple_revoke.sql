-- Check In — migration 009: Sign in with Apple token revocation.
-- Safe to re-run.
--
-- apple_tokens: the Apple refresh token for accounts that signed in with Apple,
-- so the delete-account Edge Function can revoke it with Apple (Apple's rule
-- for apps that offer Sign in with Apple). Server-only: RLS on, no policies.
--
-- delete_user_account(uid): the account deletion itself, callable only by the
-- server (the delete-account Edge Function). delete_my_account() stays as a
-- thin wrapper so older app versions keep working.

create table if not exists public.apple_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  refresh_token text not null,
  updated_at timestamptz not null default now()
);
alter table public.apple_tokens enable row level security;

create or replace function public.delete_user_account(uid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  fid uuid;
begin
  if uid is null then
    raise exception 'no user';
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

revoke execute on function public.delete_user_account(uuid) from public, anon, authenticated;
grant execute on function public.delete_user_account(uuid) to service_role;

create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  perform public.delete_user_account(auth.uid());
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
