import { createClient } from "@/lib/supabase/client";
import type { TripListItem, TripMembershipResult } from "@/features/trips/types";

function toTripListItem(item: TripMembershipResult): TripListItem | null {
  const trip = item.trips;

  if (!trip) {
    return null;
  }

  return {
    id: trip.id,
    title: trip.title,
    destination: trip.destination,
    startDate: trip.start_date,
    endDate: trip.end_date,
    createdAt: trip.created_at,
    role: item.role,
  };
}

export async function getMyTrips(): Promise<TripListItem[]> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("trip_members")
    .select(
      `
        role,
        trips!inner (
          id,
          title,
          destination,
          start_date,
          end_date,
          created_at
        )
      `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false, referencedTable: "trips" })
    .returns<TripMembershipResult[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((item) => toTripListItem(item))
    .filter((item): item is TripListItem => item !== null);
}
