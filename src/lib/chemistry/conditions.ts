export interface Condition {
  id: string;
  name: string;
  reading: string;
  description: string;
}

export const CONDITIONS: Record<string, Condition> = {
  "cond-ignite": {
    id: "cond-ignite",
    name: "点火",
    reading: "てんか",
    description: "わずかな熱で激しい燃焼反応を引き起こす。",
  },
  "cond-heat": {
    id: "cond-heat",
    name: "加熱",
    reading: "かねつ",
    description: "持続的な熱を加える。緩やかな反応の進行を促す。",
  },
  "cond-aqueous": {
    id: "cond-aqueous",
    name: "水溶液",
    reading: "すいようえき",
    description: "水中のイオン反応を可能にする。",
  },
  "cond-catalyst": {
    id: "cond-catalyst",
    name: "触媒",
    reading: "しょくばい",
    description: "反応を加速し、Energy 消費を抑える。",
  },
  "cond-pressure": {
    id: "cond-pressure",
    name: "高圧",
    reading: "こうあつ",
    description: "高圧下で気体の反応を進めやすくする。",
  },
};
