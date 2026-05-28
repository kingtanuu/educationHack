/**
 * Reaction database for ChemiSpire battles.
 *
 * Each reaction declares which reagent symbols and which conditions
 * must appear (as a multiset) among the cards a player has put into
 * play this turn. The reactionEngine picks the highest-priority match.
 */

export type ReactionType =
  | "synthesis"
  | "combustion"
  | "neutralization"
  | "displacement"
  | "redox"
  | "precipitation"
  | "gas-formation"
  | "decomposition";

/** Acid / base / neutral classification for type-matchup damage. */
export type ReactionPh = "acid" | "base" | "neutral";

export type StatusEffectKind =
  | "poison"
  | "paralyze"
  | "burn"
  | "block-buff";

export interface AppliedStatusEffect {
  kind: StatusEffectKind;
  /** Magnitude per tick (e.g., poison damage). */
  value: number;
  /** Turns this effect lasts. */
  duration: number;
}

export interface ReactionRequirements {
  /** Symbols and counts the player must have on the table. */
  elements: Record<string, number>;
  /** Optional condition card IDs that must be present. */
  conditions?: string[];
}

export interface ReactionOutcome {
  damage: number;
  block?: number;
  heal?: number;
  /** Compound card IDs added to the player's discard pile. */
  produces?: string[];
  /** Visual effect key used by the battle field. */
  effect?: "fire" | "spark" | "fizz" | "smoke" | "crystal" | "color-change";
  /** Status effects to apply to the enemy on success. */
  statusEffects?: AppliedStatusEffect[];
}

export interface ReactionDef {
  id: string;
  name: string;
  /** KaTeX-formatted formula string (no leading $/$$). */
  formula: string;
  type: ReactionType;
  /** pH category that determines damage matchup against enemy weakness. */
  ph: ReactionPh;
  requires: ReactionRequirements;
  outcome: ReactionOutcome;
  /** Priority for tie-breaking when multiple reactions match (higher wins). */
  priority: number;
  /** Sentence shown after the reaction triggers. */
  educationalNote: string;
}

export const REACTIONS: ReactionDef[] = [
  {
    id: "synth-nacl",
    name: "塩化ナトリウムの生成",
    formula: "2Na + Cl_2 \\to 2NaCl",
    type: "synthesis",
    ph: "neutral",
    requires: { elements: { Na: 1, Cl: 1 } },
    outcome: {
      damage: 28,
      produces: ["NaCl"],
      effect: "spark",
    },
    priority: 10,
    educationalNote:
      "ナトリウムは塩素と激しく反応してイオン結合の塩化ナトリウム(食塩)を作る。",
  },
  {
    id: "neutr-hcl-naoh",
    name: "塩酸と水酸化ナトリウムの中和",
    formula: "HCl + NaOH \\to NaCl + H_2O",
    type: "neutralization",
    ph: "neutral",
    requires: { elements: { HCl: 1, NaOH: 1 } },
    outcome: {
      damage: 14,
      block: 10,
      heal: 4,
      produces: ["NaCl", "H2O"],
      effect: "color-change",
    },
    priority: 20,
    educationalNote:
      "強酸と強塩基の中和。生成物は中性の食塩水。pH 指示薬の色が変わる代表反応。",
  },
  {
    id: "combust-h2-o2",
    name: "水素の燃焼",
    formula: "2H_2 + O_2 \\to 2H_2O",
    type: "combustion",
    ph: "neutral",
    requires: { elements: { H: 2, O: 1 }, conditions: ["cond-ignite"] },
    outcome: {
      damage: 36,
      produces: ["H2O"],
      effect: "fire",
      statusEffects: [{ kind: "burn", value: 4, duration: 2 }],
    },
    priority: 30,
    educationalNote:
      "水素と酸素はわずかな点火で爆発的に結合する。燃料電池の逆反応でもある。",
  },
  {
    id: "combust-mg",
    name: "マグネシウムの燃焼",
    formula: "2Mg + O_2 \\to 2MgO",
    type: "combustion",
    ph: "base",
    requires: { elements: { Mg: 1, O: 1 }, conditions: ["cond-ignite"] },
    outcome: {
      damage: 30,
      produces: ["MgO"],
      effect: "spark",
      statusEffects: [{ kind: "burn", value: 3, duration: 2 }],
    },
    priority: 25,
    educationalNote:
      "マグネシウムは強い閃光を放って燃え白い酸化マグネシウム(塩基性酸化物)になる。",
  },
  {
    id: "gas-zn-hcl",
    name: "亜鉛と塩酸の反応",
    formula: "Zn + 2HCl \\to ZnCl_2 + H_2 \\uparrow",
    type: "gas-formation",
    ph: "acid",
    requires: { elements: { Zn: 1, HCl: 1 } },
    outcome: {
      damage: 18,
      produces: ["H2"],
      effect: "fizz",
    },
    priority: 15,
    educationalNote:
      "イオン化傾向 Zn > H なので塩酸と反応して水素ガスを発生する代表的気体発生反応。",
  },
  {
    id: "gas-fe-hcl",
    name: "鉄と塩酸の反応",
    formula: "Fe + 2HCl \\to FeCl_2 + H_2 \\uparrow",
    type: "gas-formation",
    ph: "acid",
    requires: { elements: { Fe: 1, HCl: 1 } },
    outcome: {
      damage: 16,
      produces: ["H2"],
      effect: "fizz",
    },
    priority: 12,
    educationalNote:
      "鉄も H よりイオン化傾向が大きいので塩酸と反応。生じるのは塩化鉄(II)。",
  },
  {
    id: "precip-agcl",
    name: "塩化銀の沈殿",
    formula: "Ag^{+} + Cl^{-} \\to AgCl \\downarrow",
    type: "precipitation",
    ph: "neutral",
    requires: { elements: { Ag: 1, Cl: 1 } },
    outcome: {
      damage: 22,
      block: 6,
      produces: ["AgCl"],
      effect: "crystal",
      statusEffects: [{ kind: "paralyze", value: 1, duration: 1 }],
    },
    priority: 18,
    educationalNote:
      "銀イオンと塩化物イオンは白色の塩化銀となって沈殿。沈殿が敵を覆って麻痺させる。",
  },
  {
    id: "redox-cu-hno3",
    name: "銅と希硝酸の反応",
    formula: "3Cu + 8HNO_3 \\to 3Cu(NO_3)_2 + 2NO + 4H_2O",
    type: "redox",
    ph: "acid",
    requires: { elements: { Cu: 1, HNO3: 1 } },
    outcome: {
      damage: 42,
      produces: ["NO"],
      effect: "smoke",
      statusEffects: [{ kind: "poison", value: 4, duration: 3 }],
    },
    priority: 22,
    educationalNote:
      "Cu は H よりイオン化傾向が小さく塩酸では反応しないが、酸化力をもつ希硝酸とは反応。NO ガスが毒として残る。",
  },
  {
    id: "synth-nh3",
    name: "ハーバー・ボッシュ法",
    formula: "N_2 + 3H_2 \\to 2NH_3",
    type: "synthesis",
    ph: "base",
    requires: {
      elements: { N: 1, H: 3 },
      conditions: ["cond-catalyst", "cond-pressure"],
    },
    outcome: {
      damage: 50,
      produces: ["NH3"],
      effect: "smoke",
    },
    priority: 35,
    educationalNote:
      "窒素と水素から高温高圧と触媒(鉄)でアンモニア合成。20世紀最大の化学発明。",
  },
  {
    id: "synth-h2o",
    name: "水の生成 (緩慢)",
    formula: "2H_2 + O_2 \\to 2H_2O",
    type: "synthesis",
    ph: "neutral",
    requires: { elements: { H: 2, O: 1 } },
    outcome: {
      damage: 12,
      produces: ["H2O"],
      effect: "fizz",
    },
    priority: 5,
    educationalNote:
      "水素と酸素から水ができる基本反応。点火しなければ常温では遅い。",
  },
];

/** Damage multiplier for reaction pH vs enemy weakness. */
export function phMultiplier(
  reactionPh: ReactionPh,
  enemyWeakness: ReactionPh,
): number {
  if (reactionPh === "neutral" || enemyWeakness === "neutral") return 1;
  if (reactionPh === enemyWeakness) return 0.5; // same → resist
  return 1.7; // opposite → super effective
}

export function phLabel(ph: ReactionPh): string {
  if (ph === "acid") return "酸性";
  if (ph === "base") return "塩基性";
  return "中性";
}

/**
 * Reactions that *fail* with a specific educational message.
 * Used when the player tries an impossible combo so we can teach.
 */
export interface FailureRule {
  id: string;
  trigger: ReactionRequirements;
  message: string;
}

export const FAILURE_RULES: FailureRule[] = [
  {
    id: "fail-cu-hcl",
    trigger: { elements: { Cu: 1, HCl: 1 } },
    message:
      "銅は水素よりイオン化傾向が小さいため、希塩酸とは反応しない。酸化力のある熱濃硫酸や希硝酸なら反応する。",
  },
  {
    id: "fail-ag-hcl",
    trigger: { elements: { Ag: 1, HCl: 1 } },
    message:
      "銀も H よりイオン化傾向が小さいため塩酸には溶けない。ただし塩化物イオンとは白色沈殿 AgCl を作る。",
  },
  {
    id: "fail-au-any-acid",
    trigger: { elements: { } }, // Placeholder; specialised checks happen in engine.
    message:
      "金は王水(濃塩酸+濃硝酸)以外の酸には溶けない最強の金属。",
  },
];

export function getReactionById(id: string): ReactionDef | undefined {
  return REACTIONS.find((r) => r.id === id);
}
