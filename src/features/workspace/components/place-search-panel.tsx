"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import dayjs from "dayjs";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useGooglePlaceSearchAdapter } from "@/features/map/hooks/use-google-place-search-adapter";
import type {
  PlaceDetailsResult,
  PlaceSearchResult,
} from "@/features/map/lib/place-search-adapter";
import { getDayTokens } from "@/features/workspace/lib/day-tokens";
import { useCreateTripItemMutation } from "@/features/workspace/hooks/use-create-trip-item-mutation";
import { useWorkspaceBoardStore } from "@/store/workspace-board-store";
import type { BoardColumnEntity, WorkspaceCapabilities } from "@/types/workspace";

function PlaceSearchPanelInner({
  tripId,
  dayColumns,
  capabilities,
  modalLayout = false,
}: {
  tripId: string;
  dayColumns: BoardColumnEntity[];
  capabilities: WorkspaceCapabilities;
  modalLayout?: boolean;
}) {
  const adapter = useGooglePlaceSearchAdapter();
  const mutation = useCreateTripItemMutation();
  const insertCardIntoColumn = useWorkspaceBoardStore((state) => state.insertCardIntoColumn);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDayIdsByPlaceId, setSelectedDayIdsByPlaceId] = useState<
    Record<string, string>
  >(
    {}
  );
  const defaultDayId = dayColumns[0]?.tripDayId ?? "";

  useEffect(() => {
    setSelectedDayIdsByPlaceId((previous) => {
      const nextEntries = results.map((result) => {
        const previousValue = previous[result.placeId];
        const nextValue =
          previousValue &&
          dayColumns.some((column) => column.tripDayId === previousValue)
            ? previousValue
            : defaultDayId;

        return [result.placeId, nextValue] as const;
      });

      return Object.fromEntries(nextEntries);
    });
  }, [results, dayColumns, defaultDayId]);

  useEffect(() => {
    const normalized = query.trim();

    if (!normalized) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    if (!adapter.isReady) {
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const nextResults = await adapter.searchPlaces(normalized);
        setResults(nextResults);
      } catch {
        setResults([]);
        toast.error("장소 검색에 실패했습니다.");
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [adapter, query]);

  async function handleInsert(
    result: PlaceSearchResult,
    targetTripDayId: string | null
  ) {
    if (!capabilities.canEditItems || !capabilities.canPersist) {
      toast.error("현재 권한으로는 장소를 추가할 수 없습니다.");
      return;
    }

    try {
      const details: PlaceDetailsResult = await adapter.getPlaceDetails(result.placeId);
      const columnId = targetTripDayId ? (`day-${targetTripDayId}` as const) : "bucket";
      const column = useWorkspaceBoardStore.getState().columnsById[columnId];

      if (!column) {
        throw new Error("Target column not found.");
      }

      const card = await mutation.mutateAsync({
        tripId,
        targetTripDayId,
        orderIndex: column.cardIds.length,
        place: details,
      });

      insertCardIntoColumn({
        columnId,
        card,
      });

      toast.success(
        targetTripDayId
          ? `${details.name}을(를) 일정에 추가했습니다.`
          : `${details.name}을(를) 장소 바구니에 추가했습니다.`
      );
      setQuery("");
      setResults([]);
    } catch {
      toast.error("장소 추가에 실패했습니다.");
    }
  }

  return (
    <div className={modalLayout ? "flex h-[62vh] flex-col" : "relative"}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-ink-muted)]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={adapter.isReady ? "장소 검색..." : "Places 로딩 중..."}
          className="w-full rounded-xl border border-[color:var(--color-border-card)] bg-[color:var(--color-bg-card)] py-2.5 pl-11 pr-3 text-sm text-[color:var(--color-ink)] outline-none transition-colors placeholder:text-[color:var(--color-ink-muted)] focus:border-[color:var(--color-primary)]"
          disabled={!adapter.isReady}
        />
      </div>

      <div
        className={
          modalLayout
            ? "mt-4 flex-1 overflow-hidden rounded-xl border border-[color:var(--color-border-card)] bg-[color:var(--color-bg-card)]"
            : "absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-xl border border-[color:var(--color-border-card)] bg-[color:var(--color-bg-card)] shadow-xl"
        }
      >
        {query.trim() ? (
          isSearching ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-[color:var(--color-ink-muted)]">
              <Loader2 className="size-4 animate-spin" />
              검색 중...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-[color:var(--color-ink-muted)]">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className={modalLayout ? "h-full overflow-y-auto" : "max-h-96 overflow-y-auto"}>
              {results.map((result) => (
                <div
                  key={result.placeId}
                  className="border-b border-[color:var(--color-border-card)]/70 px-4 py-3 last:border-b-0"
                >
                  <p className="font-medium text-[color:var(--color-ink)]">{result.title}</p>
                  <p className="mt-1 text-xs text-[color:var(--color-ink-muted)]">{result.subtitle}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInsert(result, null)}
                      className="rounded-xl"
                    >
                      바구니에 추가
                    </Button>
                    <select
                      value={selectedDayIdsByPlaceId[result.placeId] ?? defaultDayId}
                      onChange={(event) =>
                        setSelectedDayIdsByPlaceId((previous) => ({
                          ...previous,
                          [result.placeId]: event.target.value,
                        }))
                      }
                      className="rounded-md border border-[color:var(--color-border-card)] bg-[color:var(--color-bg-card)] px-2 py-1.5 text-xs text-[color:var(--color-ink)]"
                    >
                      {dayColumns.map((column) => (
                        <option key={column.id} value={column.tripDayId ?? ""}>
                          {column.title}
                          {column.date ? ` (${dayjs(column.date).format("M/D")})` : ""}
                        </option>
                      ))}
                    </select>
                    {(() => {
                      const selectedTripDayId =
                        selectedDayIdsByPlaceId[result.placeId] ?? defaultDayId;
                      const selectedColumn = dayColumns.find(
                        (column) => column.tripDayId === selectedTripDayId
                      );
                      const buttonVariant = getDayTokens(selectedColumn?.position ?? 1).buttonVariant;

                      return (
                        <Button
                          type="button"
                          variant={buttonVariant}
                          size="sm"
                          onClick={() => {
                            handleInsert(result, selectedTripDayId || null);
                          }}
                          disabled={!selectedTripDayId}
                          className="rounded-xl"
                        >
                          Day에 추가
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-sm text-[color:var(--color-ink-muted)]">
            검색어를 입력하면 장소 결과가 여기에 표시됩니다.
          </div>
        )}
      </div>
    </div>
  );
}

export function PlaceSearchPanel(props: {
  tripId: string;
  dayColumns: BoardColumnEntity[];
  capabilities: WorkspaceCapabilities;
  modalLayout?: boolean;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full rounded-lg border border-[color:var(--color-border-card)] bg-[color:var(--color-bg-card)] px-3 py-2 text-sm text-[color:var(--color-ink-muted)]">
        Google Maps API key가 없어 장소 검색을 사용할 수 없습니다.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["places"]}>
      <PlaceSearchPanelInner {...props} />
    </APIProvider>
  );
}
