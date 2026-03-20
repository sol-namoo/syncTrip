"use client";

import Link from "next/link";
import { Plane } from "lucide-react";
import { AvatarStack, type AvatarStackUser } from "@/components/ui/avatar-stack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/features/auth/components/profile-menu";
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
  tripId,
  actor,
  collaborators,
}: {
  trip: WorkspaceTrip;
  tripId: string;
  actor: WorkspaceActor;
  collaborators: AvatarStackUser[];
}) {
  const saveState = useWorkspaceUiStore((state) => state.saveState);

  return (
    <section className="border-b border-black/7 bg-white">
      <div className="flex h-18 items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/trips" className="flex items-center gap-2">
            <Plane className="size-6 -rotate-12 text-[color:var(--color-primary)]" />
            <span className="text-xl font-bold text-[color:var(--foreground)]">SyncTrip</span>
          </Link>
          <div className="hidden h-6 w-px bg-[color:var(--line)] md:block" />
          <p className="truncate text-xl font-semibold text-[color:var(--foreground)]">{trip.title}</p>
          <span className="hidden text-sm text-[color:var(--muted-foreground)] md:block">
            {trip.startDate} ~ {trip.endDate}
          </span>
          <span className="hidden text-xs text-[color:var(--muted-foreground)]/80 xl:block">Workspace #{tripId}</span>
        </div>

        <div className="flex items-center gap-4">
          {saveState !== "idle" ? (
            <Badge tone={SAVE_STATE_TONE[saveState]}>{SAVE_STATE_LABEL[saveState]}</Badge>
          ) : null}
          {collaborators.length > 0 ? (
            <>
              <Badge
                variant="online"
                className="hidden gap-2 border-[0.5px] px-3 py-1 text-[11px] font-semibold md:inline-flex"
                style={{
                  background: "rgba(37,99,235,0.10)",
                  borderColor: "rgba(37,99,235,0.20)",
                }}
              >
                <span className="size-1.5 rounded-full bg-[color:var(--color-online)] animate-[pulse_2s_ease-in-out_infinite]" />
                {collaborators.length}명 편집 중
              </Badge>
              <AvatarStack users={collaborators} size="sm" max={3} className="hidden md:flex" />
            </>
          ) : null}
          <Button
            type="button"
            variant="outline"
            disabled={!actor.capabilities.canExport}
            className="hidden rounded-full md:inline-flex"
          >
            3D 여권 발급받기
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!actor.capabilities.canInvite}
            className="hidden rounded-full md:inline-flex"
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
