"use client";

import { useMutation } from "@tanstack/react-query";
import { updateTripItemNote } from "@/features/workspace/lib/mutations";

export function useUpdateTripItemNoteMutation() {
  return useMutation({
    mutationFn: updateTripItemNote,
  });
}
