-- Check In: Baby Sleep Timer — Supabase schema (Milestone 3: partner sync)
--
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run once on a new project.
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
  updated_at bigint not null,
  server_updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  night_id uuid not null references public.nights (id) on delete cascade,
  type text not null check (type in ('down', 'cry', 'quiet', 'check_in_start', 'check_in_end', 'asleep', 'woke')),
  at bigint not null,
  created_by uuid,
  deleted_at bigint,
  updated_at bigint not null,
  server_updated_at timestamptz not null default now()
);

create index babies_family_sync on public.babies (family_id, server_updated_at);
create index nights_family_sync on public.nights (family_id, server_updated_at);
create index events_family_sync on public.events (family_id, server_updated_at);

-- Last write wins: ignore an update older than what's stored, and stamp
-- server_updated_at so clients can pull "everything changed since X".
create function public.lww_stamp() returns trigger
language plpgsql as $$
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
  for delete to authenticated using (user_id = auth.uid());

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

-- ---------- realtime (partner sees taps within seconds) ----------

alter publication supabase_realtime add table public.babies, public.nights, public.events;
