import { useQuery } from "@tanstack/react-query";
import { getMyTrips } from "@/features/trips/lib/queries";

export function useTripsQuery() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: getMyTrips,
    staleTime: 1000 * 60 * 5,
  });
}
