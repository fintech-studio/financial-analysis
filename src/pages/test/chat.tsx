/* eslint-disable react/prop-types */
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

const OLLAMA_API_URL = "http://172.25.1.24:11434/api/chat";
const MODEL_NAME = "gpt-oss";

// 動畫配置常量
const ANIMATION_CONFIG = {
  messageEnter: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  avatarScale: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { delay: 0.1, type: "spring" as const, stiffness: 300 },
  },
  buttonHover: { scale: 1.05, transition: { duration: 0.1 } },
  buttonTap: { scale: 0.95, transition: { duration: 0.1 } },
  toastDuration: 2000,
};

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  id: string;
}

// 圖標組件 - 使用 React.memo 優化重渲染
const SendIcon = React.memo(() => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
));
SendIcon.displayName = "SendIcon";

const CopyIcon = React.memo(() => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
));
CopyIcon.displayName = "CopyIcon";

const CheckIcon = React.memo(() => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
));
CheckIcon.displayName = "CheckIcon";

const SettingsIcon = React.memo(() => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
));
SettingsIcon.displayName = "SettingsIcon";

const ClearIcon = React.memo(() => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
));
ClearIcon.displayName = "ClearIcon";

const BotIcon = React.memo(() => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
));
BotIcon.displayName = "BotIcon";

const UserIcon = React.memo(() => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
));
UserIcon.displayName = "UserIcon";

const Icons = {
  Send: SendIcon,
  Copy: CopyIcon,
  Check: CheckIcon,
  Settings: SettingsIcon,
  Clear: ClearIcon,
  Bot: BotIcon,
  User: UserIcon,
};

const MessageBubble = React.memo<{
  msg: Message;
  index: number;
  onCopy: (i: number) => void;
  copiedIndex: number | null;
}>(({ msg, index, onCopy, copiedIndex }) => {
  const isUser = msg.role === "user";

  const handleCopy = useCallback(() => {
    onCopy(index);
  }, [onCopy, index]);

  return (
    <motion.div
      key={msg.id}
      initial={ANIMATION_CONFIG.messageEnter.initial}
      animate={ANIMATION_CONFIG.messageEnter.animate}
      transition={ANIMATION_CONFIG.messageEnter.transition}
      className={`flex gap-3 mb-6 items-end ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <motion.div
          initial={ANIMATION_CONFIG.avatarScale.initial}
          animate={ANIMATION_CONFIG.avatarScale.animate}
          transition={ANIMATION_CONFIG.avatarScale.transition}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg"
        >
          <Icons.Bot />
        </motion.div>
      )}
      <div
        className={`max-w-[75%] flex flex-col ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, x: isUser ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`px-5 py-3 rounded-2xl text-sm whitespace-pre-wrap break-words leading-relaxed transition-all duration-200 shadow-md hover:shadow-lg ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md"
              : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
          }`}
        >
          {msg.content}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 items-center mt-2 px-1"
        >
          <div className="text-xs text-gray-400">
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <motion.button
            whileHover={ANIMATION_CONFIG.buttonHover}
            whileTap={ANIMATION_CONFIG.buttonTap}
            aria-label={`複製第 ${index + 1} 則訊息`}
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {copiedIndex === index ? <Icons.Check /> : <Icons.Copy />}
            <span>{copiedIndex === index ? "已複製" : "複製"}</span>
          </motion.button>
        </motion.div>
      </div>
      {isUser && (
        <motion.div
          initial={ANIMATION_CONFIG.avatarScale.initial}
          animate={ANIMATION_CONFIG.avatarScale.animate}
          transition={ANIMATION_CONFIG.avatarScale.transition}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 text-white flex items-center justify-center shadow-lg"
        >
          <Icons.User />
        </motion.div>
      )}
    </motion.div>
  );
});

MessageBubble.displayName = "MessageBubble";

const Header: React.FC<{
  onClear: () => void;
  messageCount: number;
  selectedModel: string;
  onModelChange: (m: string) => void;
  customModel: string;
  onCustomModelChange: (m: string) => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
}> = ({
  onClear,
  messageCount,
  selectedModel,
  onModelChange,
  customModel,
  onCustomModelChange,
  isSettingsOpen,
  onToggleSettings,
}) => (
  <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
          <Icons.Bot />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">AI 助手</h1>
          <p className="text-sm text-gray-500">由 Ollama 提供支援</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>{messageCount} 則對話</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSettings}
          className={`p-2 rounded-lg transition-colors ${
            isSettingsOpen
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Icons.Settings />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Icons.Clear />
        </motion.button>
      </div>
    </div>

    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI 模型
              </label>
              <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="gpt-oss">GPT OSS</option>
                <option value="gemma2:7b">Gemma 3 27B</option>
                <option value="llama2:13b">Gemma 3 Latest</option>
                <option value="deepseek-r1:32b">DeepSeek R1 32B</option>
                <option value="custom">自訂模型...</option>
              </select>
            </div>

            {selectedModel === "custom" && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自訂模型名稱
                </label>
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => onCustomModelChange(e.target.value)}
                  placeholder="輸入模型名稱"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(MODEL_NAME);
  const [customModel, setCustomModel] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  // 使用 useCallback 優化事件處理
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    setBannerError(null);
    const now = Date.now();
    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: now,
      id: generateId(),
    };
    const aiPlaceholder: Message = {
      role: "assistant",
      content: "",
      timestamp: now,
      id: generateId(),
    };

    setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
    setInput("");
    setLoading(true);

    const maxRetries = 3;
    let attempt = 0;
    let success = false;
    let finalReply = "";

    while (attempt <= maxRetries && !success) {
      try {
        const payload = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const modelToUse =
          selectedModel === "custom"
            ? customModel || MODEL_NAME
            : selectedModel;
        const res = await fetch(OLLAMA_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: modelToUse, messages: payload }),
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
  }, [input, selectedModel, customModel]);

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

  const confirmAndClear = useCallback(() => {
    setConfirmClear(true);
  }, []);

  const doClear = useCallback(() => {
    setMessages([]);
    setConfirmClear(false);
  }, []);

  const handleModelChange = useCallback((m: string) => {
    setSelectedModel(m);
  }, []);

  const handleCustomModelChange = useCallback((m: string) => {
    setCustomModel(m);
  }, []);

  const toggleSettings = useCallback(() => {
    setIsSettingsOpen(!isSettingsOpen);
  }, [isSettingsOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        <Header
          onClear={confirmAndClear}
          messageCount={messages.length}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          customModel={customModel}
          onCustomModelChange={handleCustomModelChange}
          isSettingsOpen={isSettingsOpen}
          onToggleSettings={toggleSettings}
        />

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
                        "幫我分析數據",
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

              <div className="flex gap-4">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="輸入您的訊息... (Shift+Enter 換行，Enter 送出)"
                    rows={1}
                    className="w-full p-4 rounded-2xl border border-gray-300 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-400"
                    disabled={loading}
                    style={{ minHeight: "56px", maxHeight: "200px" }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: loading || !input.trim() ? 1 : 1.05 }}
                  whileTap={{ scale: loading || !input.trim() ? 1 : 0.95 }}
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className={`px-6 py-4 rounded-2xl font-medium transition-all duration-200 shadow-lg ${
                    input.trim() && !loading
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:from-blue-700 hover:to-purple-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-sm"
                  }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icons.Send />
                  )}
                </motion.button>
              </div>

              <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>
                    自動滾動：
                    <span
                      className={`ml-1 font-medium ${
                        autoScrollEnabled ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      {autoScrollEnabled ? "開啟" : "關閉"}
                    </span>
                  </span>
                </div>
                <div>
                  當前模型：
                  <span className="ml-1 font-medium text-blue-600">
                    {selectedModel === "custom"
                      ? customModel || "自訂"
                      : selectedModel}
                  </span>
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

      <AnimatePresence>
        {confirmClear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setConfirmClear(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 rounded-2xl shadow-2xl max-w-md mx-4"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                  <Icons.Clear />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  清除所有對話
                </h3>
                <p className="text-gray-600 mb-6">
                  確定要清除所有對話記錄嗎？此操作無法復原。
                </p>
                <div className="flex gap-3 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setConfirmClear(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={doClear}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    確定清除
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;
