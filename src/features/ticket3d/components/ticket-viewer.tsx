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
    <div className="grid h-full min-h-[32rem] grid-rows-[1fr_auto] gap-4">
      <TicketScene renderData={renderData} message={message} isBackVisible={isBackVisible} />
      <div className="flex items-center justify-center">
        <Button type="button" variant="outline" className="rounded-full" onClick={onToggleSide}>
          <RotateCcw className="size-4" />
          {isBackVisible ? "앞면 보기" : "뒷면 보기"}
        </Button>
      </div>
    </div>
  );
}
