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
    <div className="flex h-32 w-full items-center justify-center bg-[linear-gradient(135deg,#dbeafe_0%,#eff6ff_45%,#f8fafc_100%)]">
      <span className="text-sm font-semibold tracking-[0.2em] text-slate-500">
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
        "cursor-grab overflow-hidden rounded-lg border bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing",
        isDragging && "rotate-[1deg] shadow-lg",
        isSelected
          ? "border-blue-500 ring-2 ring-blue-100 shadow-sm"
          : "border-gray-200"
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
              className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-gray-400 shadow-sm transition-colors hover:text-gray-700"
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
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Pencil className="size-4" />
              수정하기
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="size-4" />
              삭제하기
            </button>
          </PopoverContent>
        </Popover>
      </div>

      <div className="p-3">
        <h4 className="mb-1 font-semibold text-gray-900">{card.name}</h4>
        <div className="mb-2 flex items-start gap-1">
          <MapPin className="mt-0.5 size-3 shrink-0 text-gray-400" />
          <p className="line-clamp-2 text-xs text-gray-600">{card.address}</p>
        </div>

        <div className="rounded px-2 py-1 text-xs text-gray-500 italic">
          {card.note || "메모 추가..."}
        </div>
      </div>
    </div>
  );
}
