"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlaceSearchPanel } from "@/features/workspace/components/place-search-panel";
import { Search } from "lucide-react";
import { useMemo } from "react";
import { MapCanvas } from "@/features/map/components/map-canvas";
import { useWorkspaceUiStore } from "@/store/workspace-ui-store";
import type { BoardColumn, TripPlaceCard, WorkspaceCapabilities } from "@/types/workspace";

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
  tripId,
  capabilities,
}: {
  columns: BoardColumn[];
  cards: TripPlaceCard[];
  tripId: string;
  capabilities: WorkspaceCapabilities;
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
    <section className="min-h-[320px] border-b border-gray-200 bg-white md:min-h-[380px] xl:min-h-0 xl:border-b-0 xl:border-r">
      <div className="flex h-full min-h-[320px] flex-col md:min-h-[380px] xl:min-h-0">
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

        <div className="relative min-h-[220px] flex-1 overflow-hidden bg-[#f8fafc] md:min-h-[260px] xl:min-h-0">
          <MapCanvas markers={markers} onSelectMarker={setSelectedCardId} />
          <div className="absolute inset-x-0 top-4 z-10 flex justify-center px-4">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-white/96 px-4 py-2 text-sm font-medium text-gray-900 shadow-lg ring-1 ring-black/5 backdrop-blur transition-colors hover:bg-white"
                >
                  <Search className="size-4" />
                  장소 검색하기
                </button>
              </DialogTrigger>
              <DialogContent className="flex max-h-[88vh] w-[min(96vw,96rem)] max-w-[min(96vw,96rem)] flex-col overflow-hidden p-0 gap-0">
                <DialogHeader className="border-b border-gray-200 px-6 py-5">
                  <DialogTitle>장소 검색</DialogTitle>
                  <DialogDescription>
                    검색 결과를 장소 바구니에 담거나 원하는 Day에 바로 추가할 수 있습니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <PlaceSearchPanel
                    tripId={tripId}
                    dayColumns={dayColumns}
                    capabilities={capabilities}
                    modalLayout
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
