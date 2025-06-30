// patterns_part4.ts
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

const patternsPart4: Pattern[] = [
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
      candlestickData?: KLineData[]
    ) => {
      if (!candlestickData || candlestickData.length < 20) return false;
      // 尋找局部低點
      const minima = patternUtils.findLocalMinima(candlestickData, 2);
      if (minima.length < 2) return false;
      // 檢查是否為雙重底
      const isDouble = patternUtils.isDoublePattern(minima, 0.025);
      if (!isDouble) return false;
      const [firstBottom, secondBottom] = minima.slice(-2);
      // 型態間距
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
      // 檢查第二個底部成交量較低（賣壓減輕）
      const firstBottomData = candlestickData[firstBottom.index];
      const secondBottomData = candlestickData[secondBottom.index];
      const volumeConfirm =
        !secondBottomData.volume ||
        !firstBottomData.volume ||
        secondBottomData.volume < firstBottomData.volume * 1.15;
      // 確保型態完整性
      const patternHeight =
        middleHigh - Math.min(firstBottom.value, secondBottom.value);
      const significantPattern = patternHeight > firstBottom.value * 0.045; // 至少4.5%的型態高度
      // 型態前須有明顯下跌趨勢
      const prePattern = candlestickData.slice(
        Math.max(0, firstBottom.index - 8),
        firstBottom.index
      );
      const preTrend =
        prePattern.length > 3 &&
        prePattern[0].close > prePattern[prePattern.length - 1].close * 1.03;
      return (
        isDouble && breakout && volumeConfirm && significantPattern && preTrend
      );
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
      candlestickData?: KLineData[]
    ) => {
      if (!candlestickData || candlestickData.length < 20) return false;
      // 尋找局部高點
      const maxima = patternUtils.findLocalMaxima(candlestickData, 2);
      if (maxima.length < 2) return false;
      // 檢查是否為雙重頂
      const isDouble = patternUtils.isDoublePattern(maxima, 0.025);
      if (!isDouble) return false;
      const [firstTop, secondTop] = maxima.slice(-2);
      // 型態間距
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
      // 檢查第二個頂部成交量較低（買盤減弱）
      const firstTopData = candlestickData[firstTop.index];
      const secondTopData = candlestickData[secondTop.index];
      const volumeConfirm =
        !secondTopData.volume ||
        !firstTopData.volume ||
        secondTopData.volume < firstTopData.volume * 1.15;
      // 確保型態完整性
      const patternHeight =
        Math.max(firstTop.value, secondTop.value) - middleLow;
      const significantPattern = patternHeight > middleLow * 0.045; // 至少4.5%的型態高度
      // 型態前須有明顯上漲趨勢
      const prePattern = candlestickData.slice(
        Math.max(0, firstTop.index - 8),
        firstTop.index
      );
      const preTrend =
        prePattern.length > 3 &&
        prePattern[0].close < prePattern[prePattern.length - 1].close * 0.97;
      return (
        isDouble && breakdown && volumeConfirm && significantPattern && preTrend
      );
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
      candlestickData?: KLineData[]
    ) => {
      if (!candlestickData || candlestickData.length < 30) return false;
      // 尋找局部高點
      const maxima = patternUtils.findLocalMaxima(candlestickData, 2);
      if (maxima.length < 3) return false;
      // 檢查是否為頭肩頂型態
      const isHeadShoulders = patternUtils.isHeadAndShoulders(maxima);
      if (!isHeadShoulders) return false;
      const [leftShoulder, head, rightShoulder] = maxima.slice(-3);
      // 型態間距
      if (
        head.index - leftShoulder.index < 4 ||
        rightShoulder.index - head.index < 4 ||
        rightShoulder.index - leftShoulder.index > 30
      )
        return false;
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
      // 檢查成交量確認（右肩成交量通常較低）
      const headData = candlestickData[head.index];
      const rightShoulderData = candlestickData[rightShoulder.index];
      const volumeConfirm =
        !rightShoulderData.volume ||
        !headData.volume ||
        rightShoulderData.volume < headData.volume * 0.95;
      // 確保型態完整性
      const patternHeight = head.value - neckline;
      const significantPattern = patternHeight > neckline * 0.07; // 至少7%的型態高度
      // 型態前須有明顯上漲趨勢
      const prePattern = candlestickData.slice(
        Math.max(0, leftShoulder.index - 8),
        leftShoulder.index
      );
      const preTrend =
        prePattern.length > 3 &&
        prePattern[0].close < prePattern[prePattern.length - 1].close * 0.97;
      return (
        isHeadShoulders &&
        breakdown &&
        volumeConfirm &&
        significantPattern &&
        preTrend
      );
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
      candlestickData?: KLineData[]
    ) => {
      if (!candlestickData || candlestickData.length < 30) return false;
      // 尋找局部低點
      const minima = patternUtils.findLocalMinima(candlestickData, 2);
      if (minima.length < 3) return false;
      // 檢查是否為倒置頭肩型態
      const isInverseHeadShoulders =
        patternUtils.isInverseHeadAndShoulders(minima);
      if (!isInverseHeadShoulders) return false;
      const [leftShoulder, head, rightShoulder] = minima.slice(-3);
      // 型態間距
      if (
        head.index - leftShoulder.index < 4 ||
        rightShoulder.index - head.index < 4 ||
        rightShoulder.index - leftShoulder.index > 30
      )
        return false;
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
      // 檢查成交量確認（右肩成交量通常較低，突破時放量）
      const headData = candlestickData[head.index];
      const rightShoulderData = candlestickData[rightShoulder.index];
      const volumeConfirm =
        !rightShoulderData.volume ||
        !headData.volume ||
        rightShoulderData.volume < headData.volume * 0.95;
      const breakoutVolume =
        (data.volume || 0) > (rightShoulderData.volume || 0) * 1.2;
      // 確保型態完整性
      const patternHeight = neckline - head.value;
      const significantPattern = patternHeight > head.value * 0.07; // 至少7%的型態高度
      // 型態前須有明顯下跌趨勢
      const prePattern = candlestickData.slice(
        Math.max(0, leftShoulder.index - 8),
        leftShoulder.index
      );
      const preTrend =
        prePattern.length > 3 &&
        prePattern[0].close > prePattern[prePattern.length - 1].close * 1.03;
      return (
        isInverseHeadShoulders &&
        breakout &&
        volumeConfirm &&
        breakoutVolume &&
        significantPattern &&
        preTrend
      );
    },
  },

  // 34. 墓碑線 (Gravestone Doji)
  {
    name: "墓碑線",
    enName: "Gravestone Doji",
    type: PatternType.REVERSAL,
    strength: SignalStrength.STRONG,
    bullish: false,
    check: (
      { close, open, high, low, volume }: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      const body = getBodySize({ close, open, high, low });
      const upperShadow = getUpperShadow({ close, open, high, low });
      const lowerShadow = getLowerShadow({ close, open, high, low });
      const totalRange = getTotalRange({ close, open, high, low });
      // 嚴格判斷：實體極小，上影線極長，下影線極短，且出現在高檔
      const isDoji = body < totalRange * 0.08;
      const isLongUpper = upperShadow > totalRange * 0.75;
      const isShortLower = lowerShadow < totalRange * 0.07;
      // 若有歷史資料，需出現在近10根K線的高檔
      let isHighZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const recent = candlestickData.slice(-10);
        const maxHigh = Math.max(...recent.map((d) => d.high));
        isHighZone = high > maxHigh * 0.97;
      }
      return isDoji && isLongUpper && isShortLower && isHighZone;
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
    check: (
      { close, open, high, low, volume }: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      const body = getBodySize({ close, open, high, low });
      const upperShadow = getUpperShadow({ close, open, high, low });
      const lowerShadow = getLowerShadow({ close, open, high, low });
      const totalRange = getTotalRange({ close, open, high, low });
      // 嚴格判斷：實體極小，下影線極長，上影線極短，且出現在低檔
      const isDoji = body < totalRange * 0.08;
      const isLongLower = lowerShadow > totalRange * 0.75;
      const isShortUpper = upperShadow < totalRange * 0.07;
      let isLowZone = true;
      if (candlestickData && candlestickData.length >= 10) {
        const recent = candlestickData.slice(-10);
        const minLow = Math.min(...recent.map((d) => d.low));
        isLowZone = low < minLow * 1.03;
      }
      return isDoji && isLongLower && isShortUpper && isLowZone;
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
    check: (
      { close, open, high, low, volume }: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      const body = getBodySize({ close, open, high, low });
      const upperShadow = getUpperShadow({ close, open, high, low });
      const lowerShadow = getLowerShadow({ close, open, high, low });
      const totalRange = getTotalRange({ close, open, high, low });
      // 嚴格判斷：實體極大，影線極短，且為陽線
      const isMarubozu =
        isGreen({ close, open, high, low }) &&
        body > totalRange * 0.88 &&
        upperShadow < totalRange * 0.06 &&
        lowerShadow < totalRange * 0.06;
      // 若有歷史資料，成交量需大於近5根均量（放量）
      let isVolumeUp = true;
      if (candlestickData && candlestickData.length >= 5 && volume) {
        const recent = candlestickData.slice(-5);
        const avgVol = recent.reduce((a, b) => a + (b.volume || 0), 0) / 5;
        isVolumeUp = volume > avgVol * 1.1;
      }
      return isMarubozu && isVolumeUp;
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
    check: (
      { close, open, high, low, volume }: KLineData,
      prevData?: KLineData,
      prev2Data?: KLineData,
      candlestickData?: KLineData[]
    ) => {
      const body = getBodySize({ close, open, high, low });
      const upperShadow = getUpperShadow({ close, open, high, low });
      const lowerShadow = getLowerShadow({ close, open, high, low });
      const totalRange = getTotalRange({ close, open, high, low });
      // 嚴格判斷：實體極大，影線極短，且為陰線
      const isMarubozu =
        isRed({ close, open, high, low }) &&
        body > totalRange * 0.88 &&
        upperShadow < totalRange * 0.06 &&
        lowerShadow < totalRange * 0.06;
      // 若有歷史資料，成交量需大於近5根均量（放量）
      let isVolumeUp = true;
      if (candlestickData && candlestickData.length >= 5 && volume) {
        const recent = candlestickData.slice(-5);
        const avgVol = recent.reduce((a, b) => a + (b.volume || 0), 0) / 5;
        isVolumeUp = volume > avgVol * 1.1;
      }
      return isMarubozu && isVolumeUp;
    },
    description: "幾乎無影線的長陰線，強烈看跌訊號",
    detail: "長陰線代表空頭力量強勁，賣方控制全場，通常延續下跌趨勢。",
  },
];

export default patternsPart4;
