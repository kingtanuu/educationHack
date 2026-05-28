"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { LastReactionFx } from "@/lib/game/battleStore";

interface EffectivenessBannerProps {
  fx: LastReactionFx | null;
}

export function EffectivenessBanner({ fx }: EffectivenessBannerProps) {
  const show =
    fx !== null &&
    (fx.effectiveness === "super" || fx.effectiveness === "resist");

  return (
    <AnimatePresence>
      {show && fx ? (
        <motion.div
          key={fx.id}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.6, 1.15, 1, 1],
            transition: { duration: 1.4, times: [0, 0.15, 0.7, 1] },
          }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute left-1/2 top-1/3 z-50 -translate-x-1/2 -translate-y-1/2"
        >
          <div
            className={`rounded-full border-2 px-8 py-3 font-display text-2xl font-bold shadow-2xl ${
              fx.effectiveness === "super"
                ? "border-amber-300 bg-gradient-to-r from-amber-500 to-orange-600 text-amber-50 shadow-[0_0_40px_rgba(245,158,11,0.7)]"
                : "border-stone-500 bg-stone-900/95 text-ink-secondary"
            }`}
          >
            {fx.effectiveness === "super"
              ? "効果は抜群だ！"
              : "効果はいまひとつ…"}
            <span className="ml-3 text-base">×{fx.multiplier.toFixed(1)}</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
