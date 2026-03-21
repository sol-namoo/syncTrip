"use client";

import {
  DragDropContext,
  type DragStart,
  type DropResult,
} from "@hello-pangea/dnd";
import { useEffect, useMemo, useRef } from "react";
import { useMoveTripItemMutation } from "@/features/workspace/hooks/use-move-trip-item-mutation";
import { WorkspaceColumn } from "@/features/workspace/components/workspace-column";
import { toast } from "@/components/ui/toast";
import { useWorkspaceBoardStore } from "@/store/workspace-board-store";
import { useWorkspacePresenceStore } from "@/store/workspace-presence-store";
import { useWorkspaceUiStore } from "@/store/workspace-ui-store";
import { assignCollaborationColors } from "@/lib/collaboration-colors";
import type { AvatarStackUser } from "@/components/ui/avatar-stack";
import type {
  BoardCardEntity,
  BoardColumnEntity,
  WorkspaceCapabilities,
} from "@/types/workspace";

export function WorkspaceBoard({
  columns,
  cardsById,
  tripId,
  capabilities,
  currentUserId,
  onBroadcastDragState,
  onBroadcastEditingState,
}: {
  columns: BoardColumnEntity[];
  cardsById: Record<string, BoardCardEntity>;
  tripId: string;
  capabilities: WorkspaceCapabilities;
  currentUserId?: string;
  onBroadcastDragState: (args: {
    state: "start" | "end";
    itemId: string;
    columnId: BoardColumnEntity["id"] | null;
  }) => void;
  onBroadcastEditingState: (args: { state: "start" | "end"; cardId: string }) => void;
}) {
  const moveCard = useWorkspaceBoardStore((state) => state.moveCard);
  const replaceBoardState = useWorkspaceBoardStore((state) => state.replaceBoardState);
  const mutation = useMoveTripItemMutation();
  const selectedCardId = useWorkspaceUiStore((state) => state.selectedCardId);
  const setSaveState = useWorkspaceUiStore((state) => state.setSaveState);
  const presenceUsers = useWorkspacePresenceStore((state) => state.users);
  const activeTargetsByUserId = useWorkspacePresenceStore(
    (state) => state.activeTargetsByUserId
  );
  const cardLocksById = useWorkspacePresenceStore((state) => state.cardLocksById);
  const cardElementsRef = useRef<Record<string, HTMLDivElement | null>>({});

  const activeUsers = useMemo(
    () =>
      presenceUsers
        .filter((user) => user.status !== "offline")
        .filter((user) => user.userId !== currentUserId)
        .sort((left, right) => left.userId.localeCompare(right.userId)),
    [currentUserId, presenceUsers]
  );

  const collaboratorColors = useMemo(
    () => assignCollaborationColors(activeUsers.map((user) => user.userId)),
    [activeUsers]
  );

  const usersById = useMemo(
    () =>
      new Map(
        activeUsers.map((user) => [
          user.userId,
          {
            id: user.userId,
            name: user.displayName,
            src: user.avatarUrl ?? undefined,
            palette: collaboratorColors.get(user.userId),
            status: user.status === "away" ? ("away" as const) : ("editing" as const),
          } satisfies AvatarStackUser,
        ])
      ),
    [activeUsers, collaboratorColors]
  );

  const columnParticipantsById = useMemo(() => {
    const map: Record<string, AvatarStackUser[]> = {};

    for (const [userId, target] of Object.entries(activeTargetsByUserId)) {
      if (target.kind !== "column") {
        continue;
      }

      const user = usersById.get(userId);
      if (!user) {
        continue;
      }

      map[target.id] = [...(map[target.id] ?? []), user];
    }

    return map;
  }, [activeTargetsByUserId, usersById]);

  const cardParticipantsById = useMemo(() => {
    const map: Record<string, AvatarStackUser[]> = {};

    for (const [userId, target] of Object.entries(activeTargetsByUserId)) {
      if (target.kind !== "card") {
        continue;
      }

      const user = usersById.get(userId);
      if (!user) {
        continue;
      }

      map[target.id] = [...(map[target.id] ?? []), user];
    }

    for (const [cardId, lock] of Object.entries(cardLocksById)) {
      const user = usersById.get(lock.userId);
      if (!user) {
        continue;
      }

      const existing = map[cardId] ?? [];
      if (!existing.some((entry) => entry.id === user.id)) {
        map[cardId] = [...existing, user];
      }
    }

    return map;
  }, [activeTargetsByUserId, cardLocksById, usersById]);

  useEffect(() => {
    if (!selectedCardId) {
      return;
    }

    const element = cardElementsRef.current[selectedCardId];

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [selectedCardId]);

  function handleDragStart(start: DragStart) {
    onBroadcastDragState({
      state: "start",
      itemId: start.draggableId,
      columnId: start.source.droppableId as BoardColumnEntity["id"],
    });
  }

  async function handleDragEnd(result: DropResult) {
    onBroadcastDragState({
      state: "end",
      itemId: result.draggableId,
      columnId: result.destination
        ? (result.destination.droppableId as BoardColumnEntity["id"])
        : null,
    });

    if (!capabilities.canEditItems || !capabilities.canPersist) {
      toast.error("현재 권한으로는 일정을 저장할 수 없습니다.");
      return;
    }

    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const previousState = useWorkspaceBoardStore.getState();

    moveCard({
      sourceColumnId: source.droppableId as BoardColumnEntity["id"],
      destinationColumnId: destination.droppableId as BoardColumnEntity["id"],
      sourceIndex: source.index,
      destinationIndex: destination.index,
    });

    const nextState = useWorkspaceBoardStore.getState();
    const sourceColumn = nextState.columnsById[source.droppableId as BoardColumnEntity["id"]];
    const destinationColumn =
      nextState.columnsById[destination.droppableId as BoardColumnEntity["id"]];
    const movedCardId = sourceColumn
      ? previousState.columnsById[source.droppableId as BoardColumnEntity["id"]]?.cardIds[
          source.index
        ]
      : undefined;

    if (!sourceColumn || !destinationColumn || !movedCardId) {
      return;
    }

    try {
      setSaveState("saving");
      await mutation.mutateAsync({
        tripId,
        itemId: movedCardId,
        destinationTripDayId: destinationColumn.tripDayId,
        sourceItemIds: sourceColumn.cardIds,
        destinationItemIds: destinationColumn.cardIds,
      });
      setSaveState("saved");
      toast.success("변경사항이 저장되었습니다.", {
        duration: 1600,
      });
      window.setTimeout(() => {
        if (useWorkspaceUiStore.getState().saveState === "saved") {
          useWorkspaceUiStore.getState().setSaveState("idle");
        }
      }, 1600);
    } catch {
      replaceBoardState({
        trip: previousState.trip,
        columnOrder: previousState.columnOrder,
        columnsById: previousState.columnsById,
        cardsById: previousState.cardsById,
      });
      setSaveState("error");
      toast.error("카드 이동 저장에 실패했습니다. 이전 상태로 되돌렸습니다.");
      window.setTimeout(() => {
        if (useWorkspaceUiStore.getState().saveState === "error") {
          useWorkspaceUiStore.getState().setSaveState("idle");
        }
      }, 2200);
    }
  }

  return (
    <section className="relative min-w-0 overflow-hidden bg-[color:var(--color-bg-page)]">
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex h-full min-w-0 gap-4 overflow-x-auto p-6">
          {columns.map((column) => (
            <WorkspaceColumn
              key={column.id}
              column={column}
              cards={column.cardIds
                .map((cardId) => cardsById[cardId])
                .filter((card): card is BoardCardEntity => Boolean(card))}
              participants={columnParticipantsById[column.id] ?? []}
              cardParticipantsById={cardParticipantsById}
              cardLocksById={cardLocksById}
              currentUserId={currentUserId}
              canEditItems={capabilities.canEditItems}
              onBroadcastEditingState={onBroadcastEditingState}
              registerCardElement={(cardId, element) => {
                cardElementsRef.current[cardId] = element;
              }}
            />
          ))}
        </div>
      </DragDropContext>
    </section>
  );
}
