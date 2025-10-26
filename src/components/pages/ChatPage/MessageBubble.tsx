import React, { useCallback } from "react";
import { motion } from "framer-motion";
import {
  Message,
  ANIMATION_CONFIG,
  Icons,
} from "@/components/pages/ChatPage/ChatCommon";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSanitize from "rehype-sanitize";

const MessageBubble: React.FC<{
  msg: Message;
  index: number;
  onCopy: (i: number) => void;
  copiedIndex: number | null;
}> = ({ msg, index, onCopy, copiedIndex }) => {
  const isUser = msg.role === "user";
  const handleCopy = useCallback(() => onCopy(index), [onCopy, index]);

  // custom renderer for code blocks / inline code
  const CodeComponent = ({
    inline,
    className,
    children,
  }: {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
  }) => {
    if (inline) {
      return (
        <code className="bg-gray-100 text-sm px-1 py-0.5 rounded-sm">
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-gray-900 text-white rounded-md p-3 overflow-auto text-sm my-2">
        <code className={className}>{children}</code>
      </pre>
    );
  };

  // markdown components to control spacing and link behavior
  const mdComponents: Components = {
    code: CodeComponent as unknown as Components["code"],
    h1: ({ children, ...props }) => (
      <h1 className="text-2xl font-bold mb-4 mt-6" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-xl font-bold mb-3 mt-4" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-lg font-bold mb-2 mt-3" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p className="mb-1" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul className="list-disc ml-5 mb-1" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal ml-5 mb-1" {...props}>
        {children}
      </ol>
    ),
    a: ({ children, href, ...props }) => (
      <a
        className="text-blue-600 underline"
        target="_blank"
        rel="noopener noreferrer"
        href={href}
        {...props}
      >
        {children}
      </a>
    ),
    hr: (props) => <hr className="my-4 border-gray-300" {...props} />,
  };

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
          className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg"
        >
          <Icons.Bot />
        </motion.div>
      )}

      <div
        className={`max-w-[75%] flex flex-col ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {msg.files && msg.files.length > 0 && (
          <div className={`mb-2 ${isUser ? "mr-0" : "ml-0"}`}>
            {msg.files.map((file, fileIndex) => (
              <div
                key={fileIndex}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-1"
              >
                <Icons.File />
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
            ))}
          </div>
        )}

        {msg.images && msg.images.length > 0 && (
          <div className={`mb-2 ${isUser ? "mr-0" : "ml-0"}`}>
            <div className="grid grid-cols-1 gap-2 max-w-xs">
              {msg.images.map((image, imgIndex) => (
                <img
                  key={imgIndex}
                  src={`data:image/jpeg;base64,${image}`}
                  alt={`附件圖片 ${imgIndex + 1}`}
                  className="rounded-lg border border-gray-200 max-w-full h-auto"
                  style={{ maxHeight: "200px" }}
                />
              ))}
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, x: isUser ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`px-5 py-3 rounded-2xl text-sm leading-relaxed transition-all duration-200 shadow-md hover:shadow-lg ${
            isUser
              ? "bg-linear-to-br from-blue-600 to-blue-700 text-white rounded-br-md"
              : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
          }`}
        >
          {/* 使用 react-markdown + rehype-sanitize 安全渲染 markdown */}
          <div className="wrap-break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeSanitize]}
              components={mdComponents}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
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
          className="w-10 h-10 rounded-full bg-linear-to-br from-green-500 to-blue-600 text-white flex items-center justify-center shadow-lg"
        >
          <Icons.User />
        </motion.div>
      )}
    </motion.div>
  );
};

export default React.memo(MessageBubble);
