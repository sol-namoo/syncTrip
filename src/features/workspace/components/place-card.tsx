"use client";

import { useEffect, useMemo, useState } from "react";
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { LoaderCircle, Lock, MapPin, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { AvatarStack, type AvatarStackUser } from "@/components/ui/avatar-stack";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/toast";
import { useDeleteTripItemMutation } from "@/features/workspace/hooks/use-delete-trip-item-mutation";
import { useUpdateTripItemNoteMutation } from "@/features/workspace/hooks/use-update-trip-item-note-mutation";
import { cn } from "@/lib/utils";
import { useWorkspaceBoardStore } from "@/store/workspace-board-store";
import { useWorkspaceUiStore } from "@/store/workspace-ui-store";
import type { CardLockState, TripPlaceCard } from "@/types/workspace";

function CardImage({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className="h-32 w-full object-cover"
        draggable={false}
      />
    );
  }

  return (
    <div className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]">
      <span className="text-sm font-semibold tracking-[0.2em] text-[color:var(--color-primary)]/60">
        {name.slice(0, 24).toUpperCase()}
      </span>
    </div>
  );
}

export function PlaceCard({
  card,
  dragHandleProps,
  isDragging = false,
  participants = [],
  cardLock,
  currentUserId,
  canEditItems,
  onBroadcastEditingState,
  cardRef,
}: {
  card: TripPlaceCard;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isDragging?: boolean;
  participants?: AvatarStackUser[];
  cardLock?: CardLockState | null;
  currentUserId?: string;
  canEditItems: boolean;
  onBroadcastEditingState: (args: { state: "start" | "end"; cardId: string }) => void;
  cardRef?: (element: HTMLDivElement | null) => void;
}) {
  const selectedCardId = useWorkspaceUiStore((state) => state.selectedCardId);
  const setSelectedCardId = useWorkspaceUiStore((state) => state.setSelectedCardId);
  const setSelectedColumnId = useWorkspaceUiStore((state) => state.setSelectedColumnId);
  const updateCardNote = useWorkspaceBoardStore((state) => state.updateCardNote);
  const removeCard = useWorkspaceBoardStore((state) => state.removeCard);
  const noteMutation = useUpdateTripItemNoteMutation();
  const deleteMutation = useDeleteTripItemMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [draftNote, setDraftNote] = useState(card.note);

  const isSelected = selectedCardId === card.id;
  const leadParticipant = participants[0];
  const showParticipantStack = participants.length > 1;
  const isLockedByOther = Boolean(cardLock && cardLock.userId !== currentUserId);
  const lockPalette = useMemo(
    () =>
      participants.find((participant) => participant.id === cardLock?.userId)?.palette ??
      leadParticipant?.palette,
    [cardLock?.userId, leadParticipant?.palette, participants]
  );
  const collaborativeStyle =
    !isDragging && participants.length === 1 && leadParticipant?.palette && !isLockedByOther
      ? {
          boxShadow: `0 0 0 1px ${leadParticipant.palette.solid}, 0 0 0 4px ${leadParticipant.palette.soft}`,
          borderColor: leadParticipant.palette.solid,
        }
      : undefined;

  useEffect(() => {
    return () => {
      if (isEditing) {
        onBroadcastEditingState({ state: "end", cardId: card.id });
      }
    };
  }, [card.id, isEditing, onBroadcastEditingState]);

  async function handleSaveNote() {
    const nextNote = draftNote.trim();
    const previousNote = card.note;

    updateCardNote(card.id, nextNote);

    try {
      await noteMutation.mutateAsync({
        itemId: card.id,
        note: nextNote,
      });
      setIsEditing(false);
      onBroadcastEditingState({ state: "end", cardId: card.id });
      toast.success("메모를 저장했습니다.", { duration: 1400 });
    } catch {
      updateCardNote(card.id, previousNote);
      toast.error("메모 저장에 실패했습니다.");
    }
  }

  function handleCancelEditing() {
    setDraftNote(card.note);
    setIsEditing(false);
    onBroadcastEditingState({ state: "end", cardId: card.id });
  }

  async function handleDeleteCard() {
    try {
      await deleteMutation.mutateAsync({ itemId: card.id });
      removeCard(card.id);
      toast.success("장소를 삭제했습니다.", { duration: 1400 });
    } catch {
      toast.error("장소 삭제에 실패했습니다.");
    }
  }

  return (
    <div
      ref={cardRef}
      {...(!isEditing && !isLockedByOther ? dragHandleProps : undefined)}
      onClick={(event) => {
        event.stopPropagation();
        setSelectedColumnId(null);
        setSelectedCardId(card.id);
      }}
      className={cn(
        "select-none cursor-grab overflow-hidden rounded-2xl border border-[color:var(--color-border-card-subtle)] bg-[color:var(--color-bg-card)] text-left shadow-[0_2px_8px_var(--color-shadow-card)] transition-all duration-150 hover:border-[color:var(--color-border-card-hover)] hover:shadow-[0_4px_14px_var(--color-shadow-card-hover)] active:cursor-grabbing",
        isLockedByOther && "cursor-not-allowed opacity-80",
        isDragging &&
          "z-50 rotate-[1.5deg] scale-[1.02] border-2 border-[color:var(--color-primary)] opacity-90 shadow-[0_8px_24px_var(--color-shadow-card-hover)]",
        isSelected
          ? "ring-2 ring-[color:var(--color-primary)]/25"
          : ""
      )}
      style={
        isLockedByOther && lockPalette
          ? {
              borderColor: lockPalette.solid,
              boxShadow: `0 0 0 1px ${lockPalette.solid}, 0 0 0 5px ${lockPalette.soft}`,
            }
          : collaborativeStyle
      }
    >
      <div className="relative">
        <CardImage imageUrl={card.imageUrl} name={card.name} />
        {isLockedByOther ? (
          <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-ink)]/88 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
            <Lock className="size-3" />
            수정중
          </div>
        ) : null}
        {showParticipantStack ? (
          <AvatarStack
            users={participants}
            size="sm"
            max={2}
            className={cn(
              "absolute",
              isLockedByOther ? "left-2 top-9" : "left-2 top-2"
            )}
          />
        ) : null}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
              }}
              className="absolute right-2 top-2 rounded-full bg-white/92 p-1.5 text-[color:var(--color-ink-muted)] shadow-sm transition-colors hover:bg-white hover:text-[color:var(--color-ink)]"
              aria-label={`${card.name} actions`}
            >
              <MoreVertical className="size-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-40 space-y-1 p-1"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              disabled={!canEditItems || isLockedByOther}
              onClick={() => {
                setDraftNote(card.note);
                setIsEditing(true);
                onBroadcastEditingState({ state: "start", cardId: card.id });
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil className="size-4" />
              수정하기
            </button>
            <button
              type="button"
              disabled={!canEditItems || isLockedByOther || deleteMutation.isPending}
              onClick={handleDeleteCard}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[color:var(--color-danger)] transition-colors hover:bg-[color:var(--color-danger)]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="size-4" />
              삭제하기
            </button>
          </PopoverContent>
        </Popover>
      </div>

      <div className="p-3">
        <h4 className="mb-1 font-semibold text-[color:var(--color-ink)]">{card.name}</h4>
        <div className="mb-2 flex items-start gap-1">
          <MapPin className="mt-0.5 size-3 shrink-0 text-[color:var(--color-ink-muted)]" />
          <p className="line-clamp-2 text-xs text-[color:var(--color-ink-muted)]">{card.address}</p>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={draftNote}
              onChange={(event) => setDraftNote(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border-card-token bg-card-surface px-2 py-1.5 text-xs text-[color:var(--color-ink)] outline-none ring-0 placeholder:text-[color:var(--color-ink-muted)]"
              placeholder="메모를 입력하세요"
            />
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleCancelEditing}>
                취소
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={noteMutation.isPending}
                onClick={handleSaveNote}
              >
                {noteMutation.isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  "저장"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded px-2 py-1 text-xs text-[color:var(--color-ink-muted)] italic">
            {card.note || "메모 추가..."}
          </div>
        )}
      </div>
    </div>
  );
}
