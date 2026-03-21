import { create } from "zustand";
import type {
  ActiveTargetMap,
  ActiveTargetState,
  DraggingPresenceMap,
  DraggingPresenceState,
  EditingPresenceMap,
  PresenceUser,
  RemoteCursor,
  WorkspaceMember,
} from "@/types/workspace";

type WorkspacePresenceState = {
  users: PresenceUser[];
  cursorsByUserId: Record<string, RemoteCursor>;
  activeTargetsByUserId: ActiveTargetMap;
  draggingByUserId: DraggingPresenceMap;
  editingByCardId: EditingPresenceMap;
  initializeFromMembers: (members: WorkspaceMember[]) => void;
  setUsers: (users: PresenceUser[]) => void;
  setActiveTarget: (userId: string, target: ActiveTargetState | null) => void;
  setDraggingState: (userId: string, dragging: DraggingPresenceState | null) => void;
  upsertCursor: (cursor: RemoteCursor) => void;
  removeCursor: (userId: string) => void;
  setEditingUser: (cardId: string, userId: string | null) => void;
  clearEditingUser: (userId: string) => void;
  reset: () => void;
};

export const useWorkspacePresenceStore = create<WorkspacePresenceState>((set) => ({
  users: [],
  cursorsByUserId: {},
  activeTargetsByUserId: {},
  draggingByUserId: {},
  editingByCardId: {},
  initializeFromMembers: (members) => {
    set({
      users: members.map((member) => ({
        userId: member.userId,
        role: member.role as PresenceUser["role"],
        status: "offline",
        displayName: member.userId,
        avatarUrl: null,
      })),
    });
  },
  setUsers: (users) => {
    set({ users });
  },
  setActiveTarget: (userId, target) => {
    set((state) => {
      const next = { ...state.activeTargetsByUserId };

      if (!target || target.kind === "none") {
        delete next[userId];
      } else {
        next[userId] = target;
      }

      return { activeTargetsByUserId: next };
    });
  },
  setDraggingState: (userId, dragging) => {
    set((state) => {
      const next = { ...state.draggingByUserId };

      if (!dragging) {
        delete next[userId];
      } else {
        next[userId] = dragging;
      }

      return { draggingByUserId: next };
    });
  },
  upsertCursor: (cursor) => {
    set((state) => ({
      cursorsByUserId: {
        ...state.cursorsByUserId,
        [cursor.userId]: cursor,
      },
    }));
  },
  removeCursor: (userId) => {
    set((state) => {
      const next = { ...state.cursorsByUserId };
      delete next[userId];
      return { cursorsByUserId: next };
    });
  },
  setEditingUser: (cardId, userId) => {
    set((state) => {
      const next = { ...state.editingByCardId };

      if (userId) {
        next[cardId] = userId;
      } else {
        delete next[cardId];
      }

      return {
        editingByCardId: next,
      };
    });
  },
  clearEditingUser: (userId) => {
    set((state) => {
      const next = Object.fromEntries(
        Object.entries(state.editingByCardId).filter(([, value]) => value !== userId)
      );

      return {
        editingByCardId: next,
      };
    });
  },
  reset: () => {
    set({
      users: [],
      cursorsByUserId: {},
      activeTargetsByUserId: {},
      draggingByUserId: {},
      editingByCardId: {},
    });
  },
}));
