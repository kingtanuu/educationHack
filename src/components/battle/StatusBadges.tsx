"use client";

import type { ActiveStatus } from "@/lib/game/battleStore";

interface StatusBadgesProps {
  effects: ActiveStatus[];
}

const META: Record<
  ActiveStatus["kind"],
  { icon: string; label: string; tint: string }
> = {
  poison: {
    icon: "☠️",
    label: "毒",
    tint: "border-emerald-500 bg-emerald-900/70 text-emerald-100",
  },
  burn: {
    icon: "🔥",
    label: "燃焼",
    tint: "border-orange-500 bg-orange-900/70 text-orange-100",
  },
  paralyze: {
    icon: "💫",
    label: "麻痺",
    tint: "border-purple-500 bg-purple-900/70 text-purple-100",
  },
  "block-buff": {
    icon: "🛡",
    label: "強化",
    tint: "border-sky-500 bg-sky-900/70 text-sky-100",
  },
};

export function StatusBadges({ effects }: StatusBadgesProps) {
  if (effects.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {effects.map((e, i) => {
        const meta = META[e.kind];
        return (
          <div
            key={`${e.kind}-${i}`}
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${meta.tint}`}
            title={`${meta.label} ${e.value} (残り ${e.remaining}ターン)`}
          >
            <span>{meta.icon}</span>
            <span className="font-bold">{meta.label}</span>
            <span className="font-mono">
              {e.value} × {e.remaining}
            </span>
          </div>
        );
      })}
    </div>
  );
}
