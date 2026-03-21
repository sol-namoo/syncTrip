import { create } from "zustand";
import type {
  EditingPresenceMap,
  PresenceUser,
  RemoteCursor,
  WorkspaceMember,
} from "@/types/workspace";

type WorkspacePresenceState = {
  users: PresenceUser[];
  cursorsByUserId: Record<string, RemoteCursor>;
  editingByCardId: EditingPresenceMap;
  initializeFromMembers: (members: WorkspaceMember[]) => void;
  setUsers: (users: PresenceUser[]) => void;
  upsertCursor: (cursor: RemoteCursor) => void;
  removeCursor: (userId: string) => void;
  setEditingUser: (cardId: string, userId: string | null) => void;
  reset: () => void;
};

export const useWorkspacePresenceStore = create<WorkspacePresenceState>((set) => ({
  users: [],
  cursorsByUserId: {},
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
  reset: () => {
    set({
      users: [],
      cursorsByUserId: {},
      editingByCardId: {},
    });
  },
}));
