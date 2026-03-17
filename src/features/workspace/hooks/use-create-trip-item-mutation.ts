"use client";

import { useMutation } from "@tanstack/react-query";
import { createTripItem } from "@/features/workspace/lib/mutations";

export function useCreateTripItemMutation() {
  return useMutation({
    mutationFn: createTripItem,
  });
}
