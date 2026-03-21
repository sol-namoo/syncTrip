"use client";

import { useMutation } from "@tanstack/react-query";
import { deleteTripItem } from "@/features/workspace/lib/mutations";

export function useDeleteTripItemMutation() {
  return useMutation({
    mutationFn: deleteTripItem,
  });
}
