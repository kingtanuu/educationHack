"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sword, Shield, Sparkles, AlertTriangle, Droplet } from "lucide-react";
import type { PendingEnemyAction } from "@/lib/game/battleStore";
import type { EnemyIntent } from "@/data/enemies";

interface EnemyAttackBannerProps {
  pending: PendingEnemyAction | null;
  enemyName: string;
}

const ICON_BY_KIND: Record<EnemyIntent["kind"], typeof Sword> = {
  attack: Sword,
  defend: Shield,
  buff: Sparkles,
  debuff: AlertTriangle,
  drain: Droplet,
};

export function EnemyAttackBanner({
  pending,
  enemyName,
}: EnemyAttackBannerProps) {
  return (
    <AnimatePresence>
      {pending ? (
        <motion.div
          key={pending.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="rounded-2xl border-2 border-rose-500 bg-gradient-to-b from-rose-950/95 to-stone-950/95 px-8 py-5 text-center shadow-[0_0_40px_rgba(244,63,94,0.5)] backdrop-blur">
            <div className="text-xs uppercase tracking-[0.4em] text-rose-300">
              敵のターン
            </div>
            <div className="mt-1 flex items-center justify-center gap-3">
              {(() => {
                const Icon = ICON_BY_KIND[pending.intent.kind];
                return <Icon size={22} className="text-rose-400" />;
              })()}
              <span className="font-display text-2xl font-bold text-rose-50">
                {enemyName} の {pending.intent.label}
              </span>
            </div>
            {pending.intent.kind === "attack" && (
              <div className="mt-2 text-sm">
                <span className="text-rose-200">
                  {pending.intent.value} ダメージ
                </span>
                {pending.blocked > 0 && (
                  <span className="ml-2 text-sky-300">
                    🛡 {pending.blocked} 防御
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
