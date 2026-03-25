"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketScene } from "@/features/ticket3d/components/ticket-scene";
import type { TicketRenderData } from "@/types/ticket";

export function TicketViewer({
  renderData,
  message,
  isBackVisible,
  onToggleSide,
}: {
  renderData: TicketRenderData;
  message: string;
  isBackVisible: boolean;
  onToggleSide: () => void;
}) {
  return (
    <div className="relative h-full min-h-[32rem]">
      <div className="absolute right-4 top-4 z-10">
        <Button type="button" variant="outline" className="rounded-full bg-card-surface/90 backdrop-blur" onClick={onToggleSide}>
          <RotateCcw className="size-4" />
          {isBackVisible ? "앞면 보기" : "뒷면 보기"}
        </Button>
      </div>
      <TicketScene renderData={renderData} message={message} isBackVisible={isBackVisible} />
    </div>
  );
}
