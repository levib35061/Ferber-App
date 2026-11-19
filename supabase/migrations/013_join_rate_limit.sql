-- Invite codes can't be guessed by brute force: at most 10 wrong codes per account per hour.
-- A wrong code now returns null instead of raising, so the failed attempt is recorded
-- (an exception would roll the record back).
create table if not exists public.join_attempts (
  user_id uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null default now()
);
create index if not exists join_attempts_user_at on public.join_attempts (user_id, at);
alter table public.join_attempts enable row level security; -- no policies: only security-definer functions touch it

create or replace function public.join_family(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  fid uuid;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  if (select count(*) from public.join_attempts
      where user_id = auth.uid() and at > now() - interval '1 hour') >= 10 then
    raise exception 'too many attempts';
  end if;
  select id into fid from public.families where invite_code = upper(trim(code));
  if fid is null then
    delete from public.join_attempts where user_id = auth.uid() and at < now() - interval '1 day';
    insert into public.join_attempts (user_id) values (auth.uid());
    return null;
  end if;
  insert into public.family_members (family_id, user_id) values (fid, auth.uid()) on conflict do nothing;
  return fid;
end;
$$;

revoke execute on function public.join_family(text) from public, anon;
grant execute on function public.join_family(text) to authenticated;
