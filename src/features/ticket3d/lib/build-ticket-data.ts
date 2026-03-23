import dayjs from "dayjs";
import type { ReadonlyItinerarySnapshot, TicketDaySummary, TicketRenderData } from "@/types/ticket";
import type { WorkspaceActor, WorkspaceSnapshot } from "@/types/workspace";

type BuildTicketDataOptions = {
  snapshot: WorkspaceSnapshot;
  actor: WorkspaceActor | null;
  message?: string | null;
  shareCode?: string;
  issuedAt?: string;
};

function buildDaySummaries(snapshot: WorkspaceSnapshot): TicketDaySummary[] {
  return snapshot.columns
    .filter((column) => column.tripDayId !== null)
    .map((column) => ({
      dayIndex: column.position ?? 0,
      dateLabel: column.dateLabel,
      title: column.title || null,
      placeCount: column.cardIds.length,
      heroPlaceName:
        column.cardIds.length > 0
          ? snapshot.cards.find((card) => card.id === column.cardIds[0])?.name ?? null
          : null,
    }));
}

export function buildTicketRenderData({
  snapshot,
  actor,
  message,
  shareCode,
  issuedAt,
}: BuildTicketDataOptions): TicketRenderData {
  return {
    shareCode,
    tripId: snapshot.trip.id,
    title: snapshot.trip.title,
    destinationLabel: snapshot.trip.destination ?? "목적지 미정",
    startDate: snapshot.trip.startDate,
    endDate: snapshot.trip.endDate,
    participantCount: snapshot.members.length,
    sharedByName: actor?.user?.fullName ?? null,
    authorMessage: message ?? null,
    issuedAt: issuedAt ?? dayjs().toISOString(),
    summaryDays: buildDaySummaries(snapshot),
  };
}

export function buildReadonlyItinerarySnapshot(
  snapshot: WorkspaceSnapshot
): ReadonlyItinerarySnapshot {
  return {
    trip: snapshot.trip,
    columns: snapshot.columns,
    cards: snapshot.cards,
  };
}
