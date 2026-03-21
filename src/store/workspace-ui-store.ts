import { create } from "zustand";
import type { BoardColumnId, SaveIndicatorState } from "@/types/workspace";

type WorkspaceUiState = {
  splitPaneRatio: number;
  selectedCardId: string | null;
  selectedColumnId: BoardColumnId | null;
  activeDayFilter: BoardColumnId | "all";
  searchQuery: string;
  dragActiveId: string | null;
  saveState: SaveIndicatorState;
  setSplitPaneRatio: (ratio: number) => void;
  setSelectedCardId: (cardId: string | null) => void;
  setSelectedColumnId: (columnId: BoardColumnId | null) => void;
  setActiveDayFilter: (filter: BoardColumnId | "all") => void;
  setSearchQuery: (query: string) => void;
  setDragActiveId: (cardId: string | null) => void;
  setSaveState: (state: SaveIndicatorState) => void;
  reset: () => void;
};

const initialUiState = {
  splitPaneRatio: 0.42,
  selectedCardId: null,
  selectedColumnId: null,
  activeDayFilter: "all" as const,
  searchQuery: "",
  dragActiveId: null,
  saveState: "idle" as const,
};

export const useWorkspaceUiStore = create<WorkspaceUiState>((set) => ({
  ...initialUiState,
  setSplitPaneRatio: (ratio) => {
    set({
      splitPaneRatio: Math.min(0.7, Math.max(0.3, ratio)),
    });
  },
  setSelectedCardId: (cardId) => {
    set({ selectedCardId: cardId });
  },
  setSelectedColumnId: (columnId) => {
    set({ selectedColumnId: columnId });
  },
  setActiveDayFilter: (filter) => {
    set({ activeDayFilter: filter });
  },
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  setDragActiveId: (cardId) => {
    set({ dragActiveId: cardId });
  },
  setSaveState: (state) => {
    set({ saveState: state });
  },
  reset: () => {
    set(initialUiState);
  },
}));
