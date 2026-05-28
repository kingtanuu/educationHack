"use client";

import { create } from "zustand";
import { getTutorialDeck } from "@/data/cards";
import type { CardDef } from "@/data/cards";

export interface RunState {
  /** Deck the player owns. Persists between battles. Battles work on a snapshot. */
  deck: CardDef[];
  /** Highest floor cleared in this run. */
  floorsCleared: number;
  /** Number of distinct enemies defeated. */
  enemiesDefeated: number;
  /** Has the player completed the tutorial encounter? */
  tutorialComplete: boolean;

  /** Reset everything to a fresh run with the tutorial deck. */
  beginRun: () => void;
  /** Record a victory (advance floors, mark tutorial complete on first win). */
  recordVictory: () => void;
  /** Add a card to the deck (used in future reward screens). */
  addCard: (card: CardDef) => void;
  /** Remove a specific card from the deck. */
  removeCard: (cardId: string) => void;
  /** Get a fresh, isolated copy of the deck for the next battle. */
  snapshotDeck: () => CardDef[];
}

export const useRunStore = create<RunState>((set, get) => ({
  deck: getTutorialDeck(),
  floorsCleared: 0,
  enemiesDefeated: 0,
  tutorialComplete: false,

  beginRun: () => {
    set({
      deck: getTutorialDeck(),
      floorsCleared: 0,
      enemiesDefeated: 0,
      tutorialComplete: false,
    });
  },

  recordVictory: () => {
    set((state) => ({
      floorsCleared: state.floorsCleared + 1,
      enemiesDefeated: state.enemiesDefeated + 1,
      tutorialComplete: state.tutorialComplete || state.floorsCleared === 0,
    }));
  },

  addCard: (card) => {
    set((state) => ({ deck: [...state.deck, { ...card }] }));
  },

  removeCard: (cardId) => {
    set((state) => ({ deck: state.deck.filter((c) => c.id !== cardId) }));
  },

  snapshotDeck: () => get().deck.map((c) => ({ ...c })),
}));
