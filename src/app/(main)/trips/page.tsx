"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { useTripsQuery } from "@/features/trips/hooks";
import { Spinner } from "@/components/ui/spinner";
import { CreateTripDialog } from "@/features/trips/components/create-trip-dialog";

const CARD_BACKGROUNDS = [
  "linear-gradient(135deg, rgba(246,177,122,0.65), rgba(104,161,255,0.35))",
  "linear-gradient(135deg, rgba(178,163,126,0.65), rgba(63,94,164,0.32))",
  "linear-gradient(135deg, rgba(147,197,253,0.6), rgba(191,219,254,0.34))",
];

export default function TripsPage() {
  const { data: trips = [], isLoading, isError } = useTripsQuery();
  const sortedTrips = useMemo(() => trips, [trips]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">내 여행 일정</h1>
          <p className="text-base text-gray-600">친구들과 함께 계획하고 있는 여행들</p>
        </div>
        <CreateTripDialog />
      </div>

      {/* Post-MVP: 여행 목록 탭 필터는 페이지네이션/검색/정렬 정책이 확정된 뒤 다시 활성화한다. */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center text-sm text-muted-foreground shadow-sm md:col-span-2 xl:col-span-3">
            <Spinner className="size-5" />
          </div>
        ) : null}

        {!isLoading && isError ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-dashed border-destructive/40 bg-white text-center text-sm text-destructive shadow-sm md:col-span-2 xl:col-span-3">
            여행 목록을 불러오지 못했습니다.
          </div>
        ) : null}

        {!isLoading && !isError && sortedTrips.length === 0 ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center text-sm text-muted-foreground shadow-sm md:col-span-2 xl:col-span-3">
            아직 생성되거나 초대된 여행이 없습니다.
          </div>
        ) : null}

        {!isLoading && !isError
          ? sortedTrips.map((trip, index) => (
              <Link
                key={trip.id}
                href={`/workspace/${trip.id}`}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className="h-48 w-full"
                  style={{ background: CARD_BACKGROUNDS[index % CARD_BACKGROUNDS.length] }}
                />
                <div className="p-6">
                  <h2 className="mb-2 text-xl font-bold text-gray-900">{trip.title}</h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      <span>{trip.destination ?? "목적지 미정"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4" />
                      <span>
                        {trip.startDate} ~ {trip.endDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="size-4" />
                      <span>{trip.memberCount}명</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          : null}
      </div>
    </section>
  );
}
