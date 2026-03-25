"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketScene } from "@/features/ticket3d/components/ticket-scene";
import type { PublicTicketPageData } from "@/types/ticket";

export function PublicTicketView({ data }: { data: PublicTicketPageData }) {
  const [isBackVisible, setIsBackVisible] = useState(false);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fbff_0%,#eef4fb_38%,#f7f9fc_100%)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8">
        <div className="w-full max-w-3xl rounded-[28px] border border-border-card-token bg-card-surface/90 px-6 py-5 shadow-sm backdrop-blur">
          <p className="text-sm text-muted-foreground">SyncTrip shared ticket</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">{data.render.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.render.startDate} ~ {data.render.endDate}
          </p>
        </div>

        <div className="w-full max-w-4xl rounded-[32px] border border-border-card-token bg-card-surface/70 px-6 py-8 shadow-[0_24px_80px_rgba(37,99,235,0.08)] backdrop-blur">
          <div className="relative">
            <div className="absolute right-0 top-0 z-10">
              <Button
                type="button"
                variant="outline"
                className="rounded-full bg-card-surface/90 backdrop-blur"
                onClick={() => setIsBackVisible((value) => !value)}
              >
                <RotateCcw className="size-4" />
                {isBackVisible ? "앞면 보기" : "뒷면 보기"}
              </Button>
            </div>
            <TicketScene
              renderData={data.render}
              message={data.share.message}
              isBackVisible={isBackVisible}
            />
          </div>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Button asChild type="button" variant="primary" className="rounded-full">
              <Link href={`/share/${data.share.share_code}/itinerary`}>
                여행 일정 보기
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
