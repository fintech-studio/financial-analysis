import React, { useState, useRef, useEffect } from "react";

// 參數與市場快速填入元件
const QuickFillPanel: React.FC<{
  loading: boolean;
  setSymbol: (cb: (prev: string) => string) => void;
  setSymbolDirect: (s: string) => void;
}> = ({ loading, setSymbol, setSymbolDirect }) => {
  const paramOptions = [
    { param: "--help", label: "顯示說明" },
    { param: "--indicators-only", label: "重新計算技術指標" },
    { param: "--expand-history", label: "獲取歷史資料" },
    { param: "--pattern", label: "重新辨識 K 線型態-歷史" },
    { param: "--show-all-stats", label: "顯示統計資訊" },
  ];
  const marketOptions = [
    { param: "--tw", label: "台股" },
    { param: "--us", label: "美股" },
    { param: "--etf", label: "ETF" },
    { param: "--index", label: "指數" },
    { param: "--forex", label: "外匯" },
    { param: "--crypto", label: "加密貨幣" },
    { param: "--futures", label: "期貨" },
  ];
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-2">
        {marketOptions.map(({ param, label }) => (
          <button
            key={param}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-medium border border-green-300 hover:bg-green-200 transition text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
            onClick={() => {
              setSymbol((prev) => {
                const marketParams = marketOptions.map((o) => o.param);
                const filtered = prev
                  .split(/\s+/)
                  .filter((p) => !marketParams.includes(p) && p !== "")
                  .join(" ");
                return filtered ? filtered + " " + param : param;
              });
            }}
            disabled={loading}
          >
            {param}{" "}
            <span className="text-[10px] text-green-400 ml-1">({label})</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {paramOptions.map(({ param, label }) => (
          <button
            key={param}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-medium border border-blue-300 hover:bg-blue-200 transition text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            onClick={() => setSymbolDirect(param)}
            disabled={loading}
          >
            {param}{" "}
            <span className="text-[10px] text-blue-400 ml-1">({label})</span>
          </button>
        ))}
      </div>
    </>
  );
};

// Log 輸出區塊
const LogBox = React.forwardRef<
  HTMLDivElement,
  { logs: string[]; error: string; loading: boolean; onCopy: () => void }
>(({ logs, error, loading, onCopy }, ref) => (
  <div
    ref={ref}
    className="bg-slate-900 rounded-2xl p-5 min-h-[320px] max-h-[600px] h-[600px] overflow-y-auto text-green-200 font-mono text-base whitespace-pre-wrap shadow-lg border-2 border-slate-700 outline-none relative scrollbar-hide"
    tabIndex={-1}
    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
  >
    <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    <button
      className="absolute right-4 top-4 px-2 py-1 text-xs bg-slate-800 text-slate-200 rounded hover:bg-slate-700 border border-slate-600 z-10"
      onClick={onCopy}
      style={{ opacity: logs.length > 0 ? 1 : 0.5 }}
      disabled={logs.length === 0}
    >
      複製全部
    </button>
    {logs.length === 0 && !error && !loading && (
      <span className="text-slate-500">輸出結果將顯示於此處...</span>
    )}
    {logs.map((line, idx) => (
      <div key={idx} className="break-all">
        {line}
      </div>
    ))}
    {loading && (
      <div className="absolute left-0 right-0 bottom-2 flex justify-center animate-pulse">
        <span className="text-blue-300 text-sm">執行中，請稍候...</span>
      </div>
    )}
    {error && (
      <details
        open
        className="text-red-400 font-bold mt-2 animate-pulse bg-slate-800 rounded p-2"
      >
        <summary>錯誤訊息 (點擊收合)</summary>
        <span className="break-all">{error}</span>
        <button
          className="ml-2 px-2 py-0.5 text-xs bg-red-700 text-white rounded hover:bg-red-600 border border-red-500"
          onClick={() => {
            navigator.clipboard.writeText(error);
          }}
        >
          複製錯誤
        </button>
      </details>
    )}
  </div>
));
LogBox.displayName = "LogBox";

const RunPython: React.FC = () => {
  const [symbol, setSymbol] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const eventSourceRef = useRef<EventSource | null>(null);
  const logBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  // 執行 Python
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

  // 清除輸入與狀態
  const handleClear = () => {
    setSymbol("");
    setError("");
    setLoading(false);
    if (eventSourceRef.current) eventSourceRef.current.close();
    inputRef.current?.focus();
  };

  // 支援 Enter+Ctrl 執行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey && symbol && !loading) {
      handleRunPython();
    }
  };

  // log 區塊自動滾動
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs, error, loading]);

  // 複製全部 log
  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // 貼上多行 symbol
  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setSymbol((prev) => (prev ? prev + " " + text : text));
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 pb-20">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-10 items-stretch">
        {/* 左側：操作區 */}
        <div className="flex-1 w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border border-blue-100 mb-8 lg:mb-0 min-h-[600px] h-[600px] flex flex-col">
          <h2 className="text-3xl font-extrabold text-blue-700 mb-2 text-center lg:text-left tracking-tight drop-shadow-sm">
            金融數據手動獲取 / 更新
          </h2>
          <p className="text-blue-500 text-center lg:text-left mb-6 text-base font-medium">
            抓取金融數據並存入 SQL SERVER。
            <a
              href="https://github.com/HaoXun97/technical-indicators"
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              查看程式碼
            </a>
          </p>
          <div className="mb-4">
            <label
              className="block text-blue-700 font-semibold mb-1"
              htmlFor="symbol-input"
            >
              輸入金融代號或參數
            </label>
            <div className="relative flex items-center">
              <textarea
                ref={inputRef}
                id="symbol-input"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="可輸入多個金融代號或參數，Enter換行，Ctrl+Enter執行"
                className="w-full px-5 py-3 rounded-xl border-2 border-blue-200 focus:ring-4 focus:ring-blue-200 focus:outline-none text-lg bg-blue-50 placeholder-blue-300 text-blue-900 shadow-md pr-16 transition-all duration-200 resize-vertical min-h-[48px] max-h-[120px]"
                disabled={loading}
                rows={2}
                spellCheck={false}
                autoFocus
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-blue-100 focus:outline-none"
                tabIndex={-1}
                aria-label="貼上"
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
              {symbol && !loading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-blue-100 focus:outline-none"
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
          </div>
          <div className="mb-4 mt-4">
            <span className="block text-xs text-slate-400 mb-1">
              市場/參數選項
            </span>
            <QuickFillPanel
              loading={loading}
              setSymbol={setSymbol}
              setSymbolDirect={setSymbol}
            />
          </div>
          <div className="flex gap-4 mt-auto">
            <button
              onClick={handleRunPython}
              disabled={loading || !symbol}
              className={`flex-1 px-7 py-3 rounded-xl font-bold text-white text-lg transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 items-center ${
                loading || !symbol
                  ? "bg-blue-200 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
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
                "執行"
              )}
            </button>
            <button
              onClick={handleClear}
              disabled={loading && !symbol}
              className="px-7 py-3 rounded-xl font-bold text-blue-700 border border-blue-300 bg-white hover:bg-blue-50 transition-all duration-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              清除
            </button>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Ctrl+Enter 執行，支援多行輸入
          </div>
        </div>
        {/* 右側：LogBox 輸出結果 */}
        <div className="w-full lg:w-[640px] flex-shrink-0 min-h-[600px] h-[600px]">
          <LogBox
            ref={logBoxRef}
            logs={logs}
            error={error}
            loading={loading}
            onCopy={handleCopyLogs}
          />
          {copied && (
            <div className="absolute right-8 top-8 bg-green-600 text-white px-3 py-1 rounded shadow text-xs animate-fade-in-out">
              已複製
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RunPython;
