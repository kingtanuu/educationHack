"use client";

import { motion } from "framer-motion";
import type { CardDef } from "@/data/cards";
import { ELEMENTS } from "@/lib/chemistry/elements";
import { CONDITIONS } from "@/lib/chemistry/conditions";

interface CardProps {
  card: CardDef;
  size?: "hand" | "play" | "preview";
  onClick?: () => void;
  disabled?: boolean;
  highlight?: boolean;
  /** Pulsing gold glow to indicate this card participates in an achievable reaction. */
  synergy?: boolean;
}

const SIZE_CLASSES = {
  hand: "w-[128px] h-[182px]",
  play: "w-[108px] h-[150px]",
  preview: "w-[200px] h-[280px]",
};

const KIND_THEME: Record<
  string,
  { bg: string; border: string; glow: string; chip: string; label: string }
> = {
  element: {
    bg: "from-orange-950 via-red-950 to-stone-950",
    border: "border-orange-700",
    glow: "shadow-[0_0_20px_rgba(251,146,60,0.25)]",
    chip: "bg-orange-600/80 text-orange-50",
    label: "元素",
  },
  condition: {
    bg: "from-emerald-950 via-green-950 to-stone-950",
    border: "border-emerald-700",
    glow: "shadow-[0_0_20px_rgba(74,222,128,0.25)]",
    chip: "bg-emerald-600/80 text-emerald-50",
    label: "条件",
  },
  law: {
    bg: "from-blue-950 via-indigo-950 to-stone-950",
    border: "border-blue-700",
    glow: "shadow-[0_0_20px_rgba(96,165,250,0.25)]",
    chip: "bg-blue-600/80 text-blue-50",
    label: "法則",
  },
  compound: {
    bg: "from-purple-950 via-fuchsia-950 to-stone-950",
    border: "border-purple-700",
    glow: "shadow-[0_0_20px_rgba(192,132,252,0.25)]",
    chip: "bg-purple-600/80 text-purple-50",
    label: "化合物",
  },
  alchemy: {
    bg: "from-amber-900 via-yellow-900 to-stone-950",
    border: "border-amber-500",
    glow: "shadow-[0_0_24px_rgba(253,224,71,0.35)]",
    chip: "bg-amber-500/90 text-amber-950",
    label: "錬金",
  },
};

export function Card({
  card,
  size = "hand",
  onClick,
  disabled,
  highlight,
  synergy,
}: CardProps) {
  const theme = KIND_THEME[card.kind] ?? KIND_THEME.element;
  const elementMeta = card.kind === "element" ? ELEMENTS[card.key] : undefined;
  const conditionMeta =
    card.kind === "condition" ? CONDITIONS[card.key] : undefined;

  const displaySymbol = elementMeta?.symbol ?? conditionMeta?.name ?? card.key;
  const displayName = elementMeta?.name ?? conditionMeta?.name ?? card.key;
  const reading = elementMeta?.reading ?? conditionMeta?.reading;
  const flavor =
    elementMeta?.flavor ??
    conditionMeta?.description ??
    card.flavor ??
    "";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { y: -6, scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      animate={
        synergy && !disabled
          ? {
              y: [-4, -10, -4],
              boxShadow: [
                "0 0 0px rgba(252,211,77,0.0), 0 6px 16px rgba(0,0,0,0.5)",
                "0 0 28px rgba(252,211,77,0.55), 0 6px 16px rgba(0,0,0,0.5)",
                "0 0 0px rgba(252,211,77,0.0), 0 6px 16px rgba(0,0,0,0.5)",
              ],
            }
          : highlight
            ? { y: -8 }
            : { y: 0 }
      }
      transition={
        synergy && !disabled
          ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.25 }
      }
      className={`
        ${SIZE_CLASSES[size]}
        relative flex flex-col overflow-hidden rounded-xl border-2 text-left
        bg-gradient-to-b ${theme.bg}
        ${synergy && !disabled ? "border-amber-300" : theme.border}
        ${disabled ? "opacity-40 grayscale" : "cursor-pointer"}
        ${highlight ? theme.glow : ""}
        card-shadow
      `}
    >
      {/* Energy cost */}
      <div className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-yellow-300/60 bg-amber-500 text-sm font-bold text-amber-950 shadow-md">
        {card.energyCost}
      </div>

      {/* Kind chip */}
      <div
        className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${theme.chip}`}
      >
        {theme.label}
      </div>

      {/* Symbol */}
      <div className="flex flex-1 flex-col items-center justify-center px-3 pt-8">
        <div
          className="font-serif text-4xl font-bold tracking-tight"
          style={{
            color: elementMeta?.spiritColor ?? "#f3e7cf",
            textShadow: "0 2px 6px rgba(0,0,0,0.6), 0 0 12px currentColor",
          }}
        >
          {displaySymbol}
        </div>
        <div className="mt-1 text-center text-xs text-ink-secondary">
          {displayName}
        </div>
        {reading && (
          <div className="mt-0.5 text-[10px] text-ink-muted">
            {reading}
          </div>
        )}
      </div>

      {/* Flavor + stats */}
      <div className="border-t border-stone-700/50 bg-stone-950/60 px-2 py-1.5">
        {flavor && size !== "play" && (
          <p className="line-clamp-2 text-[10px] leading-tight text-ink-muted">
            {flavor}
          </p>
        )}
        {card.soloDamage > 0 && (
          <div className="mt-1 flex items-center justify-end gap-1 text-xs font-bold text-orange-300">
            <span className="text-stone-400 font-normal">単発</span>
            <span>{card.soloDamage}</span>
            <span className="text-stone-400 font-normal">dmg</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}
