"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { Loader2, MapPin, Search, Star } from "lucide-react";
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
}: {
  tripId: string;
  dayColumns: BoardColumnEntity[];
  capabilities: WorkspaceCapabilities;
}) {
  const adapter = useGooglePlaceSearchAdapter();
  const mutation = useCreateTripItemMutation();
  const insertCardIntoColumn = useWorkspaceBoardStore((state) => state.insertCardIntoColumn);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    if (results.length === 0) {
      setSelectedPlaceId(null);
      return;
    }

    if (!selectedPlaceId || !results.some((result) => result.placeId === selectedPlaceId)) {
      setSelectedPlaceId(results[0]?.placeId ?? null);
    }
  }, [results, selectedPlaceId]);

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
    } catch {
      toast.error("장소 추가에 실패했습니다.");
    }
  }

  const selectedResult =
    results.find((result) => result.placeId === selectedPlaceId) ?? null;
  return (
    <div className="w-full rounded-[20px] border border-border-card-token bg-card-surface p-3 shadow-[0_12px_24px_rgba(15,23,42,0.10)]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-ink-muted)]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={adapter.isReady ? "장소 검색..." : "Places 로딩 중..."}
          className="w-full rounded-lg border border-border-card-token bg-card-surface py-2.5 pl-11 pr-3 text-sm text-[color:var(--color-ink)] outline-none transition-colors placeholder:text-[color:var(--color-ink-muted)]"
          disabled={!adapter.isReady}
        />
      </div>

      {query.trim() ? (
        <div className="mt-2 overflow-hidden rounded-lg border border-border-card-token bg-card-surface">
          {isSearching ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-[color:var(--color-ink-muted)]">
              <Loader2 className="size-4 animate-spin" />
              검색 중...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-[color:var(--color-ink-muted)]">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.placeId}
                  type="button"
                  onClick={() => setSelectedPlaceId(result.placeId)}
                  className={
                    selectedPlaceId === result.placeId
                      ? "flex w-full items-start gap-3 border-b border-border-card-token/70 bg-surface-muted-token px-3 py-3 text-left last:border-b-0"
                      : "flex w-full items-start gap-3 border-b border-border-card-token/70 px-3 py-3 text-left transition-colors hover:bg-surface-muted-token/70 last:border-b-0"
                  }
                >
                  <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-[color:var(--surface-muted)]">
                    {result.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={result.imageUrl}
                        alt={result.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] text-[color:var(--color-primary)]">
                        <MapPin className="size-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 self-center">
                    <p className="font-medium text-[color:var(--color-ink)]">{result.title}</p>
                    <p className="mt-1 text-xs text-[color:var(--color-ink-muted)]">{result.subtitle}</p>
                    {result.rating ? (
                      <div className="mt-1 flex items-center gap-1 text-xs text-[color:var(--color-ink-muted)]">
                        <Star className="size-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                        <span className="font-medium text-[color:var(--color-ink)]">
                          {result.rating.toFixed(1)}
                        </span>
                        {result.ratingCount ? (
                          <span>({result.ratingCount.toLocaleString()})</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {selectedResult ? (
        <div className="mt-2 rounded-lg border border-border-card-token bg-surface-muted-token px-3 py-3">
          <p className="text-sm font-medium text-[color:var(--color-ink)]">
            선택한 장소를 다음 날짜에 추가
          </p>
          <p className="mt-1 text-xs text-[color:var(--color-ink-muted)]">
            {selectedResult.title}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleInsert(selectedResult, null)}
              className="rounded-xl border-[color:var(--color-border-card)] bg-[color:var(--color-bg-card)] text-[color:var(--color-ink)] hover:bg-[color:var(--surface-muted)]"
            >
              장소바구니
            </Button>
            {dayColumns.map((column) => {
              const tokens = getDayTokens(column.position ?? 1);
              return (
                <Button
                  key={column.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleInsert(selectedResult, column.tripDayId ?? null)}
                  className="rounded-xl border-[color:var(--color-border-card)] bg-[color:var(--color-bg-card)] text-[color:var(--color-ink)] hover:bg-[color:var(--surface-muted)]"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: tokens.dot }}
                  />
                  {column.title}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PlaceSearchPanel(props: {
  tripId: string;
  dayColumns: BoardColumnEntity[];
  capabilities: WorkspaceCapabilities;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full rounded-lg border border-border-card-token bg-card-surface px-3 py-2 text-sm text-[color:var(--color-ink-muted)]">
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
