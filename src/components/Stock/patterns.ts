// 型態信號強度
export enum SignalStrength {
  WEAK = "weak",
  MODERATE = "moderate",
  STRONG = "strong",
}

// 型態類型
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

// 輔助函數
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

const patterns: Pattern[] = [
  // 1. 十字星 (Doji)
  {
    name: "十字星",
    enName: "Doji",
    type: PatternType.INDECISION,
    strength: SignalStrength.MODERATE,
    bullish: null,
    description: "開盤價與收盤價幾乎相等，表示買賣雙方力量均衡",
    detail:
      "十字星代表市場猶豫不決，通常出現在趨勢轉換點。在上升趨勢中可能預示頂部，在下降趨勢中可能預示底部。",
    check: (data: KLineData) => {
      const bodySize = getBodySize(data);
      const totalRange = getTotalRange(data);
      return bodySize < totalRange * 0.1 && totalRange > 0;
    },
  },

  // 2. 錘子線 (Hammer)
  {
    name: "錘子線",
    enName: "Hammer",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "小實體配上長下影線，通常出現在下降趨勢末期",
    detail:
      "錘子線表示賣方力量衰竭，買方開始介入。下影線長度至少是實體的兩倍，且上影線很短或沒有。這是強烈的看漲反轉信號。",
    check: (data: KLineData) => {
      const bodySize = getBodySize(data);
      const lowerShadow = getLowerShadow(data);
      const upperShadow = getUpperShadow(data);
      const totalRange = getTotalRange(data);

      return (
        lowerShadow >= bodySize * 2 &&
        upperShadow <= bodySize * 0.5 &&
        bodySize > totalRange * 0.1 &&
        bodySize < totalRange * 0.3
      );
    },
  },

  // 3. 上吊線 (Hanging Man)
  {
    name: "上吊線",
    enName: "Hanging Man",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: false,
    description: "小實體配上長下影線，出現在上升趨勢中",
    detail:
      "上吊線與錘子線形狀相似，但出現在上升趨勢中，暗示可能的頂部反轉。需要後續K線確認。",
    check: (data: KLineData, prevData?: KLineData) => {
      if (!prevData) return false;

      const bodySize = getBodySize(data);
      const lowerShadow = getLowerShadow(data);
      const upperShadow = getUpperShadow(data);
      const totalRange = getTotalRange(data);

      return (
        lowerShadow >= bodySize * 2 &&
        upperShadow <= bodySize * 0.5 &&
        bodySize > totalRange * 0.1 &&
        bodySize < totalRange * 0.3 &&
        prevData.close < data.close // 前一根是上漲的
      );
    },
  },

  // 4. 射擊之星 (Shooting Star)
  {
    name: "射擊之星",
    enName: "Shooting Star",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: false,
    description: "小實體配上長上影線，出現在上升趨勢頂部",
    detail:
      "射擊之星表示多方推高後遇到阻力，空方力量增強。上影線長度至少是實體的兩倍，預示可能的下跌。",
    check: (data: KLineData) => {
      const bodySize = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);

      return (
        upperShadow >= bodySize * 2 &&
        lowerShadow <= bodySize * 0.5 &&
        bodySize > totalRange * 0.1 &&
        bodySize < totalRange * 0.3
      );
    },
  },

  // 5. 倒錘子線 (Inverted Hammer)
  {
    name: "倒錘子線",
    enName: "Inverted Hammer",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: true,
    description: "小實體配上長上影線，出現在下降趨勢底部",
    detail:
      "倒錘子線顯示空方力量減弱，雖然多方未能完全控制，但已顯示反彈跡象。需要下一根K線確認。",
    check: (data: KLineData, prevData?: KLineData) => {
      if (!prevData) return false;

      const bodySize = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);

      return (
        upperShadow >= bodySize * 2 &&
        lowerShadow <= bodySize * 0.5 &&
        bodySize > totalRange * 0.1 &&
        bodySize < totalRange * 0.3 &&
        prevData.close > data.close // 前一根是下跌的
      );
    },
  },

  // 6. 大陽線 (Big Green Candle)
  {
    name: "大陽線",
    enName: "Big Green Candle",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "實體很大的陽線，表示強烈的看漲情緒",
    detail:
      "大陽線代表買方力量強勁，推動價格大幅上漲。通常預示上升趨勢將繼續，是強烈的看漲信號。",
    check: (data: KLineData) => {
      return isGreen(data) && isBig(data);
    },
  },

  // 7. 大陰線 (Big Red Candle)
  {
    name: "大陰線",
    enName: "Big Red Candle",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.STRONG,
    bullish: false,
    description: "實體很大的陰線，表示強烈的看跌情緒",
    detail:
      "大陰線代表賣方力量強勁，推動價格大幅下跌。通常預示下降趨勢將繼續，是強烈的看跌信號。",
    check: (data: KLineData) => {
      return isRed(data) && isBig(data);
    },
  },

  // 8. 看漲吞噬 (Bullish Engulfing)
  {
    name: "看漲吞噬",
    enName: "Bullish Engulfing",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "大陽線完全包覆前一根陰線",
    detail:
      "看漲吞噬型態表示買方力量壓倒賣方，是強烈的反轉信號。第二根陽線的實體完全包覆第一根陰線的實體。",
    check: (data: KLineData, prevData?: KLineData) => {
      if (!prevData) return false;

      return (
        isRed(prevData) &&
        isGreen(data) &&
        data.open < prevData.close &&
        data.close > prevData.open &&
        getBodySize(data) > getBodySize(prevData)
      );
    },
  },

  // 9. 看跌吞噬 (Bearish Engulfing)
  {
    name: "看跌吞噬",
    enName: "Bearish Engulfing",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: false,
    description: "大陰線完全包覆前一根陽線",
    detail:
      "看跌吞噬型態表示賣方力量壓倒買方，是強烈的反轉信號。第二根陰線的實體完全包覆第一根陽線的實體。",
    check: (data: KLineData, prevData?: KLineData) => {
      if (!prevData) return false;

      return (
        isGreen(prevData) &&
        isRed(data) &&
        data.open > prevData.close &&
        data.close < prevData.open &&
        getBodySize(data) > getBodySize(prevData)
      );
    },
  },

  // 10. 紡錘線 (Spinning Top)
  {
    name: "紡錘線",
    enName: "Spinning Top",
    type: PatternType.INDECISION,
    strength: SignalStrength.WEAK,
    bullish: null,
    description: "小實體配上上下影線，表示市場猶豫",
    detail:
      "紡錘線顯示買賣雙方力量相當，市場處於猶豫狀態。通常需要結合其他技術指標來判斷後續走勢。",
    check: (data: KLineData) => {
      const bodySize = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);

      return (
        isSmall(data) &&
        upperShadow > bodySize * 0.5 &&
        lowerShadow > bodySize * 0.5 &&
        bodySize > totalRange * 0.1
      );
    },
  },

  // 11. 早晨之星 (Morning Star) - 三根K線型態
  {
    name: "早晨之星",
    enName: "Morning Star",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "三根K線組成的看漲反轉型態",
    detail:
      "早晨之星由大陰線、小實體K線（通常是十字星）和大陽線組成。第三根陽線收盤價需要超過第一根陰線實體的中點。",
    check: (data: KLineData, prevData?: KLineData, prev2Data?: KLineData) => {
      if (!prevData || !prev2Data) return false;

      const firstIsRed = isRed(prev2Data) && isBig(prev2Data);
      const secondIsSmall = isSmall(prevData);
      const thirdIsGreen =
        isGreen(data) && getBodySize(data) > getBodySize(prev2Data) * 0.5;
      const gapDown = prevData.high < prev2Data.low;
      const gapUp = data.low > prevData.high;
      const penetration = data.close > (prev2Data.open + prev2Data.close) / 2;

      return firstIsRed && secondIsSmall && thirdIsGreen && penetration;
    },
  },

  // 12. 黃昏之星 (Evening Star) - 三根K線型態
  {
    name: "黃昏之星",
    enName: "Evening Star",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: false,
    description: "三根K線組成的看跌反轉型態",
    detail:
      "黃昏之星由大陽線、小實體K線（通常是十字星）和大陰線組成。第三根陰線收盤價需要低於第一根陽線實體的中點。",
    check: (data: KLineData, prevData?: KLineData, prev2Data?: KLineData) => {
      if (!prevData || !prev2Data) return false;

      const firstIsGreen = isGreen(prev2Data) && isBig(prev2Data);
      const secondIsSmall = isSmall(prevData);
      const thirdIsRed =
        isRed(data) && getBodySize(data) > getBodySize(prev2Data) * 0.5;
      const penetration = data.close < (prev2Data.open + prev2Data.close) / 2;

      return firstIsGreen && secondIsSmall && thirdIsRed && penetration;
    },
  },

  // 13. 白色三兵 (Three White Soldiers)
  {
    name: "白色三兵",
    enName: "Three White Soldiers",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "連續三根陽線，每根都比前一根收盤更高",
    detail:
      "紅三兵是強烈的看漲反轉信號，通常出現在下跌趨勢後。三根陽線連續上漲，每根的收盤價都比前一根高，且開盤價在前一根實體內。",
    check: (data: KLineData, prevData?: KLineData, prev2Data?: KLineData) => {
      if (!prevData || !prev2Data) return false;

      const allGreen = isGreen(prev2Data) && isGreen(prevData) && isGreen(data);
      const ascending =
        prev2Data.close < prevData.close && prevData.close < data.close;
      const openInBody1 =
        prevData.open > prev2Data.close * 0.9 &&
        prevData.open < prev2Data.close;
      const openInBody2 =
        data.open > prevData.close * 0.9 && data.open < prevData.close;
      const reasonableSize =
        !isSmall(prev2Data) && !isSmall(prevData) && !isSmall(data);

      return (
        allGreen && ascending && openInBody1 && openInBody2 && reasonableSize
      );
    },
  },

  // 14. 黑三鴉 (Three Black Crows)
  {
    name: "黑三鴉",
    enName: "Three Black Crows",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: false,
    description: "連續三根陰線，每根都比前一根收盤更低",
    detail:
      "黑三鴉是強烈的看跌反轉信號，通常出現在上升趨勢後。三根陰線連續下跌，每根的收盤價都比前一根低，且開盤價在前一根實體內。",
    check: (data: KLineData, prevData?: KLineData, prev2Data?: KLineData) => {
      if (!prevData || !prev2Data) return false;

      const allRed = isRed(prev2Data) && isRed(prevData) && isRed(data);
      const descending =
        prev2Data.close > prevData.close && prevData.close > data.close;
      const openInBody1 =
        prevData.open < prev2Data.close * 1.1 &&
        prevData.open > prev2Data.close;
      const openInBody2 =
        data.open < prevData.close * 1.1 && data.open > prevData.close;
      const reasonableSize =
        !isSmall(prev2Data) && !isSmall(prevData) && !isSmall(data);

      return (
        allRed && descending && openInBody1 && openInBody2 && reasonableSize
      );
    },
  },

  // 15. 上升三法 (Rising Three Methods)
  {
    name: "上升三法",
    enName: "Rising Three Methods",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.MODERATE,
    bullish: true,
    description: "大陽線後出現小陰線整理，再以大陽線突破",
    detail:
      "上升三法是看漲延續型態。第一根大陽線後，出現2-3根小陰線在第一根陽線範圍內整理，最後一根大陽線突破新高。",
    check: (data: KLineData, prevData?: KLineData, prev2Data?: KLineData) => {
      if (!prevData || !prev2Data) return false;

      const firstBigGreen = isGreen(prev2Data) && isBig(prev2Data);
      const secondSmallRed = isRed(prevData) && isSmall(prevData);
      const thirdBigGreen =
        isGreen(data) && getBodySize(data) > getBodySize(prev2Data) * 0.7;
      const consolidation =
        prevData.high < prev2Data.high && prevData.low > prev2Data.low;
      const breakout = data.close > prev2Data.high;

      return (
        firstBigGreen &&
        secondSmallRed &&
        thirdBigGreen &&
        consolidation &&
        breakout
      );
    },
  },

  // 16. 下降三法 (Falling Three Methods)
  {
    name: "下降三法",
    enName: "Falling Three Methods",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.MODERATE,
    bullish: false,
    description: "大陰線後出現小陽線整理，再以大陰線跌破",
    detail:
      "下降三法是看跌延續型態。第一根大陰線後，出現2-3根小陽線在第一根陰線範圍內整理，最後一根大陰線跌破新低。",
    check: (data: KLineData, prevData?: KLineData, prev2Data?: KLineData) => {
      if (!prevData || !prev2Data) return false;

      const firstBigRed = isRed(prev2Data) && isBig(prev2Data);
      const secondSmallGreen = isGreen(prevData) && isSmall(prevData);
      const thirdBigRed =
        isRed(data) && getBodySize(data) > getBodySize(prev2Data) * 0.7;
      const consolidation =
        prevData.high < prev2Data.high && prevData.low > prev2Data.low;
      const breakdown = data.close < prev2Data.low;

      return (
        firstBigRed &&
        secondSmallGreen &&
        thirdBigRed &&
        consolidation &&
        breakdown
      );
    },
  },

  // 17. 刺透型態 (Piercing Pattern)
  {
    name: "刺透型態",
    enName: "Piercing Pattern",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: true,
    description: "陰線後出現陽線，收盤價刺透陰線實體中點以上",
    detail:
      "刺透型態是看漲反轉信號。第二根陽線低開但強勢收高，收盤價需要超過第一根陰線實體的中點，顯示買方力量增強。",
    check: (data: KLineData, prevData?: KLineData) => {
      if (!prevData) return false;

      const firstRed = isRed(prevData) && !isSmall(prevData);
      const secondGreen = isGreen(data) && !isSmall(data);
      const gapDown = data.open < prevData.low;
      const penetration = data.close > (prevData.open + prevData.close) / 2;
      const notFullEngulf = data.close < prevData.open;

      return firstRed && secondGreen && gapDown && penetration && notFullEngulf;
    },
  },

  // 18. 烏雲蓋頂 (Dark Cloud Cover)
  {
    name: "烏雲蓋頂",
    enName: "Dark Cloud Cover",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: false,
    description: "陽線後出現陰線，收盤價跌破陽線實體中點以下",
    detail:
      "烏雲蓋頂是看跌反轉信號。第二根陰線高開但弱勢收低，收盤價需要低於第一根陽線實體的中點，顯示賣方力量增強。",
    check: (data: KLineData, prevData?: KLineData) => {
      if (!prevData) return false;

      const firstGreen = isGreen(prevData) && !isSmall(prevData);
      const secondRed = isRed(data) && !isSmall(data);
      const gapUp = data.open > prevData.high;
      const penetration = data.close < (prevData.open + prevData.close) / 2;
      const notFullEngulf = data.close > prevData.open;

      return firstGreen && secondRed && gapUp && penetration && notFullEngulf;
    },
  },

  // 19. 孕育線 (Harami)
  {
    name: "孕育線",
    enName: "Harami",
    type: PatternType.REVERSAL,
    strength: SignalStrength.WEAK,
    bullish: null,
    description: "大K線後出現完全包含在其中的小K線",
    detail:
      "孕育線表示趨勢可能轉變。第二根K線的實體完全包含在第一根K線的實體內，顯示動能減弱，需要後續確認。",
    check: (data: KLineData, prevData?: KLineData) => {
      if (!prevData) return false;

      const firstBig = isBig(prevData);
      const secondSmall = isSmall(data);
      const contained =
        data.open > Math.min(prevData.open, prevData.close) &&
        data.close < Math.max(prevData.open, prevData.close);
      const oppositeColor =
        (isRed(prevData) && isGreen(data)) ||
        (isGreen(prevData) && isRed(data));

      return firstBig && secondSmall && contained && oppositeColor;
    },
  },

  // 20. 十字孕育線 (Harami Cross)
  {
    name: "十字孕育線",
    enName: "Harami Cross",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: null,
    description: "大K線後出現十字星，完全包含其中",
    detail:
      "十字孕育線比普通孕育線更強的反轉信號。第二根十字星顯示極度猶豫，通常預示趨勢即將反轉。",
    check: (data: KLineData, prevData?: KLineData) => {
      if (!prevData) return false;

      const firstBig = isBig(prevData);
      const secondDoji = getBodySize(data) < getTotalRange(data) * 0.1;
      const contained =
        data.high < Math.max(prevData.open, prevData.close) &&
        data.low > Math.min(prevData.open, prevData.close);

      return firstBig && secondDoji && contained;
    },
  },

  // 21. 捉腰帶線 (Belt Hold)
  {
    name: "捉腰帶線",
    enName: "Belt Hold",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: null,
    description: "開盤即為最高價或最低價的長實體K線",
    detail:
      "捉腰帶線顯示單邊力量強勁。看漲捉腰帶開盤即最低價，看跌捉腰帶開盤即最高價，都預示可能的趨勢反轉。",
    check: (data: KLineData) => {
      const longBody = getBodySize(data) > getTotalRange(data) * 0.7;
      const bullishBelt =
        isGreen(data) && data.open === data.low && getLowerShadow(data) === 0;
      const bearishBelt =
        isRed(data) && data.open === data.high && getUpperShadow(data) === 0;

      return longBody && (bullishBelt || bearishBelt);
    },
  },

  // 22. 鑷子頂部 (Tweezers Top)
  {
    name: "鑷子頂部",
    enName: "Tweezers Top",
    type: PatternType.REVERSAL,
    strength: SignalStrength.WEAK,
    bullish: false,
    description: "兩根K線的高點幾乎相等，形成阻力",
    detail:
      "鑷子頂部顯示在相同價位遇到阻力。兩根K線的最高價相近，第二根通常是看跌型態，預示上升動能衰竭。",
    check: (data: KLineData, prevData?: KLineData) => {
      if (!prevData) return false;

      const similarHighs =
        Math.abs(data.high - prevData.high) / prevData.high < 0.005;
      const firstGreen = isGreen(prevData);
      const secondBearish =
        isRed(data) || getUpperShadow(data) > getBodySize(data);

      return similarHighs && firstGreen && secondBearish;
    },
  },

  // 23. 鑷子底部 (Tweezers Bottom)
  {
    name: "鑷子底部",
    enName: "Tweezers Bottom",
    type: PatternType.REVERSAL,
    strength: SignalStrength.WEAK,
    bullish: true,
    description: "兩根K線的低點幾乎相等，形成支撐",
    detail:
      "鑷子底部顯示在相同價位獲得支撐。兩根K線的最低價相近，第二根通常是看漲型態，預示下跌動能衰竭。",
    check: (data: KLineData, prevData?: KLineData) => {
      if (!prevData) return false;

      const similarLows =
        Math.abs(data.low - prevData.low) / prevData.low < 0.005;
      const firstRed = isRed(prevData);
      const secondBullish =
        isGreen(data) || getLowerShadow(data) > getBodySize(data);

      return similarLows && firstRed && secondBullish;
    },
  },

  // 24. 上升旗型 (Bull Flag)
  {
    name: "上升旗型",
    enName: "Bull Flag",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.MODERATE,
    bullish: true,
    description: "強勢上漲後的短期下傾整理，預示繼續上漲",
    detail:
      "上升旗型出現在強勢上漲後，由一根強勢陽線（旗桿）和隨後的下傾整理（旗面）組成。整理期間成交量縮減，突破後成交量放大，目標價位為旗桿長度加上突破點。",
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      historicalData?: KLineData[]
    ) => {
      if (
        !prevData ||
        !prev2Data ||
        !historicalData ||
        historicalData.length < 8
      )
        return false;

      // 取最近8根K線進行分析
      const recentData = historicalData.slice(-8);

      // 檢查是否有強勢上漲（旗桿）
      const flagpoleStart = recentData[0];
      const flagpoleEnd = recentData[2];
      const strongUptrend = flagpoleEnd.close > flagpoleStart.close * 1.05; // 至少5%漲幅

      // 檢查整理階段（旗面）- 輕微下傾
      const consolidationData = recentData.slice(3, 7);
      const highTrend = patternUtils.calculateTrend(consolidationData, "high");
      const lowTrend = patternUtils.calculateTrend(consolidationData, "low");
      const downwardSloping = highTrend < 0 && lowTrend < 0;

      // 檢查整理幅度不大
      const consolidating = patternUtils.isConsolidating(
        consolidationData,
        0.08
      );

      // 檢查成交量遞減
      const volumeDecrease = patternUtils.hasVolumeDecrease(consolidationData);

      // 檢查突破
      const breakout =
        data.close > Math.max(...consolidationData.map((d) => d.high));
      const volumeIncrease =
        (data.volume || 0) >
        (consolidationData[consolidationData.length - 1].volume || 0) * 1.5;

      return strongUptrend && downwardSloping && consolidating && breakout;
    },
  },

  // 25. 下降旗型 (Bear Flag)
  {
    name: "下降旗型",
    enName: "Bear Flag",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.MODERATE,
    bullish: false,
    description: "強勢下跌後的短期上傾整理，預示繼續下跌",
    detail:
      "下降旗型出現在強勢下跌後，由一根強勢陰線（旗桿）和隨後的上傾整理（旗面）組成。整理期間成交量縮減，跌破後成交量放大，目標價位為旗桿長度從跌破點向下測量。",
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      historicalData?: KLineData[]
    ) => {
      if (
        !prevData ||
        !prev2Data ||
        !historicalData ||
        historicalData.length < 8
      )
        return false;

      // 取最近8根K線進行分析
      const recentData = historicalData.slice(-8);

      // 檢查是否有強勢下跌（旗桿）
      const flagpoleStart = recentData[0];
      const flagpoleEnd = recentData[2];
      const strongDowntrend = flagpoleEnd.close < flagpoleStart.close * 0.95; // 至少5%跌幅

      // 檢查整理階段（旗面）- 輕微上傾
      const consolidationData = recentData.slice(3, 7);
      const highTrend = patternUtils.calculateTrend(consolidationData, "high");
      const lowTrend = patternUtils.calculateTrend(consolidationData, "low");
      const upwardSloping = highTrend > 0 && lowTrend > 0;

      // 檢查整理幅度不大
      const consolidating = patternUtils.isConsolidating(
        consolidationData,
        0.08
      );

      // 檢查成交量遞減
      const volumeDecrease = patternUtils.hasVolumeDecrease(consolidationData);

      // 檢查跌破
      const breakdown =
        data.close < Math.min(...consolidationData.map((d) => d.low));
      const volumeIncrease =
        (data.volume || 0) >
        (consolidationData[consolidationData.length - 1].volume || 0) * 1.5;

      return strongDowntrend && upwardSloping && consolidating && breakdown;
    },
  },

  // 26. 上升三角旗 (Ascending Pennant)
  {
    name: "上升三角旗",
    enName: "Ascending Pennant",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.MODERATE,
    bullish: true,
    description: "上升趨勢中的三角形整理，高點持平，低點抬升",
    detail:
      "上升三角旗是看漲延續型態，出現在上升趨勢中。特徵是高點連線水平，低點連線上升，形成三角形收斂。通常在三角形頂部附近向上突破。",
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      historicalData?: KLineData[]
    ) => {
      if (
        !prevData ||
        !prev2Data ||
        !historicalData ||
        historicalData.length < 6
      )
        return false;

      // 取最近6根K線進行分析
      const recentData = historicalData.slice(-6);

      // 檢查高點相對水平
      const highs = recentData.map((d) => d.high);
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const horizontalHighs = Math.abs(highTrend) < highs[0] * 0.002; // 高點趨勢線較平

      // 檢查低點上升
      const lowTrend = patternUtils.calculateTrend(recentData, "low");
      const risingLows = lowTrend > 0;

      // 檢查收斂
      const firstRange = highs[0] - recentData[0].low;
      const lastRange =
        recentData[recentData.length - 1].high -
        recentData[recentData.length - 1].low;
      const converging = lastRange < firstRange * 0.7;

      // 檢查突破
      const resistance = Math.max(...highs.slice(0, -1));
      const breakout = data.close > resistance;

      return horizontalHighs && risingLows && converging && breakout;
    },
  },

  // 27. 下降三角旗 (Descending Pennant)
  {
    name: "下降三角旗",
    enName: "Descending Pennant",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.MODERATE,
    bullish: false,
    description: "下降趨勢中的三角形整理，低點持平，高點下降",
    detail:
      "下降三角旗是看跌延續型態，出現在下降趨勢中。特徵是低點連線水平，高點連線下降，形成三角形收斂。通常在三角形底部附近向下跌破。",
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      historicalData?: KLineData[]
    ) => {
      if (
        !prevData ||
        !prev2Data ||
        !historicalData ||
        historicalData.length < 6
      )
        return false;

      // 取最近6根K線進行分析
      const recentData = historicalData.slice(-6);

      // 檢查低點相對水平
      const lows = recentData.map((d) => d.low);
      const lowTrend = patternUtils.calculateTrend(recentData, "low");
      const horizontalLows = Math.abs(lowTrend) < lows[0] * 0.002; // 低點趨勢線較平

      // 檢查高點下降
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const fallingHighs = highTrend < 0;

      // 檢查收斂
      const firstRange = recentData[0].high - lows[0];
      const lastRange =
        recentData[recentData.length - 1].high -
        recentData[recentData.length - 1].low;
      const converging = lastRange < firstRange * 0.7;

      // 檢查跌破
      const support = Math.min(...lows.slice(0, -1));
      const breakdown = data.close < support;

      return horizontalLows && fallingHighs && converging && breakdown;
    },
  },

  // 28. 上升楔型 (Rising Wedge)
  {
    name: "上升楔型",
    enName: "Rising Wedge",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: false,
    description: "高點和低點都上升但收斂，通常是看跌反轉信號",
    detail:
      "上升楔型是看跌反轉型態。雖然價格持續上升，但上升幅度逐漸縮小，高點和低點連線都向上但逐漸收斂，顯示上升動能衰竭，通常向下跌破。",
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      historicalData?: KLineData[]
    ) => {
      if (
        !prevData ||
        !prev2Data ||
        !historicalData ||
        historicalData.length < 7
      )
        return false;

      // 取最近7根K線進行分析
      const recentData = historicalData.slice(-7);

      // 檢查高點和低點都上升
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const lowTrend = patternUtils.calculateTrend(recentData, "low");
      const bothRising = highTrend > 0 && lowTrend > 0;

      // 檢查收斂（低點上升速度快於高點）
      const converging = lowTrend > highTrend * 0.3; // 低點上升較快，形成楔型收斂

      // 檢查成交量遞減
      const volumeDecrease = patternUtils.hasVolumeDecrease(recentData);

      // 檢查跌破低點趨勢線
      const supportTrendValue =
        recentData[0].low + lowTrend * (recentData.length - 1);
      const breakdown = data.close < supportTrendValue * 0.98; // 跌破支撐趨勢線

      return bothRising && converging && breakdown;
    },
  },

  // 29. 下降楔型 (Falling Wedge)
  {
    name: "下降楔型",
    enName: "Falling Wedge",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: true,
    description: "高點和低點都下降但收斂，通常是看漲反轉信號",
    detail:
      "下降楔型是看漲反轉型態。雖然價格持續下跌，但下跌幅度逐漸縮小，高點和低點連線都向下但逐漸收斂，顯示下跌動能衰竭，通常向上突破。",
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      historicalData?: KLineData[]
    ) => {
      if (
        !prevData ||
        !prev2Data ||
        !historicalData ||
        historicalData.length < 7
      )
        return false;

      // 取最近7根K線進行分析
      const recentData = historicalData.slice(-7);

      // 檢查高點和低點都下降
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const lowTrend = patternUtils.calculateTrend(recentData, "low");
      const bothFalling = highTrend < 0 && lowTrend < 0;

      // 檢查收斂（高點下降速度快於低點）
      const converging = Math.abs(highTrend) > Math.abs(lowTrend) * 0.3; // 高點下降較快，形成楔型收斂

      // 檢查成交量遞減
      const volumeDecrease = patternUtils.hasVolumeDecrease(recentData);

      // 檢查突破高點趨勢線
      const resistanceTrendValue =
        recentData[0].high + highTrend * (recentData.length - 1);
      const breakout = data.close > resistanceTrendValue * 1.02; // 突破阻力趨勢線

      return bothFalling && converging && breakout;
    },
  },

  // 30. W底 (Double Bottom)
  {
    name: "W底（雙重底）",
    enName: "Double Bottom",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "兩個相近的低點形成W形，強烈看漲反轉信號",
    detail:
      "W底是經典的看漲反轉型態。兩個低點價位相近，中間有一個反彈高點。第二個低點通常成交量較小，突破中間高點時成交量放大，確認反轉成功。目標價位通常是型態高度加上突破點。",
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      historicalData?: KLineData[]
    ) => {
      if (!historicalData || historicalData.length < 15) return false;

      // 尋找局部低點
      const minima = patternUtils.findLocalMinima(historicalData, 2);
      if (minima.length < 2) return false;

      // 檢查是否為雙重底
      const isDouble = patternUtils.isDoublePattern(minima, 0.03);
      if (!isDouble) return false;

      const [firstBottom, secondBottom] = minima.slice(-2);

      // 找到兩個底部之間的高點
      const middleSection = historicalData.slice(
        firstBottom.index,
        secondBottom.index + 1
      );
      const middleHigh = Math.max(...middleSection.map((d) => d.high));

      // 檢查突破中間高點
      const breakout = data.close > middleHigh;

      // 檢查第二個底部成交量較低（賣壓減輕）
      const firstBottomData = historicalData[firstBottom.index];
      const secondBottomData = historicalData[secondBottom.index];
      const volumeConfirm =
        !secondBottomData.volume ||
        !firstBottomData.volume ||
        secondBottomData.volume < firstBottomData.volume * 1.2;

      // 確保型態完整性
      const patternHeight =
        middleHigh - Math.min(firstBottom.value, secondBottom.value);
      const significantPattern = patternHeight > firstBottom.value * 0.05; // 至少5%的型態高度

      return isDouble && breakout && volumeConfirm && significantPattern;
    },
  },

  // 31. M頭 (Double Top)
  {
    name: "M頭（雙重頂）",
    enName: "Double Top",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: false,
    description: "兩個相近的高點形成M形，強烈看跌反轉信號",
    detail:
      "M頭是經典的看跌反轉型態。兩個高點價位相近，中間有一個回檔低點。第二個高點通常成交量較小，跌破中間低點時確認反轉。目標價位通常是型態高度從跌破點向下測量。",
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      historicalData?: KLineData[]
    ) => {
      if (!historicalData || historicalData.length < 15) return false;

      // 尋找局部高點
      const maxima = patternUtils.findLocalMaxima(historicalData, 2);
      if (maxima.length < 2) return false;

      // 檢查是否為雙重頂
      const isDouble = patternUtils.isDoublePattern(maxima, 0.03);
      if (!isDouble) return false;

      const [firstTop, secondTop] = maxima.slice(-2);

      // 找到兩個頂部之間的低點
      const middleSection = historicalData.slice(
        firstTop.index,
        secondTop.index + 1
      );
      const middleLow = Math.min(...middleSection.map((d) => d.low));

      // 檢查跌破中間低點
      const breakdown = data.close < middleLow;

      // 檢查第二個頂部成交量較低（買盤減弱）
      const firstTopData = historicalData[firstTop.index];
      const secondTopData = historicalData[secondTop.index];
      const volumeConfirm =
        !secondTopData.volume ||
        !firstTopData.volume ||
        secondTopData.volume < firstTopData.volume * 1.2;

      // 確保型態完整性
      const patternHeight =
        Math.max(firstTop.value, secondTop.value) - middleLow;
      const significantPattern = patternHeight > middleLow * 0.05; // 至少5%的型態高度

      return isDouble && breakdown && volumeConfirm && significantPattern;
    },
  },

  // 32. 頭肩頂 (Head and Shoulders Top)
  {
    name: "頭肩頂",
    enName: "Head and Shoulders Top",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: false,
    description: "左肩、頭部、右肩形成的看跌反轉型態",
    detail:
      "頭肩頂是最可靠的看跌反轉型態之一。由三個高點組成：中間的頭部最高，兩側的肩膀高度相近且較低。頸線連接兩個肩膀間的低點，跌破頸線確認反轉。目標價位為頭部到頸線的距離從跌破點向下測量。",
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      historicalData?: KLineData[]
    ) => {
      if (!historicalData || historicalData.length < 20) return false;

      // 尋找局部高點
      const maxima = patternUtils.findLocalMaxima(historicalData, 2);
      if (maxima.length < 3) return false;

      // 檢查是否為頭肩頂型態
      const isHeadShoulders = patternUtils.isHeadAndShoulders(maxima);
      if (!isHeadShoulders) return false;

      const [leftShoulder, head, rightShoulder] = maxima.slice(-3);

      // 計算頸線位置（兩個肩膀間的低點）
      const leftSection = historicalData.slice(leftShoulder.index, head.index);
      const rightSection = historicalData.slice(
        head.index,
        rightShoulder.index + 5
      );
      const leftTrough = Math.min(...leftSection.map((d) => d.low));
      const rightTrough = Math.min(...rightSection.map((d) => d.low));
      const neckline = Math.max(leftTrough, rightTrough); // 較保守的頸線位置

      // 檢查跌破頸線
      const breakdown = data.close < neckline;

      // 檢查成交量確認（右肩成交量通常較低）
      const headData = historicalData[head.index];
      const rightShoulderData = historicalData[rightShoulder.index];
      const volumeConfirm =
        !rightShoulderData.volume ||
        !headData.volume ||
        rightShoulderData.volume < headData.volume;

      // 確保型態完整性
      const patternHeight = head.value - neckline;
      const significantPattern = patternHeight > neckline * 0.08; // 至少8%的型態高度

      return isHeadShoulders && breakdown && significantPattern;
    },
  },

  // 33. 頭肩底 (Head and Shoulders Bottom / Inverse Head and Shoulders)
  {
    name: "頭肩底",
    enName: "Head and Shoulders Bottom",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "倒置的頭肩型態，強烈看漲反轉信號",
    detail:
      "頭肩底是頭肩頂的倒置版本，是強烈的看漲反轉型態。由三個低點組成：中間的頭部最低，兩側的肩膀高度相近且較高。頸線連接兩個肩膀間的高點，突破頸線確認反轉。目標價位為頭部到頸線的距離從突破點向上測量。",
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      historicalData?: KLineData[]
    ) => {
      if (!historicalData || historicalData.length < 20) return false;

      // 尋找局部低點
      const minima = patternUtils.findLocalMinima(historicalData, 2);
      if (minima.length < 3) return false;

      // 檢查是否為倒置頭肩型態
      const isInverseHeadShoulders =
        patternUtils.isInverseHeadAndShoulders(minima);
      if (!isInverseHeadShoulders) return false;

      const [leftShoulder, head, rightShoulder] = minima.slice(-3);

      // 計算頸線位置（兩個肩膀間的高點）
      const leftSection = historicalData.slice(leftShoulder.index, head.index);
      const rightSection = historicalData.slice(
        head.index,
        rightShoulder.index + 5
      );
      const leftPeak = Math.max(...leftSection.map((d) => d.high));
      const rightPeak = Math.max(...rightSection.map((d) => d.high));
      const neckline = Math.min(leftPeak, rightPeak); // 較保守的頸線位置

      // 檢查突破頸線
      const breakout = data.close > neckline;

      // 檢查成交量確認（右肩成交量通常較低，突破時放量）
      const headData = historicalData[head.index];
      const rightShoulderData = historicalData[rightShoulder.index];
      const volumeConfirm =
        !rightShoulderData.volume ||
        !headData.volume ||
        rightShoulderData.volume < headData.volume;
      const breakoutVolume =
        (data.volume || 0) > (rightShoulderData.volume || 0) * 1.3;

      // 確保型態完整性
      const patternHeight = neckline - head.value;
      const significantPattern = patternHeight > head.value * 0.08; // 至少8%的型態高度

      return isInverseHeadShoulders && breakout && significantPattern;
    },
  },

  // 34. 墓碑線 (Gravestone Doji)
  {
    name: "墓碑線",
    enName: "Gravestone Doji",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: false,
    check: ({ close, open, high, low }: KLineData) => {
      const body = getBodySize({ close, open, high, low });
      const upperShadow = getUpperShadow({ close, open, high, low });
      const lowerShadow = getLowerShadow({ close, open, high, low });
      const totalRange = getTotalRange({ close, open, high, low });

      return (
        body < totalRange * 0.1 &&
        upperShadow > totalRange * 0.7 &&
        lowerShadow < totalRange * 0.1
      );
    },
    description: "長上影線無下影線，強烈看跌訊號",
    detail: "墓碑線出現在高位時，代表多頭攻擊失敗，是強烈的反轉訊號。",
  },

  // 35. 蜻蜓線 (Dragonfly Doji)
  {
    name: "蜻蜓線",
    enName: "Dragonfly Doji",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: true,
    check: ({ close, open, high, low }: KLineData) => {
      const body = getBodySize({ close, open, high, low });
      const upperShadow = getUpperShadow({ close, open, high, low });
      const lowerShadow = getLowerShadow({ close, open, high, low });
      const totalRange = getTotalRange({ close, open, high, low });

      return (
        body < totalRange * 0.1 &&
        lowerShadow > totalRange * 0.7 &&
        upperShadow < totalRange * 0.1
      );
    },
    description: "長下影線無上影線，強烈看漲訊號",
    detail: "蜻蜓線出現在低位時，代表空頭攻擊失敗，是強烈的反轉訊號。",
  },

  // 36. 長陽線 (Bullish Marubozu)
  {
    name: "長陽線",
    enName: "Bullish Marubozu",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.STRONG,
    bullish: true,
    check: ({ close, open, high, low }: KLineData) => {
      const body = getBodySize({ close, open, high, low });
      const upperShadow = getUpperShadow({ close, open, high, low });
      const lowerShadow = getLowerShadow({ close, open, high, low });
      const totalRange = getTotalRange({ close, open, high, low });

      return (
        isGreen({ close, open, high, low }) &&
        body > totalRange * 0.8 &&
        upperShadow < totalRange * 0.1 &&
        lowerShadow < totalRange * 0.1
      );
    },
    description: "幾乎無影線的長陽線，強烈看漲訊號",
    detail: "長陽線代表多頭力量強勁，買方控制全場，通常延續上漲趨勢。",
  },

  // 37. 長陰線 (Bearish Marubozu)
  {
    name: "長陰線",
    enName: "Bearish Marubozu",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.STRONG,
    bullish: false,
    check: ({ close, open, high, low }: KLineData) => {
      const body = getBodySize({ close, open, high, low });
      const upperShadow = getUpperShadow({ close, open, high, low });
      const lowerShadow = getLowerShadow({ close, open, high, low });
      const totalRange = getTotalRange({ close, open, high, low });

      return (
        isRed({ close, open, high, low }) &&
        body > totalRange * 0.8 &&
        upperShadow < totalRange * 0.1 &&
        lowerShadow < totalRange * 0.1
      );
    },
    description: "幾乎無影線的長陰線，強烈看跌訊號",
    detail: "長陰線代表空頭力量強勁，賣方控制全場，通常延續下跌趨勢。",
  },
];

export default patterns;
