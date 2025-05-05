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
  {
    symbol: "2317",
    name: "鴻海",
    price: "105",
    change: "-1",
    changePercent: "-0.94%",
    highlights: "電動車業務持續擴展，獲利能力提升",
  },
  {
    symbol: "2454",
    name: "聯發科",
    price: "1,085",
    change: "+25",
    changePercent: "+2.36%",
    highlights: "AI晶片需求增加，市占率持續提升",
  },
  {
    symbol: "2412",
    name: "中華電",
    price: "115",
    change: "+1",
    changePercent: "+0.88%",
    highlights: "5G用戶成長，資安業務擴展",
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
  {
    symbol: "2317",
    name: "鴻海",
    volume: "42.8億",
    volumeChange: "+8.5%",
  },
  {
    symbol: "2454",
    name: "聯發科",
    volume: "36.5億",
    volumeChange: "+15.2%",
  },
  {
    symbol: "2412",
    name: "中華電",
    volume: "28.7億",
    volumeChange: "-3.8%",
  },
];

export const recommendedStocks: RecommendedStock[] = [
  {
    symbol: "2603",
    name: "長榮",
    reason: "符合您的投資偏好",
    performance: "+5.2%",
  },
  {
    symbol: "2382",
    name: "廣達",
    reason: "類似於您關注的科技股",
    performance: "+3.7%",
  },
  {
    symbol: "2881",
    name: "富邦金",
    reason: "股息率符合您的篩選條件",
    performance: "+1.8%",
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
  {
    name: "金融",
    change: "+1.5%",
    strength: 70,
    leadingStocks: ["富邦金", "國泰金", "台新金"],
    highlights: "利率上升帶動利差擴大，獲利穩健",
  },
  {
    name: "電信",
    change: "+0.8%",
    strength: 60,
    leadingStocks: ["中華電", "台灣大", "遠傳"],
    highlights: "5G用戶成長，資安業務擴展",
  },
  // ...existing code...
];
