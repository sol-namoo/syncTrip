create extension if not exists pgcrypto;

create table public.trips (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  destination text,
  start_date date not null,
  end_date date not null,
  last_edited_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.trip_members (
  trip_id uuid references public.trips(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'editor',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (trip_id, user_id),
  constraint trip_members_role_check check (role in ('owner', 'editor'))
);

alter publication supabase_realtime add table public.trips;
alter publication supabase_realtime add table public.trip_members;

alter table public.trips enable row level security;
alter table public.trip_members enable row level security;

create policy "Anyone can create a trip"
on public.trips
for insert
with check (auth.role() = 'authenticated');

create policy "Members can view trips"
on public.trips
for select
using (
  exists (
    select 1
    from public.trip_members
    where trip_id = trips.id
      and user_id = auth.uid()
  )
);

create policy "Members can update trips"
on public.trips
for update
using (
  exists (
    select 1
    from public.trip_members
    where trip_id = trips.id
      and user_id = auth.uid()
  )
);

create policy "Users can view their own memberships"
on public.trip_members
for select
using (user_id = auth.uid());

create policy "Users can insert memberships"
on public.trip_members
for insert
with check (user_id = auth.uid());

create or replace function public.create_trip_with_owner(
  p_title text,
  p_start_date date,
  p_end_date date,
  p_destination text default null
)
returns public.trips
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip public.trips;
  v_user_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.trips (
    title,
    start_date,
    end_date,
    destination,
    last_edited_by
  )
  values (
    p_title,
    p_start_date,
    p_end_date,
    p_destination,
    v_user_id
  )
  returning * into v_trip;

  insert into public.trip_members (
    trip_id,
    user_id,
    role
  )
  values (
    v_trip.id,
    v_user_id,
    'owner'
  );

  return v_trip;
end;
$$;

grant execute on function public.create_trip_with_owner(text, date, date, text) to authenticated;
