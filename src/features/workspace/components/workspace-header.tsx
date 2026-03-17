"use client";

import { Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
}: {
  trip: WorkspaceTrip;
  tripId: string;
  actor: WorkspaceActor;
}) {
  const saveState = useWorkspaceUiStore((state) => state.saveState);

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="flex h-[72px] items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-6">
          <div className="flex items-center gap-2">
            <Plane className="size-6 -rotate-12 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">SyncTrip</span>
          </div>
          <div className="hidden h-6 w-px bg-gray-300 md:block" />
          <p className="truncate text-xl font-semibold text-gray-900">{trip.title}</p>
          <span className="hidden text-sm text-gray-500 md:block">
            {trip.startDate} ~ {trip.endDate}
          </span>
          <span className="hidden text-xs text-gray-400 xl:block">Workspace #{tripId}</span>
        </div>

        <div className="flex items-center gap-4">
          {saveState !== "idle" ? (
            <Badge tone={SAVE_STATE_TONE[saveState]}>{SAVE_STATE_LABEL[saveState]}</Badge>
          ) : null}
          <button
            type="button"
            disabled={!actor.capabilities.canExport}
            className="hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-45 md:block"
          >
            3D 여권 발급받기
          </button>
          <button
            type="button"
            disabled={!actor.capabilities.canInvite}
            className="hidden rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45 md:block"
          >
            친구 초대
          </button>
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
