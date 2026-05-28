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
    flavor: "床を溶かしながら這い寄る pH 1 の塊。",
    emoji: "🟢",
    accent: "#84cc16",
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
    flavor: "苛性ソーダで固められた歩く岩塊。",
    emoji: "🟦",
    accent: "#3b82f6",
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
    flavor: "酸塩基の階の主。塩基カードを腐食させる。",
    emoji: "🐉",
    accent: "#dc2626",
  },
};

export function getEnemy(id: string): EnemyDef | undefined {
  return ENEMIES[id];
}
