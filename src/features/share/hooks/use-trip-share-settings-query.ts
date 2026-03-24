"use client";

import { useQuery } from "@tanstack/react-query";
import { getTripShareSettings } from "@/features/share/lib/queries";

export function useTripShareSettingsQuery(tripId: string, enabled = true) {
  return useQuery({
    queryKey: ["trip-share-settings", tripId],
    queryFn: () => getTripShareSettings(tripId),
    enabled,
  });
}
