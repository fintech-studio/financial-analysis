// patterns_part2.ts
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
} from "./patterns_common";

const patternsPart2: Pattern[] = [
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      if (!prevData || !prev2Data) return false;
      // 嚴格判斷：第一根大陰線，第二根小實體，第三根大陽線且收盤穿越第一根中點
      const firstIsRed = isRed(prev2Data) && isBig(prev2Data);
      const secondIsSmall = isSmall(prevData);
      const thirdIsGreen =
        isGreen(data) && getBodySize(data) > getBodySize(prev2Data) * 0.5;
      const penetration = data.close > (prev2Data.open + prev2Data.close) / 2;
      // 需有明顯下跌趨勢
      let isDownTrend = true;
      if (candlestickData && candlestickData.length >= 6) {
        const pre = candlestickData.slice(-6, -3);
        isDownTrend =
          pre.length > 2 && pre[0].close > pre[pre.length - 1].close * 1.02;
      }
      // 出現在低檔
      let isLowZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const minLow = Math.min(
          ...candlestickData.slice(-10).map((d) => d.low)
        );
        isLowZone = data.low < minLow * 1.03;
      }
      return (
        firstIsRed &&
        secondIsSmall &&
        thirdIsGreen &&
        penetration &&
        isDownTrend &&
        isLowZone
      );
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      if (!prevData || !prev2Data) return false;
      // 嚴格判斷：第一根大陽線，第二根小實體，第三根大陰線且收盤穿越第一根中點
      const firstIsGreen = isGreen(prev2Data) && isBig(prev2Data);
      const secondIsSmall = isSmall(prevData);
      const thirdIsRed =
        isRed(data) && getBodySize(data) > getBodySize(prev2Data) * 0.5;
      const penetration = data.close < (prev2Data.open + prev2Data.close) / 2;
      // 需有明顯上漲趨勢
      let isUpTrend = true;
      if (candlestickData && candlestickData.length >= 6) {
        const pre = candlestickData.slice(-6, -3);
        isUpTrend =
          pre.length > 2 && pre[0].close < pre[pre.length - 1].close * 0.98;
      }
      // 出現在高檔
      let isHighZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const maxHigh = Math.max(
          ...candlestickData.slice(-10).map((d) => d.high)
        );
        isHighZone = data.high > maxHigh * 0.97;
      }
      return (
        firstIsGreen &&
        secondIsSmall &&
        thirdIsRed &&
        penetration &&
        isUpTrend &&
        isHighZone
      );
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      if (!prevData || !prev2Data) return false;
      // 嚴格判斷：三根連續陽線，實體不能太小，且逐步上漲
      const allGreen = isGreen(prev2Data) && isGreen(prevData) && isGreen(data);
      const ascending =
        prev2Data.close < prevData.close && prevData.close < data.close;
      const reasonableSize =
        !isSmall(prev2Data) && !isSmall(prevData) && !isSmall(data);
      // 需有明顯下跌趨勢
      let isDownTrend = true;
      if (candlestickData && candlestickData.length >= 6) {
        const pre = candlestickData.slice(-6, -3);
        isDownTrend =
          pre.length > 2 && pre[0].close > pre[pre.length - 1].close * 1.02;
      }
      // 出現在低檔
      let isLowZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const minLow = Math.min(
          ...candlestickData.slice(-10).map((d) => d.low)
        );
        isLowZone = data.low < minLow * 1.03;
      }
      return (
        allGreen && ascending && reasonableSize && isDownTrend && isLowZone
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      if (!prevData || !prev2Data) return false;
      // 嚴格判斷：三根連續陰線，實體不能太小，且逐步下跌
      const allRed = isRed(prev2Data) && isRed(prevData) && isRed(data);
      const descending =
        prev2Data.close > prevData.close && prevData.close > data.close;
      const reasonableSize =
        !isSmall(prev2Data) && !isSmall(prevData) && !isSmall(data);
      // 需有明顯上漲趨勢
      let isUpTrend = true;
      if (candlestickData && candlestickData.length >= 6) {
        const pre = candlestickData.slice(-6, -3);
        isUpTrend =
          pre.length > 2 && pre[0].close < pre[pre.length - 1].close * 0.98;
      }
      // 出現在高檔
      let isHighZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const maxHigh = Math.max(
          ...candlestickData.slice(-10).map((d) => d.high)
        );
        isHighZone = data.high > maxHigh * 0.97;
      }
      return allRed && descending && reasonableSize && isUpTrend && isHighZone;
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      if (!prevData || !prev2Data) return false;
      // 嚴格判斷：第一根大陽線，第二根小陰線，第三根大陽線且突破新高
      const firstBigGreen = isGreen(prev2Data) && isBig(prev2Data);
      const secondSmallRed = isRed(prevData) && isSmall(prevData);
      const thirdBigGreen =
        isGreen(data) && getBodySize(data) > getBodySize(prev2Data) * 0.7;
      const consolidation =
        prevData.high < prev2Data.high && prevData.low > prev2Data.low;
      const breakout = data.close > prev2Data.high;
      // 需有明顯上漲趨勢
      let isUpTrend = true;
      if (candlestickData && candlestickData.length >= 6) {
        const pre = candlestickData.slice(-6, -3);
        isUpTrend =
          pre.length > 2 && pre[0].close < pre[pre.length - 1].close * 0.98;
      }
      return (
        firstBigGreen &&
        secondSmallRed &&
        thirdBigGreen &&
        consolidation &&
        breakout &&
        isUpTrend
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      if (!prevData || !prev2Data) return false;
      // 嚴格判斷：第一根大陰線，第二根小陽線，第三根大陰線且跌破新低
      const firstBigRed = isRed(prev2Data) && isBig(prev2Data);
      const secondSmallGreen = isGreen(prevData) && isSmall(prevData);
      const thirdBigRed =
        isRed(data) && getBodySize(data) > getBodySize(prev2Data) * 0.7;
      const consolidation =
        prevData.high < prev2Data.high && prevData.low > prev2Data.low;
      const breakdown = data.close < prev2Data.low;
      // 需有明顯下跌趨勢
      let isDownTrend = true;
      if (candlestickData && candlestickData.length >= 6) {
        const pre = candlestickData.slice(-6, -3);
        isDownTrend =
          pre.length > 2 && pre[0].close > pre[pre.length - 1].close * 1.02;
      }
      return (
        firstBigRed &&
        secondSmallGreen &&
        thirdBigRed &&
        consolidation &&
        breakdown &&
        isDownTrend
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      if (!prevData) return false;
      const firstRed = isRed(prevData) && !isSmall(prevData);
      const secondGreen = isGreen(data) && !isSmall(data);
      const gapDown = data.open < prevData.low;
      const penetration =
        data.close > (prevData.open + prevData.close) / 2 &&
        data.close < prevData.open;
      // 需有明顯下跌趨勢
      let isDownTrend = true;
      if (candlestickData && candlestickData.length >= 6) {
        const pre = candlestickData.slice(-6, -2);
        isDownTrend =
          pre.length > 2 && pre[0].close > pre[pre.length - 1].close * 1.02;
      }
      // 出現在低檔
      let isLowZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const minLow = Math.min(
          ...candlestickData.slice(-10).map((d) => d.low)
        );
        isLowZone = data.low < minLow * 1.03;
      }
      return (
        firstRed &&
        secondGreen &&
        gapDown &&
        penetration &&
        isDownTrend &&
        isLowZone
      );
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      if (!prevData) return false;
      const firstGreen = isGreen(prevData) && !isSmall(prevData);
      const secondRed = isRed(data) && !isSmall(data);
      const gapUp = data.open > prevData.high;
      const penetration =
        data.close < (prevData.open + prevData.close) / 2 &&
        data.close > prevData.open;
      // 需有明顯上漲趨勢
      let isUpTrend = true;
      if (candlestickData && candlestickData.length >= 6) {
        const pre = candlestickData.slice(-6, -2);
        isUpTrend =
          pre.length > 2 && pre[0].close < pre[pre.length - 1].close * 0.98;
      }
      // 出現在高檔
      let isHighZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const maxHigh = Math.max(
          ...candlestickData.slice(-10).map((d) => d.high)
        );
        isHighZone = data.high > maxHigh * 0.97;
      }
      return (
        firstGreen &&
        secondRed &&
        gapUp &&
        penetration &&
        isUpTrend &&
        isHighZone
      );
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      if (!prevData) return false;
      const firstBig = isBig(prevData);
      const secondSmall = isSmall(data);
      const contained =
        data.open > Math.min(prevData.open, prevData.close) &&
        data.close < Math.max(prevData.open, prevData.close);
      const oppositeColor =
        (isRed(prevData) && isGreen(data)) ||
        (isGreen(prevData) && isRed(data));
      // 實體大小差異需明顯
      const bodyRatio = getBodySize(data) / getBodySize(prevData);
      const isBodyDiff = bodyRatio < 0.5;
      // 趨勢背景
      let isTrend = true;
      if (candlestickData && candlestickData.length >= 6) {
        const pre = candlestickData.slice(-6, -2);
        isTrend =
          pre.length > 2 &&
          (pre[0].close > pre[pre.length - 1].close * 1.02 ||
            pre[0].close < pre[pre.length - 1].close * 0.98);
      }
      return (
        firstBig &&
        secondSmall &&
        contained &&
        oppositeColor &&
        isBodyDiff &&
        isTrend
      );
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
    check: (
      data: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      if (!prevData) return false;
      const firstBig = isBig(prevData);
      const secondDoji = getBodySize(data) < getTotalRange(data) * 0.08;
      const contained =
        data.high < Math.max(prevData.open, prevData.close) &&
        data.low > Math.min(prevData.open, prevData.close);
      // 趨勢背景
      let isTrend = true;
      if (candlestickData && candlestickData.length >= 6) {
        const pre = candlestickData.slice(-6, -2);
        isTrend =
          pre.length > 2 &&
          (pre[0].close > pre[pre.length - 1].close * 1.02 ||
            pre[0].close < pre[pre.length - 1].close * 0.98);
      }
      return firstBig && secondDoji && contained && isTrend;
    },
  },
];

export default patternsPart2;
