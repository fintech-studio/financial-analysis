import { ChartBarIcon } from "@heroicons/react/24/outline";
import React, { useMemo } from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";

interface TechnicalAnalysisPanelProps {
  technicalData?: Record<string, number[]>;
  symbol: string;
  timeframe: "1d" | "1h";
  open_price?: number;
  high_price?: number;
  low_price?: number;
  close_price: number;
  volume?: number;
  loading?: boolean;
  candlestickData?: {
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }[];
}

// slice(-1)[0] 工具函式
const last = (arr?: number[]) =>
  Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1] : undefined;

// RSI 標籤
const getRSITag = (rsi?: number) => {
  if (typeof rsi !== "number")
    return {
      tag: "-",
      tagColor: "bg-gray-100 text-gray-400",
      signal: "-",
      signalColor: "text-gray-400",
    };
  if (rsi > 70)
    return {
      tag: "超買",
      tagColor: "bg-orange-200 text-orange-700",
      signal: "偏空",
      signalColor: "text-red-500",
    };
  if (rsi > 60)
    return {
      tag: "接近超買",
      tagColor: "bg-yellow-200 text-yellow-800",
      signal: "中性",
      signalColor: "text-gray-400",
    };
  if (rsi < 30)
    return {
      tag: "超賣",
      tagColor: "bg-blue-200 text-blue-700",
      signal: "偏多",
      signalColor: "text-green-500",
    };
  if (rsi < 40)
    return {
      tag: "接近超賣",
      tagColor: "bg-gray-100 text-gray-400",
      signal: "中性",
      signalColor: "text-gray-400",
    };
  return {
    tag: "正常",
    tagColor: "bg-gray-100 text-gray-400",
    signal: "中性",
    signalColor: "text-gray-400",
  };
};

// MACD 標籤
const getMACDTag = (macd?: number) => {
  if (typeof macd !== "number")
    return {
      tag: "-",
      tagColor: "bg-gray-100 text-gray-400",
      signal: "-",
      signalColor: "text-gray-400",
    };
  if (macd > 0)
    return {
      tag: "看漲信號",
      tagColor: "bg-green-100 text-green-700",
      signal: "偏多",
      signalColor: "text-green-500",
    };
  if (macd < 0)
    return {
      tag: "看跌信號",
      tagColor: "bg-red-100 text-red-700",
      signal: "偏空",
      signalColor: "text-red-500",
    };
  return {
    tag: "無信號",
    tagColor: "bg-gray-100 text-gray-400",
    signal: "中性",
    signalColor: "text-gray-400",
  };
};

const TechnicalAnalysisPanel: React.FC<TechnicalAnalysisPanelProps> = ({
  technicalData,
  symbol,
  timeframe,
  close_price,
  volume,
  loading = false,
  candlestickData,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow text-gray-500 text-center mt-2 animate-pulse">
        技術指標載入中...
      </div>
    );
  }

  if (!technicalData || Object.keys(technicalData).length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow text-gray-500 text-center mt-2">
        無技術指標資料
      </div>
    );
  }

  // getter 只建立一次
  const get = useMemo(
    () => ({
      RSI: () => last(technicalData["rsi_14"]),
      MACD: () => last(technicalData["macd"]),
      DIF: () => last(technicalData["dif"]),
      DEA: () => {
        const dif = last(technicalData["dif"]);
        const hist = last(technicalData["macd_histogram"]);
        return dif !== undefined && hist !== undefined ? dif - hist : undefined;
      },
      MACDHist: () => last(technicalData["macd_histogram"]),
      K: () => last(technicalData["k_value"]),
      D: () => last(technicalData["d_value"]),
      J: () => last(technicalData["j_value"]),
      MA5: () => last(technicalData["ma5"]),
      MA10: () => last(technicalData["ma10"]),
      MA20: () => last(technicalData["ma20"]),
      MA60: () => last(technicalData["ma60"]),
      BollUpper: () => last(technicalData["bb_upper"]),
      BollMiddle: () => last(technicalData["bb_middle"]),
      BollLower: () => last(technicalData["bb_lower"]),
      Close: () => (typeof close_price === "number" ? close_price : undefined),
      Volume: () => (typeof volume === "number" ? volume : undefined),
      AvgVol: () => {
        if (Array.isArray(candlestickData) && candlestickData.length > 0) {
          const vols = candlestickData
            .map((d) => d.volume)
            .filter((v) => typeof v === "number");
          if (vols.length >= 20) {
            return vols.slice(-20).reduce((a, b) => a + b, 0) / 20;
          }
        }
        return undefined;
      },
      VolRatio: () => {
        if (Array.isArray(candlestickData) && candlestickData.length > 0) {
          const vols = candlestickData
            .map((d) => d.volume)
            .filter((v) => typeof v === "number");
          const v = vols.length > 0 ? vols[vols.length - 1] : undefined;
          const avg =
            vols.length >= 20
              ? vols.slice(-20).reduce((a, b) => a + b, 0) / 20
              : undefined;
          if (typeof v === "number" && typeof avg === "number" && avg !== 0) {
            return v / avg;
          }
        }
        return undefined;
      },
      WILLR: () => last(technicalData["willr"]),
      ATR: () => last(technicalData["atr"]),
      CCI: () => last(technicalData["cci"]),
      MOM: () => last(technicalData["mom"]),
      Support: () => {
        if (Array.isArray(candlestickData) && candlestickData.length > 0) {
          const lows = candlestickData
            .map((d) => d.low)
            .filter((v) => typeof v === "number");
          if (lows.length > 0) return Math.min(...lows.slice(-20));
        }
        const possibleKeys = ["low", "lows", "low_price", "Low", "lowPrices"];
        let lows: number[] | undefined;
        for (const key of possibleKeys) {
          if (Array.isArray(technicalData[key])) {
            lows = technicalData[key];
            break;
          }
        }
        if (!lows || lows.length === 0) return undefined;
        return Math.min(...lows.slice(-20));
      },
      Resistance: () => {
        if (Array.isArray(candlestickData) && candlestickData.length > 0) {
          const highs = candlestickData
            .map((d) => d.high)
            .filter((v) => typeof v === "number");
          if (highs.length > 0) return Math.max(...highs.slice(-20));
        }
        const possibleKeys = [
          "high",
          "highs",
          "high_price",
          "High",
          "highPrices",
        ];
        let highs: number[] | undefined;
        for (const key of possibleKeys) {
          if (Array.isArray(technicalData[key])) {
            highs = technicalData[key];
            break;
          }
        }
        if (!highs || highs.length === 0) return undefined;
        return Math.max(...highs.slice(-20));
      },
    }),
    [technicalData, close_price, candlestickData]
  );

  // 卡片資料
  const cards = useMemo(() => {
    const rsi = get.RSI();
    const macd = get.MACD();
    const dif = get.DIF();
    const dea = get.DEA();
    const macdHist = get.MACDHist();
    const k = get.K();
    const d = get.D();
    const j = get.J();
    const ma5 = get.MA5();
    const ma10 = get.MA10();
    const ma20 = get.MA20();
    const ma60 = get.MA60();
    const bollUpper = get.BollUpper();
    const bollMiddle = get.BollMiddle();
    const bollLower = get.BollLower();
    const close = get.Close();
    const willr = get.WILLR();
    const atr = get.ATR();
    const cci = get.CCI();
    const mom = get.MOM();

    return [
      {
        key: "RSI",
        title: "RSI (14日)",
        value: typeof rsi === "number" ? formatNumber(rsi, 2) : "-",
        valueUnit: "",
        ...getRSITag(rsi),
        desc: "標準區間: 30-70 \n 超買線: 70+ | 超賣線: 30-",
      },
      {
        key: "MACD",
        title: "MACD",
        value: typeof macd === "number" ? formatNumber(macd, 2) : "-",
        valueUnit: "",
        ...getMACDTag(macd),
        desc: `DIF: ${
          typeof dif === "number" ? formatNumber(dif, 1) : "-"
        } | DEA: ${
          typeof dea === "number" ? formatNumber(dea, 1) : "-"
        }\n柱狀圖: ${
          typeof macdHist === "number" ? formatNumber(macdHist, 1) : "-"
        }`,
      },
      {
        key: "KD",
        title: "KD指標",
        value:
          typeof k === "number" && typeof d === "number"
            ? `K:${formatNumber(k, 0)} D:${formatNumber(d, 0)}`
            : "-",
        valueUnit: "",
        tag:
          typeof k === "number" && typeof d === "number"
            ? k > 80 && d > 80
              ? "超買"
              : k < 20 && d < 20
              ? "超賣"
              : k > d
              ? "黃金交叉"
              : "死亡交叉"
            : "-",
        tagColor:
          typeof k === "number" && typeof d === "number"
            ? k > 80 && d > 80
              ? "bg-orange-100 text-orange-700"
              : k < 20 && d < 20
              ? "bg-blue-100 text-blue-700"
              : k > d
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
            : "bg-gray-100 text-gray-400",
        signal:
          typeof k === "number" && typeof d === "number"
            ? k > d
              ? "偏多"
              : "偏空"
            : "中性",
        signalColor:
          typeof k === "number" && typeof d === "number"
            ? k > d
              ? "text-green-500"
              : "text-red-500"
            : "text-gray-400",
        desc: `K值: ${
          typeof k === "number" ? formatNumber(k, 1) : "-"
        } | D值: ${typeof d === "number" ? formatNumber(d, 1) : "-"} \nJ值: ${
          typeof j === "number" ? formatNumber(j, 1) : "-"
        }`,
      },
      {
        key: "MA20",
        title: "移動平均線 (20日)",
        value: typeof ma20 === "number" ? formatNumber(ma20, 2) : "-",
        valueUnit: "",
        tag:
          typeof ma20 === "number" && typeof ma60 === "number" && ma20 > ma60
            ? "站上均線"
            : typeof ma20 === "number" &&
              typeof ma60 === "number" &&
              ma20 < ma60
            ? "跌破均線"
            : typeof ma20 === "number" && typeof ma60 === "number"
            ? "無信號"
            : "-",
        tagColor:
          typeof ma20 === "number" && typeof ma60 === "number" && ma20 > ma60
            ? "bg-green-100 text-green-700"
            : typeof ma20 === "number" &&
              typeof ma60 === "number" &&
              ma20 < ma60
            ? "bg-red-100 text-red-700"
            : "bg-gray-100 text-gray-400",
        signal:
          typeof ma20 === "number" && typeof ma60 === "number"
            ? ma20 > ma60
              ? "偏多"
              : "偏空"
            : "中性",
        signalColor:
          typeof ma20 === "number" && typeof ma60 === "number"
            ? ma20 > ma60
              ? "text-green-500"
              : "text-red-500"
            : "text-gray-400",
        desc: `5日: ${
          typeof ma5 === "number" ? formatNumber(ma5, 0) : "-"
        } | 10日: ${
          typeof ma10 === "number" ? formatNumber(ma10, 0) : "-"
        }\n60日: ${typeof ma60 === "number" ? formatNumber(ma60, 0) : "-"}`,
      },
      {
        key: "BOLL",
        title: "布林通道",
        value:
          typeof bollUpper === "number" &&
          typeof bollMiddle === "number" &&
          typeof bollLower === "number"
            ? `上軌: ${formatNumber(bollUpper, 2)}`
            : "-",
        valueUnit: "",
        tag: (() => {
          if (
            typeof close !== "number" ||
            typeof bollUpper !== "number" ||
            typeof bollLower !== "number" ||
            typeof bollMiddle !== "number"
          ) {
            return "-";
          }
          const width = bollUpper - bollLower;
          if (width === 0) return "頻道收斂";
          if (width < 0) return "資料異常";
          const nearRatio = 0.02;
          const upperDiff = Math.abs(close - bollUpper) / width;
          const lowerDiff = Math.abs(close - bollLower) / width;
          if (close > bollUpper) return "突破上軌";
          if (close < bollLower) return "跌破下軌";
          if (upperDiff < nearRatio) return "靠近上軌";
          if (lowerDiff < nearRatio) return "靠近下軌";
          if (close > bollMiddle) return "站上中軌";
          if (close < bollMiddle) return "跌破中軌";
          return "區間內";
        })(),
        tagColor: (() => {
          if (
            typeof close !== "number" ||
            typeof bollUpper !== "number" ||
            typeof bollLower !== "number" ||
            typeof bollMiddle !== "number"
          )
            return "bg-gray-100 text-gray-400";
          const width = bollUpper - bollLower;
          if (width === 0) return "bg-yellow-100 text-yellow-700";
          if (close > bollUpper) return "bg-orange-200 text-orange-700";
          if (close < bollLower) return "bg-blue-200 text-blue-700";
          if (Math.abs(close - bollUpper) / width < 0.02)
            return "bg-orange-100 text-orange-700";
          if (Math.abs(close - bollLower) / width < 0.02)
            return "bg-blue-100 text-blue-700";
          if (close > bollMiddle) return "bg-green-100 text-green-700";
          if (close < bollMiddle) return "bg-red-100 text-red-700";
          return "bg-gray-100 text-gray-400";
        })(),
        signal: (() => {
          if (
            typeof close !== "number" ||
            typeof bollUpper !== "number" ||
            typeof bollLower !== "number" ||
            typeof bollMiddle !== "number"
          )
            return "-";
          const width = bollUpper - bollLower;
          if (width === 0) return "觀望";
          if (close > bollUpper) return "偏多";
          if (close < bollLower) return "偏空";
          if (Math.abs(close - bollUpper) / width < 0.02) return "偏多";
          if (Math.abs(close - bollLower) / width < 0.02) return "偏空";
          if (close > bollMiddle) return "偏多";
          if (close < bollMiddle) return "偏空";
          return "中性";
        })(),
        signalColor: (() => {
          if (
            typeof close !== "number" ||
            typeof bollUpper !== "number" ||
            typeof bollLower !== "number" ||
            typeof bollMiddle !== "number"
          )
            return "text-gray-400";
          const width = bollUpper - bollLower;
          if (width === 0) return "text-yellow-500";
          if (close > bollUpper) return "text-orange-500";
          if (close < bollLower) return "text-blue-500";
          if (Math.abs(close - bollUpper) / width < 0.02)
            return "text-orange-400";
          if (Math.abs(close - bollLower) / width < 0.02)
            return "text-blue-400";
          if (close > bollMiddle) return "text-green-500";
          if (close < bollMiddle) return "text-red-500";
          return "text-gray-400";
        })(),
        desc: (() => {
          if (
            typeof bollUpper !== "number" ||
            typeof bollMiddle !== "number" ||
            typeof bollLower !== "number"
          )
            return "-";
          const width = bollUpper - bollLower;
          let widthDesc = width >= 0 ? formatNumber(width, 2) : "-";
          let status = width < 2 ? "收斂" : width > 10 ? "擴張" : "正常";
          return `中軌: ${formatNumber(bollMiddle, 2)} | 下軌: ${formatNumber(
            bollLower,
            2
          )}\n頻道寬度: ${widthDesc} (${status})`;
        })(),
      },
      {
        key: "WILLR",
        title: "威廉指標 (W%R)",
        value: typeof willr === "number" ? formatNumber(willr, 2) : "-",
        valueUnit: "",
        tag: (() => {
          if (typeof willr !== "number") return "-";
          if (willr < -80) return "超賣";
          if (willr > -20) return "超買";
          return "正常";
        })(),
        tagColor: (() => {
          if (typeof willr !== "number") return "bg-gray-100 text-gray-400";
          if (willr < -80) return "bg-blue-100 text-blue-700";
          if (willr > -20) return "bg-orange-100 text-orange-700";
          return "bg-gray-100 text-gray-400";
        })(),
        signal: (() => {
          if (typeof willr !== "number") return "-";
          if (willr < -80) return "偏多";
          if (willr > -20) return "偏空";
          return "中性";
        })(),
        signalColor: (() => {
          if (typeof willr !== "number") return "text-gray-400";
          if (willr < -80) return "text-green-500";
          if (willr > -20) return "text-red-500";
          return "text-gray-400";
        })(),
        desc: "超賣區: -80以下 \n 超買區: -20以上",
      },
      {
        key: "ATR",
        title: "ATR 平均真實波幅",
        value: typeof atr === "number" ? formatNumber(atr, 2) : "-",
        valueUnit: "",
        tag: (() => {
          if (typeof atr !== "number") return "-";
          if (atr > 2) return "波動大";
          if (atr < 1) return "波動小";
          return "正常";
        })(),
        tagColor: (() => {
          if (typeof atr !== "number") return "bg-gray-100 text-gray-400";
          if (atr > 2) return "bg-orange-100 text-orange-700";
          if (atr < 1) return "bg-blue-100 text-blue-700";
          return "bg-gray-100 text-gray-400";
        })(),
        signal: (() => {
          if (typeof atr !== "number") return "-";
          if (atr > 2) return "高波動";
          if (atr < 1) return "低波動";
          return "中性";
        })(),
        signalColor: (() => {
          if (typeof atr !== "number") return "text-gray-400";
          if (atr > 2) return "text-orange-500";
          if (atr < 1) return "text-blue-500";
          return "text-gray-400";
        })(),
        desc: "ATR數值越大代表波動越大 \n 常用於風險管理。",
      },
      {
        key: "CCI",
        title: "CCI 順勢指標",
        value: typeof cci === "number" ? formatNumber(cci, 2) : "-",
        valueUnit: "",
        tag: (() => {
          if (typeof cci !== "number") return "-";
          if (cci > 100) return "超買";
          if (cci < -100) return "超賣";
          return "正常";
        })(),
        tagColor: (() => {
          if (typeof cci !== "number") return "bg-gray-100 text-gray-400";
          if (cci > 100) return "bg-orange-100 text-orange-700";
          if (cci < -100) return "bg-blue-100 text-blue-700";
          return "bg-gray-100 text-gray-400";
        })(),
        signal: (() => {
          if (typeof cci !== "number") return "-";
          if (cci > 100) return "偏空";
          if (cci < -100) return "偏多";
          return "中性";
        })(),
        signalColor: (() => {
          if (typeof cci !== "number") return "text-gray-400";
          if (cci > 100) return "text-red-500";
          if (cci < -100) return "text-green-500";
          return "text-gray-400";
        })(),
        desc: "CCI>100超買，<-100超賣 \n 常用於判斷趨勢強弱。",
      },
      {
        key: "MOM",
        title: "MOM 動量指標",
        value: typeof mom === "number" ? formatNumber(mom, 2) : "-",
        valueUnit: "",
        tag: (() => {
          if (typeof mom !== "number") return "-";
          if (mom > 0) return "動能上升";
          if (mom < 0) return "動能下降";
          return "持平";
        })(),
        tagColor: (() => {
          if (typeof mom !== "number") return "bg-gray-100 text-gray-400";
          if (mom > 0) return "bg-green-100 text-green-700";
          if (mom < 0) return "bg-red-100 text-red-700";
          return "bg-gray-100 text-gray-400";
        })(),
        signal: (() => {
          if (typeof mom !== "number") return "-";
          if (mom > 0) return "偏多";
          if (mom < 0) return "偏空";
          return "中性";
        })(),
        signalColor: (() => {
          if (typeof mom !== "number") return "text-gray-400";
          if (mom > 0) return "text-green-500";
          if (mom < 0) return "text-red-500";
          return "text-gray-400";
        })(),
        desc: "動量>0為上升趨勢，<0為下降趨勢 \n 常用於捕捉趨勢轉折。",
      },
      {
        key: "EMA26",
        title: "EMA (26日)",
        value: (() => {
          const arr = technicalData["ema26"];
          const v = last(arr);
          return typeof v === "number" ? formatNumber(v, 2) : "-";
        })(),
        valueUnit: "",
        tag: (() => {
          const ema26 = last(technicalData["ema26"]);
          const close = get.Close();
          if (typeof ema26 !== "number" || typeof close !== "number")
            return "-";
          if (close > ema26) return "站上EMA26";
          if (close < ema26) return "跌破EMA26";
          return "持平";
        })(),
        tagColor: (() => {
          const ema26 = last(technicalData["ema26"]);
          const close = get.Close();
          if (typeof ema26 !== "number" || typeof close !== "number")
            return "bg-gray-100 text-gray-400";
          if (close > ema26) return "bg-green-100 text-green-700";
          if (close < ema26) return "bg-red-100 text-red-700";
          return "bg-gray-100 text-gray-400";
        })(),
        signal: (() => {
          const ema26 = last(technicalData["ema26"]);
          const close = get.Close();
          if (typeof ema26 !== "number" || typeof close !== "number")
            return "-";
          if (close > ema26) return "偏多";
          if (close < ema26) return "偏空";
          return "中性";
        })(),
        signalColor: (() => {
          const ema26 = last(technicalData["ema26"]);
          const close = get.Close();
          if (typeof ema26 !== "number" || typeof close !== "number")
            return "text-gray-400";
          if (close > ema26) return "text-green-500";
          if (close < ema26) return "text-red-500";
          return "text-gray-400";
        })(),
        desc: "EMA26加權移動平均線 \n 常用於確認趨勢方向。",
      },
      {
        key: "Support",
        title: "支撐位 (近20日低點)",
        value: (() => {
          const v = get.Support();
          return typeof v === "number" ? formatNumber(v, 2) : "-";
        })(),
        valueUnit: "",
        tag: "支撐",
        tagColor: "bg-blue-100 text-blue-700",
        signal: "",
        signalColor: "text-blue-500",
        desc: "近20日最低價 \n 常用於判斷下檔支撐區。",
      },
      {
        key: "Resistance",
        title: "阻力位 (近20日高點)",
        value: (() => {
          const v = get.Resistance();
          return typeof v === "number" ? formatNumber(v, 2) : "-";
        })(),
        valueUnit: "",
        tag: "阻力",
        tagColor: "bg-orange-100 text-orange-700",
        signal: "",
        signalColor: "text-orange-500",
        desc: "近20日最高價 \n 常用於判斷上檔壓力區。",
      },
      {
        key: "Volume",
        title: "成交量",
        value: (() => {
          const v = get.Volume();
          return typeof v === "number" ? formatVolume(v) : "-";
        })(),
        valueUnit: "",
        tag: (() => {
          const ratio = get.VolRatio();
          if (typeof ratio !== "number") return "-";
          if (ratio > 1.5) return "爆量";
          if (ratio < 0.7) return "量縮";
          return "正常";
        })(),
        tagColor: (() => {
          const ratio = get.VolRatio();
          if (typeof ratio !== "number") return "bg-gray-100 text-gray-400";
          if (ratio > 1.5) return "bg-orange-100 text-orange-700";
          if (ratio < 0.7) return "bg-blue-100 text-blue-700";
          return "bg-gray-100 text-gray-400";
        })(),
        signal: (() => {
          const ratio = get.VolRatio();
          if (typeof ratio !== "number") return "-";
          if (ratio > 1.5) return "偏多";
          if (ratio < 0.7) return "偏空";
          return "中性";
        })(),
        signalColor: (() => {
          const ratio = get.VolRatio();
          if (typeof ratio !== "number") return "text-gray-400";
          if (ratio > 1.5) return "text-orange-500";
          if (ratio < 0.7) return "text-blue-500";
          return "text-gray-400";
        })(),
        desc: (() => {
          const avg = get.AvgVol();
          const ratio = get.VolRatio();
          return `20日均量: ${
            typeof avg === "number" ? formatVolume(avg) : "-"
          }\n量能比: ${
            typeof ratio === "number" ? formatNumber(ratio, 2) : "-"
          }`;
        })(),
      },
    ];
  }, [get]);

  // 動態分組卡片：前面每組3張，最後一組最多4張
  const cardGroups: Array<typeof cards> = [];
  let i = 0;
  while (i < cards.length) {
    if (cards.length - i === 4) {
      cardGroups.push(cards.slice(i, i + 4));
      break;
    } else {
      cardGroups.push(cards.slice(i, i + 3));
      i += 3;
    }
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex items-center text-xl font-semibold text-gray-800 mt-2 mb-2">
        <ChartBarIcon className="inline-block w-6 h-6 mr-1 text-gray-500" />
        {symbol} 技術分析 -{" "}
        {timeframe === "1d" ? "日線" : timeframe === "1h" ? "小時線" : ""}
        <span className="text-gray-400 text-sm font-normal ml-2">
          - Sparkline only shows last 20 data points.
        </span>
      </div>
      {cardGroups.map((group, idx) => (
        <div
          key={idx}
          className={
            idx === 3
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          }
        >
          {group.map((card) => (
            <div
              key={card.key}
              className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-shadow duration-200 border border-gray-100 flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
                  {card.title}
                  <span
                    className={`ml-3 text-xs ${card.signalColor} font-bold`}
                  >
                    {card.signal}
                  </span>
                </div>
                <div
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center ${card.tagColor}`}
                >
                  {card.tag}
                </div>
              </div>
              {/* value + signal + sparkline 同一橫列 */}
              <div className="flex items-center justify-between mb-2 w-full">
                <div className="flex items-baseline">
                  <span className="text-2xl font-extrabold text-gray-800">
                    {card.value}
                  </span>
                  {card.valueUnit && (
                    <span className="text-sm font-medium text-gray-400 ml-1">
                      {card.valueUnit}
                    </span>
                  )}
                </div>
                <div className="h-8 w-32 flex-shrink-0 flex items-center justify-end">
                  <Sparklines
                    data={(() => {
                      if (
                        card.key === "Support" &&
                        Array.isArray(candlestickData)
                      ) {
                        return candlestickData
                          .map((d) => d.low)
                          .filter((v) => typeof v === "number")
                          .slice(-20);
                      }
                      if (
                        card.key === "Resistance" &&
                        Array.isArray(candlestickData)
                      ) {
                        return candlestickData
                          .map((d) => d.high)
                          .filter((v) => typeof v === "number")
                          .slice(-20);
                      }
                      if (
                        card.key === "Volume" &&
                        Array.isArray(candlestickData)
                      ) {
                        return candlestickData
                          .map((d) => d.volume)
                          .filter((v) => typeof v === "number")
                          .slice(-20);
                      }
                      const keyMap: Record<string, string> = {
                        RSI: "rsi_14",
                        MACD: "macd",
                        KD: "k_value",
                        MA20: "ma20",
                        BOLL: "bb_middle",
                        WILLR: "willr",
                        ATR: "atr",
                        CCI: "cci",
                        MOM: "mom",
                        EMA26: "ema26",
                      };
                      const dataKey = keyMap[card.key];
                      if (
                        dataKey &&
                        technicalData &&
                        Array.isArray(technicalData[dataKey])
                      ) {
                        return technicalData[dataKey].slice(-20);
                      }
                      return [];
                    })()}
                    svgHeight={32}
                    svgWidth={120}
                  >
                    <SparklinesLine
                      color={
                        card.signalColor === "text-green-500"
                          ? "green"
                          : card.signalColor === "text-red-500"
                          ? "red"
                          : card.signalColor === "text-blue-500"
                          ? "blue"
                          : card.signalColor === "text-blue-400"
                          ? "blue"
                          : card.signalColor === "text-purple-500"
                          ? "purple"
                          : card.signalColor === "text-orange-500"
                          ? "orange"
                          : card.signalColor === "text-yellow-500"
                          ? "yellow"
                          : "gray"
                      }
                      style={{ fill: "none" }}
                    />
                  </Sparklines>
                </div>
              </div>
              <div className="text-xs text-gray-500 whitespace-pre-line line-clamp-2">
                {card.desc}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TechnicalAnalysisPanel;

// 數字格式化：三位一撇
const formatNumber = (num?: number, digits = 2) => {
  if (typeof num !== "number" || isNaN(num)) return "-";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};
// 成交量格式化：K/M/B
const formatVolume = (num?: number) => {
  if (typeof num !== "number" || isNaN(num)) return "-";
  if (num >= 1_000_000_000)
    return (
      (num / 1_000_000_000).toLocaleString("en-US", {
        maximumFractionDigits: 3,
      }) + "B"
    );
  if (num >= 1_000_000)
    return (
      (num / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 3 }) +
      "M"
    );
  if (num >= 1_000)
    return (
      (num / 1_000).toLocaleString("en-US", { maximumFractionDigits: 3 }) + "K"
    );
  return num.toLocaleString("en-US");
};
