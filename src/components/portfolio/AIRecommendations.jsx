import React, { useState } from "react";
import {
  LightBulbIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ScaleIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  EyeIcon,
  FireIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const AIRecommendations = () => {
  const [selectedSection, setSelectedSection] = useState("all");

  const recommendations = {
    portfolioHealth: {
      score: 85,
      status: "健康",
      suggestions: [
        "投資組合分散度良好",
        "風險水平適中",
        "建議增加防禦性資產配置",
      ],
    },
    tradingSignals: [
      {
        stock: "台積電",
        action: "買入",
        reason: "技術指標顯示超賣",
        confidence: 85,
      },
      {
        stock: "聯發科",
        action: "持有",
        reason: "基本面維持強勁",
        confidence: 75,
      },
    ],
    marketInsights: [
      {
        title: "市場趨勢分析",
        content: "近期科技股出現補漲機會",
        importance: "high",
      },
      {
        title: "產業輪動預測",
        content: "傳統產業可能出現補漲",
        importance: "medium",
      },
    ],
  };

  const aiAnalysis = {
    marketTrends: {
      trend: "震盪整理",
      signal: "neutral",
      analysis: [
        { point: "台股近期在月線附近震盪", impact: "neutral" },
        { point: "外資持續小幅流入", impact: "positive" },
        { point: "短期技術指標偏多", impact: "positive" },
      ],
    },
    portfolioSuggestions: [
      {
        type: "adjustment",
        title: "投資組合調整建議",
        suggestions: [
          "建議降低科技股比重，分散產業風險",
          "可考慮加入防禦性產業如民生消費",
          "部分高估值持股可考慮獲利了結",
        ],
        priority: "high",
      },
      {
        type: "timing",
        title: "進出場時機建議",
        suggestions: [
          "台積電近期接近支撐位可逢低布局",
          "鴻海技術面轉強可加碼持股",
          "聯發科可分批獲利了結",
        ],
        priority: "medium",
      },
    ],
    riskWarnings: [
      {
        type: "concentration",
        title: "持股過度集中",
        description: "單一股票佔比超過30%",
        severity: "high",
      },
      {
        type: "volatility",
        title: "投資組合波動度升高",
        description: "近期波動度較過去三個月增加50%",
        severity: "medium",
      },
    ],
    opportunities: [
      {
        stock: "2330",
        name: "台積電",
        reason: "基本面持續改善，評價面具吸引力",
        confidence: 85,
      },
      {
        stock: "2317",
        name: "鴻海",
        reason: "新事業營運展望佳，評價偏低",
        confidence: 80,
      },
    ],
    aiIndicators: {
      sentiment: {
        score: 65,
        trend: "improving",
        source: "社群媒體情緒分析",
      },
      momentum: {
        score: 72,
        trend: "stable",
        source: "技術指標綜合分析",
      },
      valuation: {
        score: 58,
        trend: "declining",
        source: "基本面評價分析",
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* AI 分析摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <SparklesIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium">AI 信心指數</h3>
          </div>
          <div className="text-2xl font-bold text-blue-600">75%</div>
          <p className="text-sm text-gray-500">基於綜合分析結果</p>
        </div>
        {/* ...其他摘要卡片... */}
      </div>

      {/* 投資組合健康度 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">投資組合健康度</h3>
          <div className="flex items-center">
            <div className="text-2xl font-bold text-green-500">
              {recommendations.portfolioHealth.score}
            </div>
            <div className="ml-2 text-sm text-gray-500">/100</div>
          </div>
        </div>
        <div className="space-y-4">
          {recommendations.portfolioHealth.suggestions.map(
            (suggestion, index) => (
              <div key={index} className="flex items-start">
                <LightBulbIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                <span className="ml-2 text-gray-600">{suggestion}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* 交易信號 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">AI 交易信號</h3>
        <div className="space-y-4">
          {recommendations.tradingSignals.map((signal, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <ChartBarIcon className="h-5 w-5 text-blue-500" />
                <div className="ml-3">
                  <div className="font-medium">{signal.stock}</div>
                  <div className="text-sm text-gray-500">{signal.reason}</div>
                </div>
              </div>
              <div className="flex items-center">
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    signal.action === "買入"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {signal.action}
                </div>
                <div className="ml-3 text-sm text-gray-500">
                  信心指數: {signal.confidence}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 市場洞察 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">市場洞察</h3>
        <div className="space-y-4">
          {recommendations.marketInsights.map((insight, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-indigo-500" />
                <h4 className="ml-2 font-medium text-gray-900">
                  {insight.title}
                </h4>
              </div>
              <p className="text-gray-600">{insight.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 詳細分析內容 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex space-x-4">
            {["全部", "市場趨勢", "投資建議", "風險警示", "投資機會"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedSection(tab)}
                  className={`px-4 py-2 rounded-md ${
                    selectedSection === tab
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* 市場趨勢分析 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-500" />
              市場趨勢分析
            </h3>
            {aiAnalysis.marketTrends.analysis.map((item, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div
                  className={`p-1 rounded-full ${
                    item.impact === "positive"
                      ? "bg-green-100"
                      : item.impact === "negative"
                      ? "bg-red-100"
                      : "bg-yellow-100"
                  }`}
                >
                  {item.impact === "positive" ? (
                    <HandThumbUpIcon className="h-4 w-4 text-green-600" />
                  ) : item.impact === "negative" ? (
                    <HandThumbDownIcon className="h-4 w-4 text-red-600" />
                  ) : (
                    <ClockIcon className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <span className="text-gray-700">{item.point}</span>
              </div>
            ))}
          </div>

          {/* 投資建議 */}
          <div className="space-y-4">
            {aiAnalysis.portfolioSuggestions.map((section, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{section.title}</h4>
                <ul className="space-y-2">
                  {section.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <FireIcon className="h-5 w-5 text-orange-500" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 風險警示 */}
          {aiAnalysis.riskWarnings.map((warning, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                warning.severity === "high" ? "bg-red-50" : "bg-yellow-50"
              }`}
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon
                  className={`h-5 w-5 mr-2 ${
                    warning.severity === "high"
                      ? "text-red-500"
                      : "text-yellow-500"
                  }`}
                />
                <div>
                  <h4 className="font-medium">{warning.title}</h4>
                  <p className="text-sm text-gray-600">{warning.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
