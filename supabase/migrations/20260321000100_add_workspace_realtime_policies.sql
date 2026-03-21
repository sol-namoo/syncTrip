alter table public.trip_items replica identity full;

drop policy if exists "workspace members can receive realtime messages"
on realtime.messages;

create policy "workspace members can receive realtime messages"
on realtime.messages
for select
to authenticated
using (
  realtime.topic() = 'workspace:demo'
  or exists (
    select 1
    from public.trip_members tm
    where tm.user_id = auth.uid()
      and ('workspace:' || tm.trip_id::text) = realtime.topic()
  )
);

drop policy if exists "workspace members can send realtime messages"
on realtime.messages;

create policy "workspace members can send realtime messages"
on realtime.messages
for insert
to authenticated
with check (
  realtime.topic() = 'workspace:demo'
  or exists (
    select 1
    from public.trip_members tm
    where tm.user_id = auth.uid()
      and ('workspace:' || tm.trip_id::text) = realtime.topic()
  )
);
