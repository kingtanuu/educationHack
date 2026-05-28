import type { ReactionPh, StatusEffectKind } from "@/lib/chemistry/reactions";

export interface EnemyIntent {
  kind: "attack" | "buff" | "defend" | "debuff" | "drain";
  value: number;
  label: string;
  /** For 'debuff' intents: the status to apply to the player. */
  appliesStatus?: {
    kind: StatusEffectKind;
    value: number;
    duration: number;
  };
  /** Extra hits this turn (e.g., 2 for double attack). */
  hits?: number;
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
      {
        kind: "debuff",
        value: 0,
        label: "腐食ジェル",
        appliesStatus: { kind: "burn", value: 2, duration: 2 },
      },
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
      { kind: "attack", value: 12, label: "アルカリの一撃" },
      { kind: "defend", value: 8, label: "石灰化" },
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
      { kind: "attack", value: 6, label: "酸の爪", hits: 2 },
      {
        kind: "debuff",
        value: 0,
        label: "腐食霧",
        appliesStatus: { kind: "burn", value: 3, duration: 3 },
      },
      { kind: "attack", value: 14, label: "強酸ブレス" },
    ],
    flavor: "酸塩基の階の主。強塩基で攻めるべし。",
    emoji: "🐉",
    accent: "#dc2626",
    ph: "acid",
    weakness: "base",
  },
  "catalyst-snake": {
    id: "catalyst-snake",
    name: "触媒蛇",
    reading: "しょくばいへび",
    maxHp: 46,
    intentPattern: [
      { kind: "attack", value: 8, label: "毒牙" },
      {
        kind: "debuff",
        value: 0,
        label: "毒の唾液",
        appliesStatus: { kind: "poison", value: 3, duration: 3 },
      },
      { kind: "drain", value: 6, label: "生命吸収" },
      { kind: "attack", value: 5, label: "尾撃ち", hits: 2 },
    ],
    flavor: "酵素を操る蛇。毒で蝕みつつ生命を吸う。",
    emoji: "🐍",
    accent: "#84cc16",
    ph: "neutral",
    weakness: "neutral",
  },
  "peroxide-genie": {
    id: "peroxide-genie",
    name: "過酸化水素のジン",
    reading: "かさんかすいそのじん",
    maxHp: 62,
    intentPattern: [
      { kind: "defend", value: 12, label: "酸化膜防御" },
      { kind: "buff", value: 4, label: "活性酸素チャージ" },
      { kind: "attack", value: 22, label: "酸化爆発" },
      {
        kind: "debuff",
        value: 0,
        label: "閃光フラッシュ",
        appliesStatus: { kind: "dazzle", value: 1, duration: 2 },
      },
    ],
    flavor: "酸化還元の精霊。溜めた力を一撃で叩きつける。",
    emoji: "💎",
    accent: "#06b6d4",
    ph: "neutral",
    weakness: "base",
  },
};

export function getEnemy(id: string): EnemyDef | undefined {
  return ENEMIES[id];
}
