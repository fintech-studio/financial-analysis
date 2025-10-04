import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "@/components/pages/chat/MessageBubble";
import { Message, Icons } from "@/components/pages/chat/common";
import Footer from "@/components/Layout/Footer";

const OLLAMA_API_URL = "http://172.25.1.24:11434/api/chat";
const MODEL_NAME = "gpt-oss";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const [selectedModel, setSelectedModel] = useState<string>(MODEL_NAME);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [availableModels] = useState<string[]>([
    "gpt-oss",
    "gemma3:12b",
    "deepseek-r1:8b",
    "deepseek-r1:14b",
    "llama3.2-vision",
    "llava",
  ]);
  const [attachedFiles, setAttachedFiles] = useState<
    {
      name: string;
      type: string;
      content: string;
    }[]
  >([]);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 生成唯一ID的函數
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // auto scroll to bottom on messages change when enabled
  useEffect(() => {
    if (autoScrollEnabled)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, autoScrollEnabled]);

  // autofocus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const removeAttachedFile = useCallback((index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeAttachedImage = useCallback((index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
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

  // 使用 useMemo 優化昂貴計算
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => msg.content.trim() !== "");
  }, [messages]);

  // settings/models 功能已移除

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const base64Content = result.split(",")[1]; // 移除 data:type;base64, 前綴

          if (file.type.startsWith("image/")) {
            setAttachedImages((prev) => [...prev, base64Content]);
          } else {
            setAttachedFiles((prev) => [
              ...prev,
              {
                name: file.name,
                type: file.type,
                content: base64Content,
              },
            ]);
          }
        };
        reader.readAsDataURL(file);
      });

      // 清除 input
      if (event.target) {
        event.target.value = "";
      }
    },
    []
  );

  // sendMessage: send user input + attachments to OLLAMA and stream reply
  const sendMessage = useCallback(async () => {
    if (
      !input.trim() &&
      attachedFiles.length === 0 &&
      attachedImages.length === 0
    )
      return;

    setBannerError(null);
    const now = Date.now();
    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: now,
      id: generateId(),
      images: attachedImages.length > 0 ? attachedImages : undefined,
      files: attachedFiles.length > 0 ? attachedFiles : undefined,
    };
    const aiPlaceholder: Message = {
      role: "assistant",
      content: "",
      timestamp: now,
      id: generateId(),
    };

    setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
    setInput("");
    setAttachedFiles([]);
    setAttachedImages([]);
    setLoading(true);

    const maxRetries = 3;
    let attempt = 0;
    let success = false;
    let finalReply = "";

    while (attempt <= maxRetries && !success) {
      try {
        const messagePayload = [...messages, userMsg].map((m) => {
          const baseMessage: {
            role: string;
            content: string;
            images?: string[];
          } = {
            role: m.role,
            content: m.content,
          };

          if (m.images && m.images.length > 0) {
            baseMessage.images = m.images;
          }

          if (m.files && m.files.length > 0) {
            const fileContents = m.files
              .map((file) => {
                if (
                  file.type.includes("text") ||
                  file.type.includes("json") ||
                  file.type.includes("javascript") ||
                  file.type.includes("typescript") ||
                  file.name.endsWith(".csv") ||
                  file.name.endsWith(".md") ||
                  file.name.endsWith(".txt") ||
                  file.type.includes("csv")
                ) {
                  try {
                    const decoded = atob(file.content);
                    return `檔案：${file.name}\n內容：\n${decoded}`;
                  } catch {
                    return `檔案：${file.name} (無法解析內容)`;
                  }
                } else {
                  return `檔案：${file.name} (${file.type})`;
                }
              })
              .join("\n\n");

            baseMessage.content = baseMessage.content
              ? `${baseMessage.content}\n\n附加檔案：\n${fileContents}`
              : `附加檔案：\n${fileContents}`;
          }

          return baseMessage;
        });

        const modelToUse = selectedModel || MODEL_NAME;
        const res = await fetch(OLLAMA_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: modelToUse, messages: messagePayload }),
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
          setBannerError(`請求失敗：${msg} (嘗試 ${attempt} 次)`);
          setMessages((prev) => {
            const copy = prev.slice();
            const idx = copy.map((m) => m.role).lastIndexOf("assistant");
            if (idx >= 0)
              copy[idx] = { ...copy[idx], content: `（回應失敗） ${msg}` };
            return copy;
          });
          break;
        }
        const wait = Math.pow(2, attempt) * 500;
        await new Promise((r) => setTimeout(r, wait));
      }
    }

    if (success) {
      setMessages((prev) => {
        const copy = prev.slice();
        const idx = copy.map((m) => m.role).lastIndexOf("assistant");
        if (idx >= 0) copy[idx] = { ...copy[idx], content: finalReply };
        return copy;
      });
    }

    setLoading(false);
  }, [input, selectedModel, attachedFiles, attachedImages, messages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const threshold = 80;
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      setAutoScrollEnabled(atBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const handleCopy = useCallback(
    async (i: number) => {
      try {
        await navigator.clipboard.writeText(messages[i].content);
        setCopiedIndex(i);
        setToastText("已複製到剪貼簿");
        setTimeout(() => setCopiedIndex(null), 1200);
      } catch {
        setToastText("複製失敗");
      }
    },
    [messages]
  );

  // 是否可以送出（輸入不為空或有附加檔案/圖片，且非 loading）
  const canSend = useMemo(() => {
    return (
      !loading &&
      (input.trim().length > 0 ||
        attachedFiles.length > 0 ||
        attachedImages.length > 0)
    );
  }, [loading, input, attachedFiles, attachedImages]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="flex h-full">
            <div className="flex-1 flex flex-col">
              <div
                className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white"
                ref={containerRef}
              >
                <AnimatePresence>
                  {messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex flex-col items-center justify-center h-full text-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg text-white">
                        <Icons.Bot />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        開始與 AI 對話
                      </h2>
                      <p className="text-gray-600 max-w-md leading-relaxed">
                        輸入任何問題或想法，AI 助手將會即時為您提供幫助和回答
                      </p>
                      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                        {[
                          "解釋一個複雜的概念",
                          "請幫我分析數據",
                          "創意寫作協助",
                          "程式碼問題解答",
                        ].map((suggestion, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 + 0.3 }}
                            whileHover={{
                              scale: 1.02,
                              backgroundColor: "rgb(239 246 255)",
                            }}
                            onClick={() => setInput(suggestion)}
                            className="p-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 shadow-sm"
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {filteredMessages.map((msg, i) => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      index={i}
                      onCopy={handleCopy}
                      copiedIndex={copiedIndex}
                    />
                  ))}

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-start mb-6"
                    >
                      <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-2xl rounded-bl-md px-5 py-3 shadow-md">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                          <Icons.Bot />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                                className="w-2 h-2 bg-blue-500 rounded-full"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-2">
                            AI 正在思考中...
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 bg-white p-6">
                {bannerError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{bannerError}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
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
                        className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 border border-red-300 rounded-lg transition-colors"
                      >
                        重試
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* 檔案預覽區域 */}
                {(attachedFiles.length > 0 || attachedImages.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <div className="text-sm text-gray-600 mb-3 font-medium">
                      附加的檔案:
                    </div>

                    {/* 圖片預覽 */}
                    {attachedImages.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                          {attachedImages.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={`data:image/jpeg;base64,${image}`}
                                alt={`預覽 ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                onClick={() => removeAttachedImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                <Icons.Remove />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 檔案列表 */}
                    {attachedFiles.length > 0 && (
                      <div className="space-y-2">
                        {attachedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <Icons.File />
                              <div>
                                <div className="text-sm font-medium text-gray-800">
                                  {file.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {file.type}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeAttachedFile(index)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                            >
                              <Icons.Remove />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="flex gap-6">
                  <div className="flex-1">
                    {/* hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,text/*,.pdf,.doc,.docx,.json,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.xml,.md,.csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* Styled input container: attach | textarea | send */}
                    <div className="relative">
                      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm">
                        {/* Attach button */}
                        <motion.button
                          type="button"
                          title="添加附件"
                          whileHover={{ scale: loading ? 1 : 1.05 }}
                          whileTap={{ scale: loading ? 1 : 0.95 }}
                          onClick={() => fileInputRef.current?.click()}
                          disabled={loading}
                          aria-label="添加附件"
                          className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Icons.Attach />
                        </motion.button>

                        {/* textarea */}
                        <textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="輸入您的訊息... (Shift+Enter 換行，Enter 送出)"
                          rows={1}
                          className="flex-1 bg-transparent resize-none outline-none px-2 py-2 text-base hide-scrollbar"
                          disabled={loading}
                          style={{ minHeight: "56px", maxHeight: "200px" }}
                        />

                        {/* Send button */}
                        <motion.button
                          type="button"
                          title="傳送訊息"
                          whileHover={{ scale: canSend ? 1.05 : 1 }}
                          whileTap={{ scale: canSend ? 0.95 : 1 }}
                          onClick={() => sendMessage()}
                          disabled={!canSend}
                          aria-label="傳送訊息"
                          className={`flex items-center justify-center w-10 h-10 rounded-md text-white transition-all duration-200 ${
                            canSend
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {loading ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Icons.Send />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsSettingsOpen((s) => !s)}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span>當前模型：</span>
                      <span className="font-medium text-blue-600">
                        {selectedModel}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          isSettingsOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </motion.button>

                    <AnimatePresence>
                      {isSettingsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px] z-50"
                        >
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {availableModels.map((model) => (
                              <button
                                key={model}
                                onClick={() => {
                                  setSelectedModel(model);
                                  setIsSettingsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                  selectedModel === model
                                    ? "bg-blue-100 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {model}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {toastText && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg z-50"
            >
              <div className="flex items-center gap-2">
                <Icons.Check />
                <span>{toastText}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
};

export default Chat;

if (typeof document !== "undefined") {
  const styleId = "hide-scrollbar-global-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      .hide-scrollbar {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none; /* WebKit */
      }
    `;
    document.head.appendChild(style);
  }
}
