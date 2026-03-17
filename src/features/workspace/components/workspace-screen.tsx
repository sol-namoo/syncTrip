"use client";

import { MapShell } from "@/features/map/components/map-shell";
import { WorkspaceBoard } from "@/features/workspace/components/workspace-board";
import { WorkspaceHeader } from "@/features/workspace/components/workspace-header";
import { useHydrateWorkspaceStores } from "@/features/workspace/hooks/use-hydrate-workspace-stores";
import { useWorkspaceBoardStore } from "@/store/workspace-board-store";
import type { WorkspaceActor, WorkspaceSnapshot } from "@/types/workspace";

export function WorkspaceScreen({
  snapshot,
  tripId,
  actor,
}: {
  snapshot: WorkspaceSnapshot;
  tripId: string;
  actor: WorkspaceActor;
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
  const cards = Object.values(cardsById).length > 0 ? Object.values(cardsById) : snapshot.cards;

  return (
    <main className="flex min-h-screen flex-col xl:h-screen xl:overflow-hidden">
      <WorkspaceHeader trip={boardTrip} tripId={tripId} actor={actor} />

      <div className="grid flex-1 grid-cols-1 xl:min-h-0 xl:grid-cols-[1.05fr_1.75fr]">
        <MapShell
          columns={columns}
          cards={cards}
          tripId={tripId}
          capabilities={actor.capabilities}
        />
        <WorkspaceBoard
          columns={columns}
          cardsById={cardsById}
          tripId={tripId}
          capabilities={actor.capabilities}
        />
      </div>

      <button className="fixed bottom-5 right-5 inline-flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm">
        ?
      </button>
    </main>
  );
}
