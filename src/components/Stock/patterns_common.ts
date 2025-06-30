// 型態信號強度、型態類型、型別定義與輔助函數
export enum SignalStrength {
  WEAK = "weak",
  MODERATE = "moderate",
  STRONG = "strong",
  VERY_STRONG = "very_strong",
}

export enum PatternType {
  REVERSAL = "reversal",
  CONTINUATION = "continuation",
  INDECISION = "indecision",
  BREAKOUT = "breakout",
}

export enum TrendDirection {
  UPTREND = "uptrend",
  DOWNTREND = "downtrend",
  SIDEWAYS = "sideways",
  UNKNOWN = "unknown",
}

export interface KLineData {
  date?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  timestamp?: number;
}

// 新增：型態參數配置
export interface PatternConfig {
  // 基本比例參數
  smallBodyRatio: number; // 小實體比例 (預設: 0.25)
  largeBodyRatio: number; // 大實體比例 (預設: 0.7)
  shadowRatio: number; // 影線比例 (預設: 2.0)
  dojiBodyRatio: number; // 十字星實體比例 (預設: 0.08)

  // 成交量參數
  volumeThreshold: number; // 放量倍數 (預設: 1.5)

  // 趨勢判斷參數
  trendPeriod: number; // 趨勢判斷期間 (預設: 10)
  trendThreshold: number; // 趨勢強度門檻 (預設: 0.02)

  // 位置判斷參數
  extremeZoneRatio: number; // 極值區域比例 (預設: 0.03)

  // 型態驗證參數
  minPatternConfidence: number; // 最小信心度 (預設: 0.7)
}

// 預設配置
export const DEFAULT_PATTERN_CONFIG: PatternConfig = {
  smallBodyRatio: 0.25,
  largeBodyRatio: 0.7,
  shadowRatio: 2.0,
  dojiBodyRatio: 0.08,
  volumeThreshold: 1.5,
  trendPeriod: 10,
  trendThreshold: 0.02,
  extremeZoneRatio: 0.03,
  minPatternConfidence: 0.7,
};

// 市場環境上下文
export interface MarketContext {
  trend: TrendDirection;
  volatility: number;
  volume: number;
  support: number | null;
  resistance: number | null;
  rsi?: number;
  macd?: number;
}

export interface Pattern {
  name: string;
  enName: string;
  type: PatternType;
  strength: SignalStrength;
  /**
   * @param data 當前K棒
   * @param prevData 前一K棒
   * @param prev2Data 前二K棒
   * @param candlestickData 全部K棒資料，預設空陣列
   * @param config 型態配置參數
   * @param context 市場環境上下文
   */
  check: (
    data: KLineData,
    prevData?: KLineData,
    prev2Data?: KLineData,
    candlestickData?: KLineData[],
    config?: PatternConfig,
    context?: MarketContext
  ) => boolean;
  description: string;
  detail: string;
  bullish: boolean | null;
  // 新增：信心度計算函數
  confidence?: (
    data: KLineData,
    prevData?: KLineData,
    prev2Data?: KLineData,
    candlestickData?: KLineData[],
    config?: PatternConfig
  ) => number;
  // 新增：風險等級
  riskLevel?: "low" | "medium" | "high";
  // 新增：適用的市場條件
  marketConditions?: ("trending" | "ranging" | "volatile" | "calm")[];
}

// 型態匹配結果
export interface PatternMatch {
  pattern: Pattern;
  matchedAt: number; // 匹配的索引位置
  confidence: number; // 信心度 (0-1)
  additionalInfo?: Record<string, any>;
  marketContext?: MarketContext;
  riskReward?: {
    riskLevel: number;
    rewardPotential: number;
    stopLoss?: number;
    takeProfit?: number;
  };
}

// 新增：進階數學計算函數
export class AdvancedMath {
  // 計算標準差
  static standardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return Math.sqrt(variance);
  }

  // 計算變異係數 (CV)
  static coefficientOfVariation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const std = this.standardDeviation(values);
    return mean === 0 ? 0 : std / Math.abs(mean);
  }

  // 計算移動平均
  static movingAverage(values: number[], period: number): number[] {
    if (values.length < period) return [];
    const result: number[] = [];
    for (let i = period - 1; i < values.length; i++) {
      const sum = values
        .slice(i - period + 1, i + 1)
        .reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
  }

  // 計算指數移動平均
  static exponentialMovingAverage(values: number[], period: number): number[] {
    if (values.length === 0) return [];
    const k = 2 / (period + 1);
    const result = [values[0]];

    for (let i = 1; i < values.length; i++) {
      result.push(values[i] * k + result[i - 1] * (1 - k));
    }
    return result;
  }

  // 計算皮爾遜相關係數
  static pearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY)
    );

    return denominator === 0 ? 0 : numerator / denominator;
  }
}

// --- 優化的輔助函數 ---
export const getBodySize = (data: KLineData): number =>
  Math.abs(data.close - data.open);

export const getUpperShadow = (data: KLineData): number =>
  data.high - Math.max(data.open, data.close);

export const getLowerShadow = (data: KLineData): number =>
  Math.min(data.open, data.close) - data.low;

export const getTotalRange = (data: KLineData): number => data.high - data.low;

export const isRed = (data: KLineData): boolean => data.close < data.open;

export const isGreen = (data: KLineData): boolean => data.close > data.open;

export const isBig = (
  data: KLineData,
  config: PatternConfig = DEFAULT_PATTERN_CONFIG
): boolean => getBodySize(data) > getTotalRange(data) * config.largeBodyRatio;

export const isSmall = (
  data: KLineData,
  config: PatternConfig = DEFAULT_PATTERN_CONFIG
): boolean => getBodySize(data) < getTotalRange(data) * config.smallBodyRatio;

// 新增：更精確的型態判斷函數
export const isDoji = (
  data: KLineData,
  config: PatternConfig = DEFAULT_PATTERN_CONFIG
): boolean => {
  const bodySize = getBodySize(data);
  const totalRange = getTotalRange(data);
  return bodySize < totalRange * config.dojiBodyRatio && totalRange > 0;
};

export const hasLongUpperShadow = (
  data: KLineData,
  config: PatternConfig = DEFAULT_PATTERN_CONFIG
): boolean => {
  const bodySize = getBodySize(data);
  const upperShadow = getUpperShadow(data);
  return upperShadow >= bodySize * config.shadowRatio;
};

export const hasLongLowerShadow = (
  data: KLineData,
  config: PatternConfig = DEFAULT_PATTERN_CONFIG
): boolean => {
  const bodySize = getBodySize(data);
  const lowerShadow = getLowerShadow(data);
  return lowerShadow >= bodySize * config.shadowRatio;
};

export const hasShortUpperShadow = (
  data: KLineData,
  config: PatternConfig = DEFAULT_PATTERN_CONFIG
): boolean => {
  const bodySize = getBodySize(data);
  const upperShadow = getUpperShadow(data);
  return upperShadow <= bodySize * 0.3;
};

export const hasShortLowerShadow = (
  data: KLineData,
  config: PatternConfig = DEFAULT_PATTERN_CONFIG
): boolean => {
  const bodySize = getBodySize(data);
  const lowerShadow = getLowerShadow(data);
  return lowerShadow <= bodySize * 0.3;
};

// 成交量分析
export const isVolumeExpansion = (
  current: KLineData,
  historical: KLineData[],
  config: PatternConfig = DEFAULT_PATTERN_CONFIG
): boolean => {
  if (!current.volume || historical.length === 0) return false;

  const recentVolumes = historical
    .slice(-config.trendPeriod)
    .map((d) => d.volume || 0)
    .filter((v) => v > 0);

  if (recentVolumes.length === 0) return false;

  const avgVolume =
    recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length;
  return current.volume > avgVolume * config.volumeThreshold;
};

// 快取機制 - 優化版本
const patternCache = new Map<
  string,
  { result: boolean; timestamp: number; confidence?: number }
>();
const CACHE_SIZE = 2000;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5分鐘過期

const createCacheKey = (
  patternName: string,
  data: KLineData,
  prevData?: KLineData,
  prev2Data?: KLineData
): string => {
  const parts = [
    patternName,
    `${data.open}-${data.high}-${data.low}-${data.close}`,
    prevData
      ? `${prevData.open}-${prevData.high}-${prevData.low}-${prevData.close}`
      : "",
    prev2Data
      ? `${prev2Data.open}-${prev2Data.high}-${prev2Data.low}-${prev2Data.close}`
      : "",
  ];
  return parts.join("|");
};

const cachePatternResult = (
  key: string,
  result: boolean,
  confidence?: number
): boolean => {
  // 清理過期的快取
  const now = Date.now();
  for (const [cacheKey, value] of patternCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRY) {
      patternCache.delete(cacheKey);
    }
  }

  // 限制快取大小
  if (patternCache.size >= CACHE_SIZE) {
    const firstKey = patternCache.keys().next().value;
    if (firstKey) patternCache.delete(firstKey);
  }

  patternCache.set(key, { result, timestamp: now, confidence });
  return result;
};

// 趨勢分析功能
export class TrendAnalyzer {
  static analyzeTrend(
    data: KLineData[],
    period: number = 10,
    config: PatternConfig = DEFAULT_PATTERN_CONFIG
  ): TrendDirection {
    if (data.length < period) return TrendDirection.UNKNOWN;

    const recent = data.slice(-period);
    const prices = recent.map((d) => (d.high + d.low + d.close) / 3);

    // 使用線性回歸計算趨勢
    const x = Array.from({ length: prices.length }, (_, i) => i);
    const correlation = AdvancedMath.pearsonCorrelation(x, prices);

    if (Math.abs(correlation) < config.trendThreshold) {
      return TrendDirection.SIDEWAYS;
    }

    return correlation > 0 ? TrendDirection.UPTREND : TrendDirection.DOWNTREND;
  }

  static calculateTrendStrength(
    data: KLineData[],
    period: number = 10
  ): number {
    if (data.length < period) return 0;

    const recent = data.slice(-period);
    const prices = recent.map((d) => (d.high + d.low + d.close) / 3);
    const x = Array.from({ length: prices.length }, (_, i) => i);

    return Math.abs(AdvancedMath.pearsonCorrelation(x, prices));
  }

  static findSupportResistance(
    data: KLineData[],
    sensitivity: number = 0.02
  ): {
    support: number | null;
    resistance: number | null;
  } {
    if (data.length < 10) return { support: null, resistance: null };

    const highs = data.map((d) => d.high);
    const lows = data.map((d) => d.low);

    // 找到最近的支撐和阻力位
    const maxima = patternUtils.findLocalMaxima(data, 3);
    const minima = patternUtils.findLocalMinima(data, 3);

    const resistance =
      maxima.length > 0 ? maxima[maxima.length - 1].value : Math.max(...highs);

    const support =
      minima.length > 0 ? minima[minima.length - 1].value : Math.min(...lows);

    return { support, resistance };
  }

  static isInExtremeZone(
    current: KLineData,
    data: KLineData[],
    config: PatternConfig = DEFAULT_PATTERN_CONFIG,
    type: "high" | "low" = "high"
  ): boolean {
    if (data.length < config.trendPeriod) return false;

    const recent = data.slice(-config.trendPeriod);
    const values =
      type === "high" ? recent.map((d) => d.high) : recent.map((d) => d.low);

    const extreme = type === "high" ? Math.max(...values) : Math.min(...values);
    const currentValue = type === "high" ? current.high : current.low;

    const threshold =
      type === "high"
        ? extreme * (1 - config.extremeZoneRatio)
        : extreme * (1 + config.extremeZoneRatio);

    return type === "high"
      ? currentValue > threshold
      : currentValue < threshold;
  }
}

// 效能最佳化的型態檢查函數
export const checkPatternWithCache = (
  patternName: string,
  checkFn: () => boolean,
  data: KLineData,
  prevData?: KLineData,
  prev2Data?: KLineData
): boolean => {
  const cacheKey = createCacheKey(patternName, data, prevData, prev2Data);
  const cached = patternCache.get(cacheKey);

  // 檢查快取是否存在且未過期
  if (cached !== undefined) {
    const now = Date.now();
    if (now - cached.timestamp <= CACHE_EXPIRY) {
      return cached.result;
    } else {
      patternCache.delete(cacheKey);
    }
  }

  const result = checkFn();
  return cachePatternResult(cacheKey, result);
};

export const patternUtils = {
  // 基本函數
  getBodySize,
  getUpperShadow,
  getLowerShadow,
  getTotalRange,
  isRed,
  isGreen,
  isBig,
  isSmall,
  isDoji,
  hasLongUpperShadow,
  hasLongLowerShadow,
  hasShortUpperShadow,
  hasShortLowerShadow,
  isVolumeExpansion,

  // 快取相關
  checkPatternWithCache,
  clearPatternCache: () => patternCache.clear(),
  getCacheSize: () => patternCache.size,

  // 市場環境分析
  createMarketContext: (
    data: KLineData[],
    config: PatternConfig = DEFAULT_PATTERN_CONFIG
  ): MarketContext => {
    if (data.length === 0) {
      return {
        trend: TrendDirection.UNKNOWN,
        volatility: 0,
        volume: 0,
        support: null,
        resistance: null,
      };
    }

    const current = data[data.length - 1];
    const trend = TrendAnalyzer.analyzeTrend(data, config.trendPeriod, config);
    const prices = data
      .slice(-config.trendPeriod)
      .map((d) => (d.high + d.low + d.close) / 3);
    const volatility = AdvancedMath.standardDeviation(prices);
    const { support, resistance } = TrendAnalyzer.findSupportResistance(data);

    return {
      trend,
      volatility,
      volume: current.volume || 0,
      support,
      resistance,
    };
  },

  // 進階數學計算
  calculateSlope: (data: KLineData[] = []) => {
    if (!Array.isArray(data) || data.length < 2) return 0;
    const prices = data.map((d) => (d.high + d.low + d.close) / 3);
    const x = Array.from({ length: prices.length }, (_, i) => i);
    return AdvancedMath.pearsonCorrelation(x, prices);
  },

  calculateTrend: (data: KLineData[] = [], type: "high" | "low") => {
    if (!Array.isArray(data) || data.length < 3) return 0;
    const values = data.map((d) => (type === "high" ? d.high : d.low));
    const x = Array.from({ length: values.length }, (_, i) => i);
    return AdvancedMath.pearsonCorrelation(x, values);
  },

  isConsolidating: (data: KLineData[] = [], threshold: number = 0.05) => {
    if (!Array.isArray(data) || data.length < 3) return false;
    const prices = data.map((d) => (d.high + d.low + d.close) / 3);
    const cv = AdvancedMath.coefficientOfVariation(prices);
    return cv < threshold;
  },

  hasVolumeDecrease: (data: KLineData[] = []) => {
    if (!Array.isArray(data) || data.length < 6) return false;
    const volumes = data.map((d) => d.volume || 0).filter((v) => v > 0);
    if (volumes.length < 4) return false;

    const mid = Math.floor(volumes.length / 2);
    const firstHalf = volumes.slice(0, mid);
    const secondHalf = volumes.slice(mid);

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    return avgSecond < avgFirst * 0.8;
  },

  findLocalMinima: (data: KLineData[] = [], windowSize: number = 3) => {
    if (!Array.isArray(data) || data.length < windowSize * 2 + 1) return [];
    const minima: { index: number; value: number }[] = [];

    for (let i = windowSize; i < data.length - windowSize; i++) {
      const current = data[i].low;
      let isMinimum = true;

      for (let j = i - windowSize; j <= i + windowSize; j++) {
        if (j !== i && data[j].low <= current) {
          isMinimum = false;
          break;
        }
      }

      if (isMinimum) minima.push({ index: i, value: current });
    }
    return minima;
  },

  findLocalMaxima: (data: KLineData[] = [], windowSize: number = 3) => {
    if (!Array.isArray(data) || data.length < windowSize * 2 + 1) return [];
    const maxima: { index: number; value: number }[] = [];

    for (let i = windowSize; i < data.length - windowSize; i++) {
      const current = data[i].high;
      let isMaximum = true;

      for (let j = i - windowSize; j <= i + windowSize; j++) {
        if (j !== i && data[j].high >= current) {
          isMaximum = false;
          break;
        }
      }

      if (isMaximum) maxima.push({ index: i, value: current });
    }
    return maxima;
  },

  // 高級型態識別
  isDoublePattern: (
    points: { index: number; value: number }[] = [],
    tolerance: number = 0.03
  ) => {
    if (!Array.isArray(points) || points.length < 2) return false;
    const [first, second] = points.slice(-2);
    const priceDiff =
      Math.abs(first.value - second.value) /
      Math.min(first.value, second.value);
    const timeDiff = second.index - first.index;
    return priceDiff < tolerance && timeDiff >= 5 && timeDiff <= 25;
  },

  isHeadAndShoulders: (peaks: { index: number; value: number }[] = []) => {
    if (!Array.isArray(peaks) || peaks.length < 3) return false;
    const [left, head, right] = peaks.slice(-3);
    const headIsHighest = head.value > left.value && head.value > right.value;
    const shouldersLevel =
      Math.abs(left.value - right.value) / Math.min(left.value, right.value) <
      0.05;
    const timeSpacing =
      head.index - left.index >= 3 && right.index - head.index >= 3;
    return headIsHighest && shouldersLevel && timeSpacing;
  },

  isInverseHeadAndShoulders: (
    troughs: { index: number; value: number }[] = []
  ) => {
    if (!Array.isArray(troughs) || troughs.length < 3) return false;
    const [left, head, right] = troughs.slice(-3);
    const headIsLowest = head.value < left.value && head.value < right.value;
    const shouldersLevel =
      Math.abs(left.value - right.value) / Math.max(left.value, right.value) <
      0.05;
    const timeSpacing =
      head.index - left.index >= 3 && right.index - head.index >= 3;
    return headIsLowest && shouldersLevel && timeSpacing;
  },

  // 新增：智能型態驗證
  validatePattern: (
    pattern: Pattern,
    data: KLineData,
    prevData?: KLineData,
    prev2Data?: KLineData,
    candlestickData?: KLineData[],
    config: PatternConfig = DEFAULT_PATTERN_CONFIG
  ): { isValid: boolean; confidence: number; reasons: string[] } => {
    const reasons: string[] = [];
    let confidence = 0;

    // 基本型態檢查
    const basicCheck = pattern.check(
      data,
      prevData,
      prev2Data,
      candlestickData,
      config
    );
    if (!basicCheck) {
      return { isValid: false, confidence: 0, reasons: ["基本型態條件不滿足"] };
    }

    confidence += 0.4;
    reasons.push("基本型態條件滿足");

    // 成交量驗證
    if (candlestickData && isVolumeExpansion(data, candlestickData, config)) {
      confidence += 0.2;
      reasons.push("成交量放大");
    }

    // 市場環境驗證
    if (candlestickData && candlestickData.length > config.trendPeriod) {
      const context = patternUtils.createMarketContext(candlestickData, config);

      // 檢查型態是否符合當前趨勢環境
      if (pattern.type === PatternType.REVERSAL) {
        const trendStrength = TrendAnalyzer.calculateTrendStrength(
          candlestickData,
          config.trendPeriod
        );
        if (trendStrength > 0.5) {
          confidence += 0.2;
          reasons.push("強趨勢中的反轉型態");
        }
      }

      // 檢查是否在關鍵位置
      if (context.support !== null || context.resistance !== null) {
        confidence += 0.1;
        reasons.push("位於關鍵支撐/阻力位");
      }
    }

    // 使用型態自定義的信心度函數
    if (pattern.confidence) {
      const patternConfidence = pattern.confidence(
        data,
        prevData,
        prev2Data,
        candlestickData,
        config
      );
      confidence = Math.max(confidence, patternConfidence);
    }

    const isValid = confidence >= config.minPatternConfidence;

    return {
      isValid,
      confidence: Math.min(confidence, 1),
      reasons,
    };
  },
};
