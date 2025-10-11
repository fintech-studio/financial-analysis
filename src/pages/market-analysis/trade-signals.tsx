import React, { useState, useEffect, useRef, useCallback } from "react";
import Footer from "@/components/Layout/Footer";
import { DatabaseService, DatabaseConfig } from "@/services/DatabaseService";
import { FiDownload } from "react-icons/fi";

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
    "market_stock_tw" | "market_stock_us" | "market_crypto"
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
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
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
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">交易訊號查詢</h1>
            <div className="text-sm text-gray-500">
              可查詢 `trade_signals_1d` 與 `trade_signals_1h`，並匯出 CSV
            </div>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg text-base font-semibold shadow-sm"
            onClick={() => window.history.back()}
          >
            ← 返回
          </button>
        </div>

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
              )
            }
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            title="選擇查詢的資料庫"
          >
            <option value="market_stock_tw">🇹🇼 market_stock_tw</option>
            <option value="market_stock_us">🇺🇸 market_stock_us</option>
            <option value="market_crypto">🌐 market_crypto</option>
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
                    return (
                      <div className="mt-4 grid grid-cols-1 gap-3">
                        <div className="p-3 border rounded text-sm text-gray-700">
                          訊號分布：
                          {Object.entries(ins.counts).length === 0
                            ? "無"
                            : Object.entries(ins.counts)
                                .map(([k, v]) => `${k}(${v})`)
                                .join("，")}
                        </div>
                        <div className="p-3 border rounded text-sm text-gray-700">
                          熱門指標：
                          {ins.indicatorsSorted.length === 0
                            ? "無"
                            : ins.indicatorsSorted
                                .slice(0, 6)
                                .map(([k, v]) => `${k}(${v})`)
                                .join("，")}
                        </div>
                        <div className="p-3 border rounded text-sm text-gray-700">
                          最近訊號：
                          {ins.timeline
                            .slice(0, 5)
                            .map(
                              (t) => `${t.date} ${t.price} ${t.signal || ""}`
                            )
                            .join("； ")}
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
