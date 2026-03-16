"use client";

import { useTripsQuery } from "@/features/trips/hooks";

export default function TripsPage() {
  const { data: trips = [], isLoading, isError } = useTripsQuery();

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">내 여행 일정</h1>
          <p className="text-base text-muted-foreground">친구들과 함께 계획하고 있는 여행들</p>
        </div>
        <button className="self-start rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm">
          + 새 여행 만들기
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="min-h-[325px] rounded-[28px] border bg-card shadow-sm"
              />
            ))
          : null}

        {!isLoading && isError ? (
          <div className="flex min-h-[325px] items-center justify-center rounded-[28px] border border-dashed border-destructive/40 bg-card text-center text-sm text-destructive shadow-sm md:col-span-2 xl:col-span-3">
            여행 목록을 불러오지 못했습니다.
          </div>
        ) : null}

        {!isLoading && !isError && trips.length === 0 ? (
          <div className="flex min-h-[325px] items-center justify-center rounded-[28px] border border-dashed border-border bg-card text-center text-sm text-muted-foreground shadow-sm md:col-span-2 xl:col-span-3">
            아직 참여 중인 여행이 없습니다.
          </div>
        ) : null}

        {!isLoading && !isError
          ? trips.map((trip) => (
              <article
                key={trip.id}
                className="flex min-h-[325px] flex-col justify-between rounded-[28px] border bg-card p-6 shadow-sm"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      {trip.role}
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight">{trip.title}</h2>
                  </div>
                  <dl className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between gap-4">
                      <dt>Destination</dt>
                      <dd>{trip.destination ?? "TBD"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt>Dates</dt>
                      <dd>
                        {trip.startDate} - {trip.endDate}
                      </dd>
                    </div>
                  </dl>
                </div>

                <p className="text-xs text-muted-foreground">
                  Created at {new Date(trip.createdAt).toLocaleDateString()}
                </p>
              </article>
            ))
          : null}
      </div>
    </section>
  );
}
