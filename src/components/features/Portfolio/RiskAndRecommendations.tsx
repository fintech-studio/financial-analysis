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
      {/* 整合式頁面頂部導航 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            風險評估與智能建議
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSection("analysis")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeSection === "analysis"
                ? "bg-blue-100 text-blue-700"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            <ShieldCheckIcon className="h-5 w-5 inline mr-1" />
            風險評估
          </button>
          <button
            onClick={() => setActiveSection("recommendations")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeSection === "recommendations"
                ? "bg-blue-100 text-blue-700"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            <SparklesIcon className="h-5 w-5 inline mr-1" />
            AI智能建議
          </button>
          <button
            onClick={handleRefresh}
            className={`p-2 text-gray-400 hover:text-gray-600 rounded-full ${
              isRefreshing ? "animate-spin" : ""
            }`}
            disabled={isRefreshing}
            title="重新分析"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 風險評估與健康度摘要面板 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-3">
            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                {activeSection === "analysis" ? (
                  <ShieldCheckIcon className="h-6 w-6 text-blue-500" />
                ) : (
                  <SparklesIcon className="h-6 w-6 text-blue-500" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeSection === "analysis"
                    ? "投資組合風險摘要"
                    : "AI 分析摘要"}
                </h3>
                <p className="text-gray-700">
                  {activeSection === "analysis"
                    ? `您的投資組合整體風險等級為${
                        riskData.metrics.volatility
                      }%，較大盤${
                        riskData.metrics.volatilityVsMarket < 0 ? "低" : "高"
                      }${Math.abs(
                        riskData.metrics.volatilityVsMarket
                      )}%。主要風險來自於科技股比重過高與單一持股集中度。`
                    : aiData.summary}
                </p>
              </div>
            </div>
          </div>
          <div className="col-span-1 flex flex-col justify-center border-l border-blue-100 pl-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              投資組合健康度
            </div>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-blue-600">
                {aiData.healthScore}
              </div>
              <div className="text-lg text-blue-400 ml-1">/100</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className={`h-2.5 rounded-full ${
                  aiData.healthScore > 80
                    ? "bg-green-500"
                    : aiData.healthScore > 60
                    ? "bg-blue-500"
                    : aiData.healthScore > 40
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${aiData.healthScore}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {aiData.healthScore > 80
                ? "優良"
                : aiData.healthScore > 60
                ? "良好"
                : aiData.healthScore > 40
                ? "需注意"
                : "需調整"}
            </div>
          </div>
        </div>
      </div>

      {/* 風險評估內容 */}
      {activeSection === "analysis" && (
        <div className="space-y-6">
          {/* 風險指標卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                波動率
              </h3>
              <div className="text-3xl font-bold text-gray-900">
                {riskData.metrics.volatility}%
              </div>
              <div className="mt-2 text-sm text-gray-500">
                較大盤
                <span
                  className={
                    riskData.metrics.volatilityVsMarket < 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {riskData.metrics.volatilityVsMarket >= 0 ? "+" : ""}
                  {riskData.metrics.volatilityVsMarket}%
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                夏普比率
              </h3>
              <div className="text-3xl font-bold text-gray-900">
                {riskData.metrics.sharpeRatio}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {riskData.metrics.sharpeRatio >= 1.5
                  ? "優良"
                  : riskData.metrics.sharpeRatio >= 1
                  ? "良好"
                  : riskData.metrics.sharpeRatio >= 0.5
                  ? "一般"
                  : "不佳"}
                <span className="text-xs ml-2 text-gray-400">
                  (高於1.0為佳)
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                最大回撤
              </h3>
              <div className="text-3xl font-bold text-red-600">
                {riskData.metrics.maxDrawdown}%
              </div>
              <div className="mt-2 text-sm text-gray-500">
                發生於 {riskData.metrics.maxDrawdownDate}
              </div>
            </div>
          </div>

          {/* 波動率趨勢圖 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="h-[300px]">
              <Line
                options={volatilityChartOptions}
                data={volatilityChartData}
              />
            </div>
          </div>

          {/* 風險雷達與回撤圖 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                風險因子分析
              </h3>
              <div className="h-[300px]">
                <Radar data={riskRadarData} options={riskRadarOptions} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                歷史回撤
              </h3>
              <div className="h-[300px]">
                <Bar options={drawdownChartOptions} data={drawdownChartData} />
              </div>
            </div>
          </div>

          {/* 其他風險指標 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              其他風險指標
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {riskData.otherMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <div className="text-sm font-medium text-gray-500">
                    {metric.name}
                  </div>
                  <div className="mt-1 flex justify-between">
                    <div className="text-lg font-semibold text-gray-900">
                      {metric.value}
                    </div>
                    <div
                      className={`text-sm ${
                        metric.status === "good"
                          ? "text-green-500"
                          : metric.status === "neutral"
                          ? "text-yellow-500"
                          : "text-red-500"
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

      {/* AI 建議內容 */}
      {activeSection === "recommendations" && (
        <div className="space-y-6">
          {/* 建議類型選擇標籤 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveRecommendationTab("all")}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeRecommendationTab === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setActiveRecommendationTab("rebalance")}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeRecommendationTab === "rebalance"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              再平衡
            </button>
            <button
              onClick={() => setActiveRecommendationTab("opportunity")}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeRecommendationTab === "opportunity"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              投資機會
            </button>
            <button
              onClick={() => setActiveRecommendationTab("risk")}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeRecommendationTab === "risk"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              風險警示
            </button>
            <button
              onClick={() => setActiveRecommendationTab("adjustment")}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeRecommendationTab === "adjustment"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              調整建議
            </button>
            <button
              onClick={() => setActiveRecommendationTab("tax")}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeRecommendationTab === "tax"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              稅務規劃
            </button>
          </div>

          {/* AI 分析摘要指標 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  投資組合健康度
                </h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {aiData.healthScore}/100
              </div>
              <div className="mt-2 text-sm text-gray-500">
                較上月{" "}
                <span
                  className={
                    aiData.healthScore >= 75 ? "text-green-500" : "text-red-500"
                  }
                >
                  {aiData.healthScore >= 75 ? "+" : "-"}3.5
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  優化潛力
                </h3>
              </div>
              <div className="text-3xl font-bold text-green-600">
                +{aiData.optimizationPotential}%
              </div>
              <div className="mt-2 text-sm text-gray-500">
                透過調整配置提升潛在回報
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <SparklesIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  建議指數
                </h3>
              </div>
              <div className="text-3xl font-bold text-indigo-600">
                {aiData.recommendationLevel}/10
              </div>
              <div className="mt-2 text-sm text-gray-500">
                建議優先處理高優先級項目
              </div>
            </div>
          </div>

          {/* 建議卡片列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((recommendation, index) => {
              const style = getCardStyle(recommendation.type);
              const Icon = style.icon;
              return (
                <div
                  key={index}
                  className={`${style.bg} rounded-xl p-6 shadow-sm`}
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <div className={`${style.iconBg} p-2 rounded-lg`}>
                      <Icon className={`h-5 w-5 ${style.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {recommendation.title}
                        </h3>
                        {recommendation.priority && (
                          <span
                            className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                              recommendation.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : recommendation.priority === "medium"
                                ? "bg-amber-100 text-amber-800"
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
                        <p className="text-sm font-medium text-gray-500 mt-1">
                          {recommendation.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {recommendation.description}
                  </p>

                  {/* 如果有具體行動建議，顯示列表 */}
                  {recommendation.actions &&
                    recommendation.actions.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {recommendation.actions.map((action, actionIndex) => (
                          <div
                            key={actionIndex}
                            className="flex items-start space-x-2"
                          >
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-white flex items-center justify-center">
                              <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                            </div>
                            <span className="text-sm text-gray-700">
                              {action}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* 預期效果 */}
                  {recommendation.impact && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">預期效果</span>
                        <span className="text-sm font-medium text-blue-600">
                          {recommendation.impact}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 操作按鈕 */}
                  <div className="mt-5 flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      了解更多
                    </button>
                    <button className="flex-1 px-3 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700">
                      執行建議
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 無建議時顯示 */}
          {filteredRecommendations.length === 0 && (
            <div className="text-center py-10">
              <LightBulbIcon className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                沒有{activeRecommendationTab !== "all" ? "此類型的" : ""}建議
              </h3>
              <p className="mt-1 text-gray-500">
                目前沒有可用的 AI 建議，請稍後再查看或嘗試其他類型。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiskAndRecommendations;
