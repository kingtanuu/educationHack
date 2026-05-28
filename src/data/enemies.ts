import type { ReactionPh } from "@/lib/chemistry/reactions";

export interface EnemyIntent {
  kind: "attack" | "buff" | "defend" | "debuff";
  value: number;
  label: string;
}

export interface EnemyDef {
  id: string;
  name: string;
  reading: string;
  maxHp: number;
  /** Repeating intent pattern shown above the enemy each turn. */
  intentPattern: EnemyIntent[];
  /** Short flavor line shown when the battle starts. */
  flavor: string;
  emoji: string;
  /** Hex color used as the portrait accent. */
  accent: string;
  /** pH the enemy IS — and is therefore resistant to / weak to the opposite. */
  ph: ReactionPh;
  /** pH the enemy is weak to (super effective damage). */
  weakness: ReactionPh;
}

export const ENEMIES: Record<string, EnemyDef> = {
  "acid-slime": {
    id: "acid-slime",
    name: "強酸スライム",
    reading: "きょうさんすらいむ",
    maxHp: 35,
    intentPattern: [
      { kind: "attack", value: 6, label: "酸の飛沫" },
      { kind: "attack", value: 8, label: "酸性ブレス" },
      { kind: "defend", value: 5, label: "ゲル化" },
    ],
    flavor: "床を溶かしながら這い寄る pH 1 の塊。塩基に弱い。",
    emoji: "🟢",
    accent: "#84cc16",
    ph: "acid",
    weakness: "base",
  },
  "base-golem": {
    id: "base-golem",
    name: "塩基ゴーレム",
    reading: "えんきごーれむ",
    maxHp: 42,
    intentPattern: [
      { kind: "attack", value: 7, label: "苛性の拳" },
      { kind: "buff", value: 3, label: "石鹸化(攻撃強化)" },
      { kind: "attack", value: 10, label: "アルカリの一撃" },
    ],
    flavor: "苛性ソーダで固められた歩く岩塊。酸に弱い。",
    emoji: "🟦",
    accent: "#3b82f6",
    ph: "base",
    weakness: "acid",
  },
  "neutral-construct": {
    id: "neutral-construct",
    name: "中性構造体",
    reading: "ちゅうせいこうぞうたい",
    maxHp: 50,
    intentPattern: [
      { kind: "attack", value: 7, label: "金属衝撃" },
      { kind: "defend", value: 8, label: "結晶化" },
      { kind: "attack", value: 11, label: "塩の刃" },
    ],
    flavor: "塩で結晶化した中性の番人。弱点はない。",
    emoji: "⚪",
    accent: "#a3a3a3",
    ph: "neutral",
    weakness: "neutral",
  },
  "acid-dragon": {
    id: "acid-dragon",
    name: "アシッドドラゴン",
    reading: "あしっどどらごん",
    maxHp: 78,
    intentPattern: [
      { kind: "attack", value: 9, label: "硫酸の咆哮" },
      { kind: "attack", value: 6, label: "酸の爪" },
      { kind: "debuff", value: 2, label: "腐食(塩基弱化)" },
      { kind: "attack", value: 14, label: "強酸ブレス" },
    ],
    flavor: "酸塩基の階の主。強塩基で攻めるべし。",
    emoji: "🐉",
    accent: "#dc2626",
    ph: "acid",
    weakness: "base",
  },
};

export function getEnemy(id: string): EnemyDef | undefined {
  return ENEMIES[id];
}
