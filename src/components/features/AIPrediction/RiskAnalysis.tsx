import React from "react";
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ChartPieIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon,
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
      borderColor: "border-yellow-200",
      progressValue: 23,
      progressColor: "bg-yellow-500",
    },
    {
      name: "夏普比率",
      value: "1.45",
      description: "風險調整後報酬率",
      level: "良好",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      progressValue: 73,
      progressColor: "bg-green-500",
    },
    {
      name: "最大回撤",
      value: "8.7%",
      description: "歷史最大跌幅",
      level: "適中",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      progressValue: 43,
      progressColor: "bg-orange-500",
    },
    {
      name: "波動率",
      value: "15.2%",
      description: "價格波動程度",
      level: "中等",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      progressValue: 60,
      progressColor: "bg-blue-500",
    },
  ];

  const riskFactors = [
    {
      factor: "市場風險",
      impact: "高",
      probability: "中",
      description: "整體市場下跌風險",
      color: "text-red-600",
      icon: ArrowTrendingDownIcon,
    },
    {
      factor: "流動性風險",
      impact: "中",
      probability: "低",
      description: "部位無法即時變現",
      color: "text-yellow-600",
      icon: ExclamationTriangleIcon,
    },
    {
      factor: "模型風險",
      impact: "中",
      probability: "中",
      description: "AI預測準確度下降",
      color: "text-orange-600",
      icon: ChartPieIcon,
    },
    {
      factor: "技術風險",
      impact: "低",
      probability: "低",
      description: "系統故障或網路中斷",
      color: "text-green-600",
      icon: ShieldCheckIcon,
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
    <div className="p-6">
      {/* 標題區域 */}
      <div className="flex items-center mb-6">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mr-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">風險分析</h3>
          <p className="text-sm text-gray-500">投資組合風險評估與管理</p>
        </div>
      </div>

      {/* 整體風險評級卡片 */}
      <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-3xl p-6 mb-6 border border-orange-100 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg mr-6">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                整體風險評級
              </h4>
              <div className="flex items-center">
                <span className="text-3xl font-bold text-orange-600 mr-3">
                  中等
                </span>
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  可接受範圍
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">風險分數</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">6.7</div>
            <div className="text-xs text-gray-500">/10</div>

            {/* 圓形進度條 */}
            <div className="mt-4 relative w-16 h-16 mx-auto">
              <svg
                className="w-16 h-16 transform -rotate-90"
                viewBox="0 0 64 64"
              >
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${67 * 1.76} 176`}
                  className="text-orange-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-orange-600">67%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 關鍵風險指標 */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <ChartPieIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h4 className="font-semibold text-gray-900">關鍵風險指標</h4>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {riskMetrics.map((metric, index) => (
            <div
              key={index}
              className={`${metric.bgColor} rounded-2xl p-6 border ${metric.borderColor} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 text-base mb-1">
                    {metric.name}
                  </h5>
                  <p className="text-xs text-gray-600 mb-2">
                    {metric.description}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(
                      metric.level
                    )}`}
                  >
                    {metric.level}
                  </span>
                </div>
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
              </div>

              {/* 進度條 */}
              <div className="mt-4">
                <div className="w-full bg-white/60 rounded-full h-2">
                  <div
                    className={`${metric.progressColor} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${metric.progressValue}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>低風險</span>
                  <span className="font-medium">{metric.progressValue}%</span>
                  <span>高風險</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 主要風險因子 */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <InformationCircleIcon className="h-5 w-5 text-purple-600 mr-2" />
          <h4 className="font-semibold text-gray-900">主要風險因子</h4>
        </div>
        <div className="space-y-4">
          {riskFactors.map((factor, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start">
                <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mr-4 flex-shrink-0">
                  <factor.icon className={`h-6 w-6 ${factor.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-semibold text-gray-900 text-base">
                      {factor.factor}
                    </h5>
                    <div className="flex space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(
                          factor.impact
                        )}`}
                      >
                        影響: {factor.impact}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(
                          factor.probability
                        )}`}
                      >
                        機率: {factor.probability}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {factor.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 風險管理建議 */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border border-blue-100 shadow-lg mb-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mr-4">
            <ShieldCheckIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900">風險管理建議</h4>
            <p className="text-sm text-gray-600">AI智能風險控制策略</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "資產分散配置",
              description: "適度分散投資，避免過度集中單一資產類別",
              priority: "高",
              color: "bg-red-100 text-red-800",
            },
            {
              title: "停損點設定",
              description: "設定合理的停損點，控制最大損失在可接受範圍內",
              priority: "高",
              color: "bg-red-100 text-red-800",
            },
            {
              title: "定期檢視調整",
              description: "定期檢視投資組合，動態調整風險敞口",
              priority: "中",
              color: "bg-yellow-100 text-yellow-800",
            },
            {
              title: "現金部位管理",
              description: "保持充足的現金部位應對突發狀況",
              priority: "中",
              color: "bg-yellow-100 text-yellow-800",
            },
          ].map((recommendation, index) => (
            <div
              key={index}
              className="bg-white/80 rounded-2xl p-6 border border-blue-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <h5 className="font-semibold text-gray-900 text-base">
                  {recommendation.title}
                </h5>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${recommendation.color}`}
                >
                  {recommendation.priority}優先
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {recommendation.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          <div className="flex items-center justify-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            調整風險
          </div>
        </button>
        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          <div className="flex items-center justify-center">
            <ChartPieIcon className="h-5 w-5 mr-2" />
            詳細報告
          </div>
        </button>
      </div>
    </div>
  );
};

export default RiskAnalysis;
