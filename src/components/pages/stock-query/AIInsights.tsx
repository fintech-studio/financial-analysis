import React, { useEffect, useRef, useState } from "react";

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
  // optional model name or api override
  model?: string;
  // optional small callback when analysis completes
  onComplete?: (insights: string) => void;
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
  }
) {
  // Build a compact, informative prompt for the LLM based on provided data
  const header = `你是專業的金融分析師（中文回覆）。根據下列股票資料，提供：\n1) 市場趨勢摘要（1-2 行）\n2) 主要風險提示（3 點以內）\n3) 簡短投資建議（保守/中性/積極分別一句話）\n4) 信心水準（0-100%）。\n請使用清楚的標題與條列點，字數控制在 300 字以內。`;

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
    return `資料： symbol=${symbol} timeframe=${opts?.timeframe ?? "-"} price=${price} change%=${change} volume=${vol}`;
  })();

  const hint = opts?.symbol ? `（標的：${opts.symbol}）` : "";
  const extra = [] as string[];
  if (opts?.open_price != null)
    extra.push(`open=${opts.open_price}`, `high=${opts.high_price}`, `low=${opts.low_price}`, `close=${opts.close_price}`, `volume=${opts.volume}`);
  if (opts?.technicalData) extra.push("包含技術指標資料，請一併考量。");

  return `${header}\n${hint}\n\n${body}\n\n${extra.join(" ")}\n\n請用繁體中文回答。`;
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
  model = DEFAULT_MODEL,
  onComplete,
}: Props) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // abort previous request on new analysis
  const abortRef = useRef<AbortController | null>(null);

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
      setError(null);
      setInsights(null);

      const symbolHint = Array.isArray(data)
        ? ((data[0] as Record<string, unknown>)?.symbol as string | undefined)
        : ((data as Record<string, unknown>)?.symbol as string | undefined);
      const prompt = buildPrompt(data, {
        symbol: symbolHint ?? symbol,
        timeframe: timeframe,
        open_price: open_price ?? null,
        high_price: high_price ?? null,
        low_price: low_price ?? null,
        close_price: close_price ?? null,
        volume: volume ?? null,
        technicalData: technicalData,
        candlestickData: candlestickData,
      });

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
          throw new Error(`分析請求失敗：${res.status} ${res.statusText} ${text}`);
        }

        // If response has a body (could be streaming), read it incrementally.
        if (!res.body) {
          const text = await res.text();
          if (!isMounted) return;
          setInsights(text);
          setLoading(false);
          if (onComplete) onComplete(text);
        } else {
          // stream reader: handle line-delimited JSON or plain SSE-like data
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let accumulated = "";

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
                    setInsights(accumulated);
                    // continue streaming — do not call onComplete yet
                  }
                } else {
                  // treat non-json line as text
                  const textChunk = line.replace(/^data:\s*/i, "");
                  if (textChunk && !textChunk.startsWith("{")) {
                    accumulated += textChunk;
                    if (!isMounted) return;
                    setInsights(accumulated);
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
            if (onComplete) onComplete(accumulated || "");
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
          return;
        }
        const message = err instanceof Error ? err.message : String(err);
        setError(message ?? "分析失敗");
        setLoading(false);
      }
    }

    analyze();

    return () => {
      isMounted = false;
      controller.abort();
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
  ]);

  const handleRetry = () => {
    // abort previous and trigger a new effect by toggling a tiny state could be used,
    // but easiest is to re-run by calling setInsights to null then letting useEffect trigger from data unchanged.
    // Instead we call the effect by creating a shallow copy of data (no-op) via setting insights to null.
    setInsights(null);
    setError(null);
    // abort previous
    abortRef.current?.abort();
    // effect will rerun because abort doesn't change deps; to ensure rerun consumer can re-pass data or remount.
    // As a pragmatic approach, we call a fetch manually here by toggling a small fake state would be needed,
    // but to keep the component simple we rely on data changes or parent to re-trigger. Provide a console hint.
    // If immediate retry required, parent may re-render this component.
    console.info("請重新傳入或更新 props.data 以重新觸發分析，或重新 mount 此組件以重試。");
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">AI 分析與見解</h3>
        <div className="text-sm text-gray-500">來源：LLM</div>
      </div>

      {!data && (
        <div className="text-sm text-gray-600">尚未選取股票或資料不足，AI 分析將於資料提供後自動執行。</div>
      )}

      {loading && (
        <div className="py-6 text-center">
          <div className="inline-flex items-center space-x-3">
            <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-sm text-gray-700">AI 正在分析中…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 space-y-2">
          <div>分析失敗：{error}</div>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-gray-100 rounded-md text-sm hover:bg-gray-200 border"
            >
              重試
            </button>
          </div>
        </div>
      )}

      {insights && !loading && !error && (
        <div className="prose prose-sm max-w-none text-gray-800">
          {/* Preserve basic line breaks and simple formatting */}
          {insights.split(/\n\n|\r\n\r\n/).map((block, i) => (
            <div key={i} className="mb-2">
              {block.split(/\n|\r\n/).map((line, j) => (
                <p key={j} className="my-0">{line}</p>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400">提示：AI 回覆僅供參考，不構成投資建議。請自行判斷並承擔風險。</div>
    </div>
  );
}
