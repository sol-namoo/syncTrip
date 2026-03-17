"use client";

import { WorkspaceBoard } from "@/features/workspace/components/workspace-board";
import { WorkspaceHeader } from "@/features/workspace/components/workspace-header";
import { useHydrateWorkspaceStores } from "@/features/workspace/hooks/use-hydrate-workspace-stores";
import { useWorkspaceBoardStore } from "@/store/workspace-board-store";
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
  useHydrateWorkspaceStores(snapshot);

  const trip = useWorkspaceBoardStore((state) => state.trip);
  const columnOrder = useWorkspaceBoardStore((state) => state.columnOrder);
  const columnsById = useWorkspaceBoardStore((state) => state.columnsById);
  const cardsById = useWorkspaceBoardStore((state) => state.cardsById);

  const boardTrip = trip ?? snapshot.trip;
  const columns = columnOrder
    .map((columnId) => columnsById[columnId])
    .filter((column): column is NonNullable<typeof column> => Boolean(column));
  const dayColumns = columns.filter((column) => column.tripDayId !== null);
  const totalCards = Object.keys(cardsById).length || snapshot.cards.length;

  return (
    <main className="flex min-h-screen flex-col xl:h-screen xl:overflow-hidden">
      <WorkspaceHeader trip={boardTrip} tripId={tripId} user={user} />

      <div className="grid flex-1 grid-cols-1 xl:min-h-0 xl:grid-cols-[1.05fr_1.75fr]">
        <section className="border-b border-gray-200 bg-white xl:border-b-0 xl:border-r">
          <div className="flex h-full flex-col xl:min-h-0">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">지도 뷰</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.92),rgba(241,245,249,0.72))]" />
              <div className="absolute inset-x-0 bottom-[72px] flex flex-col items-center justify-center text-center text-gray-500">
                <div className="mb-4 text-5xl">◎</div>
                <p className="text-2xl font-semibold text-gray-900">Map Panel</p>
                <p className="mt-2 text-sm">지도 영역 레이아웃 placeholder</p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-5 py-4 text-sm text-gray-500">
              총 {totalCards}개 장소 · 예상 이동 거리 12.5km
            </div>
          </div>
        </section>

        <WorkspaceBoard
          columns={columns}
          cardsById={cardsById}
          tripId={tripId}
        />
      </div>

      <button className="fixed bottom-5 right-5 inline-flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm">
        ?
      </button>
    </main>
  );
}
