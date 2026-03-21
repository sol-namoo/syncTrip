"use client";

import { useMemo } from "react";
import { MapShell } from "@/features/map/components/map-shell";
import { WorkspaceBoard } from "@/features/workspace/components/workspace-board";
import { WorkspaceHeader } from "@/features/workspace/components/workspace-header";
import { useHydrateWorkspaceStores } from "@/features/workspace/hooks/use-hydrate-workspace-stores";
import { useWorkspacePresence } from "@/features/workspace/hooks/use-workspace-presence";
import { useWorkspaceBoardStore } from "@/store/workspace-board-store";
import { useWorkspacePresenceStore } from "@/store/workspace-presence-store";
import { assignCollaborationColors } from "@/lib/collaboration-colors";
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
  const { broadcastDragState } = useWorkspacePresence({
    tripId,
    members: snapshot.members,
    currentUser: actor.user,
    currentRole: actor.role,
  });

  const trip = useWorkspaceBoardStore((state) => state.trip);
  const columnOrder = useWorkspaceBoardStore((state) => state.columnOrder);
  const columnsById = useWorkspaceBoardStore((state) => state.columnsById);
  const cardsById = useWorkspaceBoardStore((state) => state.cardsById);
  const presenceUsers = useWorkspacePresenceStore((state) => state.users);

  const boardTrip = trip ?? snapshot.trip;
  const currentUserId = actor.user?.id;
  const columns = columnOrder
    .map((columnId) => columnsById[columnId])
    .filter((column): column is NonNullable<typeof column> => Boolean(column));
  const cards = Object.values(cardsById).length > 0 ? Object.values(cardsById) : snapshot.cards;
  const activePresenceUsers = useMemo(
    () =>
      presenceUsers
        .filter((member) => member.status !== "offline")
        .sort((left, right) => left.userId.localeCompare(right.userId)),
    [presenceUsers]
  );

  const participantCount = useMemo(() => {
    const ids = new Set(activePresenceUsers.map((member) => member.userId));

    if (currentUserId) {
      ids.add(currentUserId);
    }

    return ids.size;
  }, [activePresenceUsers, currentUserId]);

  const collaboratorColorMap = useMemo(
    () => assignCollaborationColors(activePresenceUsers.map((member) => member.userId)),
    [activePresenceUsers]
  );

  const collaborators = useMemo(() => {
    return activePresenceUsers
      .filter((member) => member.userId !== currentUserId)
      .map((member) => {
        return {
          id: member.userId,
          name: member.displayName,
          src: member.avatarUrl ?? undefined,
          palette: collaboratorColorMap.get(member.userId),
          status: member.status === "away" ? ("away" as const) : ("editing" as const),
        };
      });
  }, [activePresenceUsers, collaboratorColorMap, currentUserId]);

  return (
    <main className="flex min-h-screen flex-col bg-[color:var(--color-bg-page)] xl:h-screen xl:overflow-hidden">
      <WorkspaceHeader
        trip={boardTrip}
        actor={actor}
        collaborators={collaborators}
        participantCount={participantCount}
      />

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
          currentUserId={currentUserId}
          onBroadcastDragState={broadcastDragState}
        />
      </div>

      <button className="fixed bottom-5 right-5 inline-flex size-10 items-center justify-center rounded-full border border-[color:var(--color-border-card)] bg-[color:var(--color-bg-card)] text-[color:var(--color-ink-muted)] shadow-sm">
        ?
      </button>
    </main>
  );
}
