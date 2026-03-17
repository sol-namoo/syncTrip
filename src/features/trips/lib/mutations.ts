import { createClient } from "@/lib/supabase/client"
import type { CreateTripInput, TripRow } from "@/features/trips/types"

export async function createTrip(input: CreateTripInput): Promise<TripRow> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("create_trip_with_owner", {
    p_title: input.title,
    p_start_date: input.startDate,
    p_end_date: input.endDate,
    p_destination: input.destination.trim() || null,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
