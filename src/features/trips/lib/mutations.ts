import { createClient } from "@/lib/supabase/client"
import type { CreateTripInput, TripRow } from "@/features/trips/types"

export async function createTrip(input: CreateTripInput): Promise<TripRow> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("create_trip_with_owner", {
    p_title: input.title,
    p_start_date: input.startDate,
    p_end_date: input.endDate,
    p_destination: input.destination.trim() || null,
    p_destinations: input.destinations.length > 0 ? input.destinations : null,
  })

  if (
    error?.message.includes("create_trip_with_owner") &&
    error.message.includes("p_destinations")
  ) {
    const { data: legacyData, error: legacyError } = await supabase.rpc("create_trip_with_owner", {
      p_title: input.title,
      p_start_date: input.startDate,
      p_end_date: input.endDate,
      p_destination: input.destination.trim() || null,
    })

    if (legacyError) {
      throw new Error(legacyError.message)
    }

    return legacyData
  }

  if (error) {
    throw new Error(error.message)
  }

  return data
}
