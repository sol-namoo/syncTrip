"use client";

import { useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  buildPresenceUsersFromState,
  buildWorkspacePresenceKey,
  createWorkspaceRealtimeChannel,
} from "@/features/workspace/lib/realtime-channel";
import { useWorkspacePresenceStore } from "@/store/workspace-presence-store";
import type { WorkspacePresenceMeta } from "@/types/realtime";
import type { WorkspaceMember, WorkspaceRole } from "@/types/workspace";

export function useWorkspacePresence({
  tripId,
  members,
  currentUser,
  currentRole,
}: {
  tripId: string;
  members: WorkspaceMember[];
  currentUser: {
    id?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;
  currentRole: WorkspaceRole;
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
    let isCancelled = false;
    let channel: RealtimeChannel | null = null;
    let authUnsubscribe: (() => void) | null = null;

    async function connect(accessToken: string) {
      if (isCancelled || channel) {
        return;
      }

      await supabase.realtime.setAuth(accessToken);
      const nextChannel = createWorkspaceRealtimeChannel(supabase, {
        tripId,
        presenceKey,
      });
      channel = nextChannel;

      nextChannel.on("presence", { event: "sync" }, () => {
        if (isCancelled) {
          return;
        }

        const state = nextChannel.presenceState<WorkspacePresenceMeta>();
        const nextUsers = buildPresenceUsersFromState(state, members);
        setUsers(nextUsers);
      });

      nextChannel.subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || isCancelled) {
          return;
        }

        await nextChannel.track({
          userId: user.id,
          displayName: user.fullName ?? user.email ?? "Unknown",
          avatarUrl: user.avatarUrl ?? null,
          role: currentRole,
          status: "online",
          tabId,
        } satisfies WorkspacePresenceMeta);
      });
    }

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        await connect(session.access_token);
        return;
      }

      const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (nextSession?.access_token) {
          void connect(nextSession.access_token);
        }
      });

      authUnsubscribe = () => {
        data.subscription.unsubscribe();
      };
    })();

    return () => {
      isCancelled = true;
      authUnsubscribe?.();
      initializeFromMembers(members);
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [
    currentUserAvatarUrl,
    currentUserEmail,
    currentUserFullName,
    currentUserId,
    initializeFromMembers,
    members,
    setUsers,
    currentRole,
    tripId,
  ]);
}
