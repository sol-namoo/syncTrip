"use client";

import { useMemo } from "react";
import { MapShell } from "@/features/map/components/map-shell";
import { WorkspaceBoard } from "@/features/workspace/components/workspace-board";
import { WorkspaceHeader } from "@/features/workspace/components/workspace-header";
import { useHydrateWorkspaceStores } from "@/features/workspace/hooks/use-hydrate-workspace-stores";
import { useWorkspacePresence } from "@/features/workspace/hooks/use-workspace-presence";
import { useWorkspaceBoardStore } from "@/store/workspace-board-store";
import { useWorkspacePresenceStore } from "@/store/workspace-presence-store";
import { collaborationColorTokens } from "@/lib/collaboration-colors";
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
  useWorkspacePresence({
    tripId,
    members: snapshot.members,
    currentUser: actor.user,
  });

  const trip = useWorkspaceBoardStore((state) => state.trip);
  const columnOrder = useWorkspaceBoardStore((state) => state.columnOrder);
  const columnsById = useWorkspaceBoardStore((state) => state.columnsById);
  const cardsById = useWorkspaceBoardStore((state) => state.cardsById);
  const presenceUsers = useWorkspacePresenceStore((state) => state.users);

  const boardTrip = trip ?? snapshot.trip;
  const columns = columnOrder
    .map((columnId) => columnsById[columnId])
    .filter((column): column is NonNullable<typeof column> => Boolean(column));
  const cards = Object.values(cardsById).length > 0 ? Object.values(cardsById) : snapshot.cards;
  const collaborators = useMemo(
    () => {
      const activeUsers = presenceUsers
        .filter((member) => member.status !== "offline")
        .sort((left, right) => left.userId.localeCompare(right.userId));

      return activeUsers.map((member, index) => {
        const isCurrentUser = member.userId === actor.user?.id;
        const demoName =
          actor.role === "demo" ? `Demo User ${index + 1}` : `E${index + 1}`;

        return {
          id: member.userId,
          name:
            actor.role === "demo"
              ? demoName
              : isCurrentUser
                ? actor.user?.fullName ?? actor.user?.email ?? demoName
                : demoName,
          src: isCurrentUser ? actor.user?.avatarUrl ?? undefined : undefined,
          color: collaborationColorTokens[index % collaborationColorTokens.length],
          status: member.status === "away" ? ("away" as const) : ("editing" as const),
        };
      });
    },
    [actor.role, actor.user, presenceUsers]
  );

  return (
    <main className="flex min-h-screen flex-col bg-[color:var(--color-bg-page)] xl:h-screen xl:overflow-hidden">
      <WorkspaceHeader trip={boardTrip} actor={actor} collaborators={collaborators} />

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

      <button className="fixed bottom-5 right-5 inline-flex size-10 items-center justify-center rounded-full border border-[color:var(--color-border-card)] bg-[color:var(--color-bg-card)] text-[color:var(--color-ink-muted)] shadow-sm">
        ?
      </button>
    </main>
  );
}
