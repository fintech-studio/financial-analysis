import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

export interface SentimentData {
  overall: number; // 0-100範圍，50為中立
  bullish: number; // 看多百分比
  bearish: number; // 看空百分比
  neutral: number; // 中立百分比
  change: number; // 相較前一天變化
}

interface MarketSentimentCardProps {
  sentiment: SentimentData;
  compact?: boolean;
}

const MarketSentimentCard: React.FC<MarketSentimentCardProps> = ({
  sentiment,
  compact = false,
}) => {
  // 確定情緒狀態
  const getSentimentLevel = (value: number): string => {
    if (value >= 70) return "extremely-bullish";
    if (value >= 60) return "bullish";
    if (value >= 45) return "neutral-bullish";
    if (value >= 40) return "neutral";
    if (value >= 30) return "neutral-bearish";
    if (value >= 20) return "bearish";
    return "extremely-bearish";
  };

  const sentimentLevel = getSentimentLevel(sentiment.overall);

  const getSentimentText = (level: string): string => {
    switch (level) {
      case "extremely-bullish":
        return "極度看多";
      case "bullish":
        return "看多";
      case "neutral-bullish":
        return "偏多";
      case "neutral":
        return "中立";
      case "neutral-bearish":
        return "偏空";
      case "bearish":
        return "看空";
      case "extremely-bearish":
        return "極度看空";
      default:
        return "中立";
    }
  };

  const getSentimentColor = (level: string): string => {
    switch (level) {
      case "extremely-bullish":
        return "text-green-600";
      case "bullish":
        return "text-green-500";
      case "neutral-bullish":
        return "text-green-400";
      case "neutral":
        return "text-gray-500";
      case "neutral-bearish":
        return "text-red-400";
      case "bearish":
        return "text-red-500";
      case "extremely-bearish":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-3">
        <div>
          <div
            className={`text-xl font-bold ${getSentimentColor(sentimentLevel)}`}
          >
            {getSentimentText(sentimentLevel)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            指數: {sentiment.overall.toFixed(1)}
            <span
              className={`ml-2 ${
                sentiment.change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {sentiment.change >= 0 ? "+" : ""}
              {sentiment.change.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* 情緒指標條 */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full ${
            sentimentLevel.includes("bullish")
              ? "bg-green-500"
              : sentimentLevel === "neutral"
              ? "bg-gray-400"
              : "bg-red-500"
          }`}
          style={{ width: `${sentiment.overall}%` }}
        />
      </div>

      {!compact && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <div className="text-xs text-gray-500">看多</div>
            <div className="text-green-600 font-medium">
              {sentiment.bullish}%
            </div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500">中立</div>
            <div className="text-gray-600 font-medium">
              {sentiment.neutral}%
            </div>
          </div>
          <div className="p-2 bg-red-50 rounded-lg">
            <div className="text-xs text-gray-500">看空</div>
            <div className="text-red-600 font-medium">{sentiment.bearish}%</div>
          </div>
        </div>
      )}

      {compact && (
        <div className="flex justify-between text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-gray-600">看多 {sentiment.bullish}%</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-gray-600">看空 {sentiment.bearish}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketSentimentCard;
