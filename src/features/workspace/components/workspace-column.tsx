"use client";

import { Plus, Search } from "lucide-react";
import { PlaceCard } from "@/features/workspace/components/place-card";
import type { BoardColumnEntity, BoardCardEntity } from "@/types/workspace";

export function WorkspaceColumn({
  column,
  cards,
}: {
  column: BoardColumnEntity;
  cards: BoardCardEntity[];
}) {
  const isBucket = column.id === "bucket";

  return (
    <div className="flex h-full w-80 shrink-0 flex-col rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{column.title}</h3>
          {column.dateLabel ? (
            <span className="text-sm text-gray-500">{column.dateLabel}</span>
          ) : null}
        </div>

        {isBucket ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <div className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-400">
              장소 검색...
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {cards.map((card) => (
          <PlaceCard key={card.id} card={card} />
        ))}

        {cards.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            {isBucket ? "장소를 검색해보세요" : "장소를 드래그해서 추가하세요"}
          </div>
        ) : null}
      </div>

      {isBucket ? (
        <div className="border-t border-gray-200 p-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-2 text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-600"
          >
            <Plus className="size-4" />
            장소 추가
          </button>
        </div>
      ) : null}
    </div>
  );
}
