-- Check In: Baby Sleep Timer — Supabase schema (Milestone 3: partner sync)
--
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- For a NEW project only (it already includes every migration in
-- supabase/migrations/). An existing project runs the migrations instead.
--
-- Model: a "family" links parent accounts to one baby. Every synced row
-- carries family_id, and row-level security only lets family members see
-- or change their family's rows. Times are client epoch ms (UTC).
-- Sync rule: last write wins per row, by the client's updated_at.
-- Rows are never hard-deleted by the app (events use deleted_at).

create extension if not exists pgcrypto;

-- ---------- families ----------

create table public.families (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.family_members (
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create index family_members_user on public.family_members (user_id);

-- security definer so policies can call it without recursive RLS checks
create function public.is_family_member(fid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.family_members where family_id = fid and user_id = auth.uid());
$$;

revoke execute on function public.is_family_member(uuid) from public, anon;
grant execute on function public.is_family_member(uuid) to authenticated;

-- ---------- synced data ----------

create table public.babies (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  name text not null default '',
  birth_date text,
  training_start_date text,
  chart_preset text not null default 'ferber',
  custom_chart jsonb,
  updated_at bigint not null,
  server_updated_at timestamptz not null default now()
);

create table public.nights (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  baby_id uuid not null references public.babies (id) on delete cascade,
  night_number integer not null,
  chart_night integer not null,
  night_key text not null,
  started_at bigint not null,
  note text,
  on_duty uuid,
  updated_at bigint not null,
  server_updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  night_id uuid not null references public.nights (id) on delete cascade,
  type text not null constraint events_type_check
    check (type in ('down', 'cry', 'quiet', 'check_in_start', 'check_in_end', 'wait_more', 'feed_start', 'feed_end', 'asleep', 'woke', 'up')),
  at bigint not null,
  created_by uuid,
  deleted_at bigint,
  updated_at bigint not null,
  server_updated_at timestamptz not null default now()
);

create index babies_family_sync on public.babies (family_id, server_updated_at);
create index nights_family_sync on public.nights (family_id, server_updated_at);
create index events_family_sync on public.events (family_id, server_updated_at);
create index events_night_id on public.events (night_id);
create index families_created_by on public.families (created_by);
create index nights_baby_id on public.nights (baby_id);

-- Last write wins: ignore an update older than what's stored, and stamp
-- server_updated_at so clients can pull "everything changed since X".
create function public.lww_stamp() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.updated_at < old.updated_at then
    return null; -- keep the newer row
  end if;
  new.server_updated_at := now();
  return new;
end;
$$;

create trigger babies_lww before insert or update on public.babies for each row execute function public.lww_stamp();
create trigger nights_lww before insert or update on public.nights for each row execute function public.lww_stamp();
create trigger events_lww before insert or update on public.events for each row execute function public.lww_stamp();

-- ---------- row-level security ----------

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.babies enable row level security;
alter table public.nights enable row level security;
alter table public.events enable row level security;

create policy "members read their family" on public.families
  for select to authenticated using (public.is_family_member(id));

create policy "members read their family's members" on public.family_members
  for select to authenticated using (public.is_family_member(family_id));

create policy "members leave a family" on public.family_members
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "members read babies" on public.babies for select to authenticated using (public.is_family_member(family_id));
create policy "members add babies" on public.babies for insert to authenticated with check (public.is_family_member(family_id));
create policy "members update babies" on public.babies for update to authenticated
  using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));

create policy "members read nights" on public.nights for select to authenticated using (public.is_family_member(family_id));
create policy "members add nights" on public.nights for insert to authenticated with check (public.is_family_member(family_id));
create policy "members update nights" on public.nights for update to authenticated
  using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));

create policy "members read events" on public.events for select to authenticated using (public.is_family_member(family_id));
create policy "members add events" on public.events for insert to authenticated with check (public.is_family_member(family_id));
create policy "members update events" on public.events for update to authenticated
  using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));

-- ---------- creating and joining a family ----------

create function public.create_family() returns public.families
language plpgsql security definer set search_path = public as $$
declare
  fam public.families;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  insert into public.families (created_by) values (auth.uid()) returning * into fam;
  insert into public.family_members (family_id, user_id) values (fam.id, auth.uid());
  return fam;
end;
$$;

create function public.join_family(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  fid uuid;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  select id into fid from public.families where invite_code = upper(trim(code));
  if fid is null then
    raise exception 'invite code not found';
  end if;
  insert into public.family_members (family_id, user_id) values (fid, auth.uid()) on conflict do nothing;
  return fid;
end;
$$;

revoke execute on function public.create_family() from public, anon;
revoke execute on function public.join_family(text) from public, anon;
grant execute on function public.create_family() to authenticated;
grant execute on function public.join_family(text) to authenticated;

-- ---------- deleting an account (Apple requires it in-app) ----------

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
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

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

-- ---------- realtime (partner sees taps within seconds) ----------

alter publication supabase_realtime add table public.babies, public.nights, public.events;

-- Check In — Sign in with Apple token revocation.
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
