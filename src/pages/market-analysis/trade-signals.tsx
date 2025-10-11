import React, { useState, useEffect, useRef } from "react";
import Footer from "@/components/Layout/Footer";
import { DatabaseService, DatabaseConfig } from "@/services/DatabaseService";

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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm text-gray-500">總筆數</div>
          <div className="text-2xl font-bold">{total.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm text-gray-500">最新時間</div>
          <div className="text-lg font-semibold">{formatDate(latestDate)}</div>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm text-gray-500">最新收盤價</div>
          <div className="text-lg font-semibold">
            {latestPrice ? `NT$ ${latestPrice}` : "-"}
          </div>
        </div>
        <div className="p-4 bg-white border rounded-lg flex flex-col justify-between">
          <div className="text-sm text-gray-500">當前訊號</div>
          <div className="mt-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                getSignalBadge(currentSignal).cls
              }`}
            >
              {getSignalBadge(currentSignal).text}
            </span>
          </div>
        </div>
        {(buyCount || sellCount) && (
          <div className="sm:col-span-4 p-4 bg-white border rounded-lg">
            <div className="text-sm text-gray-500">訊號平均分數</div>
            <div className="flex gap-6 mt-2">
              <div className="text-sm">
                多頭：
                <span className="font-semibold text-green-600">
                  {buyAverage.toFixed(2)}
                </span>
              </div>
              <div className="text-sm">
                空頭：
                <span className="font-semibold text-red-600">
                  {sellAverage.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
                    className="px-3 py-1 bg-white border rounded text-sm"
                    onClick={() => handleExport(k)}
                  >
                    匯出 CSV
                  </button>
                  <div className="text-sm text-gray-500">
                    共 {rows.length} 筆
                  </div>
                </div>
              </div>

              {rows.length > 0 && renderSummary(rows)}

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
