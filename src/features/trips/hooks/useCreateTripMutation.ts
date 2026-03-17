import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTrip } from "@/features/trips/lib/mutations"

export function useCreateTripMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTrip,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trips"] })
    },
  })
}
