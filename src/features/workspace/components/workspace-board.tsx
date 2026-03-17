"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useEffect, useRef } from "react";
import { useMoveTripItemMutation } from "@/features/workspace/hooks/use-move-trip-item-mutation";
import { WorkspaceColumn } from "@/features/workspace/components/workspace-column";
import { toast } from "@/components/ui/toast";
import { useWorkspaceBoardStore } from "@/store/workspace-board-store";
import { useWorkspaceUiStore } from "@/store/workspace-ui-store";
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
}: {
  columns: BoardColumnEntity[];
  cardsById: Record<string, BoardCardEntity>;
  tripId: string;
  capabilities: WorkspaceCapabilities;
}) {
  const moveCard = useWorkspaceBoardStore((state) => state.moveCard);
  const replaceBoardState = useWorkspaceBoardStore((state) => state.replaceBoardState);
  const mutation = useMoveTripItemMutation();
  const selectedCardId = useWorkspaceUiStore((state) => state.selectedCardId);
  const setSaveState = useWorkspaceUiStore((state) => state.setSaveState);
  const cardElementsRef = useRef<Record<string, HTMLDivElement | null>>({});

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

  async function handleDragEnd(result: DropResult) {
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
    <section className="min-w-0 overflow-hidden bg-gray-50">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex h-full min-w-0 gap-4 overflow-x-auto p-6">
          {columns.map((column) => (
            <WorkspaceColumn
              key={column.id}
              column={column}
              cards={column.cardIds
                .map((cardId) => cardsById[cardId])
                .filter((card): card is BoardCardEntity => Boolean(card))}
              capabilities={capabilities}
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
