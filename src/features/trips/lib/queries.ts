import { createClient } from "@/lib/supabase/client";
import type { TripListItem, TripsListResult } from "@/features/trips/types";

function toTripListItem(item: TripsListResult): TripListItem {
  return {
    id: item.id,
    title: item.title,
    destination: item.destination,
    startDate: item.start_date,
    endDate: item.end_date,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    memberCount: item.member_count,
    role: item.role,
  };
}

export async function getMyTrips(): Promise<TripListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .rpc("get_my_trips_with_member_count")
    .overrideTypes<TripsListResult[], { merge: false }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => toTripListItem(item));
}
