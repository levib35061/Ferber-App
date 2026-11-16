-- Check In — migration 005: shared unlock + partner push.
-- Run once in Supabase → SQL Editor. Safe to re-run.

-- ---------- unlocks (written ONLY by the revenuecat-webhook Edge Function) ----------
-- One partner pays and the whole family is unlocked. The app can read the
-- result through my_unlock_status() but can never write here: RLS is on with
-- no policies, so only the service role (the Edge Function) can.

create table if not exists public.unlocks (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  active boolean not null default true,
  store text,
  environment text,
  last_event_id text,
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.unlocks enable row level security;

-- True if this user, or anyone in a family with this user, has an active unlock.
create or replace function public.my_unlock_status() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.unlocks u
    where u.active
      and (
        u.user_id = auth.uid()
        or u.user_id in (
          select m2.user_id from public.family_members m1
          join public.family_members m2 on m2.family_id = m1.family_id
          where m1.user_id = auth.uid()
        )
      )
  );
$$;

revoke execute on function public.my_unlock_status() from public, anon;
grant execute on function public.my_unlock_status() to authenticated;

-- ---------- push tokens (partner alerts) ----------

create table if not exists public.push_tokens (
  token text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  platform text not null default 'ios',
  updated_at timestamptz not null default now()
);

create index if not exists push_tokens_user on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

drop policy if exists "own push tokens" on public.push_tokens;
create policy "own push tokens" on public.push_tokens
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Register this phone's push token for the signed-in user. A token moves to
-- the new user if the phone signed in again (e.g. after a reinstall).
create or replace function public.register_push_token(t text, p text default 'ios') returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  insert into public.push_tokens (token, user_id, platform, updated_at)
  values (t, auth.uid(), p, now())
  on conflict (token) do update set user_id = excluded.user_id, platform = excluded.platform, updated_at = now();
end;
$$;

revoke execute on function public.register_push_token(text, text) from public, anon;
grant execute on function public.register_push_token(text, text) to authenticated;
