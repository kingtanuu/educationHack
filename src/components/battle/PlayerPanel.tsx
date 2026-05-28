"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef } from "react";
import { Zap } from "lucide-react";
import { HpBar } from "./HpBar";
import { StatusBadges } from "./StatusBadges";
import {
  DamageNumberLayer,
  type FloatingNumber,
} from "@/components/effects/DamageNumber";
import type { ActiveStatus } from "@/lib/game/battleStore";

interface PlayerPanelProps {
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  maxEnergy: number;
  turn: number;
  damageNumbers: FloatingNumber[];
  onDamageNumberExpire: (id: string) => void;
  status: ActiveStatus[];
}

export function PlayerPanel({
  hp,
  maxHp,
  block,
  energy,
  maxEnergy,
  turn,
  damageNumbers,
  onDamageNumberExpire,
  status,
}: PlayerPanelProps) {
  const controls = useAnimationControls();
  const prevHp = useRef(hp);

  useEffect(() => {
    if (hp < prevHp.current) {
      void controls.start({
        x: [0, -12, 14, -10, 8, 0],
        transition: { duration: 0.5, ease: "easeOut" },
      });
    }
    prevHp.current = hp;
  }, [hp, controls]);

  return (
    <motion.div
      animate={controls}
      className="relative flex flex-col gap-3 rounded-2xl border border-stone-700 bg-stone-900/70 px-4 py-3"
    >
      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span className="font-bold">錬金術師見習い</span>
        <span>ターン {turn}</span>
      </div>
      <HpBar
        current={hp}
        max={maxHp}
        block={block}
        label="HP"
        tint="player"
      />
      <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-700/40 bg-amber-950/40 px-3 py-2">
        <span className="flex items-center gap-2 text-xs text-amber-200">
          <Zap size={14} className="text-amber-400" />
          Energy
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: maxEnergy }).map((_, i) => (
            <div
              key={i}
              className={`h-5 w-5 rounded-full border ${
                i < energy
                  ? "border-amber-300 bg-amber-400 shadow-[0_0_8px_rgba(252,211,77,0.7)]"
                  : "border-stone-700 bg-stone-900"
              }`}
            />
          ))}
        </div>
      </div>
      {status.length > 0 && (
        <div className="rounded-xl border border-rose-700/40 bg-rose-950/30 px-3 py-2">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-rose-300">
            自分にかかっている異常
          </div>
          <StatusBadges effects={status} />
        </div>
      )}
      <DamageNumberLayer
        numbers={damageNumbers}
        onExpire={onDamageNumberExpire}
      />
    </motion.div>
  );
}
