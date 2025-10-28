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
  SparklesIcon,
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type Props = {
  // accept an array of signal rows (any shape)
  data?: unknown;
  symbol?: string;
  timeframe?: string;
  nCandles?: number;
  model?: string;
  onComplete?: (insights: string) => void;
};

const DEFAULT_MODEL = "FinCoach";

function buildPromptForSignals(
  data: unknown,
  opts?: { symbol?: string; timeframe?: string; nCandles?: number }
) {
  const header = `你是一位專業的金融分析 AI 助手，擅長技術分析、量化交易與市場情緒判斷，能以清晰、專業且簡潔的方式撰寫交易訊號分析報告。根據提供的交易訊號資料，請撰寫一份簡短但具洞察力的交易分析報告，內容僅包含：買賣建議：根據訊號，提供明確的「買入、持有或賣出或觀望」建議。請使用清晰分段或條列格式，語氣應專業、客觀且易於理解。`;

  const body = (() => {
    if (!data) return "未提供資料。";
    if (Array.isArray(data)) {
      const sample = (data as unknown[])
        .slice(0, 40)
        .map((d) => {
          const item = d as Record<string, unknown>;
          const dt = item.datetime ?? item.date ?? item.time ?? "-";
          const price = item.close_price ?? item.close ?? item.price ?? "-";
          const sig = item.Trade_Signal ?? item.signal ?? "-";
          return `${dt} close=${price} signal=${sig}`;
        })
        .join("\n");
      return `最近 ${Math.min(
        (data as unknown[]).length,
        40
      )} 筆交易訊號（最近 -> 最遠）：\n${sample}`;
    }
    const single = data as Record<string, unknown>;
    return `資料： ${JSON.stringify(single)}`;
  })();

  const hint = opts?.symbol ? `標的：${opts.symbol}` : "";
  const candles = opts?.nCandles
    ? `包含最近 ${opts.nCandles} 筆 K 線摘要（若有）`
    : "";

  return `${header}\n${hint}\n\n${body}\n\n${candles}\n\n請用繁體中文回答，條列式且易讀。篇幅控制在 200 字內。`;
}

export default function AIInsights({
  data,
  symbol,
  timeframe,
  nCandles = 50,
  model = DEFAULT_MODEL,
  onComplete,
}: Props) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const completedRef = useRef(false);
  const [retryCounter, setRetryCounter] = useState(0);
  const [streaming, setStreaming] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const prompt = useMemo(
    () => buildPromptForSignals(data, { symbol, timeframe, nCandles }),
    [data, symbol, timeframe, nCandles]
  );

  useEffect(() => {
    if (!data) {
      setInsights(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    let isMounted = true;

    async function analyze() {
      // truncate prompt if extremely long to avoid issues
      const MAX_PROMPT = 20000;
      if (prompt && prompt.length > MAX_PROMPT) {
        console.warn("AIInsights: prompt truncated for safety");
      }

      setLoading(true);
      setStreaming(false);
      setError(null);

      const payload = { model, messages: [{ role: "user", content: prompt }] };
      try {
        let res = await fetch("/api/ollama-proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok) {
          try {
            res = await fetch("http://localhost:11434/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              signal: controller.signal,
            });
          } catch {
            // ignore
          }
        }

        if (!res.ok) {
          const text = await res.text().catch(() => "(no body)");
          throw new Error(
            `分析請求失敗：${res.status} ${res.statusText} ${text}`
          );
        }

        // If response has a body we can try streaming it and assembling
        if (!res.body) {
          const text = await res.text();
          if (!isMounted) return;
          setInsights(text);
          setLoading(false);
          setStreaming(false);
          if (onComplete && !completedRef.current) {
            onComplete(text);
            completedRef.current = true;
          }
        } else {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let accumulated = "";
          let isFirst = true;

          const extractContent = (obj: unknown): string | undefined => {
            if (!obj || typeof obj !== "object") return undefined;
            const o = obj as Record<string, unknown>;
            if (o.message && typeof o.message === "object") {
              const m = o.message as Record<string, unknown>;
              if (typeof m.content === "string") return m.content;
            }
            if (Array.isArray(o.choices) && o.choices.length > 0) {
              const first = o.choices[0] as Record<string, unknown> | undefined;
              if (first && first.message && typeof first.message === "object") {
                const fm = first.message as Record<string, unknown>;
                if (typeof fm.content === "string") return fm.content;
              }
            }
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

              for (const rawLine of lines) {
                const line = rawLine.trim();
                if (!line) continue;

                let parsed: unknown = undefined;
                try {
                  parsed = JSON.parse(line);
                } catch {
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
                    if (isFirst) {
                      setLoading(false);
                      setStreaming(true);
                      isFirst = false;
                    }
                    setInsights(accumulated);
                  }
                } else {
                  // treat non-json line as text chunk (possible 'data:' prefix)
                  const textChunk = line.replace(/^data:\s*/i, "");
                  if (textChunk && !textChunk.startsWith("{")) {
                    accumulated += textChunk;
                    if (!isMounted) return;
                    if (isFirst) {
                      setLoading(false);
                      setStreaming(true);
                      isFirst = false;
                    }
                    setInsights(accumulated);
                  }
                }
              }
            }

            // flush remaining buffer
            if (buffer.trim()) {
              const rawLeft = buffer.trim();
              let parsedLeft: unknown = undefined;
              try {
                parsedLeft = JSON.parse(rawLeft);
              } catch {
                if (rawLeft.startsWith("data:")) {
                  const after = rawLeft.replace(/^data:\s*/i, "");
                  try {
                    parsedLeft = JSON.parse(after);
                  } catch {
                    parsedLeft = undefined;
                  }
                }
              }
              if (parsedLeft) {
                const chunk = extractContent(parsedLeft);
                if (typeof chunk === "string") accumulated += chunk;
              } else {
                const textChunk = rawLeft.replace(/^data:\s*/i, "");
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
        if (err instanceof DOMException && err.name === "AbortError") {
          setLoading(false);
          return;
        }
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    }

    // debounce analyze to avoid rapid retriggers
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    // schedule analyze (debounced)
    debounceRef.current = window.setTimeout(() => {
      void analyze();
    }, 250);

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [data, model, prompt, onComplete, nCandles, retryCounter]);

  const handleRetry = useCallback(() => {
    completedRef.current = false;
    // abort any in-flight request then increment retryCounter to retrigger effect
    abortRef.current?.abort();
    setInsights(null);
    setError(null);
    setLoading(true);
    setRetryCounter((c) => c + 1);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!insights) return;
    try {
      await navigator.clipboard.writeText(insights);
    } catch {
      // ignore
    }
  }, [insights]);

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="shrink-0">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-gray-700" />
              </div>
            </div>
            <div>
              <div className="text-md font-semibold">AI 分析與見解</div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            {loading
              ? "連線中..."
              : streaming
              ? "正在接收..."
              : error
              ? "錯誤"
              : "AI"}
          </div>
          <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
            {model}
          </span>

          <button
            onClick={handleRetry}
            className="flex items-center px-2 py-1 bg-white rounded-md text-sm hover:bg-gray-50 border"
            disabled={loading}
            title={"重新分析"}
          >
            <ArrowPathIcon
              className={`h-4 w-4 mr-2 text-gray-600 ${
                loading || streaming ? "animate-spin" : ""
              }`}
            />
            <span>{loading || streaming ? "重新發送..." : "重新分析"}</span>
          </button>

          {/* raw toggle removed */}

          <button
            onClick={handleCopy}
            disabled={!insights || loading}
            className="flex items-center px-2 py-1 bg-white rounded-md text-sm hover:bg-gray-50 border disabled:opacity-50"
          >
            <ClipboardDocumentIcon className="h-4 w-4 mr-2 text-gray-600" />
            <span>複製</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-sm text-gray-600">正在連接 AI 模型…</div>
      )}
      {error && <div className="text-sm text-red-600">分析失敗：{error}</div>}

      {insights && !loading && (
        <div className="prose max-w-full text-gray-800 leading-relaxed space-y-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              table: ({ children }) => (
                <div className="overflow-auto rounded-md border border-gray-100 my-4">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    {children}
                  </table>
                </div>
              ),
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
        </div>
      )}

      <div className="mt-3 text-xs text-gray-400">
        提示：AI 回覆僅供參考，不構成投資建議。
      </div>
    </div>
  );
}
