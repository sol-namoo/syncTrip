alter table public.trips
add column updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

update public.trips
set updated_at = created_at
where updated_at is null;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger set_trips_updated_at
before update on public.trips
for each row
execute function public.set_current_timestamp_updated_at();

create or replace function public.touch_trip_updated_at(p_trip_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.trips
  set updated_at = timezone('utc'::text, now())
  where id = p_trip_id;
end;
$$;

grant execute on function public.touch_trip_updated_at(uuid) to authenticated;
