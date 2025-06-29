// patterns_part3.ts
import {
  KLineData,
  Pattern,
  PatternType,
  SignalStrength,
  getBodySize,
  getUpperShadow,
  getLowerShadow,
  getTotalRange,
  isRed,
  isGreen,
  isBig,
  isSmall,
  patternUtils,
} from "./patterns_common";

const patternsPart3: Pattern[] = [
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
      const body = getBodySize(data);
      const range = getTotalRange(data);
      const longBody = body > range * 0.72;
      // 允許極短影線（小於全幅2%）
      const lowerShadow = getLowerShadow(data);
      const upperShadow = getUpperShadow(data);
      const bullishBelt =
        isGreen(data) &&
        Math.abs(data.open - data.low) < range * 0.01 &&
        lowerShadow < range * 0.02;
      const bearishBelt =
        isRed(data) &&
        Math.abs(data.open - data.high) < range * 0.01 &&
        upperShadow < range * 0.02;
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
      const highTolerance = 0.01; // 1% 允許誤差
      const similarHighs =
        Math.abs(data.high - prevData.high) / prevData.high < highTolerance;
      const bodyRatio = getBodySize(data) / (getBodySize(prevData) + 1e-6);
      const bodySimilar = bodyRatio > 0.5 && bodyRatio < 2;
      const firstGreen = isGreen(prevData);
      // 第二根可為陰線或帶長上影線的小K
      const secondBearish =
        isRed(data) || getUpperShadow(data) > getBodySize(data) * 1.2;
      return similarHighs && firstGreen && secondBearish && bodySimilar;
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
      const lowTolerance = 0.01; // 1% 允許誤差
      const similarLows =
        Math.abs(data.low - prevData.low) / prevData.low < lowTolerance;
      const bodyRatio = getBodySize(data) / (getBodySize(prevData) + 1e-6);
      const bodySimilar = bodyRatio > 0.5 && bodyRatio < 2;
      const firstRed = isRed(prevData);
      // 第二根可為陽線或帶長下影線的小K
      const secondBullish =
        isGreen(data) || getLowerShadow(data) > getBodySize(data) * 1.2;
      return similarLows && firstRed && secondBullish && bodySimilar;
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
        historicalData.length < 10
      )
        return false;
      // 取最近10根K線進行分析
      const recentData = historicalData.slice(-10);
      // 旗桿：前3根K線，要求漲幅大、連續陽線
      const flagpole = recentData.slice(0, 3);
      const flagpoleRise = flagpole[2].close / flagpole[0].close - 1;
      const flagpoleAllGreen = flagpole.every((d) => isGreen(d));
      if (!(flagpoleRise > 0.045 && flagpoleAllGreen)) return false;
      // 旗面：中間4~6根K線，波動幅度小、斜率微負
      const flagArea = recentData.slice(3, 8);
      const highTrend = patternUtils.calculateTrend(flagArea, "high");
      const lowTrend = patternUtils.calculateTrend(flagArea, "low");
      const consolidating = patternUtils.isConsolidating(flagArea, 0.09);
      const flagSlope = (highTrend + lowTrend) / 2;
      if (!(flagSlope < 0 && consolidating)) return false;
      // 旗面期間波動率不能大於旗桿一半
      const flagpoleRange =
        Math.max(...flagpole.map((d) => d.high)) -
        Math.min(...flagpole.map((d) => d.low));
      const flagRange =
        Math.max(...flagArea.map((d) => d.high)) -
        Math.min(...flagArea.map((d) => d.low));
      if (flagRange > flagpoleRange * 0.7) return false;
      // 成交量遞減
      if (!patternUtils.hasVolumeDecrease(flagArea)) return false;
      // 突破旗面
      const breakout = data.close > Math.max(...flagArea.map((d) => d.high));
      return breakout;
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
        historicalData.length < 10
      )
        return false;
      const recentData = historicalData.slice(-10);
      // 旗桿：前3根K線，要求跌幅大、連續陰線
      const flagpole = recentData.slice(0, 3);
      const flagpoleDrop = 1 - flagpole[2].close / flagpole[0].close;
      const flagpoleAllRed = flagpole.every((d) => isRed(d));
      if (!(flagpoleDrop > 0.045 && flagpoleAllRed)) return false;
      // 旗面：中間4~6根K線，波動幅度小、斜率微正
      const flagArea = recentData.slice(3, 8);
      const highTrend = patternUtils.calculateTrend(flagArea, "high");
      const lowTrend = patternUtils.calculateTrend(flagArea, "low");
      const consolidating = patternUtils.isConsolidating(flagArea, 0.09);
      const flagSlope = (highTrend + lowTrend) / 2;
      if (!(flagSlope > 0 && consolidating)) return false;
      // 旗面期間波動率不能大於旗桿一半
      const flagpoleRange =
        Math.max(...flagpole.map((d) => d.high)) -
        Math.min(...flagpole.map((d) => d.low));
      const flagRange =
        Math.max(...flagArea.map((d) => d.high)) -
        Math.min(...flagArea.map((d) => d.low));
      if (flagRange > flagpoleRange * 0.7) return false;
      // 成交量遞減
      if (!patternUtils.hasVolumeDecrease(flagArea)) return false;
      // 跌破旗面
      const breakdown = data.close < Math.min(...flagArea.map((d) => d.low));
      return breakdown;
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
        historicalData.length < 8
      )
        return false;
      const recentData = historicalData.slice(-8);
      // 高點水平，低點明顯上升
      const highs = recentData.map((d) => d.high);
      const lows = recentData.map((d) => d.low);
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const lowTrend = patternUtils.calculateTrend(recentData, "low");
      const horizontalHighs = Math.abs(highTrend) < Math.max(...highs) * 0.0015;
      const risingLows = lowTrend > Math.max(...lows) * 0.0015;
      // 收斂
      const firstRange = highs[0] - lows[0];
      const lastRange = highs[highs.length - 1] - lows[lows.length - 1];
      const converging = lastRange < firstRange * 0.7;
      // 突破
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
        historicalData.length < 8
      )
        return false;
      const recentData = historicalData.slice(-8);
      const highs = recentData.map((d) => d.high);
      const lows = recentData.map((d) => d.low);
      const lowTrend = patternUtils.calculateTrend(recentData, "low");
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const horizontalLows = Math.abs(lowTrend) < Math.max(...lows) * 0.0015;
      const fallingHighs = highTrend < -Math.max(...highs) * 0.0015;
      const firstRange = highs[0] - lows[0];
      const lastRange = highs[highs.length - 1] - lows[lows.length - 1];
      const converging = lastRange < firstRange * 0.7;
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
        historicalData.length < 10
      )
        return false;
      const recentData = historicalData.slice(-10);
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const lowTrend = patternUtils.calculateTrend(recentData, "low");
      const bothRising = highTrend > 0 && lowTrend > 0;
      // 收斂：低點上升速度明顯大於高點
      const converging = lowTrend > highTrend * 1.2;
      // 成交量遞減
      if (!patternUtils.hasVolumeDecrease(recentData)) return false;
      // 跌破低點趨勢線
      const supportTrendValue =
        recentData[0].low + lowTrend * (recentData.length - 1);
      const breakdown = data.close < supportTrendValue * 0.985;
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
        historicalData.length < 10
      )
        return false;
      const recentData = historicalData.slice(-10);
      const highTrend = patternUtils.calculateTrend(recentData, "high");
      const lowTrend = patternUtils.calculateTrend(recentData, "low");
      const bothFalling = highTrend < 0 && lowTrend < 0;
      // 收斂：高點下降速度明顯大於低點
      const converging = Math.abs(highTrend) > Math.abs(lowTrend) * 1.2;
      // 成交量遞減
      if (!patternUtils.hasVolumeDecrease(recentData)) return false;
      // 突破高點趨勢線
      const resistanceTrendValue =
        recentData[0].high + highTrend * (recentData.length - 1);
      const breakout = data.close > resistanceTrendValue * 1.015;
      return bothFalling && converging && breakout;
    },
  },
];

export default patternsPart3;
