import type { Database } from "@/types/database";
import type { TripMemberRole } from "@/types/trip";

export type TripItemRow = Database["public"]["Tables"]["trip_items"]["Row"];

export type BoardColumnId = "bucket" | `day-${number}`;

export type WorkspaceTrip = {
  id: string;
  title: string;
  destination: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceMember = {
  userId: string;
  role: TripMemberRole;
};

export type TripPlaceCard = {
  id: string;
  tripId: string;
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl: string | null;
  note: string;
  listType: TripItemRow["list_type"];
  dayIndex: number | null;
  orderIndex: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardColumn = {
  id: BoardColumnId;
  title: string;
  dateLabel: string | null;
  dayIndex: number | null;
  cardIds: string[];
};

export type WorkspaceSnapshot = {
  trip: WorkspaceTrip;
  members: WorkspaceMember[];
  cards: TripPlaceCard[];
  columns: BoardColumn[];
};
