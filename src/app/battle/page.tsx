"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  FlaskConical,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useBattleStore } from "@/lib/game/battleStore";
import { useRunStore } from "@/lib/game/runStore";
import { findSynergyHints } from "@/lib/chemistry/reactionEngine";
import { sfx } from "@/lib/audio/sfx";
import { getFloorEntry, floorEnemyFor } from "@/data/floorPlan";
import { EnemyPanel } from "@/components/battle/EnemyPanel";
import { PlayerPanel } from "@/components/battle/PlayerPanel";
import { ReactionLog } from "@/components/battle/ReactionLog";
import { PlayArea } from "@/components/battle/PlayArea";
import { Hand } from "@/components/battle/Hand";
import { EnemyAttackBanner } from "@/components/effects/EnemyAttackBanner";
import { EffectivenessBanner } from "@/components/effects/EffectivenessBanner";
import { EffectsLegend } from "@/components/battle/EffectsLegend";
import type { FloatingNumber } from "@/components/effects/DamageNumber";

const ENEMY_TELEGRAPH_MS = 1300;

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function BattlePage() {
  const enemy = useBattleStore((s) => s.enemy);
  const enemyHp = useBattleStore((s) => s.enemyHp);
  const playerHp = useBattleStore((s) => s.playerHp);
  const playerMaxHp = useBattleStore((s) => s.playerMaxHp);
  const playerBlock = useBattleStore((s) => s.playerBlock);
  const playerEnergy = useBattleStore((s) => s.playerEnergy);
  const playerMaxEnergy = useBattleStore((s) => s.playerMaxEnergy);
  const hand = useBattleStore((s) => s.hand);
  const playArea = useBattleStore((s) => s.playArea);
  const log = useBattleStore((s) => s.log);
  const turn = useBattleStore((s) => s.turn);
  const status = useBattleStore((s) => s.status);
  const phase = useBattleStore((s) => s.phase);
  const pendingEnemyAction = useBattleStore((s) => s.pendingEnemyAction);
  const enemyStatus = useBattleStore((s) => s.enemyStatus);
  const playerStatus = useBattleStore((s) => s.playerStatus);
  const enemyBlock = useBattleStore((s) => s.enemyBlock);
  const enemyStrength = useBattleStore((s) => s.enemyStrength);
  const enemyIntentIndex = useBattleStore((s) => s.enemyIntentIndex);
  const lastFx = useBattleStore((s) => s.lastFx);

  const startBattle = useBattleStore((s) => s.startBattle);
  const moveToPlayArea = useBattleStore((s) => s.moveToPlayArea);
  const returnFromPlayArea = useBattleStore((s) => s.returnFromPlayArea);
  const resolveReaction = useBattleStore((s) => s.resolveReaction);
  const endTurn = useBattleStore((s) => s.endTurn);
  const executeEnemyAction = useBattleStore((s) => s.executeEnemyAction);
  const currentIntent = useBattleStore((s) => s.currentIntent);

  const snapshotDeck = useRunStore((s) => s.snapshotDeck);
  const recordVictory = useRunStore((s) => s.recordVictory);
  const beginRun = useRunStore((s) => s.beginRun);
  const tutorialComplete = useRunStore((s) => s.tutorialComplete);
  const floorsCleared = useRunStore((s) => s.floorsCleared);
  const runHp = useRunStore((s) => s.playerHp);
  const runMaxHp = useRunStore((s) => s.playerMaxHp);
  const setRunHp = useRunStore((s) => s.setPlayerHp);

  const [enemyNumbers, setEnemyNumbers] = useState<FloatingNumber[]>([]);
  const [playerNumbers, setPlayerNumbers] = useState<FloatingNumber[]>([]);
  const [muted, setMuted] = useState(false);

  const prevEnemyHp = useRef(enemyHp);
  const prevPlayerHp = useRef(playerHp);
  const prevPlayerBlock = useRef(playerBlock);

  const currentFloor = floorsCleared + 1;

  useEffect(() => {
    if (status === "idle") {
      const scaledEnemy = floorEnemyFor(currentFloor);
      if (scaledEnemy) {
        startBattle(scaledEnemy, snapshotDeck(), runHp, runMaxHp);
      }
    }
  }, [status, startBattle, snapshotDeck, runHp, runMaxHp, currentFloor]);

  const nextIntent =
    enemy && status === "in-progress" && phase === "player"
      ? enemy.intentPattern[
          (enemyIntentIndex + 1) % enemy.intentPattern.length
        ]
      : null;

  // Compute synergy hints whenever the hand or crucible changes.
  const synergyKeys = (() => {
    if (status !== "in-progress" || phase !== "player") return undefined;
    const playedCards = playArea.map((c) =>
      c.kind === "condition"
        ? { kind: "cond" as const, key: c.key }
        : { kind: "elem" as const, key: c.key },
    );
    const handForHints = hand.map((c) => ({
      id: c.id,
      key: c.key,
      kind: c.kind,
    }));
    return findSynergyHints(playedCards, handForHints).hintedKeys;
  })();

  // Reset hp watchers when a fresh battle starts.
  useEffect(() => {
    if (status === "in-progress" && turn === 1) {
      prevEnemyHp.current = enemyHp;
      prevPlayerHp.current = playerHp;
      prevPlayerBlock.current = playerBlock;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status === "in-progress" && turn === 1 ? status : null]);

  // Damage numbers when enemy HP decreases.
  useEffect(() => {
    if (enemyHp < prevEnemyHp.current) {
      const amount = prevEnemyHp.current - enemyHp;
      setEnemyNumbers((prev) => [
        ...prev,
        { id: uid(), amount, kind: "enemy-hit" },
      ]);
      sfx.play("enemyHit");
    }
    prevEnemyHp.current = enemyHp;
  }, [enemyHp]);

  // Damage numbers when player HP decreases.
  useEffect(() => {
    if (playerHp < prevPlayerHp.current) {
      const amount = prevPlayerHp.current - playerHp;
      setPlayerNumbers((prev) => [
        ...prev,
        { id: uid(), amount, kind: "player-hit" },
      ]);
      sfx.play("playerHit");
    } else if (playerHp > prevPlayerHp.current) {
      const amount = playerHp - prevPlayerHp.current;
      setPlayerNumbers((prev) => [
        ...prev,
        { id: uid(), amount, kind: "heal" },
      ]);
    }
    prevPlayerHp.current = playerHp;
  }, [playerHp]);

  // Block gained.
  useEffect(() => {
    if (playerBlock > prevPlayerBlock.current) {
      const amount = playerBlock - prevPlayerBlock.current;
      setPlayerNumbers((prev) => [
        ...prev,
        { id: uid(), amount, kind: "block" },
      ]);
    }
    prevPlayerBlock.current = playerBlock;
  }, [playerBlock]);

  // Drive the enemy attack pipeline: telegraph banner -> execute damage.
  useEffect(() => {
    if (phase === "enemy-telegraph" && pendingEnemyAction) {
      sfx.play("enemyAttackTelegraph");
      const timer = setTimeout(() => {
        executeEnemyAction();
      }, ENEMY_TELEGRAPH_MS);
      return () => clearTimeout(timer);
    }
  }, [phase, pendingEnemyAction, executeEnemyAction]);

  // Mute toggle keeps in sync with sfx module.
  useEffect(() => {
    sfx.setMuted(muted);
  }, [muted]);

  const onCardToPlay = useCallback(
    (id: string) => {
      moveToPlayArea(id);
      sfx.play("cardPlay");
    },
    [moveToPlayArea],
  );
  const onCardReturn = useCallback(
    (id: string) => {
      returnFromPlayArea(id);
      sfx.play("cardReturn");
    },
    [returnFromPlayArea],
  );
  const onResolveReaction = useCallback(() => {
    const result = resolveReaction();
    if (result?.kind === "success") {
      sfx.play(
        result.reaction.outcome.damage >= 30 ? "reactionBig" : "reactionSuccess",
      );
    } else if (result?.kind === "failure") {
      sfx.play("reactionFail");
    } else if (result?.kind === "no-match") {
      sfx.play("noMatch");
    }
  }, [resolveReaction]);

  // Victory / defeat audio + run progression — fire only on the
  // transition into the end state, not every re-render.
  const prevStatusRef = useRef(status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    if (prev !== "victory" && status === "victory") {
      sfx.play("victory");
      // Save the HP the player ended the battle at first; recordVictory
      // then heals 25% of max on top of that.
      setRunHp(playerHp);
      recordVictory();
    }
    if (prev !== "defeat" && status === "defeat") {
      sfx.play("defeat");
      // Defeat reflects 0 HP back to the run; beginRun will reset it.
      setRunHp(0);
    }
    prevStatusRef.current = status;
  }, [status, recordVictory, setRunHp, playerHp]);

  const removeEnemyNumber = useCallback(
    (id: string) =>
      setEnemyNumbers((prev) => prev.filter((n) => n.id !== id)),
    [],
  );
  const removePlayerNumber = useCallback(
    (id: string) =>
      setPlayerNumbers((prev) => prev.filter((n) => n.id !== id)),
    [],
  );

  if (!enemy) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-ink-muted">敵を召喚中…</div>
      </main>
    );
  }

  const intent = status === "in-progress" ? currentIntent() : null;
  const battleOver = status === "victory" || status === "defeat";
  const playerCanAct = status === "in-progress" && phase === "player";

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(212,166,71,0.08),transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-stone-800/70 bg-stone-950/60 px-6 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink-primary"
          >
            <ArrowLeft size={14} /> タイトルへ
          </Link>
          <div className="text-center">
            {(() => {
              const entry = getFloorEntry(currentFloor);
              const label = entry.label
                ? ` — ${entry.label}`
                : "";
              return (
                <div className="font-display text-sm tracking-widest text-amber-400">
                  {entry.chapter ?? `第${currentFloor}階`}{label}
                  {(entry.hpScale !== 1 || entry.damageScale !== 1) && (
                    <span className="ml-2 text-[10px] text-rose-300">
                      HP×{entry.hpScale.toFixed(1)} / 攻×
                      {entry.damageScale.toFixed(1)}
                    </span>
                  )}
                </div>
              );
            })()}
            {!tutorialComplete && (
              <div className="text-[10px] text-emerald-400">
                💡 光っているカードを組み合わせると反応が成立する
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="text-ink-muted hover:text-ink-primary"
              aria-label={muted ? "音を有効化" : "ミュート"}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div className="text-xs text-ink-muted">
              {status === "in-progress" && `ターン ${turn}`}
            </div>
          </div>
        </header>

        <div className="flex flex-1 gap-4 px-6 py-4">
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <EnemyPanel
                  enemy={enemy}
                  hp={enemyHp}
                  block={enemyBlock}
                  strength={enemyStrength}
                  intent={intent}
                  nextIntent={nextIntent}
                  damageNumbers={enemyNumbers}
                  onDamageNumberExpire={removeEnemyNumber}
                  status={enemyStatus}
                />
              </div>
            </div>

            <PlayArea
              cards={playArea}
              onCardClick={onCardReturn}
              disabled={!playerCanAct}
            />

            <div className="flex items-end justify-between gap-4">
              <div className="w-60 shrink-0">
                <PlayerPanel
                  hp={playerHp}
                  maxHp={playerMaxHp}
                  block={playerBlock}
                  energy={playerEnergy}
                  maxEnergy={playerMaxEnergy}
                  turn={turn}
                  damageNumbers={playerNumbers}
                  onDamageNumberExpire={removePlayerNumber}
                  status={playerStatus}
                />
              </div>

              <div className="flex flex-1 flex-col items-center">
                <Hand
                  cards={hand}
                  onCardClick={onCardToPlay}
                  energy={playerEnergy}
                  synergyKeys={synergyKeys}
                />
              </div>

              <div className="w-56 shrink-0">
                {playArea.length > 0 ? (
                  <button
                    type="button"
                    onClick={onResolveReaction}
                    disabled={!playerCanAct}
                    className="pulse-glow inline-flex w-full items-center justify-between gap-2 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-display font-bold text-amber-50 shadow-[0_0_28px_rgba(245,158,11,0.5)] transition hover:from-amber-400 hover:to-orange-500 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <FlaskConical size={18} />
                      反応！
                    </span>
                    <span className="text-xs font-normal opacity-80">
                      {playArea.length} 枚
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={endTurn}
                    disabled={!playerCanAct}
                    className="inline-flex w-full items-center justify-between gap-2 rounded-2xl border-2 border-stone-600 bg-stone-800/80 px-6 py-3 font-display font-bold text-ink-secondary shadow-lg transition hover:border-stone-500 hover:text-ink-primary disabled:opacity-50"
                  >
                    ターン終了
                    <ChevronRight size={20} />
                  </button>
                )}
                {!playerCanAct && phase === "enemy-telegraph" && (
                  <div className="mt-2 text-center text-xs text-rose-300">
                    敵が攻撃を準備中…
                  </div>
                )}
                {playerCanAct && playArea.length === 0 && (
                  <div className="mt-2 text-center text-[11px] text-ink-muted">
                    カードを選ぶと「反応！」になる
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex w-72 shrink-0 flex-col gap-3">
            <EffectsLegend />
            <ReactionLog entries={log} />
          </div>
        </div>
      </div>

      <EnemyAttackBanner pending={pendingEnemyAction} enemyName={enemy.name} />
      <EffectivenessBanner fx={lastFx} />

      <AnimatePresence>
        {battleOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-stone-950/80 backdrop-blur"
          >
            <motion.div
              initial={{ y: 20, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              className="parchment-texture max-w-sm rounded-2xl border-2 border-amber-600 px-8 py-6 text-center gold-frame"
            >
              <h2 className="font-display text-3xl font-bold text-amber-300 gold-glow">
                {status === "victory" ? "撃破！" : "敗北…"}
              </h2>
              <p className="mt-3 text-sm text-ink-secondary">
                {status === "victory"
                  ? `${enemy.name} を反応で打ち砕いた。`
                  : `${enemy.name} に倒された。`}
              </p>
              {status === "victory" && (
                <div className="mt-3 space-y-1 rounded-lg border border-amber-700/60 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
                  <div>デッキは引き継がれる — 使ったカードも山札に戻る</div>
                  <div>
                    HP {runHp} / {runMaxHp}（勝利ボーナスで{" "}
                    {Math.round(runMaxHp * 0.25)} 回復済み）
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (status === "defeat") {
                      beginRun();
                    }
                    // Re-read fresh values after possible reset.
                    const fresh = useRunStore.getState();
                    const nextFloor = fresh.floorsCleared + 1;
                    const scaled = floorEnemyFor(nextFloor);
                    if (scaled) {
                      startBattle(
                        scaled,
                        fresh.snapshotDeck(),
                        fresh.playerHp,
                        fresh.playerMaxHp,
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-4 py-2 text-sm font-bold text-amber-50 hover:bg-amber-500"
                >
                  <RotateCcw size={14} />
                  {status === "victory" ? "次の階へ" : "やり直す"}
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 rounded-full border border-amber-700 px-4 py-2 text-sm text-amber-200 hover:bg-amber-950/50"
                >
                  タイトルへ
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
