"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  buildPresenceUsersFromState,
  buildWorkspacePresenceKey,
  createWorkspaceRealtimeChannel,
} from "@/features/workspace/lib/realtime-channel";
import { useWorkspaceUiStore } from "@/store/workspace-ui-store";
import { useWorkspacePresenceStore } from "@/store/workspace-presence-store";
import type {
  WorkspaceDragBroadcastPayload,
  WorkspaceEditingBroadcastPayload,
  WorkspacePresenceMeta,
  WorkspaceTargetBroadcastPayload,
} from "@/types/realtime";
import type {
  BoardColumnId,
  WorkspaceMember,
  WorkspaceRole,
} from "@/types/workspace";

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
  const initializeFromMembers = useWorkspacePresenceStore(
    (state) => state.initializeFromMembers
  );
  const currentUserId = currentUser?.id;
  const currentUserEmail = currentUser?.email;
  const currentUserFullName = currentUser?.fullName;
  const currentUserAvatarUrl = currentUser?.avatarUrl;
  const selectedCardId = useWorkspaceUiStore((state) => state.selectedCardId);
  const selectedColumnId = useWorkspaceUiStore((state) => state.selectedColumnId);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const membersRef = useRef(members);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const currentTarget = useMemo(() => {
    if (selectedCardId) {
      return { kind: "card" as const, id: selectedCardId };
    }

    if (selectedColumnId) {
      return { kind: "column" as const, id: selectedColumnId };
    }

    return { kind: "none" as const };
  }, [selectedCardId, selectedColumnId]);

  useEffect(() => {
    membersRef.current = members;
    initializeFromMembers(members);
  }, [initializeFromMembers, members]);

  useEffect(() => {
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
    let authUnsubscribe: (() => void) | null = null;

    async function connect(accessToken: string) {
      if (isCancelled || channelRef.current) {
        return;
      }

      await supabase.realtime.setAuth(accessToken);
      const nextChannel = createWorkspaceRealtimeChannel(supabase, {
        tripId,
        presenceKey,
      });
      channelRef.current = nextChannel;

      nextChannel.on("presence", { event: "sync" }, () => {
        if (isCancelled) {
          return;
        }

        const state = nextChannel.presenceState<WorkspacePresenceMeta>();
        const nextUsers = buildPresenceUsersFromState(state, membersRef.current);
        const store = useWorkspacePresenceStore.getState();
        store.setUsers(nextUsers);
        store.pruneCardLocksToUsers(
          nextUsers
            .filter((user) => user.status !== "offline")
            .map((user) => user.userId)
        );
      });

      nextChannel
        .on("broadcast", { event: "target" }, ({ payload }) => {
          const message = payload as WorkspaceTargetBroadcastPayload;
          if (message.userId === currentUserId) {
            return;
          }

          useWorkspacePresenceStore.getState().setActiveTarget(
            message.userId,
            message.target
          );
        })
        .on("broadcast", { event: "drag" }, ({ payload }) => {
          const message = payload as WorkspaceDragBroadcastPayload;
          if (message.userId === currentUserId) {
            return;
          }

          useWorkspacePresenceStore.getState().setCardLock(
            message.itemId,
            message.state === "end"
              ? null
              : {
                  userId: message.userId,
                  kind: "dragging",
                }
          );
        })
        .on("broadcast", { event: "editing" }, ({ payload }) => {
          const message = payload as WorkspaceEditingBroadcastPayload;
          if (message.userId === currentUserId) {
            return;
          }

          useWorkspacePresenceStore.getState().setCardLock(
            message.cardId,
            message.state === "end"
              ? null
              : {
                  userId: message.userId,
                  kind: "editing",
                }
          );
        });

      nextChannel.subscribe(async (status) => {
        if (isCancelled) {
          return;
        }

        if (status !== "SUBSCRIBED") {
          return;
        }

        setIsSubscribed(true);

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
      setIsSubscribed(false);
      useWorkspacePresenceStore.getState().reset();
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [
    currentRole,
    currentUserAvatarUrl,
    currentUserEmail,
    currentUserFullName,
    currentUserId,
    tripId,
  ]);

  useEffect(() => {
    if (!currentUserId || !isSubscribed || !channelRef.current) {
      return;
    }

    void channelRef.current.send({
      type: "broadcast",
      event: "target",
      payload: {
        type: "target",
        userId: currentUserId,
        target: currentTarget,
      } satisfies WorkspaceTargetBroadcastPayload,
    });
  }, [currentTarget, currentUserId, isSubscribed]);

  const broadcastDragState = useCallback((args: {
    state: "start" | "end";
    itemId: string;
    columnId: BoardColumnId | null;
  }) => {
    if (!currentUserId || !channelRef.current) {
      return;
    }

    void channelRef.current.send({
      type: "broadcast",
      event: "drag",
      payload: {
        type: "drag",
        userId: currentUserId,
        state: args.state,
        itemId: args.itemId,
        columnId: args.columnId,
      } satisfies WorkspaceDragBroadcastPayload,
    });
  }, [currentUserId]);

  const broadcastEditingState = useCallback((args: {
    state: "start" | "end";
    cardId: string;
  }) => {
    if (!currentUserId || !channelRef.current) {
      return;
    }

    void channelRef.current.send({
      type: "broadcast",
      event: "editing",
      payload: {
        type: "editing",
        userId: currentUserId,
        state: args.state,
        cardId: args.cardId,
      } satisfies WorkspaceEditingBroadcastPayload,
    });
  }, [currentUserId]);

  return {
    broadcastDragState,
    broadcastEditingState,
  };
}
