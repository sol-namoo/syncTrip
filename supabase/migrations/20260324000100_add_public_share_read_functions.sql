create or replace function public.get_public_trip_share_settings(
  p_share_code text
)
returns table (
  trip_id uuid,
  share_code text,
  message text,
  updated_by uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  title text,
  destination text,
  destinations jsonb,
  start_date date,
  end_date date,
  member_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    s.trip_id,
    s.share_code,
    s.message,
    s.updated_by,
    s.created_at,
    s.updated_at,
    t.title,
    t.destination,
    t.destinations,
    t.start_date,
    t.end_date,
    (
      select count(*)
      from public.trip_members tm
      where tm.trip_id = t.id
    ) as member_count
  from public.trip_share_settings s
  join public.trips t
    on t.id = s.trip_id
  where s.share_code = p_share_code
  limit 1;
$$;

grant execute on function public.get_public_trip_share_settings(text) to anon, authenticated;

create or replace function public.get_public_trip_days(
  p_share_code text
)
returns table (
  id uuid,
  trip_id uuid,
  date date,
  title text,
  day_position integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language sql
security definer
set search_path = public
as $$
  select
    d.id,
    d.trip_id,
    d.date,
    d.title,
    d.position as day_position,
    d.created_at,
    d.updated_at
  from public.trip_days d
  join public.trip_share_settings s
    on s.trip_id = d.trip_id
  where s.share_code = p_share_code
  order by d.position asc;
$$;

grant execute on function public.get_public_trip_days(text) to anon, authenticated;

create or replace function public.get_public_trip_items(
  p_share_code text
)
returns table (
  id uuid,
  trip_id uuid,
  place_id text,
  name text,
  address text,
  lat double precision,
  lng double precision,
  image_url text,
  note text,
  list_type text,
  trip_day_id uuid,
  order_index integer,
  created_by uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
language sql
security definer
set search_path = public
as $$
  select
    i.id,
    i.trip_id,
    i.place_id,
    i.name,
    i.address,
    i.lat,
    i.lng,
    i.image_url,
    i.note,
    i.list_type,
    i.trip_day_id,
    i.order_index,
    i.created_by,
    i.created_at,
    i.updated_at
  from public.trip_items i
  join public.trip_share_settings s
    on s.trip_id = i.trip_id
  where s.share_code = p_share_code
  order by i.trip_day_id asc nulls first, i.order_index asc;
$$;

grant execute on function public.get_public_trip_items(text) to anon, authenticated;
