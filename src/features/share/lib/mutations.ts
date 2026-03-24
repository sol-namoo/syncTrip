import { createClient } from "@/lib/supabase/client";
import { createShareCode, toTripShareSettingsRow } from "@/features/share/lib/share-ticket";
import type { CreateTripShareSettingsInput, TripShareSettingsRow } from "@/types/ticket";

async function resolveAuthenticatedUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  return user.id;
}

export async function upsertTripShareSettings(input: {
  tripId: string;
  message: string;
  shareCode?: string;
}): Promise<TripShareSettingsRow> {
  const supabase = createClient();
  const userId = await resolveAuthenticatedUserId();

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const shareCode = input.shareCode ?? createShareCode();
    const row = toTripShareSettingsRow(
      {
        tripId: input.tripId,
        message: input.message,
        shareCode,
      } satisfies CreateTripShareSettingsInput,
      userId
    );

    const { data, error } = await supabase
      .from("trip_share_settings")
      .upsert(row, {
        onConflict: "trip_id",
      })
      .select()
      .single();

    if (!error && data) {
      return data;
    }

    lastError = new Error(error?.message ?? "Failed to save trip share settings.");

    if (!error?.message.toLowerCase().includes("duplicate")) {
      break;
    }
  }

  throw lastError ?? new Error("Failed to save trip share settings.");
}
