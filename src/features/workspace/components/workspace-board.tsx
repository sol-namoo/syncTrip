"use client";

import { WorkspaceColumn } from "@/features/workspace/components/workspace-column";
import type { BoardCardEntity, BoardColumnEntity } from "@/types/workspace";

export function WorkspaceBoard({
  columns,
  cardsById,
}: {
  columns: BoardColumnEntity[];
  cardsById: Record<string, BoardCardEntity>;
}) {
  return (
    <section className="min-w-0 overflow-hidden bg-gray-50">
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
    </section>
  );
}
