import React from "react";

interface TechnicalAnalysisPanelProps {
  technicalData?: { [key: string]: number[] };
  symbol: string;
  timeframe: "1d" | "1h";
  close_price?: number; // 新增 closePrice prop
}

// slice(-1)[0] 工具函式
const last = (arr?: number[]) =>
  Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1] : undefined;

const TechnicalAnalysisPanel: React.FC<TechnicalAnalysisPanelProps> = ({
  technicalData,
  symbol,
  timeframe,
  close_price, // 接收 closePrice
}) => {
  if (!technicalData || Object.keys(technicalData).length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow text-gray-500 text-center mt-2">
        無技術指標資料
      </div>
    );
  }

  // 指標 getter
  const get = {
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
      if (typeof close_price === "number") {
        console.log("Using external closePrice:", close_price);
        return close_price; // 優先使用外部傳入的 closePrice
      }
      // 嘗試多個可能的收盤價 key
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
        if (value !== undefined) {
          console.log(`Found close price with key: ${key}`, value);
          return value;
        }
      }
      console.log("No close price found in any of the keys:", possibleKeys);
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
  };

  // 調試：輸出所有可用的技術指標 keys
  console.log(
    "Available technicalData keys:",
    Object.keys(technicalData || {})
  );
  console.log("TechnicalData sample:", technicalData);

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

  // 卡片資料
  const cards = [
    {
      key: "RSI",
      title: "RSI (14)",
      value: rsi,
      valueUnit: "",
      tag:
        typeof rsi === "number"
          ? rsi > 70
            ? "超買"
            : rsi > 60
            ? "接近超買"
            : rsi < 30
            ? "超賣"
            : rsi < 40
            ? "接近超賣"
            : "正常"
          : "-",
      tagColor:
        typeof rsi === "number"
          ? rsi > 70
            ? "bg-orange-200 text-orange-700"
            : rsi > 60
            ? "bg-yellow-200 text-yellow-800"
            : rsi < 30
            ? "bg-blue-200 text-blue-700"
            : "bg-gray-100 text-gray-400"
          : "bg-gray-100 text-gray-400",
      signal:
        typeof rsi === "number"
          ? rsi > 70
            ? "偏空"
            : rsi < 30
            ? "偏多"
            : "-"
          : "-",
      signalColor:
        typeof rsi === "number"
          ? rsi > 70
            ? "text-red-500"
            : rsi < 30
            ? "text-green-500"
            : "text-gray-400"
          : "text-gray-400",
      desc: "標準區間: 30-70 \n 超買線: 70+ | 超賣線: 30-",
    },
    {
      key: "MACD",
      title: "MACD",
      value: macd,
      valueUnit: "",
      tag:
        typeof macd === "number"
          ? macd > 0
            ? "看漲信號"
            : macd < 0
            ? "看跌信號"
            : "無信號"
          : "-",
      tagColor:
        typeof macd === "number"
          ? macd > 0
            ? "bg-green-100 text-green-700"
            : macd < 0
            ? "bg-red-100 text-red-700"
            : "bg-gray-100 text-gray-400"
          : "bg-gray-100 text-gray-400",
      signal:
        typeof macd === "number"
          ? macd > 0
            ? "偏多"
            : macd < 0
            ? "偏空"
            : ""
          : "-",
      signalColor:
        typeof macd === "number"
          ? macd > 0
            ? "text-green-500"
            : macd < 0
            ? "text-red-500"
            : "text-gray-400"
          : "text-gray-400",
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
          : "-",
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
          : typeof ma20 === "number" && typeof ma60 === "number" && ma20 < ma60
          ? "跌破均線"
          : typeof ma20 === "number" && typeof ma60 === "number"
          ? "無信號"
          : "",
      tagColor:
        typeof ma20 === "number" && typeof ma60 === "number" && ma20 > ma60
          ? "bg-green-100 text-green-700"
          : typeof ma20 === "number" && typeof ma60 === "number" && ma20 < ma60
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-400",
      signal:
        typeof ma20 === "number" && typeof ma60 === "number"
          ? ma20 > ma60
            ? "偏多"
            : "偏空"
          : "-",
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
        // 調試：先檢查各個值
        console.log("BOLL Debug:", { close, bollUpper, bollMiddle, bollLower });

        if (
          typeof close !== "number" ||
          typeof bollUpper !== "number" ||
          typeof bollLower !== "number" ||
          typeof bollMiddle !== "number"
        ) {
          console.log("BOLL: 資料不完整，回傳 -");
          return "-";
        }

        const width = bollUpper - bollLower;
        console.log("BOLL Width:", width);

        if (width === 0) return "頻道收斂";
        if (width < 0) return "資料異常";

        const nearRatio = 0.02; // 2% 內視為靠近
        const upperDiff = Math.abs(close - bollUpper) / width;
        const lowerDiff = Math.abs(close - bollLower) / width;

        console.log("BOLL Ratios:", { upperDiff, lowerDiff, nearRatio });

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
        if (Math.abs(close - bollLower) / width < 0.02) return "text-blue-400";
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
        return "中性";
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
        return "中性";
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
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-gray-800 text-base">
              {card.title}
            </span>
            {card.tag != null && card.tag !== "" && (
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${card.tagColor}`}
              >
                {card.tag}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${card.signalColor}`}>
              {card.value !== undefined &&
              card.value !== null &&
              card.value !== ""
                ? card.value
                : "-"}
              {card.valueUnit}
            </span>
            {card.signal != null && card.signal !== "" && (
              <span className="text-xs font-semibold">{card.signal}</span>
            )}
          </div>
          <div className="text-xs text-gray-500 whitespace-pre-line">
            {card.desc}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TechnicalAnalysisPanel;
