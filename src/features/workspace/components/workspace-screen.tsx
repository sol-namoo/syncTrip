"use client";

import { Plane } from "lucide-react";
import { ProfileMenu } from "@/features/auth/components/profile-menu";
import type { WorkspaceSnapshot } from "@/types/workspace";

const DAY_COLORS = ["#3b82f6", "#f87171", "#22c55e", "#a855f7"];

export function WorkspaceScreen({
  snapshot,
  tripId,
  user,
}: {
  snapshot: WorkspaceSnapshot;
  tripId: string;
  user: {
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;
}) {
  const dayColumns = snapshot.columns.filter((column) => column.dayIndex !== null);

  return (
    <main className="flex min-h-screen flex-col">
      <section className="border-b bg-background/95">
        <div className="flex h-[68px] items-center justify-between gap-4 px-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex items-center gap-2 text-[28px] font-semibold tracking-tight text-foreground">
              <Plane className="size-6 -rotate-12 text-primary" />
              <span>SyncTrip</span>
            </div>
            <div className="hidden h-6 w-px bg-border md:block" />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{snapshot.trip.title}</p>
            </div>
            <p className="hidden text-sm text-muted-foreground md:block">
              {snapshot.trip.startDate} ~ {snapshot.trip.endDate}
            </p>
            <p className="hidden text-xs text-muted-foreground xl:block">
              Workspace #{tripId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-xl border px-4 py-2 text-sm font-medium text-muted-foreground md:block">
              액션 영역
            </div>
            {user ? (
              <ProfileMenu
                email={user.email}
                fullName={user.fullName}
                avatarUrl={user.avatarUrl}
              />
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid flex-1 grid-cols-1 xl:grid-cols-[1.05fr_1.75fr]">
        <section className="border-b xl:border-b-0 xl:border-r">
          <div className="flex h-full flex-col">
            <div className="border-b px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">지도 뷰</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
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

            <div className="relative flex-1 overflow-hidden bg-muted/45">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.92),rgba(241,245,249,0.72))]" />
              <div className="absolute inset-x-0 bottom-[72px] flex flex-col items-center justify-center text-center text-muted-foreground">
                <div className="mb-4 text-5xl">◎</div>
                <p className="text-2xl font-semibold text-foreground">Map Panel</p>
                <p className="mt-2 text-sm">지도 영역 레이아웃 placeholder</p>
              </div>
            </div>

            <div className="border-t px-5 py-4 text-sm text-muted-foreground">
              총 {snapshot.cards.length}개 장소 · 예상 이동 거리 12.5km
            </div>
          </div>
        </section>

        <section className="min-w-0 overflow-hidden bg-background">
          <div className="flex h-full min-w-0 gap-4 overflow-x-auto px-4 py-5">
            <div className="min-h-full w-[290px] shrink-0 rounded-3xl border bg-card">
              <div className="border-b px-5 py-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">
                    {snapshot.columns[0]?.title ?? "장소 바구니"}
                  </p>
                </div>
                <div className="mt-4 rounded-xl border px-4 py-3 text-sm text-muted-foreground">
                  장소 검색 입력 영역
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="h-[220px] rounded-2xl border bg-muted/30" />
                <p className="text-sm text-muted-foreground">
                  {snapshot.columns[0]?.cardIds.length ?? 0}개 장소
                </p>
              </div>
              <div className="border-t p-4">
                <div className="flex h-11 items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
                  장소 추가 영역
                </div>
              </div>
            </div>

            {dayColumns.map((column) => (
              <div key={column.id} className="min-h-full w-[300px] shrink-0 rounded-3xl border bg-card">
                <div className="border-b px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-semibold">{column.title}</p>
                    <span className="text-sm font-medium text-muted-foreground">
                      {column.dateLabel}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <div className="h-56 rounded-2xl border border-dashed border-border bg-muted/20" />
                  <p className="text-sm text-muted-foreground">{column.cardIds.length}개 장소</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <button className="fixed bottom-5 right-5 inline-flex size-10 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm">
        ?
      </button>
    </main>
  );
}
