// 共用型別、enum、輔助函數

export enum SignalStrength {
  WEAK = "weak",
  MODERATE = "moderate",
  STRONG = "strong",
}

export enum PatternType {
  REVERSAL = "reversal",
  CONTINUATION = "continuation",
  INDECISION = "indecision",
}

export interface KLineData {
  date?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Pattern {
  name: string;
  enName: string;
  type: PatternType;
  strength: SignalStrength;
  check: (
    data: KLineData,
    prevData?: KLineData,
    prev2Data?: KLineData,
    historicalData?: KLineData[]
  ) => boolean;
  description: string;
  detail: string;
  bullish: boolean | null;
}

export const getBodySize = (data: KLineData): number =>
  Math.abs(data.close - data.open);
export const getUpperShadow = (data: KLineData): number =>
  data.high - Math.max(data.open, data.close);
export const getLowerShadow = (data: KLineData): number =>
  Math.min(data.open, data.close) - data.low;
export const getTotalRange = (data: KLineData): number => data.high - data.low;
export const isRed = (data: KLineData): boolean => data.close < data.open;
export const isGreen = (data: KLineData): boolean => data.close > data.open;
export const isBig = (data: KLineData): boolean =>
  getBodySize(data) > getTotalRange(data) * 0.6;
export const isSmall = (data: KLineData): boolean =>
  getBodySize(data) < getTotalRange(data) * 0.3;

// 型態判斷工具物件，方便外部擴充與單元測試
export const patternUtils = {
  getBodySize,
  getUpperShadow,
  getLowerShadow,
  getTotalRange,
  isRed,
  isGreen,
  isBig,
  isSmall,
  // 新增旗型和楔型判斷輔助函數
  calculateSlope: (data: KLineData[]) => {
    if (data.length < 2) return 0;
    const firstPrice = (data[0].high + data[0].low) / 2;
    const lastPrice =
      (data[data.length - 1].high + data[data.length - 1].low) / 2;
    return (lastPrice - firstPrice) / data.length;
  },

  calculateTrend: (data: KLineData[], type: "high" | "low") => {
    if (data.length < 3) return 0;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumXX = 0;

    for (let i = 0; i < data.length; i++) {
      const x = i;
      const y = type === "high" ? data[i].high : data[i].low;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }

    const n = data.length;
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  },

  isConsolidating: (data: KLineData[], threshold: number = 0.05) => {
    if (data.length < 3) return false;
    const prices = data.map((d) => (d.high + d.low) / 2);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    return (max - min) / min < threshold;
  },

  hasVolumeDecrease: (data: KLineData[]) => {
    if (data.length < 3) return false;
    const volumes = data.map((d) => d.volume || 0).filter((v) => v > 0);
    if (volumes.length < 2) return false;

    const firstHalf = volumes.slice(0, Math.floor(volumes.length / 2));
    const secondHalf = volumes.slice(Math.floor(volumes.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    return avgSecond < avgFirst * 0.8;
  },

  // 新增複雜型態判斷輔助函數
  findLocalMinima: (data: KLineData[], windowSize: number = 3) => {
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

      if (isMinimum) {
        minima.push({ index: i, value: current });
      }
    }
    return minima;
  },

  findLocalMaxima: (data: KLineData[], windowSize: number = 3) => {
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

      if (isMaximum) {
        maxima.push({ index: i, value: current });
      }
    }
    return maxima;
  },

  isDoublePattern: (
    points: { index: number; value: number }[],
    tolerance: number = 0.03
  ) => {
    if (points.length < 2) return false;
    const [first, second] = points.slice(-2);
    const priceDiff =
      Math.abs(first.value - second.value) /
      Math.min(first.value, second.value);
    const timeDiff = second.index - first.index;
    return priceDiff < tolerance && timeDiff >= 5 && timeDiff <= 25;
  },

  isHeadAndShoulders: (peaks: { index: number; value: number }[]) => {
    if (peaks.length < 3) return false;
    const [left, head, right] = peaks.slice(-3);

    // 頭部應該是最高點
    const headIsHighest = head.value > left.value && head.value > right.value;

    // 左右肩膀高度相近
    const shouldersLevel =
      Math.abs(left.value - right.value) / Math.min(left.value, right.value) <
      0.05;

    // 時間間隔合理
    const timeSpacing =
      head.index - left.index >= 3 && right.index - head.index >= 3;

    return headIsHighest && shouldersLevel && timeSpacing;
  },

  isInverseHeadAndShoulders: (troughs: { index: number; value: number }[]) => {
    if (troughs.length < 3) return false;
    const [left, head, right] = troughs.slice(-3);

    // 頭部應該是最低點
    const headIsLowest = head.value < left.value && head.value < right.value;

    // 左右肩膀低度相近
    const shouldersLevel =
      Math.abs(left.value - right.value) / Math.max(left.value, right.value) <
      0.05;

    // 時間間隔合理
    const timeSpacing =
      head.index - left.index >= 3 && right.index - head.index >= 3;

    return headIsLowest && shouldersLevel && timeSpacing;
  },
};
