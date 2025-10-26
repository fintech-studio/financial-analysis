import React, { useEffect, useState } from "react";
import Head from "next/head";
import Footer from "@/components/Layout/Footer";
import { ChartBarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type DataPoint = { date: string; value: number };
type IndicatorKey = "oil" | "gold" | "cpi" | "nfp";
type MarketKey = "tw" | "two" | "us";

// 股票基本面資料類型
interface StockFundamental {
  symbol: string;
  name: string | null;
  market: string;
  basicInfo: {
    industry: string | null;
    sector: string | null;
    country: string | null;
    exchange: string | null;
    currency: string | null;
  };
  valuation: {
    marketCap: number | null;
    pe: number | null;
    forwardPE: number | null;
    pb: number | null;
    ps: number | null;
    peg: number | null;
    enterpriseToRevenue: number | null;
    enterpriseToEbitda: number | null;
  };
  financialHealth: {
    debtToEquity: number | null;
    currentRatio: number | null;
    quickRatio: number | null;
    totalCash: number | null;
    totalDebt: number | null;
  };
  profitability: {
    roe: number | null;
    roa: number | null;
    netMargin: number | null;
    operatingMargin: number | null;
    grossMargin: number | null;
  };
  growth: {
    revenueGrowth: number | null;
    earningsGrowth: number | null;
    totalRevenue: number | null;
  };
  dividend: {
    dividendYield: number | null;
    dividendAmount: number | null;
    payoutRatio: number | null;
    exDividendDate: string | null;
  };
  stockInfo: {
    beta: number | null;
    bookValue: number | null;
    week52High: number | null;
    week52Low: number | null;
    avgVolume: number | null;
    sharesOutstanding: number | null;
    netIncomeToCommon: number | null;
  };
  updatedAt: string | null;
}

const INDICATORS: { key: IndicatorKey; label: string; table: string }[] = [
  { key: "oil", label: "石油 (WTI)", table: "fundamental_data_oil" },
  { key: "gold", label: "黃金 (Gold)", table: "fundamental_data_gold" },
  { key: "cpi", label: "CPI", table: "fundamental_data_cpi_us" },
  { key: "nfp", label: "NFP (非農就業)", table: "fundamental_data_nfp_us" },
];

const LineChart: React.FC<{
  data: DataPoint[];
  width?: number;
  height?: number;
}> = ({ data, width = 520, height = 160 }) => {
  if (!data || data.length === 0)
    return <div style={{ color: "#666" }}>N/A</div>;
  const vals = data.map((d) => d.value);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const pad = 8;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * innerW;
    const y = pad + ((max - d.value) / (max - min || 1)) * innerH;
    return `${x},${y}`;
  });
  return (
    <svg
      width={width}
      height={height}
      style={{ background: "#fff", borderRadius: 6 }}
    >
      <polyline
        fill="none"
        stroke="#2563eb"
        strokeWidth={2}
        points={points.join(" ")}
      />
      {data.map((d, i) => {
        const [xStr, yStr] = points[i].split(",");
        return (
          <circle
            key={i}
            cx={Number(xStr)}
            cy={Number(yStr)}
            r={2.5}
            fill="#1f2937"
          />
        );
      })}
    </svg>
  );
};

function evaluateStrength(data: DataPoint[]): {
  status: "偏弱" | "中性" | "偏強";
  score: number;
} {
  if (!data || data.length < 5) return { status: "中性", score: 1 };
  const recent = data.slice(-30);
  const y = recent.map((d) => d.value);
  const n = y.length;
  const mean = y.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(y.reduce((a, b) => a + (b - mean) ** 2, 0) / n) || 1;
  const last = y[y.length - 1];
  const z = (last - mean) / sd;

  // linear regression slope (x: 0..n-1)
  const xs = recent.map((_, i) => i);
  const xMean = (n - 1) / 2;
  const num = xs.reduce((s, xi, i) => s + (xi - xMean) * (y[i] - mean), 0);
  const den = xs.reduce((s, xi) => s + (xi - xMean) ** 2, 0) || 1;
  const slope = num / den;

  if (z > 0.6 || slope > Math.abs(mean) * 0.002)
    return { status: "偏強", score: 2 };
  if (z < -0.6 || slope < -Math.abs(mean) * 0.002)
    return { status: "偏弱", score: 0 };
  return { status: "中性", score: 1 };
}

export default function FundamentalPage(): React.ReactElement {
  const [active, setActive] = useState<IndicatorKey>("oil");
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [dataMap, setDataMap] = useState<Record<string, DataPoint[]>>({});
  const [, setError] = useState<string | null>(null);
  const [pinnedChart, setPinnedChart] = useState<IndicatorKey | null>(null);

  // 股票基本面分析相關狀態
  const [selectedMarket, setSelectedMarket] = useState<MarketKey>("tw");
  const [stockSymbol, setStockSymbol] = useState<string>("");
  const [stockData, setStockData] = useState<StockFundamental | null>(null);
  const [stockLoading, setStockLoading] = useState<boolean>(false);
  const [stockError, setStockError] = useState<string | null>(null);

  const UNIT_MAP: Record<IndicatorKey, string> = {
    oil: "USD/bbl",
    gold: "USD/oz",
    cpi: "Index",
    nfp: "Persons",
  };

  useEffect(() => {
    INDICATORS.forEach((it) => fetchIndicator(it.key));
  }, []);

  // 查詢股票基本面資料
  async function fetchStockFundamental() {
    if (!stockSymbol.trim()) {
      setStockError("請輸入股票代號");
      return;
    }

    setStockLoading(true);
    setStockError(null);
    setStockData(null);

    try {
      const res = await fetch("/api/fundamental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market: selectedMarket,
          symbol: stockSymbol.trim().toUpperCase(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      setStockData(json.data);
    } catch (err) {
      setStockError(err instanceof Error ? err.message : "查詢失敗");
    } finally {
      setStockLoading(false);
    }
  }

  async function fetchIndicator(key: IndicatorKey) {
    const info = INDICATORS.find((i) => i.key === key);
    if (!info) return;
    setError(null);
    setLoadingMap((s) => ({ ...s, [key]: true }));
    try {
      const payload = {
        config: { database: "market_fundamental" },
        query: `SELECT * FROM ${info.table}`,
      };
      const res = await fetch("/api/database/execute-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json || !json.success || !Array.isArray(json.data)) {
        throw new Error(json?.error || json?.message || "後端未回傳資料");
      }
      const rows: Record<string, unknown>[] = json.data;
      const parsed = rowsToDataPoints(rows);
      setDataMap((s) => ({ ...s, [key]: parsed }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "載入失敗");
    } finally {
      setLoadingMap((s) => ({ ...s, [key]: false }));
    }
  }

  function aggregateIndex() {
    const results: { key: IndicatorKey; status: string; score: number }[] = [];
    INDICATORS.forEach((it) => {
      const d = dataMap[it.key] || [];
      const ev = evaluateStrength(d);
      results.push({ key: it.key, status: ev.status, score: ev.score });
    });
    const avgScore = results.reduce((s, r) => s + r.score, 0) / results.length;
    const index = Math.round((avgScore / 2) * 100);
    const strongCount = results.filter((r) => r.status === "偏強").length;
    const weakCount = results.filter((r) => r.status === "偏弱").length;
    let conclusion = "";
    if (strongCount >= 3) conclusion = "整體偏強 — 基本面支持風險資產表現。";
    else if (weakCount >= 3)
      conclusion = "整體偏弱 — 市場基本面偏保守，注意風險。";
    else conclusion = "中性 — 基本面呈現混合訊號，建議配合技術面與資金面確認。";
    return { index, results, conclusion };
  }

  const agg = aggregateIndex();

  // 格式化數值的輔助函數
  const formatValue = (
    value: number | null | undefined,
    type: "number" | "percent" | "currency" | "volume" = "number",
    decimals: number = 2
  ): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "N/A";
    }

    switch (type) {
      case "percent":
        return `${value.toFixed(decimals)}%`;
      case "currency":
        if (Math.abs(value) >= 1e12) {
          return `$${(value / 1e12).toFixed(decimals)}兆`;
        } else if (Math.abs(value) >= 1e9) {
          return `$${(value / 1e9).toFixed(decimals)}B`;
        } else if (Math.abs(value) >= 1e6) {
          return `$${(value / 1e6).toFixed(decimals)}M`;
        }
        return `$${value.toFixed(decimals)}`;
      case "volume":
        if (value >= 1e9) {
          return `${(value / 1e9).toFixed(decimals)}B`;
        } else if (value >= 1e6) {
          return `${(value / 1e6).toFixed(decimals)}M`;
        }
        return value.toLocaleString();
      default:
        return value.toFixed(decimals);
    }
  };

  const formatDate = (
    dateValue: string | number | null | undefined
  ): string => {
    if (!dateValue) return "N/A";

    try {
      // 如果是時間戳（數字）
      if (typeof dateValue === "number") {
        return new Date(dateValue * 1000).toLocaleDateString("zh-TW");
      }
      // 如果是日期字串
      return new Date(dateValue).toLocaleDateString("zh-TW");
    } catch {
      return "N/A";
    }
  };

  return (
    <>
      <div className="min-h-screen">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        {/* Header Section (仿 finance-code/index.tsx) */}
        <section className="relative bg-linear-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center overflow-hidden shadow-2xl">
          {/* 動態網格背景 */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: "50px 50px",
              }}
            />
          </div>
          {/* Enhanced Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-12 left-12 w-24 h-24 bg-white opacity-5 rounded-full animate-pulse"></div>
            <div
              className="absolute bottom-12 right-24 w-36 h-36 bg-white opacity-5 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial from-white/10 to-transparent rounded-full"></div>
            <div className="absolute top-24 right-12 w-4 h-4 bg-white opacity-20 rounded-full animate-bounce"></div>
            <div
              className="absolute bottom-24 left-24 w-3 h-3 bg-white opacity-30 rounded-full animate-pulse"
              style={{ animationDelay: "1.5s" }}
            ></div>
            <div
              className="absolute top-48 left-1/4 w-5 h-5 bg-white opacity-15 rounded-full animate-bounce"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute top-32 right-1/3 w-2 h-2 bg-white opacity-25 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 z-10 w-full">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center mb-6">
                  <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm mr-6 group hover:bg-white/20 transition-all duration-300 shadow-lg">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <ChartBarIcon className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                      基本面指標總覽
                    </h1>
                    <p className="text-blue-200 mt-3 text-xl font-medium">
                      快速掌握石油、黃金、CPI、NFP等重要經濟指標
                    </p>
                  </div>
                </div>
                <p className="text-blue-200 text-xl max-w-3xl leading-relaxed mb-8">
                  本頁提供美國與全球市場重要基本面指標的即時查詢與趨勢分析，協助你做出更精準的投資決策。
                </p>
              </div>
              {/* 統計面板 */}
              <div className="flex flex-col lg:items-end space-y-4">
                <div className="grid grid-cols-2 gap-6 lg:gap-8">
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                    <div className="text-3xl font-bold text-white">
                      {agg.index}
                    </div>
                    <div className="text-blue-200 text-sm font-medium">
                      基本面綜合指數
                    </div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                    <div className="text-3xl font-bold text-white">
                      {new Date().toISOString().slice(0, 10)}
                    </div>
                    <div className="text-blue-200 text-sm font-medium">
                      資料更新
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="relative bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-64 h-64 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-linear-to-br from-indigo-100 to-purple-100 rounded-full opacity-20 blur-3xl"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
            {/* 綜合指標卡片 */}
            <div className="mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">
                    基本面綜合指數
                  </h3>
                  <p className="text-blue-700">{agg.conclusion}</p>
                </div>
                <div className="flex flex-col items-center">
                  <span
                    className={`text-5xl font-bold ${
                      agg.index >= 70
                        ? "text-green-600"
                        : agg.index <= 30
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {agg.index}
                  </span>
                  <span className="text-gray-400 text-sm">0-100</span>
                </div>
              </div>
            </div>
            {/* 指標現況卡片 */}
            <div className="mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                <div className="text-lg font-bold text-blue-900 mb-4">
                  基本面各項現況
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {INDICATORS.map((it) => {
                    const d = dataMap[it.key] || [];
                    const ev = evaluateStrength(d);
                    const latest = d.length ? d[d.length - 1].value : "—";
                    const latestDate = d.length ? d[d.length - 1].date : "";
                    return (
                      <div
                        key={it.key}
                        className="flex items-center justify-between bg-white rounded-2xl border border-blue-100 p-6 shadow hover:shadow-lg transition-all duration-300"
                      >
                        <div>
                          <div className="text-base font-semibold text-blue-800">
                            {it.label}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            最近數值：
                            <span className="font-bold text-gray-800">
                              {latest}
                            </span>
                            {latestDate && (
                              <span className="ml-2 text-gray-400 text-xs">
                                ({latestDate})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-bold text-lg ${
                              ev.status === "偏強"
                                ? "text-green-600"
                                : ev.status === "偏弱"
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {ev.status}
                          </div>
                          <div className="text-xs text-gray-400">
                            score: {ev.score}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() =>
                      INDICATORS.forEach((it) => fetchIndicator(it.key))
                    }
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 shadow"
                  >
                    重新抓取資料
                  </button>
                </div>
              </div>
            </div>
            {/* 互動與圖表展示 */}
            <div className="mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                <div className="flex flex-wrap gap-3 mb-4">
                  {INDICATORS.map((it) => {
                    const d = dataMap[it.key] || [];
                    const ev = evaluateStrength(d);
                    return (
                      <button
                        key={it.key}
                        onClick={() => setActive(it.key)}
                        className={`px-5 py-2 rounded-xl font-semibold border transition-all duration-200 ${
                          active === it.key
                            ? "border-blue-600 bg-blue-50 text-blue-900"
                            : "border-gray-200 bg-white text-gray-700"
                        }`}
                      >
                        <span>{it.label}</span>
                        <span
                          className={`ml-2 text-xs ${
                            ev.status === "偏強"
                              ? "text-green-600"
                              : ev.status === "偏弱"
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          {ev.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-blue-100 pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-blue-900 mb-1">
                        {INDICATORS.find((i) => i.key === active)?.label}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {loadingMap[active]
                          ? "載入中..."
                          : `資料點數：${(dataMap[active] || []).length}`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchIndicator(active)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 shadow"
                      >
                        重新載入
                      </button>
                      <button
                        onClick={() => setPinnedChart(active)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all duration-300 shadow"
                      >
                        秀出圖表
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="font-semibold text-gray-700 mb-1">
                      近期判斷
                    </div>
                    <div className="text-gray-600">
                      {(() => {
                        const ev = evaluateStrength(dataMap[active] || []);
                        return `${
                          INDICATORS.find((i) => i.key === active)?.label
                        }：${ev.status}（數據點 ${
                          (dataMap[active] || []).length
                        }）`;
                      })()}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="font-semibold text-gray-700 mb-1">建議</div>
                    <div className="text-gray-600 text-sm">
                      {(() => {
                        const ev = evaluateStrength(dataMap[active] || []);
                        const status = ev.status;
                        switch (active) {
                          case "cpi":
                            if (status === "偏強")
                              return "CPI 偏強：通膨壓力升高，央行可能偏向收緊貨幣政策。後果可能包含利率上行、債券價格承壓與美元走強。建議：減少利率敏感與高槓桿部位、關注能源與食品等輸入性通膨來源。";
                            if (status === "偏弱")
                              return "CPI 偏弱：物價壓力趨緩，貨幣政策可能維持寬鬆或放緩升息。後果可能包含債券收益率下降與風險資產表現改善。建議：關注成長型資產與消費類表現，並留意就業與薪資數據。";
                            return "CPI 中性：物價走勢穩定，短期對資產配置影響有限。建議：維持分散配置，觀察後續數據與核心通膨趨勢。";
                          case "nfp":
                            if (status === "偏強")
                              return "NFP 偏強：就業與薪資動能佳，短期可能加速升息節奏，推升利率與美元。建議：檢視利率敏感資產（如長債、房地產）風險，並留意薪資成長是否推升核心通膨。";
                            if (status === "偏弱")
                              return "NFP 偏弱：就業疲弱，可能降低升息壓力或促成寬鬆政策，利好債市與部分風險資產。建議：關注失業率、勞動參與率與薪資趨勢，留意消費性支出變化。";
                            return "NFP 中性：就業數據無明顯方向，建議以薪資與勞動參與率等補充指標做進一步判斷。";
                          case "oil":
                            if (status === "偏強")
                              return "石油偏強：油價上升可能推升輸入性通膨並利好能源股，但會增加企業與消費者成本。建議：評估上游能源曝險與消費品成本壓力，關注地緣政治與供需變化。";
                            if (status === "偏弱")
                              return "石油偏弱：油價下跌有助於緩解通膨與降低企業成本，利好消費類股但壓抑能源股。建議：關注下游消費與運輸成本改善的產業機會。";
                            return "石油中性：油價波動有限，短期對通膨影響較小。建議：以供需與地緣事件為重點監控。";
                          case "gold":
                            if (status === "偏強")
                              return "黃金偏強：可能反映避險需求上升或實質利率下降，對通膨與市場風險情緒敏感。建議：考慮適度保值配置並留意美元與利率走勢。";
                            if (status === "偏弱")
                              return "黃金偏弱：避險需求減少或利率上行，對黃金不利。建議：關注美元強弱與實質利率變動，調整貴金屬曝險。";
                            return "黃金中性：市場對風險與通膨預期平衡，建議以事件驅動調整倉位。";
                          default:
                            return "建議：以上為自動化簡單評估結果，請搭配技術面與其他基本面指標進行綜合判斷。";
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* 圖表預覽區 */}
            <div className="mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 min-h-[180px]">
                {pinnedChart ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-bold text-blue-900">
                        {INDICATORS.find((i) => i.key === pinnedChart)?.label} -
                        圖表預覽
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-500">
                          {UNIT_MAP[pinnedChart as IndicatorKey]}
                        </span>
                        <button
                          onClick={() => setPinnedChart(null)}
                          className="px-3 py-1 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200"
                        >
                          關閉
                        </button>
                        <button
                          onClick={() => fetchIndicator(pinnedChart!)}
                          className="px-3 py-1 bg-blue-100 rounded-lg text-blue-700 hover:bg-blue-200"
                        >
                          重新載入
                        </button>
                      </div>
                    </div>
                    <LineChart
                      data={dataMap[pinnedChart] || []}
                      width={760}
                      height={220}
                    />
                  </div>
                ) : (
                  <div className="text-gray-400">
                    選擇一個指標後按「秀出圖表」會在此處顯示對應圖表
                  </div>
                )}
              </div>
            </div>

            {/* 股票基本面分析區 */}
            <div className="mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                <div className="flex items-center mb-6">
                  <MagnifyingGlassIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-blue-900">
                    股票基本面資訊
                  </h2>
                </div>

                {/* 市場選擇與股票代號輸入 */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      選擇市場
                    </label>
                    <div className="flex gap-3">
                      {[
                        { key: "tw", label: "台灣 (TW)" },
                        { key: "two", label: "櫃買 (TWO)" },
                        { key: "us", label: "美國 (US)" },
                      ].map((market) => (
                        <button
                          key={market.key}
                          onClick={() =>
                            setSelectedMarket(market.key as MarketKey)
                          }
                          className={`px-6 py-3 rounded-xl font-semibold border-2 transition-all duration-200 ${
                            selectedMarket === market.key
                              ? "border-blue-600 bg-blue-50 text-blue-900"
                              : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                          }`}
                        >
                          {market.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      股票代號
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={stockSymbol}
                        onChange={(e) =>
                          setStockSymbol(e.target.value.toUpperCase())
                        }
                        onKeyPress={(e) =>
                          e.key === "Enter" && fetchStockFundamental()
                        }
                        placeholder={
                          selectedMarket === "us"
                            ? "輸入股票代號 (例: AAPL)"
                            : "輸入股票代號 (例: 2330)"
                        }
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-800 font-semibold"
                      />
                      <button
                        onClick={fetchStockFundamental}
                        disabled={stockLoading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {stockLoading ? "查詢中..." : "查詢"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 錯誤訊息 */}
                {stockError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 font-semibold">{stockError}</p>
                  </div>
                )}

                {/* 股票基本面資料顯示 */}
                {stockData && (
                  <div className="space-y-6">
                    {/* 股票基本資訊 */}
                    <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-blue-900">
                            {stockData.symbol} - {stockData.name || "N/A"}
                          </h3>
                          <p className="text-blue-600 mt-1">
                            {stockData.basicInfo.industry || "N/A"} |{" "}
                            {stockData.basicInfo.sector || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">市場</div>
                          <div className="text-xl font-bold text-blue-900">
                            {stockData.market}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">國家</div>
                          <div className="text-sm font-semibold text-gray-800">
                            {stockData.basicInfo.country || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">交易所</div>
                          <div className="text-sm font-semibold text-gray-800">
                            {stockData.basicInfo.exchange || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">貨幣</div>
                          <div className="text-sm font-semibold text-gray-800">
                            {stockData.basicInfo.currency || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">更新時間</div>
                          <div className="text-sm font-semibold text-gray-800">
                            {formatDate(stockData.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 估值指標 */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">💰</span> 估值指標
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">市值</div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(
                              stockData.valuation.marketCap,
                              "currency"
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            本益比 (P/E)
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(stockData.valuation.pe)}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            預估本益比
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(stockData.valuation.forwardPE)}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            股價淨值比 (P/B)
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(stockData.valuation.pb)}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            股價營收比 (P/S)
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(stockData.valuation.ps)}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            PEG比率
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(stockData.valuation.peg)}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            企業價值/營收
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(
                              stockData.valuation.enterpriseToRevenue
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            企業價值/EBITDA
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(
                              stockData.valuation.enterpriseToEbitda
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 財務健康度 */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">🏥</span> 財務健康度
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            負債權益比
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(
                              stockData.financialHealth.debtToEquity
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            流動比率
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(
                              stockData.financialHealth.currentRatio
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            速動比率
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(stockData.financialHealth.quickRatio)}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            總現金
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(
                              stockData.financialHealth.totalCash,
                              "currency"
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            總負債
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(
                              stockData.financialHealth.totalDebt,
                              "currency"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 獲利能力 */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">📈</span> 獲利能力
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            股東權益報酬率 (ROE)
                          </div>
                          <div className="text-base font-bold text-green-700">
                            {formatValue(
                              stockData.profitability.roe,
                              "percent"
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            資產報酬率 (ROA)
                          </div>
                          <div className="text-base font-bold text-green-700">
                            {formatValue(
                              stockData.profitability.roa,
                              "percent"
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            淨利率
                          </div>
                          <div className="text-base font-bold text-green-700">
                            {formatValue(
                              stockData.profitability.netMargin,
                              "percent"
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            營業利益率
                          </div>
                          <div className="text-base font-bold text-green-700">
                            {formatValue(
                              stockData.profitability.operatingMargin,
                              "percent"
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            毛利率
                          </div>
                          <div className="text-base font-bold text-green-700">
                            {formatValue(
                              stockData.profitability.grossMargin,
                              "percent"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 成長性 */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">🚀</span> 成長性
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            營收成長率
                          </div>
                          <div className="text-base font-bold text-blue-700">
                            {formatValue(
                              stockData.growth.revenueGrowth,
                              "percent"
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            盈餘成長率
                          </div>
                          <div className="text-base font-bold text-blue-700">
                            {formatValue(
                              stockData.growth.earningsGrowth,
                              "percent"
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            總營收
                          </div>
                          <div className="text-base font-bold text-blue-700">
                            {formatValue(
                              stockData.growth.totalRevenue,
                              "currency"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 股利資訊 */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">💵</span> 股利資訊
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            股利率
                          </div>
                          <div className="text-base font-bold text-purple-700">
                            {formatValue(
                              stockData.dividend.dividendYield,
                              "percent"
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            股利金額
                          </div>
                          <div className="text-base font-bold text-purple-700">
                            {formatValue(
                              stockData.dividend.dividendAmount,
                              "number"
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            配息率
                          </div>
                          <div className="text-base font-bold text-purple-700">
                            {formatValue(
                              stockData.dividend.payoutRatio,
                              "percent"
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            除息日
                          </div>
                          <div className="text-sm font-bold text-purple-700">
                            {formatDate(stockData.dividend.exDividendDate)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 股票資訊 */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="text-2xl mr-2">📊</span> 股票資訊
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            Beta值
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(stockData.stockInfo.beta)}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            每股淨值
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(stockData.stockInfo.bookValue)}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            52週最高
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(stockData.stockInfo.week52High)}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            52週最低
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(stockData.stockInfo.week52Low)}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            平均成交量
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(
                              stockData.stockInfo.avgVolume,
                              "volume"
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            流通股數
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(
                              stockData.stockInfo.sharesOutstanding,
                              "volume"
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            普通股淨利
                          </div>
                          <div className="text-base font-bold text-gray-800">
                            {formatValue(
                              stockData.stockInfo.netIncomeToCommon,
                              "currency"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// 將資料庫回傳的 row[] 轉為 DataPoint[]
function rowsToDataPoints(rows: Record<string, unknown>[]): DataPoint[] {
  if (!rows || rows.length === 0) return [];
  const keys = Object.keys(rows[0] || {});

  // 偵測日期欄位與數值欄位
  const dateRegex = /(date|day|month|year|obs_date|timestamp)/i;
  const valueRegex =
    /(value|price|cpi|nfp|amount|close|val|obs_value|persons)/i;

  let dateKey: string | null = null;
  let valueKey: string | null = null;

  for (const k of keys) {
    if (!dateKey && dateRegex.test(k)) dateKey = k;
    if (!valueKey && valueRegex.test(k)) valueKey = k;
  }
  // fallback: first string-like as date, first numeric-like as value
  if (!dateKey) {
    dateKey =
      keys.find((k) =>
        rows.some((r) => typeof r[k] === "string" && /\d{4}/.test(String(r[k])))
      ) || keys[0];
  }
  if (!valueKey) {
    valueKey =
      keys.find((k) =>
        rows.some(
          (r) =>
            typeof r[k] === "number" || /^-?\d+(\.\d+)?$/.test(String(r[k]))
        )
      ) ||
      keys[1] ||
      keys[0];
  }

  const out: DataPoint[] = [];
  for (const r of rows) {
    const rawDate = r[dateKey as string];
    const rawVal = r[valueKey as string];

    if (rawDate == null || rawVal == null) continue;

    // 解析日期
    let dateStr = String(rawDate).trim();
    // remove quotes
    dateStr = dateStr.replace(/^"|"$/g, "");
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      dateStr = `${yyyy}-${mm}-${dd}`;
    }

    // 解析數值
    const v = Number(String(rawVal).replace(/[^0-9.-]/g, ""));
    if (isNaN(v)) continue;

    out.push({ date: dateStr, value: v });
  }

  // sort by date ascending
  out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return out;
}
