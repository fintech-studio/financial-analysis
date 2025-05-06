export interface MarketStatus {
  isOpen: boolean;
  nextOpenTime: string;
  lastCloseTime: string;
  currentTime: string;
}

export interface MarketIndex {
  name: string;
  value: string;
  change: string;
  changePercent: string;
  volume?: string;
}

export interface MarketSummary {
  totalVolume: string;
  advanceCount: number;
  declineCount: number;
  unchangedCount: number;
  weightedIndexMA5: number;
  weightedIndexMA20: number;
  tradingValue: string;
  largeTradeRatio: string;
}
