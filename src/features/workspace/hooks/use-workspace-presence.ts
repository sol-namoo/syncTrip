"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  buildPresenceUsersFromState,
  buildWorkspacePresenceKey,
  createWorkspaceRealtimeChannel,
} from "@/features/workspace/lib/realtime-channel";
import { useWorkspacePresenceStore } from "@/store/workspace-presence-store";
import type { WorkspacePresenceMeta } from "@/types/realtime";
import type { WorkspaceMember } from "@/types/workspace";

export function useWorkspacePresence({
  tripId,
  members,
  currentUser,
}: {
  tripId: string;
  members: WorkspaceMember[];
  currentUser: {
    id?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;
}) {
  const setUsers = useWorkspacePresenceStore((state) => state.setUsers);
  const initializeFromMembers = useWorkspacePresenceStore(
    (state) => state.initializeFromMembers
  );
  const currentUserId = currentUser?.id;
  const currentUserEmail = currentUser?.email;
  const currentUserFullName = currentUser?.fullName;
  const currentUserAvatarUrl = currentUser?.avatarUrl;

  useEffect(() => {
    initializeFromMembers(members);

    if (!currentUserId) {
      return;
    }

    const user = {
      id: currentUserId,
      email: currentUserEmail,
      fullName: currentUserFullName,
      avatarUrl: currentUserAvatarUrl,
    };
    const supabase = createClient();
    const tabId = crypto.randomUUID();
    const presenceKey = buildWorkspacePresenceKey(user.id, tabId);
    const channel = createWorkspaceRealtimeChannel(supabase, {
      tripId,
      presenceKey,
    });

    let isCancelled = false;

    async function connect() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        await supabase.realtime.setAuth(session.access_token);
      }

      channel.on("presence", { event: "sync" }, () => {
        if (isCancelled) {
          return;
        }

        const state = channel.presenceState<WorkspacePresenceMeta>();
        const nextUsers = buildPresenceUsersFromState(state, members);
        setUsers(nextUsers);
      });

      channel.subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || isCancelled) {
          return;
        }

        await channel.track({
          userId: user.id,
          displayName: user.fullName ?? user.email ?? "Unknown",
          avatarUrl: user.avatarUrl ?? null,
          colorKey: user.id,
          status: "online",
          tabId,
        });
      });
    }

    void connect();

    return () => {
      isCancelled = true;
      initializeFromMembers(members);
      void supabase.removeChannel(channel);
    };
  }, [
    currentUserAvatarUrl,
    currentUserEmail,
    currentUserFullName,
    currentUserId,
    initializeFromMembers,
    members,
    setUsers,
    tripId,
  ]);
}
