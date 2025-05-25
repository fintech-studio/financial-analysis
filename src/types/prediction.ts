// src/types/prediction.ts
export interface StockData {
  price: string;
  open: string;
  high: string;
  low: string;
  lot: string;
  value: string;
  freq: string;
  chartLabels: number[];
}

export interface TechnicalIndicator {
  name: string;
  value: string;
  status: string;
  statusColor: string;
  valueColor?: string;
}

export interface PortfolioItem {
  symbol: string;
  stockCode: string;
  amount: number;
  status: string;
  date: string;
}

export interface ModelSettings {
  autoTrading: boolean;
  linebotNotification: boolean;
}

export interface ChartDataset {
  label: string;
  data: (number | null)[];
  borderColor: string;
  backgroundColor: string;
  borderDash?: number[];
  fill: boolean;
  tension: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y";
export type ActiveTab = "settings" | "portfolio" | "analysis";
