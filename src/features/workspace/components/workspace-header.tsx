"use client";

import Link from "next/link";
import { Plane } from "lucide-react";
import { AvatarStack, type AvatarStackUser } from "@/components/ui/avatar-stack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/features/auth/components/profile-menu";
import { EditTripDialog } from "@/features/workspace/components/edit-trip-dialog";
import { useWorkspaceUiStore } from "@/store/workspace-ui-store";
import type { SaveIndicatorState } from "@/types/workspace";
import type { WorkspaceActor, WorkspaceTrip } from "@/types/workspace";

const SAVE_STATE_LABEL: Record<SaveIndicatorState, string> = {
  idle: "Idle",
  saving: "Saving...",
  saved: "Saved",
  error: "Save failed",
};

const SAVE_STATE_TONE: Record<
  SaveIndicatorState,
  "neutral" | "primary" | "success" | "danger"
> = {
  idle: "neutral",
  saving: "primary",
  saved: "success",
  error: "danger",
};

export function WorkspaceHeader({
  trip,
  actor,
  collaborators,
  participantCount,
  onOpenShareModal,
}: {
  trip: WorkspaceTrip;
  actor: WorkspaceActor;
  collaborators: AvatarStackUser[];
  participantCount: number;
  onOpenShareModal: () => void;
}) {
  const saveState = useWorkspaceUiStore((state) => state.saveState);

  return (
    <section className="border-b border-black/7 bg-white">
      <div className="flex min-h-18 flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 md:px-6 xl:h-18 xl:flex-nowrap xl:py-0">
        <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6">
          <Link href="/trips" className="flex items-center gap-2">
            <Plane className="size-6 -rotate-12 text-primary" />
            <span className="text-xl font-bold text-foreground">SyncTrip</span>
          </Link>
          <div className="hidden h-6 w-px bg-line-token md:block" />
          <div className="min-w-0 xl:flex xl:min-w-0 xl:items-center xl:gap-5">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="truncate text-lg font-semibold text-foreground md:text-xl">{trip.title}</p>
              {actor.capabilities.canManageTrip ? (
                <EditTripDialog trip={trip} disabled={!actor.capabilities.canManageTrip} />
              ) : null}
            </div>
            <span className="block text-sm text-muted-foreground xl:truncate">
              {trip.startDate} ~ {trip.endDate}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {saveState !== "idle" ? (
            <Badge tone={SAVE_STATE_TONE[saveState]}>{SAVE_STATE_LABEL[saveState]}</Badge>
          ) : null}
          {participantCount > 0 ? (
            <>
              <Badge
                variant="online"
                className="hidden shrink-0 whitespace-nowrap gap-2 border-[0.5px] px-3 py-1 text-[11px] font-semibold md:inline-flex"
                style={{
                  background: "rgba(37,99,235,0.10)",
                  borderColor: "rgba(37,99,235,0.20)",
                }}
              >
                <span className="size-1.5 rounded-full bg-[color:var(--color-online)] animate-[pulse_2s_ease-in-out_infinite]" />
                <span className="lg:hidden">{participantCount}명</span>
                <span className="hidden lg:inline">{participantCount}명 편집 중</span>
              </Badge>
              {collaborators.length > 0 ? (
                <AvatarStack
                  users={collaborators}
                  size="sm"
                  max={3}
                  className="shrink-0"
                />
              ) : null}
            </>
          ) : null}
          <Button
            type="button"
            variant="outline"
            disabled={!actor.capabilities.canExport}
            className="hidden rounded-full md:inline-flex lg:hidden"
            onClick={onOpenShareModal}
          >
            3D
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!actor.capabilities.canExport}
            className="hidden rounded-full lg:inline-flex"
            onClick={onOpenShareModal}
          >
            티켓 공유하기
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!actor.capabilities.canInvite}
            className="hidden rounded-full md:inline-flex lg:hidden"
          >
            초대
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!actor.capabilities.canInvite}
            className="hidden rounded-full lg:inline-flex"
          >
            친구 초대
          </Button>
          {actor.user ? (
            <ProfileMenu
              email={actor.user.email}
              fullName={actor.user.fullName}
              avatarUrl={actor.user.avatarUrl}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
