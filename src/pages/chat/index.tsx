import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "@/components/pages/Chat/MessageBubble";
import { Message, Icons } from "@/components/pages/Chat/common";
import AttachPreview from "@/components/pages/Chat/AttachPreview";
import ChatInput from "@/components/pages/Chat/ChatInput";
import { sendMessageService } from "@/services/ChatService";

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
    "llama3.2-vision:latest",
    "llava:latest",
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
  const abortControllerRef = useRef<AbortController | null>(null);

  // 生成唯一ID的函數
  const generateId = useCallback(
    () => Math.random().toString(36).slice(2, 11),
    []
  );

  // helper: 找到最後一個 assistant 訊息的索引
  const findLastAssistantIndex = useCallback((arr: Message[]) => {
    return arr.map((m) => m.role).lastIndexOf("assistant");
  }, []);

  // helper: 用於替換最後一個 assistant 訊息內容
  const replaceLastAssistantContent = useCallback(
    (content: string) => {
      setMessages((prev) => {
        const copy = prev.slice();
        const idx = findLastAssistantIndex(copy);
        if (idx >= 0) copy[idx] = { ...copy[idx], content };
        return copy;
      });
    },
    [findLastAssistantIndex]
  );

  // auto scroll to bottom on messages change when enabled
  useEffect(() => {
    if (autoScrollEnabled)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, autoScrollEnabled]);

  // autofocus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // inject global hide-scrollbar style on client only
  useEffect(() => {
    const styleId = "hide-scrollbar-global-style";
    if (typeof document === "undefined") return;
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

  // sendMessage wrapper calls service (logic extracted to services/ChatService)
  const sendMessage = useCallback(async () => {
    await sendMessageService({
      input,
      attachedFiles,
      attachedImages,
      messages,
      selectedModel,
      generateId,
      setMessages,
      setInput,
      setAttachedFiles,
      setAttachedImages,
      setLoading,
      setBannerError,
      replaceLastAssistantContent,
      abortControllerRef,
    });
  }, [
    input,
    attachedFiles,
    attachedImages,
    messages,
    selectedModel,
    generateId,
    setMessages,
    setInput,
    setAttachedFiles,
    setAttachedImages,
    setLoading,
    setBannerError,
    replaceLastAssistantContent,
  ]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }, []);

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
        <div className="w-full max-w-7xl h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 mt-20">
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
                            正在思考中...
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

                {/* 檔案預覽區域 - 已移出為元件 */}
                <AttachPreview
                  attachedFiles={attachedFiles}
                  attachedImages={attachedImages}
                  removeAttachedFile={removeAttachedFile}
                  removeAttachedImage={removeAttachedImage}
                />

                {/* Input area - 抽成元件 */}
                <ChatInput
                  input={input}
                  setInput={setInput}
                  textareaRef={textareaRef}
                  fileInputRef={fileInputRef}
                  handleFileUpload={handleFileUpload}
                  handleKeyDown={handleKeyDown}
                  canSend={canSend}
                  sendMessage={sendMessage}
                  stopStreaming={stopStreaming}
                  loading={loading}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  isSettingsOpen={isSettingsOpen}
                  setIsSettingsOpen={setIsSettingsOpen}
                  availableModels={availableModels}
                />

                {/* model selector moved into input area above */}
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
    </>
  );
};

export default Chat;
