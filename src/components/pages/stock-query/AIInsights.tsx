import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  ArrowPathIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type Props = {
  data?: unknown;
  symbol?: string;
  timeframe?: string;
  open_price?: number | null;
  high_price?: number | null;
  low_price?: number | null;
  close_price?: number | null;
  volume?: number | null;
  technicalData?: unknown;
  candlestickData?: unknown;
  nCandles?: number;
  // optional model name or api override
  model?: string;
  // optional small callback when analysis completes
  onComplete?: (insights: string) => void;
  // enable debug raw output toggle
  debug?: boolean;
};

const DEFAULT_MODEL = "fincoach";

function buildPrompt(
  data: unknown,
  opts?: {
    symbol?: string;
    timeframe?: string;
    open_price?: number | null;
    high_price?: number | null;
    low_price?: number | null;
    close_price?: number | null;
    volume?: number | null;
    technicalData?: unknown;
    candlestickData?: unknown;
    nCandles?: number;
  }
) {
  // Build a compact, informative prompt for the LLM based on provided data
  const header = `你是一位專業的金融分析 AI 助手，具備深厚的股票市場知識與量化分析能力。你的任務是根據使用者提供的股票數據（如：價格走勢、成交量、財報資訊、技術指標等），產出清晰、具可操作性的見解與分析。\n請遵守以下原則：\n專業精確：以金融分析師的角度撰寫，避免主觀臆測。\n結構化輸出：分析結果應包含以下區塊：\n- 趨勢摘要：描述當前市場走勢與情緒。\n- 技術面分析：根據技術指標（如 MA、RSI、MACD）說明潛在趨勢。\n- AI見解/風險提示：指出潛在風險與可能的市場變化。\n中立與合規：不提供投資建議或明確買賣指令，僅作為研究參考。\n可理解性：輸出語言應清晰、條理分明，適合一般投資者閱讀。\n你是一個樂於助人、尊重他人且誠實的人工智慧助理。\n請始終盡可能提供有幫助、安全且準確的回答，並使用繁體中文進行回覆。\n你的回覆不得包含任何有害、不道德、歧視性、具攻擊性、危險或違法的內容。\n請確保你的回答保持中立、公正，並以正面、建設性的方式呈現。\n若使用者的問題不具意義、邏輯不連貫或在事實上有錯誤，請禮貌地指出問題並說明原因，而非提供錯誤的答案。\n若你無法確定答案，請坦誠表示不知道，而不要提供虛構或不實的資訊。`;

  const body = (() => {
    if (!data && !opts) return "未提供資料，請說明資料不足。";
    if (Array.isArray(data)) {
      const sample = data.slice(-5).map((d) => {
        const item = d as Record<string, unknown>;
        const t = item.timestamp ? `@${String(item.timestamp)}` : "";
        const symbol = item.symbol ? String(item.symbol) : "";
        const price = item.price ?? "-";
        const change = item.change_percent ?? "-";
        const vol = item.volume ?? "-";
        return `${symbol} ${t} price=${price} change%=${change} vol=${vol}`;
      });
      return `最近資料（最多顯示 5 筆）：\n${sample.join("\n")}`;
    }
    const single = data as Record<string, unknown>;
    const symbol = single.symbol ? String(single.symbol) : opts?.symbol ?? "-";
    const price = single.price ?? opts?.close_price ?? "-";
    const change = single.change_percent ?? "-";
    const vol = single.volume ?? opts?.volume ?? "-";
    return `資料： symbol=${symbol} timeframe=${
      opts?.timeframe ?? "-"
    } price=${price} change%=${change} volume=${vol}`;
  })();

  const hint = opts?.symbol ? `（標的：${opts.symbol}）` : "";
  const extra = [] as string[];
  if (opts?.open_price != null)
    extra.push(
      `open=${opts.open_price}`,
      `high=${opts.high_price}`,
      `low=${opts.low_price}`,
      `close=${opts.close_price}`,
      `volume=${opts.volume}`
    );
  if (opts?.technicalData) extra.push("包含技術指標資料，請一併考量。");

  // include last N candlesticks if provided
  let candlesText = "";
  const n = opts?.nCandles ?? 0;
  if (n > 0 && Array.isArray(opts?.candlestickData)) {
    const cds = (opts?.candlestickData as unknown as unknown[]).slice(-n);
    const lines = cds.map((c) => {
      const ci = c as Record<string, unknown>;
      const date = (ci["date"] ?? ci["datetime"] ?? "-") as string;
      const o = (ci["open"] ?? ci["open_price"] ?? "-") as number | string;
      const h = (ci["high"] ?? "-") as number | string;
      const l = (ci["low"] ?? "-") as number | string;
      const cl = (ci["close"] ?? ci["close_price"] ?? "-") as number | string;
      const v = (ci["volume"] ?? "-") as number | string;
      return `${date},open=${o},high=${h},low=${l},close=${cl},volume=${v}`;
    });
    if (lines.length) {
      candlesText = `最後 ${
        lines.length
      } 根 K 線（最近到最遠，每行 format: date,open,high,low,close,volume）：\n${lines.join(
        "\n"
      )}`;
    }
  }

  return `${header}\n${hint}\n\n${body}\n\n${extra.join(
    " "
  )}\n\n${candlesText}\n\n請用繁體中文回答。`;
}

export default function AIInsights({
  data,
  symbol,
  timeframe,
  open_price,
  high_price,
  low_price,
  close_price,
  volume,
  technicalData,
  candlestickData,
  nCandles = 50,
  model = DEFAULT_MODEL,
  onComplete,
  debug = false,
}: Props) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState<boolean>(Boolean(debug));

  // abort previous request on new analysis
  const abortRef = useRef<AbortController | null>(null);
  const completedRef = useRef(false);
  const debounceRef = useRef<number | null>(null);

  // prepare prompt (memoized) and token estimate
  const symbolHintOuter = Array.isArray(data)
    ? ((data[0] as Record<string, unknown>)?.symbol as string | undefined)
    : ((data as Record<string, unknown>)?.symbol as string | undefined);
  // use provided nCandles prop or default to 50
  const effectiveNCandles = nCandles ?? 50;
  const prompt = useMemo(
    () =>
      buildPrompt(data, {
        symbol: symbolHintOuter ?? symbol,
        timeframe: timeframe,
        open_price: open_price ?? null,
        high_price: high_price ?? null,
        low_price: low_price ?? null,
        close_price: close_price ?? null,
        volume: volume ?? null,
        technicalData: technicalData,
        candlestickData: candlestickData,
        nCandles: effectiveNCandles,
      }),
    [
      data,
      symbolHintOuter,
      symbol,
      timeframe,
      open_price,
      high_price,
      low_price,
      close_price,
      volume,
      technicalData,
      candlestickData,
      effectiveNCandles,
    ]
  );
  const tokenEstimate = useMemo(
    () => (prompt ? Math.ceil(prompt.length / 4) : 0),
    [prompt]
  );

  useEffect(() => {
    // do nothing if no data
    if (!data) {
      setInsights(null);
      setError(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    abortRef.current = controller;

    async function analyze() {
      setLoading(true);
      setStreaming(false);
      setError(null);
      // do NOT clear previous insights here to avoid flicker while connecting

      // use memoized prompt (includes last N candlesticks)

      // Try the project's proxy endpoint first; use the same messages shape as ChatService
      // so the upstream /api/chat (Ollama) receives { model, messages: [...] }
      const payload = { model, messages: [{ role: "user", content: prompt }] };

      try {
        // First try internal API route which may proxy to Ollama
        let res = await fetch("/api/ollama-proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok) {
          // fallback to local Ollama HTTP API if available
          // some setups expose http://localhost:11434 or similar; try a simple alternative
          try {
            res = await fetch("http://localhost:11434/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              signal: controller.signal,
            });
          } catch {
            // ignore - will throw below if still not ok
          }
        }

        if (!res.ok) {
          const text = await res.text().catch(() => "(no body)");
          throw new Error(
            `分析請求失敗：${res.status} ${res.statusText} ${text}`
          );
        }

        // If response has a body (could be streaming), read it incrementally.
        if (!res.body) {
          const text = await res.text();
          if (!isMounted) return;
          setRaw(text);
          setInsights(text);
          setLoading(false);
          setStreaming(false);
          if (onComplete && !completedRef.current) {
            onComplete(text);
            completedRef.current = true;
          }
        } else {
          // stream reader: handle line-delimited JSON or plain SSE-like data
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let accumulated = "";
          let isFirstChunk = true;

          const extractContent = (obj: unknown): string | undefined => {
            if (!obj || typeof obj !== "object") return undefined;
            const o = obj as Record<string, unknown>;
            // case: { message: { content: "..." } }
            if (o.message && typeof o.message === "object") {
              const m = o.message as Record<string, unknown>;
              if (typeof m.content === "string") return m.content;
            }
            // case: { choices: [ { message: { content: "..." } } ] }
            if (Array.isArray(o.choices) && o.choices.length > 0) {
              const first = o.choices[0] as Record<string, unknown> | undefined;
              if (first && first.message && typeof first.message === "object") {
                const fm = first.message as Record<string, unknown>;
                if (typeof fm.content === "string") return fm.content;
              }
            }
            // case: { result: '...' } or { text: '...' }
            if (typeof o.result === "string") return o.result;
            if (typeof o.text === "string") return o.text;
            if (typeof o.output === "string") return o.output;
            return undefined;
          };

          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              if (!value) continue;
              buffer += decoder.decode(value, { stream: true });

              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const raw of lines) {
                const line = raw.trim();
                if (!line) continue;

                // try to parse JSON directly
                let parsed: unknown = undefined;
                try {
                  parsed = JSON.parse(line);
                } catch {
                  // if line starts with 'data:' try parse after prefix
                  if (line.startsWith("data:")) {
                    const after = line.replace(/^data:\s*/i, "");
                    try {
                      parsed = JSON.parse(after);
                    } catch {
                      parsed = undefined;
                    }
                  }
                }

                if (parsed) {
                  const chunk = extractContent(parsed);
                  if (typeof chunk === "string" && chunk.length > 0) {
                    accumulated += chunk;
                    if (!isMounted) return;

                    // Switch to streaming mode on first content received
                    if (isFirstChunk) {
                      setLoading(false);
                      setStreaming(true);
                      isFirstChunk = false;
                    }

                    setInsights(accumulated);
                    setRaw((r) =>
                      r
                        ? r + "\n" + JSON.stringify(parsed)
                        : JSON.stringify(parsed)
                    );
                    // continue streaming — do not call onComplete yet
                  }
                } else {
                  // treat non-json line as text
                  const textChunk = line.replace(/^data:\s*/i, "");
                  if (textChunk && !textChunk.startsWith("{")) {
                    accumulated += textChunk;
                    if (!isMounted) return;

                    // Switch to streaming mode on first content received
                    if (isFirstChunk) {
                      setLoading(false);
                      setStreaming(true);
                      isFirstChunk = false;
                    }

                    setInsights(accumulated);
                    setRaw((r) => (r ? r + "\n" + textChunk : textChunk));
                  }
                }
              }
            }

            // flush leftover buffer if any
            if (buffer.trim()) {
              const raw = buffer.trim();
              let parsed: unknown = undefined;
              try {
                parsed = JSON.parse(raw);
              } catch {
                if (raw.startsWith("data:")) {
                  const after = raw.replace(/^data:\s*/i, "");
                  try {
                    parsed = JSON.parse(after);
                  } catch {
                    parsed = undefined;
                  }
                }
              }
              if (parsed) {
                const chunk = extractContent(parsed);
                if (typeof chunk === "string") accumulated += chunk;
              } else {
                const textChunk = raw.replace(/^data:\s*/i, "");
                accumulated += textChunk;
              }
            }

            if (!isMounted) return;
            setInsights(accumulated || "");
            setLoading(false);
            setStreaming(false);
            if (onComplete && !completedRef.current) {
              onComplete(accumulated || "");
              completedRef.current = true;
            }
          } finally {
            try {
              await reader.cancel();
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        if (!isMounted) return;
        // fetch abortion in browser is a DOMException with name 'AbortError'
        if (err instanceof DOMException && err.name === "AbortError") {
          // ensure UI state is reset on user-initiated aborts
          setLoading(false);
          setStreaming(false);
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        setError(message ?? "分析失敗");
        setLoading(false);
        setStreaming(false);
      }
    }

    // debounce requests slightly to avoid rapid re-calls when props change quickly
    const timer = window.setTimeout(() => void analyze(), 250);
    debounceRef.current = timer;

    return () => {
      isMounted = false;
      controller.abort();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [
    data,
    model,
    onComplete,
    symbol,
    timeframe,
    open_price,
    high_price,
    low_price,
    close_price,
    volume,
    technicalData,
    candlestickData,
    retryCounter,
  ]);

  const handleImmediateRetry = useCallback(() => {
    completedRef.current = false;
    // abort current and increment counter to retrigger effect
    abortRef.current?.abort();
    setError(null);
    setInsights(null);
    setRaw(null);
    setStreaming(false);
    setRetryCounter((c) => c + 1);
    setLoading(true);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!insights) return;
    try {
      await navigator.clipboard.writeText(insights);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard failures
    }
  }, [insights]);

  // --- Debug counts & summary ---
  const dataCount = Array.isArray(data) ? data.length : data ? 1 : 0;
  const candlestickCount = Array.isArray(candlestickData)
    ? candlestickData.length
    : 0;
  const technicalSummary: { key: string; length: number }[] = [];
  if (technicalData && typeof technicalData === "object") {
    const t = technicalData as Record<string, unknown>;
    for (const k of Object.keys(t)) {
      const v = t[k];
      if (Array.isArray(v)) technicalSummary.push({ key: k, length: v.length });
      else if (typeof v === "number")
        technicalSummary.push({ key: k, length: 1 });
    }
  }

  // render debug panel when debug is true
  const renderDebugPanel = () => {
    if (!debug) return null;
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700 border">
        <div className="font-medium mb-2">Debug: 已送入 LLM 的資料摘要</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            symbol:{" "}
            {symbol ??
              (Array.isArray(data)
                ? String((data[0] as Record<string, unknown>)?.symbol ?? "-")
                : data
                ? String((data as Record<string, unknown>)?.symbol ?? "-")
                : "-")}
          </div>
          <div>timeframe: {timeframe ?? "-"}</div>
          <div>data rows in prompt: {dataCount}</div>
          <div>candlestick bars available: {candlestickCount}</div>
          <div>N (candles included in prompt): {effectiveNCandles}</div>
          <div>Token 估計（約）: {tokenEstimate}</div>
          <div>
            open/high/low/close present: {open_price != null ? "yes" : "no"}
          </div>
          <div>volume present: {volume != null ? "yes" : "no"}</div>
          <div className="col-span-1 sm:col-span-2">
            technical indicators:{" "}
            {technicalSummary.length > 0
              ? technicalSummary.map((t) => `${t.key}:${t.length}`).join(" , ")
              : "none"}
          </div>
        </div>
      </div>
    );
  };

  const handleRetry = useCallback(() => {
    // Explicitly retrigger the analysis by incrementing retryCounter.
    setInsights(null);
    setError(null);
    setStreaming(false);
    abortRef.current?.abort();
    setRetryCounter((c) => c + 1);
    setLoading(true);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <div>
              <div className="text-xl font-semibold">AI 分析與見解</div>
              {/* <div className="text-sm text-gray-500">{symbol ?? (Array.isArray(data) ? ((data[0] as Record<string, unknown>)?.symbol as string | undefined) : undefined) ?? ''} {timeframe ? `· ${timeframe}` : ''}</div> */}
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-xs text-gray-500">
            <div className="px-2 py-0.5 bg-gray-100 rounded">
              Token 估計：{tokenEstimate}
            </div>
            <div className="px-2 py-0.5 bg-gray-100 rounded">
              K 線：{effectiveNCandles}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            {loading
              ? "連接中..."
              : streaming
              ? "正在接收..."
              : error
              ? "錯誤"
              : `來源：`}
          </div>
          <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
            {model}
          </span>
          <button
            onClick={handleImmediateRetry}
            className="flex items-center px-2 py-1 bg-white rounded-md text-sm hover:bg-gray-50 border"
            aria-label="重新分析"
            disabled={loading || streaming}
          >
            <ArrowPathIcon className="h-4 w-4 mr-2 text-gray-600" />
            <span>重新分析</span>
          </button>
          <button
            onClick={handleCopy}
            disabled={!insights || loading || streaming}
            className="flex items-center px-2 py-1 bg-white rounded-md text-sm hover:bg-gray-50 border disabled:opacity-50"
            aria-label="複製分析結果"
          >
            <ClipboardDocumentIcon className="h-4 w-4 mr-2 text-gray-600" />
            <span>{copied ? "已複製" : "複製"}</span>
          </button>
          {debug && (
            <button
              onClick={() => setShowRaw((s) => !s)}
              className="flex items-center px-2 py-1 bg-white rounded-md text-sm hover:bg-gray-50 border"
              aria-pressed={showRaw}
              aria-label="切換原始回應"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-600" />
              <span>{showRaw ? "隱藏 Raw" : "顯示 Raw"}</span>
            </button>
          )}
        </div>
      </div>

      {renderDebugPanel()}

      {!data && (
        <div className="text-sm text-gray-600">
          尚未選取股票或資料不足，AI 分析將於資料提供後自動執行。
        </div>
      )}

      {loading && (
        <div className="py-6 text-center">
          <div className="inline-flex items-center space-x-3">
            <div className="relative">
              <svg
                className="animate-spin h-7 w-7"
                style={{ animationDuration: "900ms" }}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="gradSpinner" x1="0" x2="1">
                    <stop offset="0%" stopColor="#656565ff" />
                    <stop offset="100%" stopColor="#3c3c3cff" />
                  </linearGradient>
                </defs>

                {/* soft track */}
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth="3.5"
                  fill="none"
                />

                {/* colored arc */}
                <path
                  d="M22 12a10 10 0 00-10-10"
                  stroke="url(#gradSpinner)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
            <span className="text-gray-700">正在連接至 AI 模型…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 space-y-2">
          <div>分析失敗：{error}</div>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleRetry}
              className="flex items-center px-3 py-1 bg-gray-100 rounded-md text-sm hover:bg-gray-200 border"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2 text-gray-600" />
              <span>重試</span>
            </button>
          </div>
        </div>
      )}

      {insights && !loading && !error && (
        <div
          className="prose max-w-full text-gray-800 leading-relaxed space-y-4"
          role="status"
          aria-live="polite"
          aria-atomic="false"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              p: ({ children }) => (
                <p className="mb-3 leading-relaxed text-md text-gray-800">
                  {children}
                </p>
              ),
              h1: ({ children }) => (
                <h1 className="text-2xl font-semibold my-3">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold my-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold my-2">{children}</h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc ml-6 space-y-1 mb-3">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal ml-6 space-y-1 mb-3">{children}</ol>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 pl-4 italic text-gray-600 my-3">
                  {children}
                </blockquote>
              ),
              code: (props) => {
                const p = props as unknown as {
                  inline?: boolean;
                  className?: string;
                  children?: React.ReactNode;
                };
                const { inline, className, children } = p;
                if (inline)
                  return (
                    <code className="bg-gray-100 px-1 rounded text-sm">
                      {children}
                    </code>
                  );
                return (
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-auto text-sm my-3">
                    <code className={className}>{children}</code>
                  </pre>
                );
              },
              table: ({ children }) => (
                <div className="overflow-auto rounded-md border border-gray-100 my-4">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    {children}
                  </table>
                </div>
              ),
              hr: () => <hr className="border-t border-gray-200 my-6" />,
              thead: ({ children }) => (
                <thead className="bg-gray-50">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className="bg-white divide-y divide-gray-100">
                  {children}
                </tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-gray-50">{children}</tr>
              ),
              th: ({ children }) => (
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 align-top whitespace-normal text-sm">
                  {children}
                </td>
              ),
            }}
          >
            {insights}
          </ReactMarkdown>
          {streaming && (
            <div className="flex items-center justify-end mt-3 text-xs text-gray-500">
              <div className="flex space-x-1 mr-2">
                <div
                  className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: "100ms" }}
                ></div>
                <div
                  className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                  style={{ animationDelay: "200ms" }}
                ></div>
              </div>
              <span>正在接收更多內容</span>
            </div>
          )}
        </div>
      )}

      {showRaw && raw && (
        <pre className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-600 overflow-auto max-h-48">
          {raw}
        </pre>
      )}

      <div className="mt-4 text-xs text-gray-400">
        提示：AI 回覆僅供參考，不構成投資建議。請自行判斷並承擔風險。
      </div>
    </div>
  );
}
