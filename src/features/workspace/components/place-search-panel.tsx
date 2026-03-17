"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import dayjs from "dayjs";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { useGooglePlaceSearchAdapter } from "@/features/map/hooks/use-google-place-search-adapter";
import type {
  PlaceDetailsResult,
  PlaceSearchResult,
} from "@/features/map/lib/place-search-adapter";
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
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={adapter.isReady ? "장소 검색..." : "Places 로딩 중..."}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-11 pr-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500"
          disabled={!adapter.isReady}
        />
      </div>

      <div
        className={
          modalLayout
            ? "mt-4 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white"
            : "absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
        }
      >
        {query.trim() ? (
          isSearching ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-500">
              <Loader2 className="size-4 animate-spin" />
              검색 중...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className={modalLayout ? "h-full overflow-y-auto" : "max-h-96 overflow-y-auto"}>
              {results.map((result) => (
                <div
                  key={result.placeId}
                  className="border-b border-gray-100 px-4 py-3 last:border-b-0"
                >
                  <p className="font-medium text-gray-900">{result.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{result.subtitle}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleInsert(result, null)}
                      className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                    >
                      바구니에 추가
                    </button>
                    <select
                      value={selectedDayIdsByPlaceId[result.placeId] ?? defaultDayId}
                      onChange={(event) =>
                        setSelectedDayIdsByPlaceId((previous) => ({
                          ...previous,
                          [result.placeId]: event.target.value,
                        }))
                      }
                      className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700"
                    >
                      {dayColumns.map((column) => (
                        <option key={column.id} value={column.tripDayId ?? ""}>
                          {column.title}
                          {column.date ? ` (${dayjs(column.date).format("M/D")})` : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const targetTripDayId =
                          selectedDayIdsByPlaceId[result.placeId] ?? defaultDayId;
                        handleInsert(result, targetTripDayId || null);
                      }}
                      disabled={!(selectedDayIdsByPlaceId[result.placeId] ?? defaultDayId)}
                      className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Day에 추가
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-sm text-gray-400">
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
      <div className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400">
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
