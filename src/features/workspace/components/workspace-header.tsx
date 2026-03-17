"use client";

import { Plane } from "lucide-react";
import { ProfileMenu } from "@/features/auth/components/profile-menu";
import type { WorkspaceTrip } from "@/types/workspace";

export function WorkspaceHeader({
  trip,
  tripId,
  user,
}: {
  trip: WorkspaceTrip;
  tripId: string;
  user: {
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;
}) {
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
          <button
            type="button"
            className="hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:from-blue-700 hover:to-purple-700 md:block"
          >
            3D 여권 발급받기
          </button>
          <button
            type="button"
            className="hidden rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 md:block"
          >
            친구 초대
          </button>
          {user ? (
            <ProfileMenu
              email={user.email}
              fullName={user.fullName}
              avatarUrl={user.avatarUrl}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
