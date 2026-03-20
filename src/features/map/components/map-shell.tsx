"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { buildRouteSegments, getDayColor } from "@/features/map/lib/build-route-segments";
import { PlaceSearchPanel } from "@/features/workspace/components/place-search-panel";
import { Flower2, Search } from "lucide-react";
import { useMemo } from "react";
import { MapCanvas } from "@/features/map/components/map-canvas";
import { useWorkspaceUiStore } from "@/store/workspace-ui-store";
import type { BoardColumn, TripPlaceCard, WorkspaceCapabilities } from "@/types/workspace";

function getMarkerColor(columns: BoardColumn[], card: TripPlaceCard) {
  if (!card.tripDayId) {
    return "#94A3B8";
  }

  const dayIndex = columns.findIndex((column) => column.tripDayId === card.tripDayId);

  return getDayColor(dayIndex >= 0 ? dayIndex : 0);
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
  const segments = useMemo(() => buildRouteSegments(columns, cards), [columns, cards]);
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
    <section className="min-h-80 border-b border-[color:var(--color-border-card)] bg-[color:var(--color-bg-page)] md:min-h-96 xl:min-h-0 xl:border-b-0 xl:border-r">
      <div className="flex h-full min-h-80 flex-col md:min-h-96 xl:min-h-0">
        <div className="relative min-h-56 flex-1 overflow-hidden bg-[color:var(--color-bg-card)] md:min-h-64 xl:min-h-0">
          <MapCanvas
            markers={markers}
            segments={segments}
            onSelectMarker={setSelectedCardId}
          />
          <div className="absolute inset-x-0 top-4 z-10 flex justify-center px-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-[color:var(--color-border-card)] bg-[color:var(--color-bg-card)] px-4 py-2 shadow-lg"
                >
                  <Search className="size-4" />
                  장소 검색하기
                </Button>
              </DialogTrigger>
              <DialogContent className="flex max-h-[88vh] w-[min(96vw,96rem)] max-w-[min(96vw,96rem)] flex-col overflow-hidden p-0 gap-0">
                <DialogHeader className="border-b border-[color:var(--line)] bg-[color:var(--surface)] px-6 py-5">
                  <DialogTitle>장소 검색</DialogTitle>
                  <DialogDescription>
                    검색 결과를 장소 바구니에 담거나 원하는 Day에 바로 추가할 수 있습니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto bg-[color:var(--surface)] px-6 py-5">
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
          <div className="pointer-events-none absolute inset-x-0 bottom-10 mx-auto flex max-w-sm flex-col items-center rounded-[24px] bg-[color:var(--color-bg-card)]/92 px-6 py-5 text-center shadow-sm backdrop-blur">
              <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-[color:var(--day-1)]/45 text-[color:var(--day-1-fg)]">
                <Flower2 className="size-5" />
              </div>
              <p className="text-base font-semibold text-[color:var(--foreground)]">
                지도에 표시할 장소가 없습니다
              </p>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                장소를 추가하면 워크스페이스 지도에 바로 반영됩니다.
              </p>
            </div>
          ) : null}
        </div>

        <div className="border-t border-[color:var(--line)] px-5 py-4 text-sm text-[color:var(--muted-foreground)]">
          총 {cards.length}개 장소 · 선택된 장소 {selectedCardId ? 1 : 0}개
        </div>
      </div>
    </section>
  );
}
