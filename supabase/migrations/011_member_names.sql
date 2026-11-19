-- Family members' names ("Levi", "Mom", "Grandma"), so the app can show who is
-- on duty and hand off to a named person when a family has more than two phones.
-- Each person sets only their own name, through set_my_name().
alter table public.family_members
  add column if not exists display_name text check (display_name is null or char_length(display_name) <= 30);

create or replace function public.set_my_name(n text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  update public.family_members
     set display_name = nullif(left(trim(n), 30), '')
   where user_id = auth.uid();
end;
$$;

revoke execute on function public.set_my_name(text) from public, anon;
grant execute on function public.set_my_name(text) to authenticated;
