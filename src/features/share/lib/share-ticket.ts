import type { CreateTripShareSettingsInput, UpsertTripShareSettingsRow } from "@/types/ticket";

const SHARE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createShareCode(length = 10): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(randomBytes, (value) => SHARE_CODE_ALPHABET[value % SHARE_CODE_ALPHABET.length]).join("");
}

export function toTripShareSettingsRow(
  input: CreateTripShareSettingsInput,
  userId: string
): UpsertTripShareSettingsRow {
  return {
    trip_id: input.tripId,
    share_code: input.shareCode,
    message: input.message,
    og_image_url: input.ogImageUrl ?? null,
    updated_by: userId,
  };
}
