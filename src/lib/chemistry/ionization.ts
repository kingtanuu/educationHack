/**
 * Ionization series for metals (イオン化傾向).
 * Lower index = more reactive. K is at index 0 (most reactive),
 * Au is at the end (least reactive). H is included as the boundary
 * for "reacts with dilute acid" judgments.
 */

export const IONIZATION_SERIES: readonly string[] = [
  "K",
  "Ca",
  "Na",
  "Mg",
  "Al",
  "Zn",
  "Fe",
  "Ni",
  "Sn",
  "Pb",
  "H",
  "Cu",
  "Hg",
  "Ag",
  "Pt",
  "Au",
];

export function ionizationRank(symbol: string): number {
  const idx = IONIZATION_SERIES.indexOf(symbol);
  return idx === -1 ? Number.POSITIVE_INFINITY : idx;
}

/**
 * Does this metal react with dilute acid (HCl, dilute H2SO4)?
 * Only metals stronger than H qualify.
 */
export function reactsWithDiluteAcid(symbol: string): boolean {
  const rank = ionizationRank(symbol);
  const hRank = ionizationRank("H");
  return rank < hRank;
}

/**
 * For two metals, does the first displace the second from solution?
 */
export function canDisplace(displacer: string, displaced: string): boolean {
  return ionizationRank(displacer) < ionizationRank(displaced);
}
