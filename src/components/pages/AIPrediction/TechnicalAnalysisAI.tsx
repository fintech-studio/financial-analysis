import React, { useState } from "react";

interface TechnicalIndicator {
  name: string;
  value: number;
  change: number;
  status: "bullish" | "bearish" | "neutral";
  description: string;
}

const TechnicalAnalysisAI: React.FC = () => {
  const [indicators] = useState<TechnicalIndicator[]>([
    {
      name: "RSI",
      value: 67.8,
      change: 2.3,
      status: "bullish",
      description: "相對強弱指標顯示股票處於強勢區間",
    },
    {
      name: "MACD",
      value: 12.5,
      change: 1.8,
      status: "bullish",
      description: "MACD線位於信號線上方，呈現多頭趨勢",
    },
    {
      name: "布林通道",
      value: 0.78,
      change: 0.05,
      status: "neutral",
      description: "股價位於布林通道中軌附近",
    },
    {
      name: "KD指標",
      value: 73.2,
      change: -1.5,
      status: "neutral",
      description: "K線與D線呈現鈍化現象",
    },
    {
      name: "威廉指標",
      value: -25.4,
      change: 3.2,
      status: "bullish",
      description: "威廉指標脫離超賣區間",
    },
    {
      name: "成交量",
      value: 1.8,
      change: 0.3,
      status: "bullish",
      description: "成交量放大配合價格上漲",
    },
  ]);

  const [selectedStock, setSelectedStock] = useState("TSMC");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "bullish":
        return "text-green-600 bg-green-100";
      case "bearish":
        return "text-red-600 bg-red-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "bullish":
        return "看多";
      case "bearish":
        return "看空";
      default:
        return "中性";
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  const calculateOverallScore = () => {
    const bullishCount = indicators.filter(
      (i) => i.status === "bullish"
    ).length;
    const neutralCount = indicators.filter(
      (i) => i.status === "neutral"
    ).length;

    const score =
      ((bullishCount * 2 + neutralCount) / (indicators.length * 2)) * 100;
    return Math.round(score);
  };

  const getOverallStatus = () => {
    const score = calculateOverallScore();
    if (score >= 70) return { text: "強勢多頭", color: "text-green-600" };
    if (score >= 50) return { text: "偏多", color: "text-green-500" };
    if (score >= 30) return { text: "偏空", color: "text-red-500" };
    return { text: "弱勢空頭", color: "text-red-600" };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">🔍 技術分析 AI</h3>
        <div className="flex items-center space-x-3">
          <select
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TSMC">台積電 (TSMC)</option>
            <option value="AAPL">蘋果 (AAPL)</option>
            <option value="NVDA">輝達 (NVDA)</option>
            <option value="MSFT">微軟 (MSFT)</option>
          </select>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            查看詳細分析
          </button>
        </div>
      </div>

      {/* 整體評分 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">AI 綜合技術評分</h4>
            <p className="text-sm text-gray-600">基於多項技術指標的綜合分析</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {calculateOverallScore()}
            </div>
            <div className={`text-sm font-medium ${getOverallStatus().color}`}>
              {getOverallStatus().text}
            </div>
          </div>
        </div>

        {/* 評分進度條 */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateOverallScore()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* 技術指標網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {indicators.map((indicator, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">
                {indicator.name}
              </span>
              <span
                className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(
                  indicator.status
                )}`}
              >
                {getStatusText(indicator.status)}
              </span>
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg font-semibold">{indicator.value}</span>
              <span className={`text-sm ${getChangeColor(indicator.change)}`}>
                {indicator.change >= 0 ? "+" : ""}
                {indicator.change}
              </span>
            </div>

            <p className="text-xs text-gray-600">{indicator.description}</p>
          </div>
        ))}
      </div>

      {/* AI分析摘要 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">🤖 AI 技術分析摘要</h4>
        <p className="text-sm text-blue-800 mb-3">
          根據多項技術指標分析，當前{selectedStock}呈現
          {getOverallStatus().text.toLowerCase()}格局。
          RSI和MACD指標顯示強勢信號，建議關注布林通道突破情況。
          成交量配合良好，支撐價格走勢。
        </p>

        {/* 關鍵訊號 */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm text-blue-800">
              多頭訊號: RSI突破70，MACD金叉
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span className="text-sm text-blue-800">
              注意訊號: KD指標進入鈍化區間
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="text-sm text-blue-800">
              成交量: 價漲量增，訊號健康
            </span>
          </div>
        </div>
      </div>

      {/* 交易建議 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h5 className="font-medium text-green-900 mb-1">📈 多頭策略</h5>
          <p className="text-sm text-green-800">
            技術面支撐明確，可考慮逢低買進，目標價位看至下一個阻力位
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h5 className="font-medium text-yellow-900 mb-1">⚠️ 風險提醒</h5>
          <p className="text-sm text-yellow-800">
            注意KD指標鈍化風險，建議設定停損點並控制倉位大小
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h5 className="font-medium text-blue-900 mb-1">🎯 關鍵位階</h5>
          <p className="text-sm text-blue-800">
            支撐位: 565，阻力位: 595，突破後目標: 620
          </p>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysisAI;
