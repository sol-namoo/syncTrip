"use client";

import { useMutation } from "@tanstack/react-query";
import { moveTripItem } from "@/features/workspace/lib/mutations";

export function useMoveTripItemMutation() {
  return useMutation({
    mutationFn: moveTripItem,
  });
}
