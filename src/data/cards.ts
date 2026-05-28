/**
 * Card definitions. Cards reference chemistry data but carry
 * game-mechanical info: rarity, energy cost, base attack value
 * (when played solo without reactions).
 */

export type CardRarity = "common" | "uncommon" | "rare";
export type CardKind =
  | "element"
  | "condition"
  | "law"
  | "compound"
  | "alchemy";

export interface CardDef {
  id: string;
  /** Unique within the game; same as elements symbol for element cards. */
  key: string;
  kind: CardKind;
  /** Rarity in the deck/draft pool. */
  rarity: CardRarity;
  /** Energy required to play. */
  energyCost: number;
  /** Solo damage when played without forming a reaction. */
  soloDamage: number;
  /** Short flavor in Japanese. */
  flavor?: string;
}

/**
 * Tutorial deck: every card here participates in at least one known reaction.
 * Hand of 5 will almost always have a reaction ready, so the player learns
 * the combo loop on the first encounter.
 */
export const TUTORIAL_DECK: CardDef[] = [
  // Water synthesis (H + H + O — no condition needed)
  { id: "tut-h-01", key: "H", kind: "element", rarity: "common", energyCost: 1, soloDamage: 3 },
  { id: "tut-h-02", key: "H", kind: "element", rarity: "common", energyCost: 1, soloDamage: 3 },
  { id: "tut-o-01", key: "O", kind: "element", rarity: "common", energyCost: 1, soloDamage: 4 },
  // Salt synthesis (Na + Cl)
  { id: "tut-na-01", key: "Na", kind: "element", rarity: "uncommon", energyCost: 1, soloDamage: 5 },
  { id: "tut-cl-01", key: "Cl", kind: "element", rarity: "uncommon", energyCost: 1, soloDamage: 5 },
  // Neutralization (HCl + NaOH) — flagship reaction
  { id: "tut-hcl-01", key: "HCl", kind: "element", rarity: "uncommon", energyCost: 1, soloDamage: 6 },
  { id: "tut-naoh-01", key: "NaOH", kind: "element", rarity: "uncommon", energyCost: 1, soloDamage: 6 },
  // Gas-formation reactions vs HCl (Zn / Fe / Mg)
  { id: "tut-zn-01", key: "Zn", kind: "element", rarity: "common", energyCost: 1, soloDamage: 4 },
  { id: "tut-mg-01", key: "Mg", kind: "element", rarity: "common", energyCost: 1, soloDamage: 4 },
  // Combustion condition for big damage combos
  { id: "tut-ignite-01", key: "cond-ignite", kind: "condition", rarity: "common", energyCost: 1, soloDamage: 0 },
  // Aqueous boost for neutralization
  { id: "tut-aq-01", key: "cond-aqueous", kind: "condition", rarity: "common", energyCost: 0, soloDamage: 0 },
];

/**
 * Standard starter deck used for non-tutorial encounters once we
 * have more enemies/stages. Includes harder elements (Cu, Fe, Ag, S)
 * that need specific conditions or won't react with everything.
 */
export const STARTER_DECK: CardDef[] = [
  { id: "card-h-01", key: "H", kind: "element", rarity: "common", energyCost: 1, soloDamage: 3 },
  { id: "card-h-02", key: "H", kind: "element", rarity: "common", energyCost: 1, soloDamage: 3 },
  { id: "card-o-01", key: "O", kind: "element", rarity: "common", energyCost: 1, soloDamage: 4 },
  { id: "card-o-02", key: "O", kind: "element", rarity: "common", energyCost: 1, soloDamage: 4 },
  { id: "card-na-01", key: "Na", kind: "element", rarity: "uncommon", energyCost: 1, soloDamage: 5 },
  { id: "card-cl-01", key: "Cl", kind: "element", rarity: "uncommon", energyCost: 1, soloDamage: 5 },
  { id: "card-mg-01", key: "Mg", kind: "element", rarity: "common", energyCost: 1, soloDamage: 4 },
  { id: "card-zn-01", key: "Zn", kind: "element", rarity: "common", energyCost: 1, soloDamage: 4 },
  { id: "card-fe-01", key: "Fe", kind: "element", rarity: "common", energyCost: 1, soloDamage: 4 },
  { id: "card-cu-01", key: "Cu", kind: "element", rarity: "uncommon", energyCost: 1, soloDamage: 3 },
  { id: "card-hcl-01", key: "HCl", kind: "element", rarity: "uncommon", energyCost: 1, soloDamage: 6 },
  { id: "card-naoh-01", key: "NaOH", kind: "element", rarity: "uncommon", energyCost: 1, soloDamage: 6 },
  { id: "card-cond-ignite-01", key: "cond-ignite", kind: "condition", rarity: "common", energyCost: 1, soloDamage: 0 },
  { id: "card-cond-aqueous-01", key: "cond-aqueous", kind: "condition", rarity: "common", energyCost: 0, soloDamage: 0 },
  { id: "card-cond-heat-01", key: "cond-heat", kind: "condition", rarity: "common", energyCost: 1, soloDamage: 0 },
];

export function getStarterDeck(): CardDef[] {
  return STARTER_DECK.map((c) => ({ ...c }));
}

export function getTutorialDeck(): CardDef[] {
  return TUTORIAL_DECK.map((c) => ({ ...c }));
}
