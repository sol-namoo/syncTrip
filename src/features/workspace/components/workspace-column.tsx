"use client";

import { LoaderCircle, Pencil } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useState } from "react";
import { AvatarStack, type AvatarStackUser } from "@/components/ui/avatar-stack";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { getDayTokens } from "@/features/workspace/lib/day-tokens";
import { PlaceCard } from "@/features/workspace/components/place-card";
import { useUpdateTripDayTitleMutation } from "@/features/workspace/hooks/use-update-trip-day-title-mutation";
import { useWorkspaceBoardStore } from "@/store/workspace-board-store";
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
  canRenameDay,
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
  canRenameDay: boolean;
  onBroadcastEditingState: (args: { state: "start" | "end"; cardId: string }) => void;
  registerCardElement: (cardId: string, element: HTMLDivElement | null) => void;
}) {
  const isBucket = column.id === "bucket";
  const dayNumber = column.position ?? 1;
  const dayTokens = getDayTokens(dayNumber);
  const selectedColumnId = useWorkspaceUiStore((state) => state.selectedColumnId);
  const setSelectedColumnId = useWorkspaceUiStore((state) => state.setSelectedColumnId);
  const setSelectedCardId = useWorkspaceUiStore((state) => state.setSelectedCardId);
  const updateColumnTitle = useWorkspaceBoardStore((state) => state.updateColumnTitle);
  const titleMutation = useUpdateTripDayTitleMutation();
  const isSelected = selectedColumnId === column.id;
  const leadParticipant = participants[0];
  const showParticipantStack = participants.length > 1;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(column.title);
  const collaborativeStyle =
    participants.length === 1 && leadParticipant?.palette
      ? {
          borderColor: leadParticipant.palette.solid,
          boxShadow: `0 0 0 1px ${leadParticipant.palette.solid}, 0 0 0 4px ${leadParticipant.palette.soft}`,
        }
      : undefined;

  async function handleSaveTitle() {
    if (isBucket || !column.tripDayId) {
      setIsEditingTitle(false);
      return;
    }

    const trimmedTitle = draftTitle.trim();
    const previousTitle = column.title;
    updateColumnTitle(column.id, trimmedTitle);

    try {
      await titleMutation.mutateAsync({
        dayId: column.tripDayId,
        title: trimmedTitle || null,
      });
      setIsEditingTitle(false);
    } catch {
      updateColumnTitle(column.id, previousTitle);
      setDraftTitle(previousTitle);
      setIsEditingTitle(false);
    }
  }

  function handleTitleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSaveTitle();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setDraftTitle(column.title);
      setIsEditingTitle(false);
    }
  }

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
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
              {!isBucket ? (
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: dayTokens.dot }}
                />
              ) : null}
                <h3 className="truncate font-bold text-[color:var(--color-ink)]">
                  {isBucket ? column.title : `Day ${dayNumber}`}
                </h3>
              </div>
              {column.dateLabel ? (
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{
                    backgroundColor: dayTokens.accent,
                    color: dayTokens.fg,
                  }}
                >
                  {column.dateLabel}
                </span>
              ) : null}
            </div>
            {!isBucket ? (
              isEditingTitle ? (
                <div className="mt-1 flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                  <input
                    autoFocus
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    onBlur={() => {
                      void handleSaveTitle();
                    }}
                    onKeyDown={handleTitleKeyDown}
                    className="min-w-0 flex-1 rounded-md border border-border-card-token bg-card-surface px-2 py-1 text-sm text-[color:var(--color-ink)] outline-none"
                    placeholder={`제목 추가`}
                  />
                  {titleMutation.isPending ? (
                    <LoaderCircle className="size-4 animate-spin text-[color:var(--color-ink-muted)]" />
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!canRenameDay}
                  onClick={(event) => {
                    event.stopPropagation();
                    setDraftTitle(column.title);
                    setIsEditingTitle(true);
                  }}
                  className="group mt-1 inline-flex max-w-full items-center gap-1 rounded-md text-left text-sm text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-ink)] disabled:cursor-default disabled:hover:text-[color:var(--color-ink-muted)]"
                >
                  <span className="truncate">
                    {column.title || `-`}
                  </span>
                  {canRenameDay ? (
                    <Pencil className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                  ) : null}
                </button>
              )
            ) : null}
          </div>
          {showParticipantStack ? (
            <div className="ml-3 flex shrink-0 items-start">
              <AvatarStack users={participants} size="sm" max={2} />
            </div>
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
                    {isBucket ? "장소를 검색해보세요" : "장소를 추가해 보세요"}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}
