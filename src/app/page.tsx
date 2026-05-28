import Link from "next/link";
import { FlaskConical, Sparkles, ScrollText, Swords } from "lucide-react";

export default function TitlePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient ember dots */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="ember absolute h-1.5 w-1.5 rounded-full bg-amber-400/30 blur-[1px]"
            style={{
              left: `${(i * 47) % 100}%`,
              top: `${(i * 71) % 100}%`,
              animationDelay: `${(i % 6) * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(212,166,71,0.12),transparent_60%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-12">
        <div className="flex items-center gap-3 text-amber-500">
          <FlaskConical size={24} />
          <span className="font-display text-xs uppercase tracking-[0.4em]">
            Inspired by Slay the Spire
          </span>
          <Sparkles size={20} />
        </div>

        <h1 className="mt-6 text-center">
          <span className="font-display block text-6xl font-bold tracking-tight text-amber-300 gold-glow md:text-7xl">
            ChemiSpire
          </span>
          <span className="mt-2 block text-2xl text-ink-secondary md:text-3xl">
            化学塔登り
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-center text-base leading-relaxed text-ink-secondary">
          化学式を、暗記から戦略カードへ。
          <br />
          ランダムに配られた元素を組み合わせ、反応式を成立させて化学塔を登る、
          高校化学の<strong className="text-amber-300">ローグライク・デッキビルダー</strong>。
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/battle"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-500 bg-gradient-to-b from-amber-600 to-amber-700 px-8 py-3 font-display text-lg font-bold text-amber-50 shadow-[0_0_24px_rgba(245,205,91,0.35)] transition hover:from-amber-500 hover:to-amber-600"
          >
            <Swords size={20} />
            塔に挑む
          </Link>
          <Link
            href="/codex"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-700 bg-stone-900/60 px-8 py-3 font-display text-base text-ink-secondary transition hover:border-amber-700/60 hover:text-amber-200"
          >
            <ScrollText size={18} />
            反応の書 (準備中)
          </Link>
        </div>

        <div className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          <FeatureCard
            label="戦略ドラフト"
            description="元素・条件・法則カードを毎ラン引き直し、唯一無二のデッキを組む。"
          />
          <FeatureCard
            label="反応式は武器"
            description="Na + Cl で大ダメージ、HCl + NaOH で中和回復。化学式が攻撃手段になる。"
          />
          <FeatureCard
            label="失敗からも学ぶ"
            description="銅と希塩酸は反応しない。失敗反応も教科書的解説で記憶に残る。"
          />
        </div>

        <footer className="mt-12 text-center text-xs text-ink-muted">
          © 2026 ChemiSpire — Built for{" "}
          <a
            href="https://compe.japandesign.ne.jp/gakuryokuup-2026/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-300"
          >
            第7回 学力向上アプリコンテスト
          </a>
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-stone-700/70 bg-stone-900/40 p-4">
      <div className="font-display text-sm font-bold text-amber-300">
        {label}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
        {description}
      </p>
    </div>
  );
}
