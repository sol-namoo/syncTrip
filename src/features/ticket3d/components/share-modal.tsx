"use client";

import { useMemo, useState } from "react";
import { Copy, Link2, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useTripShareSettingsQuery } from "@/features/share/hooks/use-trip-share-settings-query";
import { useUpsertTripShareSettingsMutation } from "@/features/share/hooks/use-upsert-trip-share-settings-mutation";
import { TicketViewer } from "@/features/ticket3d/components/ticket-viewer";
import { buildShareUrl, getPublicAppUrl } from "@/lib/app-url";
import { cn } from "@/lib/utils";
import type { TicketRenderData } from "@/types/ticket";
import type { WorkspaceActor, WorkspaceTrip } from "@/types/workspace";

export function ShareTicketModal({
  open,
  onOpenChange,
  trip,
  actor,
  renderData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: WorkspaceTrip;
  actor: WorkspaceActor;
  renderData: TicketRenderData;
}) {
  const [isBackVisible, setIsBackVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [hasEditedMessage, setHasEditedMessage] = useState(false);
  const [localShareCode, setLocalShareCode] = useState<string | undefined>(renderData.shareCode);
  const shareSettingsQuery = useTripShareSettingsQuery(trip.id, open);
  const upsertShareSettingsMutation = useUpsertTripShareSettingsMutation();
  const isLoadingInitialMessage =
    open &&
    shareSettingsQuery.isLoading &&
    !hasEditedMessage &&
    !shareSettingsQuery.data;
  const resolvedMessage = hasEditedMessage
    ? message
    : (shareSettingsQuery.data?.message ?? message);
  const resolvedShareCode = localShareCode ?? shareSettingsQuery.data?.share_code ?? renderData.shareCode;

  const previewLink = useMemo(() => {
    return `${getPublicAppUrl()}/share/${resolvedShareCode ?? "draft"}`;
  }, [resolvedShareCode]);

  const effectiveRenderData = useMemo(
    () => ({
      ...renderData,
      shareCode: resolvedShareCode,
      authorMessage: resolvedMessage || null,
      sharedByName: actor.user?.fullName ?? renderData.sharedByName,
    }),
    [actor.user?.fullName, renderData, resolvedMessage, resolvedShareCode]
  );

  async function persistShareSettings(): Promise<string> {
    const saved = await upsertShareSettingsMutation.mutateAsync({
      tripId: trip.id,
      message: resolvedMessage.trim(),
      shareCode: resolvedShareCode,
    });

    setLocalShareCode(saved.share_code);
    setMessage(saved.message);
    setHasEditedMessage(false);
    return saved.share_code;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[min(96vw,72rem)] max-w-none overflow-hidden rounded-[28px] p-0 sm:max-w-none">
        <div className="grid max-h-[90vh] grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,26rem)]">
          <section className="min-h-[30rem] bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] p-6 lg:p-8">
            <DialogHeader className="mb-5 text-left">
              <DialogTitle className="text-2xl font-semibold text-foreground">
                3D 티켓 공유하기
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-muted-foreground">
                여행 티켓 앞면과 뒷면 메모를 미리 확인하고, 링크를 생성할 준비를 합니다.
              </DialogDescription>
            </DialogHeader>
            <TicketViewer
              renderData={effectiveRenderData}
              message={resolvedMessage}
              isBackVisible={isBackVisible}
              onToggleSide={() => setIsBackVisible((value) => !value)}
            />
          </section>

          <aside className="flex min-h-[30rem] flex-col border-t border-line-token bg-card-surface lg:border-l lg:border-t-0">
            <div className="border-b border-line-token px-6 py-5">
              <h3 className="text-lg font-semibold text-foreground">Share Ticket</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                링크를 공유받은 사람은 일정 보기만 가능합니다. 메모를 적어 두면 공유받은 사람이 뒷면에서 확인할 수 있습니다.
              </p>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div className="rounded-3xl border border-border-card-token bg-surface-muted-token p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  여행 정보
                </p>
                <div className="mt-3 space-y-2">
                  <p className="text-lg font-semibold text-foreground">{trip.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.startDate} ~ {trip.endDate}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {renderData.destinationLabel} · {renderData.participantCount}명
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <MessageSquareText className="size-4 text-primary" />
                  티켓 뒷면 메모
                </label>
                <textarea
                  value={resolvedMessage}
                  onChange={(event) => {
                    setHasEditedMessage(true);
                    setMessage(event.target.value);
                  }}
                  rows={8}
                  disabled={isLoadingInitialMessage}
                  placeholder={
                    isLoadingInitialMessage
                      ? "기존 메모를 불러오는 중..."
                      : "티켓 뒷면에 함께 여행할 사람에게 남길 메모를 적어보세요."
                  }
                  className={cn(
                    "w-full resize-none rounded-3xl border border-border-card-token bg-card-surface px-4 py-3 text-sm leading-6 text-foreground outline-none transition-colors",
                    "placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10",
                    isLoadingInitialMessage ? "cursor-wait opacity-70" : ""
                  )}
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  메모는 링크 복사 또는 수신자 미리보기 직전에 저장됩니다. 여행당 하나의 티켓 메모와 링크를 유지합니다.
                </p>
              </div>

              <div className="space-y-3">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <Link2 className="size-4 text-primary" />
                  공유 링크 프리뷰
                </label>
                <div className="rounded-2xl border border-border-card-token bg-surface-muted-token px-4 py-3 text-sm text-muted-foreground">
                  {previewLink}
                </div>
              </div>
            </div>

            <div className="border-t border-line-token px-6 py-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="primary"
                  className="flex-1 rounded-full"
                  onClick={async () => {
                    try {
                      const shareCode = await persistShareSettings();
                      const link = buildShareUrl(shareCode);
                      await navigator.clipboard.writeText(link);
                      toast.success("공유 링크를 복사했습니다.");
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "공유 링크 생성에 실패했습니다."
                      );
                    }
                  }}
                  disabled={upsertShareSettingsMutation.isPending || shareSettingsQuery.isLoading}
                >
                  {upsertShareSettingsMutation.isPending ? (
                    <Spinner className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  링크 생성
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={async () => {
                    try {
                      const shareCode = await persistShareSettings();
                      window.open(
                        buildShareUrl(shareCode),
                        "_blank",
                        "noopener,noreferrer"
                      );
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : "미리보기를 열지 못했습니다."
                      );
                    }
                  }}
                  disabled={upsertShareSettingsMutation.isPending || shareSettingsQuery.isLoading}
                >
                  수신자 미리보기
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
