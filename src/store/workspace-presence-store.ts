import { create } from "zustand";
import type {
  ActiveTargetMap,
  ActiveTargetState,
  CardLockMap,
  CardLockState,
  PresenceUser,
  RemoteCursor,
  WorkspaceMember,
} from "@/types/workspace";

type WorkspacePresenceState = {
  users: PresenceUser[];
  cursorsByUserId: Record<string, RemoteCursor>;
  activeTargetsByUserId: ActiveTargetMap;
  cardLocksById: CardLockMap;
  initializeFromMembers: (members: WorkspaceMember[]) => void;
  setUsers: (users: PresenceUser[]) => void;
  setActiveTarget: (userId: string, target: ActiveTargetState | null) => void;
  setCardLock: (cardId: string, lock: CardLockState | null) => void;
  clearCardLocksForUser: (userId: string) => void;
  pruneCardLocksToUsers: (userIds: string[]) => void;
  upsertCursor: (cursor: RemoteCursor) => void;
  removeCursor: (userId: string) => void;
  reset: () => void;
};

export const useWorkspacePresenceStore = create<WorkspacePresenceState>((set) => ({
  users: [],
  cursorsByUserId: {},
  activeTargetsByUserId: {},
  cardLocksById: {},
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
  setCardLock: (cardId, lock) => {
    set((state) => {
      const next = { ...state.cardLocksById };

      if (!lock) {
        delete next[cardId];
      } else {
        next[cardId] = lock;
      }

      return { cardLocksById: next };
    });
  },
  clearCardLocksForUser: (userId) => {
    set((state) => ({
      cardLocksById: Object.fromEntries(
        Object.entries(state.cardLocksById).filter(([, value]) => value.userId !== userId)
      ),
    }));
  },
  pruneCardLocksToUsers: (userIds) => {
    const allowed = new Set(userIds);
    set((state) => ({
      cardLocksById: Object.fromEntries(
        Object.entries(state.cardLocksById).filter(([, value]) =>
          allowed.has(value.userId)
        )
      ),
    }));
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
  reset: () => {
    set({
      users: [],
      cursorsByUserId: {},
      activeTargetsByUserId: {},
      cardLocksById: {},
    });
  },
}));
