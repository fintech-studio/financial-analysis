// patterns_part2.ts - 優化版本
import {
  KLineData,
  Pattern,
  PatternType,
  SignalStrength,
  PatternConfig,
  MarketContext,
  DEFAULT_PATTERN_CONFIG,
  TrendDirection,
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
  patternUtils,
  TrendAnalyzer,
} from "./patterns_common";

const patternsPart2: Pattern[] = [
  // 11. 早晨之星 (Morning Star) - 三根K線型態，優化版本
  {
    name: "早晨之星",
    enName: "Morning Star",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "三根K線組成的看漲反轉型態",
    detail:
      "早晨之星由大陰線、小實體K線（通常是十字星）和大陽線組成。第三根陽線收盤價需要超過第一根陰線實體的中點。",
    riskLevel: "low",
    marketConditions: ["trending"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      if (!prevData || !prev2Data) return false;

      // 第一根：大陰線
      const firstIsRed = isRed(prev2Data) && isBig(prev2Data, config);

      // 第二根：小實體（可以是十字星）
      const secondIsSmall =
        isSmall(prevData, config) || isDoji(prevData, config);

      // 第三根：大陽線
      const thirdIsGreen =
        isGreen(data) && getBodySize(data) > getBodySize(prev2Data) * 0.6;

      // 收盤價穿越第一根陰線中點
      const midpoint = (prev2Data.open + prev2Data.close) / 2;
      const penetration = data.close > midpoint;

      // 第二根K線應該有向下的缺口
      const hasGapDown = prevData.high < prev2Data.low;

      // 第三根K線應該有向上的缺口或強勢收復
      const hasRecovery =
        data.open > prevData.close || data.close > prevData.high;

      // 趨勢環境檢查
      if (
        context &&
        context.trend !== TrendDirection.DOWNTREND &&
        context.trend !== TrendDirection.UNKNOWN
      ) {
        return false;
      }

      // 位置檢查 - 必須在相對低位
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        const isInLowZone = TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "low"
        );
        if (!isInLowZone) return false;
      }

      return (
        firstIsRed &&
        secondIsSmall &&
        thirdIsGreen &&
        penetration &&
        hasRecovery
      );
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!prevData || !prev2Data) return 0;

      let confidence = 0.7; // 基準信心度

      // 穿透程度評分
      const midpoint = (prev2Data.open + prev2Data.close) / 2;
      const penetrationRatio = (data.close - midpoint) / getBodySize(prev2Data);
      if (penetrationRatio > 0.6) confidence += 0.15;
      else if (penetrationRatio > 0.4) confidence += 0.1;

      // 第二根K線是十字星加分
      if (isDoji(prevData, config)) confidence += 0.1;

      // 缺口大小評分
      if (prevData.high < prev2Data.low) {
        const gapSize = (prev2Data.low - prevData.high) / prev2Data.close;
        if (gapSize > 0.02) confidence += 0.1; // 2%以上缺口
      }

      // 第三根K線強度
      const thirdBodyRatio = getBodySize(data) / getTotalRange(data);
      if (thirdBodyRatio > 0.8) confidence += 0.1;

      // 趨勢確認
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -2),
          5,
          config
        );
        if (trend === TrendDirection.DOWNTREND) confidence += 0.1;
      }

      // 成交量配合
      if (candlestickData && isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },
  // 12. 黃昏之星 (Evening Star) - 三根K線型態，優化版本
  {
    name: "黃昏之星",
    enName: "Evening Star",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: false,
    description: "三根K線組成的看跌反轉型態",
    detail:
      "黃昏之星由大陽線、小實體K線（通常是十字星）和大陰線組成。第三根陰線收盤價需要低於第一根陽線實體的中點。",
    riskLevel: "low",
    marketConditions: ["trending"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      if (!prevData || !prev2Data) return false;

      // 第一根：大陽線
      const firstIsGreen = isGreen(prev2Data) && isBig(prev2Data, config);

      // 第二根：小實體（可以是十字星）
      const secondIsSmall =
        isSmall(prevData, config) || isDoji(prevData, config);

      // 第三根：大陰線
      const thirdIsRed =
        isRed(data) && getBodySize(data) > getBodySize(prev2Data) * 0.6;

      // 收盤價跌破第一根陽線中點
      const midpoint = (prev2Data.open + prev2Data.close) / 2;
      const penetration = data.close < midpoint;

      // 第二根K線應該有向上的缺口
      const hasGapUp = prevData.low > prev2Data.high;

      // 第三根K線應該有向下的缺口或弱勢下跌
      const hasDecline =
        data.open < prevData.close || data.close < prevData.low;

      // 趨勢環境檢查
      if (context && context.trend !== TrendDirection.UPTREND) {
        return false;
      }

      // 位置檢查 - 必須在相對高位
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        const isInHighZone = TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "high"
        );
        if (!isInHighZone) return false;
      }

      return (
        firstIsGreen && secondIsSmall && thirdIsRed && penetration && hasDecline
      );
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!prevData || !prev2Data) return 0;

      let confidence = 0.7; // 基準信心度

      // 穿透程度評分
      const midpoint = (prev2Data.open + prev2Data.close) / 2;
      const penetrationRatio = (midpoint - data.close) / getBodySize(prev2Data);
      if (penetrationRatio > 0.6) confidence += 0.15;
      else if (penetrationRatio > 0.4) confidence += 0.1;

      // 第二根K線是十字星加分
      if (isDoji(prevData, config)) confidence += 0.1;

      // 缺口大小評分
      if (prevData.low > prev2Data.high) {
        const gapSize = (prevData.low - prev2Data.high) / prev2Data.close;
        if (gapSize > 0.02) confidence += 0.1; // 2%以上缺口
      }

      // 第三根K線強度
      const thirdBodyRatio = getBodySize(data) / getTotalRange(data);
      if (thirdBodyRatio > 0.8) confidence += 0.1;

      // 趨勢確認
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -2),
          5,
          config
        );
        if (trend === TrendDirection.UPTREND) confidence += 0.1;
      }

      // 成交量配合
      if (candlestickData && isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },
  // 13. 白色三兵 (Three White Soldiers) - 優化版本
  {
    name: "白色三兵",
    enName: "Three White Soldiers",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "連續三根陽線，每根都比前一根收盤更高",
    detail:
      "白色三兵是強烈的看漲反轉信號，通常出現在下跌趨勢後。三根陽線連續上漲，每根的收盤價都比前一根高，且開盤價在前一根實體內。",
    riskLevel: "low",
    marketConditions: ["trending"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      if (!prevData || !prev2Data) return false;

      // 三根連續陽線
      const allGreen = isGreen(prev2Data) && isGreen(prevData) && isGreen(data);
      if (!allGreen) return false;

      // 逐步上漲 - 每根收盤價都比前一根高
      const ascending =
        prev2Data.close < prevData.close && prevData.close < data.close;
      if (!ascending) return false;

      // 實體大小適中，不能太小（避免weak信號）
      const reasonableSize =
        !isSmall(prev2Data, config) &&
        !isSmall(prevData, config) &&
        !isSmall(data, config);
      if (!reasonableSize) return false;

      // 開盤價應該在前一根實體內或接近（連續性）
      const continuity1 =
        prevData.open >= Math.min(prev2Data.open, prev2Data.close) &&
        prevData.open <= Math.max(prev2Data.open, prev2Data.close);
      const continuity2 =
        data.open >= Math.min(prevData.open, prevData.close) &&
        data.open <= Math.max(prevData.open, prevData.close);

      // 影線不能太長（避免上影線過長顯示阻力）
      const shortShadows =
        hasShortUpperShadow(prev2Data, config) &&
        hasShortUpperShadow(prevData, config) &&
        hasShortUpperShadow(data, config);

      // 趨勢環境檢查 - 應該在下跌趨勢後出現
      if (context && context.trend === TrendDirection.UPTREND) {
        return false; // 不是反轉，而是持續
      }

      // 位置檢查 - 應該在相對低位開始
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        const isFromLowZone = TrendAnalyzer.isInExtremeZone(
          prev2Data,
          candlestickData.slice(0, -2),
          config,
          "low"
        );
        if (!isFromLowZone) return false;
      }

      return continuity1 && continuity2 && shortShadows;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!prevData || !prev2Data) return 0;

      let confidence = 0.75; // 高基準信心度

      // 上漲幅度評分
      const totalGain = (data.close - prev2Data.open) / prev2Data.open;
      if (totalGain > 0.06) confidence += 0.1; // 6%以上漲幅
      else if (totalGain > 0.04) confidence += 0.05; // 4%以上漲幅

      // 實體大小一致性
      const body1 = getBodySize(prev2Data);
      const body2 = getBodySize(prevData);
      const body3 = getBodySize(data);
      const avgBody = (body1 + body2 + body3) / 3;
      const consistency =
        1 -
        (Math.abs(body1 - avgBody) +
          Math.abs(body2 - avgBody) +
          Math.abs(body3 - avgBody)) /
          (3 * avgBody);
      confidence += consistency * 0.1;

      // 連續性評分（開盤價位置）
      const gap1 = Math.abs(prevData.open - prev2Data.close) / prev2Data.close;
      const gap2 = Math.abs(data.open - prevData.close) / prevData.close;
      if (gap1 < 0.01 && gap2 < 0.01) confidence += 0.1; // 連續性好

      // 前期下跌趨勢確認
      if (candlestickData && candlestickData.length >= 8) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -3),
          5,
          config
        );
        if (trend === TrendDirection.DOWNTREND) confidence += 0.1;
      }

      // 成交量遞增
      if (prev2Data.volume && prevData.volume && data.volume) {
        const volumeIncrease =
          prev2Data.volume < prevData.volume && prevData.volume < data.volume;
        if (volumeIncrease) confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },
  // 14. 黑三鴉 (Three Black Crows) - 優化版本
  {
    name: "黑三鴉",
    enName: "Three Black Crows",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: false,
    description: "連續三根陰線，每根都比前一根收盤更低",
    detail:
      "黑三鴉是強烈的看跌反轉信號，通常出現在上升趨勢後。三根陰線連續下跌，每根的收盤價都比前一根低，且開盤價在前一根實體內。",
    riskLevel: "low",
    marketConditions: ["trending"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      if (!prevData || !prev2Data) return false;

      // 三根連續陰線
      const allRed = isRed(prev2Data) && isRed(prevData) && isRed(data);
      if (!allRed) return false;

      // 逐步下跌 - 每根收盤價都比前一根低
      const descending =
        prev2Data.close > prevData.close && prevData.close > data.close;
      if (!descending) return false;

      // 實體大小適中，不能太小
      const reasonableSize =
        !isSmall(prev2Data, config) &&
        !isSmall(prevData, config) &&
        !isSmall(data, config);
      if (!reasonableSize) return false;

      // 開盤價應該在前一根實體內或接近（連續性）
      const continuity1 =
        prevData.open >= Math.min(prev2Data.open, prev2Data.close) &&
        prevData.open <= Math.max(prev2Data.open, prev2Data.close);
      const continuity2 =
        data.open >= Math.min(prevData.open, prevData.close) &&
        data.open <= Math.max(prevData.open, prevData.close);

      // 影線不能太長（避免下影線過長顯示支撐）
      const shortShadows =
        hasShortLowerShadow(prev2Data, config) &&
        hasShortLowerShadow(prevData, config) &&
        hasShortLowerShadow(data, config);

      // 趨勢環境檢查 - 應該在上升趨勢後出現
      if (context && context.trend === TrendDirection.DOWNTREND) {
        return false; // 不是反轉，而是持續
      }

      // 位置檢查 - 應該在相對高位開始
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        const isFromHighZone = TrendAnalyzer.isInExtremeZone(
          prev2Data,
          candlestickData.slice(0, -2),
          config,
          "high"
        );
        if (!isFromHighZone) return false;
      }

      return continuity1 && continuity2 && shortShadows;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!prevData || !prev2Data) return 0;

      let confidence = 0.75; // 高基準信心度

      // 下跌幅度評分
      const totalDrop = (prev2Data.open - data.close) / prev2Data.open;
      if (totalDrop > 0.06) confidence += 0.1; // 6%以上跌幅
      else if (totalDrop > 0.04) confidence += 0.05; // 4%以上跌幅

      // 實體大小一致性
      const body1 = getBodySize(prev2Data);
      const body2 = getBodySize(prevData);
      const body3 = getBodySize(data);
      const avgBody = (body1 + body2 + body3) / 3;
      const consistency =
        1 -
        (Math.abs(body1 - avgBody) +
          Math.abs(body2 - avgBody) +
          Math.abs(body3 - avgBody)) /
          (3 * avgBody);
      confidence += consistency * 0.1;

      // 連續性評分（開盤價位置）
      const gap1 = Math.abs(prevData.open - prev2Data.close) / prev2Data.close;
      const gap2 = Math.abs(data.open - prevData.close) / prevData.close;
      if (gap1 < 0.01 && gap2 < 0.01) confidence += 0.1; // 連續性好

      // 前期上漲趨勢確認
      if (candlestickData && candlestickData.length >= 8) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -3),
          5,
          config
        );
        if (trend === TrendDirection.UPTREND) confidence += 0.1;
      }

      // 成交量遞增
      if (prev2Data.volume && prevData.volume && data.volume) {
        const volumeIncrease =
          prev2Data.volume < prevData.volume && prevData.volume < data.volume;
        if (volumeIncrease) confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },
  // 15. 上升三法 (Rising Three Methods) - 優化版本
  {
    name: "上升三法",
    enName: "Rising Three Methods",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.MODERATE,
    bullish: true,
    description: "大陽線後出現小陰線整理，再以大陽線突破",
    detail:
      "上升三法是看漲延續型態。第一根大陽線後，出現2-3根小陰線在第一根陽線範圍內整理，最後一根大陽線突破新高。",
    riskLevel: "medium",
    marketConditions: ["trending"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      if (!prevData || !prev2Data) return false;

      // 第一根：大陽線
      const firstBigGreen = isGreen(prev2Data) && isBig(prev2Data, config);
      if (!firstBigGreen) return false;

      // 第二根：小陰線（整理）
      const secondSmallRed = isRed(prevData) && isSmall(prevData, config);
      if (!secondSmallRed) return false;

      // 第三根：大陽線且突破
      const thirdBigGreen =
        isGreen(data) && getBodySize(data) > getBodySize(prev2Data) * 0.7;
      if (!thirdBigGreen) return false;

      // 整理期間：第二根K線在第一根範圍內
      const consolidation =
        prevData.high <= prev2Data.high && prevData.low >= prev2Data.low;
      if (!consolidation) return false;

      // 突破：第三根收盤價創新高
      const breakout = data.close > prev2Data.high;
      if (!breakout) return false;

      // 趨勢環境檢查 - 應該在上升趨勢中
      if (
        context &&
        context.trend !== TrendDirection.UPTREND &&
        context.trend !== TrendDirection.UNKNOWN
      ) {
        return false;
      }

      // 檢查前期上升趨勢
      if (candlestickData && candlestickData.length >= 6) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -2),
          4,
          config
        );
        if (trend !== TrendDirection.UPTREND) return false;
      }

      return true;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!prevData || !prev2Data) return 0;

      let confidence = 0.6; // 中等基準信心度

      // 突破幅度評分
      const breakoutSize = (data.close - prev2Data.high) / prev2Data.high;
      if (breakoutSize > 0.02) confidence += 0.15; // 2%以上突破
      else if (breakoutSize > 0.01) confidence += 0.1; // 1%以上突破

      // 整理期間評分（越小越好）
      const consolidationRatio =
        (prevData.high - prevData.low) / (prev2Data.high - prev2Data.low);
      if (consolidationRatio < 0.5) confidence += 0.1;

      // 第三根陽線強度
      const thirdBodyRatio = getBodySize(data) / getTotalRange(data);
      if (thirdBodyRatio > 0.8) confidence += 0.1;

      // 前期趨勢強度
      if (candlestickData && candlestickData.length >= 6) {
        const trendStrength = TrendAnalyzer.calculateTrendStrength(
          candlestickData.slice(0, -2),
          5
        );
        if (trendStrength > 0.6) confidence += 0.1;
      }

      // 成交量模式：第一根和第三根放量，第二根縮量
      if (prev2Data.volume && prevData.volume && data.volume) {
        const firstVolHigh =
          prev2Data.volume >
          (candlestickData
            ? candlestickData
                .slice(-5, -2)
                .reduce((sum, d) => sum + (d.volume || 0), 0) / 3
            : prev2Data.volume);
        const secondVolLow = prevData.volume < prev2Data.volume * 0.7;
        const thirdVolHigh = data.volume > prevData.volume * 1.2;

        if (firstVolHigh && secondVolLow && thirdVolHigh) confidence += 0.15;
      }

      return Math.min(confidence, 1);
    },
  },

  // 16. 下降三法 (Falling Three Methods) - 優化版本
  {
    name: "下降三法",
    enName: "Falling Three Methods",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.MODERATE,
    bullish: false,
    description: "大陰線後出現小陽線整理，再以大陰線跌破",
    detail:
      "下降三法是看跌延續型態。第一根大陰線後，出現2-3根小陽線在第一根陰線範圍內整理，最後一根大陰線跌破新低。",
    riskLevel: "medium",
    marketConditions: ["trending"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      if (!prevData || !prev2Data) return false;

      // 第一根：大陰線
      const firstBigRed = isRed(prev2Data) && isBig(prev2Data, config);
      if (!firstBigRed) return false;

      // 第二根：小陽線（整理）
      const secondSmallGreen = isGreen(prevData) && isSmall(prevData, config);
      if (!secondSmallGreen) return false;

      // 第三根：大陰線且跌破
      const thirdBigRed =
        isRed(data) && getBodySize(data) > getBodySize(prev2Data) * 0.7;
      if (!thirdBigRed) return false;

      // 整理期間：第二根K線在第一根範圍內
      const consolidation =
        prevData.high <= prev2Data.high && prevData.low >= prev2Data.low;
      if (!consolidation) return false;

      // 跌破：第三根收盤價創新低
      const breakdown = data.close < prev2Data.low;
      if (!breakdown) return false;

      // 趨勢環境檢查 - 應該在下降趨勢中
      if (
        context &&
        context.trend !== TrendDirection.DOWNTREND &&
        context.trend !== TrendDirection.UNKNOWN
      ) {
        return false;
      }

      // 檢查前期下降趨勢
      if (candlestickData && candlestickData.length >= 6) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -2),
          4,
          config
        );
        if (trend !== TrendDirection.DOWNTREND) return false;
      }

      return true;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!prevData || !prev2Data) return 0;

      let confidence = 0.6; // 中等基準信心度

      // 跌破幅度評分
      const breakdownSize = (prev2Data.low - data.close) / prev2Data.low;
      if (breakdownSize > 0.02) confidence += 0.15; // 2%以上跌破
      else if (breakdownSize > 0.01) confidence += 0.1; // 1%以上跌破

      // 整理期間評分（越小越好）
      const consolidationRatio =
        (prevData.high - prevData.low) / (prev2Data.high - prev2Data.low);
      if (consolidationRatio < 0.5) confidence += 0.1;

      // 第三根陰線強度
      const thirdBodyRatio = getBodySize(data) / getTotalRange(data);
      if (thirdBodyRatio > 0.8) confidence += 0.1;

      // 前期趨勢強度
      if (candlestickData && candlestickData.length >= 6) {
        const trendStrength = TrendAnalyzer.calculateTrendStrength(
          candlestickData.slice(0, -2),
          5
        );
        if (trendStrength > 0.6) confidence += 0.1;
      }

      // 成交量模式：第一根和第三根放量，第二根縮量
      if (prev2Data.volume && prevData.volume && data.volume) {
        const firstVolHigh =
          prev2Data.volume >
          (candlestickData
            ? candlestickData
                .slice(-5, -2)
                .reduce((sum, d) => sum + (d.volume || 0), 0) / 3
            : prev2Data.volume);
        const secondVolLow = prevData.volume < prev2Data.volume * 0.7;
        const thirdVolHigh = data.volume > prevData.volume * 1.2;

        if (firstVolHigh && secondVolLow && thirdVolHigh) confidence += 0.15;
      }

      return Math.min(confidence, 1);
    },
  },

  // 17. 刺透型態 (Piercing Pattern) - 優化版本
  {
    name: "刺透型態",
    enName: "Piercing Pattern",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: true,
    description: "陰線後出現陽線，收盤價刺透陰線實體中點以上",
    detail:
      "刺透型態是看漲反轉信號。第二根陽線低開但強勢收高，收盤價需要超過第一根陰線實體的中點，顯示買方力量增強。",
    riskLevel: "medium",
    marketConditions: ["trending"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      if (!prevData) return false;

      // 第一根：陰線，需要一定規模
      const firstIsRed = isRed(prevData) && !isSmall(prevData, config);

      // 第二根：陽線，需要一定規模
      const secondIsGreen = isGreen(data) && !isSmall(data, config);

      // 低開條件
      const hasGapDown = data.open < prevData.close;

      // 刺透條件 - 收盤價需要超過第一根陰線實體中點
      const midpoint = (prevData.open + prevData.close) / 2;
      const penetration = data.close > midpoint && data.close < prevData.open;

      // 趨勢環境檢查
      if (
        context &&
        context.trend !== TrendDirection.DOWNTREND &&
        context.trend !== TrendDirection.UNKNOWN
      ) {
        return false;
      }

      // 位置檢查 - 必須在相對低位
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        const isInLowZone = TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "low"
        );
        if (!isInLowZone) return false;
      }

      return firstIsRed && secondIsGreen && penetration;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!prevData) return 0;

      let confidence = 0.6; // 基準信心度

      // 刺透深度評分
      const midpoint = (prevData.open + prevData.close) / 2;
      const penetrationRatio = (data.close - midpoint) / getBodySize(prevData);
      if (penetrationRatio > 0.8) confidence += 0.2;
      else if (penetrationRatio > 0.6) confidence += 0.15;
      else if (penetrationRatio > 0.4) confidence += 0.1;

      // 缺口大小評分
      const gapRatio = (prevData.close - data.open) / prevData.close;
      if (gapRatio > 0.03) confidence += 0.1; // 3%以上缺口
      else if (gapRatio > 0.01) confidence += 0.05;

      // 第二根K線實體強度
      const bodyRatio = getBodySize(data) / getTotalRange(data);
      if (bodyRatio > 0.7) confidence += 0.1;

      // 趨勢確認
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -1),
          5,
          config
        );
        if (trend === TrendDirection.DOWNTREND) confidence += 0.1;
      }

      // 成交量配合
      if (candlestickData && isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },
  // 18. 烏雲蓋頂 (Dark Cloud Cover) - 優化版本
  {
    name: "烏雲蓋頂",
    enName: "Dark Cloud Cover",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: false,
    description: "陽線後出現陰線，收盤價跌破陽線實體中點以下",
    detail:
      "烏雲蓋頂是看跌反轉信號。第二根陰線高開但弱勢收低，收盤價需要低於第一根陽線實體的中點，顯示賣方力量增強。",
    riskLevel: "medium",
    marketConditions: ["trending"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      if (!prevData) return false;

      // 第一根：陽線，需要一定規模
      const firstIsGreen = isGreen(prevData) && !isSmall(prevData, config);

      // 第二根：陰線，需要一定規模
      const secondIsRed = isRed(data) && !isSmall(data, config);

      // 高開條件
      const hasGapUp = data.open > prevData.close;

      // 壓制條件 - 收盤價需要低於第一根陽線實體中點
      const midpoint = (prevData.open + prevData.close) / 2;
      const penetration = data.close < midpoint && data.close > prevData.open;

      // 趨勢環境檢查
      if (
        context &&
        context.trend !== TrendDirection.UPTREND &&
        context.trend !== TrendDirection.UNKNOWN
      ) {
        return false;
      }

      // 位置檢查 - 必須在相對高位
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        const isInHighZone = TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "high"
        );
        if (!isInHighZone) return false;
      }

      return firstIsGreen && secondIsRed && penetration;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!prevData) return 0;

      let confidence = 0.6; // 基準信心度

      // 壓制深度評分
      const midpoint = (prevData.open + prevData.close) / 2;
      const penetrationRatio = (midpoint - data.close) / getBodySize(prevData);
      if (penetrationRatio > 0.8) confidence += 0.2;
      else if (penetrationRatio > 0.6) confidence += 0.15;
      else if (penetrationRatio > 0.4) confidence += 0.1;

      // 缺口大小評分
      const gapRatio = (data.open - prevData.close) / prevData.close;
      if (gapRatio > 0.03) confidence += 0.1; // 3%以上缺口
      else if (gapRatio > 0.01) confidence += 0.05;

      // 第二根K線實體強度
      const bodyRatio = getBodySize(data) / getTotalRange(data);
      if (bodyRatio > 0.7) confidence += 0.1;

      // 趨勢確認
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -1),
          5,
          config
        );
        if (trend === TrendDirection.UPTREND) confidence += 0.1;
      }

      // 成交量配合
      if (candlestickData && isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },
  // 19. 孕育線 (Harami) - 優化版本
  {
    name: "孕育線",
    enName: "Harami",
    type: PatternType.REVERSAL,
    strength: SignalStrength.WEAK,
    bullish: null,
    description: "大K線後出現完全包含在其中的小K線",
    detail:
      "孕育線表示趨勢可能轉變。第二根K線的實體完全包含在第一根K線的實體內，顯示動能減弱，需要後續確認。",
    riskLevel: "high",
    marketConditions: ["trending"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      if (!prevData) return false;

      // 第一根：需要較大實體
      const firstIsBig = isBig(prevData, config);

      // 第二根：需要較小實體
      const secondIsSmall = isSmall(data, config);

      // 包含關係 - 第二根實體完全在第一根實體內
      const parentBodyHigh = Math.max(prevData.open, prevData.close);
      const parentBodyLow = Math.min(prevData.open, prevData.close);
      const childBodyHigh = Math.max(data.open, data.close);
      const childBodyLow = Math.min(data.open, data.close);

      const isContained =
        childBodyHigh <= parentBodyHigh && childBodyLow >= parentBodyLow;

      // 顏色相反（非必須但增強信號）
      const hasOppositeColor =
        (isRed(prevData) && isGreen(data)) ||
        (isGreen(prevData) && isRed(data));

      // 實體大小比例檢查
      const bodyRatio = getBodySize(data) / getBodySize(prevData);
      const hasSignificantDifference = bodyRatio < 0.5;

      // 趨勢環境檢查 - 孕育線通常出現在趨勢末期
      if (context && context.trend === TrendDirection.SIDEWAYS) {
        return false; // 橫盤市場中意義不大
      }

      return (
        firstIsBig && secondIsSmall && isContained && hasSignificantDifference
      );
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!prevData) return 0;

      let confidence = 0.4; // 基準信心度較低，因為需要後續確認

      // 包含程度評分
      const parentBodySize = getBodySize(prevData);
      const childBodySize = getBodySize(data);
      const bodyRatio = childBodySize / parentBodySize;
      if (bodyRatio < 0.25) confidence += 0.15; // 非常小的內部K線
      else if (bodyRatio < 0.4) confidence += 0.1;

      // 顏色相反加分
      const hasOppositeColor =
        (isRed(prevData) && isGreen(data)) ||
        (isGreen(prevData) && isRed(data));
      if (hasOppositeColor) confidence += 0.1;

      // 位置評分 - 在極端位置出現更有意義
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        const isInHighZone = TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "high"
        );
        const isInLowZone = TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "low"
        );
        if (isInHighZone || isInLowZone) confidence += 0.15;
      }

      // 趨勢強度評分
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -1),
          5,
          config
        );
        if (trend !== TrendDirection.SIDEWAYS) confidence += 0.1;
      }

      // 第一根K線的強度
      const firstBodyRatio = getBodySize(prevData) / getTotalRange(prevData);
      if (firstBodyRatio > 0.7) confidence += 0.1;

      return Math.min(confidence, 0.8); // 最高信心度限制為0.8，因為需要後續確認
    },
  },
  // 20. 十字孕育線 (Harami Cross) - 優化版本
  {
    name: "十字孕育線",
    enName: "Harami Cross",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: null,
    description: "大K線後出現十字星，完全包含其中",
    detail:
      "十字孕育線比普通孕育線更強的反轉信號。第二根十字星顯示極度猶豫，通常預示趨勢即將反轉。",
    riskLevel: "medium",
    marketConditions: ["trending"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      if (!prevData) return false;

      // 第一根：需要較大實體
      const firstIsBig = isBig(prevData, config);

      // 第二根：必須是十字星
      const secondIsDoji = isDoji(data, config);

      // 包含關係 - 十字星完全在第一根K線實體內
      const parentBodyHigh = Math.max(prevData.open, prevData.close);
      const parentBodyLow = Math.min(prevData.open, prevData.close);

      const isContained =
        data.high <= parentBodyHigh && data.low >= parentBodyLow;

      // 趨勢環境檢查 - 十字孕育線通常出現在強趨勢末期
      if (context && context.trend === TrendDirection.SIDEWAYS) {
        return false; // 橫盤市場中意義不大
      }

      return firstIsBig && secondIsDoji && isContained;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!prevData) return 0;

      let confidence = 0.6; // 基準信心度，比普通孕育線高

      // 十字星品質評分
      const dojiQuality = 1 - getBodySize(data) / getTotalRange(data);
      confidence += dojiQuality * 0.2; // 最多加0.2

      // 包含程度評分
      const parentBodySize = getBodySize(prevData);
      const parentRange = getTotalRange(prevData);
      const containmentRatio = parentBodySize / parentRange;
      if (containmentRatio > 0.7) confidence += 0.1; // 第一根K線實體佔比高

      // 位置評分 - 在極端位置出現更有意義
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        const isInHighZone = TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "high"
        );
        const isInLowZone = TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "low"
        );
        if (isInHighZone || isInLowZone) confidence += 0.15;
      }

      // 趨勢強度評分
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -1),
          5,
          config
        );
        if (trend !== TrendDirection.SIDEWAYS) confidence += 0.1;
      }

      // 第一根K線的強度
      const firstBodyRatio = getBodySize(prevData) / getTotalRange(prevData);
      if (firstBodyRatio > 0.8) confidence += 0.1;

      // 影線評分 - 十字星有較長影線更有意義
      const hasLongShadows =
        hasLongUpperShadow(data, config) || hasLongLowerShadow(data, config);
      if (hasLongShadows) confidence += 0.05;

      return Math.min(confidence, 1);
    },
  },
];

export default patternsPart2;
