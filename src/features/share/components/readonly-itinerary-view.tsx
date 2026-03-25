"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapCanvas } from "@/features/map/components/map-canvas";
import { buildRouteSegments, getDayColor } from "@/features/map/lib/build-route-segments";
import { cn } from "@/lib/utils";
import type { PublicTicketPageData } from "@/types/ticket";

function toSoftTint(hex: string, alpha = 0.14) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => char + char)
        .join("")
    : normalized;

  const red = Number.parseInt(full.slice(0, 2), 16);
  const green = Number.parseInt(full.slice(2, 4), 16);
  const blue = Number.parseInt(full.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function ReadonlyItineraryView({ data }: { data: PublicTicketPageData }) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      data.itinerary.columns.map((column, index) => [column.id, index !== 0])
    )
  );
  const tabsListRef = useRef<HTMLDivElement | null>(null);

  const filteredColumns = useMemo(() => {
    if (activeTab === "all") {
      return data.itinerary.columns;
    }

    return data.itinerary.columns.filter((column) => column.id === activeTab);
  }, [activeTab, data.itinerary.columns]);

  const visibleCardIds = useMemo(() => {
    return new Set(filteredColumns.flatMap((column) => column.cardIds));
  }, [filteredColumns]);

  const filteredCards = useMemo(() => {
    if (activeTab === "all") {
      return data.itinerary.cards;
    }

    return data.itinerary.cards.filter((card) => visibleCardIds.has(card.id));
  }, [activeTab, data.itinerary.cards, visibleCardIds]);

  const markers = useMemo(
    () =>
      filteredCards.map((card) => ({
        id: card.id,
        name: card.name,
        lat: card.lat,
        lng: card.lng,
        color: getDayColor(
          Math.max(
            0,
            data.itinerary.columns.findIndex((column) => column.tripDayId === card.tripDayId)
          )
        ),
        isSelected: selectedCardId === card.id,
      })),
    [data.itinerary.columns, filteredCards, selectedCardId]
  );

  const segments = useMemo(
    () => buildRouteSegments(filteredColumns, filteredCards),
    [filteredCards, filteredColumns]
  );

  useEffect(() => {
    if (!tabsListRef.current) {
      return;
    }

    function updateScrollState() {
      const element = tabsListRef.current;

      if (!element) {
        return;
      }

      setCanScrollLeft(element.scrollLeft > 4);
      setCanScrollRight(
        element.scrollLeft + element.clientWidth < element.scrollWidth - 4
      );
    }

    updateScrollState();
    const element = tabsListRef.current;
    element?.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      element?.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [data.itinerary.columns.length]);

  function toggleColumn(columnId: string) {
    setCollapsedColumns((current) => ({
      ...current,
      [columnId]: !current[columnId],
    }));
  }

  function handleTabChange(nextTab: string) {
    setActiveTab(nextTab);

    if (nextTab === "all") {
      return;
    }

    const activeColumn = data.itinerary.columns.find((column) => column.id === nextTab);
    setSelectedCardId(activeColumn?.cardIds[0] ?? null);
  }

  return (
    <main className="min-h-screen bg-page">
      <div className="border-b border-border-card-token bg-card-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="mt-1 truncate text-2xl font-semibold text-foreground">
                {data.render.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4" />
                  {data.render.startDate} ~ {data.render.endDate}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4" />
                  {data.render.destinationLabel}
                </span>
              </div>
            </div>
            <Button asChild type="button" variant="outline" className="rounded-full">
              <Link href={`/share/${data.share.share_code}`}>
                <ArrowLeft className="size-4" />
                티켓으로 돌아가기
              </Link>
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="relative py-2">
              <div
                className={cn(
                  "pointer-events-none absolute inset-y-2 left-0 z-10 w-8 rounded-l-2xl transition-opacity",
                  canScrollLeft ? "opacity-100" : "opacity-0"
                )}
                style={{ boxShadow: "inset 18px 0 16px -16px rgba(15, 23, 42, 0.18)" }}
              />
              <div
                className={cn(
                  "pointer-events-none absolute inset-y-2 right-0 z-10 w-8 rounded-r-2xl transition-opacity",
                  canScrollRight ? "opacity-100" : "opacity-0"
                )}
                style={{ boxShadow: "inset -18px 0 16px -16px rgba(15, 23, 42, 0.18)" }}
              />
            <TabsList
              ref={tabsListRef}
              className="h-auto w-full justify-start gap-2 overflow-x-auto bg-transparent p-0 pb-1"
            >
              <TabsTrigger value="all" className="rounded-full border border-border-card-token bg-card-surface px-4 py-2 shadow-sm data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:font-semibold data-[state=active]:text-primary-foreground">
                전체
              </TabsTrigger>
              {data.itinerary.columns.map((column, index) => (
                <TabsTrigger
                  key={column.id}
                  value={column.id}
                  className="rounded-full border border-border-card-token bg-card-surface px-4 py-2 shadow-sm data-[state=active]:font-semibold data-[state=active]:text-foreground"
                  style={
                    activeTab === column.id
                      ? {
                          borderColor: getDayColor(index),
                          backgroundColor: toSoftTint(getDayColor(index), 0.18),
                        }
                      : undefined
                  }
                >
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: getDayColor(index) }}
                  />
                  Day {column.position ?? index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            </div>
            <TabsContent value={activeTab} className="hidden" />
          </Tabs>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 py-6 lg:h-[calc(100vh-12.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(20rem,34rem)] lg:px-8">
        <section className="order-2 min-h-0 overflow-hidden rounded-[28px] border border-border-card-token bg-card-surface shadow-sm lg:order-1">
          <div className="h-[24rem] lg:sticky lg:top-0 lg:h-full">
            <MapCanvas
              markers={markers}
              segments={segments}
              onSelectMarker={(markerId) => setSelectedCardId(markerId)}
            />
          </div>
        </section>

        <section className="order-1 min-h-0 overflow-y-auto pr-1 lg:order-2">
          <div className="space-y-4">
            {filteredColumns.map((column, columnIndex) => {
              const isCollapsed = activeTab === "all" ? collapsedColumns[column.id] : false;
              const colorIndex = data.itinerary.columns.findIndex(
                (candidate) => candidate.id === column.id
              );

              return (
                <div key={column.id} className="rounded-[24px] border border-border-card-token bg-card-surface p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: getDayColor(colorIndex) }}
                      />
                      <h2 className="text-lg font-semibold text-foreground">
                        Day {column.position ?? columnIndex + 1}
                      </h2>
                    </div>
                    <span className="rounded-full bg-surface-muted-token px-3 py-1 text-xs font-medium text-muted-foreground">
                      {column.dateLabel}
                    </span>
                  </div>
                  {column.title ? (
                    <p className="mb-4 text-sm text-muted-foreground">{column.title}</p>
                  ) : null}
                  {activeTab === "all" ? (
                    <button
                      type="button"
                      onClick={() => toggleColumn(column.id)}
                      className="mb-3 flex w-full items-center justify-between rounded-2xl border border-border-card-token bg-surface-muted-token/70 px-4 py-3 text-left transition-colors hover:bg-surface-muted-token"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {isCollapsed ? "장소 펼쳐보기" : "장소 접기"}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 text-muted-foreground transition-transform",
                          isCollapsed ? "" : "rotate-180"
                        )}
                      />
                    </button>
                  ) : null}
                  <div className={cn("space-y-3", isCollapsed ? "hidden" : "")}>
                    {column.cardIds
                      .map((cardId) => filteredCards.find((card) => card.id === cardId))
                      .filter(Boolean)
                      .map((card) => (
                        <article
                          key={card!.id}
                          onClick={() => setSelectedCardId(card!.id)}
                          className={cn(
                            "cursor-pointer overflow-hidden rounded-2xl border border-border-card-token bg-card-surface shadow-sm transition-all hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(37,99,235,0.10)]",
                            selectedCardId === card!.id
                              ? "border-primary shadow-[0_0_0_1px_rgba(37,99,235,0.35),0_10px_30px_rgba(37,99,235,0.12)]"
                              : ""
                          )}
                        >
                          {card!.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={card!.imageUrl}
                              alt={card!.name}
                              className="h-40 w-full object-cover"
                            />
                          ) : (
                            <div className="h-28 w-full bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]" />
                          )}
                          <div className="space-y-2 p-4">
                            <h3 className="text-base font-semibold text-foreground">{card!.name}</h3>
                            <p className="text-sm text-muted-foreground">{card!.address}</p>
                            {card!.note ? (
                              <p className="rounded-xl bg-surface-muted-token px-3 py-2 text-sm leading-6 text-foreground">
                                {card!.note}
                              </p>
                            ) : null}
                          </div>
                        </article>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
