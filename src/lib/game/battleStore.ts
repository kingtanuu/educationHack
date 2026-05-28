"use client";

import { create } from "zustand";
import type { CardDef } from "@/data/cards";
import { getEnemy, type EnemyDef, type EnemyIntent } from "@/data/enemies";
import {
  resolvePlay,
  findSynergyHints,
  type PlayedCard,
  type ResolveResult,
} from "@/lib/chemistry/reactionEngine";

const HAND_SIZE = 5;
const MAX_ENERGY = 3;
const PLAYER_MAX_HP = 60;

export interface LogEntry {
  id: string;
  turn: number;
  kind: "success" | "failure" | "no-match" | "enemy" | "info";
  text: string;
  formula?: string;
}

export interface PendingEnemyAction {
  id: string;
  intent: EnemyIntent;
  /** HP damage that will actually land after considering current block. */
  hpDamage: number;
  /** Amount that will be absorbed by block. */
  blocked: number;
}

export type BattlePhase = "player" | "enemy-telegraph" | "enemy-executing";

export interface BattleState {
  enemy: EnemyDef | null;
  enemyHp: number;
  enemyIntentIndex: number;
  playerHp: number;
  playerMaxHp: number;
  playerBlock: number;
  playerEnergy: number;
  playerMaxEnergy: number;
  hand: CardDef[];
  drawPile: CardDef[];
  discardPile: CardDef[];
  playArea: CardDef[];
  turn: number;
  log: LogEntry[];
  status: "idle" | "in-progress" | "victory" | "defeat";
  phase: BattlePhase;
  pendingEnemyAction: PendingEnemyAction | null;

  startBattle: (enemyId: string, deck: CardDef[]) => void;
  moveToPlayArea: (cardId: string) => void;
  returnFromPlayArea: (cardId: string) => void;
  resolveReaction: () => ResolveResult | null;
  endTurn: () => void;
  executeEnemyAction: () => void;
  reset: () => void;
  currentIntent: () => EnemyIntent | null;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function cardToPlayed(card: CardDef): PlayedCard {
  if (card.kind === "condition") return { kind: "cond", key: card.key };
  return { kind: "elem", key: card.key };
}

export const useBattleStore = create<BattleState>((set, get) => ({
  enemy: null,
  enemyHp: 0,
  enemyIntentIndex: 0,
  playerHp: PLAYER_MAX_HP,
  playerMaxHp: PLAYER_MAX_HP,
  playerBlock: 0,
  playerEnergy: MAX_ENERGY,
  playerMaxEnergy: MAX_ENERGY,
  hand: [],
  drawPile: [],
  discardPile: [],
  playArea: [],
  turn: 1,
  log: [],
  status: "idle",
  phase: "player",
  pendingEnemyAction: null,

  startBattle: (enemyId, deck) => {
    const enemy = getEnemy(enemyId);
    if (!enemy) {
      return;
    }

    // Re-shuffle until the opening hand contains at least one reachable
    // reaction. Keeps the tutorial moment from feeling random/dead.
    let shuffled = shuffle(deck);
    for (let i = 0; i < 20; i++) {
      const candidateHand = shuffled.slice(0, HAND_SIZE);
      const hints = findSynergyHints(
        [],
        candidateHand.map((c) => ({ id: c.id, key: c.key, kind: c.kind })),
      );
      if (hints.reachableReactions > 0) break;
      shuffled = shuffle(deck);
    }
    const hand = shuffled.slice(0, HAND_SIZE);
    const drawPile = shuffled.slice(HAND_SIZE);

    set({
      enemy,
      enemyHp: enemy.maxHp,
      enemyIntentIndex: 0,
      playerHp: PLAYER_MAX_HP,
      playerMaxHp: PLAYER_MAX_HP,
      playerBlock: 0,
      playerEnergy: MAX_ENERGY,
      playerMaxEnergy: MAX_ENERGY,
      hand,
      drawPile,
      discardPile: [],
      playArea: [],
      turn: 1,
      log: [
        {
          id: uid(),
          turn: 1,
          kind: "info",
          text: `${enemy.name} が現れた — ${enemy.flavor}`,
        },
      ],
      status: "in-progress",
      phase: "player",
      pendingEnemyAction: null,
    });
  },

  moveToPlayArea: (cardId) => {
    const state = get();
    if (state.status !== "in-progress") return;
    const card = state.hand.find((c) => c.id === cardId);
    if (!card) return;
    if (state.playerEnergy < card.energyCost) return;

    set({
      hand: state.hand.filter((c) => c.id !== cardId),
      playArea: [...state.playArea, card],
      playerEnergy: state.playerEnergy - card.energyCost,
    });
  },

  returnFromPlayArea: (cardId) => {
    const state = get();
    if (state.status !== "in-progress") return;
    const card = state.playArea.find((c) => c.id === cardId);
    if (!card) return;
    set({
      playArea: state.playArea.filter((c) => c.id !== cardId),
      hand: [...state.hand, card],
      playerEnergy: state.playerEnergy + card.energyCost,
    });
  },

  resolveReaction: () => {
    const state = get();
    if (state.status !== "in-progress") return null;
    if (state.playArea.length === 0) return null;

    const played: PlayedCard[] = state.playArea.map(cardToPlayed);
    const result = resolvePlay(played);

    let log: LogEntry;
    let damage = 0;
    let heal = 0;
    let block = 0;

    if (result.kind === "success") {
      damage = result.reaction.outcome.damage;
      heal = result.reaction.outcome.heal ?? 0;
      block = result.reaction.outcome.block ?? 0;
      log = {
        id: uid(),
        turn: state.turn,
        kind: "success",
        text: `${result.reaction.name} — ${result.reaction.educationalNote}`,
        formula: result.reaction.formula,
      };
    } else if (result.kind === "failure") {
      // Solo-damage fallback: cards still hit a bit even on failure.
      damage = state.playArea.reduce((sum, c) => sum + c.soloDamage, 0);
      log = {
        id: uid(),
        turn: state.turn,
        kind: "failure",
        text: `反応せず — ${result.message}`,
      };
    } else {
      damage = state.playArea.reduce((sum, c) => sum + c.soloDamage, 0);
      log = {
        id: uid(),
        turn: state.turn,
        kind: "no-match",
        text: `不発 — ${result.message}`,
      };
    }

    const newEnemyHp = Math.max(0, state.enemyHp - damage);
    const newPlayerHp = Math.min(
      state.playerMaxHp,
      state.playerHp + heal,
    );
    const newPlayerBlock = state.playerBlock + block;
    const playedCards = state.playArea;

    const victory = newEnemyHp <= 0;

    set({
      enemyHp: newEnemyHp,
      playerHp: newPlayerHp,
      playerBlock: newPlayerBlock,
      discardPile: [...state.discardPile, ...playedCards],
      playArea: [],
      log: [log, ...state.log].slice(0, 30),
      status: victory ? "victory" : state.status,
    });

    if (victory) {
      set((s) => ({
        log: [
          {
            id: uid(),
            turn: s.turn,
            kind: "info",
            text: `${s.enemy?.name ?? "敵"} を撃破した！`,
          },
          ...s.log,
        ],
      }));
    }

    return result;
  },

  endTurn: () => {
    const state = get();
    if (state.status !== "in-progress" || state.phase !== "player") return;

    // Discard everything from hand and play area; we'll draw a fresh hand
    // *after* the enemy action lands.
    const discard = [
      ...state.discardPile,
      ...state.playArea,
      ...state.hand,
    ];

    // Compute the upcoming enemy intent and stage it for visual telegraph.
    const intent = state.enemy?.intentPattern[
      state.enemyIntentIndex % (state.enemy?.intentPattern.length ?? 1)
    ];

    let pending: PendingEnemyAction | null = null;
    if (intent && intent.kind === "attack") {
      const blocked = Math.min(state.playerBlock, intent.value);
      const hpDamage = intent.value - blocked;
      pending = { id: uid(), intent, hpDamage, blocked };
    } else if (intent) {
      pending = { id: uid(), intent, hpDamage: 0, blocked: 0 };
    }

    set({
      hand: [],
      playArea: [],
      discardPile: discard,
      phase: "enemy-telegraph",
      pendingEnemyAction: pending,
    });
  },

  executeEnemyAction: () => {
    const state = get();
    if (state.phase !== "enemy-telegraph" || !state.pendingEnemyAction) return;

    const pending = state.pendingEnemyAction;
    const enemyName = state.enemy?.name ?? "敵";

    let newPlayerHp = state.playerHp;
    let newBlock = state.playerBlock;
    const enemyLogs: LogEntry[] = [];

    if (pending.intent.kind === "attack") {
      newBlock = Math.max(0, newBlock - pending.blocked);
      newPlayerHp = Math.max(0, newPlayerHp - pending.hpDamage);
      enemyLogs.push({
        id: uid(),
        turn: state.turn,
        kind: "enemy",
        text: `${enemyName} の ${pending.intent.label} — ${pending.intent.value} ダメージ${
          pending.blocked > 0 ? ` (${pending.blocked} 防御)` : ""
        }`,
      });
    } else if (pending.intent.kind === "defend") {
      enemyLogs.push({
        id: uid(),
        turn: state.turn,
        kind: "enemy",
        text: `${enemyName} の ${pending.intent.label} — 防御を固めた`,
      });
    } else {
      enemyLogs.push({
        id: uid(),
        turn: state.turn,
        kind: "enemy",
        text: `${enemyName} の ${pending.intent.label}`,
      });
    }

    const defeat = newPlayerHp <= 0;

    // Draw next hand from discard pile if needed.
    let draw = state.drawPile.slice();
    let discard = state.discardPile.slice();
    const newHand: CardDef[] = [];
    if (!defeat) {
      for (let i = 0; i < HAND_SIZE; i++) {
        if (draw.length === 0) {
          draw = shuffle(discard);
          discard = [];
        }
        const c = draw.shift();
        if (c) newHand.push(c);
      }
    }

    set({
      hand: newHand,
      drawPile: draw,
      discardPile: discard,
      playerEnergy: MAX_ENERGY,
      playerBlock: defeat ? state.playerBlock : 0,
      playerHp: newPlayerHp,
      turn: state.turn + 1,
      enemyIntentIndex: state.enemyIntentIndex + 1,
      log: [...enemyLogs, ...state.log].slice(0, 30),
      status: defeat ? "defeat" : state.status,
      phase: defeat ? "player" : "player",
      pendingEnemyAction: null,
    });
  },

  reset: () => {
    set({
      enemy: null,
      enemyHp: 0,
      enemyIntentIndex: 0,
      playerHp: PLAYER_MAX_HP,
      playerMaxHp: PLAYER_MAX_HP,
      playerBlock: 0,
      playerEnergy: MAX_ENERGY,
      hand: [],
      drawPile: [],
      discardPile: [],
      playArea: [],
      turn: 1,
      log: [],
      status: "idle",
      phase: "player",
      pendingEnemyAction: null,
    });
  },

  currentIntent: () => {
    const state = get();
    if (!state.enemy) return null;
    return state.enemy.intentPattern[
      state.enemyIntentIndex % state.enemy.intentPattern.length
    ];
  },
}));
