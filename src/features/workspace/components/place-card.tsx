"use client";

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { MapPin, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useWorkspaceUiStore } from "@/store/workspace-ui-store";
import type { TripPlaceCard } from "@/types/workspace";

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
  cardRef,
}: {
  card: TripPlaceCard;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isDragging?: boolean;
  cardRef?: (element: HTMLDivElement | null) => void;
}) {
  const selectedCardId = useWorkspaceUiStore((state) => state.selectedCardId);
  const setSelectedCardId = useWorkspaceUiStore((state) => state.setSelectedCardId);

  const isSelected = selectedCardId === card.id;

  return (
    <div
      ref={cardRef}
      {...dragHandleProps}
      onClick={() => setSelectedCardId(card.id)}
      className={cn(
        "select-none cursor-grab overflow-hidden rounded-2xl border border-[color:var(--color-border-card-subtle)] bg-[color:var(--color-bg-card)] text-left shadow-[0_2px_8px_var(--color-shadow-card)] transition-all duration-150 hover:border-[color:var(--color-border-card-hover)] hover:shadow-[0_4px_14px_var(--color-shadow-card-hover)] active:cursor-grabbing",
        isDragging &&
          "z-50 rotate-[1.5deg] scale-[1.02] border-2 border-[color:var(--color-primary)] opacity-90 shadow-[0_8px_24px_var(--color-shadow-card-hover)]",
        isSelected
          ? "ring-2 ring-[color:var(--color-primary)]/25"
          : ""
      )}
    >
      <div className="relative">
        <CardImage imageUrl={card.imageUrl} name={card.name} />
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
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--accent)]"
            >
              <Pencil className="size-4" />
              수정하기
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[color:var(--color-danger)] transition-colors hover:bg-[color:var(--color-danger)]/10"
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

        <div className="rounded px-2 py-1 text-xs text-[color:var(--color-ink-muted)] italic">
          {card.note || "메모 추가..."}
        </div>
      </div>
    </div>
  );
}
