"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { TicketRenderData } from "@/types/ticket";

const PAPER_GRAIN_DATA_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='600'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='600' filter='url(%23g)'/%3E%3C/svg%3E\")";

function getStampTextSize(label: string): string {
  const compactLength = label.replace(/\s+/g, "").length;

  if (compactLength <= 4) {
    return "12px";
  }

  if (compactLength <= 8) {
    return "10px";
  }

  if (compactLength <= 12) {
    return "8.5px";
  }

  return "7.5px";
}

export function TicketScene({
  renderData,
  message,
  isBackVisible,
}: {
  renderData: TicketRenderData;
  message: string;
  isBackVisible: boolean;
}) {
  const [tilt, setTilt] = useState({ x: -8, y: 14 });

  const transformStyle = useMemo(
    () => ({
      transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
    }),
    [tilt.x, tilt.y]
  );

  const formattedIssuedAt = useMemo(() => {
    return new Date(renderData.issuedAt).toLocaleDateString("ko-KR");
  }, [renderData.issuedAt]);

  const formattedStartDate = useMemo(() => {
    if (!renderData.startDate) {
      return "-";
    }

    const [year, month, day] = renderData.startDate.split("-");
    return `${year}\n${month}.${day}`;
  }, [renderData.startDate]);

  const formattedEndDate = useMemo(() => {
    if (!renderData.endDate) {
      return "-";
    }

    const [year, month, day] = renderData.endDate.split("-");
    return `${year}\n${month}.${day}`;
  }, [renderData.endDate]);

  const barcodeBars = useMemo(() => {
    return [2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 1, 2, 3, 1, 1, 2];
  }, []);

  const routeLabel = useMemo(() => {
    const stops = renderData.routeStops.filter(Boolean);

    if (stops.length === 0) {
      return renderData.destinationCode;
    }

    if (stops.length === 1) {
      return `• → ${stops[0]}`;
    }

    if (stops.length <= 3) {
      return stops.join(" → ");
    }

    return `${stops[0]} → … → ${stops[stops.length - 1]}`;
  }, [renderData.destinationCode, renderData.routeStops]);

  return (
    <div className="flex h-full min-h-[24rem] items-center justify-center rounded-[28px] border border-border-card-token bg-[#f0ebe0] p-6">
      <div className="relative [perspective:1600px]">
        <div
          className="relative h-[35rem] w-[20.5rem] cursor-grab transition-transform duration-300 active:cursor-grabbing"
          style={transformStyle}
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const xRatio = (event.clientX - rect.left) / rect.width - 0.5;
            const yRatio = (event.clientY - rect.top) / rect.height - 0.5;
            setTilt({
              x: -(yRatio * 18),
              y: xRatio * 26,
            });
          }}
          onPointerLeave={() => {
            setTilt({ x: -8, y: 14 });
          }}
        >
          <div
            className={cn(
              "absolute inset-0 overflow-hidden rounded-[12px] border-[1.5px] border-[#d4b483] bg-[#faf5eb] shadow-[0_20px_40px_rgba(90,60,20,0.25),0_4px_8px_rgba(90,60,20,0.15)] transition-transform duration-500 [backface-visibility:hidden]",
              isBackVisible ? "[transform:rotateY(180deg)]" : ""
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: PAPER_GRAIN_DATA_URL }}
            />

            <div className="relative z-[1] flex h-full flex-col text-[#3a2a0e]">
              <div className="relative h-40 overflow-hidden">
                {renderData.coverImageUrl ? (
                  <Image
                    src={renderData.coverImageUrl}
                    alt={renderData.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full bg-[linear-gradient(135deg,#d8c5a6_0%,#b08a56_100%)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(240,230,200,0.08)_0%,rgba(240,230,200,0.55)_70%,rgba(250,245,235,1)_100%)]" />
                <div className="absolute left-3.5 top-2.5 rounded bg-[rgba(140,90,20,0.55)] px-2 py-[3px] text-[9px] font-medium tracking-[0.12em] text-white/92 uppercase backdrop-blur-[4px]">
                  ✦ SyncTrip
                </div>
                <div className="absolute right-3.5 top-3.5 flex h-[52px] w-[52px] rotate-[12deg] flex-col items-center justify-center rounded-full border-[2.5px] border-dashed border-[rgba(180,120,40,0.7)] bg-[rgba(250,245,235,0.15)] backdrop-blur-[2px]">
                  <span
                    className="max-w-[38px] text-center font-mono leading-[1.05] font-semibold break-keep text-[rgba(160,100,30,0.9)]"
                    style={{ fontSize: getStampTextSize(renderData.stampLabel) }}
                  >
                    {renderData.stampLabel}
                  </span>
                </div>
              </div>

              <div className="px-[18px] pt-1">
                <div className="mb-2.5 min-w-0">
                  <div className="line-clamp-2 font-['Playfair_Display','Noto_Sans_KR',serif] text-[20px] leading-[1.15] font-black tracking-[-0.02em]">
                    {renderData.title}
                  </div>
                  <div className="mt-1 line-clamp-2 text-[10.5px] leading-[1.45] text-[#9a7340]">
                    {renderData.destinationLabel}
                  </div>
                </div>

                <div className="mb-3 rounded-lg border border-[#d4b483] bg-[rgba(212,180,131,0.12)] px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-[repeating-linear-gradient(90deg,#b08040_0,#b08040_3px,transparent_3px,transparent_6px)]" />
                    <div className="text-[10px] leading-none text-[#9a7340]">↦</div>
                    <div className="h-px flex-1 bg-[repeating-linear-gradient(90deg,#b08040_0,#b08040_3px,transparent_3px,transparent_6px)]" />
                  </div>
                  <div className="mt-2 truncate text-center font-mono text-[12px] leading-none font-semibold tracking-[0.03em]">
                    {routeLabel}
                  </div>
                </div>

                <div className="mb-3 grid grid-cols-3 overflow-hidden rounded-lg border border-[#d4b483]">
                  <div className="border-r border-[#d4b483] bg-[rgba(212,180,131,0.08)] px-2.5 py-2">
                    <div className="mb-1 font-mono text-[7.5px] uppercase tracking-[0.1em] text-[#b08040]">
                      Depart
                    </div>
                    <div className="font-mono text-[10.5px] leading-[1.3] font-medium whitespace-pre-line">
                      {formattedStartDate}
                    </div>
                  </div>
                  <div className="border-r border-[#d4b483] bg-[rgba(212,180,131,0.08)] px-2.5 py-2">
                    <div className="mb-1 font-mono text-[7.5px] uppercase tracking-[0.1em] text-[#b08040]">
                      Return
                    </div>
                    <div className="font-mono text-[10.5px] leading-[1.3] font-medium whitespace-pre-line">
                      {formattedEndDate}
                    </div>
                  </div>
                  <div className="bg-[rgba(212,180,131,0.08)] px-2.5 py-2">
                    <div className="mb-1 font-mono text-[7.5px] uppercase tracking-[0.1em] text-[#b08040]">
                      Travelers
                    </div>
                    <div className="font-mono text-[10.5px] leading-[1.3] font-medium">
                      {renderData.participantCount}명
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-auto">
                <div className="relative mx-0 mb-0 mt-0 h-[22px]">
                  <div className="absolute left-3.5 right-3.5 top-1/2 h-0 border-t-[1.5px] border-dashed border-[#c9a55a]" />
                  <div className="absolute left-[-12px] top-1/2 h-[22px] w-[22px] -translate-y-1/2 rounded-full border-[1.5px] border-[#c9a55a] bg-[#f0ebe0]" />
                  <div className="absolute right-[-12px] top-1/2 h-[22px] w-[22px] -translate-y-1/2 rounded-full border-[1.5px] border-[#c9a55a] bg-[#f0ebe0]" />
                </div>

                <div className="bg-[rgba(212,180,131,0.07)] px-[18px] pb-4 pt-2.5">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="line-clamp-3 font-['Playfair_Display','Noto_Sans_KR',serif] text-[12px] font-bold italic leading-[1.45] text-[#6b4c1e]">
                      {renderData.destinationLabel}
                    </span>
                    <span className="shrink-0 font-mono text-[9px] tracking-[0.08em] text-[#b08040]">
                      CODE · {renderData.shareCode ?? "DRAFT"}
                    </span>
                  </div>

                  <div className="mb-[5px] flex h-8 items-end gap-0.5">
                    {barcodeBars.map((width, index) => (
                      <span
                        key={`${width}-${index}`}
                        className="bg-[#6b4c1e]"
                        style={{
                          width: `${width}px`,
                          height: `${index % 3 === 0 ? 30 : index % 2 === 0 ? 26 : 20}px`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="font-mono text-[8px] tracking-[0.12em] text-[#b08040]">
                    {renderData.shareCode ?? "1234 5678 9012 3456"}
                  </div>

                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <span className="rounded border border-[#d4b483] px-2 py-[3px] font-mono text-[8px] uppercase tracking-[0.1em] text-[#b08040]">
                      Ticket Share
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.05em] text-[#7a5820]">
                      ISSUED {formattedIssuedAt}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "absolute inset-0 rounded-[12px] border-[1.5px] border-[#d4b483] bg-[#faf5eb] shadow-[0_20px_40px_rgba(90,60,20,0.2),0_4px_8px_rgba(90,60,20,0.12)] transition-transform duration-500 [backface-visibility:hidden] [transform:rotateY(180deg)]",
              isBackVisible ? "[transform:rotateY(360deg)]" : ""
            )}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{ backgroundImage: PAPER_GRAIN_DATA_URL }}
            />
            <div className="relative z-[1] flex h-full flex-col p-6 text-foreground">
              <div className="border-b border-[#d4b483] pb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a7340]">
                  Ticket Back
                </p>
                <h3 className="mt-2 font-['Playfair_Display','Noto_Sans_KR',serif] text-[26px] font-bold text-[#3a2a0e]">
                  {renderData.title}
                </h3>
              </div>
              <div className="mt-5 flex-1 rounded-[24px] border border-dashed border-[#d4b483] bg-[rgba(212,180,131,0.08)] p-5">
                {message.trim() ? (
                  <p className="text-sm leading-7 text-[#6b4c1e] whitespace-pre-wrap">
                    {message.trim()}
                  </p>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[18px] border border-[rgba(212,180,131,0.32)] bg-[rgba(250,245,235,0.4)] px-6 text-center">
                    <p className="text-xs leading-6 text-[#9a7340]">
                      메모를 입력하면 티켓 뒷면에 어떻게 보이는지
                      <br />
                      여기에서 미리 확인할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-[#9a7340]">
                <span>{renderData.sharedByName ? `${renderData.sharedByName}가 공유함` : "SyncTrip Share"}</span>
                <span>{formattedIssuedAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
