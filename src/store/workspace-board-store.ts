import { create } from "zustand";
import type {
  BoardCardEntity,
  BoardColumnEntity,
  BoardColumnId,
  TripPlaceCard,
  WorkspaceSnapshot,
  WorkspaceTrip,
} from "@/types/workspace";

type WorkspaceBoardState = {
  trip: WorkspaceTrip | null;
  columnOrder: BoardColumnId[];
  columnsById: Partial<Record<BoardColumnId, BoardColumnEntity>>;
  cardsById: Record<string, BoardCardEntity>;
  initializeFromSnapshot: (snapshot: WorkspaceSnapshot) => void;
  upsertCard: (card: TripPlaceCard) => void;
  removeCard: (cardId: string) => void;
  setColumnCardIds: (columnId: BoardColumnId, cardIds: string[]) => void;
  moveCard: (input: {
    sourceColumnId: BoardColumnId;
    destinationColumnId: BoardColumnId;
    sourceIndex: number;
    destinationIndex: number;
  }) => void;
};

function normalizeSnapshot(snapshot: WorkspaceSnapshot) {
  const columnOrder = snapshot.columns.map((column) => column.id);
  const columnsById = snapshot.columns.reduce<
    Partial<Record<BoardColumnId, BoardColumnEntity>>
  >((accumulator, column) => {
    accumulator[column.id] = column;
    return accumulator;
  }, {});
  const cardsById = snapshot.cards.reduce<Record<string, BoardCardEntity>>(
    (accumulator, card) => {
      accumulator[card.id] = card;
      return accumulator;
    },
    {}
  );

  return {
    trip: snapshot.trip,
    columnOrder,
    columnsById,
    cardsById,
  };
}

export const useWorkspaceBoardStore = create<WorkspaceBoardState>((set) => ({
  trip: null,
  columnOrder: [],
  columnsById: {},
  cardsById: {},
  initializeFromSnapshot: (snapshot) => {
    set(normalizeSnapshot(snapshot));
  },
  upsertCard: (card) => {
    set((state) => ({
      cardsById: {
        ...state.cardsById,
        [card.id]: card,
      },
    }));
  },
  removeCard: (cardId) => {
    set((state) => {
      const nextCardsById = { ...state.cardsById };
      delete nextCardsById[cardId];

      const nextColumnsById = Object.fromEntries(
        Object.entries(state.columnsById).map(([columnId, column]) => [
          columnId,
          column
            ? {
                ...column,
                cardIds: column.cardIds.filter((id) => id !== cardId),
              }
            : column,
        ])
      ) as Partial<Record<BoardColumnId, BoardColumnEntity>>;

      return {
        cardsById: nextCardsById,
        columnsById: nextColumnsById,
      };
    });
  },
  setColumnCardIds: (columnId, cardIds) => {
    set((state) => ({
      columnsById: {
        ...state.columnsById,
        [columnId]: state.columnsById[columnId]
          ? {
              ...state.columnsById[columnId],
              cardIds,
            }
          : undefined,
      },
    }));
  },
  moveCard: ({ sourceColumnId, destinationColumnId, sourceIndex, destinationIndex }) => {
    set((state) => {
      const sourceColumn = state.columnsById[sourceColumnId];
      const destinationColumn = state.columnsById[destinationColumnId];

      if (!sourceColumn || !destinationColumn) {
        return state;
      }

      const nextCardsById = { ...state.cardsById };
      const sourceCardIds = [...sourceColumn.cardIds];
      const [movedCardId] = sourceCardIds.splice(sourceIndex, 1);

      if (!movedCardId) {
        return state;
      }

      if (sourceColumnId === destinationColumnId) {
        sourceCardIds.splice(destinationIndex, 0, movedCardId);

        sourceCardIds.forEach((cardId, index) => {
          const existingCard = nextCardsById[cardId];
          if (existingCard) {
            nextCardsById[cardId] = {
              ...existingCard,
              orderIndex: index,
            };
          }
        });

        return {
          columnsById: {
            ...state.columnsById,
            [sourceColumnId]: {
              ...sourceColumn,
              cardIds: sourceCardIds,
            },
          },
          cardsById: nextCardsById,
        };
      }

      const destinationCardIds = [...destinationColumn.cardIds];
      destinationCardIds.splice(destinationIndex, 0, movedCardId);

      sourceCardIds.forEach((cardId, index) => {
        const existingCard = nextCardsById[cardId];
        if (existingCard) {
          nextCardsById[cardId] = {
            ...existingCard,
            orderIndex: index,
          };
        }
      });

      destinationCardIds.forEach((cardId, index) => {
        const existingCard = nextCardsById[cardId];
        if (existingCard) {
          nextCardsById[cardId] = {
            ...existingCard,
            listType: destinationColumn.tripDayId ? "day" : "bucket",
            tripDayId: destinationColumn.tripDayId,
            orderIndex: index,
          };
        }
      });

      return {
        columnsById: {
          ...state.columnsById,
          [sourceColumnId]: {
            ...sourceColumn,
            cardIds: sourceCardIds,
          },
          [destinationColumnId]: {
            ...destinationColumn,
            cardIds: destinationCardIds,
          },
        },
        cardsById: nextCardsById,
      };
    });
  },
}));
