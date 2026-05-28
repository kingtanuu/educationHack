import Link from "next/link";
import { ArrowLeft, BookOpen, FlaskConical } from "lucide-react";
import { KaTeX } from "@/components/ui/KaTeX";
import { REACTIONS, phLabel } from "@/lib/chemistry/reactions";
import { ELEMENTS } from "@/lib/chemistry/elements";
import { CONDITIONS } from "@/lib/chemistry/conditions";

const PH_CHIP: Record<string, string> = {
  acid: "border-rose-500/70 bg-rose-900/40 text-rose-100",
  base: "border-sky-500/70 bg-sky-900/40 text-sky-100",
  neutral: "border-stone-500/70 bg-stone-800/60 text-ink-secondary",
};

const REACTION_TYPE_LABEL: Record<string, string> = {
  synthesis: "合成",
  combustion: "燃焼",
  neutralization: "中和",
  displacement: "置換",
  redox: "酸化還元",
  precipitation: "沈殿",
  "gas-formation": "気体発生",
  decomposition: "分解",
};

const STATUS_META = {
  poison: { label: "毒", icon: "☠️", tint: "text-emerald-200" },
  burn: { label: "燃焼", icon: "🔥", tint: "text-orange-200" },
  paralyze: { label: "麻痺", icon: "💫", tint: "text-purple-200" },
  "block-buff": { label: "強化", icon: "🛡", tint: "text-sky-200" },
} as const;

const PH_LEGEND = [
  {
    icon: "🟥",
    label: "酸性 攻撃",
    description: "塩基性の敵に ×1.7、酸性の敵には ×0.5。HCl・H₂SO₄ などを消費する反応。",
  },
  {
    icon: "🟦",
    label: "塩基性 攻撃",
    description: "酸性の敵に ×1.7、塩基性の敵には ×0.5。NaOH・NH₃・Mg燃焼など。",
  },
  {
    icon: "⚪",
    label: "中性 攻撃",
    description: "相性補正なし、安定して ×1.0。中和・合成・水の生成など。",
  },
];

const STATUS_LEGEND = [
  {
    icon: "☠️",
    label: "毒 / Poison",
    description: "ターン開始時に固定ダメージ。複数ターン継続。代表例: 銅 + 希硝酸 (NO ガス)。",
  },
  {
    icon: "🔥",
    label: "燃焼 / Burn",
    description: "毒と同様の DoT。代表例: 水素の燃焼、マグネシウム燃焼。",
  },
  {
    icon: "💫",
    label: "麻痺 / Paralyze",
    description: "敵の次の行動を1ターン無効化。代表例: 塩化銀の沈殿 (粒子が動きを止める)。",
  },
  {
    icon: "💚",
    label: "回復 / Heal",
    description: "プレイヤーの HP を回復。代表例: 中和反応 (HCl + NaOH)。",
  },
  {
    icon: "🛡",
    label: "ブロック / Block",
    description: "次の敵攻撃を吸収する一時的な防御値。ターン終了で消滅。",
  },
];

function reagentChip(key: string, count: number) {
  const elem = ELEMENTS[key];
  const cond = CONDITIONS[key];
  if (elem) {
    return {
      label: `${elem.symbol}${count > 1 ? ` ×${count}` : ""}`,
      sub: elem.name,
      tint: "border-orange-600/60 bg-orange-950/30 text-orange-100",
    };
  }
  if (cond) {
    return {
      label: cond.name,
      sub: "条件",
      tint: "border-emerald-600/60 bg-emerald-950/30 text-emerald-100",
    };
  }
  return {
    label: key,
    sub: "",
    tint: "border-stone-600/60 bg-stone-900/30 text-ink-secondary",
  };
}

export default function CodexPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(212,166,71,0.1),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        <header className="flex items-center justify-between border-b border-stone-700/60 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink-primary"
          >
            <ArrowLeft size={16} /> タイトルへ
          </Link>
          <h1 className="font-display text-2xl font-bold text-amber-300 gold-glow">
            反応の書
          </h1>
          <span className="text-xs text-ink-muted">化学反応レシピ＆効果</span>
        </header>

        {/* Legends */}
        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-700 bg-stone-950/60 p-4">
            <h2 className="mb-2 flex items-center gap-2 font-display text-sm font-bold text-amber-300">
              <BookOpen size={14} /> pH 相性
            </h2>
            <div className="space-y-1.5">
              {PH_LEGEND.map((e) => (
                <div
                  key={e.label}
                  className="flex gap-2 rounded-lg border border-stone-700/60 bg-stone-900/40 px-2 py-1.5 text-xs"
                >
                  <span className="shrink-0 text-base">{e.icon}</span>
                  <div>
                    <div className="font-bold text-ink-primary">{e.label}</div>
                    <div className="leading-snug text-ink-muted">
                      {e.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-700 bg-stone-950/60 p-4">
            <h2 className="mb-2 flex items-center gap-2 font-display text-sm font-bold text-amber-300">
              <BookOpen size={14} /> ステータス効果
            </h2>
            <div className="space-y-1.5">
              {STATUS_LEGEND.map((e) => (
                <div
                  key={e.label}
                  className="flex gap-2 rounded-lg border border-stone-700/60 bg-stone-900/40 px-2 py-1.5 text-xs"
                >
                  <span className="shrink-0 text-base">{e.icon}</span>
                  <div>
                    <div className="font-bold text-ink-primary">{e.label}</div>
                    <div className="leading-snug text-ink-muted">
                      {e.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reaction recipes */}
        <section className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-amber-300">
            <FlaskConical size={18} /> 反応レシピ一覧
          </h2>
          <p className="mb-4 text-xs text-ink-muted">
            必要なカードを坩堝に揃えると、対応する反応式が発火する。pH 相性が
            敵の弱点と合えば ×1.7 の大ダメージ。
          </p>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {REACTIONS.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border border-stone-700 bg-stone-950/60 p-4"
              >
                <header className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-ink-primary">
                    {r.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${PH_CHIP[r.ph]}`}
                    >
                      {phLabel(r.ph)}
                    </span>
                    <span className="rounded-full border border-stone-700 bg-stone-900/60 px-2 py-0.5 text-[10px] text-ink-muted">
                      {REACTION_TYPE_LABEL[r.type] ?? r.type}
                    </span>
                  </div>
                </header>

                {/* Required cards */}
                <div className="mb-3">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-ink-muted">
                    必要カード
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(r.requires.elements).map(([k, count]) => {
                      const c = reagentChip(k, count);
                      return (
                        <span
                          key={k}
                          className={`rounded-md border px-2 py-0.5 text-xs font-bold ${c.tint}`}
                        >
                          {c.label}
                          {c.sub && (
                            <span className="ml-1 text-[10px] font-normal opacity-70">
                              {c.sub}
                            </span>
                          )}
                        </span>
                      );
                    })}
                    {r.requires.conditions?.map((k) => {
                      const c = reagentChip(k, 1);
                      return (
                        <span
                          key={k}
                          className={`rounded-md border px-2 py-0.5 text-xs font-bold ${c.tint}`}
                        >
                          {c.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Formula */}
                <div className="mb-3 overflow-x-auto rounded bg-stone-950/70 px-2 py-2 text-center">
                  <KaTeX expression={r.formula} displayMode />
                </div>

                {/* Effects */}
                <div className="mb-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-full border border-rose-600/60 bg-rose-950/40 px-2 py-0.5 font-bold text-rose-100">
                    💥 ダメージ {r.outcome.damage}
                  </span>
                  {r.outcome.block ? (
                    <span className="rounded-full border border-sky-600/60 bg-sky-950/40 px-2 py-0.5 text-sky-100">
                      🛡 ブロック +{r.outcome.block}
                    </span>
                  ) : null}
                  {r.outcome.heal ? (
                    <span className="rounded-full border border-emerald-600/60 bg-emerald-950/40 px-2 py-0.5 text-emerald-100">
                      💚 回復 +{r.outcome.heal}
                    </span>
                  ) : null}
                  {r.outcome.statusEffects?.map((eff, i) => {
                    const meta = STATUS_META[eff.kind];
                    return (
                      <span
                        key={`${r.id}-fx-${i}`}
                        className={`rounded-full border border-stone-600/70 bg-stone-900/60 px-2 py-0.5 ${meta.tint}`}
                      >
                        {meta.icon} {meta.label} {eff.value}×{eff.duration}
                      </span>
                    );
                  })}
                  {r.outcome.produces?.length ? (
                    <span className="rounded-full border border-purple-600/60 bg-purple-950/40 px-2 py-0.5 text-purple-100">
                      🧪 生成: {r.outcome.produces.join(", ")}
                    </span>
                  ) : null}
                </div>

                <p className="text-xs leading-relaxed text-ink-muted">
                  {r.educationalNote}
                </p>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-10 border-t border-stone-700/60 pt-4 text-center text-xs text-ink-muted">
          © 2026 ChemiSpire — {REACTIONS.length} 反応式収録
        </footer>
      </div>
    </main>
  );
}
