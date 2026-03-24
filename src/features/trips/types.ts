import type { Database } from "@/types/database";
import type { TripDestination, TripMemberRole } from "@/types/trip";

export type TripRow = Database["public"]["Tables"]["trips"]["Row"];
export type TripsListResult =
  Database["public"]["Functions"]["get_my_trips_with_member_count"]["Returns"][number];

export type TripListItem = {
  id: string;
  title: string;
  destination: string | null;
  destinations: TripDestination[];
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  role: TripMemberRole;
};

export type CreateTripInput = {
  title: string;
  destination: string;
  destinations: TripDestination[];
  startDate: string;
  endDate: string;
};
