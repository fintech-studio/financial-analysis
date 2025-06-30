// patterns_part1.ts - 優化版本
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
  isDoji,
  hasLongUpperShadow,
  hasLongLowerShadow,
  hasShortUpperShadow,
  hasShortLowerShadow,
  isVolumeExpansion,
  patternUtils,
  TrendAnalyzer,
} from "./patterns_common";

const patternsPart1: Pattern[] = [
  // 1. 十字星 (Doji) - 重新設計
  {
    name: "十字星",
    enName: "Doji",
    type: PatternType.INDECISION,
    strength: SignalStrength.MODERATE,
    bullish: null,
    description: "開盤價與收盤價幾乎相等，表示買賣雙方力量均衡",
    detail:
      "十字星代表市場猶豫不決，通常出現在趨勢轉換點。在上升趨勢中可能預示頂部，在下降趨勢中可能預示底部。",
    riskLevel: "medium",
    marketConditions: ["trending", "volatile"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      // 使用配置化的十字星判斷
      if (!isDoji(data, config)) return false;

      // 檢查是否在關鍵位置
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        const isInExtremeZone =
          TrendAnalyzer.isInExtremeZone(
            data,
            candlestickData,
            config,
            "high"
          ) ||
          TrendAnalyzer.isInExtremeZone(data, candlestickData, config, "low");

        return isInExtremeZone;
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
      let confidence = 0.5;

      const bodySize = getBodySize(data);
      const totalRange = getTotalRange(data);
      const bodyRatio = bodySize / totalRange;

      // 實體越小信心度越高
      if (bodyRatio < config.dojiBodyRatio * 0.5) confidence += 0.3;
      else if (bodyRatio < config.dojiBodyRatio) confidence += 0.2;

      // 上下影線均衡加分
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const shadowBalance = Math.abs(upperShadow - lowerShadow) / totalRange;
      if (shadowBalance < 0.2) confidence += 0.2;

      // 成交量驗證
      if (candlestickData && isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },

  // 2. 錘子線 (Hammer) - 優化版本
  {
    name: "錘子線",
    enName: "Hammer",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "小實體配上長下影線，通常出現在下降趨勢末期",
    detail:
      "錘子線表示賣方力量衰竭，買方開始介入。下影線長度至少是實體的兩倍，且上影線很短或沒有。",
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
      // 基本形狀檢查
      if (
        !hasLongLowerShadow(data, config) ||
        !hasShortUpperShadow(data, config)
      ) {
        return false;
      }

      const bodySize = getBodySize(data);
      const totalRange = getTotalRange(data);

      // 實體大小檢查
      if (bodySize > totalRange * config.smallBodyRatio * 1.2) return false;

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
        return TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "low"
        );
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
      let confidence = 0.6;

      const bodySize = getBodySize(data);
      const lowerShadow = getLowerShadow(data);
      const upperShadow = getUpperShadow(data);

      // 下影線越長信心度越高
      const shadowRatio = lowerShadow / bodySize;
      if (shadowRatio > 4) confidence += 0.2;
      else if (shadowRatio > 3) confidence += 0.15;
      else if (shadowRatio > 2.5) confidence += 0.1;

      // 上影線越短越好
      if (upperShadow < bodySize * 0.2) confidence += 0.1;

      // 前期下跌趨勢確認
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(candlestickData, 5, config);
        if (trend === TrendDirection.DOWNTREND) confidence += 0.15;
      }

      // 成交量配合
      if (candlestickData && isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },

  // 3. 上吊線 (Hanging Man) - 優化版本
  {
    name: "上吊線",
    enName: "Hanging Man",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: false,
    description: "小實體配上長下影線，出現在上升趨勢中",
    detail:
      "上吊線與錘子線形狀相似，但出現在上升趨勢中，暗示可能的頂部反轉。需要後續K線確認。",
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
      // 基本形狀檢查 - 與錘子線相同
      if (
        !hasLongLowerShadow(data, config) ||
        !hasShortUpperShadow(data, config)
      ) {
        return false;
      }

      const bodySize = getBodySize(data);
      const totalRange = getTotalRange(data);

      if (bodySize > totalRange * config.smallBodyRatio * 1.2) return false;

      // 關鍵差異：必須在上升趨勢中
      if (context && context.trend !== TrendDirection.UPTREND) {
        return false;
      }

      // 位置檢查 - 必須在相對高位
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        return TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "high"
        );
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
      let confidence = 0.5; // 比錘子線稍低的基準信心度

      const bodySize = getBodySize(data);
      const lowerShadow = getLowerShadow(data);
      const upperShadow = getUpperShadow(data);

      // 下影線比例
      const shadowRatio = lowerShadow / bodySize;
      if (shadowRatio > 4) confidence += 0.15;
      else if (shadowRatio > 3) confidence += 0.1;
      else if (shadowRatio > 2.5) confidence += 0.05;

      // 上影線檢查
      if (upperShadow < bodySize * 0.2) confidence += 0.1;

      // 前期上漲趨勢確認
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(candlestickData, 5, config);
        if (trend === TrendDirection.UPTREND) confidence += 0.15;
      }

      // 如果是陰線，信心度稍高
      if (isRed(data)) confidence += 0.05;

      // 高成交量確認
      if (candlestickData && isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.15; // 上吊線的成交量更重要
      }

      return Math.min(confidence, 1);
    },
  },

  // 4. 射擊之星 (Shooting Star) - 優化版本
  {
    name: "射擊之星",
    enName: "Shooting Star",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: false,
    description: "小實體配上長上影線，出現在上升趨勢頂部",
    detail:
      "射擊之星表示多方推高後遇到阻力，空方力量增強。上影線長度至少是實體的兩倍。",
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
      // 基本形狀檢查
      if (
        !hasLongUpperShadow(data, config) ||
        !hasShortLowerShadow(data, config)
      ) {
        return false;
      }

      const bodySize = getBodySize(data);
      const totalRange = getTotalRange(data);

      if (bodySize > totalRange * config.smallBodyRatio * 1.2) return false;

      // 必須在上升趨勢中
      if (context && context.trend !== TrendDirection.UPTREND) {
        return false;
      }

      // 位置檢查 - 必須在相對高位
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        return TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "high"
        );
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
      let confidence = 0.5;

      const bodySize = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);

      // 上影線比例
      const shadowRatio = upperShadow / bodySize;
      if (shadowRatio > 4) confidence += 0.15;
      else if (shadowRatio > 3) confidence += 0.1;
      else if (shadowRatio > 2.5) confidence += 0.05;

      // 下影線檢查
      if (lowerShadow < bodySize * 0.2) confidence += 0.1;

      // 前期上漲趨勢確認
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(candlestickData, 5, config);
        if (trend === TrendDirection.UPTREND) confidence += 0.15;
      }

      // 如果是陰線，信心度稍高
      if (isRed(data)) confidence += 0.05;

      // 成交量放大
      if (candlestickData && isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.15;
      }

      return Math.min(confidence, 1);
    },
  },

  // 5. 倒錘子線 (Inverted Hammer) - 優化版本
  {
    name: "倒錘子線",
    enName: "Inverted Hammer",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: true,
    description: "小實體配上長上影線，出現在下降趨勢底部",
    detail:
      "倒錘子線顯示空方力量減弱，雖然多方未能完全控制，但已顯示反彈跡象。",
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
      // 基本形狀檢查 - 與射擊之星相同
      if (
        !hasLongUpperShadow(data, config) ||
        !hasShortLowerShadow(data, config)
      ) {
        return false;
      }

      const bodySize = getBodySize(data);
      const totalRange = getTotalRange(data);

      if (bodySize > totalRange * config.smallBodyRatio * 1.2) return false;

      // 關鍵差異：必須在下降趨勢中
      if (
        context &&
        context.trend !== TrendDirection.DOWNTREND &&
        context.trend !== TrendDirection.UNKNOWN
      ) {
        return false;
      }

      // 位置檢查 - 必須在相對低位
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        return TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "low"
        );
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
      let confidence = 0.4; // 需要確認的型態，基準信心度較低

      const bodySize = getBodySize(data);
      const upperShadow = getUpperShadow(data);

      // 上影線比例
      const shadowRatio = upperShadow / bodySize;
      if (shadowRatio > 4) confidence += 0.15;
      else if (shadowRatio > 3) confidence += 0.1;
      else if (shadowRatio > 2.5) confidence += 0.05;

      // 前期下跌趨勢確認
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(candlestickData, 5, config);
        if (trend === TrendDirection.DOWNTREND) confidence += 0.2;
      }

      // 如果是陽線，信心度稍高
      if (isGreen(data)) confidence += 0.05;

      // 後續確認 - 如果下一根是陽線
      if (prevData && isGreen(prevData) && prevData.close > data.close) {
        confidence += 0.2;
      }

      // 成交量配合
      if (candlestickData && isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },

  // 6. 大陽線 (Big Green Candle) - 優化版本
  {
    name: "大陽線",
    enName: "Big Green Candle",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "實體很大的陽線，表示強烈的看漲情緒",
    detail:
      "大陽線代表買方力量強勁，推動價格大幅上漲。通常預示上升趨勢將繼續。",
    riskLevel: "low",
    marketConditions: ["trending", "volatile"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      if (!isGreen(data)) return false;

      const bodySize = getBodySize(data);
      const totalRange = getTotalRange(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);

      // 實體占總波動的比例要大
      const bodyRatio = bodySize / totalRange;
      if (bodyRatio < config.largeBodyRatio) return false;

      // 影線要相對較短
      const shadowRatio = (upperShadow + lowerShadow) / totalRange;
      if (shadowRatio > 0.3) return false;

      // 成交量檢查
      if (
        candlestickData &&
        !isVolumeExpansion(data, candlestickData, config)
      ) {
        return false;
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
      let confidence = 0.7;

      const bodySize = getBodySize(data);
      const totalRange = getTotalRange(data);
      const bodyRatio = bodySize / totalRange;

      // 實體比例越大信心度越高
      if (bodyRatio > 0.9) confidence += 0.2;
      else if (bodyRatio > 0.8) confidence += 0.1;

      // 連續性檢查
      if (prevData && isGreen(prevData)) {
        confidence += 0.05;
      }

      // 趨勢一致性
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(candlestickData, 5, config);
        if (trend === TrendDirection.UPTREND) confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },

  // 7. 大陰線 (Big Red Candle) - 優化版本
  {
    name: "大陰線",
    enName: "Big Red Candle",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.STRONG,
    bullish: false,
    description: "實體很大的陰線，表示強烈的看跌情緒",
    detail:
      "大陰線代表賣方力量強勁，推動價格大幅下跌。通常預示下降趨勢將繼續。",
    riskLevel: "low",
    marketConditions: ["trending", "volatile"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      if (!isRed(data)) return false;

      const bodySize = getBodySize(data);
      const totalRange = getTotalRange(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);

      // 實體占總波動的比例要大
      const bodyRatio = bodySize / totalRange;
      if (bodyRatio < config.largeBodyRatio) return false;

      // 影線要相對較短
      const shadowRatio = (upperShadow + lowerShadow) / totalRange;
      if (shadowRatio > 0.3) return false;

      // 成交量檢查
      if (
        candlestickData &&
        !isVolumeExpansion(data, candlestickData, config)
      ) {
        return false;
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
      let confidence = 0.7;

      const bodySize = getBodySize(data);
      const totalRange = getTotalRange(data);
      const bodyRatio = bodySize / totalRange;

      // 實體比例越大信心度越高
      if (bodyRatio > 0.9) confidence += 0.2;
      else if (bodyRatio > 0.8) confidence += 0.1;

      // 連續性檢查
      if (prevData && isRed(prevData)) {
        confidence += 0.05;
      }

      // 趨勢一致性
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(candlestickData, 5, config);
        if (trend === TrendDirection.DOWNTREND) confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },

  // 8. 看漲吞噬 (Bullish Engulfing) - 優化版本
  {
    name: "看漲吞噬",
    enName: "Bullish Engulfing",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "大陽線完全包覆前一根陰線",
    detail: "看漲吞噬型態表示買方力量壓倒賣方，是強烈的反轉信號。",
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
      if (!prevData || !isRed(prevData) || !isGreen(data)) return false;

      // 完全吞噬條件
      if (data.open >= prevData.close || data.close <= prevData.open)
        return false;

      const currentBody = getBodySize(data);
      const prevBody = getBodySize(prevData);

      // 當前實體要明顯大於前一根
      if (currentBody <= prevBody * 1.1) return false;

      // 下降趨勢檢查
      if (context && context.trend === TrendDirection.UPTREND) return false;

      // 位置檢查
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        return TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "low"
        );
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
      if (!prevData) return 0;

      let confidence = 0.7;

      const currentBody = getBodySize(data);
      const prevBody = getBodySize(prevData);
      const engulfRatio = currentBody / prevBody;

      // 吞噬程度越大信心度越高
      if (engulfRatio > 2) confidence += 0.2;
      else if (engulfRatio > 1.5) confidence += 0.1;

      // 前期下跌趨勢確認
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -1),
          5,
          config
        );
        if (trend === TrendDirection.DOWNTREND) confidence += 0.15;
      }

      // 成交量放大
      if (candlestickData && isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },

  // 9. 看跌吞噬 (Bearish Engulfing) - 優化版本
  {
    name: "看跌吞噬",
    enName: "Bearish Engulfing",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: false,
    description: "大陰線完全包覆前一根陽線",
    detail: "看跌吞噬型態表示賣方力量壓倒買方，是強烈的反轉信號。",
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
      if (!prevData || !isGreen(prevData) || !isRed(data)) return false;

      // 完全吞噬條件
      if (data.open <= prevData.close || data.close >= prevData.open)
        return false;

      const currentBody = getBodySize(data);
      const prevBody = getBodySize(prevData);

      // 當前實體要明顯大於前一根
      if (currentBody <= prevBody * 1.1) return false;

      // 上升趨勢檢查
      if (context && context.trend === TrendDirection.DOWNTREND) return false;

      // 位置檢查
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        return TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "high"
        );
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
      if (!prevData) return 0;

      let confidence = 0.7;

      const currentBody = getBodySize(data);
      const prevBody = getBodySize(prevData);
      const engulfRatio = currentBody / prevBody;

      // 吞噬程度越大信心度越高
      if (engulfRatio > 2) confidence += 0.2;
      else if (engulfRatio > 1.5) confidence += 0.1;

      // 前期上漲趨勢確認
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -1),
          5,
          config
        );
        if (trend === TrendDirection.UPTREND) confidence += 0.15;
      }

      // 成交量放大
      if (candlestickData && isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },

  // 10. 紡錘線 (Spinning Top) - 優化版本
  {
    name: "紡錘線",
    enName: "Spinning Top",
    type: PatternType.INDECISION,
    strength: SignalStrength.WEAK,
    bullish: null,
    description: "小實體配上上下影線，表示市場猶豫",
    detail:
      "紡錘線顯示買賣雙方力量相當，市場處於猶豫狀態。通常需要結合其他技術指標來判斷後續走勢。",
    riskLevel: "high",
    marketConditions: ["ranging", "volatile"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      const bodySize = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);

      // 小實體
      if (bodySize > totalRange * config.smallBodyRatio) return false;

      // 上下都有明顯影線
      if (upperShadow < bodySize || lowerShadow < bodySize) return false;

      // 總波動要有意義
      if (totalRange <= 0) return false;

      return true;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      let confidence = 0.3; // 紡錘線本身信心度較低

      const bodySize = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);

      // 實體越小信心度越高
      const bodyRatio = bodySize / totalRange;
      if (bodyRatio < 0.1) confidence += 0.2;
      else if (bodyRatio < 0.15) confidence += 0.1;

      // 影線平衡度
      const shadowBalance = Math.abs(upperShadow - lowerShadow) / totalRange;
      if (shadowBalance < 0.2) confidence += 0.2;
      else if (shadowBalance < 0.3) confidence += 0.1;

      // 在關鍵位置的紡錘線更有意義
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        const isAtExtreme =
          TrendAnalyzer.isInExtremeZone(
            data,
            candlestickData,
            config,
            "high"
          ) ||
          TrendAnalyzer.isInExtremeZone(data, candlestickData, config, "low");
        if (isAtExtreme) confidence += 0.2;
      }

      return Math.min(confidence, 1);
    },
  },
];

export default patternsPart1;
