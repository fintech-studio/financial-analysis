import React, { useEffect, useRef, useState } from "react";

const OLLAMA_API_URL = "http://172.25.1.24:11434/api/chat";
const MODEL_NAME = "gpt-oss";

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
  const [toastText, setToastText] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [loadingDot, setLoadingDot] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // auto scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    try {
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
                  const idx = copy.map((m) => m.role).lastIndexOf("assistant");
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

      if (!reply) {
        setMessages((prev) => {
          const copy = prev.slice();
          const idx = copy.map((m) => m.role).lastIndexOf("assistant");
          if (idx >= 0) copy[idx] = { ...copy[idx], content: "（無回應）" };
          return copy;
        });
      }
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message || "發生錯誤");
      else setError("未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[900px] bg-white rounded-lg shadow-2xl flex overflow-hidden">
        <div className="flex-1 min-h-[520px] max-h-[720px] overflow-y-auto p-5 bg-slate-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 mb-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role !== "user" && (
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  AI
                </div>
              )}
              <div
                className={`max-w-[78%] flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-md text-sm whitespace-pre-wrap break-words ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-lg"
                      : "bg-white text-slate-900 shadow-md"
                  }`}
                >
                  {msg.content}
                </div>
                <div className="flex gap-2 items-center mt-1">
                  <div className="text-xs text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
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
                    className="text-sm text-slate-600 hover:text-slate-800"
                  >
                    {copiedIndex === i ? "已複製" : "複製"}
                  </button>
                </div>
              </div>
              {msg.role === "user" && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-teal-400 text-white flex items-center justify-center font-bold">
                  你
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start mb-2">
              <div className="max-w-[80%] bg-slate-200 text-slate-800 rounded-[16px_16px_16px_4px] px-4 py-2 italic opacity-90 flex items-center gap-2">
                <span>Ollama 正在回覆</span>
                <span className="inline-block w-6 text-left">
                  {Array.from({ length: loadingDot }).map((_, i) => (
                    <span key={i}>.</span>
                  ))}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="w-[340px] border-l border-slate-100 p-4 flex flex-col gap-3 bg-white">
          <div className="text-base text-slate-700 font-semibold text-center pb-2 border-b border-slate-100">
            Ollama AI 聊天室
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
