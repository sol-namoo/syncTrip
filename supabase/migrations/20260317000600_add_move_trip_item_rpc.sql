create or replace function public.move_trip_item(
  p_trip_id uuid,
  p_item_id uuid,
  p_destination_trip_day_id uuid,
  p_source_item_ids uuid[],
  p_destination_item_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_item public.trip_items;
  v_source_trip_day_id uuid;
  v_is_same_list boolean;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.trip_members
    where trip_id = p_trip_id
      and user_id = v_user_id
  ) then
    raise exception 'Not authorized';
  end if;

  select *
  into v_item
  from public.trip_items
  where id = p_item_id
    and trip_id = p_trip_id;

  if not found then
    raise exception 'Trip item not found';
  end if;

  v_source_trip_day_id := v_item.trip_day_id;
  v_is_same_list := v_source_trip_day_id is not distinct from p_destination_trip_day_id;

  update public.trip_items
  set
    trip_day_id = p_destination_trip_day_id,
    list_type = case
      when p_destination_trip_day_id is null then 'bucket'
      else 'day'
    end
  where id = p_item_id;

  update public.trip_items
  set order_index = ordered.new_order_index
  from (
    select
      item_id,
      new_order_index
    from unnest(p_source_item_ids) with ordinality as source_items(item_id, new_order_index)
  ) as ordered
  where public.trip_items.id = ordered.item_id
    and public.trip_items.trip_id = p_trip_id;

  if not v_is_same_list then
    update public.trip_items
    set order_index = ordered.new_order_index
    from (
      select
        item_id,
        new_order_index
      from unnest(p_destination_item_ids) with ordinality as destination_items(item_id, new_order_index)
    ) as ordered
    where public.trip_items.id = ordered.item_id
      and public.trip_items.trip_id = p_trip_id;
  end if;

  update public.trips
  set last_updated_by = v_user_id
  where id = p_trip_id;
end;
$$;

grant execute on function public.move_trip_item(uuid, uuid, uuid, uuid[], uuid[]) to authenticated;
