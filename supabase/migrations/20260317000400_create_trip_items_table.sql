create table public.trip_items (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  place_id text not null,
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  image_url text,
  note text not null default '',
  list_type text not null default 'bucket',
  day_index integer,
  order_index integer not null default 0,
  created_by uuid references auth.users(id) on delete set null not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint trip_items_list_type_check check (list_type in ('bucket', 'day')),
  constraint trip_items_day_index_check check (
    (list_type = 'bucket' and day_index is null)
    or
    (list_type = 'day' and day_index is not null and day_index >= 1)
  ),
  constraint trip_items_order_index_check check (order_index >= 0)
);

create index trip_items_trip_id_idx
on public.trip_items (trip_id);

create index trip_items_trip_id_day_index_order_index_idx
on public.trip_items (trip_id, day_index, order_index);

alter publication supabase_realtime add table trip_items;

alter table public.trip_items enable row level security;

create policy "Members can view trip items" on public.trip_items
for select
using (
  exists (
    select 1
    from public.trip_members tm
    where tm.trip_id = trip_items.trip_id
      and tm.user_id = auth.uid()
  )
);

create policy "Members can insert trip items" on public.trip_items
for insert
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.trip_members tm
    where tm.trip_id = trip_items.trip_id
      and tm.user_id = auth.uid()
  )
);

create policy "Members can update trip items" on public.trip_items
for update
using (
  exists (
    select 1
    from public.trip_members tm
    where tm.trip_id = trip_items.trip_id
      and tm.user_id = auth.uid()
  )
);

create policy "Members can delete trip items" on public.trip_items
for delete
using (
  exists (
    select 1
    from public.trip_members tm
    where tm.trip_id = trip_items.trip_id
      and tm.user_id = auth.uid()
  )
);

create or replace function public.touch_parent_trip_from_trip_items()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip_id uuid;
begin
  v_trip_id := coalesce(new.trip_id, old.trip_id);
  perform public.touch_trip_updated_at(v_trip_id);
  return coalesce(new, old);
end;
$$;

create trigger set_trip_items_updated_at
before update on public.trip_items
for each row
execute function public.set_current_timestamp_updated_at();

create trigger touch_trip_updated_at_from_trip_items
after insert or update or delete on public.trip_items
for each row
execute function public.touch_parent_trip_from_trip_items();
