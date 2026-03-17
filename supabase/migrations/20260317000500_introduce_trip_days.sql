create table public.trip_days (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  date date not null,
  title text,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint trip_days_position_check check (position >= 1),
  constraint trip_days_trip_id_position_unique unique (trip_id, position),
  constraint trip_days_trip_id_date_unique unique (trip_id, date)
);

create index trip_days_trip_id_position_idx
on public.trip_days (trip_id, position);

alter publication supabase_realtime add table trip_days;

alter table public.trip_days enable row level security;

create policy "Members can view trip days" on public.trip_days
for select using (
  exists (
    select 1
    from public.trip_members
    where trip_members.trip_id = trip_days.trip_id
      and trip_members.user_id = auth.uid()
  )
);

create policy "Members can insert trip days" on public.trip_days
for insert with check (
  exists (
    select 1
    from public.trip_members
    where trip_members.trip_id = trip_days.trip_id
      and trip_members.user_id = auth.uid()
  )
);

create policy "Members can update trip days" on public.trip_days
for update using (
  exists (
    select 1
    from public.trip_members
    where trip_members.trip_id = trip_days.trip_id
      and trip_members.user_id = auth.uid()
  )
);

create policy "Members can delete trip days" on public.trip_days
for delete using (
  exists (
    select 1
    from public.trip_members
    where trip_members.trip_id = trip_days.trip_id
      and trip_members.user_id = auth.uid()
  )
);

create trigger set_trip_days_updated_at
before update on public.trip_days
for each row
execute function public.set_current_timestamp_updated_at();

create or replace function public.touch_parent_trip_from_trip_days()
returns trigger
language plpgsql
as $$
begin
  perform public.touch_trip_updated_at(coalesce(new.trip_id, old.trip_id));
  return coalesce(new, old);
end;
$$;

create trigger touch_trip_updated_at_from_trip_days
after insert or update or delete on public.trip_days
for each row
execute function public.touch_parent_trip_from_trip_days();

insert into public.trip_days (trip_id, date, position)
select
  trips.id,
  (trips.start_date + ((series.day_position - 1) * interval '1 day'))::date,
  series.day_position
from public.trips
cross join lateral generate_series(
  1,
  ((trips.end_date - trips.start_date) + 1)::integer
) as series(day_position)
on conflict (trip_id, position) do nothing;

alter table public.trip_items
add column trip_day_id uuid references public.trip_days(id) on delete set null;

update public.trip_items
set trip_day_id = trip_days.id
from public.trip_days
where trip_items.trip_id = trip_days.trip_id
  and trip_items.day_index = trip_days.position;

alter table public.trip_items
drop constraint if exists trip_items_day_index_check;

alter table public.trip_items
add constraint trip_items_trip_day_id_check check (
  (list_type = 'bucket' and trip_day_id is null)
  or
  (list_type = 'day' and trip_day_id is not null)
);

drop index if exists trip_items_trip_id_day_index_order_index_idx;

create index trip_items_trip_id_trip_day_id_order_index_idx
on public.trip_items (trip_id, trip_day_id, order_index);

alter table public.trip_items
drop column day_index;

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
