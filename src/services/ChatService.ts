import type { Message } from "@/components/pages/Chat/common";

const OLLAMA_API_URL = "/api/ollama-proxy";
const MODEL_NAME = "gpt-oss";

export type FileEntry = {
  name: string;
  type: string;
  content: string;
};

type Params = {
  input: string;
  attachedFiles: FileEntry[];
  attachedImages: string[];
  messages: Message[];
  selectedModel: string;
  generateId: () => string;
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
  setInput: (v: string) => void;
  setAttachedFiles: (
    v: FileEntry[] | ((p: FileEntry[]) => FileEntry[])
  ) => void;
  setAttachedImages: (v: string[] | ((p: string[]) => string[])) => void;
  setLoading: (b: boolean) => void;
  setBannerError: (s: string | null) => void;
  replaceLastAssistantContent: (content: string) => void;
  abortControllerRef: { current: AbortController | null };
};

export async function sendMessageService({
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
}: Params) {
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
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const res = await fetch(OLLAMA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelToUse, messages: messagePayload }),
        signal: controller.signal,
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
                replaceLastAssistantContent(reply);
              }
            } catch {
              // ignore unparsable lines
            }
          }
        }
      }

      finalReply = reply || "（無回應）";
      success = true;
      abortControllerRef.current = null;
    } catch (e: unknown) {
      if ((e as DOMException)?.name === "AbortError") {
        setBannerError("已停止");
        replaceLastAssistantContent("（已停止）");
        break;
      }
      attempt += 1;
      if (attempt > maxRetries) {
        const msg = e instanceof Error ? e.message || "發生錯誤" : "未知錯誤";
        setBannerError(`請求失敗：${msg} (嘗試 ${attempt} 次)`);
        replaceLastAssistantContent(`（回應失敗） ${msg}`);
        break;
      }
      const wait = Math.pow(2, attempt) * 500;
      await new Promise((r) => setTimeout(r, wait));
    }
  }

  if (success) replaceLastAssistantContent(finalReply);
  abortControllerRef.current = null;
  setLoading(false);
}

export function stopStreamingService(abortControllerRef: {
  current: AbortController | null;
}) {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
  }
}
