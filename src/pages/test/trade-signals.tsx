import React, { useState, useRef, useEffect } from "react";

const TradeSignalsPage: React.FC = () => {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const eventSourceRef = useRef<EventSource | null>(null);
  const [error, setError] = useState<string>("");
  const resultRef = useRef<HTMLPreElement | null>(null);

  const handleAnalyze = () => {
    setLoading(true);
    setResult("");
    setError("");
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const es = new EventSource(
      `/api/test/trade-signals?symbol=${encodeURIComponent(symbol)}`
    );
    eventSourceRef.current = es;
    es.onmessage = (e) => {
      setResult((prev) => prev + (prev ? "\n" : "") + e.data);
    };
    es.addEventListener("end", () => {
      setLoading(false);
      es.close();
    });
    es.onerror = () => {
      setError("串流連線失敗或中斷");
      setLoading(false);
      es.close();
    };
  };

  // 自動捲動到最底
  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [result]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <span role="img" aria-label="signal">
          📈
        </span>{" "}
        進階交易訊號分析
      </h1>
      <form
        className="flex gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading && symbol) handleAnalyze();
        }}
      >
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2 text-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          placeholder="請輸入股票代號 (如 2330)"
          value={symbol}
          onChange={(e) =>
            setSymbol(e.target.value.replace(/[^0-9A-Za-z]/g, ""))
          }
          disabled={loading}
          maxLength={10}
          autoFocus
        />
        <button
          type="submit"
          className="w-32 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-lg font-semibold disabled:opacity-60 text-center"
          disabled={!symbol || loading}
        >
          {loading ? "分析中..." : "分析"}
        </button>
      </form>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <pre
        ref={resultRef}
        className="bg-gray-900 text-green-200 rounded p-4 whitespace-pre-wrap text-sm mt-4 max-h-[500px] overflow-auto shadow-inner font-mono transition-all duration-300 border border-gray-700 w-full min-w-[600px]"
        style={{ minHeight: 120 }}
      >
        {result || (loading ? "分析即將開始..." : "請輸入股票代號並點擊分析")}
      </pre>
      {/* 分析 catlog 區塊 */}
    </div>
  );
};

export default TradeSignalsPage;
