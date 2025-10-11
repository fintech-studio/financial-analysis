import React, { useState, useEffect, useRef } from "react";
import Footer from "@/components/Layout/Footer";
import { DatabaseService, DatabaseConfig } from "@/services/DatabaseService";
import {
  FiClock,
  FiBarChart2,
  FiActivity,
  FiArrowUp,
  FiArrowDown,
  FiDownload,
} from "react-icons/fi";

type SignalRow = Record<string, unknown>;

function formatDate(val?: unknown) {
  if (!val) return "";
  const d = new Date(String(val));
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleString();
}

function getSignalBadge(signal?: string) {
  if (!signal) return { text: "無訊號", cls: "bg-gray-100 text-gray-700" };
  if (signal.includes("買"))
    return { text: signal, cls: "bg-green-50 text-green-700" };
  if (signal.includes("賣"))
    return { text: signal, cls: "bg-red-50 text-red-700" };
  return { text: signal, cls: "bg-indigo-50 text-indigo-700" };
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

const SignalBadgeSmall: React.FC<{ signal?: string }> = ({ signal }) => {
  const sig = signal || "";
  const isBuy = sig.includes("買");
  const isSell = sig.includes("賣");
  const bg = isBuy
    ? "bg-green-50 text-green-700"
    : isSell
    ? "bg-red-50 text-red-700"
    : "bg-indigo-50 text-indigo-700";
  const dotColor = isBuy ? "#16a34a" : isSell ? "#dc2626" : "#4f46e5";
  const Icon = isBuy ? FiArrowUp : isSell ? FiArrowDown : FiActivity;
  return (
    <span
      className={`inline-flex items-center gap-2 ${bg} px-3 py-1 rounded-full text-sm font-medium shadow-sm`}
    >
      <span className="inline-flex items-center justify-center rounded-full bg-white/60 p-1">
        <Icon className="text-xs" style={{ color: dotColor }} />
      </span>
      <span className="ml-1">{sig || "無訊號"}</span>
    </span>
  );
};

const MiniSparkline: React.FC<{ values: number[]; className?: string }> = ({
  values,
  className,
}) => {
  if (!values || values.length === 0) return <div className={className}>-</div>;
  const w = 120;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  const pathD = `M${pts.join(" L")}`;
  const last = values[values.length - 1];
  const trendColor = last >= values[0] ? "#059669" : "#dc2626";
  return (
    <svg width={w} height={h} className={className} viewBox={`0 0 ${w} ${h}`}>
      <path
        d={pathD}
        fill="none"
        stroke={trendColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const TradeSignalsPage: React.FC = () => {
  const [symbol, setSymbol] = useState("");
  const [timeframe, setTimeframe] = useState<"1d" | "1h" | "both">("1d");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [results, setResults] = useState<{ [k: string]: SignalRow[] }>({});
  const [tableStates, setTableStates] = useState<{
    [k: string]: {
      visible: boolean;
      search: string;
      page: number;
      pageSize: number;
    };
  }>({});
  const resultRef = useRef<HTMLDivElement | null>(null);

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

  const sanitizeSymbol = (s: string) =>
    s.replace(/[^0-9A-Za-z]/g, "").toUpperCase();

  const handleSearch = async () => {
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
        database: "market_stock_tw",
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
  };

  const handleExport = (key: string) => {
    const rows = results[key] || [];
    const csv = toCSV(rows);
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${symbol || "symbol"}_${key}_trade_signals.csv`;
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
    const deltaAbs = sparkValues.length > 0 ? sparkLast - sparkFirst : 0;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
        <div className="sm:col-span-3 p-4 bg-white border rounded-lg shadow-sm flex items-center gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FiBarChart2 className="text-lg" />
          </div>
          <div>
            <div className="text-sm text-gray-500">總筆數</div>
            <div className="text-2xl font-bold">{total.toLocaleString()}</div>
          </div>
        </div>

        <div className="sm:col-span-3 p-4 bg-white border rounded-lg shadow-sm flex items-center gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
            <FiClock className="text-lg" />
          </div>
          <div>
            <div className="text-sm text-gray-500">最新時間</div>
            <div className="text-lg font-semibold">
              {formatDate(latestDate)}
            </div>
          </div>
        </div>

        <div className="sm:col-span-3 p-4 bg-white border rounded-lg shadow-sm flex flex-col justify-between">
          <div className="text-sm text-gray-500">當前訊號</div>
          <div className="mt-2">
            <div className="flex items-center gap-3">
              <SignalBadgeSmall signal={currentSignal} />
              <div className="text-xs text-gray-500">
                {currentSignal ? "最新訊號" : "暫無訊號"}
              </div>
            </div>
          </div>
        </div>

        <div className="sm:col-span-3 p-4 bg-white border rounded-lg shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">最新收盤價</div>
            <div
              className={`text-sm font-semibold ${
                sparkDeltaPct >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {sparkDeltaPct >= 0 ? "▲" : "▼"}{" "}
              {Math.abs(sparkDeltaPct).toFixed(2)}%
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">
                {latestPrice ? `NT$ ${formatNumber(latestPrice)}` : "-"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                變動{" "}
                {deltaAbs
                  ? `${deltaAbs.toLocaleString()} (${sparkDeltaPct.toFixed(
                      2
                    )}%)`
                  : "-"}
              </div>
            </div>
            <div className="w-36">
              <MiniSparkline values={sparkValues} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // additional computed insights for each result set
  const computeInsights = (rows: SignalRow[]) => {
    const counts: Record<string, number> = {};
    const indicatorCounts: Record<string, number> = {};
    const timeline: Array<{
      date: string;
      price: string;
      signal?: string;
      strength?: string;
    }> = [];
    for (const r of rows.slice(0, 200)) {
      const sig = String(r["Trade_Signal"] ?? r["signal"] ?? "");
      if (sig) counts[sig] = (counts[sig] || 0) + 1;
      [
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
      ].forEach((k) => {
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
  };

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
          className="flex flex-col sm:flex-row gap-2 mb-6 items-center"
          onSubmit={(e) => {
            e.preventDefault();
            if (!loading) handleSearch();
          }}
        >
          <input
            type="text"
            className="flex-1 border-2 border-indigo-200 rounded-lg px-4 py-2 text-lg"
            placeholder="輸入股票代號 (如 2330 or 0050)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            maxLength={10}
            autoFocus
          />

          <select
            value={timeframe}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setTimeframe(e.target.value as "1d" | "1h" | "both")
            }
            className="px-3 py-2 border rounded-lg"
          >
            <option value="1d">日線 (trade_signals_1d)</option>
            <option value="1h">一小時 (trade_signals_1h)</option>
            <option value="both">兩者</option>
          </select>

          <button
            type="submit"
            className="w-32 px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-semibold"
            disabled={loading || !symbol}
          >
            {loading ? "查詢中..." : "查詢"}
          </button>
        </form>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="text-red-700 font-medium">錯誤</div>
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <div ref={resultRef} className="space-y-6">
          {Object.keys(results).length === 0 && !loading && (
            <div className="text-gray-500">
              尚未查詢，請輸入股票代號並按查詢。
            </div>
          )}

          {Object.entries(results).map(([k, rows]) => (
            <div
              key={k}
              className="bg-gray-50 border border-gray-100 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-semibold">
                  {k === "1d"
                    ? "日線 (trade_signals_1d)"
                    : "一小時 (trade_signals_1h)"}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="px-3 py-1 bg-white border rounded text-sm inline-flex items-center gap-2"
                    onClick={() => handleExport(k)}
                  >
                    <FiDownload className="text-sm" />
                    匯出 CSV
                  </button>
                  <div className="text-sm text-gray-500">
                    共 {rows.length} 筆
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 bg-white border rounded text-sm"
                    onClick={() =>
                      setTableState(k, { visible: !getTableState(k).visible })
                    }
                  >
                    {getTableState(k).visible ? "隱藏表格" : "顯示表格"}
                  </button>
                </div>
              </div>

              {rows.length > 0 && renderSummary(rows)}

              {/* insights */}
              {rows.length > 0 &&
                (() => {
                  const ins = computeInsights(rows);
                  const totalSignals = Object.values(ins.counts).reduce(
                    (s, v) => s + v,
                    0
                  );
                  return (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-white border rounded-lg">
                        <div className="flex items-center gap-2">
                          <FiActivity className="text-indigo-500" />
                          <div className="text-sm text-gray-500">訊號分布</div>
                        </div>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {Object.entries(ins.counts).length === 0 && (
                            <div className="text-sm text-gray-500">無</div>
                          )}
                          {Object.entries(ins.counts).map(([k, v]) => {
                            const pct = totalSignals
                              ? Math.round((v / totalSignals) * 100)
                              : 0;
                            const isBuy = k.includes("買");
                            const isSell = k.includes("賣");
                            const chipCls = isBuy
                              ? "bg-green-50 text-green-700"
                              : isSell
                              ? "bg-red-50 text-red-700"
                              : "bg-indigo-50 text-indigo-700";
                            return (
                              <div
                                key={k}
                                className={`text-sm border rounded px-2 py-1 flex items-center gap-3 ${chipCls}`}
                              >
                                <div className="font-semibold">{k}</div>
                                <div className="text-xs text-gray-600">
                                  {v} ({pct}%)
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-3 bg-white border rounded-lg">
                        <div className="flex items-center gap-2">
                          <FiBarChart2 className="text-indigo-500" />
                          <div className="text-sm text-gray-500">
                            指標出現次數（前200筆）
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          {ins.indicatorsSorted.slice(0, 8).map(([k, v]) => (
                            <div
                              key={k}
                              className="flex items-center justify-between"
                            >
                              <div className="text-gray-700">{k}</div>
                              <div className="text-indigo-600 font-semibold">
                                {v}
                              </div>
                            </div>
                          ))}
                          {ins.indicatorsSorted.length === 0 && (
                            <div className="text-gray-500">無指標資料</div>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-white border rounded-lg">
                        <div className="flex items-center gap-2">
                          <FiClock className="text-yellow-500" />
                          <div className="text-sm text-gray-500">
                            最近訊號時間線
                          </div>
                        </div>
                        <div className="mt-2 text-sm space-y-2 max-h-40 overflow-y-auto">
                          {ins.timeline.slice(0, 10).map((t, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between"
                            >
                              <div className="text-xs text-gray-500">
                                {t.date}
                              </div>
                              <div className="text-xs">{t.price}</div>
                              <div className="ml-2">
                                <SignalBadgeSmall signal={t.signal} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {rows.length === 0 ? (
                <div className="text-sm text-gray-500">查無資料</div>
              ) : (
                getTableState(k).visible && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="search"
                        placeholder="搜尋列（含 signal / datetime / price）"
                        className="border rounded px-2 py-1 text-sm w-64"
                        value={getTableState(k).search}
                        onChange={(e) =>
                          setTableState(k, { search: e.target.value, page: 1 })
                        }
                      />
                      <label className="text-sm text-gray-500">每頁</label>
                      <select
                        value={getTableState(k).pageSize}
                        className="border rounded px-2 py-1 text-sm"
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
                      <table className="w-full table-auto text-sm bg-white border">
                        <thead>
                          <tr className="text-left bg-gray-100">
                            {(() => {
                              const first = rows[0];
                              const cols = Object.keys(first);
                              const preferred = [
                                "datetime",
                                "date",
                                "signal",
                                "strength",
                                "price",
                                "close",
                                "buySignals",
                                "sellSignals",
                              ];
                              const ordered = [
                                ...preferred.filter((p) => cols.includes(p)),
                                ...cols.filter((c) => !preferred.includes(c)),
                              ];
                              return ordered.map((col) => (
                                <th key={col} className="px-2 py-2 border-b">
                                  {col}
                                </th>
                              ));
                            })()}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r, idx) => {
                            const first = rows[0];
                            const cols = Object.keys(first);
                            const preferred = [
                              "datetime",
                              "date",
                              "signal",
                              "strength",
                              "price",
                              "close",
                              "buySignals",
                              "sellSignals",
                            ];
                            const ordered = [
                              ...preferred.filter((p) => cols.includes(p)),
                              ...cols.filter((c) => !preferred.includes(c)),
                            ];
                            return (
                              <tr
                                key={idx}
                                className="odd:bg-gray-50 hover:bg-gray-50"
                              >
                                {ordered.map((col) => {
                                  const val = r[col];
                                  if (col === "datetime" || col === "date")
                                    return (
                                      <td
                                        key={col}
                                        className="px-2 py-2 align-top"
                                      >
                                        {formatDate(val)}
                                      </td>
                                    );
                                  if (col === "signal") {
                                    const badge = getSignalBadge(
                                      String(val || "")
                                    );
                                    return (
                                      <td
                                        key={col}
                                        className="px-2 py-2 align-top"
                                      >
                                        <span
                                          className={`px-2 py-1 rounded-full text-sm font-medium ${badge.cls}`}
                                        >
                                          {badge.text}
                                        </span>
                                      </td>
                                    );
                                  }
                                  if (col === "price" || col === "close")
                                    return (
                                      <td
                                        key={col}
                                        className="px-2 py-2 align-top"
                                      >
                                        {val ? `NT$ ${val}` : ""}
                                      </td>
                                    );
                                  return (
                                    <td
                                      key={col}
                                      className="px-2 py-2 align-top"
                                    >
                                      {val === null || val === undefined
                                        ? ""
                                        : String(val)}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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
