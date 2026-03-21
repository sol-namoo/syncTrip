import { createClient } from "@/lib/supabase/client";
import type {
  MoveTripItemInput,
  TripItemRow,
  TripPlaceCard,
} from "@/types/workspace";
import type { PlaceDetailsResult } from "@/features/map/lib/place-search-adapter";

export async function moveTripItem(input: MoveTripItemInput): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("move_trip_item", {
    p_trip_id: input.tripId,
    p_item_id: input.itemId,
    p_destination_trip_day_id: input.destinationTripDayId,
    p_source_item_ids: input.sourceItemIds,
    p_destination_item_ids: input.destinationItemIds,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function createTripItem(input: {
  tripId: string;
  targetTripDayId: string | null;
  orderIndex: number;
  place: PlaceDetailsResult;
}): Promise<TripPlaceCard> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const listType: TripItemRow["list_type"] = input.targetTripDayId ? "day" : "bucket";
  const { data, error } = await supabase
    .from("trip_items")
    .insert({
      trip_id: input.tripId,
      place_id: input.place.placeId,
      name: input.place.name,
      address: input.place.address,
      lat: input.place.lat,
      lng: input.place.lng,
      image_url: input.place.imageUrl,
      note: "",
      list_type: listType,
      trip_day_id: input.targetTripDayId,
      order_index: input.orderIndex,
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create trip item.");
  }

  return {
    id: data.id,
    tripId: data.trip_id,
    placeId: data.place_id,
    name: data.name,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    imageUrl: data.image_url,
    note: data.note,
    listType: data.list_type,
    tripDayId: data.trip_day_id,
    orderIndex: data.order_index,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateTripItemNote(input: {
  itemId: string;
  note: string;
}): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("trip_items")
    .update({
      note: input.note,
    })
    .eq("id", input.itemId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteTripItem(input: { itemId: string }): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("trip_items").delete().eq("id", input.itemId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateTripDayTitle(input: {
  dayId: string;
  title: string | null;
}): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("trip_days")
    .update({
      title: input.title,
    })
    .eq("id", input.dayId);

  if (error) {
    throw new Error(error.message);
  }
}
