import type { Database } from "@/types/database";

export type TripRow = Database["public"]["Tables"]["trips"]["Row"];
export type TripMemberRow = Database["public"]["Tables"]["trip_members"]["Row"];

export type TripPreview = Pick<
  TripRow,
  "id" | "title" | "destination" | "start_date" | "end_date" | "created_at"
>;

export type TripMembershipResult = {
  role: TripMemberRow["role"];
  trips: TripPreview | null;
};

export type TripListItem = {
  id: string;
  title: string;
  destination: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  role: TripMemberRow["role"];
};
