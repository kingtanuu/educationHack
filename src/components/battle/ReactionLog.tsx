"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Skull, Info, AlertTriangle } from "lucide-react";
import type { LogEntry } from "@/lib/game/battleStore";
import { KaTeX } from "@/components/ui/KaTeX";

interface ReactionLogProps {
  entries: LogEntry[];
}

const KIND_STYLE = {
  success: {
    icon: Check,
    border: "border-emerald-700/50",
    bg: "bg-emerald-950/30",
    text: "text-emerald-200",
    iconClass: "text-emerald-400",
  },
  failure: {
    icon: X,
    border: "border-rose-700/50",
    bg: "bg-rose-950/30",
    text: "text-rose-200",
    iconClass: "text-rose-400",
  },
  "no-match": {
    icon: AlertTriangle,
    border: "border-amber-700/50",
    bg: "bg-amber-950/30",
    text: "text-amber-100",
    iconClass: "text-amber-400",
  },
  enemy: {
    icon: Skull,
    border: "border-stone-700/50",
    bg: "bg-stone-900/40",
    text: "text-rose-100",
    iconClass: "text-rose-500",
  },
  info: {
    icon: Info,
    border: "border-stone-700/50",
    bg: "bg-stone-900/40",
    text: "text-ink-secondary",
    iconClass: "text-ink-muted",
  },
};

export function ReactionLog({ entries }: ReactionLogProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-stone-700 bg-stone-950/60">
      <div className="border-b border-stone-700/70 px-3 py-2 font-display text-sm font-bold text-ink-secondary">
        反応式の書
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        <AnimatePresence initial={false}>
          {entries.map((entry) => {
            const style = KIND_STYLE[entry.kind] ?? KIND_STYLE.info;
            const Icon = style.icon;
            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-2 rounded-xl border ${style.border} ${style.bg} px-3 py-2`}
              >
                <Icon size={16} className={`mt-0.5 shrink-0 ${style.iconClass}`} />
                <div className="flex-1">
                  {entry.formula && (
                    <div className="mb-1 overflow-x-auto rounded bg-stone-950/60 px-2 py-1 text-center text-ink-primary">
                      <KaTeX expression={entry.formula} displayMode />
                    </div>
                  )}
                  <div className={`text-xs leading-relaxed ${style.text}`}>
                    {entry.text}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {entries.length === 0 && (
          <div className="text-center text-xs text-ink-muted">
            まだ反応は記録されていない。
          </div>
        )}
      </div>
    </div>
  );
}
