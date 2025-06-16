import React, { useState } from "react";
import {
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import { Bar, Line, Radar } from "react-chartjs-2";
import type {
  RiskData,
  AIData,
  ChartData,
  ChartOptions,
  CardStyle,
  ActiveSection,
  ActiveRecommendationTab,
  Recommendation,
} from "@/types/portfolio";

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

interface RiskAndRecommendationsProps {
  riskData: RiskData;
  aiData: AIData;
}

const RiskAndRecommendations: React.FC<RiskAndRecommendationsProps> = ({
  riskData,
  aiData,
}) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>("analysis");
  const [activeRecommendationTab, setActiveRecommendationTab] =
    useState<ActiveRecommendationTab>("all");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 風險分析相關的圖表配置
  const volatilityChartData: ChartData = {
    labels: riskData.volatility.labels,
    datasets: [
      {
        label: "投資組合波動率",
        data: riskData.volatility.portfolio,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.1,
      },
      {
        label: "大盤波動率",
        data: riskData.volatility.market,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.1,
        borderDash: [5, 5],
      },
    ],
  };

  const volatilityChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "波動率趨勢",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const riskRadarData: ChartData = {
    labels: riskData.riskFactors.labels,
    datasets: [
      {
        label: "投資組合風險指標",
        data: riskData.riskFactors.values,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgb(54, 162, 235)",
      },
    ],
  };

  const riskRadarOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  const drawdownChartData: ChartData = {
    labels: riskData.drawdown.labels,
    datasets: [
      {
        label: "最大回撤百分比",
        data: riskData.drawdown.values,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgb(255, 99, 132)",
      },
    ],
  };

  const drawdownChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "最大回撤",
      },
      tooltip: {
        callbacks: {
          label: function (context: any): string {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + "%";
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "回撤百分比 (%)",
        },
        ticks: {
          callback: function (value: any): string {
            return value + "%";
          },
        },
      },
    },
  };

  // AI 建議相關的功能
  const handleRefresh = (): void => {
    setIsRefreshing(true);
    // 模擬更新建議的過程
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const filterRecommendations = (
    recommendations: Recommendation[]
  ): Recommendation[] => {
    if (activeRecommendationTab === "all") {
      return recommendations;
    }
    return recommendations.filter(
      (rec) => rec.type === activeRecommendationTab
    );
  };

  const getCardStyle = (type: Recommendation["type"]): CardStyle => {
    switch (type) {
      case "rebalance":
        return {
          bg: "bg-blue-50",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          icon: ScaleIcon,
        };
      case "opportunity":
        return {
          bg: "bg-green-50",
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
          icon: ArrowTrendingUpIcon,
        };
      case "risk":
        return {
          bg: "bg-red-50",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          icon: ShieldCheckIcon,
        };
      case "adjustment":
        return {
          bg: "bg-amber-50",
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
          icon: ChartBarIcon,
        };
      case "tax":
        return {
          bg: "bg-indigo-50",
          iconBg: "bg-indigo-100",
          iconColor: "text-indigo-600",
          icon: CurrencyDollarIcon,
        };
      default:
        return {
          bg: "bg-gray-50",
          iconBg: "bg-gray-100",
          iconColor: "text-gray-600",
          icon: LightBulbIcon,
        };
    }
  };

  const filteredRecommendations = filterRecommendations(aiData.recommendations);

  return (
    <div className="space-y-6">
      {/* 簡約頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">風險評估與建議</h1>
          <p className="text-gray-600 text-sm mt-1">
            投資組合風險分析與AI智能建議
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSection("analysis")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeSection === "analysis"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            風險評估
          </button>
          <button
            onClick={() => setActiveSection("recommendations")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeSection === "recommendations"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            AI建議
          </button>
          <button
            onClick={handleRefresh}
            className={`p-2 text-gray-400 hover:text-gray-600 rounded border border-gray-300 `}
            disabled={isRefreshing}
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* 簡約摘要卡片 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeSection === "analysis" ? "風險摘要" : "AI分析摘要"}
            </h3>
            <p className="text-gray-600">
              {activeSection === "analysis"
                ? `投資組合波動率為 ${riskData.metrics.volatility}%，較大盤${
                    riskData.metrics.volatilityVsMarket < 0 ? "低" : "高"
                  } ${Math.abs(
                    riskData.metrics.volatilityVsMarket
                  )}%。主要風險來自科技股比重過高。`
                : aiData.summary}
            </p>
          </div>
          <div className="border-l border-gray-200 pl-6">
            <div className="text-gray-500 text-sm">投資組合健康度</div>
            <div className="flex items-baseline mt-1">
              <div className="text-2xl font-bold text-blue-600">
                {aiData.healthScore}
              </div>
              <div className="text-gray-400 ml-1">/100</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${
                  aiData.healthScore > 80
                    ? "bg-green-500"
                    : aiData.healthScore > 60
                    ? "bg-blue-500"
                    : aiData.healthScore > 40
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${aiData.healthScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 風險評估內容 */}
      {activeSection === "analysis" && (
        <div className="space-y-6">
          {/* 風險指標卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-gray-500 text-sm">波動率</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {riskData.metrics.volatility}%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                較大盤
                <span
                  className={
                    riskData.metrics.volatilityVsMarket < 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {riskData.metrics.volatilityVsMarket >= 0 ? "+" : ""}
                  {riskData.metrics.volatilityVsMarket}%
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-gray-500 text-sm">夏普比率</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {riskData.metrics.sharpeRatio}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {riskData.metrics.sharpeRatio >= 1.5
                  ? "優良"
                  : riskData.metrics.sharpeRatio >= 1
                  ? "良好"
                  : riskData.metrics.sharpeRatio >= 0.5
                  ? "一般"
                  : "不佳"}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-gray-500 text-sm">最大回撤</div>
              <div className="text-xl font-bold text-red-600 mt-1">
                {riskData.metrics.maxDrawdown}%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {riskData.metrics.maxDrawdownDate}
              </div>
            </div>
          </div>

          {/* 波動率趨勢圖 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              波動率趨勢
            </h3>
            <div className="h-64">
              <Line
                options={volatilityChartOptions}
                data={volatilityChartData}
              />
            </div>
          </div>

          {/* 風險分析圖表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                風險因子分析
              </h3>
              <div className="h-64">
                <Radar data={riskRadarData} options={riskRadarOptions} />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                歷史回撤
              </h3>
              <div className="h-64">
                <Bar options={drawdownChartOptions} data={drawdownChartData} />
              </div>
            </div>
          </div>

          {/* 其他風險指標 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              其他風險指標
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {riskData.otherMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-3 last:border-b-0"
                >
                  <div className="text-sm text-gray-500">{metric.name}</div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="font-semibold text-gray-900">
                      {metric.value}
                    </div>
                    <div
                      className={`text-sm ${
                        metric.status === "good"
                          ? "text-green-600"
                          : metric.status === "neutral"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {metric.interpretation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI建議內容 */}
      {activeSection === "recommendations" && (
        <div className="space-y-6">
          {/* 建議類型篩選 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveRecommendationTab("all")}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  activeRecommendationTab === "all"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setActiveRecommendationTab("rebalance")}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  activeRecommendationTab === "rebalance"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                再平衡
              </button>
              <button
                onClick={() => setActiveRecommendationTab("opportunity")}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  activeRecommendationTab === "opportunity"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                投資機會
              </button>
              <button
                onClick={() => setActiveRecommendationTab("risk")}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  activeRecommendationTab === "risk"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                風險警示
              </button>
              <button
                onClick={() => setActiveRecommendationTab("adjustment")}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  activeRecommendationTab === "adjustment"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                調整建議
              </button>
              <button
                onClick={() => setActiveRecommendationTab("tax")}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  activeRecommendationTab === "tax"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                稅務規劃
              </button>
            </div>
          </div>

          {/* AI分析指標 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-gray-500 text-sm">健康度</div>
              <div className="text-xl font-bold text-blue-600 mt-1">
                {aiData.healthScore}/100
              </div>
              <div className="text-sm text-gray-600 mt-1">
                較上月 <span className="text-green-600">+3.5</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-gray-500 text-sm">優化潛力</div>
              <div className="text-xl font-bold text-green-600 mt-1">
                +{aiData.optimizationPotential}%
              </div>
              <div className="text-sm text-gray-600 mt-1">配置調整潛在收益</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-gray-500 text-sm">建議指數</div>
              <div className="text-xl font-bold text-purple-600 mt-1">
                {aiData.recommendationLevel}/10
              </div>
              <div className="text-sm text-gray-600 mt-1">優先處理建議數量</div>
            </div>
          </div>

          {/* 建議列表 */}
          <div className="space-y-4">
            {filteredRecommendations.map((recommendation, index) => {
              const style = getCardStyle(recommendation.type);
              const Icon = style.icon;

              return (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded ${style.iconBg}`}>
                      <Icon className={`h-5 w-5 ${style.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {recommendation.title}
                        </h3>
                        {recommendation.priority && (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              recommendation.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : recommendation.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {recommendation.priority === "high"
                              ? "高優先"
                              : recommendation.priority === "medium"
                              ? "中優先"
                              : "低優先"}
                          </span>
                        )}
                      </div>

                      {recommendation.subtitle && (
                        <p className="text-sm text-gray-600 mb-2">
                          {recommendation.subtitle}
                        </p>
                      )}

                      <p className="text-gray-700 mb-4">
                        {recommendation.description}
                      </p>

                      {/* 行動建議 */}
                      {recommendation.actions &&
                        recommendation.actions.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              建議行動：
                            </div>
                            <ul className="space-y-1">
                              {recommendation.actions.map(
                                (action, actionIndex) => (
                                  <li
                                    key={actionIndex}
                                    className="flex items-start space-x-2"
                                  >
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-sm text-gray-600">
                                      {action}
                                    </span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {/* 預期效果 */}
                      {recommendation.impact && (
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <span className="text-sm text-gray-500">
                            預期效果：
                          </span>
                          <span className="text-sm font-medium text-blue-600">
                            {recommendation.impact}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
                    <button className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                      了解更多
                    </button>
                    <button className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors">
                      執行建議
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 無建議時的提示 */}
          {filteredRecommendations.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <LightBulbIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暫無{activeRecommendationTab !== "all" ? "此類型" : ""}建議
              </h3>
              <p className="text-gray-500">
                目前沒有可用的AI建議，請稍後再查看。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiskAndRecommendations;
