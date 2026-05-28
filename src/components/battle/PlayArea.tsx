"use client";

import { FlaskConical, ChevronUp } from "lucide-react";
import { Card } from "@/components/card/Card";
import type { CardDef } from "@/data/cards";
import { motion, AnimatePresence } from "framer-motion";
import { previewMatches } from "@/lib/chemistry/reactionEngine";
import { KaTeX } from "@/components/ui/KaTeX";

interface PlayAreaProps {
  cards: CardDef[];
  onCardClick: (id: string) => void;
  onResolve: () => void;
  disabled?: boolean;
}

function cardsToPlayed(cards: CardDef[]) {
  return cards.map((c) => ({
    kind: c.kind === "condition" ? ("cond" as const) : ("elem" as const),
    key: c.key,
  }));
}

export function PlayArea({
  cards,
  onCardClick,
  onResolve,
  disabled,
}: PlayAreaProps) {
  const matches = cards.length > 0 ? previewMatches(cardsToPlayed(cards)) : [];
  const topMatch = matches[0];

  return (
    <div className="rounded-2xl border-2 border-dashed border-amber-700/50 bg-stone-950/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-sm font-bold text-amber-400">
          <FlaskConical size={16} />
          反応の坩堝
          <span className="text-xs font-normal text-ink-muted">
            ({cards.length} 枚をプレイ中)
          </span>
        </div>
        <button
          type="button"
          disabled={disabled || cards.length === 0}
          onClick={onResolve}
          className={`
            inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-bold transition
            ${
              cards.length === 0 || disabled
                ? "cursor-not-allowed bg-stone-800 text-ink-muted"
                : "bg-gradient-to-r from-amber-600 to-orange-600 text-amber-50 shadow-[0_0_18px_rgba(245,158,11,0.4)] hover:from-amber-500 hover:to-orange-500"
            }
          `}
        >
          反応！
        </button>
      </div>

      <div className="flex min-h-[180px] items-center justify-center gap-2">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center gap-2 text-ink-muted">
            <ChevronUp size={18} />
            <span className="text-xs">
              手札のカードをクリックして坩堝に投入
            </span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {cards.map((card) => (
              <motion.div
                key={card.id}
                layout
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0, transition: { duration: 0.18 } }}
                transition={{ duration: 0.22 }}
              >
                <Card
                  card={card}
                  size="play"
                  onClick={() => onCardClick(card.id)}
                  highlight={topMatch !== undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {topMatch && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-xl border border-amber-700/60 bg-amber-950/40 px-3 py-2"
        >
          <div className="text-[10px] uppercase tracking-wider text-amber-400">
            予測される反応
          </div>
          <div className="mt-1 overflow-x-auto rounded bg-stone-950/60 px-2 py-1 text-center">
            <KaTeX expression={topMatch.formula} displayMode />
          </div>
          <div className="mt-1 text-xs text-ink-secondary">
            {topMatch.name} — 期待ダメージ{" "}
            <span className="font-bold text-orange-300">
              {topMatch.outcome.damage}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
