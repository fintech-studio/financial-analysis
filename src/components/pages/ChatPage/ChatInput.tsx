import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/pages/ChatPage/ChatCommon";

type SetBool = (v: boolean | ((s: boolean) => boolean)) => void;

interface Props {
  input: string;
  setInput: (s: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  canSend: boolean;
  sendMessage: () => Promise<void> | void;
  stopStreaming: () => void;
  loading: boolean;
  selectedModel: string;
  setSelectedModel: (s: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: SetBool;
  availableModels: string[];
}

const ChatInput: React.FC<Props> = ({
  input,
  setInput,
  textareaRef,
  fileInputRef,
  handleFileUpload,
  handleKeyDown,
  canSend,
  sendMessage,
  stopStreaming,
  loading,
  selectedModel,
  setSelectedModel,
  isSettingsOpen,
  setIsSettingsOpen,
  availableModels,
}) => {
  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,text/*,.pdf,.doc,.docx,.json,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.xml,.md,.csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="relative">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm">
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

            <div className="flex items-center gap-2">
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsSettingsOpen((s) => !s)}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                  type="button"
                  title="切換模型"
                >
                  <span className="text-sm text-gray-500">當前模型：</span>
                  <span className="font-medium text-blue-600 text-sm">
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
                            type="button"
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

            <motion.button
              type="button"
              title="停止回覆"
              whileHover={{ scale: loading ? 1.02 : 1 }}
              whileTap={{ scale: loading ? 0.98 : 1 }}
              onClick={() => stopStreaming()}
              disabled={!loading}
              aria-label="停止回覆"
              className={`flex items-center justify-center w-10 h-10 rounded-md text-white transition-all duration-200 mr-1 ${
                loading
                  ? "bg-red-500 hover:shadow-md"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <rect
                  x="6"
                  y="6"
                  width="12"
                  height="12"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>

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
                  ? "bg-linear-to-r from-blue-600 to-purple-600 hover:shadow-xl"
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
  );
};

export default ChatInput;
