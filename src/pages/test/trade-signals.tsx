import React, { useState, useRef, useEffect } from "react";

const TradeSignalsPage: React.FC = () => {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const eventSourceRef = useRef<EventSource | null>(null);
  const [error, setError] = useState<string>("");
  const resultRef = useRef<HTMLPreElement | null>(null);
  const [showOutput, setShowOutput] = useState(true); // 控制命令輸出框顯示

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
      <button
        type="button"
        className="mb-6 px-4 py-2 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg text-base font-semibold shadow-sm flex items-center gap-2 transition-all duration-200"
        onClick={() => window.history.back()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        返回上一頁
      </button>
      <h1 className="text-4xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        進階交易訊號分析
      </h1>
      <p className="text-center text-gray-500 mb-6">只先做台股而已💤</p>
      <form
        className="flex flex-col sm:flex-row gap-2 mb-4 items-center justify-center"
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading && symbol) handleAnalyze();
        }}
      >
        <input
          type="text"
          className="flex-1 border-2 border-indigo-200 rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-indigo-400 outline-none shadow-sm transition-all duration-200 min-w-[180px]"
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
          className="w-32 px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-lg text-lg font-semibold disabled:opacity-60 text-center shadow-md transition-all duration-200"
          disabled={!symbol || loading}
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              分析中...
            </span>
          ) : (
            "分析"
          )}
        </button>
      </form>
      <div className="flex justify-center">
        <button
          type="button"
          className={`mb-2 px-4 py-1 rounded text-sm font-medium transition-all duration-200 border flex items-center gap-1 ${
            showOutput
              ? "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
              : "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200"
          }`}
          onClick={() => setShowOutput((prev) => !prev)}
          aria-expanded={showOutput}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              showOutput ? "rotate-90" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          {showOutput ? "隱藏命令輸出" : "顯示命令輸出"}
        </button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div
        className={`transition-all duration-500 overflow-hidden mt-4 rounded-lg shadow-inner border border-gray-200 bg-gray-50 ${
          showOutput ? "" : "ring-0"
        }`}
        style={{
          maxHeight: showOutput ? 520 : 0,
          opacity: showOutput ? 1 : 0,
        }}
      >
        <pre
          ref={resultRef}
          className="bg-gray-900 text-green-200 rounded-lg p-4 whitespace-pre-wrap text-sm max-h-[500px] overflow-auto font-mono border border-gray-700 w-full min-w-[320px]"
          style={{ minHeight: 120 }}
        >
          {result || (loading ? "分析即將開始..." : "請輸入股票代號並點擊分析")}
        </pre>
      </div>
      {/* 進階交易訊號分析面板 */}
      <div className="mt-10 p-6 bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-lg border border-indigo-100">
        <h2 className="text-xl font-bold mb-4 text-indigo-700 flex items-center gap-2">
          <span role="img" aria-label="advanced">
            🧠
          </span>
          進階交易訊號分析面板
        </h2>
        <div className="text-gray-600">
          {/* 這裡可以放進階分析內容、圖表或其他元件 */}
          <p className="italic text-indigo-400">
            （預留：未來可在此顯示更詳細的交易訊號分析結果、圖表或互動元件）
          </p>
        </div>
      </div>
    </div>
  );
};

export default TradeSignalsPage;
