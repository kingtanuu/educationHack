"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";

interface LegendEntry {
  icon: string;
  label: string;
  description: string;
  tint: string;
}

const PH_ENTRIES: LegendEntry[] = [
  {
    icon: "🟥",
    label: "酸性 攻撃",
    description: "塩基性の敵に大ダメージ (×1.7)、酸性の敵には軽減 (×0.5)。",
    tint: "border-rose-700/50 bg-rose-950/30",
  },
  {
    icon: "🟦",
    label: "塩基性 攻撃",
    description: "酸性の敵に大ダメージ (×1.7)、塩基性の敵には軽減 (×0.5)。",
    tint: "border-sky-700/50 bg-sky-950/30",
  },
  {
    icon: "⚪",
    label: "中性 攻撃",
    description: "相性補正なし。安定して 1 倍ダメージ。",
    tint: "border-stone-700/50 bg-stone-900/40",
  },
];

const STATUS_ENTRIES: LegendEntry[] = [
  {
    icon: "☠️",
    label: "毒 / Poison",
    description: "ターン開始時に固定ダメージ。重ねがけは値の最大値を保持。",
    tint: "border-emerald-700/60 bg-emerald-950/40",
  },
  {
    icon: "🔥",
    label: "燃焼 / Burn",
    description: "毒と同様にターン開始時のDoT。燃焼物質との相性で発動。",
    tint: "border-orange-700/60 bg-orange-950/40",
  },
  {
    icon: "💫",
    label: "麻痺 / Paralyze",
    description: "敵の次の行動を1ターンスキップ。沈殿反応で発動しやすい。",
    tint: "border-purple-700/60 bg-purple-950/40",
  },
  {
    icon: "✨",
    label: "目眩し / Dazzle",
    description: "強い閃光で敵の攻撃ダメージを 50% に減衰。マグネシウム燃焼で発動。",
    tint: "border-yellow-600/70 bg-yellow-900/40",
  },
  {
    icon: "💚",
    label: "回復 / Heal",
    description: "プレイヤーの HP を回復。中和反応のオマケで付くことが多い。",
    tint: "border-green-700/60 bg-green-950/40",
  },
  {
    icon: "🛡",
    label: "ブロック / Block",
    description: "次の敵攻撃を吸収。ターン終了で消滅する一時防御。",
    tint: "border-sky-700/60 bg-sky-950/40",
  },
];

export function EffectsLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-stone-700 bg-stone-950/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 font-display text-sm font-bold text-amber-300 transition hover:text-amber-200"
      >
        <span className="flex items-center gap-2">
          <BookOpen size={14} />
          化学効果の凡例
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="space-y-2 border-t border-stone-700/70 p-3">
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-muted">
              pH 相性
            </div>
            <div className="space-y-1.5">
              {PH_ENTRIES.map((e) => (
                <Entry key={e.label} entry={e} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 mt-3 text-[10px] uppercase tracking-wider text-ink-muted">
              ステータス効果
            </div>
            <div className="space-y-1.5">
              {STATUS_ENTRIES.map((e) => (
                <Entry key={e.label} entry={e} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Entry({ entry }: { entry: LegendEntry }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-2 py-1.5 text-xs ${entry.tint}`}
    >
      <span className="shrink-0 text-base">{entry.icon}</span>
      <div>
        <div className="font-bold text-ink-primary">{entry.label}</div>
        <div className="leading-snug text-ink-muted">{entry.description}</div>
      </div>
    </div>
  );
}
