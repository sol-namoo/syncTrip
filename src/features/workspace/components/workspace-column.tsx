"use client";

import { AvatarStack, type AvatarStackUser } from "@/components/ui/avatar-stack";
import { Button } from "@/components/ui/button";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { getDayTokens } from "@/features/workspace/lib/day-tokens";
import { PlaceCard } from "@/features/workspace/components/place-card";
import { useWorkspaceUiStore } from "@/store/workspace-ui-store";
import type {
  BoardColumnEntity,
  BoardCardEntity,
  CardLockMap,
} from "@/types/workspace";

export function WorkspaceColumn({
  column,
  cards,
  participants,
  cardParticipantsById,
  cardLocksById,
  currentUserId,
  canEditItems,
  onBroadcastEditingState,
  registerCardElement,
}: {
  column: BoardColumnEntity;
  cards: BoardCardEntity[];
  participants: AvatarStackUser[];
  cardParticipantsById: Record<string, AvatarStackUser[]>;
  cardLocksById: CardLockMap;
  currentUserId?: string;
  canEditItems: boolean;
  onBroadcastEditingState: (args: { state: "start" | "end"; cardId: string }) => void;
  registerCardElement: (cardId: string, element: HTMLDivElement | null) => void;
}) {
  const isBucket = column.id === "bucket";
  const dayNumber = column.position ?? 1;
  const dayTokens = getDayTokens(dayNumber);
  const selectedColumnId = useWorkspaceUiStore((state) => state.selectedColumnId);
  const setSelectedColumnId = useWorkspaceUiStore((state) => state.setSelectedColumnId);
  const setSelectedCardId = useWorkspaceUiStore((state) => state.setSelectedCardId);
  const isSelected = selectedColumnId === column.id;
  const leadParticipant = participants[0];
  const showParticipantStack = participants.length > 1;
  const collaborativeStyle =
    participants.length === 1 && leadParticipant?.palette
      ? {
          borderColor: leadParticipant.palette.solid,
          boxShadow: `0 0 0 1px ${leadParticipant.palette.solid}, 0 0 0 4px ${leadParticipant.palette.soft}`,
        }
      : undefined;

  return (
    <div
      onClick={() => {
        setSelectedColumnId(column.id);
        setSelectedCardId(null);
      }}
      className={
        isBucket
          ? `order-last flex h-full w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-dashed bg-card-surface xl:order-none ${
              isSelected ? "border-primary/60 ring-2 ring-primary/15" : "border-col-border-token"
            }`
          : `flex h-full w-80 shrink-0 flex-col overflow-hidden rounded-2xl border bg-card-surface ${
              isSelected ? "border-primary/60 ring-2 ring-primary/15" : "border-border-card-token"
            }`
      }
      style={collaborativeStyle}
    >
      <div className="bg-card-surface p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            {!isBucket ? (
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: dayTokens.dot }}
              />
            ) : null}
            <h3 className="truncate font-bold text-[color:var(--color-ink)]">{column.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {showParticipantStack ? (
              <AvatarStack users={participants} size="sm" max={2} />
            ) : null}
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
                  <Draggable
                    key={card.id}
                    draggableId={card.id}
                    index={index}
                    isDragDisabled={
                      !canEditItems ||
                      (Boolean(cardLocksById[card.id]) &&
                        cardLocksById[card.id]?.userId !== currentUserId)
                    }
                  >
                    {(draggableProvided, draggableSnapshot) => (
                      <div {...draggableProvided.draggableProps}>
                        <PlaceCard
                          card={card}
                          dragHandleProps={draggableProvided.dragHandleProps}
                          isDragging={draggableSnapshot.isDragging}
                          participants={cardParticipantsById[card.id] ?? []}
                          cardLock={cardLocksById[card.id]}
                          currentUserId={currentUserId}
                          canEditItems={canEditItems}
                          onBroadcastEditingState={onBroadcastEditingState}
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
