import React, { useState, useEffect, useRef } from "react";
import Footer from "@/components/Layout/Footer";
import { DatabaseService, DatabaseConfig } from "@/services/DatabaseService";
import {
  FiClock,
  FiTrendingUp,
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
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [results]);

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
      // The server-side API will fall back to environment variables when user/server/password
      // are not provided. To satisfy the TypeScript type, provide empty strings for those fields.
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

    // compute average buy/sell if fields exist
    let buyAvg = 0;
    let sellAvg = 0;
    let buyCount = 0;
    let sellCount = 0;
    for (const r of rows) {
      const b = Number(r["buySignals"] ?? r["Buy_Signals"] ?? r["buy"] ?? 0);
      const s = Number(r["sellSignals"] ?? r["Sell_Signals"] ?? r["sell"] ?? 0);
      if (!isNaN(b) && b > 0) {
        buyAvg += b;
        buyCount++;
      }
      if (!isNaN(s) && s > 0) {
        sellAvg += s;
        sellCount++;
      }
    }
    const buyAverage = buyCount ? buyAvg / buyCount : 0;
    const sellAverage = sellCount ? sellAvg / sellCount : 0;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 mb-4">
        <div className="p-4 bg-gradient-to-r from-white to-gray-50 border rounded-lg shadow-sm flex items-center gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FiBarChart2 />
          </div>
          <div>
            <div className="text-sm text-gray-500">總筆數</div>
            <div className="text-2xl font-bold">{total.toLocaleString()}</div>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-white to-gray-50 border rounded-lg shadow-sm flex items-center gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
            <FiClock />
          </div>
          <div>
            <div className="text-sm text-gray-500">最新時間</div>
            <div className="text-lg font-semibold">
              {formatDate(latestDate)}
            </div>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-white to-gray-50 border rounded-lg shadow-sm flex items-center gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <FiTrendingUp />
          </div>
          <div>
            <div className="text-sm text-gray-500">最新收盤價</div>
            <div className="text-lg font-semibold">
              {latestPrice ? `NT$ ${latestPrice}` : "-"}
            </div>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-white to-gray-50 border rounded-lg shadow-sm flex flex-col justify-between">
          <div className="text-sm text-gray-500">當前訊號</div>
          <div className="mt-2">
            <SignalBadgeSmall signal={currentSignal} />
          </div>
        </div>
        <div className="sm:col-span-2 p-4 bg-white border rounded-lg">
          <div className="text-sm text-gray-500">近期走勢</div>
          <div className="mt-2 flex items-center justify-between">
            <MiniSparkline
              values={rows
                .slice(0, 40)
                .map((r) => Number(r["close_price"] ?? r["close"]) || 0)
                .filter((v) => v > 0)}
            />
            <div className="text-right ml-4">
              <div className="text-sm text-gray-500">最新</div>
              <div className="font-semibold">{formatNumber(latestPrice)}</div>
            </div>
          </div>
        </div>
        {(buyCount || sellCount) && (
          <div className="sm:col-span-6 p-4 bg-white border rounded-lg">
            <div className="text-sm text-gray-500">訊號平均分數</div>
            <div className="flex gap-6 mt-2 items-center">
              <div className="text-sm flex-1">
                多頭：
                <div className="w-full bg-gray-100 rounded-full h-3 mt-2 overflow-hidden">
                  <div
                    className="h-3 bg-green-500"
                    style={{ width: `${Math.min(100, buyAverage * 10)}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {buyAverage.toFixed(2)}
                </div>
              </div>
              <div className="text-sm flex-1">
                空頭：
                <div className="w-full bg-gray-100 rounded-full h-3 mt-2 overflow-hidden">
                  <div
                    className="h-3 bg-red-500"
                    style={{ width: `${Math.min(100, sellAverage * 10)}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {sellAverage.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
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
      // count indicators: look for known indicator fields that are truthy
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
        ) {
          indicatorCounts[k] = (indicatorCounts[k] || 0) + 1;
        }
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
                <div className="overflow-x-auto">
                  <table className="w-full table-auto text-sm bg-white border">
                    <thead>
                      <tr className="text-left bg-gray-100">
                        {/* 使用常見欄位排序：datetime, signal, strength, price, buy/sell */}
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
                              if (col === "datetime" || col === "date") {
                                return (
                                  <td key={col} className="px-2 py-2 align-top">
                                    {formatDate(val)}
                                  </td>
                                );
                              }
                              if (col === "signal") {
                                const badge = getSignalBadge(String(val || ""));
                                return (
                                  <td key={col} className="px-2 py-2 align-top">
                                    <span
                                      className={`px-2 py-1 rounded-full text-sm font-medium ${badge.cls}`}
                                    >
                                      {badge.text}
                                    </span>
                                  </td>
                                );
                              }
                              if (col === "price" || col === "close") {
                                return (
                                  <td key={col} className="px-2 py-2 align-top">
                                    {val ? `NT$ ${val}` : ""}
                                  </td>
                                );
                              }
                              return (
                                <td key={col} className="px-2 py-2 align-top">
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
