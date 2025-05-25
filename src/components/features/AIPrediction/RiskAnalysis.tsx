import React from "react";
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";

const RiskAnalysis: React.FC = () => {
  const riskMetrics = [
    {
      name: "VaR (風險值)",
      value: "2.3%",
      description: "95%信心水準下最大預期損失",
      level: "中等",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      name: "夏普比率",
      value: "1.45",
      description: "風險調整後報酬率",
      level: "良好",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "最大回撤",
      value: "8.7%",
      description: "歷史最大跌幅",
      level: "適中",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      name: "波動率",
      value: "15.2%",
      description: "價格波動程度",
      level: "中等",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  const riskFactors = [
    {
      factor: "市場風險",
      impact: "高",
      probability: "中",
      description: "整體市場下跌風險",
      color: "text-red-600",
    },
    {
      factor: "流動性風險",
      impact: "中",
      probability: "低",
      description: "部位無法即時變現",
      color: "text-yellow-600",
    },
    {
      factor: "模型風險",
      impact: "中",
      probability: "中",
      description: "AI預測準確度下降",
      color: "text-orange-600",
    },
    {
      factor: "技術風險",
      impact: "低",
      probability: "低",
      description: "系統故障或網路中斷",
      color: "text-green-600",
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "高":
        return "bg-red-100 text-red-800";
      case "中":
        return "bg-yellow-100 text-yellow-800";
      case "低":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-5">
      <div className="flex items-center mb-4">
        <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">風險分析</h3>
      </div>

      {/* 整體風險評級 */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">整體風險評級</h4>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-orange-600">中等</span>
              <ShieldCheckIcon className="h-6 w-6 text-orange-500 ml-2" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">風險分數</p>
            <p className="text-2xl font-bold text-gray-900">6.7/10</p>
          </div>
        </div>
      </div>

      {/* 風險指標 */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <ChartPieIcon className="h-4 w-4 mr-2" />
          關鍵風險指標
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {riskMetrics.map((metric, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${metric.bgColor}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h5 className="font-medium text-gray-900 text-sm">
                  {metric.name}
                </h5>
                <span className={`text-lg font-bold ${metric.color}`}>
                  {metric.value}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-1">{metric.description}</p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(
                  metric.level
                )}`}
              >
                {metric.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 風險因子分析 */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">主要風險因子</h4>
        <div className="space-y-3">
          {riskFactors.map((factor, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-gray-900 text-sm">
                  {factor.factor}
                </h5>
                <div className="flex space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(
                      factor.impact
                    )}`}
                  >
                    影響: {factor.impact}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(
                      factor.probability
                    )}`}
                  >
                    機率: {factor.probability}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 建議措施 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <ShieldCheckIcon className="h-4 w-4 mr-2" />
          風險管理建議
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 適度分散投資，避免過度集中單一資產</li>
          <li>• 設定合理的停損點，控制最大損失</li>
          <li>• 定期檢視投資組合，動態調整風險敞口</li>
          <li>• 保持充足的現金部位應對突發狀況</li>
        </ul>
      </div>

      {/* 操作按鈕 */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors text-sm">
          調整風險
        </button>
        <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm">
          詳細報告
        </button>
      </div>
    </div>
  );
};

export default RiskAnalysis;
