// patterns_part1.ts
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
  patternUtils,
} from "./patterns_common";

const patternsPart1: Pattern[] = [
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      const bodySize = getBodySize(data);
      const totalRange = getTotalRange(data);
      // 嚴格判斷：實體極小，總波動需大於最小門檻
      const isDoji = bodySize < totalRange * 0.08 && totalRange > 0;
      // 若有歷史資料，需出現在近10根K線的高檔或低檔
      let isExtremeZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const recent = candlestickData.slice(-10);
        const maxHigh = Math.max(...recent.map((d) => d.high));
        const minLow = Math.min(...recent.map((d) => d.low));
        isExtremeZone = data.high > maxHigh * 0.97 || data.low < minLow * 1.03;
      }
      return isDoji && isExtremeZone;
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      const bodySize = getBodySize(data);
      const lowerShadow = getLowerShadow(data);
      const upperShadow = getUpperShadow(data);
      const totalRange = getTotalRange(data);
      // 嚴格判斷：下影線極長，上影線極短，實體小
      const isHammer =
        lowerShadow >= bodySize * 2.5 &&
        upperShadow <= bodySize * 0.4 &&
        bodySize > totalRange * 0.12 &&
        bodySize < totalRange * 0.28;
      // 若有歷史資料，需出現在近10根K線的低檔
      let isLowZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const recent = candlestickData.slice(-10);
        const minLow = Math.min(...recent.map((d) => d.low));
        isLowZone = data.low < minLow * 1.03;
      }
      // 前段需有明顯下跌趨勢
      let isDownTrend = true;
      if (candlestickData && candlestickData.length >= 6) {
        const pre = candlestickData.slice(-6, -1);
        isDownTrend =
          pre.length > 2 && pre[0].close > pre[pre.length - 1].close * 1.02;
      }
      return isHammer && isLowZone && isDownTrend;
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      if (!prevData) return false;
      const bodySize = getBodySize(data);
      const lowerShadow = getLowerShadow(data);
      const upperShadow = getUpperShadow(data);
      const totalRange = getTotalRange(data);
      const isHangingMan =
        lowerShadow >= bodySize * 2.5 &&
        upperShadow <= bodySize * 0.4 &&
        bodySize > totalRange * 0.12 &&
        bodySize < totalRange * 0.28 &&
        prevData.close < data.close;
      // 若有歷史資料，需出現在近10根K線的高檔
      let isHighZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const recent = candlestickData.slice(-10);
        const maxHigh = Math.max(...recent.map((d) => d.high));
        isHighZone = data.high > maxHigh * 0.97;
      }
      // 前段需有明顯上漲趨勢
      let isUpTrend = true;
      if (candlestickData && candlestickData.length >= 6) {
        const pre = candlestickData.slice(-6, -1);
        isUpTrend =
          pre.length > 2 && pre[0].close < pre[pre.length - 1].close * 0.98;
      }
      return isHangingMan && isHighZone && isUpTrend;
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      const bodySize = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);
      // 嚴格判斷：上影線極長，下影線極短，實體小
      const isShootingStar =
        upperShadow >= bodySize * 2.5 &&
        lowerShadow <= bodySize * 0.4 &&
        bodySize > totalRange * 0.12 &&
        bodySize < totalRange * 0.28;
      // 若有歷史資料，需出現在近10根K線的高檔
      let isHighZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const recent = candlestickData.slice(-10);
        const maxHigh = Math.max(...recent.map((d) => d.high));
        isHighZone = data.high > maxHigh * 0.97;
      }
      // 前段需有明顯上漲趨勢
      let isUpTrend = true;
      if (candlestickData && candlestickData.length >= 6) {
        const pre = candlestickData.slice(-6, -1);
        isUpTrend =
          pre.length > 2 && pre[0].close < pre[pre.length - 1].close * 0.98;
      }
      return isShootingStar && isHighZone && isUpTrend;
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      if (!prevData) return false;
      const bodySize = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);
      // 嚴格判斷：上影線極長，下影線極短，實體小
      const isInvHammer =
        upperShadow >= bodySize * 2.5 &&
        lowerShadow <= bodySize * 0.4 &&
        bodySize > totalRange * 0.12 &&
        bodySize < totalRange * 0.28 &&
        prevData.close > data.close;
      // 若有歷史資料，需出現在近10根K線的低檔
      let isLowZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const recent = candlestickData.slice(-10);
        const minLow = Math.min(...recent.map((d) => d.low));
        isLowZone = data.low < minLow * 1.03;
      }
      // 前段需有明顯下跌趨勢
      let isDownTrend = true;
      if (candlestickData && candlestickData.length >= 6) {
        const pre = candlestickData.slice(-6, -1);
        isDownTrend =
          pre.length > 2 && pre[0].close > pre[pre.length - 1].close * 1.02;
      }
      return isInvHammer && isLowZone && isDownTrend;
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      const body = getBodySize(data);
      const totalRange = getTotalRange(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      // 嚴格判斷：實體極大，影線極短，且為陽線
      const isBigGreen =
        isGreen(data) &&
        body > totalRange * 0.7 &&
        upperShadow < totalRange * 0.15 &&
        lowerShadow < totalRange * 0.15;
      // 若有歷史資料，成交量需大於近5根均量（放量）
      let isVolumeUp = true;
      if (candlestickData && candlestickData.length >= 5 && data.volume) {
        const recent = candlestickData.slice(-5);
        const avgVol = recent.reduce((a, b) => a + (b.volume || 0), 0) / 5;
        isVolumeUp = data.volume > avgVol * 1.1;
      }
      return isBigGreen && isVolumeUp;
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      const body = getBodySize(data);
      const totalRange = getTotalRange(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      // 嚴格判斷：實體極大，影線極短，且為陰線
      const isBigRed =
        isRed(data) &&
        body > totalRange * 0.7 &&
        upperShadow < totalRange * 0.15 &&
        lowerShadow < totalRange * 0.15;
      // 若有歷史資料，成交量需大於近5根均量（放量）
      let isVolumeUp = true;
      if (candlestickData && candlestickData.length >= 5 && data.volume) {
        const recent = candlestickData.slice(-5);
        const avgVol = recent.reduce((a, b) => a + (b.volume || 0), 0) / 5;
        isVolumeUp = data.volume > avgVol * 1.1;
      }
      return isBigRed && isVolumeUp;
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      if (!prevData) return false;
      const body = getBodySize(data);
      const prevBody = getBodySize(prevData);
      // 嚴格判斷：前一根為陰線，現為陽線，現實體大於前一根，且現實體完全包覆前一根實體
      const isEngulf =
        isRed(prevData) &&
        isGreen(data) &&
        data.open < prevData.close &&
        data.close > prevData.open &&
        body > prevBody * 1.05;
      // 若有歷史資料，需出現在近10根K線的低檔
      let isLowZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const recent = candlestickData.slice(-10);
        const minLow = Math.min(...recent.map((d) => d.low));
        isLowZone = data.low < minLow * 1.03;
      }
      return isEngulf && isLowZone;
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      if (!prevData) return false;
      const body = getBodySize(data);
      const prevBody = getBodySize(prevData);
      // 嚴格判斷：前一根為陽線，現為陰線，現實體大於前一根，且現實體完全包覆前一根實體
      const isEngulf =
        isGreen(prevData) &&
        isRed(data) &&
        data.open > prevData.close &&
        data.close < prevData.open &&
        body > prevBody * 1.05;
      // 若有歷史資料，需出現在近10根K線的高檔
      let isHighZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const recent = candlestickData.slice(-10);
        const maxHigh = Math.max(...recent.map((d) => d.high));
        isHighZone = data.high > maxHigh * 0.97;
      }
      return isEngulf && isHighZone;
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      const body = getBodySize(data);
      const upperShadow = getUpperShadow(data);
      const lowerShadow = getLowerShadow(data);
      const totalRange = getTotalRange(data);
      // 嚴格判斷：實體小，上下影線都大於實體一倍，且總波動需大於最小門檻
      const isSpinning =
        body < totalRange * 0.25 &&
        upperShadow > body * 1.1 &&
        lowerShadow > body * 1.1 &&
        totalRange > 0;
      return isSpinning;
    },
  },
];

export default patternsPart1;
