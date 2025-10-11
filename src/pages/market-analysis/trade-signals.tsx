import React, { useState, useEffect, useRef, useCallback } from "react";
import Footer from "@/components/Layout/Footer";
import { DatabaseService, DatabaseConfig } from "@/services/DatabaseService";
import { FiDownload } from "react-icons/fi";
import { SignalIcon } from "@heroicons/react/24/outline";

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
  <div className="space-y-4">
    {[1, 2].map((i) => (
      <div key={i} className="p-3 rounded bg-gray-100">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
        <div className="h-28 bg-gray-200 rounded animate-pulse"></div>
      </div>
    ))}
  </div>
);

const SignalBadgeSmall: React.FC<{ signal?: string }> = ({ signal }) => {
  const sig = signal || "";
  const badge = getSignalBadge(sig);
  return (
    <span
      className={`inline-block px-3 py-1 text-sm rounded-full border ${badge.cls}`}
    >
      {badge.text}
    </span>
  );
};

// MiniSparkline intentionally removed for minimal style; keep function available if needed later

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
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (resultRef.current)
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
  }, [results]);

  // keep tableStates in sync with result keys
  useEffect(() => {
    const keys = Object.keys(results);
    setTableStates((prev) => {
      const next = { ...prev };
      keys.forEach((k) => {
        if (!next[k])
          next[k] = { visible: true, search: "", page: 1, pageSize: 10 };
      });
      // remove stale keys
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
    patch: Partial<{
      visible: boolean;
      search: string;
      page: number;
      pageSize: number;
    }>
  ) => {
    setTableStates((prev) => ({
      ...prev,
      [k]: { ...getTableState(k), ...patch },
    }));
  };

  const sanitizeSymbol = useCallback(
    (s: string) => {
      // allow different symbol character sets per database
      if (dbName === "market_crypto") {
        // crypto symbols may contain -, /, . or lowercase letters
        // use RegExp constructor to avoid escaping the forward-slash in a literal
        return s
          .replace(new RegExp("[^0-9A-Za-z_/.\\-]", "g"), "")
          .toUpperCase();
      }
      // default: stock symbols - only alphanumeric
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
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-6 text-gray-800">
        <div className="sm:col-span-3 p-3 border rounded">
          <div className="text-xs text-gray-500">總筆數</div>
          <div className="text-lg font-semibold">{total.toLocaleString()}</div>
        </div>

        <div className="sm:col-span-3 p-3 border rounded">
          <div className="text-xs text-gray-500">最新時間</div>
          <div className="text-sm">{formatDate(latestDate)}</div>
        </div>

        <div className="sm:col-span-3 p-3 border rounded">
          <div className="text-xs text-gray-500">當前訊號</div>
          <div className="mt-2">
            <SignalBadgeSmall signal={currentSignal} />
          </div>
        </div>

        <div className="sm:col-span-3 p-3 border rounded">
          <div className="text-xs text-gray-500">最新收盤價</div>
          <div className="text-sm font-medium">
            {latestPrice ? `NT$ ${formatNumber(latestPrice)}` : "-"}
          </div>
          <div className="text-xs text-gray-500">
            {sparkDeltaPct ? `${sparkDeltaPct.toFixed(2)}%` : "-"}
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
        {/* subtle grid background */}

        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
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
                  <p className="text-blue-100 mt-3 text-lg font-medium">
                    提供股票與加密貨幣等等的交易訊號查詢與分析工具。
                  </p>
                </div>
              </div>
              <p className="text-blue-100 text-lg max-w-3xl leading-relaxed">
                查詢並分析技術指標產生的交易訊號，協助投資人做出更明智的交易決策。
              </p>
            </div>

            <div className="flex flex-col lg:items-end space-y-4">
              <div className="grid grid-cols-1 gap-6 lg:gap-8">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-3xl font-bold text-white">買賣建議</div>
                  <div className="text-blue-200 text-sm font-medium">
                    Trade Signals
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-10 px-4">
        <form
          className="flex flex-col sm:flex-row gap-3 mb-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) handleSearch();
          }}
        >
          <div className="flex-1">
            <input
              type="text"
              className="w-full border-2 border-indigo-200 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="輸入股票代號 (如 2330 or 0050)"
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
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="1d">📊 日線</option>
            <option value="1h">⏰ 一小時</option>
            <option value="both">📈 兩者</option>
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
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            title="選擇查詢的資料庫"
          >
            <option value="market_stock_tw">🇹🇼 market_stock_tw</option>
            <option value="market_stock_us">🇺🇸 market_stock_us</option>
            <option value="market_crypto">🌐 market_crypto</option>
            <option value="market_forex">💱 market_forex</option>
            <option value="market_etf">📊 market_etf</option>
            <option value="market_futures">📈 market_futures</option>
            <option value="market_index">📉 market_index</option>
          </select>

          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            disabled={loading || !symbol}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                查詢中...
              </span>
            ) : (
              "🔍 查詢"
            )}
          </button>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm animate-pulse">
            <div className="flex items-start gap-3">
              <div className="text-red-500 text-xl">⚠️</div>
              <div>
                <div className="text-red-700 font-semibold mb-1">查詢錯誤</div>
                <div className="text-sm text-red-600">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div ref={resultRef} className="space-y-6">
          {loading && <SkeletonLoader />}

          {Object.keys(results).length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">🔍</div>
              <div className="text-gray-500">
                尚未查詢，請輸入股票代號並按查詢。
              </div>
            </div>
          )}

          {!loading &&
            Object.entries(results).map(([k, rows]) => (
              <div
                key={k}
                className="bg-gray-50 border border-gray-100 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      {k === "1d" ? "📊" : "⏰"}
                      {k === "1d" ? "日線交易訊號" : "小時線交易訊號"}
                    </h2>
                    <div className="text-sm text-gray-500 mt-1">
                      {k === "1d" ? "trade_signals_1d" : "trade_signals_1h"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold">
                      共 {rows.length.toLocaleString()} 筆
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-white hover:bg-green-50 border border-green-200 rounded-lg text-sm inline-flex items-center gap-2 text-green-700 font-semibold shadow-sm transition-all hover:shadow"
                      onClick={() => handleExport(k)}
                    >
                      <FiDownload className="text-base" />
                      匯出 CSV
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-white hover:bg-gray-50 border rounded-lg text-sm font-semibold transition-all"
                      onClick={() =>
                        setTableState(k, { visible: !getTableState(k).visible })
                      }
                    >
                      {getTableState(k).visible ? "👁️ 隱藏" : "👁️ 顯示"}
                    </button>
                  </div>
                </div>

                {rows.length > 0 && renderSummary(rows)}

                {/* insights */}
                {rows.length > 0 &&
                  (() => {
                    const ins = computeInsights(rows);
                    const sigEntries = Object.entries(ins.counts).sort(
                      (a, b) => b[1] - a[1]
                    );

                    return (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* 訊號分布 */}
                        <div className="p-4 border rounded bg-white shadow-sm sm:col-span-1">
                          <div className="text-sm text-gray-500 mb-2">
                            訊號分布
                          </div>
                          {sigEntries.length === 0 ? (
                            <div className="text-sm text-gray-400">無</div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {sigEntries.map(([s, cnt]) => {
                                const badge = getSignalBadge(String(s));
                                return (
                                  <div
                                    key={s}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm"
                                  >
                                    <span
                                      className={`${badge.cls} px-2 py-0.5 rounded-full text-xs`}
                                    >
                                      {badge.text}
                                    </span>
                                    <span className="text-gray-600 text-xs">
                                      {cnt}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* 熱門指標 */}
                        <div className="p-4 border rounded bg-white shadow-sm sm:col-span-2">
                          <div className="text-sm text-gray-500 mb-2">
                            指標出現次數（前200筆）
                          </div>
                          {ins.indicatorsSorted.length === 0 ? (
                            <div className="text-sm text-gray-400">無</div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {ins.indicatorsSorted
                                .slice(0, 12)
                                .map(([k, v]) => (
                                  <div
                                    key={k}
                                    className="flex items-center justify-between px-2 py-1 rounded"
                                  >
                                    <div className="text-gray-700">{k}</div>
                                    <div className="text-blue-600 font-semibold">
                                      {v}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>

                        {/* 最近訊號時間線 */}
                        <div className="p-4 border rounded bg-white shadow-sm sm:col-span-3">
                          <div className="text-sm text-gray-500 mb-2">
                            最近訊號時間線
                          </div>
                          {ins.timeline.length === 0 ? (
                            <div className="text-sm text-gray-400">無</div>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-auto">
                              {ins.timeline.slice(0, 8).map((t, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between gap-3"
                                >
                                  <div className="text-xs text-gray-500 w-48 truncate">
                                    {t.date}
                                  </div>
                                  <div className="flex-1 text-sm text-gray-700">
                                    {t.price}
                                  </div>
                                  <div className="ml-2">
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
                  <div className="text-sm text-gray-500">查無資料</div>
                ) : (
                  getTableState(k).visible && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <input
                          type="search"
                          placeholder="搜尋列（含 signal / datetime / price）"
                          className="border rounded px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={getTableState(k).search}
                          onChange={(e) =>
                            setTableState(k, {
                              search: e.target.value,
                              page: 1,
                            })
                          }
                        />
                        <label className="text-sm text-gray-500">每頁</label>
                        <select
                          value={getTableState(k).pageSize}
                          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onChange={(e) =>
                            setTableState(k, {
                              pageSize: Number(e.target.value),
                              page: 1,
                            })
                          }
                        >
                          {[10, 20, 50, 100].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="overflow-x-auto">
                        {(() => {
                          const state = getTableState(k);
                          const q = state.search.trim().toLowerCase();

                          // 過濾資料
                          const filtered = q
                            ? rows.filter((r) =>
                                Object.values(r).some((v) =>
                                  String(v ?? "")
                                    .toLowerCase()
                                    .includes(q)
                                )
                              )
                            : rows;

                          // 排序
                          const sorted = sortColumn
                            ? [...filtered].sort((a, b) => {
                                const va = a[sortColumn];
                                const vb = b[sortColumn];
                                // try numeric compare
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

                          // 分頁
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
                                <mark className="bg-yellow-100">
                                  {s.substring(idx, idx + q.length)}
                                </mark>
                                {s.substring(idx + q.length)}
                              </>
                            );
                          };

                          return (
                            <>
                              <table className="w-full table-auto text-sm bg-white border">
                                <thead>
                                  <tr className="text-left bg-white border-b">
                                    {ordered.map((col) => (
                                      <th
                                        key={col}
                                        className="px-3 py-2 text-xs text-gray-600 font-medium cursor-pointer select-none"
                                        onClick={() => toggleSort(col)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span>{col}</span>
                                          {sortColumn === col && (
                                            <span className="text-xs text-gray-400">
                                              {sortDirection === "asc"
                                                ? "▲"
                                                : "▼"}
                                            </span>
                                          )}
                                        </div>
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {paginatedRows.map((r, ridx) => (
                                    <tr
                                      key={ridx}
                                      className="odd:bg-gray-50 hover:bg-gray-100"
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
                                              className="px-3 py-2 align-top text-xs text-gray-700"
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
                                            <td
                                              key={col}
                                              className="px-3 py-2 align-top"
                                            >
                                              <span
                                                className={`px-2 py-1 rounded-full text-xs border ${badge.cls}`}
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
                                              className="px-3 py-2 align-top font-medium text-gray-800"
                                            >
                                              {val
                                                ? `NT$ ${formatNumber(val)}`
                                                : "-"}
                                            </td>
                                          );
                                        return (
                                          <td
                                            key={col}
                                            className="px-3 py-2 align-top text-gray-700"
                                          >
                                            {renderCellValue(val)}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </>
                          );
                        })()}
                      </div>

                      {/* 分頁控制 - 放在 overflow 容器外，避免跟著水平滾動 */}
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
                              if (!isNaN(na) && !isNaN(nb))
                                return sortDirection === "asc"
                                  ? na - nb
                                  : nb - na;
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

                        return (
                          sorted.length > state.pageSize && (
                            <div className="flex items-center justify-between mt-3 px-2">
                              <div className="text-sm text-gray-600">
                                顯示 {startIdx + 1} - {endIdx} / {sorted.length}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                                  disabled={currentPage === 1}
                                  onClick={() =>
                                    setTableState(k, { page: currentPage - 1 })
                                  }
                                >
                                  上一頁
                                </button>
                                <span className="text-sm text-gray-600">
                                  第 {currentPage} / {totalPages} 頁
                                </span>
                                <button
                                  type="button"
                                  className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                                  disabled={currentPage === totalPages}
                                  onClick={() =>
                                    setTableState(k, { page: currentPage + 1 })
                                  }
                                >
                                  下一頁
                                </button>
                              </div>
                            </div>
                          )
                        );
                      })()}
                    </div>
                  )
                )}
              </div>
            ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TradeSignalsPage;
