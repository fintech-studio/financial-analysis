import { TIME_RANGES } from "@/constants/marketConstants";

export type TimeRange = (typeof TIME_RANGES)[number];

export interface MarketMetric {
  value: string;
  change: string;
  changePercent: string;
  trend?: string;
  status?: string;
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
}

export interface MarketMetric {
  value: string;
  change: string;
  changePercent: string;
  description: string;
}

export interface MarketOverview {
  stock: {
    name: string;
    value: string;
    change: string;
    changePercent: string;
    volume: string;
    upDownRatio: string;
    highlights: string;
  };
  crypto: {
    name: string;
    value: string;
    change: string;
    changePercent: string;
    marketCap: string;
    dominance: string;
    highlights: string;
  };
  global: {
    name: string;
    value: string;
    change: string;
    changePercent: string;
    trend: string;
    vix: string;
    highlights: string;
  };
  realEstate: {
    name: string;
    value: string;
    change: string;
    changePercent: string;
    volume: string;
    trend: string;
    highlights: string;
  };
  futures: {
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
  nft: {
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
}

export interface SectorPerformance {
  name: string;
  change: string;
  strength: number;
  leadingStocks: string[];
  highlights: string;
}

export interface MarketNews {
  title: string;
  source: string;
  time: string;
  impact: string;
  category: string;
  summary: string;
}

export interface HotStock {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  highlights: string;
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
