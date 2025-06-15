import {
  ChartBarIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

export interface MarketIndex {
  name: string;
  value: string;
  change: string;
  percentChange: string;
}

export interface MarketIndicator {
  name: string;
  value: string;
  trend?: "up" | "down" | "neutral";
}

export interface MarketInsight {
  content: string;
  sentiment: "正面" | "負面" | "中立";
  source?: string;
}

export interface HistoryDataPoint {
  date: string;
  value: number;
}

export const marketData = {
  // 市場歷史數據 (用於趨勢圖表)
  history: [
    { date: "2025-05-15T09:30:00", value: 17650 },
    { date: "2025-05-15T10:30:00", value: 17680 },
    { date: "2025-05-15T11:30:00", value: 17720 },
    { date: "2025-05-15T13:30:00", value: 17750 },
    { date: "2025-05-15T14:30:00", value: 17710 },
    { date: "2025-05-16T09:30:00", value: 17730 },
    { date: "2025-05-16T10:30:00", value: 17760 },
    { date: "2025-05-16T11:30:00", value: 17740 },
    { date: "2025-05-16T13:30:00", value: 17770 },
    { date: "2025-05-16T14:30:00", value: 17790 },
    { date: "2025-05-19T09:30:00", value: 17810 },
    { date: "2025-05-19T10:30:00", value: 17850 },
    { date: "2025-05-19T11:30:00", value: 17880 },
    { date: "2025-05-19T13:30:00", value: 17920 },
    { date: "2025-05-19T14:30:00", value: 17950 },
    { date: "2025-05-20T09:30:00", value: 17930 },
    { date: "2025-05-20T10:30:00", value: 17960 },
    { date: "2025-05-20T11:30:00", value: 18010 },
    { date: "2025-05-20T13:30:00", value: 18050 },
    { date: "2025-05-20T14:30:00", value: 18080 },
    { date: "2025-05-21T09:30:00", value: 18120 },
    { date: "2025-05-21T10:30:00", value: 18150 },
    { date: "2025-05-21T11:30:00", value: 18190 },
    { date: "2025-05-21T13:30:00", value: 18210 },
    { date: "2025-05-21T14:30:00", value: 18250 },
    { date: "2025-05-22T09:30:00", value: 18280 },
    { date: "2025-05-22T10:30:00", value: 18320 },
    { date: "2025-05-22T11:30:00", value: 18290 },
    { date: "2025-05-22T13:30:00", value: 18310 },
  ],

  // 主要指數
  indices: [
    {
      name: "加權指數",
      value: "18,310.25",
      change: "+60.35",
      percentChange: "+0.33%",
    },
    {
      name: "電子類指數",
      value: "22,876.14",
      change: "+155.72",
      percentChange: "+0.69%",
    },
    {
      name: "金融類指數",
      value: "1,362.48",
      change: "-3.26",
      percentChange: "-0.24%",
    },
  ],

  // 重要市場指標
  indicators: [
    {
      name: "成交量(億)",
      value: "3,542.6",
      trend: "up",
    },
    {
      name: "漲跌家數",
      value: "537:352",
      trend: "up",
    },
    {
      name: "美元/台幣",
      value: "31.42",
      trend: "down",
    },
    {
      name: "十年期殖利率",
      value: "1.85%",
      trend: "up",
    },
  ],

  // 市場情緒
  sentiment: {
    overall: 65,
    bullish: 58,
    bearish: 22,
    neutral: 20,
    change: 5.2,
  },

  // 市場洞察
  insights: [
    {
      content:
        "半導體供應鏈看好AI運算需求持續增長，台積電、聯發科等晶片相關股票有望延續漲勢",
      sentiment: "正面",
    },
    {
      content: "美國Fed官員表示可能在今年第四季開始降息，市場樂觀情緒回升",
      sentiment: "正面",
    },
    {
      content: "中國房地產市場持續疲軟，可能影響相關原物料與建材產業",
      sentiment: "負面",
    },
  ],

  // 熱門股票
  hotStocks: [
    {
      id: "1",
      code: "2330",
      name: "台積電",
      price: 726.0,
      change: 15.0,
      changePercent: 2.11,
      volume: 52680000,
      recommendation: "買入",
    },
    {
      id: "2",
      code: "2454",
      name: "聯發科",
      price: 1175.0,
      change: 25.0,
      changePercent: 2.18,
      volume: 8521000,
    },
    {
      id: "3",
      code: "2382",
      name: "廣達",
      price: 298.5,
      change: 9.5,
      changePercent: 3.29,
      volume: 12463000,
    },
    {
      id: "4",
      code: "2308",
      name: "台達電",
      price: 356.0,
      change: 4.0,
      changePercent: 1.14,
      volume: 7256000,
    },
    {
      id: "5",
      code: "2881",
      name: "富邦金",
      price: 78.5,
      change: -0.8,
      changePercent: -1.01,
      volume: 15820000,
    },
  ],

  // 活躍股票
  activeStocks: [
    {
      id: "1",
      code: "2603",
      name: "長榮",
      price: 182.0,
      change: 6.5,
      changePercent: 3.71,
      volume: 68520000,
    },
    {
      id: "2",
      code: "2330",
      name: "台積電",
      price: 726.0,
      change: 15.0,
      changePercent: 2.11,
      volume: 52680000,
    },
    {
      id: "3",
      code: "2317",
      name: "鴻海",
      price: 122.0,
      change: 2.5,
      changePercent: 2.09,
      volume: 45730000,
    },
    {
      id: "4",
      code: "2881",
      name: "富邦金",
      price: 78.5,
      change: -0.8,
      changePercent: -1.01,
      volume: 15820000,
    },
    {
      id: "5",
      code: "2382",
      name: "廣達",
      price: 298.5,
      change: 9.5,
      changePercent: 3.29,
      volume: 12463000,
    },
  ],

  // 推薦股票
  recommendedStocks: [
    {
      id: "1",
      code: "2330",
      name: "台積電",
      price: 726.0,
      change: 15.0,
      changePercent: 2.11,
      volume: 52680000,
      recommendation: "買入",
      highlight: true,
    },
    {
      id: "2",
      code: "2454",
      name: "聯發科",
      price: 1175.0,
      change: 25.0,
      changePercent: 2.18,
      volume: 8521000,
      recommendation: "買入",
    },
    {
      id: "3",
      code: "2412",
      name: "中華電",
      price: 126.5,
      change: 1.0,
      changePercent: 0.8,
      volume: 6230000,
      recommendation: "買入",
    },
    {
      id: "4",
      code: "2308",
      name: "台達電",
      price: 356.0,
      change: 4.0,
      changePercent: 1.14,
      volume: 7256000,
      recommendation: "買入",
    },
    {
      id: "5",
      code: "1301",
      name: "台塑",
      price: 76.0,
      change: -0.5,
      changePercent: -0.65,
      volume: 8920000,
      recommendation: "持有",
    },
  ],

  // 最新新聞
  latestNews: [
    {
      id: "1",
      title: "台積電3奈米製程需求強勁，Q3營收有望再創新高",
      source: "經濟日報",
      publishedAt: "2025-05-22T08:30:00",
      summary:
        "台積電表示，隨著AI晶片需求持續成長，3奈米製程產能已預訂至明年Q2，有望帶動Q3營收再創新高。",
      url: "/news/1",
      sentiment: "positive",
      related: {
        stocks: ["2330"],
      },
    },
    {
      id: "2",
      title: "央行理監事會議明召開，市場預期利率將維持不變",
      source: "中央社",
      publishedAt: "2025-05-22T07:15:00",
      summary:
        "央行第二季理監事會議明日召開，市場普遍預期央行將按兵不動，維持利率不變，關注對通膨看法與下半年經濟展望。",
      url: "/news/2",
      sentiment: "neutral",
    },
    {
      id: "3",
      title: "蘋果供應鏈傳出最新iPhone產量提升，鴻海、立訊等供應商股價大漲",
      source: "工商時報",
      publishedAt: "2025-05-22T06:40:00",
      url: "/news/3",
      sentiment: "positive",
      related: {
        stocks: ["2317", "4938"],
      },
    },
    {
      id: "4",
      title: "國際油價再創新高，航空股承壓走弱",
      source: "財經網",
      publishedAt: "2025-05-21T16:10:00",
      url: "/news/4",
      sentiment: "negative",
      related: {
        stocks: ["2610", "2618"],
      },
    },
    {
      id: "5",
      title: "金管會宣布開放數位資產交易平台執照申請，金融科技概念股受關注",
      source: "財訊",
      publishedAt: "2025-05-21T14:25:00",
      url: "/news/5",
      sentiment: "positive",
    },
  ],

  // 產業表現
  sectorPerformance: [
    {
      name: "半導體",
      performance: 3.72,
    },
    {
      name: "AI與雲端運算",
      performance: 4.15,
    },
    {
      name: "電子零組件",
      performance: 2.26,
    },
    {
      name: "金融保險",
      performance: -0.55,
    },
    {
      name: "航運",
      performance: 3.42,
    },
    {
      name: "鋼鐵",
      performance: 0.86,
    },
    {
      name: "生技醫療",
      performance: 1.24,
    },
    {
      name: "傳產製造",
      performance: 0.32,
    },
    {
      name: "百貨零售",
      performance: -0.18,
    },
    {
      name: "建築營建",
      performance: -1.24,
    },
  ],

  // 教育資源
  educationResources: [
    {
      id: "1",
      title: "初學者必知的投資指標解析：本益比、殖利率與淨值比",
      type: "article",
      description:
        "了解評估股票價值的三大基本指標，幫助你做出更明智的投資決策。",
      url: "/education/articles/1",
      author: "李財經",
      duration: "8分鐘",
      level: "beginner",
      rating: 4.8,
    },
    {
      id: "2",
      title: "技術分析入門：5種常用技術指標詳解",
      type: "video",
      url: "/education/videos/2",
      author: "張分析師",
      duration: "18分鐘",
      level: "intermediate",
      rating: 4.7,
    },
    {
      id: "3",
      title: "如何建立多元化投資組合：資產配置實務指南",
      type: "course",
      url: "/education/courses/3",
      author: "王教授",
      duration: "3小時",
      level: "beginner",
      rating: 4.9,
    },
  ],

  // 舊js檔案
  stock: {
    index: "17,935",
    change: "+125",
    changePercent: "+0.70%",
    trend: "上漲",
    volume: "2,835億",
    highlights: "科技股帶動大盤上漲，AI概念股表現強勁",
  },
  crypto: {
    btc: "65,280",
    change: "+1,250",
    changePercent: "+1.95%",
    volume: "485億",
    dominance: "52.3%",
    highlights: "比特幣突破65,000美元，機構投資需求增加",
  },
  forex: {
    usdtwd: "31.42",
    change: "-0.15",
    changePercent: "-0.48%",
    trend: "下跌",
    volume: "12.6億美元",
    highlights: "美元走弱，台幣升值創近期新高",
  },
  stockDetails: [
    {
      symbol: "2330",
      name: "台積電",
      price: 580.0,
      change: "+1.8%",
      volume: "35,862",
      marketCap: "15.1兆",
      pe: "25.4",
      pb: "6.8",
      dividendYield: "1.8%",
      high52w: "630.00",
      low52w: "510.00",
      open: "573.00",
      high: "582.00",
      low: "571.00",
      priceHistory: [530, 545, 560, 575, 568, 580],
    },
    {
      symbol: "2317",
      name: "鴻海",
      price: 105.5,
      change: "-1.2%",
      volume: "42,356",
      marketCap: "1.46兆",
      pe: "10.2",
      dividendYield: "3.8%",
      high52w: "128.50",
      low52w: "95.70",
    },
    {
      symbol: "2454",
      name: "聯發科",
      price: 920.0,
      change: "+0.5%",
      volume: "12,654",
      marketCap: "7,286億",
      pe: "18.6",
      dividendYield: "2.3%",
      high52w: "1,080.00",
      low52w: "740.00",
    },
  ],
  technicalScreener: {
    bullish: [
      {
        symbol: "2330",
        name: "台積電",
        confidence: "87%",
        price: "580.00",
        formation: "3日內",
        target: "645",
      },
      {
        symbol: "2454",
        name: "聯發科",
        confidence: "79%",
        price: "920.00",
        formation: "5日內",
        target: "980",
      },
    ],
    bearish: [
      {
        symbol: "2317",
        name: "鴻海",
        confidence: "81%",
        price: "105.50",
        formation: "2日內",
        target: "95.00",
      },
      {
        symbol: "2353",
        name: "宏碁",
        confidence: "74%",
        price: "28.05",
        formation: "昨日",
        target: "26.20",
      },
    ],
  },
  trendingStocks: [
    {
      symbol: "2330",
      name: "台積電",
      price: "580.00",
      change: "+1.8%",
      discussions: 328,
      sentiment: "正面",
      buzzScore: 92,
      keywords: ["財報", "先進製程", "AI晶片"],
    },
    {
      symbol: "2603",
      name: "長榮",
      price: "172.00",
      change: "+3.6%",
      discussions: 256,
      sentiment: "正面",
      buzzScore: 87,
      keywords: ["貨櫃", "運價", "航運股"],
    },
  ],
};

export const analysisModules = [
  {
    title: "技術分析",
    description: "K線、均線與技術指標分析",
    icon: ChartBarIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    href: "/market-analysis/technical",
    data: {
      status: "多頭排列",
      changePercent: "+2.5%",
    },
  },
  {
    title: "基本面分析",
    description: "財報、獲利能力與成長性評估",
    icon: DocumentChartBarIcon,
    color: "text-green-600",
    bgColor: "bg-green-100",
    href: "/market-analysis/fundamental",
    data: {
      status: "穩健成長",
      changePercent: "+1.8%",
    },
  },
  {
    title: "籌碼分析",
    description: "法人動向、融資融券與內部人交易",
    icon: UserGroupIcon,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    href: "/market-analysis/chip",
    data: {
      status: "外資買超",
      changePercent: "+3.2%",
    },
  },
  {
    title: "產業分析",
    description: "產業趨勢、競爭格局與市場佔有率",
    icon: BuildingOfficeIcon,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    href: "/market-analysis/industry",
    data: {
      status: "高成長",
      changePercent: "+4.5%",
    },
  },
];
