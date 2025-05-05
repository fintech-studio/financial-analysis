import {
  MarketOverview,
  MarketSentiment,
  SectorPerformance,
  MarketNews,
  HotStock,
} from "../types/market";

export const marketOverview: MarketOverview = {
  stock: {
    name: "股票分析",
    value: "17,935",
    change: "+125.49",
    changePercent: "+0.70%",
    volume: "2,835億",
    upDownRatio: "1.2",
    highlights: "科技股帶動大盤上漲，AI概念股表現強勁",
  },
  crypto: {
    name: "加密貨幣",
    value: "65,280",
    change: "+1,250",
    changePercent: "+1.95%",
    marketCap: "1.02兆美元",
    dominance: "52.3%",
    highlights: "比特幣突破65,000美元，機構投資需求增加",
  },
  global: {
    name: "全球指數",
    value: "38,790",
    change: "-125",
    changePercent: "-0.32%",
    trend: "下跌",
    vix: "15.2",
    highlights: "美股科技股回調，歐洲市場維持穩定",
  },
  realEstate: {
    name: "房市",
    value: "125.8",
    change: "+0.5",
    changePercent: "+0.40%",
    volume: "1,250億",
    trend: "上漲",
    highlights: "房市交易量回升，價格穩步上揚",
  },
  futures: {
    name: "期貨市場",
    volume: "2.5億口",
    change: "+0.3億口",
    changePercent: "+13.6%",
    trend: "上漲",
    turnover: "3.2兆元",
    highlights: "原油期貨因中東局勢緊張上漲，黃金期貨因避險需求增加",
    commodities: {
      oil: {
        name: "原油期貨",
        price: "75.5",
        change: "-0.6",
        changePercent: "-0.79%",
        trend: "下跌",
        strength: 45,
      },
      gold: {
        name: "黃金期貨",
        price: "2,035",
        change: "+15",
        changePercent: "+0.74%",
        trend: "上漲",
        strength: 75,
      },
    },
  },
  nft: {
    name: "NFT市場",
    volume: "1.2億美元",
    change: "+0.3億美元",
    changePercent: "+33.3%",
    trend: "上漲",
    turnover: "3.5億美元",
    highlights: "NFT交易量持續增長，藝術品和遊戲資產需求強勁",
    categories: {
      art: {
        name: "藝術品NFT",
        volume: "5,800萬美元",
        change: "+1,200萬美元",
        changePercent: "+26.1%",
        trend: "上漲",
        strength: 85,
      },
      gaming: {
        name: "遊戲資產NFT",
        volume: "4,200萬美元",
        change: "+800萬美元",
        changePercent: "+23.5%",
        trend: "上漲",
        strength: 75,
      },
    },
  },
};

export const marketSentiment: MarketSentiment = {
  vix: {
    value: "14.21",
    change: "-5.2%",
    changePercent: "-5.2%",
    status: "低波動",
    description: "市場波動性維持在低檔，投資人信心穩定",
  },
  fearGreed: {
    value: "72",
    change: "+5",
    changePercent: "+7.46%",
    status: "貪婪",
    description: "市場情緒偏向樂觀，風險偏好提升",
  },
  marketBreadth: {
    value: "65%",
    change: "+2.3%",
    changePercent: "+3.67%",
    status: "擴張",
    description: "市場廣度持續改善，上漲家數增加",
  },
};

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
    change: "-0.5%",
    strength: 55,
    leadingStocks: ["國泰金", "富邦金", "兆豐金"],
    highlights: "利率環境維持穩定，財富管理業務成長",
  },
  {
    name: "航運",
    change: "-2.1%",
    strength: 35,
    leadingStocks: ["長榮", "陽明", "萬海"],
    highlights: "運價持續下跌，市場供過於求",
  },
];

export const marketNews: MarketNews[] = [
  {
    title: "台積電宣布在日本熊本縣建設第二座先進封裝廠",
    source: "經濟日報",
    time: "2小時前",
    impact: "正面",
    category: "科技",
    summary: "台積電擴大海外布局，強化全球供應鏈韌性",
  },
  {
    title: "央行維持利率不變，市場解讀為鴿派訊號",
    source: "工商時報",
    time: "4小時前",
    impact: "正面",
    category: "財經",
    summary: "央行維持寬鬆貨幣政策，支持經濟復甦",
  },
  {
    title: "全球航運運價持續下跌，航運股普遍承壓",
    source: "財訊",
    time: "6小時前",
    impact: "負面",
    category: "航運",
    summary: "全球貿易量下滑，航運業面臨挑戰",
  },
];

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
];

export const activeStocks = [
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

export const recommendedStocks = [
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
];

export const chartData = {
  dates: ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05"],
  prices: [17000, 17100, 17200, 17300, 17935],
  volumes: [25000000000, 28000000000, 30000000000, 27000000000, 32456789],
};

export const latestNews = [
  {
    category: "財經",
    date: "2024-01-20",
    title: "Fed暗示將於今年降息，市場樂觀期待",
    source: "財經日報",
  },
  {
    category: "科技",
    date: "2024-01-20",
    title: "AI晶片需求持續攀升，半導體產業展望正向",
    source: "科技新報",
  },
  {
    category: "產業",
    date: "2024-01-20",
    title: "電動車產業鏈整合加速，供應商併購潮起",
    source: "工商時報",
  },
  {
    category: "財經",
    date: "2024-01-20",
    title: "原物料價格走穩，通膨降溫跡象明顯",
    source: "經濟日報",
  },
];

// Re-export everything from the market data module
export * from "./market/marketData";
