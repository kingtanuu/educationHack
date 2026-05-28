import {
  REACTIONS,
  FAILURE_RULES,
  type ReactionDef,
  type ReactionRequirements,
} from "./reactions";
import { reactsWithDiluteAcid, ionizationRank } from "./ionization";

export interface PlayedCard {
  /** "elem" for element/acid/base/compound cards, "cond" for condition cards. */
  kind: "elem" | "cond";
  /** For elem cards: the symbol e.g. "Na". For cond cards: the condition id e.g. "cond-heat". */
  key: string;
}

export interface ReactionResult {
  kind: "success";
  reaction: ReactionDef;
}

export interface FailureResult {
  kind: "failure";
  message: string;
}

export interface NoMatchResult {
  kind: "no-match";
  message: string;
}

export type ResolveResult = ReactionResult | FailureResult | NoMatchResult;

function toBag(played: PlayedCard[]): {
  elements: Record<string, number>;
  conditions: Set<string>;
} {
  const elements: Record<string, number> = {};
  const conditions = new Set<string>();
  for (const card of played) {
    if (card.kind === "elem") {
      elements[card.key] = (elements[card.key] ?? 0) + 1;
    } else {
      conditions.add(card.key);
    }
  }
  return { elements, conditions };
}

function meetsRequirements(
  bag: ReturnType<typeof toBag>,
  req: ReactionRequirements,
): boolean {
  for (const [symbol, needed] of Object.entries(req.elements)) {
    const have = bag.elements[symbol] ?? 0;
    if (have < needed) return false;
  }
  if (req.conditions) {
    for (const cond of req.conditions) {
      if (!bag.conditions.has(cond)) return false;
    }
  }
  return true;
}

/**
 * Resolve the played cards into a reaction outcome.
 *
 * Order:
 *   1. Try to match the highest-priority successful reaction.
 *   2. Otherwise, look for a known failure rule.
 *   3. Otherwise, check ionization-series-based common failures.
 *   4. Otherwise, return no-match (cards fizzle).
 */
export function resolvePlay(played: PlayedCard[]): ResolveResult {
  const bag = toBag(played);

  // 1. Best success match.
  const matches = REACTIONS.filter((r) => meetsRequirements(bag, r.requires))
    .sort((a, b) => b.priority - a.priority);

  if (matches.length > 0) {
    return { kind: "success", reaction: matches[0] };
  }

  // 2. Known failure rules.
  for (const rule of FAILURE_RULES) {
    if (Object.keys(rule.trigger.elements).length === 0) continue;
    if (meetsRequirements(bag, rule.trigger)) {
      return { kind: "failure", message: rule.message };
    }
  }

  // 3. Ionization-series check: metal + dilute acid that shouldn't react.
  const metals = Object.keys(bag.elements).filter((s) =>
    ionizationRank(s) !== Number.POSITIVE_INFINITY,
  );
  const hasDiluteAcid =
    (bag.elements["HCl"] ?? 0) > 0 ||
    (bag.elements["H2SO4"] ?? 0) > 0;
  if (hasDiluteAcid) {
    const inertMetal = metals.find((m) => !reactsWithDiluteAcid(m));
    if (inertMetal) {
      return {
        kind: "failure",
        message: `${inertMetal} は水素よりイオン化傾向が小さく、希酸では反応しない。`,
      };
    }
  }

  // 4. Cards fizzle.
  return {
    kind: "no-match",
    message:
      "今の組み合わせでは反応が成立しない。条件カード(加熱・水溶液など)や別の元素を試してみよう。",
  };
}

/**
 * Light-weight preview without committing the play.
 * Used by the UI to highlight likely matches in real time.
 */
export function previewMatches(played: PlayedCard[]): ReactionDef[] {
  const bag = toBag(played);
  return REACTIONS.filter((r) => meetsRequirements(bag, r.requires))
    .sort((a, b) => b.priority - a.priority);
}

export interface SynergyHint {
  /** Set of hand-card keys/conditions that participate in some achievable reaction. */
  hintedKeys: Set<string>;
  /** Number of distinct reactions that become achievable using this hand+crucible. */
  reachableReactions: number;
  /** Highest priority reaction within reach (for showcasing the strongest combo). */
  topReachable: ReactionDef | null;
}

/**
 * Inspect cards already in play (crucible) plus the player's hand to find
 * which hand cards participate in any reaction that becomes possible.
 *
 * - If the crucible is non-empty: prefer reactions whose remaining slots can
 *   be filled by hand cards.
 * - If empty: highlight cards that can pair with any other hand card to
 *   reach a reaction (tutorial-friendly).
 */
export function findSynergyHints(
  played: PlayedCard[],
  hand: { id: string; key: string; kind: string }[],
): SynergyHint {
  const playedBag = toBag(played);
  const handPlayed: PlayedCard[] = hand.map((c) =>
    c.kind === "condition"
      ? { kind: "cond", key: c.key }
      : { kind: "elem", key: c.key },
  );
  const fullBag = toBag([...played, ...handPlayed]);

  const hintedKeys = new Set<string>();
  let reachableReactions = 0;
  let topReachable: ReactionDef | null = null;

  for (const reaction of REACTIONS) {
    // Skip reactions already satisfied by what's in the crucible — those
    // are already in the preview panel.
    if (meetsRequirements(playedBag, reaction.requires)) continue;
    if (!meetsRequirements(fullBag, reaction.requires)) continue;

    reachableReactions += 1;
    if (!topReachable || reaction.priority > topReachable.priority) {
      topReachable = reaction;
    }

    // Mark every key this reaction needs that is fulfilled by the hand.
    for (const [symbol, needed] of Object.entries(reaction.requires.elements)) {
      const inPlay = playedBag.elements[symbol] ?? 0;
      const stillNeeded = Math.max(0, needed - inPlay);
      if (stillNeeded > 0) hintedKeys.add(symbol);
    }
    if (reaction.requires.conditions) {
      for (const cond of reaction.requires.conditions) {
        if (!playedBag.conditions.has(cond)) hintedKeys.add(cond);
      }
    }
  }

  return { hintedKeys, reachableReactions, topReachable };
}
