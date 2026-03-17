"use client";

import { useEffect, useRef } from "react";
import { useWorkspaceBoardStore } from "@/store/workspace-board-store";
import { useWorkspacePresenceStore } from "@/store/workspace-presence-store";
import { useWorkspaceUiStore } from "@/store/workspace-ui-store";
import type { WorkspaceSnapshot } from "@/types/workspace";

export function useHydrateWorkspaceStores(snapshot: WorkspaceSnapshot) {
  const initializedTripIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (initializedTripIdRef.current === snapshot.trip.id) {
      return;
    }

    useWorkspaceBoardStore.getState().initializeFromSnapshot(snapshot);
    useWorkspacePresenceStore.getState().initializeFromMembers(snapshot.members);
    useWorkspaceUiStore.getState().reset();

    initializedTripIdRef.current = snapshot.trip.id;
  }, [snapshot]);
}
