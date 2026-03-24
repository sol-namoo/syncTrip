"use client";

import { useMutation } from "@tanstack/react-query";
import { upsertTripShareSettings } from "@/features/share/lib/mutations";

export function useUpsertTripShareSettingsMutation() {
  return useMutation({
    mutationFn: upsertTripShareSettings,
  });
}
