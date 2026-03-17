import { createClient } from "@/lib/supabase/client";
import type { MoveTripItemInput } from "@/types/workspace";

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
