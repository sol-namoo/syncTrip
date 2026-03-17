"use client";

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { MapPin, MoreVertical, Trash2 } from "lucide-react";
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
}: {
  card: TripPlaceCard;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isDragging?: boolean;
}) {
  const selectedCardId = useWorkspaceUiStore((state) => state.selectedCardId);
  const setSelectedCardId = useWorkspaceUiStore((state) => state.setSelectedCardId);

  const isSelected = selectedCardId === card.id;

  return (
    <div
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

        <div className="mt-2 flex justify-end">
          <span className="rounded p-1.5 text-gray-400">
            <Trash2 className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
