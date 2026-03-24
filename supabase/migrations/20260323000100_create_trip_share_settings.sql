create table public.trip_share_settings (
  trip_id uuid primary key references public.trips(id) on delete cascade,
  share_code text not null unique,
  message text not null default '',
  og_image_url text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint trip_share_settings_share_code_length_check check (char_length(share_code) between 8 and 32)
);

create index trip_share_settings_share_code_idx
on public.trip_share_settings (share_code);

alter table public.trip_share_settings enable row level security;

create policy "Trip members can view trip share settings"
on public.trip_share_settings
for select
using (
  exists (
    select 1
    from public.trip_members
    where trip_members.trip_id = trip_share_settings.trip_id
      and trip_members.user_id = auth.uid()
  )
);

create policy "Trip members can create trip share settings"
on public.trip_share_settings
for insert
with check (
  updated_by = auth.uid()
  and exists (
    select 1
    from public.trip_members
    where trip_members.trip_id = trip_share_settings.trip_id
      and trip_members.user_id = auth.uid()
  )
);

create policy "Trip members can update trip share settings"
on public.trip_share_settings
for update
using (
  exists (
    select 1
    from public.trip_members
    where trip_members.trip_id = trip_share_settings.trip_id
      and trip_members.user_id = auth.uid()
  )
)
with check (
  updated_by = auth.uid()
  and exists (
    select 1
    from public.trip_members
    where trip_members.trip_id = trip_share_settings.trip_id
      and trip_members.user_id = auth.uid()
  )
);

create policy "Trip members can delete trip share settings"
on public.trip_share_settings
for delete
using (
  exists (
    select 1
    from public.trip_members
    where trip_members.trip_id = trip_share_settings.trip_id
      and trip_members.user_id = auth.uid()
  )
);

create trigger set_trip_share_settings_updated_at
before update on public.trip_share_settings
for each row
execute function public.set_current_timestamp_updated_at();
