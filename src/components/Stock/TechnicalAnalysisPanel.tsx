import React, { useMemo } from "react";

interface TechnicalAnalysisPanelProps {
  technicalData?: Record<string, number[]>;
  symbol: string;
  timeframe: "1d" | "1h";
  close_price: number;
  loading?: boolean; // 新增 loading 狀態
}

// slice(-1)[0] 工具函式
const last = (arr?: number[]) =>
  Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1] : undefined;

// 工具函式：指標 tag/signal/顏色
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

// ...可依需求繼續抽取 KD、BOLL、WILLR、ATR、CCI、MOM ...

const TechnicalAnalysisPanel: React.FC<TechnicalAnalysisPanelProps> = ({
  technicalData,
  symbol,
  timeframe,
  close_price,
  loading = false,
}) => {
  // loading 狀態
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
      Close: () => {
        if (typeof close_price === "number") return close_price;
        const possibleKeys = [
          "close",
          "Close",
          "closing_price",
          "price",
          "adj_close",
          "adjclose",
        ];
        for (const key of possibleKeys) {
          const value = last(technicalData?.[key]);
          if (value !== undefined) return value;
        }
        return undefined;
      },
      Volume: () => last(technicalData["volume"]),
      AvgVol: () => {
        const arr = technicalData["volume"] || [];
        if (arr.length < 20) return undefined;
        return arr.slice(-20).reduce((a, b) => a + b, 0) / 20;
      },
      VolRatio: () => {
        const v = get.Volume();
        const avg = get.AvgVol();
        if (!v || !avg) return undefined;
        return v / avg;
      },
      WILLR: () => last(technicalData["willr"]),
      ATR: () => last(technicalData["atr"]),
      CCI: () => last(technicalData["cci"]),
      MOM: () => last(technicalData["mom"]),
    }),
    [technicalData, close_price]
  );

  // 只計算一次卡片資料
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
        title: "RSI (14)",
        value: rsi,
        valueUnit: "",
        ...getRSITag(rsi),
        desc: "標準區間: 30-70 \n 超買線: 70+ | 超賣線: 30-",
      },
      {
        key: "MACD",
        title: "MACD",
        value: macd,
        valueUnit: "",
        ...getMACDTag(macd),
        desc: `DIF: ${typeof dif === "number" ? dif.toFixed(1) : "-"} | DEA: ${
          typeof dea === "number" ? dea.toFixed(1) : "-"
        }\n柱狀圖: ${typeof macdHist === "number" ? macdHist.toFixed(1) : "-"}`,
      },
      {
        key: "KD",
        title: "KD指標",
        value:
          typeof k === "number" && typeof d === "number"
            ? `K:${k.toFixed(0)} D:${d.toFixed(0)}`
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
        desc: `K值: ${typeof k === "number" ? k.toFixed(1) : "-"} | D值: ${
          typeof d === "number" ? d.toFixed(1) : "-"
        } \nJ值: ${typeof j === "number" ? j.toFixed(1) : "-"}`,
      },
      {
        key: "MA20",
        title: "移動平均線 (20日)",
        value: typeof ma20 === "number" ? ma20 : "-",
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
        desc: `5日: ${typeof ma5 === "number" ? ma5.toFixed(0) : "-"} | 10日: ${
          typeof ma10 === "number" ? ma10.toFixed(0) : "-"
        } \n 60日: ${typeof ma60 === "number" ? ma60.toFixed(0) : "-"}`,
      },
      {
        key: "BOLL",
        title: "布林通道",
        value:
          typeof bollUpper === "number" &&
          typeof bollMiddle === "number" &&
          typeof bollLower === "number"
            ? `上軌: ${bollUpper.toFixed(2)}`
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
          let widthDesc = width >= 0 ? width.toFixed(2) : "-";
          let status = width < 2 ? "收斂" : width > 10 ? "擴張" : "正常";
          return `中軌: ${bollMiddle.toFixed(2)} | 下軌: ${bollLower.toFixed(
            2
          )}\n頻道寬度: ${widthDesc} (${status})`;
        })(),
      },
      {
        key: "WILLR",
        title: "威廉指標 (W%R)",
        value: typeof willr === "number" ? willr.toFixed(2) : "-",
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
        title: "ATR (平均真實波幅)",
        value: typeof atr === "number" ? atr.toFixed(2) : "-",
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
        desc: "ATR數值越大代表波動越大，常用於風險管理。",
      },
      {
        key: "CCI",
        title: "CCI (順勢指標)",
        value: typeof cci === "number" ? cci.toFixed(2) : "-",
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
        desc: "CCI>100超買，<-100超賣，常用於判斷趨勢強弱。",
      },
      {
        key: "MOM",
        title: "MOM (動量指標)",
        value: typeof mom === "number" ? mom.toFixed(2) : "-",
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
        desc: "動量>0為上升趨勢，<0為下降趨勢。",
      },
      {
        key: "EMA26",
        title: "EMA (26日)",
        value: (() => {
          const arr = technicalData["ema26"];
          const v = last(arr);
          return typeof v === "number" ? v.toFixed(2) : "-";
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
        desc: "EMA26為26日指數移動平均線，常用於判斷中期趨勢。",
      },
    ];
  }, [get]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow duration-200"
        >
          <div className="text-xs font-semibold uppercase mb-2 text-gray-500">
            {card.title}
          </div>
          <div className="flex items-baseline">
            <div className="text-lg font-bold text-gray-800">
              {card.value}
              {card.valueUnit && (
                <span className="text-sm font-medium text-gray-500 ml-1">
                  {card.valueUnit}
                </span>
              )}
            </div>
            <div
              className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center ${card.tagColor}`}
            >
              {card.tag}
            </div>
          </div>
          <div className={`mt-2 text-xs ${card.signalColor} flex items-center`}>
            {card.signal}
          </div>
          <div className="mt-2 text-xs text-gray-500 line-clamp-2">
            {card.desc}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TechnicalAnalysisPanel;
