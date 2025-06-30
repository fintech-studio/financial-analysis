// 擴展型態系統的類型定義
import {
  PatternType,
  SignalStrength,
  KLineData,
  Pattern,
} from "./patterns_common";

// 進階型態匹配結果
export interface AdvancedPatternMatch {
  pattern: Pattern;
  matchedAt: number;
  additionalInfo: {
    volumeRatio?: number;
    trendContext?: "uptrend" | "downtrend" | "sideways";
    marketCondition?: "volatile" | "stable" | "trending";
  };
}

// 型態統計資訊
export interface PatternStatistics {
  totalPatterns: number;
  byType: Record<PatternType, number>;
  byStrength: Record<SignalStrength, number>;
  successRate?: number;
  timeDistribution: Array<{
    date: string;
    count: number;
  }>;
}

// 型態檢測配置
export interface PatternDetectionConfig {
  enableCache: boolean;
  cacheSize: number;
  batchSize: number;
  includeWeakSignals: boolean;
}

// 市場環境分析
export interface MarketContext {
  trend: "bullish" | "bearish" | "neutral";
  volatility: "high" | "medium" | "low";
  volume: "heavy" | "normal" | "light";
  momentum: "strong" | "weak" | "neutral";
  support?: number;
  resistance?: number;
}

// 型態預測結果
export interface PatternPrediction {
  pattern: Pattern;
  probability: number;
  targetPrice?: number;
  stopLoss?: number;
  timeframe: number; // 預期天數
  riskLevel: "high" | "medium" | "low";
  notes?: string[];
}

// 回測結果
export interface BacktestResult {
  pattern: Pattern;
  totalTrades: number;
  successfulTrades: number;
  successRate: number;
  averageReturn: number;
  maxReturn: number;
  maxLoss: number;
  sharpeRatio?: number;
  trades: Array<{
    date: string;
    entry: number;
    exit: number;
    return: number;
    duration: number;
  }>;
}

// 事件類型定義
export type PatternDetectedEvent = {
  patterns: AdvancedPatternMatch[];
  timestamp: number;
  context: MarketContext;
};

export type PatternUpdateEvent = {
  type: "new" | "update" | "remove";
  pattern: AdvancedPatternMatch;
  timestamp: number;
};

// 工具函數類型
export type PatternValidator = (
  data: KLineData,
  prevData?: KLineData,
  prev2Data?: KLineData,
  context?: MarketContext
) => boolean;

export type PatternPredictor = (
  patterns: AdvancedPatternMatch[],
  historicalData: KLineData[],
  marketContext: MarketContext
) => PatternPrediction[];

// 擴展的型態介面
export interface ExtendedPattern extends Pattern {
  // 型態的歷史成功率
  historicalSuccessRate?: number;

  // 適用的市場條件
  marketConditions?: Array<"trending" | "ranging" | "volatile" | "calm">;

  // 時間框架適用性
  timeframes?: Array<"1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w">;

  // 型態的風險等級
  riskLevel?: "high" | "medium" | "low";

  // 預期價格目標計算函數
  calculateTarget?: (
    data: KLineData,
    prevData?: KLineData
  ) => {
    target: number;
    stopLoss: number;
  };

  // 型態確認函數
  confirm?: (data: KLineData[], index: number) => boolean;
}

// 插件系統類型
export interface PatternPlugin {
  name: string;
  version: string;
  patterns: ExtendedPattern[];
  indicators?: Array<{
    name: string;
    calculate: (data: KLineData[]) => number[];
  }>;
  validators?: Array<{
    name: string;
    validate: PatternValidator;
  }>;
}

// 導出所有類型
export * from "./patterns_common";
