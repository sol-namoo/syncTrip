import { createClient } from "@/lib/supabase/client";
import type { TripShareSettingsRow } from "@/types/ticket";

export async function getTripShareSettings(
  tripId: string
): Promise<TripShareSettingsRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trip_share_settings")
    .select("*")
    .eq("trip_id", tripId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
