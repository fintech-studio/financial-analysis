import React, { useState, useMemo, useCallback } from "react";
import patterns, {
  Pattern,
  KLineData,
  PatternType,
  SignalStrength,
  getBodySize,
  getUpperShadow,
  getLowerShadow,
  getTotalRange,
} from "./patterns";

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
  if (bullish === true) return "↗️";
  if (bullish === false) return "↘️";
  return "↔️";
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

// 型態卡片元件
const PatternCard: React.FC<{
  pattern: Pattern;
  highlight?: boolean;
  onClick?: () => void;
}> = ({ pattern, highlight = false, onClick }) => (
  <div
    className={`p-4 rounded-lg border transition-shadow cursor-pointer ${
      highlight
        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg"
        : "bg-gray-50 border-gray-200 hover:shadow-md"
    }`}
    onClick={onClick}
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
);

interface KLinePatternProps {
  candlestickData: KLineData[];
  showAdvancedMetrics?: boolean;
  maxPatternsToShow?: number;
  customPatterns?: Pattern[];
  onPatternDetected?: (patterns: Pattern[]) => void;
  enableRealTimeAnalysis?: boolean;
}

const KLinePattern: React.FC<KLinePatternProps> = ({
  candlestickData,
  maxPatternsToShow = 5,
  customPatterns = [],
  onPatternDetected,
  enableRealTimeAnalysis = false,
}) => {
  const [analysisHistory, setAnalysisHistory] = useState<
    { timestamp: number; patterns: Pattern[] }[]
  >([]);

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

  // 按信號強度排序
  const sortedPatterns = useMemo(() => {
    const strengthOrder = { strong: 3, moderate: 2, weak: 1 };
    return [...matchedPatterns]
      .sort((a, b) => strengthOrder[b.strength] - strengthOrder[a.strength])
      .slice(0, maxPatternsToShow);
  }, [matchedPatterns, maxPatternsToShow]);

  const primaryPattern = sortedPatterns[0];

  // 觸發回調與歷史紀錄
  React.useEffect(() => {
    if (sortedPatterns.length > 0 && onPatternDetected) {
      onPatternDetected(sortedPatterns);
    }
    if (enableRealTimeAnalysis && sortedPatterns.length > 0) {
      setAnalysisHistory((prev) => [
        ...prev.slice(-19),
        { timestamp: Date.now(), patterns: sortedPatterns },
      ]);
    }
  }, [sortedPatterns, onPatternDetected, enableRealTimeAnalysis]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-gray-800">K線型態分析</h3>
        </div>
      </div>

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
            {/* 詳細說明直接顯示 */}
            <div className="p-4 bg-gray-50 rounded-lg mt-4">
              <p className="text-sm text-gray-700">
                說明：{primaryPattern.detail}
              </p>
            </div>
          </div>

          {/* 其他檢測到的型態 */}
          {sortedPatterns.length > 1 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-700 mb-3">
                其他檢測型態 ({sortedPatterns.length - 1} 個)
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                {sortedPatterns.slice(1).map((pattern, index) => (
                  <PatternCard key={index} pattern={pattern} />
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
        </div>
      )}
    </div>
  );
};

export default KLinePattern;
