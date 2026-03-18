import type { BoardColumn, TripPlaceCard } from "@/types/workspace";

const DAY_COLORS = ["#3b82f6", "#f87171", "#22c55e", "#a855f7"];

export type MapRoutePoint = {
  lat: number;
  lng: number;
};

export type MapRouteSegment = {
  id: string;
  title: string;
  color: string;
  points: MapRoutePoint[];
};

export function getDayColor(index: number) {
  return DAY_COLORS[index % DAY_COLORS.length];
}

export function buildRouteSegments(columns: BoardColumn[], cards: TripPlaceCard[]) {
  const cardsById = Object.fromEntries(cards.map((card) => [card.id, card]));

  return columns
    .filter((column) => column.tripDayId !== null)
    .map((column, index) => ({
      id: column.id,
      title: column.title,
      color: getDayColor(index),
      points: column.cardIds
        .map((cardId) => cardsById[cardId])
        .filter((card): card is TripPlaceCard => Boolean(card))
        .map((card) => ({
          lat: card.lat,
          lng: card.lng,
        })),
    }))
    .filter((segment) => segment.points.length >= 2);
}
