import type { Database } from "@/types/database";
import type { TripMemberRole } from "@/types/trip";

export type TripItemRow = Database["public"]["Tables"]["trip_items"]["Row"];
export type TripDayRow = Database["public"]["Tables"]["trip_days"]["Row"];

export type BoardColumnId = "bucket" | `day-${string}`;

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

export type WorkspaceRole = "demo" | "owner" | "editor";

export type WorkspaceCapabilities = {
  canPersist: boolean;
  canInvite: boolean;
  canExport: boolean;
  canDeleteTrip: boolean;
  // Trip title/date/destination and similar workspace-level settings.
  canManageTrip: boolean;
  canEditItems: boolean;
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
  tripDayId: string | null;
  orderIndex: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardColumn = {
  id: BoardColumnId;
  title: string;
  date: string | null;
  dateLabel: string | null;
  tripDayId: string | null;
  position: number | null;
  cardIds: string[];
};

export type BoardCardEntity = TripPlaceCard;

export type BoardColumnEntity = BoardColumn;

export type SaveIndicatorState = "idle" | "saving" | "saved" | "error";

export type PresenceUserStatus = "online" | "away" | "offline" | "editing";

export type PresenceUser = {
  userId: string;
  role: WorkspaceRole;
  status: PresenceUserStatus;
  displayName: string;
  avatarUrl?: string | null;
};

export type RemoteCursor = {
  userId: string;
  x: number;
  y: number;
  updatedAt: number;
};

export type EditingPresenceMap = Record<string, string>;

export type MoveTripItemInput = {
  tripId: string;
  itemId: string;
  destinationTripDayId: string | null;
  sourceItemIds: string[];
  destinationItemIds: string[];
};

export type WorkspaceActor = {
  role: WorkspaceRole;
  capabilities: WorkspaceCapabilities;
  user: {
    id?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;
};

export type WorkspaceSnapshot = {
  trip: WorkspaceTrip;
  members: WorkspaceMember[];
  cards: TripPlaceCard[];
  columns: BoardColumn[];
};
