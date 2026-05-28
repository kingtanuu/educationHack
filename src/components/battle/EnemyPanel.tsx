"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef } from "react";
import { Sword, Shield, Sparkles, AlertTriangle, Target } from "lucide-react";
import type { EnemyDef, EnemyIntent } from "@/data/enemies";
import { phLabel } from "@/lib/chemistry/reactions";
import { HpBar } from "./HpBar";
import { StatusBadges } from "./StatusBadges";
import {
  DamageNumberLayer,
  type FloatingNumber,
} from "@/components/effects/DamageNumber";
import type { ActiveStatus } from "@/lib/game/battleStore";

interface EnemyPanelProps {
  enemy: EnemyDef;
  hp: number;
  intent: EnemyIntent | null;
  damageNumbers: FloatingNumber[];
  onDamageNumberExpire: (id: string) => void;
  status: ActiveStatus[];
}

const INTENT_ICON = {
  attack: Sword,
  defend: Shield,
  buff: Sparkles,
  debuff: AlertTriangle,
};

const PH_BADGE: Record<string, { label: string; chip: string }> = {
  acid: { label: "酸性", chip: "border-rose-500 bg-rose-900/60 text-rose-100" },
  base: { label: "塩基性", chip: "border-sky-500 bg-sky-900/60 text-sky-100" },
  neutral: {
    label: "中性",
    chip: "border-stone-500 bg-stone-800/60 text-ink-secondary",
  },
};

export function EnemyPanel({
  enemy,
  hp,
  intent,
  damageNumbers,
  onDamageNumberExpire,
  status,
}: EnemyPanelProps) {
  const Icon = intent ? INTENT_ICON[intent.kind] : null;
  const controls = useAnimationControls();
  const prevHp = useRef(hp);

  useEffect(() => {
    if (hp < prevHp.current) {
      void controls.start({
        x: [0, -10, 12, -8, 6, 0],
        transition: { duration: 0.45, ease: "easeOut" },
      });
    }
    prevHp.current = hp;
  }, [hp, controls]);

  const phMeta = PH_BADGE[enemy.ph];
  const weakMeta = PH_BADGE[enemy.weakness];

  return (
    <div className="relative flex flex-col items-center gap-3">
      {intent && Icon && (
        <motion.div
          key={intent.label}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 rounded-full border border-stone-700 bg-stone-900/80 px-3 py-1 text-xs text-ink-secondary"
        >
          <Icon size={14} className="text-rose-400" />
          <span className="font-bold">{intent.label}</span>
          {intent.kind === "attack" && (
            <span className="rounded-full bg-rose-600/90 px-2 py-0.5 font-bold text-rose-50">
              {intent.value}
            </span>
          )}
        </motion.div>
      )}

      <div className="relative">
        <motion.div
          animate={controls}
          className="flex flex-col items-center justify-center rounded-2xl border-2 px-8 py-6 text-7xl"
          style={{
            borderColor: enemy.accent,
            background: `radial-gradient(circle at 50% 30%, ${enemy.accent}22, transparent 70%)`,
            boxShadow: `0 0 40px ${enemy.accent}33`,
            opacity: hp <= 0 ? 0.35 : 1,
          }}
        >
          {enemy.emoji}
        </motion.div>
        <DamageNumberLayer
          numbers={damageNumbers}
          onExpire={onDamageNumberExpire}
        />
      </div>

      <div className="w-full max-w-xs text-center">
        <h2 className="font-display text-lg font-bold text-ink-primary">
          {enemy.name}
        </h2>
        <p className="mt-1 text-[11px] text-ink-muted">{enemy.flavor}</p>

        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px]">
          <span
            className={`rounded-full border px-2 py-0.5 font-bold ${phMeta.chip}`}
          >
            {phLabel(enemy.ph)}
          </span>
          {enemy.weakness !== "neutral" && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-bold ${weakMeta.chip}`}
            >
              <Target size={10} />
              弱点: {phLabel(enemy.weakness)}
            </span>
          )}
        </div>

        <div className="mt-3">
          <HpBar current={hp} max={enemy.maxHp} tint="enemy" />
        </div>

        <div className="mt-2">
          <StatusBadges effects={status} />
        </div>
      </div>
    </div>
  );
}
