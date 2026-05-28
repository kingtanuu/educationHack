"use client";

import { motion, AnimatePresence } from "framer-motion";

export type DamageKind = "enemy-hit" | "player-hit" | "heal" | "block" | "info";

export interface FloatingNumber {
  id: string;
  amount: number;
  kind: DamageKind;
  text?: string;
}

interface DamageNumberLayerProps {
  numbers: FloatingNumber[];
  onExpire: (id: string) => void;
}

const KIND_STYLES: Record<
  DamageKind,
  { color: string; sign: string; size: string; shadow: string; label?: string }
> = {
  "enemy-hit": {
    color: "#fde047",
    sign: "-",
    size: "text-5xl",
    shadow: "0 0 16px rgba(251,191,36,0.7), 0 4px 12px rgba(0,0,0,0.7)",
  },
  "player-hit": {
    color: "#ef4444",
    sign: "-",
    size: "text-4xl",
    shadow: "0 0 16px rgba(239,68,68,0.85), 0 4px 12px rgba(0,0,0,0.8)",
  },
  heal: {
    color: "#34d399",
    sign: "+",
    size: "text-3xl",
    shadow: "0 0 16px rgba(52,211,153,0.7), 0 4px 12px rgba(0,0,0,0.7)",
    label: "HP",
  },
  block: {
    color: "#7dd3fc",
    sign: "+",
    size: "text-3xl",
    shadow: "0 0 16px rgba(125,211,252,0.7), 0 4px 12px rgba(0,0,0,0.7)",
    label: "🛡",
  },
  info: {
    color: "#f3e7cf",
    sign: "",
    size: "text-2xl",
    shadow: "0 4px 12px rgba(0,0,0,0.7)",
  },
};

export function DamageNumberLayer({ numbers, onExpire }: DamageNumberLayerProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-start justify-center">
      <AnimatePresence>
        {numbers.map((n, i) => {
          const style = KIND_STYLES[n.kind];
          return (
            <motion.div
              key={n.id}
              initial={{ y: 30, opacity: 0, scale: 0.6 }}
              animate={{
                y: -90 - i * 8,
                opacity: 1,
                scale: 1.1,
              }}
              exit={{ opacity: 0, scale: 0.8, y: -140 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              onAnimationComplete={() => onExpire(n.id)}
              className="absolute top-1/2 select-none font-display font-bold tabular-nums"
              style={{
                color: style.color,
                textShadow: style.shadow,
              }}
            >
              <span className={style.size}>
                {style.label ? <span className="mr-1">{style.label}</span> : null}
                {style.sign}
                {n.text ?? Math.abs(n.amount)}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
