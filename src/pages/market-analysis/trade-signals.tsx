import React, { useState, useEffect, useCallback } from "react";
import Footer from "@/components/Layout/Footer";
import { DatabaseService, DatabaseConfig } from "@/services/DatabaseService";
import { FiDownload } from "react-icons/fi";
import { SignalIcon, MagnifyingGlassIcon, ChartBarIcon, ClockIcon } from "@heroicons/react/24/outline";

type SignalRow = Record<string, unknown>;

type TableState = {
  visible: boolean;
  search: string;
  page: number;
  pageSize: number;
};

type SignalInsights = {
  counts: Record<string, number>;
  indicatorsSorted: [string, number][];
  timeline: Array<{
    date: string;
    price: string;
    signal?: string;
    strength?: string;
  }>;
};

function formatDate(val?: unknown) {
  if (!val) return "";
  const d = new Date(String(val));
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleString();
}

function getSignalBadge(signal?: string) {
  if (!signal)
    return { text: "無訊號", cls: "border-gray-200 text-gray-600 bg-white" };
  if (signal.includes("買"))
    return { text: signal, cls: "border-green-200 text-green-700 bg-white" };
  if (signal.includes("賣"))
    return { text: signal, cls: "border-red-200 text-red-700 bg-white" };
  return { text: signal, cls: "border-gray-200 text-gray-700 bg-white" };
}

function toCSV(rows: SignalRow[]) {
  if (!rows || rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const lines = [cols.join(",")];
  for (const r of rows) {
    const line = cols
      .map((c) => {
        const v = r[c];
        if (v === null || v === undefined) return "";
        const s = String(v).replace(/"/g, '""');
        return `"${s}"`;
      })
      .join(",");
    lines.push(line);
  }
  return lines.join("\n");
}

function formatNumber(v?: unknown) {
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return n.toLocaleString();
}

const SkeletonLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 space-y-6">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div
        className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin"
        style={{ animationDelay: "0.3s", animationDuration: "1.2s" }}
      ></div>
    </div>
    <div className="text-center">
      <p className="text-xl font-semibold text-gray-700 mb-2">查詢中...</p>
      <p className="text-gray-500">正在搜尋交易訊號資料</p>
    </div>
  </div>
);

const SignalBadgeSmall: React.FC<{ signal?: string }> = ({ signal }) => {
  const badge = getSignalBadge(signal);
  return (
    <span className={`inline-block px-3 py-1 text-sm rounded-full border ${badge.cls}`}>
      {badge.text}
    </span>
  );
};

const TradeSignalsPage: React.FC = () => {
  const [symbol, setSymbol] = useState("");
  const [timeframe, setTimeframe] = useState<"1d" | "1h" | "both">("1d");
  const [dbName, setDbName] = useState<
    | "market_stock_tw"
    | "market_stock_us"
    | "market_crypto"
    | "market_forex"
    | "market_etf"
    | "market_futures"
    | "market_index"
  >("market_stock_tw");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [results, setResults] = useState<{ [k: string]: SignalRow[] }>({});
  const [tableStates, setTableStates] = useState<{
    [k: string]: TableState;
  }>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // keep tableStates in sync with result keys
  useEffect(() => {
    const keys = Object.keys(results);
    setTableStates((prev) => {
      const next = { ...prev };
      keys.forEach((k) => {
        if (!next[k])
          next[k] = { visible: true, search: "", page: 1, pageSize: 10 };
      });
      Object.keys(next).forEach((k) => {
        if (!keys.includes(k)) delete next[k];
      });
      return next;
    });
  }, [results]);

  const getTableState = (k: string) =>
    tableStates[k] ?? { visible: true, search: "", page: 1, pageSize: 10 };

  const setTableState = (
    k: string,
    patch: Partial<TableState>
  ) => {
    setTableStates((prev) => ({
      ...prev,
      [k]: { ...getTableState(k), ...patch },
    }));
  };

  const sanitizeSymbol = useCallback(
    (s: string) => {
      if (
        dbName === "market_futures" ||
        dbName === "market_forex" ||
        dbName === "market_index" ||
        dbName === "market_etf" ||
        dbName === "market_stock_us" ||
        dbName === "market_stock_tw" ||
        dbName === "market_crypto"
      ) {
        return s
          .replace(new RegExp("[^0-9A-Za-z_/.\\-=^]", "g"), "")
          .toUpperCase();
      }
      return s.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
    },
    [dbName]
  );

  const handleSearch = useCallback(async () => {
    const symbolSan = sanitizeSymbol(symbol);
    if (!symbolSan) {
      setError("請輸入股票代號，例如 2330 或 0050");
      return;
    }
    setLoading(true);
    setError("");
    setResults({});

    try {
      const db = DatabaseService.getInstance();
      const dbConfig: DatabaseConfig = {
        user: "",
        password: "",
        server: "",
        database: dbName,
      };

      const queries: Array<{ key: string; sql: string }> = [];
      if (timeframe === "1d" || timeframe === "both") {
        queries.push({
          key: "1d",
          sql: `SELECT TOP (500) * FROM trade_signals_1d WHERE symbol = @symbol ORDER BY [datetime] DESC`,
        });
      }
      if (timeframe === "1h" || timeframe === "both") {
        queries.push({
          key: "1h",
          sql: `SELECT TOP (500) * FROM trade_signals_1h WHERE symbol = @symbol ORDER BY [datetime] DESC`,
        });
      }

      const out: { [k: string]: SignalRow[] } = {};
      for (const q of queries) {
        const resp = await db.executeQuery(dbConfig, q.sql, {
          symbol: symbolSan,
        });
        if (!resp.success) {
          setError(resp.error || "查詢失敗");
          setLoading(false);
          return;
        }
        out[q.key] = (resp.data as SignalRow[]) || [];
      }
      setResults(out);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知錯誤");
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe, sanitizeSymbol]);

  const handleExport = (key: string) => {
    const rows = results[key] || [];
    const csv = toCSV(rows);
    if (!csv) return;
    // prepend UTF-8 BOM to help Excel and other programs detect UTF-8 with Chinese characters
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${symbol || "symbol"}_${dbName}_${key}_trade_signals.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const renderSummary = (rows: SignalRow[]) => {
    const total = rows.length;
    const latest = rows[0];
    const latestDate = latest ? latest["datetime"] || latest["date"] || "" : "";
    const latestPrice = latest
      ? latest["close_price"] || latest["close"] || ""
      : "";
    const currentSignal = latest
      ? (latest["Trade_Signal"] as string | undefined)
      : undefined;

    const sparkValues = rows
      .slice(0, 40)
      .map((r) => Number(r["close_price"] ?? r["close"]) || 0)
      .filter((v) => v > 0);
    const sparkFirst =
      sparkValues.length > 0 ? sparkValues[sparkValues.length - 1] : 0;
    const sparkLast = sparkValues.length > 0 ? sparkValues[0] : 0;
    const sparkDeltaPct = sparkFirst
      ? ((sparkLast - sparkFirst) / sparkFirst) * 100
      : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <div className="w-5 h-5 bg-blue-500 rounded"></div>
            </div>
          </div>
          <div className="text-sm text-gray-600 font-medium mb-1">總筆數</div>
          <div className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</div>
        </div>
        <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <div className="w-5 h-5 bg-green-500 rounded"></div>
            </div>
          </div>
          <div className="text-sm text-gray-600 font-medium mb-1">最新時間</div>
          <div className="text-sm font-semibold text-gray-900">{formatDate(latestDate)}</div>
        </div>
        <div className="bg-white/90 rounded-2xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <div className="w-5 h-5 bg-purple-500 rounded"></div>
            </div>
          </div>
          <div className="text-sm text-gray-600 font-medium mb-1">當前訊號</div>
          <div className="mt-2">
            <SignalBadgeSmall signal={currentSignal} />
          </div>
        </div>
        <div className="bg-white/90 rounded-2xl shadow-lg border border-orange-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <div className="w-5 h-5 bg-orange-500 rounded"></div>
            </div>
          </div>
          <div className="text-sm text-gray-600 font-medium mb-1">最新收盤價</div>
          <div className="text-lg font-bold text-gray-900">
            {latestPrice ? `NT$ ${formatNumber(latestPrice)}` : "-"}
          </div>
          <div className={`text-sm font-medium mt-1 ${sparkDeltaPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {sparkDeltaPct ? `${sparkDeltaPct > 0 ? '+' : ''}${sparkDeltaPct.toFixed(2)}%` : "-"}
          </div>
        </div>
      </div>
    );
  };

  // additional computed insights for each result set - memoized
  const computeInsights = useCallback((rows: SignalRow[]): SignalInsights => {
    const counts: Record<string, number> = {};
    const indicatorCounts: Record<string, number> = {};
    const timeline: Array<{
      date: string;
      price: string;
      signal?: string;
      strength?: string;
    }> = [];

    const indicators = [
      "MA_Cross",
      "BB_Signal",
      "MACD_Cross",
      "MACD_Div",
      "RSI_Signal",
      "KD_Signal",
      "SR_Signal",
      "Volume_Anomaly",
      "EMA_Cross",
      "CCI_Signal",
      "WILLR_Signal",
      "MOM_Signal",
      "Anomaly",
    ];

    for (const r of rows.slice(0, 200)) {
      const sig = String(r["Trade_Signal"] ?? r["signal"] ?? "");
      if (sig) counts[sig] = (counts[sig] || 0) + 1;

      indicators.forEach((k) => {
        const v = r[k];
        if (
          v !== null &&
          v !== undefined &&
          String(v) !== "" &&
          String(v) !== "0"
        )
          indicatorCounts[k] = (indicatorCounts[k] || 0) + 1;
      });

      timeline.push({
        date: formatDate(r["datetime"] ?? r["date"]),
        price: formatNumber(r["close_price"] ?? r["close"]),
        signal: String(r["Trade_Signal"] ?? r["signal"] ?? ""),
        strength: String(r["Signal_Strength"] ?? r["strength"] ?? ""),
      });
    }

    const indicatorsSorted = Object.entries(indicatorCounts).sort(
      (a, b) => b[1] - a[1]
    );

    return { counts, indicatorsSorted, timeline };
  }, []);

  return (
    <>
      {/* 頁面標題區域 */}

      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center overflow-hidden shadow-2xl">
        {/* 背景網格與裝飾 */}
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
          <div className="absolute top-48 left-1/4 w-5 h-5 bg-white opacity-15 rounded-full animate-bounce" style={{ animationDelay: "2s" }}></div>
          <div className="absolute top-32 right-1/3 w-2 h-2 bg-white opacity-25 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 z-10 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm mr-6 group hover:bg-white/20 transition-all duration-300 shadow-lg">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <SignalIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                    進階交易訊號分析
                  </h1>
                  <p className="text-blue-200 mt-3 text-xl font-medium">
                    提供股票與加密貨幣等等的交易訊號查詢與分析工具。
                  </p>
                </div>
              </div>
              <p className="text-blue-200 text-xl max-w-3xl leading-relaxed mb-8">
                查詢並分析技術指標產生的交易訊號，協助投資人做出更明智的交易決策。
              </p>
              
              <form
                className="flex flex-col sm:flex-row gap-4 max-w-2xl"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!loading) handleSearch();
                }}
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-white/40 transition-all duration-300 text-lg"
                    placeholder="輸入股票代號"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    maxLength={10}
                    autoFocus
                  />
                </div>
                <select
                  value={timeframe}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setTimeframe(e.target.value as "1d" | "1h" | "both")
                  }
                  className="px-4 py-3 border-2 border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/40 transition-all duration-300 appearance-none cursor-pointer hover:border-white/30"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px'
                  }}
                >
                  <option value="1d" className="bg-white text-gray-900 py-2">📊 日線</option>
                  <option value="1h" className="bg-white text-gray-900 py-2">⏰ 小時線</option>
                  <option value="both" className="bg-white text-gray-900 py-2">📈 日線&小時線</option>
                </select>
                <select
                  value={dbName}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setDbName(
                      e.target.value as
                        | "market_stock_tw"
                        | "market_stock_us"
                        | "market_crypto"
                        | "market_forex"
                        | "market_etf"
                        | "market_futures"
                        | "market_index"
                    )
                  }
                  className="px-4 py-3 border-2 border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:border-white/40 transition-all duration-300 appearance-none cursor-pointer hover:border-white/30"
                  title="選擇查詢的資料庫"
                >
                  <option value="market_stock_tw" className="bg-white text-gray-900 py-2">🇹🇼 market_stock_tw</option>
                  <option value="market_stock_us" className="bg-white text-gray-900 py-2">🇺🇸 market_stock_us</option>
                  <option value="market_crypto" className="bg-white text-gray-900 py-2">🌐 market_crypto</option>
                  <option value="market_forex" className="bg-white text-gray-900 py-2">💱 market_forex</option>
                  <option value="market_etf" className="bg-white text-gray-900 py-2">📊 market_etf</option>
                  <option value="market_futures" className="bg-white text-gray-900 py-2">📈 market_futures</option>
                  <option value="market_index" className="bg-white text-gray-900 py-2">📉 market_index</option>
                </select>
                <button
                  type="submit"
                  className="px-8 py-4 bg-white text-blue-900 font-bold rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden group flex items-center gap-2"
                  disabled={loading || !symbol}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity"></span>
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 relative" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="relative">查詢中...</span>
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="h-5 w-5 relative" />
                      <span className="relative">查詢</span>
                    </>
                  )}
                </button>
              </form>
            </div>
            
            <div className="flex flex-col lg:items-end space-y-4">
              <div className="grid grid-cols-2 gap-6 lg:gap-8">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-3xl font-bold text-white">{Object.values(results).reduce((acc, arr) => acc + arr.length, 0)}</div>
                  <div className="text-blue-200 text-sm font-medium">資料筆數</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-3xl font-bold text-white">多市場</div>
                  <div className="text-blue-200 text-sm font-medium">支援類型</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 主要內容區域 */}
      <div className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-20 blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="grid gap-6" id="signalsList">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="text-red-500 text-xl">⚠️</div>
                  <div>
                    <div className="text-red-800 font-semibold text-lg mb-1">查詢錯誤</div>
                    <div className="text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}
            {loading && <SkeletonLoader />}
            {Object.keys(results).length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
                  <SignalIcon className="w-12 h-12 text-blue-600" />
                </div>
                <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-blue-200/50 max-w-md">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">開始分析交易訊號</h3>
                  <p className="text-gray-600 leading-relaxed">
                    請輸入股票代號，獲取交易訊號與投資建議
                  </p>
                </div>
              </div>
            )}
            {!loading &&
              Object.entries(results).map(([k, rows]) => (
                <div
                  key={k}
                  className="bg-white/90 rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  {/* 卡片標題區域 */}
                  <div className="border-b border-gray-100 p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          {k === "1d" ? (
                            <ChartBarIcon className="h-6 w-6 text-blue-600" />
                          ) : (
                            <ClockIcon className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {k === "1d" ? "日線交易訊號" : "小時線交易訊號"}
                          </h2>
                          <div className="text-sm text-gray-500 mt-1">
                            {k === "1d" ? "trade_signals_1d" : "trade_signals_1h"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          共 {rows.length.toLocaleString()} 筆
                        </div>
                        <button
                          type="button"
                          className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-sm inline-flex items-center gap-2 text-green-700 font-medium transition-colors"
                          onClick={() => handleExport(k)}
                        >
                          <FiDownload className="text-base" />
                          匯出 CSV
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium transition-colors"
                          onClick={() =>
                            setTableState(k, { visible: !getTableState(k).visible })
                          }
                        >
                          {getTableState(k).visible ? "👁️ 隱藏" : "👁️ 顯示"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {rows.length > 0 && renderSummary(rows)}
                    {/* insights */}
                    {rows.length > 0 &&
                      (() => {
                        const ins = computeInsights(rows);
                        const sigEntries = Object.entries(ins.counts).sort(
                          (a, b) => b[1] - a[1]
                        );
                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* 訊號分布 */}
                            <div className="bg-gray-50 rounded-xl p-6">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="text-sm font-semibold text-gray-700">訊號分布</div>
                              </div>
                              {sigEntries.length === 0 ? (
                                <div className="text-sm text-gray-500">無資料</div>
                              ) : (
                                <div className="space-y-2">
                                  {sigEntries.map(([s, cnt]) => {
                                    const badge = getSignalBadge(String(s));
                                    return (
                                      <div
                                        key={s}
                                        className="flex items-center justify-between p-2 bg-white rounded-lg"
                                      >
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs font-medium ${badge.cls}`}
                                        >
                                          {badge.text}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-600">
                                          {cnt}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            {/* 熱門指標 */}
                            <div className="bg-gray-50 rounded-xl p-6 lg:col-span-2">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="text-sm font-semibold text-gray-700">
                                  熱門指標 (前200筆)
                                </div>
                              </div>
                              {ins.indicatorsSorted.length === 0 ? (
                                <div className="text-sm text-gray-500">無資料</div>
                              ) : (
                                <div className="grid grid-cols-2 gap-3">
                                  {ins.indicatorsSorted
                                    .slice(0, 12)
                                    .map(([k, v]) => (
                                      <div
                                        key={k}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg"
                                      >
                                        <div className="text-sm text-gray-700 font-medium">{k}</div>
                                        <div className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                          {v}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                            {/* 最近訊號時間線 */}
                            <div className="bg-gray-50 rounded-xl p-6 lg:col-span-3">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <div className="text-sm font-semibold text-gray-700">
                                  最近訊號時間線
                                </div>
                              </div>
                              {ins.timeline.length === 0 ? (
                                <div className="text-sm text-gray-500">無資料</div>
                              ) : (
                                <div className="space-y-3 max-h-64 overflow-auto">
                                  {ins.timeline.slice(0, 8).map((t, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                                    >
                                      <div className="text-xs text-gray-600 font-medium w-48 truncate">
                                        {t.date}
                                      </div>
                                      <div className="flex-1 text-sm text-gray-800 font-semibold mx-4">
                                        {t.price}
                                      </div>
                                      <div>
                                        <SignalBadgeSmall signal={t.signal} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    {rows.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">查無資料</div>
                    ) : (
                      getTableState(k).visible && (
                        <div>
                          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                            <input
                              type="search"
                              placeholder="搜尋列（含 signal / datetime / price）"
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-79"
                              value={getTableState(k).search}
                              onChange={(e) =>
                                setTableState(k, {
                                  search: e.target.value,
                                  page: 1,
                                })
                              }
                            />
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700">每頁</label>
                              <select
                                value={getTableState(k).pageSize}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white backdrop-blur-sm transition-all duration-300 appearance-none cursor-pointer hover:border-blue-400"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'right 8px center',
                                  backgroundSize: '12px'
                                }}
                                onChange={(e) =>
                                  setTableState(k, {
                                    pageSize: Number(e.target.value),
                                    page: 1,
                                  })
                                }
                              >
                                {[10, 20, 50, 100].map((n) => (
                                  <option key={n} value={n} className="py-2">
                                    {n}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            {/* ...existing table/pagination code... */}
                            {(() => {
                              const state = getTableState(k);
                              const q = state.search.trim().toLowerCase();
                              const filtered = q
                                ? rows.filter((r) =>
                                    Object.values(r).some((v) =>
                                      String(v ?? "")
                                        .toLowerCase()
                                        .includes(q)
                                    )
                                  )
                                : rows;
                              const sorted = sortColumn
                                ? [...filtered].sort((a, b) => {
                                    const va = a[sortColumn];
                                    const vb = b[sortColumn];
                                    const na = Number(va);
                                    const nb = Number(vb);
                                    if (!isNaN(na) && !isNaN(nb)) {
                                      return sortDirection === "asc"
                                        ? na - nb
                                        : nb - na;
                                    }
                                    const sa = String(va ?? "").toLowerCase();
                                    const sb = String(vb ?? "").toLowerCase();
                                    if (sa < sb)
                                      return sortDirection === "asc" ? -1 : 1;
                                    if (sa > sb)
                                      return sortDirection === "asc" ? 1 : -1;
                                    return 0;
                                  })
                                : filtered;
                              const totalPages = Math.max(
                                1,
                                Math.ceil(sorted.length / state.pageSize)
                              );
                              const currentPage = Math.min(
                                Math.max(1, state.page),
                                totalPages
                              );
                              const startIdx = (currentPage - 1) * state.pageSize;
                              const endIdx = Math.min(
                                startIdx + state.pageSize,
                                sorted.length
                              );
                              const paginatedRows = sorted.slice(startIdx, endIdx);
                              const first = rows[0] || {};
                              const cols = Object.keys(first);
                              const preferred = [
                                "datetime",
                                "date",
                                "signal",
                                "strength",
                                "price",
                                "close",
                              ];
                              const ordered = [
                                ...preferred.filter((p) => cols.includes(p)),
                                ...cols.filter((c) => !preferred.includes(c)),
                              ];
                              const toggleSort = (col: string) => {
                                if (sortColumn === col)
                                  setSortDirection(
                                    sortDirection === "asc" ? "desc" : "asc"
                                  );
                                else {
                                  setSortColumn(col);
                                  setSortDirection("desc");
                                }
                              };
                              const renderCellValue = (val: unknown) => {
                                const s =
                                  val === null || val === undefined
                                    ? ""
                                    : String(val);
                                if (!q) return s || "-";
                                const idx = s.toLowerCase().indexOf(q);
                                if (idx === -1) return s || "-";
                                return (
                                  <>
                                    {s.substring(0, idx)}
                                    <mark className="bg-yellow-200 px-1 rounded">
                                      {s.substring(idx, idx + q.length)}
                                    </mark>
                                    {s.substring(idx + q.length)}
                                  </>
                                );
                              };
                              return (
                                <>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                          {ordered.map((col) => (
                                            <th
                                              key={col}
                                              className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                              onClick={() => toggleSort(col)}
                                            >
                                              <div className="flex items-center gap-2">
                                                <span>{col}</span>
                                                {sortColumn === col && (
                                                  <span className="text-blue-500">
                                                    {sortDirection === "asc" ? "↑" : "↓"}
                                                  </span>
                                                )}
                                              </div>
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {paginatedRows.map((r, ridx) => (
                                          <tr
                                            key={ridx}
                                            className="hover:bg-gray-50 transition-colors"
                                          >
                                            {ordered.map((col) => {
                                              const val = r[col];
                                              if (
                                                col === "datetime" ||
                                                col === "date"
                                              )
                                                return (
                                                  <td
                                                    key={col}
                                                    className="px-4 py-3 text-gray-700 font-medium"
                                                  >
                                                    {formatDate(val)}
                                                  </td>
                                                );
                                              if (
                                                col === "signal" ||
                                                col === "Trade_Signal"
                                              ) {
                                                const badge = getSignalBadge(
                                                  String(val || "")
                                                );
                                                return (
                                                  <td key={col} className="px-4 py-3">
                                                    <span
                                                      className={`px-3 py-1 rounded-full text-xs font-medium ${badge.cls}`}
                                                    >
                                                      {badge.text}
                                                    </span>
                                                  </td>
                                                );
                                              }
                                              if (
                                                col === "price" ||
                                                col === "close" ||
                                                col === "close_price"
                                              )
                                                return (
                                                  <td
                                                    key={col}
                                                    className="px-4 py-3 font-semibold text-gray-900"
                                                  >
                                                    {val
                                                      ? `NT$ ${formatNumber(val)}`
                                                      : "-"}
                                                  </td>
                                                );
                                              return (
                                                <td
                                                  key={col}
                                                  className="px-4 py-3 text-gray-700"
                                                >
                                                  {renderCellValue(val)}
                                                </td>
                                              );
                                            })}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  {/* 分頁控制 */}
                                  {sorted.length > state.pageSize && (
                                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                      <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                          顯示 {startIdx + 1} - {endIdx} / {sorted.length} 筆結果
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            disabled={currentPage === 1}
                                            onClick={() =>
                                              setTableState(k, { page: currentPage - 1 })
                                            }
                                          >
                                            上一頁
                                          </button>
                                          <span className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg">
                                            第 {currentPage} / {totalPages} 頁
                                          </span>
                                          <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            disabled={currentPage === totalPages}
                                            onClick={() =>
                                              setTableState(k, { page: currentPage + 1 })
                                            }
                                          >
                                            下一頁
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TradeSignalsPage;
