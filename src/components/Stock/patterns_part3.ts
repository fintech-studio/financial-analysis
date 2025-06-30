// patterns_part3.ts - 優化版本
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

const patternsPart3: Pattern[] = [
  // 21. 捉腰帶線 (Belt Hold) - 優化版本
  {
    name: "捉腰帶線",
    enName: "Belt Hold",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: null,
    description: "開盤即為最高價或最低價的長實體K線",
    detail:
      "捉腰帶線顯示單邊力量強勁。看漲捉腰帶開盤即最低價，看跌捉腰帶開盤即最高價，都預示可能的趨勢反轉。",
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
      const body = getBodySize(data);
      const range = getTotalRange(data);

      // 需要長實體
      const longBody = body > range * 0.7;
      if (!longBody) return false;

      const lowerShadow = getLowerShadow(data);
      const upperShadow = getUpperShadow(data);

      // 看漲捉腰帶：開盤即最低價（允許極小誤差）
      const bullishBelt =
        isGreen(data) &&
        Math.abs(data.open - data.low) < range * 0.01 &&
        lowerShadow < range * 0.02;

      // 看跌捉腰帶：開盤即最高價（允許極小誤差）
      const bearishBelt =
        isRed(data) &&
        Math.abs(data.open - data.high) < range * 0.01 &&
        upperShadow < range * 0.02;

      const isBeltHold = bullishBelt || bearishBelt;
      if (!isBeltHold) return false;

      // 趨勢環境檢查
      if (context) {
        if (bullishBelt && context.trend === TrendDirection.UPTREND)
          return false;
        if (bearishBelt && context.trend === TrendDirection.DOWNTREND)
          return false;
      }

      // 位置檢查
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        if (bullishBelt) {
          const isInLowZone = TrendAnalyzer.isInExtremeZone(
            data,
            candlestickData,
            config,
            "low"
          );
          if (!isInLowZone) return false;
        }
        if (bearishBelt) {
          const isInHighZone = TrendAnalyzer.isInExtremeZone(
            data,
            candlestickData,
            config,
            "high"
          );
          if (!isInHighZone) return false;
        }
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
      let confidence = 0.6; // 基準信心度

      const body = getBodySize(data);
      const range = getTotalRange(data);

      // 實體佔比評分
      const bodyRatio = body / range;
      if (bodyRatio > 0.85) confidence += 0.15;
      else if (bodyRatio > 0.75) confidence += 0.1;

      // 影線評分（越短越好）
      const shadowRatio = (getUpperShadow(data) + getLowerShadow(data)) / range;
      if (shadowRatio < 0.05) confidence += 0.1;
      else if (shadowRatio < 0.1) confidence += 0.05;

      // 趨勢確認
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -1),
          5,
          config
        );
        const isBullishBelt = isGreen(data);
        const isBearishBelt = isRed(data);

        if (
          (isBullishBelt && trend === TrendDirection.DOWNTREND) ||
          (isBearishBelt && trend === TrendDirection.UPTREND)
        ) {
          confidence += 0.1;
        }
      }

      // 成交量配合
      if (candlestickData && isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },

  // 22. 鑷子頂部 (Tweezers Top) - 優化版本
  {
    name: "鑷子頂部",
    enName: "Tweezers Top",
    type: PatternType.REVERSAL,
    strength: SignalStrength.WEAK,
    bullish: false,
    description: "兩根K線的高點幾乎相等，形成阻力",
    detail:
      "鑷子頂部顯示在相同價位遇到阻力。兩根K線的最高價相近，第二根通常是看跌型態，預示上升動能衰竭。",
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

      // 高點相近檢查
      const highTolerance = 0.01; // 1%允許誤差
      const similarHighs =
        Math.abs(data.high - prevData.high) / prevData.high < highTolerance;
      if (!similarHighs) return false;

      // 實體大小相近
      const bodyRatio = getBodySize(data) / (getBodySize(prevData) + 1e-6);
      const bodySimilar = bodyRatio > 0.5 && bodyRatio < 2;
      if (!bodySimilar) return false;

      // 第一根應該是陽線
      const firstGreen = isGreen(prevData);
      if (!firstGreen) return false;

      // 第二根應該顯示看跌特徵
      const secondBearish =
        isRed(data) || getUpperShadow(data) > getBodySize(data) * 1.2; // 長上影線
      if (!secondBearish) return false;

      // 趨勢環境檢查 - 應該在上升趨勢中
      if (
        context &&
        context.trend !== TrendDirection.UPTREND &&
        context.trend !== TrendDirection.UNKNOWN
      ) {
        return false;
      }

      // 位置檢查 - 應該在相對高位
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        const isInHighZone = TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "high"
        );
        if (!isInHighZone) return false;
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

      let confidence = 0.4; // 基準信心度較低，因為是弱信號

      // 高點相似度評分
      const highDiff = Math.abs(data.high - prevData.high) / prevData.high;
      if (highDiff < 0.005) confidence += 0.15; // 非常接近
      else if (highDiff < 0.008) confidence += 0.1;

      // 第二根K線看跌程度評分
      if (isRed(data)) confidence += 0.1;

      // 上影線評分
      const upperShadowRatio = getUpperShadow(data) / getTotalRange(data);
      if (upperShadowRatio > 0.4) confidence += 0.15; // 長上影線
      else if (upperShadowRatio > 0.3) confidence += 0.1;

      // 趨勢強度評分
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -1),
          5,
          config
        );
        if (trend === TrendDirection.UPTREND) confidence += 0.1;
      }

      // 位置評分
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        const isInHighZone = TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "high"
        );
        if (isInHighZone) confidence += 0.1;
      }

      return Math.min(confidence, 0.8); // 最高限制0.8，因為需要後續確認
    },
  },

  // 23. 鑷子底部 (Tweezers Bottom) - 優化版本
  {
    name: "鑷子底部",
    enName: "Tweezers Bottom",
    type: PatternType.REVERSAL,
    strength: SignalStrength.WEAK,
    bullish: true,
    description: "兩根K線的低點幾乎相等，形成支撐",
    detail:
      "鑷子底部顯示在相同價位獲得支撐。兩根K線的最低價相近，第二根通常是看漲型態，預示下跌動能衰竭。",
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

      // 低點相近檢查
      const lowTolerance = 0.01; // 1%允許誤差
      const similarLows =
        Math.abs(data.low - prevData.low) / prevData.low < lowTolerance;
      if (!similarLows) return false;

      // 實體大小相近
      const bodyRatio = getBodySize(data) / (getBodySize(prevData) + 1e-6);
      const bodySimilar = bodyRatio > 0.5 && bodyRatio < 2;
      if (!bodySimilar) return false;

      // 第一根應該是陰線
      const firstRed = isRed(prevData);
      if (!firstRed) return false;

      // 第二根應該顯示看漲特徵
      const secondBullish =
        isGreen(data) || getLowerShadow(data) > getBodySize(data) * 1.2; // 長下影線
      if (!secondBullish) return false;

      // 趨勢環境檢查 - 應該在下降趨勢中
      if (
        context &&
        context.trend !== TrendDirection.DOWNTREND &&
        context.trend !== TrendDirection.UNKNOWN
      ) {
        return false;
      }

      // 位置檢查 - 應該在相對低位
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        const isInLowZone = TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "low"
        );
        if (!isInLowZone) return false;
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

      let confidence = 0.4; // 基準信心度較低，因為是弱信號

      // 低點相似度評分
      const lowDiff = Math.abs(data.low - prevData.low) / prevData.low;
      if (lowDiff < 0.005) confidence += 0.15; // 非常接近
      else if (lowDiff < 0.008) confidence += 0.1;

      // 第二根K線看漲程度評分
      if (isGreen(data)) confidence += 0.1;

      // 下影線評分
      const lowerShadowRatio = getLowerShadow(data) / getTotalRange(data);
      if (lowerShadowRatio > 0.4) confidence += 0.15; // 長下影線
      else if (lowerShadowRatio > 0.3) confidence += 0.1;

      // 趨勢強度評分
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -1),
          5,
          config
        );
        if (trend === TrendDirection.DOWNTREND) confidence += 0.1;
      }

      // 位置評分
      if (candlestickData && candlestickData.length >= config.trendPeriod) {
        const isInLowZone = TrendAnalyzer.isInExtremeZone(
          data,
          candlestickData,
          config,
          "low"
        );
        if (isInLowZone) confidence += 0.1;
      }

      return Math.min(confidence, 0.8); // 最高限制0.8，因為需要後續確認
    },
  },

  // 24. 上升旗型 (Bull Flag) - 優化版本
  {
    name: "上升旗型",
    enName: "Bull Flag",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.MODERATE,
    bullish: true,
    description: "強勢上漲後的短期下傾整理，預示繼續上漲",
    detail:
      "上升旗型出現在強勢上漲後，由一根強勢陽線（旗桿）和隨後的下傾整理（旗面）組成。整理期間成交量縮減，突破後成交量放大，目標價位為旗桿長度加上突破點。",
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
      if (
        !prevData ||
        !prev2Data ||
        !candlestickData ||
        candlestickData.length < 10
      ) {
        return false;
      }

      // 需要在上升趨勢中
      if (context && context.trend !== TrendDirection.UPTREND) {
        return false;
      }

      const recentData = candlestickData.slice(-10);

      // 旗桿分析：前3-4根K線應該是強勢上漲
      const flagpoleEnd = Math.min(4, recentData.length - 4);
      const flagpole = recentData.slice(0, flagpoleEnd);

      // 旗桿漲幅檢查
      const flagpoleRise =
        flagpole[flagpole.length - 1].close / flagpole[0].close - 1;
      if (flagpoleRise < 0.04) return false; // 至少4%漲幅

      // 旗桿期間大部分應該是陽線
      const greenCount = flagpole.filter((d) => isGreen(d)).length;
      if (greenCount < flagpole.length * 0.7) return false;

      // 旗面分析：中間的K線應該是整理
      const flagStart = flagpoleEnd;
      const flagEnd = recentData.length - 1;
      const flagArea = recentData.slice(flagStart, flagEnd);

      if (flagArea.length < 3) return false;

      // 旗面應該是收斂的整理
      const consolidating = patternUtils.isConsolidating(flagArea, 0.08);
      if (!consolidating) return false;

      // 旗面斜率應該略微向下
      const highTrend = patternUtils.calculateTrend(flagArea, "high");
      const lowTrend = patternUtils.calculateTrend(flagArea, "low");
      const avgTrend = (highTrend + lowTrend) / 2;
      if (avgTrend > 0) return false; // 應該是向下傾斜

      // 旗面波動範圍不應超過旗桿的一半
      const flagpoleRange =
        Math.max(...flagpole.map((d) => d.high)) -
        Math.min(...flagpole.map((d) => d.low));
      const flagRange =
        Math.max(...flagArea.map((d) => d.high)) -
        Math.min(...flagArea.map((d) => d.low));
      if (flagRange > flagpoleRange * 0.6) return false;

      // 突破確認
      const flagResistance = Math.max(...flagArea.map((d) => d.high));
      const breakout = data.close > flagResistance;

      return breakout;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!candlestickData || candlestickData.length < 10) return 0;

      let confidence = 0.6; // 基準信心度

      const recentData = candlestickData.slice(-10);
      const flagpoleEnd = Math.min(4, recentData.length - 4);
      const flagpole = recentData.slice(0, flagpoleEnd);
      const flagArea = recentData.slice(flagpoleEnd, -1);

      // 旗桿強度評分
      const flagpoleRise =
        flagpole[flagpole.length - 1].close / flagpole[0].close - 1;
      if (flagpoleRise > 0.08) confidence += 0.15; // 超過8%漲幅
      else if (flagpoleRise > 0.06) confidence += 0.1;

      // 旗面品質評分
      const consolidationQuality =
        1 -
        (Math.max(...flagArea.map((d) => d.high)) -
          Math.min(...flagArea.map((d) => d.low))) /
          (Math.max(...flagpole.map((d) => d.high)) -
            Math.min(...flagpole.map((d) => d.low)));
      if (consolidationQuality > 0.7) confidence += 0.1;

      // 成交量配合評分
      if (flagArea.length > 2 && patternUtils.hasVolumeDecrease(flagArea)) {
        confidence += 0.1;
      }

      // 突破力度評分
      const flagResistance = Math.max(...flagArea.map((d) => d.high));
      const breakoutStrength = (data.close - flagResistance) / flagResistance;
      if (breakoutStrength > 0.02) confidence += 0.1; // 突破超過2%

      // 成交量擴張評分
      if (isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },
  // 25. 下降旗型 (Bear Flag) - 優化版本
  {
    name: "下降旗型",
    enName: "Bear Flag",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.MODERATE,
    bullish: false,
    description: "強勢下跌後的短期上傾整理，預示繼續下跌",
    detail:
      "下降旗型出現在強勢下跌後，由一根強勢陰線（旗桿）和隨後的上傾整理（旗面）組成。整理期間成交量縮減，跌破後成交量放大，目標價位為旗桿長度從跌破點向下測量。",
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
      if (
        !prevData ||
        !prev2Data ||
        !candlestickData ||
        candlestickData.length < 10
      ) {
        return false;
      }

      // 需要在下降趨勢中
      if (context && context.trend !== TrendDirection.DOWNTREND) {
        return false;
      }

      const recentData = candlestickData.slice(-10);

      // 旗桿分析：前3-4根K線應該是強勢下跌
      const flagpoleEnd = Math.min(4, recentData.length - 4);
      const flagpole = recentData.slice(0, flagpoleEnd);

      // 旗桿跌幅檢查
      const flagpoleDrop =
        1 - flagpole[flagpole.length - 1].close / flagpole[0].close;
      if (flagpoleDrop < 0.04) return false; // 至少4%跌幅

      // 旗桿期間大部分應該是陰線
      const redCount = flagpole.filter((d) => isRed(d)).length;
      if (redCount < flagpole.length * 0.7) return false;

      // 旗面分析：中間的K線應該是整理
      const flagStart = flagpoleEnd;
      const flagEnd = recentData.length - 1;
      const flagArea = recentData.slice(flagStart, flagEnd);

      if (flagArea.length < 3) return false;

      // 旗面應該是收斂的整理
      const consolidating = patternUtils.isConsolidating(flagArea, 0.08);
      if (!consolidating) return false;

      // 旗面斜率應該略微向上
      const highTrend = patternUtils.calculateTrend(flagArea, "high");
      const lowTrend = patternUtils.calculateTrend(flagArea, "low");
      const avgTrend = (highTrend + lowTrend) / 2;
      if (avgTrend < 0) return false; // 應該是向上傾斜

      // 旗面波動範圍不應超過旗桿的一半
      const flagpoleRange =
        Math.max(...flagpole.map((d) => d.high)) -
        Math.min(...flagpole.map((d) => d.low));
      const flagRange =
        Math.max(...flagArea.map((d) => d.high)) -
        Math.min(...flagArea.map((d) => d.low));
      if (flagRange > flagpoleRange * 0.6) return false;

      // 跌破確認
      const flagSupport = Math.min(...flagArea.map((d) => d.low));
      const breakdown = data.close < flagSupport;

      return breakdown;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!candlestickData || candlestickData.length < 10) return 0;

      let confidence = 0.6; // 基準信心度

      const recentData = candlestickData.slice(-10);
      const flagpoleEnd = Math.min(4, recentData.length - 4);
      const flagpole = recentData.slice(0, flagpoleEnd);
      const flagArea = recentData.slice(flagpoleEnd, -1);

      // 旗桿強度評分
      const flagpoleDrop =
        1 - flagpole[flagpole.length - 1].close / flagpole[0].close;
      if (flagpoleDrop > 0.08) confidence += 0.15; // 超過8%跌幅
      else if (flagpoleDrop > 0.06) confidence += 0.1;

      // 旗面品質評分
      const consolidationQuality =
        1 -
        (Math.max(...flagArea.map((d) => d.high)) -
          Math.min(...flagArea.map((d) => d.low))) /
          (Math.max(...flagpole.map((d) => d.high)) -
            Math.min(...flagpole.map((d) => d.low)));
      if (consolidationQuality > 0.7) confidence += 0.1;

      // 成交量配合評分
      if (flagArea.length > 2 && patternUtils.hasVolumeDecrease(flagArea)) {
        confidence += 0.1;
      }

      // 跌破力度評分
      const flagSupport = Math.min(...flagArea.map((d) => d.low));
      const breakdownStrength = (flagSupport - data.close) / flagSupport;
      if (breakdownStrength > 0.02) confidence += 0.1; // 跌破超過2%

      // 成交量擴張評分
      if (isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },
  // 26. 上升三角旗 (Ascending Pennant) - 優化版本
  {
    name: "上升三角旗",
    enName: "Ascending Pennant",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.MODERATE,
    bullish: true,
    description: "上升趨勢中的三角形整理，高點持平，低點抬升",
    detail:
      "上升三角旗是看漲延續型態，出現在上升趨勢中。特徵是高點連線水平，低點連線上升，形成三角形收斂。通常在三角形頂部附近向上突破。",
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
      if (
        !prevData ||
        !prev2Data ||
        !candlestickData ||
        candlestickData.length < 8
      ) {
        return false;
      }

      // 需要在上升趨勢中
      if (context && context.trend !== TrendDirection.UPTREND) {
        return false;
      }

      const recentData = candlestickData.slice(-8);
      const highs = recentData.map((d) => d.high);
      const lows = recentData.map((d) => d.low);

      // 高點水平檢查
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const horizontalHighs = Math.abs(highTrend) < Math.max(...highs) * 0.002;
      if (!horizontalHighs) return false;

      // 低點上升檢查
      const lowTrend = patternUtils.calculateTrend(recentData, "low");
      const risingLows = lowTrend > Math.max(...lows) * 0.002;
      if (!risingLows) return false;

      // 收斂檢查
      const firstRange = highs[0] - lows[0];
      const lastRange = highs[highs.length - 1] - lows[lows.length - 1];
      const converging = lastRange < firstRange * 0.75;
      if (!converging) return false;

      // 突破檢查
      const resistance = Math.max(...highs.slice(0, -1));
      const breakout = data.close > resistance;

      return breakout;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!candlestickData || candlestickData.length < 8) return 0;

      let confidence = 0.6; // 基準信心度

      const recentData = candlestickData.slice(-8);
      const highs = recentData.map((d) => d.high);
      const lows = recentData.map((d) => d.low);

      // 水平阻力品質評分
      const highVariance = Math.max(...highs) - Math.min(...highs);
      const avgHigh = highs.reduce((a, b) => a + b, 0) / highs.length;
      if (highVariance / avgHigh < 0.01) confidence += 0.1; // 高點非常平

      // 上升支撐品質評分
      const lowTrend = patternUtils.calculateTrend(recentData, "low");
      const minLow = Math.min(...lows);
      if (lowTrend / minLow > 0.005) confidence += 0.1; // 低點明顯上升

      // 收斂品質評分
      const firstRange = highs[0] - lows[0];
      const lastRange = highs[highs.length - 1] - lows[lows.length - 1];
      const convergenceRatio = lastRange / firstRange;
      if (convergenceRatio < 0.5) confidence += 0.15; // 高度收斂
      else if (convergenceRatio < 0.7) confidence += 0.1;

      // 突破力度評分
      const resistance = Math.max(...highs.slice(0, -1));
      const breakoutStrength = (data.close - resistance) / resistance;
      if (breakoutStrength > 0.02) confidence += 0.1;

      // 成交量配合評分
      if (isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },
  // 27. 下降三角旗 (Descending Pennant) - 優化版本
  {
    name: "下降三角旗",
    enName: "Descending Pennant",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.MODERATE,
    bullish: false,
    description: "下降趨勢中的三角形整理，低點持平，高點下降",
    detail:
      "下降三角旗是看跌延續型態，出現在下降趨勢中。特徵是低點連線水平，高點連線下降，形成三角形收斂。通常在三角形底部附近向下跌破。",
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
      if (
        !prevData ||
        !prev2Data ||
        !candlestickData ||
        candlestickData.length < 8
      ) {
        return false;
      }

      // 需要在下降趨勢中
      if (context && context.trend !== TrendDirection.DOWNTREND) {
        return false;
      }

      const recentData = candlestickData.slice(-8);
      const highs = recentData.map((d) => d.high);
      const lows = recentData.map((d) => d.low);

      // 低點水平檢查
      const lowTrend = patternUtils.calculateTrend(recentData, "low");
      const horizontalLows = Math.abs(lowTrend) < Math.max(...lows) * 0.002;
      if (!horizontalLows) return false;

      // 高點下降檢查
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const fallingHighs = highTrend < -Math.max(...highs) * 0.002;
      if (!fallingHighs) return false;

      // 收斂檢查
      const firstRange = highs[0] - lows[0];
      const lastRange = highs[highs.length - 1] - lows[lows.length - 1];
      const converging = lastRange < firstRange * 0.75;
      if (!converging) return false;

      // 跌破檢查
      const support = Math.min(...lows.slice(0, -1));
      const breakdown = data.close < support;

      return breakdown;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!candlestickData || candlestickData.length < 8) return 0;

      let confidence = 0.6;

      const recentData = candlestickData.slice(-8);
      const highs = recentData.map((d) => d.high);
      const lows = recentData.map((d) => d.low);

      // 水平支撐品質評分
      const lowVariance = Math.max(...lows) - Math.min(...lows);
      const avgLow = lows.reduce((a, b) => a + b, 0) / lows.length;
      if (lowVariance / avgLow < 0.01) confidence += 0.1;

      // 下降阻力品質評分
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const maxHigh = Math.max(...highs);
      if (Math.abs(highTrend) / maxHigh > 0.005) confidence += 0.1;

      // 收斂品質評分
      const firstRange = highs[0] - lows[0];
      const lastRange = highs[highs.length - 1] - lows[lows.length - 1];
      const convergenceRatio = lastRange / firstRange;
      if (convergenceRatio < 0.5) confidence += 0.15;
      else if (convergenceRatio < 0.7) confidence += 0.1;

      // 跌破力度評分
      const support = Math.min(...lows.slice(0, -1));
      const breakdownStrength = (support - data.close) / support;
      if (breakdownStrength > 0.02) confidence += 0.1;

      // 成交量配合評分
      if (isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },

  // 28. 上升楔型 (Rising Wedge) - 優化版本
  {
    name: "上升楔型",
    enName: "Rising Wedge",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: false,
    description: "高點和低點都上升但收斂，通常是看跌反轉信號",
    detail:
      "上升楔型是看跌反轉型態。雖然價格持續上升，但上升幅度逐漸縮小，高點和低點連線都向上但逐漸收斂，顯示上升動能衰竭，通常向下跌破。",
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
      if (
        !prevData ||
        !prev2Data ||
        !candlestickData ||
        candlestickData.length < 10
      ) {
        return false;
      }

      // 通常在上升趨勢末期出現
      if (context && context.trend === TrendDirection.DOWNTREND) {
        return false;
      }

      const recentData = candlestickData.slice(-10);

      // 高點和低點趨勢分析
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const lowTrend = patternUtils.calculateTrend(recentData, "low");

      // 兩條線都應該上升
      const bothRising = highTrend > 0 && lowTrend > 0;
      if (!bothRising) return false;

      // 收斂：低點上升速度明顯大於高點
      const converging = lowTrend > highTrend * 1.2;
      if (!converging) return false;

      // 成交量應該遞減
      if (
        recentData.length > 5 &&
        !patternUtils.hasVolumeDecrease(recentData)
      ) {
        return false;
      }

      // 跌破低點趨勢線
      const supportTrendValue =
        recentData[0].low + lowTrend * (recentData.length - 1);
      const breakdown = data.close < supportTrendValue * 0.985;

      return breakdown;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!candlestickData || candlestickData.length < 10) return 0;

      let confidence = 0.6;

      const recentData = candlestickData.slice(-10);
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const lowTrend = patternUtils.calculateTrend(recentData, "low");

      // 收斂品質評分
      const convergenceRatio = lowTrend / highTrend;
      if (convergenceRatio > 2) confidence += 0.15; // 高度收斂
      else if (convergenceRatio > 1.5) confidence += 0.1;

      // 成交量遞減評分
      if (patternUtils.hasVolumeDecrease(recentData)) {
        confidence += 0.1;
      }

      // 跌破力度評分
      const supportTrendValue =
        recentData[0].low + lowTrend * (recentData.length - 1);
      const breakdownStrength =
        (supportTrendValue - data.close) / supportTrendValue;
      if (breakdownStrength > 0.02) confidence += 0.1;

      // 位置評分 - 在高位更有意義
      if (
        TrendAnalyzer.isInExtremeZone(data, candlestickData, config, "high")
      ) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },

  // 29. 下降楔型 (Falling Wedge) - 優化版本
  {
    name: "下降楔型",
    enName: "Falling Wedge",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: true,
    description: "高點和低點都下降但收斂，通常是看漲反轉信號",
    detail:
      "下降楔型是看漲反轉型態。雖然價格持續下跌，但下跌幅度逐漸縮小，高點和低點連線都向下但逐漸收斂，顯示下跌動能衰竭，通常向上突破。",
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
      if (
        !prevData ||
        !prev2Data ||
        !candlestickData ||
        candlestickData.length < 10
      ) {
        return false;
      }

      // 通常在下降趨勢末期出現
      if (context && context.trend === TrendDirection.UPTREND) {
        return false;
      }

      const recentData = candlestickData.slice(-10);

      // 高點和低點趨勢分析
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const lowTrend = patternUtils.calculateTrend(recentData, "low");

      // 兩條線都應該下降
      const bothFalling = highTrend < 0 && lowTrend < 0;
      if (!bothFalling) return false;

      // 收斂：高點下降速度明顯大於低點
      const converging = Math.abs(highTrend) > Math.abs(lowTrend) * 1.2;
      if (!converging) return false;

      // 成交量應該遞減
      if (
        recentData.length > 5 &&
        !patternUtils.hasVolumeDecrease(recentData)
      ) {
        return false;
      }

      // 突破高點趨勢線
      const resistanceTrendValue =
        recentData[0].high + highTrend * (recentData.length - 1);
      const breakout = data.close > resistanceTrendValue * 1.015;

      return breakout;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!candlestickData || candlestickData.length < 10) return 0;

      let confidence = 0.6;

      const recentData = candlestickData.slice(-10);
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const lowTrend = patternUtils.calculateTrend(recentData, "low");

      // 收斂品質評分
      const convergenceRatio = Math.abs(highTrend) / Math.abs(lowTrend);
      if (convergenceRatio > 2) confidence += 0.15; // 高度收斂
      else if (convergenceRatio > 1.5) confidence += 0.1;

      // 成交量遞減評分
      if (patternUtils.hasVolumeDecrease(recentData)) {
        confidence += 0.1;
      }

      // 突破力度評分
      const resistanceTrendValue =
        recentData[0].high + highTrend * (recentData.length - 1);
      const breakoutStrength =
        (data.close - resistanceTrendValue) / resistanceTrendValue;
      if (breakoutStrength > 0.02) confidence += 0.1;

      // 位置評分 - 在低位更有意義
      if (TrendAnalyzer.isInExtremeZone(data, candlestickData, config, "low")) {
        confidence += 0.1;
      }

      // 成交量擴張評分
      if (isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },
];

export default patternsPart3;
