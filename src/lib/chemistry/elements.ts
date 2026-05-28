export type ElementCategory =
  | "metal-alkali"
  | "metal-alkaline-earth"
  | "metal-transition"
  | "metal-poor"
  | "nonmetal"
  | "halogen"
  | "noble-gas"
  | "diatomic-gas"
  | "acid"
  | "base"
  | "compound";

export interface ChemElement {
  symbol: string;
  name: string;
  reading: string;
  atomicNumber?: number;
  category: ElementCategory;
  /** Hex color for the elemental "spirit" used in card art accents. */
  spiritColor: string;
  /** One-line flavor describing the element's personality. */
  flavor: string;
  /** Real-world common usage line, helps anchor knowledge. */
  realWorldNote: string;
}

export const ELEMENTS: Record<string, ChemElement> = {
  H: {
    symbol: "H",
    name: "水素",
    reading: "すいそ",
    atomicNumber: 1,
    category: "diatomic-gas",
    spiritColor: "#e0e0e0",
    flavor: "最も軽き気。すべての反応の影に潜む。",
    realWorldNote: "燃料電池や水の構成元素。",
  },
  O: {
    symbol: "O",
    name: "酸素",
    reading: "さんそ",
    atomicNumber: 8,
    category: "diatomic-gas",
    spiritColor: "#60a5fa",
    flavor: "燃焼の親、呼吸の源。",
    realWorldNote: "燃焼反応・呼吸・酸化反応に必須。",
  },
  N: {
    symbol: "N",
    name: "窒素",
    reading: "ちっそ",
    atomicNumber: 7,
    category: "diatomic-gas",
    spiritColor: "#94a3b8",
    flavor: "空気の大部分を支配する沈黙の気。",
    realWorldNote: "空気の78%、アンモニア合成の原料。",
  },
  C: {
    symbol: "C",
    name: "炭素",
    reading: "たんそ",
    atomicNumber: 6,
    category: "nonmetal",
    spiritColor: "#1f2937",
    flavor: "生命と燃焼を結ぶ黒い骨格。",
    realWorldNote: "有機化合物・燃料・二酸化炭素。",
  },
  Na: {
    symbol: "Na",
    name: "ナトリウム",
    reading: "なとりうむ",
    atomicNumber: 11,
    category: "metal-alkali",
    spiritColor: "#fde68a",
    flavor: "水に投げ込めば踊り狂う狂気の金属。",
    realWorldNote: "食塩(NaCl)・水酸化ナトリウム(NaOH)。",
  },
  K: {
    symbol: "K",
    name: "カリウム",
    reading: "かりうむ",
    atomicNumber: 19,
    category: "metal-alkali",
    spiritColor: "#a78bfa",
    flavor: "ナトリウムよりさらに激しき紫炎。",
    realWorldNote: "肥料・体液中のイオン。",
  },
  Mg: {
    symbol: "Mg",
    name: "マグネシウム",
    reading: "まぐねしうむ",
    atomicNumber: 12,
    category: "metal-alkaline-earth",
    spiritColor: "#f9fafb",
    flavor: "閃光と煙、線香花火のごとく燃ゆ。",
    realWorldNote: "軽合金・線香花火・葉緑素の中心。",
  },
  Ca: {
    symbol: "Ca",
    name: "カルシウム",
    reading: "かるしうむ",
    atomicNumber: 20,
    category: "metal-alkaline-earth",
    spiritColor: "#fef3c7",
    flavor: "石灰岩を抱く穏やかな土の精。",
    realWorldNote: "骨・歯・石灰岩(CaCO₃)・卵殻。",
  },
  Al: {
    symbol: "Al",
    name: "アルミニウム",
    reading: "あるみにうむ",
    atomicNumber: 13,
    category: "metal-poor",
    spiritColor: "#cbd5e1",
    flavor: "酸化被膜の鎧をまとう機敏な戦士。",
    realWorldNote: "1円玉・サッシ・ジュース缶。",
  },
  Zn: {
    symbol: "Zn",
    name: "亜鉛",
    reading: "あえん",
    atomicNumber: 30,
    category: "metal-transition",
    spiritColor: "#a8b5c4",
    flavor: "電池の陰極を支える地味なる勇者。",
    realWorldNote: "乾電池の負極・ガルバニ電池。",
  },
  Fe: {
    symbol: "Fe",
    name: "鉄",
    reading: "てつ",
    atomicNumber: 26,
    category: "metal-transition",
    spiritColor: "#92400e",
    flavor: "文明を築き、錆びて朽つ赤褐の刃。",
    realWorldNote: "鉄鋼・赤錆(Fe₂O₃)・血液のヘモグロビン。",
  },
  Cu: {
    symbol: "Cu",
    name: "銅",
    reading: "どう",
    atomicNumber: 29,
    category: "metal-transition",
    spiritColor: "#fb923c",
    flavor: "塩酸を嗤い、熱濃硫酸にのみ屈す。",
    realWorldNote: "10円玉・電線・青銅。",
  },
  Ag: {
    symbol: "Ag",
    name: "銀",
    reading: "ぎん",
    atomicNumber: 47,
    category: "metal-transition",
    spiritColor: "#e5e7eb",
    flavor: "塩素イオンに出会えば白く沈む貴族。",
    realWorldNote: "貴金属・写真フィルム・抗菌剤。",
  },
  Cl: {
    symbol: "Cl",
    name: "塩素",
    reading: "えんそ",
    atomicNumber: 17,
    category: "halogen",
    spiritColor: "#bef264",
    flavor: "黄緑の毒気、電子を奪わんと迫る。",
    realWorldNote: "塩(NaCl)・漂白剤・水道の消毒。",
  },
  S: {
    symbol: "S",
    name: "硫黄",
    reading: "いおう",
    atomicNumber: 16,
    category: "nonmetal",
    spiritColor: "#facc15",
    flavor: "温泉と火薬の匂い、変容を司る黄。",
    realWorldNote: "硫酸の原料・火山ガス・タンパク質。",
  },
  HCl: {
    symbol: "HCl",
    name: "塩酸",
    reading: "えんさん",
    category: "acid",
    spiritColor: "#fda4af",
    flavor: "胃液にも宿る強酸。金属を喰らう刺激。",
    realWorldNote: "胃酸・実験室の代表的強酸。",
  },
  H2SO4: {
    symbol: "H₂SO₄",
    name: "硫酸",
    reading: "りゅうさん",
    category: "acid",
    spiritColor: "#fb7185",
    flavor: "産業の血液、希なれど濃なれば牙剥く。",
    realWorldNote: "肥料工業・電池液・「化学の王」。",
  },
  HNO3: {
    symbol: "HNO₃",
    name: "硝酸",
    reading: "しょうさん",
    category: "acid",
    spiritColor: "#fcd34d",
    flavor: "光に分解する黄褐の煙、酸化の腕力。",
    realWorldNote: "火薬・肥料・濃硝酸は不動態化させる。",
  },
  NaOH: {
    symbol: "NaOH",
    name: "水酸化ナトリウム",
    reading: "すいさんかなとりうむ",
    category: "base",
    spiritColor: "#a7f3d0",
    flavor: "苛性ソーダ、油脂を石鹸に変える触れ得ぬ手。",
    realWorldNote: "石鹸製造・パイプ洗浄・強塩基の代表。",
  },
  NH3: {
    symbol: "NH₃",
    name: "アンモニア",
    reading: "あんもにあ",
    category: "base",
    spiritColor: "#bae6fd",
    flavor: "刺激臭の弱塩基、ハーバー法で空から生まる。",
    realWorldNote: "肥料・冷媒・洗剤・尿の主要成分。",
  },
};

export function getElement(symbol: string): ChemElement | undefined {
  return ELEMENTS[symbol];
}

export function listElementsByCategory(
  category: ElementCategory,
): ChemElement[] {
  return Object.values(ELEMENTS).filter((e) => e.category === category);
}
