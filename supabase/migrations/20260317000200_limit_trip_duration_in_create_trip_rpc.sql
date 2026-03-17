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

  if p_end_date < p_start_date then
    raise exception 'End date cannot be before start date';
  end if;

  if (p_end_date - p_start_date) > 20 then
    raise exception 'Trip duration cannot exceed 21 days';
  end if;

  insert into public.trips (
    title,
    start_date,
    end_date,
    destination,
    last_updated_by
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
