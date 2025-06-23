import React, { useState, useRef } from "react";

const RunPython: React.FC = () => {
  const [symbol, setSymbol] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleRunPython = () => {
    setLogs([]);
    setError("");
    setLoading(true);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const es = new EventSource(
      `/api/test/run-python?symbol=${encodeURIComponent(symbol)}`
    );
    eventSourceRef.current = es;
    es.onmessage = (e) => {
      setLogs((prev) => [...prev, e.data]);
    };
    es.onerror = (e) => {
      setError("串流連線錯誤或執行失敗");
      setLoading(false);
      es.close();
    };
    es.addEventListener("end", (e: MessageEvent) => {
      setLogs((prev) => [...prev, e.data]);
      setLoading(false);
      es.close();
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-8 pb-16">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
        <h2 className="text-3xl font-bold text-blue-800 mb-2 text-center">
          Python 腳本測試
        </h2>
        <p className="text-blue-500 text-center mb-8 text-base">
          獲取指定金融數據，並存入SQL SERVER。
          <a
            href="https://github.com/HaoXun97/technical-indicators"
            className="text-blue-500 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            程式碼
          </a>
        </p>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="請輸入股票代號"
            className="flex-1 px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-200 focus:outline-none text-lg bg-blue-50 placeholder-blue-300 text-blue-900 shadow-sm"
            disabled={loading}
          />
          <button
            onClick={handleRunPython}
            disabled={loading || !symbol}
            className={`px-6 py-2 rounded-lg font-semibold text-white text-lg transition-all duration-200 shadow-md ${
              loading || !symbol
                ? "bg-blue-200 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
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
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                執行中...
              </span>
            ) : (
              "執行 Python"
            )}
          </button>
        </div>
        {/* 快速填入按鈕區塊 */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {Object.entries({
            "--help": "顯示說明",
            "--indicators-only": "重新計算指標",
            "--expand-history": "獲取歷史",
            "--show-all-stats": "顯示統計",
          }).map(([param, label]) => (
            <button
              key={param}
              type="button"
              className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold border border-blue-200 hover:bg-blue-200 transition text-sm"
              onClick={() => setSymbol(param)}
              disabled={loading}
            >
              {param}{" "}
              <span className="text-xs text-blue-400 ml-1">({label})</span>
            </button>
          ))}
        </div>
        <div className="bg-blue-50 rounded-lg p-4 min-h-[120px] text-blue-700 font-mono text-sm whitespace-pre-wrap shadow-inner border border-blue-200">
          {logs.length === 0 && !error && (
            <span className="text-blue-300">輸出結果將顯示於此...</span>
          )}
          {logs.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
          {error && (
            <div className="text-red-500 font-semibold mt-2">錯誤：{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RunPython;
