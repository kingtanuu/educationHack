# ChemiSpire — 化学塔登り

化学式を、暗記から戦略カードへ。
高校化学の元素・反応をすべてカードに変換した、Slay the Spire オマージュのローグライク・デッキビルダー。

[第7回 学力向上アプリコンテスト](https://compe.japandesign.ne.jp/gakuryokuup-2026/) 応募作品。

## コンセプト

「化学式の暗記が憂鬱だった」という痛点に直接効く設計:

- **元素カード**（H, Na, Cl, HCl, NaOH, Zn など）と **反応条件カード**（加熱・水溶液・点火）を組み合わせ、坩堝に投入
- 反応式が成立すれば爆発的ダメージ（例: `HCl + NaOH → NaCl + H₂O`）
- 失敗反応も学びになる（例: `Cu + 希塩酸` はイオン化傾向で反応しない）
- 反応する組み合わせがある場合、関与するカードが **金色に光って** ヒントを提示
- Slay the Spire 方式の **永続デッキ** — 戦闘間でデッキは引き継がれる

## 技術スタック

- **Framework:** Next.js 16 (App Router) + TypeScript
- **UI:** Tailwind CSS v4 + Framer Motion
- **State:** Zustand
- **数式組版:** KaTeX
- **音:** Web Audio API（実行時合成、外部素材不要）

## ローカルで起動

```bash
npm install
npm run dev
```

http://localhost:3000 を開くと、タイトル画面 → 「塔に挑む」で戦闘開始。

## 主要ディレクトリ

```
src/
├── app/
│   ├── page.tsx                # タイトル画面
│   └── battle/page.tsx         # 戦闘画面
├── components/
│   ├── card/                   # カードUI
│   ├── battle/                 # 戦場・敵・プレイヤーパネル・ログ・坩堝
│   └── effects/                # ダメージ数字・敵攻撃バナー
├── lib/
│   ├── chemistry/              # 反応エンジン・元素・反応定義
│   ├── game/                   # battleStore / runStore
│   └── audio/                  # SFX 合成
└── data/
    ├── cards.ts                # カード定義（チュートリアル＋通常デッキ）
    └── enemies.ts              # 敵 + 行動パターン
```

## 反応エンジン

`src/lib/chemistry/reactions.ts` に反応式をデータ駆動で定義。
`reactionEngine.ts` が手札+坩堝のマッチング・イオン化傾向に基づく失敗判定・**シナジー検出**を行う。

```ts
// 例: 中和反応
{
  id: "neutr-hcl-naoh",
  formula: "HCl + NaOH \\to NaCl + H_2O",
  requires: { elements: { HCl: 1, NaOH: 1 } },
  outcome: { damage: 14, block: 10, heal: 4, produces: ["NaCl", "H2O"] },
  educationalNote: "強酸と強塩基の中和。生成物は中性の食塩水。"
}
```

## ライセンス・素材

- コード: MIT License
- SE/BGM: Web Audio API による実行時合成（外部素材なし）
- 書体: BIZ UDPGothic + Cinzel (Google Fonts)
- アイコン: Lucide React (MIT)

## クレジット

Inspired by [Slay the Spire](https://www.megacrit.com/) (MegaCrit, 2017)。
カードレイアウト・戦闘テンポ・ローグライク進行などの設計哲学をリスペクトしています。
