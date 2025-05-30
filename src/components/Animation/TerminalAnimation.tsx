import React, { useState, useEffect, useRef } from "react";

interface CommandLine {
  cmd: string;
  delay: number;
  loading?: string;
  loadingTime?: number;
  response: Array<{
    text: string;
    type: string;
  }>;
}

interface TerminalLine {
  text: string | React.ReactNode;
  type: string;
  typing?: boolean;
  fullText?: string;
}

interface ResponseItem {
  text: string;
  type: string;
}

const commands: CommandLine[] = [
  {
    cmd: "finanalytics-core --init",
    delay: 500,
    loading: "系統初始化中...",
    loadingTime: 2000,
    response: [
      { text: "FinAnalytics v0.1.2 核心引擎已啟動", type: "system" },
      { text: "✓ 系統載入完成", type: "success" },
      { text: "✓ 數據連接就緒", type: "success" },
      { text: "✓ 安全通道已建立", type: "success" },
      { text: "✓ 數據來源: 全球金融市場", type: "success" },
      { text: "✓ AI 預測引擎已載入: Fintech-Finance v1.2", type: "success" },
      { text: "", type: "spacer" },
    ],
  },
  {
    cmd: "market --global-status --detail",
    delay: 1000,
    loading: "獲取全球市場數據...",
    loadingTime: 2500,
    response: [
      { text: "=== 全球市場概況 ===", type: "header" },
      { text: "亞太市場", type: "subheader" },
      {
        text: "▲ 台灣加權: 18,856 (+1.2%) 成交量:2,530億",
        type: "data-positive",
      },
      {
        text: "▲ 日經225: 39,450 (+0.8%) 成交量:3,120億",
        type: "data-positive",
      },
      { text: "美歐市場", type: "subheader" },
      {
        text: "▼ 道瓊工業: 38,250 (-0.3%) 成交量:8,230億",
        type: "data-negative",
      },
      {
        text: "▲ 那斯達克: 16,380 (+0.5%) 成交量:5,890億",
        type: "data-positive",
      },
      { text: "", type: "spacer" },
    ],
  },
  {
    cmd: "ai --analyze --sector tech",
    delay: 1200,
    loading: "分析科技產業中...",
    loadingTime: 2000,
    response: [
      { text: "=== AI 分析結果 ===", type: "header" },
      { text: "產業趨勢: 看好 ↗", type: "data-positive" },
      { text: "風險程度: 中等", type: "data-neutral" },
      { text: "建議: 分批進場", type: "info" },
      { text: "", type: "spacer" },
    ],
  },
  {
    cmd: "macro --economic-indicators",
    delay: 1000,
    loading: "分析總體經濟指標...",
    loadingTime: 2000,
    response: [
      { text: "=== 總體經濟指標 ===", type: "header" },
      { text: "• 美國CPI年增率: 3.1%", type: "data-negative" },
      { text: "• 聯邦基準利率: 5.25-5.50%", type: "data-neutral" },
      { text: "• 美國GDP季增率: 2.1%", type: "data-positive" },
      { text: "• 全球PMI指數: 51.2", type: "data-positive" },
      { text: "", type: "spacer" },
    ],
  },
  {
    cmd: "risk --scan",
    delay: 1000,
    loading: "掃描風險...",
    loadingTime: 1500,
    response: [
      { text: "=== 風險掃描 ===", type: "header" },
      { text: "❗ 通膨壓力升溫", type: "data-negative" },
      { text: "❗ 升息疑慮仍在", type: "data-negative" },
      { text: "建議持續觀察", type: "info" },
      { text: "", type: "spacer" },
    ],
  },
  {
    cmd: "sentiment --analysis --source all",
    delay: 1000,
    loading: "分析市場情緒...",
    loadingTime: 2200,
    response: [
      { text: "=== 市場情緒分析 ===", type: "header" },
      { text: "社群媒體情緒: 偏多", type: "data-positive" },
      { text: "機構投資者信心指數: 62 (看好)", type: "data-positive" },
      { text: "散戶恐慌指數: 35 (低度恐慌)", type: "data-neutral" },
      { text: "建議策略: 逢回分批布局", type: "info" },
      { text: "", type: "spacer" },
    ],
  },
  {
    cmd: "news --latest",
    delay: 1000,
    loading: "獲取最新新聞...",
    loadingTime: 2000,
    response: [
      { text: "=== 最新新聞 ===", type: "header" },
      { text: "1. 台股收紅，科技股領漲", type: "news" },
      { text: "2. 美股震盪，投資人觀望", type: "news" },
      { text: "3. 聯準會官員發表鷹派言論", type: "news" },
      { text: "4. 全球經濟數據持平，市場觀望", type: "news" },
      { text: "", type: "spacer" },
    ],
  },
];

const TerminalAnimation = () => {
  // 基本狀態
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: "金融分析智能終端 v3.0.1", type: "system" },
    { text: "© 2025 金融走勢智慧分析平台", type: "system" },
    { text: "正在連接加密安全通道...", type: "system" },
    { text: "連接成功! 正在讀取市場數據...", type: "success" },
    { text: "", type: "spacer" },
  ]);

  // 控制狀態
  const [commandIndex, setCommandIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  // 參考
  const containerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 自動滾動
  useEffect(() => {
    const scrollToBottom = () => {
      if (containerRef.current) {
        const { scrollHeight, clientHeight } = containerRef.current;
        containerRef.current.scrollTo({
          top: scrollHeight - clientHeight,
          behavior: "smooth",
        });
      }
    };

    scrollToBottom();
  }, [lines]);

  // 執行命令
  useEffect(() => {
    let isMounted = true; // 新增：檢查組件是否仍然掛載

    const executeCommand = async () => {
      if (!isMounted) return;

      // 檢查是否正在執行命令
      if (isTyping || isLoading || isResponding) return;

      // 檢查是否需要重置
      if (commandIndex >= commands.length) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        if (!isMounted) return;
        setCommandIndex(0);
        setLines([
          { text: "金融分析智能終端 v3.0.1", type: "system" },
          { text: "© 2025 智慧金融分析平台", type: "system" },
          { text: "正在連接加密安全通道...", type: "system" },
          { text: "連接成功! 正在讀取市場數據...", type: "success" },
          { text: "", type: "spacer" },
        ]);
        return;
      }

      const command = commands[commandIndex];

      // 開始輸入命令
      setIsTyping(true);
      await typeCommand(command.cmd);
      if (!isMounted) return;
      setIsTyping(false);

      // 顯示載入動畫
      if (command.loading) {
        setIsLoading(true);
        await new Promise((resolve) =>
          setTimeout(resolve, command.loadingTime || 1500)
        );
        if (!isMounted) return;
        setIsLoading(false);
      }

      // 顯示回應
      setIsResponding(true);
      await typeResponse(command.response);
      if (!isMounted) return;
      setIsResponding(false);

      // 在執行完回應後等待
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (!isMounted) return;

      // 準備下一個命令
      await new Promise((resolve) => setTimeout(resolve, command.delay));
      if (!isMounted) return;
      setCommandIndex((prev) => prev + 1);
    };

    executeCommand();

    // 清理函數
    return () => {
      isMounted = false;
    };
  }, [commandIndex]); // 只依賴 commandIndex

  // 打字效果實現
  const typeCommand = async (text: string) => {
    setLines((prev) => [
      ...prev,
      { text: "root@fintech$ ", type: "prompt", typing: true },
    ]);

    for (let i = 0; i < text.length; i++) {
      await new Promise((resolve) => {
        typingTimeoutRef.current = setTimeout(resolve, Math.random() * 30 + 30);
      });

      setLines((prev) => {
        const newLines = [...prev];
        const lastLine = newLines[newLines.length - 1];
        newLines[newLines.length - 1] = {
          ...lastLine,
          text: `root@fintech$ ${text.substring(0, i + 1)}`,
          typing: i < text.length - 1,
        };
        return newLines;
      });
    }
  };

  // 載入動畫效果
  useEffect(() => {
    if (!isLoading) return;

    loadingIntervalRef.current = setInterval(() => {
      setLines((prev) => {
        const newLines = [...prev];
        const lastLine = newLines[newLines.length - 1];
        if (!lastLine?.text) return prev;
        const dots =
          typeof lastLine.text === "string"
            ? lastLine.text.match(/\.+$/)?.[0]?.length || 0
            : 0;
        const newDots = dots >= 3 ? "" : ".".repeat(dots + 1);
        newLines[newLines.length - 1] = {
          ...lastLine,
          text:
            typeof lastLine.text === "string"
              ? lastLine.text.replace(/\.+$/, "") + newDots
              : lastLine.text,
        };
        return newLines;
      });
    }, 300);

    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, [isLoading]);

  // 打字效果實現
  const typeResponse = async (responses: ResponseItem[]) => {
    for (const response of responses) {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 50 + 30)
      );

      setLines((prev) => [
        ...prev,
        {
          text: response.text,
          type: response.type,
          typing: false,
        },
      ]);
    }

    // 在回應結束後添加空行
    setLines((prev) => [...prev, { text: "", type: "spacer" }]);
  };

  // 渲染終端行
  const renderLine = (line: TerminalLine, index: number) => {
    let className = "mb-2 font-mono ";

    switch (line.type) {
      case "prompt":
        className += "text-green-400 font-bold";
        break;
      case "system":
        className += "text-gray-400";
        break;
      case "success":
        className += "text-green-300";
        break;
      case "error":
        className += "text-red-400";
        break;
      case "header":
        className += "text-yellow-300 font-bold mt-1";
        break;
      case "subheader":
        className += "text-blue-300 mt-0.5";
        break;
      case "data-positive":
        className += "text-green-300 pl-4";
        break;
      case "data-negative":
        className += "text-red-300 pl-4";
        break;
      case "data-neutral":
        className += "text-blue-200 pl-4";
        break;
      case "info":
        className += "text-cyan-200 pl-2";
        break;
      case "news":
        className += "text-purple-200 pl-2";
        break;
      case "chart":
        className += "text-amber-200 pl-4";
        break;
      case "conclusion":
        className += "text-green-200 font-bold mt-1";
        break;
      case "loading":
        className += "text-yellow-300 animate-pulse";
        return (
          <div key={index} className={className}>
            {line.text}
          </div>
        );
      default:
        className += "text-blue-200";
    }

    return (
      <div key={index} className={className}>
        {line.text}
        {line.typing && (
          <span className="inline-block w-2 h-4 ml-1 bg-green-500 animate-blink" />
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="terminal-content h-full overflow-y-auto"
      style={{
        msOverflowStyle: "none",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        pointerEvents: "none",
      }}
    >
      <style jsx>{`
        .terminal-content::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {lines.map((line, index) => renderLine(line, index))}
    </div>
  );
};

export default TerminalAnimation;
