"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { WorkspaceColumn } from "@/features/workspace/components/workspace-column";
import { useWorkspaceBoardStore } from "@/store/workspace-board-store";
import type { BoardCardEntity, BoardColumnEntity } from "@/types/workspace";

export function WorkspaceBoard({
  columns,
  cardsById,
}: {
  columns: BoardColumnEntity[];
  cardsById: Record<string, BoardCardEntity>;
}) {
  const moveCard = useWorkspaceBoardStore((state) => state.moveCard);

  function handleDragEnd(result: DropResult) {
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

    moveCard({
      sourceColumnId: source.droppableId as BoardColumnEntity["id"],
      destinationColumnId: destination.droppableId as BoardColumnEntity["id"],
      sourceIndex: source.index,
      destinationIndex: destination.index,
    });
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
            />
          ))}
        </div>
      </DragDropContext>
    </section>
  );
}
