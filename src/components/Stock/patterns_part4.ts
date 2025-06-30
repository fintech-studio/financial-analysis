// patterns_part4.ts - 優化版本
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

const patternsPart4: Pattern[] = [
  // 30. W底 (Double Bottom) - 優化版本
  {
    name: "W底（雙重底）",
    enName: "Double Bottom",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "兩個相近的低點形成W形，強烈看漲反轉信號",
    detail:
      "W底是經典的看漲反轉型態。兩個低點價位相近，中間有一個反彈高點。第二個低點通常成交量較小，突破中間高點時成交量放大，確認反轉成功。目標價位通常是型態高度加上突破點。",
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
      if (!candlestickData || candlestickData.length < 20) return false;

      // 需要在下降趨勢後出現
      if (context && context.trend === TrendDirection.UPTREND) {
        return false;
      }

      // 尋找局部低點
      const minima = patternUtils.findLocalMinima(candlestickData, 2);
      if (minima.length < 2) return false;

      // 檢查是否為雙重底
      const isDouble = patternUtils.isDoublePattern(minima, 0.025);
      if (!isDouble) return false;

      const [firstBottom, secondBottom] = minima.slice(-2);

      // 型態間距檢查
      const timeDiff = secondBottom.index - firstBottom.index;
      if (timeDiff < 5 || timeDiff > 30) return false;

      // 找到兩個底部之間的高點
      const middleSection = candlestickData.slice(
        firstBottom.index,
        secondBottom.index + 1
      );
      const middleHigh = Math.max(...middleSection.map((d) => d.high));

      // 檢查突破中間高點
      const breakout = data.close > middleHigh * 1.005;
      if (!breakout) return false;

      // 確保型態完整性
      const patternHeight =
        middleHigh - Math.min(firstBottom.value, secondBottom.value);
      const significantPattern = patternHeight > firstBottom.value * 0.045; // 至少4.5%的型態高度
      if (!significantPattern) return false;

      // 型態前須有明顯下跌趨勢
      const prePattern = candlestickData.slice(
        Math.max(0, firstBottom.index - 8),
        firstBottom.index
      );
      const preTrend =
        prePattern.length > 3 &&
        prePattern[0].close > prePattern[prePattern.length - 1].close * 1.03;

      return preTrend;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!candlestickData || candlestickData.length < 20) return 0;

      let confidence = 0.7; // 基準信心度

      const minima = patternUtils.findLocalMinima(candlestickData, 2);
      if (minima.length < 2) return 0;

      const [firstBottom, secondBottom] = minima.slice(-2);
      const middleSection = candlestickData.slice(
        firstBottom.index,
        secondBottom.index + 1
      );
      const middleHigh = Math.max(...middleSection.map((d) => d.high));

      // 雙底相似度評分
      const bottomDiff =
        Math.abs(firstBottom.value - secondBottom.value) /
        Math.min(firstBottom.value, secondBottom.value);
      if (bottomDiff < 0.01) confidence += 0.15; // 非常相近
      else if (bottomDiff < 0.02) confidence += 0.1;

      // 型態高度評分
      const patternHeight =
        middleHigh - Math.min(firstBottom.value, secondBottom.value);
      const heightRatio = patternHeight / firstBottom.value;
      if (heightRatio > 0.08) confidence += 0.1; // 型態高度顯著

      // 突破力度評分
      const breakoutStrength = (data.close - middleHigh) / middleHigh;
      if (breakoutStrength > 0.02) confidence += 0.1;

      // 成交量配合評分
      const firstBottomData = candlestickData[firstBottom.index];
      const secondBottomData = candlestickData[secondBottom.index];
      if (firstBottomData.volume && secondBottomData.volume) {
        if (secondBottomData.volume < firstBottomData.volume * 0.8) {
          confidence += 0.1; // 第二底成交量減少
        }
      }

      // 突破成交量評分
      if (isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },
  // 31. M頭 (Double Top) - 優化版本
  {
    name: "M頭（雙重頂）",
    enName: "Double Top",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: false,
    description: "兩個相近的高點形成M形，強烈看跌反轉信號",
    detail:
      "M頭是經典的看跌反轉型態。兩個高點價位相近，中間有一個回檔低點。第二個高點通常成交量較小，跌破中間低點時確認反轉。目標價位通常是型態高度從跌破點向下測量。",
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
      if (!candlestickData || candlestickData.length < 20) return false;

      // 需要在上升趨勢後出現
      if (context && context.trend === TrendDirection.DOWNTREND) {
        return false;
      }

      // 尋找局部高點
      const maxima = patternUtils.findLocalMaxima(candlestickData, 2);
      if (maxima.length < 2) return false;

      // 檢查是否為雙重頂
      const isDouble = patternUtils.isDoublePattern(maxima, 0.025);
      if (!isDouble) return false;

      const [firstTop, secondTop] = maxima.slice(-2);

      // 型態間距檢查
      const timeDiff = secondTop.index - firstTop.index;
      if (timeDiff < 5 || timeDiff > 30) return false;

      // 找到兩個頂部之間的低點
      const middleSection = candlestickData.slice(
        firstTop.index,
        secondTop.index + 1
      );
      const middleLow = Math.min(...middleSection.map((d) => d.low));

      // 檢查跌破中間低點
      const breakdown = data.close < middleLow * 0.995;
      if (!breakdown) return false;

      // 確保型態完整性
      const patternHeight =
        Math.max(firstTop.value, secondTop.value) - middleLow;
      const significantPattern = patternHeight > middleLow * 0.045; // 至少4.5%的型態高度
      if (!significantPattern) return false;

      // 型態前須有明顯上漲趨勢
      const prePattern = candlestickData.slice(
        Math.max(0, firstTop.index - 8),
        firstTop.index
      );
      const preTrend =
        prePattern.length > 3 &&
        prePattern[0].close < prePattern[prePattern.length - 1].close * 0.97;

      return preTrend;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!candlestickData || candlestickData.length < 20) return 0;

      let confidence = 0.7; // 基準信心度

      const maxima = patternUtils.findLocalMaxima(candlestickData, 2);
      if (maxima.length < 2) return 0;

      const [firstTop, secondTop] = maxima.slice(-2);
      const middleSection = candlestickData.slice(
        firstTop.index,
        secondTop.index + 1
      );
      const middleLow = Math.min(...middleSection.map((d) => d.low));

      // 雙頂相似度評分
      const topDiff =
        Math.abs(firstTop.value - secondTop.value) /
        Math.max(firstTop.value, secondTop.value);
      if (topDiff < 0.01) confidence += 0.15; // 非常相近
      else if (topDiff < 0.02) confidence += 0.1;

      // 型態高度評分
      const patternHeight =
        Math.max(firstTop.value, secondTop.value) - middleLow;
      const heightRatio = patternHeight / middleLow;
      if (heightRatio > 0.08) confidence += 0.1; // 型態高度顯著

      // 跌破力度評分
      const breakdownStrength = (middleLow - data.close) / middleLow;
      if (breakdownStrength > 0.02) confidence += 0.1;

      // 成交量配合評分
      const firstTopData = candlestickData[firstTop.index];
      const secondTopData = candlestickData[secondTop.index];
      if (firstTopData.volume && secondTopData.volume) {
        if (secondTopData.volume < firstTopData.volume * 0.8) {
          confidence += 0.1; // 第二頂成交量減少
        }
      }

      // 跌破成交量評分
      if (isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },

  // 32. 頭肩頂 (Head and Shoulders Top) - 優化版本
  {
    name: "頭肩頂",
    enName: "Head and Shoulders Top",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: false,
    description: "左肩、頭部、右肩形成的看跌反轉型態",
    detail:
      "頭肩頂是最可靠的看跌反轉型態之一。由三個高點組成：中間的頭部最高，兩側的肩膀高度相近且較低。頸線連接兩個肩膀間的低點，跌破頸線確認反轉。目標價位為頭部到頸線的距離從跌破點向下測量。",
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
      if (!candlestickData || candlestickData.length < 30) return false;

      // 需要在上升趨勢後出現
      if (context && context.trend === TrendDirection.DOWNTREND) {
        return false;
      }

      // 尋找局部高點
      const maxima = patternUtils.findLocalMaxima(candlestickData, 2);
      if (maxima.length < 3) return false;

      // 檢查是否為頭肩頂型態
      const isHeadShoulders = patternUtils.isHeadAndShoulders(maxima);
      if (!isHeadShoulders) return false;

      const [leftShoulder, head, rightShoulder] = maxima.slice(-3);

      // 型態間距檢查
      if (
        head.index - leftShoulder.index < 4 ||
        rightShoulder.index - head.index < 4 ||
        rightShoulder.index - leftShoulder.index > 30
      ) {
        return false;
      }

      // 計算頸線位置（兩個肩膀間的低點）
      const leftSection = candlestickData.slice(leftShoulder.index, head.index);
      const rightSection = candlestickData.slice(
        head.index,
        rightShoulder.index + 5
      );
      const leftTrough = Math.min(...leftSection.map((d) => d.low));
      const rightTrough = Math.min(...rightSection.map((d) => d.low));
      const neckline = Math.max(leftTrough, rightTrough); // 較保守的頸線位置

      // 檢查跌破頸線
      const breakdown = data.close < neckline * 0.995;
      if (!breakdown) return false;

      // 確保型態完整性
      const patternHeight = head.value - neckline;
      const significantPattern = patternHeight > neckline * 0.07; // 至少7%的型態高度
      if (!significantPattern) return false;

      // 型態前須有明顯上漲趨勢
      const prePattern = candlestickData.slice(
        Math.max(0, leftShoulder.index - 8),
        leftShoulder.index
      );
      const preTrend =
        prePattern.length > 3 &&
        prePattern[0].close < prePattern[prePattern.length - 1].close * 0.97;

      return preTrend;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!candlestickData || candlestickData.length < 30) return 0;

      let confidence = 0.8; // 高基準信心度，因為是非常可靠的型態

      const maxima = patternUtils.findLocalMaxima(candlestickData, 2);
      if (maxima.length < 3) return 0;

      const [leftShoulder, head, rightShoulder] = maxima.slice(-3);
      const leftSection = candlestickData.slice(leftShoulder.index, head.index);
      const rightSection = candlestickData.slice(
        head.index,
        rightShoulder.index + 5
      );
      const leftTrough = Math.min(...leftSection.map((d) => d.low));
      const rightTrough = Math.min(...rightSection.map((d) => d.low));
      const neckline = Math.max(leftTrough, rightTrough);

      // 肩膀對稱性評分
      const shoulderDiff =
        Math.abs(leftShoulder.value - rightShoulder.value) /
        Math.max(leftShoulder.value, rightShoulder.value);
      if (shoulderDiff < 0.02) confidence += 0.1; // 肩膀高度相近

      // 頭部突出性評分
      const headProminence = Math.min(
        (head.value - leftShoulder.value) / leftShoulder.value,
        (head.value - rightShoulder.value) / rightShoulder.value
      );
      if (headProminence > 0.05) confidence += 0.1; // 頭部明顯高於肩膀

      // 頸線對稱性評分
      const necklineDiff =
        Math.abs(leftTrough - rightTrough) / Math.max(leftTrough, rightTrough);
      if (necklineDiff < 0.03) confidence += 0.05; // 頸線水平

      // 跌破力度評分
      const breakdownStrength = (neckline - data.close) / neckline;
      if (breakdownStrength > 0.02) confidence += 0.1;

      // 成交量配合評分
      const headData = candlestickData[head.index];
      const rightShoulderData = candlestickData[rightShoulder.index];
      if (headData.volume && rightShoulderData.volume) {
        if (rightShoulderData.volume < headData.volume * 0.8) {
          confidence += 0.1; // 右肩成交量減少
        }
      }

      return Math.min(confidence, 1);
    },
  },

  // 33. 頭肩底 (Head and Shoulders Bottom) - 優化版本
  {
    name: "頭肩底",
    enName: "Head and Shoulders Bottom",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "倒置的頭肩型態，強烈看漲反轉信號",
    detail:
      "頭肩底是頭肩頂的倒置版本，是強烈的看漲反轉型態。由三個低點組成：中間的頭部最低，兩側的肩膀高度相近且較高。頸線連接兩個肩膀間的高點，突破頸線確認反轉。目標價位為頭部到頸線的距離從突破點向上測量。",
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
      if (!candlestickData || candlestickData.length < 30) return false;

      // 需要在下降趨勢後出現
      if (context && context.trend === TrendDirection.UPTREND) {
        return false;
      }

      // 尋找局部低點
      const minima = patternUtils.findLocalMinima(candlestickData, 2);
      if (minima.length < 3) return false;

      // 檢查是否為倒置頭肩型態
      const isInverseHeadShoulders =
        patternUtils.isInverseHeadAndShoulders(minima);
      if (!isInverseHeadShoulders) return false;

      const [leftShoulder, head, rightShoulder] = minima.slice(-3);

      // 型態間距檢查
      if (
        head.index - leftShoulder.index < 4 ||
        rightShoulder.index - head.index < 4 ||
        rightShoulder.index - leftShoulder.index > 30
      ) {
        return false;
      }

      // 計算頸線位置（兩個肩膀間的高點）
      const leftSection = candlestickData.slice(leftShoulder.index, head.index);
      const rightSection = candlestickData.slice(
        head.index,
        rightShoulder.index + 5
      );
      const leftPeak = Math.max(...leftSection.map((d) => d.high));
      const rightPeak = Math.max(...rightSection.map((d) => d.high));
      const neckline = Math.min(leftPeak, rightPeak); // 較保守的頸線位置

      // 檢查突破頸線
      const breakout = data.close > neckline * 1.005;
      if (!breakout) return false;

      // 確保型態完整性
      const patternHeight = neckline - head.value;
      const significantPattern = patternHeight > head.value * 0.07; // 至少7%的型態高度
      if (!significantPattern) return false;

      // 型態前須有明顯下跌趨勢
      const prePattern = candlestickData.slice(
        Math.max(0, leftShoulder.index - 8),
        leftShoulder.index
      );
      const preTrend =
        prePattern.length > 3 &&
        prePattern[0].close > prePattern[prePattern.length - 1].close * 1.03;

      return preTrend;
    },
    confidence: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG
    ) => {
      if (!candlestickData || candlestickData.length < 30) return 0;

      let confidence = 0.8; // 高基準信心度，因為是非常可靠的型態

      const minima = patternUtils.findLocalMinima(candlestickData, 2);
      if (minima.length < 3) return 0;

      const [leftShoulder, head, rightShoulder] = minima.slice(-3);
      const leftSection = candlestickData.slice(leftShoulder.index, head.index);
      const rightSection = candlestickData.slice(
        head.index,
        rightShoulder.index + 5
      );
      const leftPeak = Math.max(...leftSection.map((d) => d.high));
      const rightPeak = Math.max(...rightSection.map((d) => d.high));
      const neckline = Math.min(leftPeak, rightPeak);

      // 肩膀對稱性評分
      const shoulderDiff =
        Math.abs(leftShoulder.value - rightShoulder.value) /
        Math.min(leftShoulder.value, rightShoulder.value);
      if (shoulderDiff < 0.02) confidence += 0.1; // 肩膀高度相近

      // 頭部突出性評分
      const headProminence = Math.min(
        (leftShoulder.value - head.value) / head.value,
        (rightShoulder.value - head.value) / head.value
      );
      if (headProminence > 0.05) confidence += 0.1; // 頭部明顯低於肩膀

      // 頸線對稱性評分
      const necklineDiff =
        Math.abs(leftPeak - rightPeak) / Math.min(leftPeak, rightPeak);
      if (necklineDiff < 0.03) confidence += 0.05; // 頸線水平

      // 突破力度評分
      const breakoutStrength = (data.close - neckline) / neckline;
      if (breakoutStrength > 0.02) confidence += 0.1;

      // 成交量配合評分
      const headData = candlestickData[head.index];
      const rightShoulderData = candlestickData[rightShoulder.index];
      if (headData.volume && rightShoulderData.volume) {
        if (rightShoulderData.volume < headData.volume * 0.8) {
          confidence += 0.05; // 右肩成交量減少
        }
      }

      // 突破成交量評分
      if (isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.1;
      }

      return Math.min(confidence, 1);
    },
  },

  // 34. 墓碑線 (Gravestone Doji) - 優化版本
  {
    name: "墓碑線",
    enName: "Gravestone Doji",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: false,
    description: "長上影線無下影線，強烈看跌訊號",
    detail: "墓碑線出現在高位時，代表多頭攻擊失敗，是強烈的反轉訊號。",
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
      const body = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);

      // 嚴格判斷：實體極小，上影線極長，下影線極短
      const isDoji = body < totalRange * 0.08;
      const isLongUpper = upperShadow > totalRange * 0.75;
      const isShortLower = lowerShadow < totalRange * 0.07;

      if (!isDoji || !isLongUpper || !isShortLower) return false;

      // 趨勢環境檢查 - 應該在上升趨勢中出現
      if (
        context &&
        context.trend !== TrendDirection.UPTREND &&
        context.trend !== TrendDirection.UNKNOWN
      ) {
        return false;
      }

      // 位置檢查 - 需出現在近期高檔
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
      let confidence = 0.7; // 基準信心度

      const body = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);

      // 十字星品質評分
      const dojiQuality = 1 - body / totalRange;
      confidence += dojiQuality * 0.15;

      // 上影線長度評分
      const upperShadowRatio = upperShadow / totalRange;
      if (upperShadowRatio > 0.85) confidence += 0.15;
      else if (upperShadowRatio > 0.8) confidence += 0.1;

      // 下影線短度評分
      const lowerShadowRatio = lowerShadow / totalRange;
      if (lowerShadowRatio < 0.03) confidence += 0.1;

      // 趨勢確認評分
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

      return Math.min(confidence, 1);
    },
  },

  // 35. 蜻蜓線 (Dragonfly Doji) - 優化版本
  {
    name: "蜻蜓線",
    enName: "Dragonfly Doji",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "長下影線無上影線，強烈看漲訊號",
    detail:
      "蜻蜓線是十字星的一種，具有長下影線而無上影線。出現在低位時，代表股價曾經大幅下跌但最終回升，顯示空頭攻擊失敗，是強烈的看漲反轉訊號。下影線越長，反轉力道越強。",
    riskLevel: "low",
    marketConditions: ["trending", "ranging"],
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[],
      config: PatternConfig = DEFAULT_PATTERN_CONFIG,
      context?: MarketContext
    ) => {
      const body = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);

      // 嚴格判斷：實體極小，下影線極長，上影線極短
      const isDoji = body < totalRange * 0.08;
      const isLongLower = lowerShadow > totalRange * 0.7;
      const isShortUpper = upperShadow < totalRange * 0.08;

      if (!isDoji || !isLongLower || !isShortUpper) return false;

      // 趨勢環境檢查 - 應該在下降趨勢中或低檔區出現
      if (context && context.trend === TrendDirection.UPTREND) {
        return false;
      }

      // 位置檢查 - 需出現在近期低檔
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
      let confidence = 0.7; // 基準信心度

      const body = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);

      // 十字星品質評分
      const dojiQuality = 1 - body / totalRange;
      confidence += dojiQuality * 0.15;

      // 下影線長度評分
      const lowerShadowRatio = lowerShadow / totalRange;
      if (lowerShadowRatio > 0.85) confidence += 0.15;
      else if (lowerShadowRatio > 0.8) confidence += 0.1;

      // 上影線短度評分
      const upperShadowRatio = upperShadow / totalRange;
      if (upperShadowRatio < 0.03) confidence += 0.1;

      // 趨勢確認評分
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

      // 成交量評分
      if (candlestickData && isVolumeExpansion(data, candlestickData, config)) {
        confidence += 0.05;
      }

      return Math.min(confidence, 1);
    },
  },
  // 36. 長陽線 (Bullish Marubozu) - 優化版本
  {
    name: "長陽線",
    enName: "Bullish Marubozu",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.STRONG,
    bullish: true,
    description: "幾乎無影線的長陽線，強烈看漲訊號",
    detail:
      "長陽線（光頭光腳陽線）代表多頭力量強勁，買方從開盤到收盤完全控制市場，幾乎沒有上下影線。是強烈的看漲信號，通常延續上漲趨勢或開啟新的上漲行情。配合放量出現效果更佳。",
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
      const body = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);

      // 必須是陽線
      if (!isGreen(data)) return false;

      // 實體必須占主要部分，影線極短
      const isMarubozu =
        body > totalRange * 0.85 &&
        upperShadow < totalRange * 0.08 &&
        lowerShadow < totalRange * 0.08;

      if (!isMarubozu) return false;

      // 實體必須夠大
      if (!isBig(data, config)) return false;

      // 趨勢環境檢查 - 在上升趨勢中或盤整後突破時效果最佳
      if (context && context.trend === TrendDirection.DOWNTREND) {
        // 在下降趨勢中，需要特別強的信號才認定
        if (body < totalRange * 0.9) return false;
      }

      // 成交量檢查 - 需要放量配合
      if (candlestickData && candlestickData.length >= 5 && data.volume) {
        const recentVolumes = candlestickData
          .slice(-5)
          .map((d) => d.volume || 0);
        const avgVolume =
          recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
        if (data.volume < avgVolume * 1.2) return false; // 需要明顯放量
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
      let confidence = 0.75; // 基準信心度

      const body = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);

      // 實體完整度評分
      const bodyRatio = body / totalRange;
      if (bodyRatio > 0.95) confidence += 0.15; // 幾乎完美的長陽線
      else if (bodyRatio > 0.9) confidence += 0.1;

      // 影線短度評分
      const shadowRatio = (upperShadow + lowerShadow) / totalRange;
      if (shadowRatio < 0.05) confidence += 0.1; // 影線極短

      // 實體大小評分
      if (isBig(data, config)) {
        const priceRange = Math.abs(data.close - data.open);
        const priceChangeRatio = priceRange / data.open;
        if (priceChangeRatio > 0.05) confidence += 0.1; // 漲幅超過5%
        else if (priceChangeRatio > 0.03) confidence += 0.05;
      }

      // 趨勢一致性評分
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -1),
          5,
          config
        );
        if (trend === TrendDirection.UPTREND) confidence += 0.1;
        else if (trend === TrendDirection.UNKNOWN) confidence += 0.05; // 盤整後突破
      }

      // 成交量評分
      if (candlestickData && data.volume) {
        const recentVolumes = candlestickData
          .slice(-5)
          .map((d) => d.volume || 0);
        const avgVolume =
          recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
        const volumeRatio = data.volume / avgVolume;
        if (volumeRatio > 2) confidence += 0.15; // 爆量
        else if (volumeRatio > 1.5) confidence += 0.1; // 明顯放量
        else if (volumeRatio > 1.2) confidence += 0.05; // 溫和放量
      }

      return Math.min(confidence, 1);
    },
  },

  // 37. 長陰線 (Bearish Marubozu) - 優化版本
  {
    name: "長陰線",
    enName: "Bearish Marubozu",
    type: PatternType.CONTINUATION,
    strength: SignalStrength.STRONG,
    bullish: false,
    description: "幾乎無影線的長陰線，強烈看跌訊號",
    detail:
      "長陰線（光頭光腳陰線）代表空頭力量強勁，賣方從開盤到收盤完全控制市場，幾乎沒有上下影線。是強烈的看跌信號，通常延續下跌趨勢或開始新的下跌行情。配合放量出現殺傷力更大。",
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
      const body = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);

      // 必須是陰線
      if (!isRed(data)) return false;

      // 實體必須占主要部分，影線極短
      const isMarubozu =
        body > totalRange * 0.85 &&
        upperShadow < totalRange * 0.08 &&
        lowerShadow < totalRange * 0.08;

      if (!isMarubozu) return false;

      // 實體必須夠大
      if (!isBig(data, config)) return false;

      // 趨勢環境檢查 - 在下降趨勢中或盤整後破位時效果最佳
      if (context && context.trend === TrendDirection.UPTREND) {
        // 在上升趨勢中，需要特別強的信號才認定
        if (body < totalRange * 0.9) return false;
      }

      // 成交量檢查 - 需要放量配合
      if (candlestickData && candlestickData.length >= 5 && data.volume) {
        const recentVolumes = candlestickData
          .slice(-5)
          .map((d) => d.volume || 0);
        const avgVolume =
          recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
        if (data.volume < avgVolume * 1.2) return false; // 需要明顯放量
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
      let confidence = 0.75; // 基準信心度

      const body = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);

      // 實體完整度評分
      const bodyRatio = body / totalRange;
      if (bodyRatio > 0.95) confidence += 0.15; // 幾乎完美的長陰線
      else if (bodyRatio > 0.9) confidence += 0.1;

      // 影線短度評分
      const shadowRatio = (upperShadow + lowerShadow) / totalRange;
      if (shadowRatio < 0.05) confidence += 0.1; // 影線極短

      // 實體大小評分
      if (isBig(data, config)) {
        const priceRange = Math.abs(data.open - data.close);
        const priceChangeRatio = priceRange / data.open;
        if (priceChangeRatio > 0.05) confidence += 0.1; // 跌幅超過5%
        else if (priceChangeRatio > 0.03) confidence += 0.05;
      }

      // 趨勢一致性評分
      if (candlestickData && candlestickData.length >= 5) {
        const trend = TrendAnalyzer.analyzeTrend(
          candlestickData.slice(0, -1),
          5,
          config
        );
        if (trend === TrendDirection.DOWNTREND) confidence += 0.1;
        else if (trend === TrendDirection.UNKNOWN) confidence += 0.05; // 盤整後破位
      }

      // 成交量評分
      if (candlestickData && data.volume) {
        const recentVolumes = candlestickData
          .slice(-5)
          .map((d) => d.volume || 0);
        const avgVolume =
          recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
        const volumeRatio = data.volume / avgVolume;
        if (volumeRatio > 2) confidence += 0.15; // 爆量
        else if (volumeRatio > 1.5) confidence += 0.1; // 明顯放量
        else if (volumeRatio > 1.2) confidence += 0.05; // 溫和放量
      }

      return Math.min(confidence, 1);
    },
  },
];

export default patternsPart4;
