import React, { useState, useMemo, useCallback, memo } from "react";
import patterns, {
  Pattern,
  KLineData,
  PatternType,
  SignalStrength,
} from "./patterns";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EqualsIcon,
} from "@heroicons/react/24/outline";

// 型態類型顏色
const getTypeColor = (type: PatternType) => {
  switch (type) {
    case PatternType.REVERSAL:
      return "bg-red-100 text-red-800";
    case PatternType.CONTINUATION:
      return "bg-blue-100 text-blue-800";
    case PatternType.INDECISION:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// 看漲看跌指示器
const getBullishColor = (bullish: boolean | null) => {
  if (bullish === true) return "text-green-600";
  if (bullish === false) return "text-red-600";
  return "text-gray-600";
};
const getBullishIcon = (bullish: boolean | null) => {
  if (bullish === true)
    return <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />;
  if (bullish === false)
    return <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />;
  return <EqualsIcon className="h-5 w-5 text-gray-600" />;
};

// 信號強度色條
const getStrengthBar = (strength: SignalStrength) => {
  switch (strength) {
    case SignalStrength.STRONG:
      return (
        <div className="h-1 w-16 bg-green-500 rounded-full" title="強"></div>
      );
    case SignalStrength.MODERATE:
      return (
        <div className="h-1 w-10 bg-yellow-400 rounded-full" title="中"></div>
      );
    case SignalStrength.WEAK:
      return (
        <div className="h-1 w-6 bg-gray-400 rounded-full" title="弱"></div>
      );
    default:
      return null;
  }
};

// 型態卡片元件 - 使用 memo 優化
const PatternCard: React.FC<{
  pattern: Pattern;
  highlight?: boolean;
  onClick?: () => void;
}> = memo(({ pattern, highlight = false, onClick }) => (
  <div
    className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
      highlight
        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg"
        : "bg-gray-50 border-gray-200 hover:shadow-md hover:border-gray-300"
    }`}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && onClick?.()}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <span className={`text-2xl ${getBullishColor(pattern.bullish)}`}>
          {getBullishIcon(pattern.bullish)}
        </span>
        <div>
          <h4 className="text-lg font-bold text-gray-800">{pattern.name}</h4>
          <p className="text-sm text-gray-600">{pattern.enName}</p>
        </div>
      </div>
      <div className="text-right">
        <div
          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
            pattern.type
          )}`}
        >
          {pattern.type === PatternType.REVERSAL && "反轉"}
          {pattern.type === PatternType.CONTINUATION && "延續"}
          {pattern.type === PatternType.INDECISION && "猶豫"}
        </div>
        <div className="mt-1">{getStrengthBar(pattern.strength)}</div>
      </div>
    </div>
    <p className="text-gray-700 mb-2">{pattern.description}</p>
  </div>
));

interface KLinePatternProps {
  candlestickData: KLineData[];
  showAdvancedMetrics?: boolean;
  maxPatternsToShow?: number;
  customPatterns?: Pattern[];
  onPatternDetected?: (patterns: Pattern[]) => void;
  enableCache?: boolean;
  historicalDays?: number;
}

const HISTORY_PAGE_SIZE = 10;

const KLinePattern: React.FC<KLinePatternProps> = ({
  candlestickData,
  maxPatternsToShow = 5,
  customPatterns = [],
  enableCache = true,
  historicalDays = 30,
  onPatternDetected,
}) => {
  // 狀態管理
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [filterType, setFilterType] = useState<PatternType | "all">("all");
  const [sortBy, setSortBy] = useState<"strength" | "name">("strength");

  // 取最新三根K線
  const len = candlestickData?.length || 0;
  const data = len > 0 ? candlestickData[len - 1] : undefined;
  const prevData = len > 1 ? candlestickData[len - 2] : undefined;
  const prev2Data = len > 2 ? candlestickData[len - 3] : undefined;

  // 合併預設型態和自訂型態
  const allPatterns = useMemo(
    () => [...patterns, ...customPatterns],
    [customPatterns]
  );

  // 找出所有匹配的型態
  const matchedPatterns = useMemo(() => {
    if (!data) return [];

    return allPatterns.filter((pattern) =>
      pattern.check(data, prevData, prev2Data, candlestickData)
    );
  }, [allPatterns, data, prevData, prev2Data, candlestickData]);

  // 過濾和排序型態
  const filteredAndSortedPatterns = useMemo(() => {
    let filtered = matchedPatterns;

    // 型態類型過濾
    if (filterType !== "all") {
      filtered = filtered.filter((pattern) => pattern.type === filterType);
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "strength":
        default:
          const strengthOrder = { strong: 3, moderate: 2, weak: 1 };
          return strengthOrder[b.strength] - strengthOrder[a.strength];
      }
    });

    return filtered.slice(0, maxPatternsToShow);
  }, [matchedPatterns, filterType, sortBy, maxPatternsToShow]);

  // 觸發回調
  React.useEffect(() => {
    if (onPatternDetected && matchedPatterns.length > 0) {
      onPatternDetected(matchedPatterns);
    }
  }, [matchedPatterns, onPatternDetected]);

  // 歷史型態偵測（使用可配置天數）
  const historicalPatterns = useMemo(() => {
    if (!candlestickData || candlestickData.length === 0) return [];
    const now = new Date();
    const DAYS_MS = 1000 * 60 * 60 * 24 * historicalDays;
    const result: Array<{
      date?: string;
      index: number;
      pattern: Pattern;
    }> = [];

    for (let i = 0; i < candlestickData.length; i++) {
      const data = candlestickData[i];
      if (!data.date) continue;

      const dateObj = new Date(data.date);
      if (
        isNaN(dateObj.getTime()) ||
        now.getTime() - dateObj.getTime() > DAYS_MS
      )
        continue;

      const prevData = i > 0 ? candlestickData[i - 1] : undefined;
      const prev2Data = i > 1 ? candlestickData[i - 2] : undefined;

      allPatterns.forEach((pattern) => {
        if (pattern.check(data, prevData, prev2Data, candlestickData)) {
          result.push({
            date: data.date,
            index: i,
            pattern,
          });
        }
      });
    }

    return result.sort((a, b) => b.index - a.index);
  }, [candlestickData, allPatterns, historicalDays]);

  // 分頁狀態
  const [historyPage, setHistoryPage] = useState(1);
  const totalHistoryPages = Math.ceil(
    historicalPatterns.length / HISTORY_PAGE_SIZE
  );

  const primaryPattern = filteredAndSortedPatterns[0];

  const openHistoryInNewTab = useCallback(
    (
      historicalPatterns: Array<{
        date?: string;
        index: number;
        pattern: Pattern;
      }>,
      HISTORY_PAGE_SIZE: number
    ) => {
      const html = `<!DOCTYPE html>
    <html lang='zh-TW'>
    <head>
      <meta charset='UTF-8' />
      <title>K線歷史型態分析</title>
      <style>
        body { 
          font-family: system-ui, -apple-system, sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0; padding: 2rem; min-height: 100vh;
        }
        .container {
          max-width: 1200px; margin: 0 auto; background: white;
          border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white; padding: 2rem; text-align: center;
        }
        .stats {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem; padding: 1.5rem; background: #f8fafc;
        }
        .stat-card {
          background: white; padding: 1rem; border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;
        }
        table { 
          border-collapse: collapse; width: 100%; 
          font-size: 0.9rem;
        }
        th, td { 
          border-bottom: 1px solid #e5e7eb; 
          padding: 0.75rem; text-align: left; 
        }
        th { 
          background: #f9fafb; font-weight: 600;
          position: sticky; top: 0; z-index: 10;
        }
        tr:hover { background: #f9fafb; }
        .pagination { 
          padding: 1.5rem; display: flex; justify-content: center; 
          align-items: center; gap: 1rem; background: #f8fafc;
        }
        .btn { 
          padding: 0.5rem 1rem; border-radius: 6px; border: none; 
          background: #4f46e5; color: white; cursor: pointer;
          font-size: 0.875rem; transition: all 0.2s;
        }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; background: #9ca3af; }
        .btn:hover:not(:disabled) { background: #4338ca; transform: translateY(-1px); }
        .pattern-type { 
          padding: 0.25rem 0.5rem; border-radius: 4px; 
          font-size: 0.75rem; font-weight: 500;
        }
        .type-reversal { background: #fee2e2; color: #991b1b; }
        .type-continuation { background: #dbeafe; color: #1e40af; }
        .type-indecision { background: #f3f4f6; color: #374151; }
      </style>
    </head>
    <body>
      <div class='container'>
        <div class='header'>
          <h1>📊 K線歷史型態分析</h1>
          <p>最近 ${historicalDays} 天的型態統計</p>
        </div>
        
        <div class='stats' id='stats-container'></div>
        
        <div id='table-container'></div>
        
        <div class='pagination' id='pagination-container'></div>
      </div>
      
      <script>
        const patterns = ${JSON.stringify(historicalPatterns)};
        const HISTORY_PAGE_SIZE = ${HISTORY_PAGE_SIZE};
        let page = 1;
        
        // 統計數據
        const stats = {
          total: patterns.length,
          reversal: patterns.filter(p => p.pattern.type === 'reversal').length,
          continuation: patterns.filter(p => p.pattern.type === 'continuation').length,
          indecision: patterns.filter(p => p.pattern.type === 'indecision').length,
        };
        
        function renderStats() {
          const container = document.getElementById('stats-container');
          container.innerHTML = \`
            <div class='stat-card'>
              <div style='font-size: 2rem; color: #4f46e5; margin-bottom: 0.5rem;'>
                \${stats.total}
              </div>
              <div style='color: #6b7280; font-size: 0.875rem;'>總型態數</div>
            </div>
            <div class='stat-card'>
              <div style='font-size: 2rem; color: #dc2626; margin-bottom: 0.5rem;'>
                \${stats.reversal}
              </div>
              <div style='color: #6b7280; font-size: 0.875rem;'>反轉型態</div>
            </div>
            <div class='stat-card'>
              <div style='font-size: 2rem; color: #2563eb; margin-bottom: 0.5rem;'>
                \${stats.continuation}
              </div>
              <div style='color: #6b7280; font-size: 0.875rem;'>延續型態</div>
            </div>
            <div class='stat-card'>
              <div style='font-size: 2rem; color: #6b7280; margin-bottom: 0.5rem;'>
                \${stats.indecision}
              </div>
              <div style='color: #6b7280; font-size: 0.875rem;'>猶豫型態</div>
            </div>
          \`;
        }
        
        function getTypeText(type) {
          return type === 'reversal' ? '反轉' : 
                 type === 'continuation' ? '延續' : '猶豫';
        }
        
        function getTypeClass(type) {
          return type === 'reversal' ? 'type-reversal' : 
                 type === 'continuation' ? 'type-continuation' : 'type-indecision';
        }
        
        function getBullishIcon(bullish) {
          return bullish === true ? "📈" : 
                 bullish === false ? "📉" : "➖";
        }
        
        function renderTable() {
          const start = (page - 1) * HISTORY_PAGE_SIZE;
          const paged = patterns.slice(start, start + HISTORY_PAGE_SIZE);
          
          let html = \`
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>日期</th>
                  <th>型態名稱</th>
                  <th>型態類型</th>
                  <th>多空</th>
                </tr>
              </thead>
              <tbody>
          \`;
          
          if (paged.length === 0) {
            html += \`<tr><td colspan='5' style='text-align: center; padding: 2rem; color: #6b7280;'>
              無歷史型態紀錄</td></tr>\`;
          } else {
            paged.forEach((item, idx) => {
              html += \`
                <tr>
                  <td>\${start + idx + 1}</td>
                  <td>\${item.date || ('#' + (item.index + 1))}</td>
                  <td><strong>\${item.pattern.name}</strong><br>
                      <small style='color: #6b7280;'>\${item.pattern.enName}</small></td>
                  <td><span class='pattern-type \${getTypeClass(item.pattern.type)}'>
                      \${getTypeText(item.pattern.type)}</span></td>
                  <td style='font-size: 1.25rem;'>\${getBullishIcon(item.pattern.bullish)}</td>
                </tr>
              \`;
            });
          }
          
          html += \`</tbody></table>\`;
          document.getElementById('table-container').innerHTML = html;
        }
        
        function renderPagination() {
          const totalPages = Math.ceil(patterns.length / HISTORY_PAGE_SIZE);
          const container = document.getElementById('pagination-container');
          
          let html = \`
            <button class='btn' onclick='prevPage()' \${page === 1 ? 'disabled' : ''}>
              ← 上一頁
            </button>
            <span style='color: #6b7280; font-size: 0.875rem;'>
              第 \${page} / \${totalPages} 頁 (共 \${patterns.length} 筆)
            </span>
            <button class='btn' onclick='nextPage()' \${page === totalPages ? 'disabled' : ''}>
              下一頁 →
            </button>
          \`;
          
          container.innerHTML = html;
        }
        
        function prevPage() { 
          if (page > 1) { 
            page--; 
            renderTable(); 
            renderPagination(); 
          } 
        }
        
        function nextPage() { 
          const totalPages = Math.ceil(patterns.length / HISTORY_PAGE_SIZE);
          if (page < totalPages) { 
            page++; 
            renderTable(); 
            renderPagination(); 
          } 
        }
        
        // 初始化
        renderStats();
        renderTable();
        renderPagination();
      </script>
    </body>
    </html>`;

      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    },
    [historicalDays]
  );

  // 浮動說明視窗狀態
  const [popup, setPopup] = useState<{
    pattern: Pattern;
    x: number;
    y: number;
  } | null>(null);

  // 點擊卡片顯示浮窗
  const handlePatternCardClick = useCallback(
    (pattern: Pattern) => (e: React.MouseEvent) => {
      e.stopPropagation();
      setPopup({
        pattern,
        x: e.clientX,
        y: e.clientY,
      });
    },
    []
  );

  // 點擊其他地方關閉浮窗
  React.useEffect(() => {
    if (!popup) return;
    const close = () => setPopup(null);
    window.addEventListener("mousedown", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [popup]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-800">K線型態分析</h3>
          {enableCache && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
              快取已啟用
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {/* 過濾器 */}
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as PatternType | "all")
            }
            className="text-sm px-2 py-1 border rounded"
          >
            <option value="all">所有型態</option>
            <option value={PatternType.REVERSAL}>反轉型態</option>
            <option value={PatternType.CONTINUATION}>延續型態</option>
            <option value={PatternType.INDECISION}>猶豫型態</option>
          </select>

          {/* 排序 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "strength" | "name")}
            className="text-sm px-2 py-1 border rounded"
          >
            <option value="strength">信號強度</option>
            <option value="name">名稱</option>
          </select>

          <button
            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
            onClick={() =>
              openHistoryInNewTab(historicalPatterns, HISTORY_PAGE_SIZE)
            }
          >
            查看最近 {historicalDays} 天的歷史型態 ({historicalPatterns.length})
          </button>
        </div>
      </div>

      {/* 主要型態 */}
      {!data ? (
        <div className="text-center py-8">
          <p className="text-gray-500">暫無K線數據</p>
        </div>
      ) : primaryPattern ? (
        <div>
          {/* 主要型態 */}
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span
                  className={`text-2xl ${getBullishColor(
                    primaryPattern.bullish
                  )}`}
                >
                  {getBullishIcon(primaryPattern.bullish)}
                </span>
                <div>
                  <h4 className="text-lg font-bold text-gray-800">
                    {primaryPattern.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {primaryPattern.enName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                    primaryPattern.type
                  )}`}
                >
                  {primaryPattern.type === PatternType.REVERSAL && "反轉"}
                  {primaryPattern.type === PatternType.CONTINUATION && "延續"}
                  {primaryPattern.type === PatternType.INDECISION && "猶豫"}
                </div>
                <div className="mt-1">
                  {getStrengthBar(primaryPattern.strength)}
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-2">{primaryPattern.description}</p>
          </div>

          {/* 其他檢測到的型態 */}
          {filteredAndSortedPatterns.length > 1 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-700 mb-3">
                其他檢測型態 ({filteredAndSortedPatterns.length - 1} 個)
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                {filteredAndSortedPatterns.slice(1).map((pattern, index) => (
                  <PatternCard
                    key={index}
                    pattern={pattern}
                    onClick={() => setSelectedPattern(pattern)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-500 mb-1">未發現明顯型態</p>
          <p className="text-xs text-gray-400">
            當前K線數據不符合任何已知的技術分析型態
          </p>

          {/* 顯示當前數據摘要 */}
          {data && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg max-w-md mx-auto">
              <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                <div>開盤: {data.open.toFixed(2)}</div>
                <div>收盤: {data.close.toFixed(2)}</div>
                <div>最高: {data.high.toFixed(2)}</div>
                <div>最低: {data.low.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 移除浮動詳細說明視窗 */}
    </div>
  );
};

// 設置組件顯示名稱以便調試
KLinePattern.displayName = "KLinePattern";
PatternCard.displayName = "PatternCard";

export default memo(KLinePattern);
