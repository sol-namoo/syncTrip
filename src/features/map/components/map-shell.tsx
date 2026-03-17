"use client";

import { useMemo } from "react";
import { MapCanvas } from "@/features/map/components/map-canvas";
import { useWorkspaceUiStore } from "@/store/workspace-ui-store";
import type { BoardColumn, TripPlaceCard } from "@/types/workspace";

const DAY_COLORS = ["#3b82f6", "#f87171", "#22c55e", "#a855f7"];

function getMarkerColor(columns: BoardColumn[], card: TripPlaceCard) {
  if (!card.tripDayId) {
    return "#94a3b8";
  }

  const dayIndex = columns.findIndex((column) => column.tripDayId === card.tripDayId);

  return DAY_COLORS[(dayIndex >= 0 ? dayIndex : 0) % DAY_COLORS.length];
}

export function MapShell({
  columns,
  cards,
}: {
  columns: BoardColumn[];
  cards: TripPlaceCard[];
}) {
  const selectedCardId = useWorkspaceUiStore((state) => state.selectedCardId);
  const setSelectedCardId = useWorkspaceUiStore((state) => state.setSelectedCardId);

  const dayColumns = columns.filter((column) => column.tripDayId !== null);
  const markers = useMemo(
    () =>
      cards.map((card) => ({
        id: card.id,
        name: card.name,
        lat: card.lat,
        lng: card.lng,
        color: getMarkerColor(dayColumns, card),
        isSelected: selectedCardId === card.id,
      })),
    [cards, dayColumns, selectedCardId]
  );

  return (
    <section className="border-b border-gray-200 bg-white xl:border-b-0 xl:border-r">
      <div className="flex h-full flex-col xl:min-h-0">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900">지도 뷰</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {dayColumns.map((column, index) => (
                <span key={column.id} className="inline-flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: DAY_COLORS[index % DAY_COLORS.length] }}
                  />
                  {column.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden bg-[#f8fafc] xl:min-h-0">
          <MapCanvas markers={markers} onSelectMarker={setSelectedCardId} />
          {markers.length === 0 ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-10 mx-auto flex max-w-sm flex-col items-center rounded-2xl bg-white/90 px-6 py-5 text-center shadow-sm backdrop-blur">
              <p className="text-base font-semibold text-gray-900">
                지도에 표시할 장소가 없습니다
              </p>
              <p className="mt-2 text-sm text-gray-500">
                장소를 추가하면 워크스페이스 지도에 바로 반영됩니다.
              </p>
            </div>
          ) : null}
        </div>

        <div className="border-t border-gray-200 px-5 py-4 text-sm text-gray-500">
          총 {cards.length}개 장소 · 선택된 장소 {selectedCardId ? 1 : 0}개
        </div>
      </div>
    </section>
  );
}
