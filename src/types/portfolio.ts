// Portfolio related types
export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  userId: string;
  totalValue: string;
  totalReturn?: string;
  totalReturnPercent?: string;
  totalCost?: number;
  totalGainLoss?: number;
  totalGainLossPercent?: number;
  dayChange?: number;
  dayChangePercent?: number;
  holdings: Holding[];
  transactions?: Transaction[];
  performance?: PerformanceData;
  allocation?: AssetAllocation[];
  createdAt?: string;
  updatedAt?: string;
  isDefault?: boolean;
}

export interface Holding {
  id?: string;
  portfolioId?: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: string;
  currentPrice: string;
  totalValue?: string;
  unrealizedReturn?: string;
  unrealizedReturnPercent?: string;
  weight?: number;
  marketValue?: number;
  costBasis?: number;
  gainLoss?: number;
  gainLossPercent?: number;
  dayChange?: number;
  dayChangePercent?: number;
  lastUpdated?: string;
}

export interface AIData {
  summary: string;
  healthScore: number;
  optimizationPotential: number;
  recommendationLevel: number;
  recommendations: Recommendation[];
}

// PerformanceChart 專用型別（搬移自 PerformanceChart.tsx）
export interface PerformanceData {
  labels: string[];
  portfolio: number[];
  benchmark?: number[];
  [key: string]: string[] | number[] | undefined;
}

export interface KeyPeriod {
  name: string;
  range: [number, number];
  color?: string;
}

export interface ChartData {
  daily: PerformanceData;
  weekly: PerformanceData;
  monthly: PerformanceData;
  returns: Record<string, number>;
  keyPeriods?: KeyPeriod[];
}

export interface AssetAllocation {
  name: string;
  category?: string;
  value: number;
  percentage: number;
  color: string;
}

export interface RiskMetrics {
  volatility: number;
  volatilityVsMarket: number;
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownDate: string;
}

export interface VolatilityData {
  labels: string[];
  portfolio: number[];
  market: number[];
}

export interface DrawdownData {
  labels: string[];
  values: number[];
}

export interface RiskFactors {
  labels: string[];
  values: number[];
}

export interface OtherMetric {
  name: string;
  value: string;
  status: "good" | "neutral" | "bad";
  interpretation: string;
}

export interface RiskData {
  metrics: RiskMetrics;
  volatility: VolatilityData;
  drawdown: DrawdownData;
  riskFactors: RiskFactors;
  otherMetrics: OtherMetric[];
}

export interface Recommendation {
  type: "rebalance" | "opportunity" | "risk" | "adjustment" | "tax";
  title: string;
  priority?: "high" | "medium" | "low";
  subtitle?: string;
  description: string;
  actions?: string[];
  impact?: string;
}

export type ActiveSection = "analysis" | "recommendations";
export type ActiveRecommendationTab =
  | "all"
  | "rebalance"
  | "opportunity"
  | "risk"
  | "adjustment"
  | "tax";

// 交易歷史相關類型
export interface Transaction {
  id: string;
  date: string;
  type: "買入" | "賣出";
  symbol: string;
  name: string;
  quantity: number | string;
  price: string;
  total: string;
  exchange?: string;
  note?: string;
}

export interface TransactionStats {
  basic: {
    買入: { count: number; total: number };
    賣出: { count: number; total: number };
  };
  monthly: Array<[string, { 買入: number; 賣出: number }]>;
  symbols: Array<{
    symbol: string;
    name: string;
    買入: number;
    賣出: number;
    count: number;
  }>;
  netCashFlow: number;
}

export interface ChartDataConfig {
  monthlyChart: ChartData;
  symbolChart: ChartData;
}

export type SortField =
  | "date"
  | "type"
  | "symbol"
  | "name"
  | "quantity"
  | "price"
  | "total";
export type SortDirection = "asc" | "desc";
export type FilterType = "all" | "買入" | "賣出";
export type PeriodType =
  | "all"
  | "last7days"
  | "last30days"
  | "last90days"
  | "thisYear";

export interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export interface TransactionHistoryProps {
  transactions: Transaction[];
}

export interface SortIconProps {
  field: SortField;
}
