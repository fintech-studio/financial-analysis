import {
  HotStock,
  ActiveStock,
  RecommendedStock,
  SectorPerformance,
} from "@/types/market";

export const hotStocks: HotStock[] = [
  {
    symbol: "2330",
    name: "台積電",
    price: "785",
    change: "+15",
    changePercent: "+1.95%",
    highlights: "AI需求強勁，先進製程產能滿載",
  },
  // ...existing code...
];

export const activeStocks: ActiveStock[] = [
  {
    symbol: "2330",
    name: "台積電",
    volume: "95.2億",
    volumeChange: "+12.3%",
  },
  // ...existing code...
];

export const recommendedStocks: RecommendedStock[] = [
  {
    symbol: "2603",
    name: "長榮",
    reason: "符合您的投資偏好",
    performance: "+5.2%",
  },
  // ...existing code...
];

export const sectorPerformance: SectorPerformance[] = [
  {
    name: "半導體",
    change: "+3.2%",
    strength: 85,
    leadingStocks: ["台積電", "聯發科", "聯電"],
    highlights: "AI需求帶動產業成長，先進製程產能滿載",
  },
  // ...existing code...
];
