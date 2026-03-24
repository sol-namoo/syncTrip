alter table public.trip_share_settings
drop column if exists og_image_url;

alter table public.trips
add column if not exists destinations jsonb;

alter table public.trips
drop constraint if exists trips_destinations_is_array_check;

alter table public.trips
add constraint trips_destinations_is_array_check
check (
  destinations is null
  or jsonb_typeof(destinations) = 'array'
);

create or replace function public.create_trip_with_owner(
  p_title text,
  p_start_date date,
  p_end_date date,
  p_destination text default null,
  p_destinations jsonb default null
)
returns public.trips
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip public.trips;
  v_user_id uuid;
  v_day_date date;
  v_position integer := 1;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_end_date < p_start_date then
    raise exception 'End date cannot be before start date';
  end if;

  if (p_end_date - p_start_date) > 20 then
    raise exception 'Trip duration cannot exceed 21 days';
  end if;

  if p_destinations is not null and jsonb_typeof(p_destinations) <> 'array' then
    raise exception 'Destinations must be a json array';
  end if;

  insert into public.trips (
    title,
    start_date,
    end_date,
    destination,
    destinations,
    last_updated_by
  )
  values (
    p_title,
    p_start_date,
    p_end_date,
    p_destination,
    p_destinations,
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

  v_day_date := p_start_date;

  while v_day_date <= p_end_date loop
    insert into public.trip_days (
      trip_id,
      date,
      position
    )
    values (
      v_trip.id,
      v_day_date,
      v_position
    );

    v_day_date := v_day_date + interval '1 day';
    v_position := v_position + 1;
  end loop;

  return v_trip;
end;
$$;

grant execute on function public.create_trip_with_owner(text, date, date, text, jsonb) to authenticated;

drop function if exists public.get_my_trips_with_member_count();

create function public.get_my_trips_with_member_count()
returns table (
  id uuid,
  title text,
  destination text,
  destinations jsonb,
  start_date date,
  end_date date,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  role text,
  member_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    t.id,
    t.title,
    t.destination,
    t.destinations,
    t.start_date,
    t.end_date,
    t.created_at,
    t.updated_at,
    tm.role,
    (
      select count(*)
      from public.trip_members tm_count
      where tm_count.trip_id = t.id
    ) as member_count
  from public.trip_members tm
  join public.trips t
    on t.id = tm.trip_id
  where tm.user_id = auth.uid()
  order by t.updated_at desc;
$$;

grant execute on function public.get_my_trips_with_member_count() to authenticated;
