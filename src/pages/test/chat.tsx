import React, { useEffect, useRef, useState } from "react";

const OLLAMA_API_URL = "http://172.25.1.24:11434/api/chat";
const MODEL_NAME = "gemma3:27b";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [loadingDot, setLoadingDot] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const clearChat = () => setMessages([]);

  // autoScrollEnabled kept for read-only display (updated by scroll listener)

  // auto scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // auto scroll only when enabled
  useEffect(() => {
    if (autoScrollEnabled)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, autoScrollEnabled]);

  // autofocus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // textarea auto height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const h = Math.min(200, el.scrollHeight);
    el.style.height = `${h}px`;
  }, [input]);

  // toast auto hide
  useEffect(() => {
    if (!toastText) return;
    const t = setTimeout(() => setToastText(null), 1600);
    return () => clearTimeout(t);
  }, [toastText]);

  // loading dots animation
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setLoadingDot((p) => (p + 1) % 4), 400);
    return () => clearInterval(t);
  }, [loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setError("");
    setBannerError(null);
    const now = Date.now();
    const userMsg: Message = { role: "user", content: input, timestamp: now };
    const aiPlaceholder: Message = {
      role: "assistant",
      content: "",
      timestamp: now,
    };

    // append messages locally
    setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
    setInput("");
    setLoading(true);

    // implement retry with exponential backoff
    const maxRetries = 3;
    let attempt = 0;
    let success = false;
    let finalReply = "";

    while (attempt <= maxRetries && !success) {
      try {
        // attempt number is available in 'attempt'
        const payload = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const res = await fetch(OLLAMA_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: MODEL_NAME, messages: payload }),
        });
        if (!res.body) throw new Error("API 無回應 body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let done = false;
        let reply = "";

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              try {
                const obj = JSON.parse(line);
                const chunk =
                  obj.message?.content ?? obj.choices?.[0]?.message?.content;
                if (typeof chunk === "string") {
                  reply += chunk;
                  setMessages((prev) => {
                    const copy = prev.slice();
                    const idx = copy
                      .map((m) => m.role)
                      .lastIndexOf("assistant");
                    if (idx >= 0) copy[idx] = { ...copy[idx], content: reply };
                    return copy;
                  });
                }
              } catch {
                // ignore unparsable lines
              }
            }
          }
        }

        finalReply = reply || "（無回應）";
        success = true;
      } catch (e: unknown) {
        attempt += 1;
        if (attempt > maxRetries) {
          const msg = e instanceof Error ? e.message || "發生錯誤" : "未知錯誤";
          setError(msg);
          setBannerError(`請求失敗：${msg} (嘗試 ${attempt} 次)`);
          // mark assistant placeholder with error text
          setMessages((prev) => {
            const copy = prev.slice();
            const idx = copy.map((m) => m.role).lastIndexOf("assistant");
            if (idx >= 0)
              copy[idx] = { ...copy[idx], content: `（回應失敗） ${msg}` };
            return copy;
          });
          break;
        }
        // exponential backoff
        const wait = Math.pow(2, attempt) * 500;
        await new Promise((r) => setTimeout(r, wait));
      }
    }

    // final state
    if (success) {
      setMessages((prev) => {
        const copy = prev.slice();
        const idx = copy.map((m) => m.role).lastIndexOf("assistant");
        if (idx >= 0) copy[idx] = { ...copy[idx], content: finalReply };
        return copy;
      });
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // monitor scroll to pause auto-scroll when user scrolls up
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const threshold = 80; // px from bottom
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      setAutoScrollEnabled(atBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[980px] bg-white rounded-2xl shadow-xl flex overflow-hidden ring-1 ring-slate-100">
        <div
          ref={containerRef}
          className="flex-1 min-h-[540px] max-h-[760px] overflow-y-auto p-6 bg-gradient-to-b from-white to-slate-50 relative"
        >
          <div className="absolute left-0 right-0 top-0 h-6 bg-gradient-to-b from-white/90 to-transparent pointer-events-none" />
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 mb-4 items-end ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role !== "user" && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-white text-sky-700 flex items-center justify-center font-semibold shadow">
                  AI
                </div>
              )}
              <div
                className={`max-w-[78%] flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg text-sm whitespace-pre-wrap break-words leading-relaxed transition-all duration-150 shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-[0_6px_18px_rgba(99,102,241,0.12)] rounded-br-[6px] rounded-tl-lg"
                      : "bg-white text-slate-900 border border-slate-100"
                  }`}
                >
                  {msg.content}
                </div>
                <div className="flex gap-2 items-center mt-2">
                  <div className="text-xs text-slate-400">
                    {formatTime(msg.timestamp)}
                  </div>
                  <button
                    aria-label={`複製第 ${i + 1} 則訊息`}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(msg.content);
                        setCopiedIndex(i);
                        setToastText("已複製到剪貼簿");
                        setTimeout(() => setCopiedIndex(null), 1200);
                      } catch {
                        setToastText("複製失敗");
                      }
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded"
                  >
                    {copiedIndex === i ? "已複製" : "複製"}
                  </button>
                </div>
              </div>
              {msg.role === "user" && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-teal-400 text-white flex items-center justify-center font-semibold shadow">
                  你
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start mb-2">
              <div className="max-w-[80%] bg-slate-100 text-slate-700 rounded-lg px-4 py-2 italic opacity-95 flex items-center gap-3 shadow-sm">
                <svg
                  className="w-4 h-4 text-sky-500 animate-pulse"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="4" cy="12" r="2" fill="currentColor" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <circle cx="20" cy="12" r="2" fill="currentColor" />
                </svg>
                <span className="text-sm">
                  Ollama 正在回覆
                  {Array.from({ length: loadingDot }).map((_, i) => (
                    <span key={i}>.</span>
                  ))}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="w-[360px] border-l border-slate-100 p-4 flex flex-col gap-3 bg-white">
          {bannerError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-2 rounded">
              <div className="flex justify-between items-center text-sm">
                <div>{bannerError}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // retry last send by re-sending last user message
                      const lastUser = messages
                        .slice()
                        .reverse()
                        .find((m) => m.role === "user");
                      if (lastUser) {
                        setInput(lastUser.content);
                        setBannerError(null);
                        textareaRef.current?.focus();
                      }
                    }}
                    className="text-sm px-2 py-1 bg-white border rounded"
                  >
                    重試
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="text-base text-slate-700 font-semibold text-center pb-2 border-b border-slate-100">
            Ollama AI 聊天室
          </div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs text-slate-400">模型</div>
              <div className="text-sm font-medium">{MODEL_NAME}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">訊息數</div>
              <div className="text-sm font-medium">{messages.length}</div>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            輸入訊息（Shift+Enter 換行，Enter 送出）
          </div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="在此輸入訊息..."
            rows={4}
            className="w-full p-3 rounded-lg border border-slate-200 resize-y min-h-[80px] text-sm"
            disabled={loading}
          />
          {/* 編輯功能已移除 */}
          <div className="flex gap-2">
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className={`flex-1 px-3 py-2 rounded-lg font-semibold text-white ${
                input.trim() && !loading
                  ? "bg-gradient-to-r from-indigo-600 to-teal-400 hover:scale-[1.01]"
                  : "bg-slate-300 cursor-not-allowed"
              }`}
            >
              {loading ? "傳送中..." : "送出"}
            </button>
            <button
              onClick={() => {
                setInput("");
                textareaRef.current?.focus();
              }}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              清除
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <button
              onClick={() => clearChat()}
              className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white flex-1"
            >
              清除聊天室
            </button>
            <div className="text-sm text-slate-500 px-3 py-2">
              自動滾動：
              <span className="ml-2 font-medium text-slate-700">
                {autoScrollEnabled ? "開" : "關"}
              </span>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {toastText && (
            <div className="fixed right-6 bottom-6 bg-slate-900 text-white px-3 py-2 rounded-lg">
              {toastText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
