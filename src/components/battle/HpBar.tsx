"use client";

import { motion } from "framer-motion";

interface HpBarProps {
  current: number;
  max: number;
  block?: number;
  label?: string;
  tint?: "player" | "enemy";
}

export function HpBar({ current, max, block = 0, label, tint = "enemy" }: HpBarProps) {
  const pct = max > 0 ? (current / max) * 100 : 0;
  const fillClass =
    tint === "enemy"
      ? "bg-gradient-to-r from-red-700 to-red-500"
      : "bg-gradient-to-r from-emerald-700 to-emerald-500";

  return (
    <div className="w-full">
      {label && (
        <div className="mb-0.5 flex items-center justify-between text-xs text-ink-secondary">
          <span className="font-bold">{label}</span>
          <span className="tabular-nums">
            {current} / {max}
            {block > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-sky-700/40 px-2 py-0.5 text-[10px] font-bold text-sky-200">
                🛡 {block}
              </span>
            )}
          </span>
        </div>
      )}
      <div className="relative h-3 w-full overflow-hidden rounded-full border border-stone-700 bg-stone-900">
        <motion.div
          className={`h-full ${fillClass}`}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
