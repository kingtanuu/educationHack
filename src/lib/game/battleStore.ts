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
import {
  phMultiplier,
  type AppliedStatusEffect,
  type StatusEffectKind,
} from "@/lib/chemistry/reactions";

const HAND_SIZE = 5;
const MAX_ENERGY = 3;
const PLAYER_MAX_HP = 60;

export interface LogEntry {
  id: string;
  turn: number;
  kind: "success" | "failure" | "no-match" | "enemy" | "info" | "status";
  text: string;
  formula?: string;
}

export interface ActiveStatus {
  kind: StatusEffectKind;
  value: number;
  remaining: number;
}

export type DamageEffectiveness = "super" | "normal" | "resist";

/** Last reaction outcome surfaced to the UI for effect overlays. */
export interface LastReactionFx {
  id: string;
  reactionName: string;
  rawDamage: number;
  finalDamage: number;
  multiplier: number;
  effectiveness: DamageEffectiveness;
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
  /** Active status effects on the enemy (poison, paralyze, burn). */
  enemyStatus: ActiveStatus[];
  /** Most recent reaction outcome, used for "効果は抜群だ!" banner. */
  lastFx: LastReactionFx | null;

  startBattle: (
    enemyId: string,
    deck: CardDef[],
    initialHp?: number,
    maxHp?: number,
  ) => void;
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

const STATUS_LABEL: Record<StatusEffectKind, string> = {
  poison: "毒",
  paralyze: "麻痺",
  burn: "燃焼",
  dazzle: "目眩し",
  "block-buff": "強化",
};

/** When the enemy has at least one stack of dazzle, attacks deal half. */
const DAZZLE_DAMAGE_MUL = 0.5;

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
  enemyStatus: [],
  lastFx: null,

  startBattle: (enemyId, deck, initialHp, maxHp) => {
    const enemy = getEnemy(enemyId);
    if (!enemy) {
      return;
    }
    const resolvedMax = maxHp ?? PLAYER_MAX_HP;
    const resolvedHp = Math.max(
      1,
      Math.min(initialHp ?? resolvedMax, resolvedMax),
    );

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
      playerHp: resolvedHp,
      playerMaxHp: resolvedMax,
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
      enemyStatus: [],
      lastFx: null,
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
    let rawDamage = 0;
    let finalDamage = 0;
    let multiplier = 1;
    let effectiveness: DamageEffectiveness = "normal";
    let heal = 0;
    let block = 0;
    let appliedStatus: AppliedStatusEffect[] = [];
    let fx: LastReactionFx | null = null;

    if (result.kind === "success") {
      rawDamage = result.reaction.outcome.damage;
      heal = result.reaction.outcome.heal ?? 0;
      block = result.reaction.outcome.block ?? 0;
      appliedStatus = result.reaction.outcome.statusEffects ?? [];
      if (state.enemy) {
        multiplier = phMultiplier(result.reaction.ph, state.enemy.weakness);
        effectiveness =
          multiplier > 1 ? "super" : multiplier < 1 ? "resist" : "normal";
      }
      finalDamage = Math.round(rawDamage * multiplier);
      log = {
        id: uid(),
        turn: state.turn,
        kind: "success",
        text: `${result.reaction.name} — ${result.reaction.educationalNote}`,
        formula: result.reaction.formula,
      };
      fx = {
        id: uid(),
        reactionName: result.reaction.name,
        rawDamage,
        finalDamage,
        multiplier,
        effectiveness,
      };
    } else if (result.kind === "failure") {
      finalDamage = state.playArea.reduce((sum, c) => sum + c.soloDamage, 0);
      log = {
        id: uid(),
        turn: state.turn,
        kind: "failure",
        text: `反応せず — ${result.message}`,
      };
    } else {
      finalDamage = state.playArea.reduce((sum, c) => sum + c.soloDamage, 0);
      log = {
        id: uid(),
        turn: state.turn,
        kind: "no-match",
        text: `不発 — ${result.message}`,
      };
    }

    const newEnemyHp = Math.max(0, state.enemyHp - finalDamage);
    const newPlayerHp = Math.min(
      state.playerMaxHp,
      state.playerHp + heal,
    );
    const newPlayerBlock = state.playerBlock + block;
    const playedCards = state.playArea;

    // Merge new status effects with existing ones (stack durations of same kind).
    const mergedStatus = [...state.enemyStatus];
    for (const eff of appliedStatus) {
      const existing = mergedStatus.find((s) => s.kind === eff.kind);
      if (existing) {
        existing.value = Math.max(existing.value, eff.value);
        existing.remaining = Math.max(existing.remaining, eff.duration);
      } else {
        mergedStatus.push({
          kind: eff.kind,
          value: eff.value,
          remaining: eff.duration,
        });
      }
    }

    const victory = newEnemyHp <= 0;

    const fxLogs: LogEntry[] =
      result.kind === "success" && effectiveness !== "normal"
        ? [
            {
              id: uid(),
              turn: state.turn,
              kind: "status",
              text:
                effectiveness === "super"
                  ? `効果は抜群だ！ (×${multiplier.toFixed(1)})`
                  : `効果はいまひとつ… (×${multiplier.toFixed(1)})`,
            },
          ]
        : [];
    const statusLogs: LogEntry[] = appliedStatus.map((eff) => ({
      id: uid(),
      turn: state.turn,
      kind: "status",
      text: `${state.enemy?.name ?? "敵"} に ${
        STATUS_LABEL[eff.kind]
      } ${eff.value} を ${eff.duration} ターン付与`,
    }));

    set({
      enemyHp: newEnemyHp,
      playerHp: newPlayerHp,
      playerBlock: newPlayerBlock,
      enemyStatus: mergedStatus,
      lastFx: fx,
      discardPile: [...state.discardPile, ...playedCards],
      playArea: [],
      log: [...statusLogs, ...fxLogs, log, ...state.log].slice(0, 40),
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

    // Tick poison / burn on the enemy *before* it acts.
    let enemyHp = state.enemyHp;
    const statusLogs: LogEntry[] = [];
    const enemyName = state.enemy?.name ?? "敵";
    let paralyzed = false;
    const nextStatus: ActiveStatus[] = [];
    for (const s of state.enemyStatus) {
      if (enemyHp <= 0) break;
      if (s.kind === "poison" || s.kind === "burn") {
        enemyHp = Math.max(0, enemyHp - s.value);
        statusLogs.push({
          id: uid(),
          turn: state.turn,
          kind: "status",
          text: `${enemyName} は ${STATUS_LABEL[s.kind]} で ${s.value} ダメージ`,
        });
      }
      if (s.kind === "paralyze") {
        paralyzed = true;
        statusLogs.push({
          id: uid(),
          turn: state.turn,
          kind: "status",
          text: `${enemyName} は麻痺して動けない！`,
        });
      }
      const newRemaining = s.remaining - 1;
      if (newRemaining > 0) {
        nextStatus.push({ ...s, remaining: newRemaining });
      }
    }

    // Victory from poison/burn DOT?
    if (enemyHp <= 0) {
      const victoryLog: LogEntry = {
        id: uid(),
        turn: state.turn,
        kind: "info",
        text: `${enemyName} を撃破した！`,
      };
      set({
        hand: [],
        playArea: [],
        discardPile: discard,
        enemyHp: 0,
        enemyStatus: nextStatus,
        status: "victory",
        log: [victoryLog, ...statusLogs, ...state.log].slice(0, 40),
      });
      return;
    }

    // Compute the upcoming enemy intent and stage it (skip if paralyzed).
    const intent = paralyzed
      ? null
      : state.enemy?.intentPattern[
          state.enemyIntentIndex % (state.enemy?.intentPattern.length ?? 1)
        ];

    // Dazzle halves the enemy's attack damage.
    const dazzled = nextStatus.some((s) => s.kind === "dazzle");

    let pending: PendingEnemyAction | null = null;
    if (intent && intent.kind === "attack") {
      const effectiveAttack = dazzled
        ? Math.round(intent.value * DAZZLE_DAMAGE_MUL)
        : intent.value;
      const blocked = Math.min(state.playerBlock, effectiveAttack);
      const hpDamage = effectiveAttack - blocked;
      pending = {
        id: uid(),
        intent: dazzled
          ? { ...intent, value: effectiveAttack, label: `${intent.label} (目眩し)` }
          : intent,
        hpDamage,
        blocked,
      };
    } else if (intent) {
      pending = { id: uid(), intent, hpDamage: 0, blocked: 0 };
    }

    set({
      hand: [],
      playArea: [],
      discardPile: discard,
      enemyHp,
      enemyStatus: nextStatus,
      phase: paralyzed ? "enemy-executing" : "enemy-telegraph",
      pendingEnemyAction: pending,
      log: [...statusLogs, ...state.log].slice(0, 40),
    });

    // If paralyzed, skip straight to drawing the next hand without enemy turn.
    if (paralyzed) {
      // Defer to allow the UI to show the paralysis log briefly.
      setTimeout(() => {
        const cur = get();
        let draw = cur.drawPile.slice();
        let discardPile = cur.discardPile.slice();
        const newHand: CardDef[] = [];
        for (let i = 0; i < HAND_SIZE; i++) {
          if (draw.length === 0) {
            draw = shuffle(discardPile);
            discardPile = [];
          }
          const c = draw.shift();
          if (c) newHand.push(c);
        }
        set({
          hand: newHand,
          drawPile: draw,
          discardPile,
          playerEnergy: MAX_ENERGY,
          playerBlock: 0,
          turn: cur.turn + 1,
          enemyIntentIndex: cur.enemyIntentIndex + 1,
          phase: "player",
          pendingEnemyAction: null,
        });
      }, 700);
    }
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
      enemyStatus: [],
      lastFx: null,
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
