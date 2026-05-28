import { ENEMIES, type EnemyDef } from "./enemies";

export interface FloorEntry {
  enemyId: string;
  hpScale: number;
  damageScale: number;
  label?: string;
  /** Human-friendly chapter heading. */
  chapter?: string;
}

/**
 * Hand-tuned ladder of encounters. Index = floor - 1.
 * Beyond the list, we extrapolate aggressively.
 */
export const FLOOR_PLAN: FloorEntry[] = [
  // 第1階: チュートリアル — 弱点を学ぶ
  {
    enemyId: "acid-slime",
    hpScale: 1.0,
    damageScale: 1.0,
    label: "チュートリアル",
    chapter: "第1階",
  },
  // 第2階: 反対の弱点を持つ敵
  {
    enemyId: "base-golem",
    hpScale: 1.0,
    damageScale: 1.0,
    chapter: "第2階",
  },
  // 第3階: 強化されたスライム + デバフ
  {
    enemyId: "acid-slime",
    hpScale: 1.5,
    damageScale: 1.2,
    label: "強化",
    chapter: "第3階",
  },
  // 第4階: 弱点なしの硬い敵
  {
    enemyId: "neutral-construct",
    hpScale: 1.0,
    damageScale: 1.0,
    chapter: "第4階",
  },
  // 第5階: 毒系のトリッキー敵
  {
    enemyId: "catalyst-snake",
    hpScale: 1.0,
    damageScale: 1.0,
    chapter: "第5階",
  },
  // 第6階: 強化されたゴーレム
  {
    enemyId: "base-golem",
    hpScale: 1.6,
    damageScale: 1.3,
    label: "エリート",
    chapter: "第6階",
  },
  // 第7階: 過酸化水素のジン — 蓄積→大攻撃
  {
    enemyId: "peroxide-genie",
    hpScale: 1.0,
    damageScale: 1.0,
    chapter: "第7階",
  },
  // 第8階: 第1章ボス
  {
    enemyId: "acid-dragon",
    hpScale: 1.0,
    damageScale: 1.0,
    label: "第1章ボス",
    chapter: "第8階",
  },
];

export function getFloorEntry(floor: number): FloorEntry {
  if (floor >= 1 && floor <= FLOOR_PLAN.length) {
    return FLOOR_PLAN[floor - 1];
  }
  // Past the curated list, scale aggressively against the dragon.
  const beyond = floor - FLOOR_PLAN.length;
  return {
    enemyId: "acid-dragon",
    hpScale: 1.2 + beyond * 0.3,
    damageScale: 1.15 + beyond * 0.2,
    label: "深層",
    chapter: `第${floor}階`,
  };
}

/** Apply the scaling to produce a battle-ready enemy. */
export function buildScaledEnemy(entry: FloorEntry): EnemyDef | null {
  const base = ENEMIES[entry.enemyId];
  if (!base) return null;
  return {
    ...base,
    maxHp: Math.max(10, Math.round(base.maxHp * entry.hpScale)),
    intentPattern: base.intentPattern.map((intent) => ({
      ...intent,
      value:
        intent.kind === "attack" || intent.kind === "drain"
          ? Math.max(1, Math.round(intent.value * entry.damageScale))
          : intent.value,
    })),
  };
}

export function floorEnemyFor(floor: number): EnemyDef | null {
  return buildScaledEnemy(getFloorEntry(floor));
}
