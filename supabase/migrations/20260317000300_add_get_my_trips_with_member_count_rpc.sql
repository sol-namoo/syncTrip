create or replace function public.get_my_trips_with_member_count()
returns table (
  id uuid,
  title text,
  destination text,
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
