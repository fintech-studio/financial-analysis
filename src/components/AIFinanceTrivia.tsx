import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

const AIFinanceTrivia: React.FC = () => {
  const [trivia, setTrivia] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  const generateTrivia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // prompt (繁體中文)
      const prompt =
        "請用繁體中文提供一句有趣且簡短的金融冷知識（1-3句），並說明一個簡短的實務應用場景。不要包含多餘的說明。請迅速做出回應。";

      // 支援 chat-style (messages) 與 generate-style (prompt) 兩種方式，先嘗試 chat 再 fallback 到 generate
      const bodies = [
        {
          model: "FinCoach",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
        },
        { model: "fincoach", prompt, max_tokens: 300 },
      ];

      let output: string | null = null;
      let lastErr: string | null = null;

      for (const body of bodies) {
        try {
          const res = await fetch("/api/ollama-proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const txt = await res.text().catch(() => "");
            lastErr = `API error ${res.status} ${txt}`;
            continue; // 嘗試下一種 body
          }

          // 嘗試以 stream/line-delimited JSON 處理（ollama-proxy 會把 SSE 轉為逐行 JSON）
          const reader = (
            res.body as unknown as ReadableStream<Uint8Array>
          )?.getReader?.();
          if (reader) {
            const decoder = new TextDecoder();
            let buf = "";
            let outBuf = "";
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) buf += decoder.decode(value, { stream: true });

                let idx;
                while ((idx = buf.indexOf("\n")) !== -1) {
                  const line = buf.slice(0, idx).trim();
                  buf = buf.slice(idx + 1);
                  if (!line) continue;

                  try {
                    const parsed = JSON.parse(line);
                    // 優先取 message.content；再取 output、result、text、content、choices
                    const parts: string[] = [];
                    if (parsed.message?.content)
                      parts.push(parsed.message.content);
                    if (parsed.output) parts.push(parsed.output);
                    if (parsed.result) parts.push(parsed.result);
                    if (parsed.text) parts.push(parsed.text);
                    if (parsed.content) parts.push(parsed.content);
                    if (parsed.choices?.[0]?.message?.content)
                      parts.push(parsed.choices[0].message.content);
                    if (parsed.choices?.[0]?.text)
                      parts.push(parsed.choices[0].text);

                    for (const p of parts) {
                      if (typeof p === "string" && p.trim()) {
                        outBuf += p;
                        setTrivia(outBuf);
                      }
                    }
                  } catch {
                    // 非 JSON 行，直接加到輸出
                    outBuf += line;
                    setTrivia(outBuf);
                  }
                }
              }

              // 處理殘留 buffer
              if (buf.trim()) {
                try {
                  const parsed = JSON.parse(buf.trim());
                  const parts: string[] = [];
                  if (parsed.message?.content)
                    parts.push(parsed.message.content);

                  if (parsed.output) parts.push(parsed.output);
                  if (parsed.result) parts.push(parsed.result);
                  if (parsed.text) parts.push(parsed.text);
                  if (parsed.content) parts.push(parsed.content);
                  if (parsed.choices?.[0]?.message?.content)
                    parts.push(parsed.choices[0].message.content);
                  if (parsed.choices?.[0]?.text)
                    parts.push(parsed.choices[0].text);
                  for (const p of parts) {
                    if (typeof p === "string" && p.trim()) {
                      outBuf += p;
                    }
                  }
                } catch {
                  outBuf += buf;
                }
                setTrivia(outBuf);
              }

              if (outBuf) output = outBuf;
            } finally {
              try {
                await reader.cancel();
              } catch {
                // ignore
              }
            }
          } else {
            // 非 stream，直接以 text 讀取
            const text = await res.text();
            try {
              const parsed = JSON.parse(text);
              const candidates = [
                parsed.message?.content,
                parsed.output,
                parsed.results?.[0]?.content,
                parsed.result,
                parsed.text,
                parsed.content,
                parsed.choices?.[0]?.message?.content,
                parsed.choices?.[0]?.text,
              ];
              for (const c of candidates) {
                if (typeof c === "string" && c.trim()) {
                  output = c;
                  break;
                }
              }
              if (
                !output &&
                parsed.message &&
                Array.isArray(parsed.message.content)
              ) {
                const joined = parsed.message.content.join("\n").trim();
                if (joined) output = joined;
              }
            } catch {
              if (text && text.trim()) output = text;
            }
          }
          if (output) break; // 找到結果就停止嘗試
        } catch (err) {
          lastErr = err instanceof Error ? err.message : String(err);
          continue; // try next body
        }
      }

      if (!output) {
        throw new Error(
          lastErr || "No content returned from Ollama (empty message)"
        );
      }

      setTrivia(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // 頁面載入時自動生成一次
  useEffect(() => {
    // 不等待直接觸發，錯誤會在組件內處理
    void generateTrivia();
  }, [generateTrivia]);

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-2xl font-bold text-gray-900">來點冷知識</h4>
          </div>

          <div className="flex items-center gap-3">
            {/* 複製按鈕：當有 trivia 才顯示，放在再生成按鈕的左邊 */}
            <div>
              <button
                onClick={async () => {
                  if (!trivia) return;
                  try {
                    await navigator.clipboard.writeText(trivia);
                    setCopied(true);
                    if (copyTimeoutRef.current)
                      window.clearTimeout(copyTimeoutRef.current);
                    copyTimeoutRef.current = window.setTimeout(
                      () => setCopied(false),
                      2000
                    ) as unknown as number;
                  } catch {
                    setCopied(false);
                  }
                }}
                disabled={loading || !trivia}
                aria-disabled={loading || !trivia}
                aria-label={trivia ? "複製冷知識到剪貼簿" : "無可複製的冷知識"}
                className="inline-flex items-center gap-2 px-4 py-2 h-10 bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 rounded-xl disabled:opacity-60 transition"
                title={trivia ? "複製文本" : "尚無可複製內容"}
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16h8M8 12h8M8 8h8"
                  />
                </svg>
                <span className="font-medium">
                  {copied ? "已複製" : "複製"}
                </span>
              </button>
            </div>

            <div>
              <button
                onClick={generateTrivia}
                disabled={loading}
                aria-busy={loading}
                className="inline-flex items-center gap-2 px-4 py-2 h-10 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {loading ? <span>生成中...</span> : <span>再生成一則</span>}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {error && (
            <div
              role="alert"
              className="text-sm text-red-600 bg-red-50 p-3 rounded"
            >
              {error}
            </div>
          )}

          {trivia ? (
            <div>
              <div className="mt-3 text-gray-800 leading-relaxed prose prose-sm">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                >
                  {trivia}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-gray-500">
              AI 正在生成冷知識中...
            </div>
          )}

          {/* 無障礙區域：用來唸出錯誤或複製狀態 */}
          <div aria-live="polite" className="sr-only">
            {error ? error : copied ? "已將冷知識複製到剪貼簿" : ""}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFinanceTrivia;
