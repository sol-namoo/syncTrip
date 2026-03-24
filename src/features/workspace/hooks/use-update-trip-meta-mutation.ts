import { useMutation } from "@tanstack/react-query";
import { updateTripMeta } from "@/features/workspace/lib/mutations";

export function useUpdateTripMetaMutation() {
  return useMutation({
    mutationFn: updateTripMeta,
  });
}
