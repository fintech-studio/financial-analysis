import React, { useState, useRef, useEffect } from "react";

const QuickFillButtons = ({
  loading,
  setSymbol,
}: {
  loading: boolean;
  setSymbol: (s: string) => void;
}) => (
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
);

const LogBox = React.forwardRef<HTMLDivElement, { logs: string[]; error: string }>(
  ({ logs, error }, ref) => (
    <div
      ref={ref}
      className="bg-blue-50 rounded-lg p-4 min-h-[120px] max-h-72 overflow-y-auto text-blue-700 font-mono text-sm whitespace-pre-wrap shadow-inner border border-blue-200"
      tabIndex={-1}
    >
      {logs.length === 0 && !error && (
        <span className="text-blue-300">輸出結果將顯示於此...</span>
      )}
      {logs.map((line, idx) => (
        <div key={idx}>{line}</div>
      ))}
      {error && (
        <div className="text-red-500 font-bold mt-2 animate-pulse">錯誤：{error}</div>
      )}
    </div>
  )
);
LogBox.displayName = "LogBox";

const RunPython: React.FC = () => {
  const [symbol, setSymbol] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const eventSourceRef = useRef<EventSource | null>(null);
  const logBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    es.onerror = () => {
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

  const handleClear = () => {
    setSymbol("");
    setLogs([]);
    setError("");
    setLoading(false);
    if (eventSourceRef.current) eventSourceRef.current.close();
    inputRef.current?.focus();
  };

  // 支援 Enter 鍵執行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && symbol && !loading) {
      handleRunPython();
    }
  };

  // log 區塊自動滾動
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs, error]);

  // 執行時自動 focus 到 log 區塊
  useEffect(() => {
    if (loading && logBoxRef.current) {
      logBoxRef.current.focus();
    }
  }, [loading]);

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
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="請輸入金融代號或參數"
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-200 focus:outline-none text-lg bg-blue-50 placeholder-blue-300 text-blue-900 shadow-sm pr-10"
              disabled={loading}
              autoFocus
            />
            {symbol && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-blue-200 focus:outline-none"
                tabIndex={-1}
                aria-label="清除輸入"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={handleRunPython}
            disabled={loading || !symbol}
            className={`w-32 px-6 py-2 rounded-lg font-semibold text-white text-lg transition-all duration-200 shadow-md ${
              loading || !symbol
                ? "bg-blue-200 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">執行中...</span>
            ) : (
              "執行"
            )}
          </button>
        </div>
        <QuickFillButtons loading={loading} setSymbol={setSymbol} />
        <LogBox ref={logBoxRef} logs={logs} error={error} />
      </div>
    </div>
  );
};

export default RunPython;
