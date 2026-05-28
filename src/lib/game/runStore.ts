"use client";

import { create } from "zustand";
import { getTutorialDeck } from "@/data/cards";
import type { CardDef } from "@/data/cards";

const PLAYER_MAX_HP = 60;
/** Fraction of max HP restored after each victory. */
const VICTORY_HEAL_FRACTION = 0.25;

export interface RunState {
  /** Deck the player owns. Persists between battles. Battles work on a snapshot. */
  deck: CardDef[];
  /** Highest floor cleared in this run. */
  floorsCleared: number;
  /** Number of distinct enemies defeated. */
  enemiesDefeated: number;
  /** Has the player completed the tutorial encounter? */
  tutorialComplete: boolean;
  /** Persistent HP carried across battles. */
  playerHp: number;
  playerMaxHp: number;

  /** Reset everything to a fresh run with the tutorial deck. */
  beginRun: () => void;
  /** Record a victory: advance floor, partial heal. */
  recordVictory: () => void;
  /** Sync the latest HP from a finished/ongoing battle. */
  setPlayerHp: (hp: number) => void;
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
  playerHp: PLAYER_MAX_HP,
  playerMaxHp: PLAYER_MAX_HP,

  beginRun: () => {
    set({
      deck: getTutorialDeck(),
      floorsCleared: 0,
      enemiesDefeated: 0,
      tutorialComplete: false,
      playerHp: PLAYER_MAX_HP,
      playerMaxHp: PLAYER_MAX_HP,
    });
  },

  recordVictory: () => {
    set((state) => {
      const healAmount = Math.round(state.playerMaxHp * VICTORY_HEAL_FRACTION);
      return {
        floorsCleared: state.floorsCleared + 1,
        enemiesDefeated: state.enemiesDefeated + 1,
        tutorialComplete: state.tutorialComplete || state.floorsCleared === 0,
        playerHp: Math.min(state.playerMaxHp, state.playerHp + healAmount),
      };
    });
  },

  setPlayerHp: (hp) => {
    set((state) => ({
      playerHp: Math.max(0, Math.min(state.playerMaxHp, hp)),
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
