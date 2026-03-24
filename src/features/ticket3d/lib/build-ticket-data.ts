import dayjs from "dayjs";
import type { ReadonlyItinerarySnapshot, TicketDaySummary, TicketRenderData } from "@/types/ticket";
import type { TripDestination } from "@/types/trip";
import type { WorkspaceActor, WorkspaceSnapshot } from "@/types/workspace";

type BuildTicketDataOptions = {
  snapshot: WorkspaceSnapshot;
  actor: WorkspaceActor | null;
  message?: string | null;
  shareCode?: string;
  issuedAt?: string;
};

function deriveDestinationCode(label: string | null): string {
  if (!label) {
    return "TRP";
  }

  const latinOnly = label.toUpperCase().replace(/[^A-Z]/g, "");

  if (latinOnly.length >= 3) {
    return latinOnly.slice(0, 3);
  }

  const compact = label.replace(/\s+/g, "");

  if (compact.length >= 3) {
    return compact.slice(0, 3).toUpperCase();
  }

  return "TRP";
}

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

function buildRouteDestinations(snapshot: WorkspaceSnapshot): TripDestination[] {
  if (snapshot.trip.destinations.length > 0) {
    return snapshot.trip.destinations;
  }

  if (snapshot.trip.destination) {
    const [city = snapshot.trip.destination, country = ""] = snapshot.trip.destination
      .split(",")
      .map((segment) => segment.trim());

    return [[city, country]];
  }

  return [];
}

function formatDestinationLabel(destinations: TripDestination[]): string {
  if (destinations.length === 0) {
    return "목적지 미정";
  }

  if (destinations.length === 1) {
    return destinations
      .map(([city, country]) => [city, country].filter(Boolean).join(", "))
      .join("");
  }

  if (destinations.length <= 3) {
    return destinations.map(([city]) => city).filter(Boolean).join(" · ");
  }

  return `${destinations[0]?.[0] ?? "목적지"} 외 ${destinations.length - 1}곳`;
}

function deriveStampLabel(
  destinations: TripDestination[],
  destinationCode: string
): string {
  const representativeCountry = destinations[0]?.[1]?.trim();

  if (representativeCountry) {
    return representativeCountry;
  }

  return destinationCode;
}

export function buildTicketRenderData({
  snapshot,
  actor,
  message,
  shareCode,
  issuedAt,
}: BuildTicketDataOptions): TicketRenderData {
  const coverImageUrl =
    snapshot.cards.find((card) => card.imageUrl)?.imageUrl ?? null;
  const destinations = buildRouteDestinations(snapshot);
  const destinationLabel = formatDestinationLabel(destinations);
  const routeStops = destinations.map(([city]) => city).filter(Boolean);
  const destinationCode = deriveDestinationCode(
    routeStops[routeStops.length - 1] ?? destinationLabel
  );

  return {
    shareCode,
    tripId: snapshot.trip.id,
    title: snapshot.trip.title,
    destinationLabel,
    destinationCode,
    stampLabel: deriveStampLabel(destinations, destinationCode),
    routeStops,
    coverImageUrl,
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
