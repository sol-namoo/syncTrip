import type { Database } from "@/types/database";

export type TripRow = Database["public"]["Tables"]["trips"]["Row"];
export type TripMemberRow = Database["public"]["Tables"]["trip_members"]["Row"];
export type TripsListResult =
  Database["public"]["Functions"]["get_my_trips_with_member_count"]["Returns"][number];

export type TripListItem = {
  id: string;
  title: string;
  destination: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  role: TripMemberRow["role"];
};

export type CreateTripInput = {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
};
