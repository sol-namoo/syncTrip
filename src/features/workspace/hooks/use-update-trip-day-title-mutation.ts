"use client";

import { useMutation } from "@tanstack/react-query";
import { updateTripDayTitle } from "@/features/workspace/lib/mutations";

export function useUpdateTripDayTitleMutation() {
  return useMutation({
    mutationFn: updateTripDayTitle,
  });
}
