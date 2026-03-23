import type { Database } from "@/types/database";
import type { WorkspaceSnapshot } from "@/types/workspace";

export type TripShareSettingsRow = Database["public"]["Tables"]["trip_share_settings"]["Row"];

export type TicketDaySummary = {
  dayIndex: number;
  dateLabel: string | null;
  title: string | null;
  placeCount: number;
  heroPlaceName: string | null;
};

export type TicketRenderData = {
  shareCode?: string;
  tripId: string;
  title: string;
  destinationLabel: string;
  startDate: string | null;
  endDate: string | null;
  participantCount: number;
  sharedByName: string | null;
  authorMessage: string | null;
  issuedAt: string;
  summaryDays: TicketDaySummary[];
};

export type CreateTripShareSettingsInput = {
  tripId: string;
  message: string;
  shareCode: string;
  ogImageUrl?: string | null;
};

export type UpsertTripShareSettingsRow = {
  trip_id: string;
  share_code: string;
  message: string;
  og_image_url?: string | null;
  updated_by: string;
};

export type ReadonlyItinerarySnapshot = Pick<
  WorkspaceSnapshot,
  "trip" | "columns" | "cards"
>;

export type PublicTicketPageData = {
  share: TripShareSettingsRow;
  render: TicketRenderData;
  itinerary: ReadonlyItinerarySnapshot;
};
