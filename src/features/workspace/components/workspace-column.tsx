"use client";

import { Button } from "@/components/ui/button";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { getDayTokens } from "@/features/workspace/lib/day-tokens";
import { PlaceCard } from "@/features/workspace/components/place-card";
import type { BoardColumnEntity, BoardCardEntity } from "@/types/workspace";

export function WorkspaceColumn({
  column,
  cards,
  registerCardElement,
}: {
  column: BoardColumnEntity;
  cards: BoardCardEntity[];
  registerCardElement: (cardId: string, element: HTMLDivElement | null) => void;
}) {
  const isBucket = column.id === "bucket";
  const dayNumber = column.position ?? 1;
  const dayTokens = getDayTokens(dayNumber);

  return (
    <div
      className={
        isBucket
          ? "order-last flex h-full w-80 shrink-0 flex-col overflow-hidden rounded-2xl border-[1.5px] border-dashed border-[color:var(--color-col-border)] bg-[color:var(--color-bg-card)] xl:order-none"
          : "flex h-full w-80 shrink-0 flex-col overflow-hidden rounded-2xl border-[1.5px] border-[color:var(--color-border-card-subtle)] bg-[color:var(--color-bg-card)]"
      }
      style={undefined}
    >
      <div className="bg-[color:var(--color-bg-page)]/80 p-4 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[color:var(--color-ink)]">{column.title}</h3>
          {column.dateLabel ? (
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{
                backgroundColor: dayTokens.accent,
                color: dayTokens.fg,
              }}
            >
              {column.dateLabel}
            </span>
          ) : null}
        </div>
      </div>

      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 overflow-y-auto p-4"
          >
            <div className="min-h-full">
              <div className="space-y-3">
                {cards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(draggableProvided, draggableSnapshot) => (
                      <div {...draggableProvided.draggableProps}>
                        <PlaceCard
                          card={card}
                          dragHandleProps={draggableProvided.dragHandleProps}
                          isDragging={draggableSnapshot.isDragging}
                          cardRef={(element) => {
                            draggableProvided.innerRef(element);
                            registerCardElement(card.id, element);
                          }}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
              {provided.placeholder}

              {cards.length === 0 ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-dashed border-[color:var(--color-border-card)] bg-white/55 py-8 text-center text-sm text-[color:var(--color-ink-muted)]">
                    {isBucket ? "장소를 검색해보세요" : "장소를 드래그해서 추가하세요"}
                  </div>
                  {!isBucket ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full rounded-xl border border-dashed border-[color:var(--color-border-card)] text-[color:var(--color-ink-muted)] hover:bg-[color:var(--surface-muted)]"
                    >
                      + 장소 추가
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}
