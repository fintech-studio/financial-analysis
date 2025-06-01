import { TIME_RANGES } from "@/constants/market/marketConstants";

export type TimeRange = (typeof TIME_RANGES)[number];

export interface MarketMetric {
  value: string;
  change: string;
  changePercent: string;
  trend?: string;
  status?: string;
  description?: string;
}

export interface MarketData extends MarketMetric {
  name: string;
  volume?: string;
  turnover?: string;
  highlights?: string;
  metrics?: Array<{
    label: string;
    value: string;
    colorClass?: string;
  }>;
}

export interface ChartData {
  dates: string[];
  values: number[];
  volumes?: number[];
  prices: number[];
}

export interface MarketOverview {
  stock?: {
    name: string;
    value: string;
    change: string;
    changePercent: string;
    volume: string;
    upDownRatio: string;
    highlights: string;
  };
  crypto?: {
    name: string;
    value: string;
    change: string;
    changePercent: string;
    marketCap: string;
    dominance: string;
    highlights: string;
  };
  global?: {
    name: string;
    value: string;
    change: string;
    changePercent: string;
    trend: string;
    vix: string;
    highlights: string;
  };
  realEstate?: {
    name: string;
    value: string;
    change: string;
    changePercent: string;
    volume: string;
    trend: string;
    highlights: string;
  };
  futures?: {
    name: string;
    volume: string;
    change: string;
    changePercent: string;
    trend: string;
    turnover: string;
    highlights: string;
    commodities: {
      oil: CommodityData;
      gold: CommodityData;
    };
  };
  nft?: {
    name: string;
    volume: string;
    change: string;
    changePercent: string;
    trend: string;
    turnover: string;
    highlights: string;
    categories: {
      art: NFTCategoryData;
      gaming: NFTCategoryData;
    };
  };
  indices?: MarketIndex[];
  summary?: {
    totalMarketCap: number;
    totalVolume: number;
    advancingStocks: number;
    decliningStocks: number;
    unchangedStocks: number;
    newHighs: number;
    newLows: number;
    topGainers: number;
    topLosers: number;
  };
  sectors?: Array<{
    id: string;
    name: string;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number;
    stockCount: number;
  }>;
  lastUpdate?: string;
}

interface CommodityData {
  name: string;
  price: string;
  change: string;
  changePercent: string;
  trend: string;
  strength: number;
}

interface NFTCategoryData {
  name: string;
  volume: string;
  change: string;
  changePercent: string;
  trend: string;
  strength: number;
}

export interface MarketSentiment {
  vix: MarketMetric & { status: string };
  fearGreed: MarketMetric & { status: string };
  marketBreadth: MarketMetric & { status: string };
  overall?: string;
  score?: number;
  indicators?: {
    fearGreedIndex: number;
    vixLevel: number;
    putCallRatio: number;
    marginDebt: number;
    shortInterest: number;
  };
  sentiment?: {
    bullish: number;
    neutral: number;
    bearish: number;
  };
  analysis?: {
    summary: string;
    factors: string[];
    risks: string[];
  };
  lastUpdate?: string;
}

export interface MarketSector {
  id?: string;
  name: string;
  change: string;
  changePercent: string;
  strength?: number;
  leadingStocks?: string[];
  highlights?: string;
  volume?: number;
  marketCap?: number;
  stockCount?: number;
  topStocks?: Array<{
    symbol: string;
    name: string;
    change: number;
  }>;
}

export interface MarketTrend {
  id?: string;
  name: string;
  category?: string;
  direction?: string;
  strength: number;
  description: string;
  duration?: string;
  relatedStocks?: Array<{
    symbol: string;
    name: string;
    correlation: number;
  }>;
  performance?: {
    [key: string]: number;
  };
}

export interface MarketIndex {
  id?: string;
  name: string;
  symbol?: string;
  value: string;
  change: string;
  changePercent: string;
  volume?: string;
  updateTime?: string;
  status?: string;
}

export interface SectorPerformance {
  name: string;
  change: string;
  strength: number;
  leadingStocks: string[];
  highlights: string;
}

export interface MarketNews {
  id?: string;
  title: string;
  source: string;
  time: string;
  impact: string;
  category: string;
  summary: string;
  severity?: string;
  affectedSectors?: string[];
  publishedAt?: string;
}

export interface HotStock {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  highlights: string;
  volume?: string;
  turnover?: string;
}

export interface RecommendedStock {
  symbol: string;
  name: string;
  performance: string;
  reason: string;
}

export interface ActiveStock {
  symbol: string;
  name: string;
  volume: string;
  volumeChange: string;
}
