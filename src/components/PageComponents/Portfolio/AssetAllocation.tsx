import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  TooltipItem,
  ChartOptions,
} from "chart.js";
import {
  ChartPieIcon,
  BuildingLibraryIcon,
  GlobeAsiaAustraliaIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  PresentationChartLineIcon,
  ScaleIcon,
  SparklesIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon as SparklesSolidIcon } from "@heroicons/react/24/solid";

// MVC 架構引入
import { PortfolioController } from "@/controllers/PortfolioController";
import { useMvcController } from "@/hooks/useMvcController";
import { AssetAllocation as AssetAllocationType } from "@/models/PortfolioModel";

// 註冊 Chart.js 組件
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface AssetItem {
  name: string;
  percentage: number;
}

interface Recommendation {
  text: string;
  type: "positive" | "neutral" | "negative";
}

interface AssetAllocationData {
  byAssetClass: AssetItem[];
  bySector: AssetItem[];
  byRegion: AssetItem[];
  recommendations: Recommendation[];
}

interface AssetAllocationProps {
  data: AssetAllocationData;
}

interface TargetAllocation {
  assetClass: AssetItem[];
}

interface DeviationItem {
  name: string;
  current: number;
  target: number;
  deviation: number;
  status: "過高" | "過低" | "適中";
}

type TabType = "assetClass" | "sector" | "region";

interface ChartDataset {
  data: number[];
  backgroundColor: string[];
  borderColor: string[];
  borderWidth: number;
  label?: string;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartResult {
  chartData: ChartData;
  targetData?: ChartData;
}

// 定義現代化顏色常量
const CHART_COLORS = {
  assetClass: [
    "rgba(59, 130, 246, 0.7)", // 藍色
    "rgba(16, 185, 129, 0.7)", // 綠色
    "rgba(139, 92, 246, 0.7)", // 紫色
    "rgba(245, 158, 11, 0.7)", // 橙色
    "rgba(239, 68, 68, 0.7)", // 紅色
    "rgba(156, 163, 175, 0.7)", // 灰色
  ],
  assetClassBorder: [
    "rgba(59, 130, 246, 1)",
    "rgba(16, 185, 129, 1)",
    "rgba(139, 92, 246, 1)",
    "rgba(245, 158, 11, 1)",
    "rgba(239, 68, 68, 1)",
    "rgba(156, 163, 175, 1)",
  ],
  sector: [
    "rgba(59, 130, 246, 0.7)",
    "rgba(16, 185, 129, 0.7)",
    "rgba(245, 158, 11, 0.7)",
    "rgba(239, 68, 68, 0.7)",
    "rgba(139, 92, 246, 0.7)",
    "rgba(236, 72, 153, 0.7)",
    "rgba(20, 184, 166, 0.7)",
    "rgba(34, 197, 94, 0.7)",
  ],
  sectorBorder: [
    "rgba(59, 130, 246, 1)",
    "rgba(16, 185, 129, 1)",
    "rgba(245, 158, 11, 1)",
    "rgba(239, 68, 68, 1)",
    "rgba(139, 92, 246, 1)",
    "rgba(236, 72, 153, 1)",
    "rgba(20, 184, 166, 1)",
    "rgba(34, 197, 94, 1)",
  ],
  region: [
    "rgba(59, 130, 246, 0.7)",
    "rgba(16, 185, 129, 0.7)",
    "rgba(245, 158, 11, 0.7)",
    "rgba(239, 68, 68, 0.7)",
    "rgba(139, 92, 246, 0.7)",
  ],
  regionBorder: [
    "rgba(59, 130, 246, 1)",
    "rgba(16, 185, 129, 1)",
    "rgba(245, 158, 11, 1)",
    "rgba(239, 68, 68, 1)",
    "rgba(139, 92, 246, 1)",
  ],
} as const;

const AssetAllocation: React.FC<AssetAllocationProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<TabType>("assetClass");
  const [showComparison, setShowComparison] = useState<boolean>(false);

  // MVC 控制器
  const portfolioController = PortfolioController.getInstance();

  // 使用 MVC Hook 管理資產配置數據
  const { data: assetAllocationData, execute: executeAllocation } =
    useMvcController<AssetAllocationType[]>();

  // 載入最新的資產配置數據
  const loadAssetAllocation = useCallback(async () => {
    const userId = "user_001"; // 應該從認證上下文獲取
    await executeAllocation(async () => {
      const data = await portfolioController.getAssetAllocation(userId);
      console.log("資產配置載入成功:", data);
      return data;
    });
  }, [executeAllocation, portfolioController]);

  // 初始化時載入數據
  useEffect(() => {
    if (!data || !data.byAssetClass || data.byAssetClass.length === 0) {
      loadAssetAllocation().catch((error: unknown) => {
        if (error instanceof Error) {
          console.error("載入資產配置失敗:", error.message);
        } else {
          console.error("載入資產配置失敗:", error);
        }
      });
    }
  }, [data, loadAssetAllocation]);

  // 處理重新平衡建議 - 通過控制器
  const handleRebalanceAnalysis = async () => {
    try {
      const userId = "user_001";
      const analysis = await portfolioController.getRiskAnalysis(userId);
      console.log("重新平衡分析:", analysis);
    } catch (error) {
      console.error("重新平衡分析失敗:", error);
    }
  };

  // 使用MVC數據或者props數據，並轉換格式以符合AssetItem接口
  const currentData = useMemo(() => {
    if (assetAllocationData && assetAllocationData.length > 0) {
      const convertedData: AssetAllocationData = {
        byAssetClass: assetAllocationData.map((item) => ({
          name: item.category,
          percentage: item.percentage,
        })),
        bySector: [],
        byRegion: [],
        recommendations: [],
      };
      return convertedData;
    }
    return data;
  }, [assetAllocationData, data]);

  // 目標配置數據
  const targetAllocation: TargetAllocation = {
    assetClass: [
      { name: "股票", percentage: 60 },
      { name: "ETF", percentage: 25 },
      { name: "債券", percentage: 10 },
      { name: "加密貨幣", percentage: 3 },
      { name: "現金", percentage: 2 },
    ],
  };

  const getChartData = (type: TabType): ChartResult => {
    let chartData: ChartData;
    let targetData: ChartData | undefined;

    switch (type) {
      case "assetClass":
        chartData = {
          labels: (currentData.byAssetClass || []).map((item) => item.name),
          datasets: [
            {
              data: (currentData.byAssetClass || []).map(
                (item) => item.percentage
              ),
              backgroundColor: [...CHART_COLORS.assetClass],
              borderColor: [...CHART_COLORS.assetClassBorder],
              borderWidth: 2,
            },
          ],
        };

        if (showComparison) {
          targetData = {
            labels: (currentData.byAssetClass || []).map((item) => item.name),
            datasets: [
              {
                label: "目前配置",
                data: (currentData.byAssetClass || []).map(
                  (item) => item.percentage
                ),
                backgroundColor: ["rgba(59, 130, 246, 0.7)"],
                borderColor: ["rgba(59, 130, 246, 1)"],
                borderWidth: 1,
              },
              {
                label: "推薦配置",
                data: targetAllocation.assetClass.map(
                  (item) => item.percentage
                ),
                backgroundColor: ["rgba(16, 185, 129, 0.7)"],
                borderColor: ["rgba(16, 185, 129, 1)"],
                borderWidth: 1,
              },
            ],
          };
        }
        break;
      case "sector":
        chartData = {
          labels: (currentData.bySector || []).map((item) => item.name),
          datasets: [
            {
              data: (currentData.bySector || []).map((item) => item.percentage),
              backgroundColor: [...CHART_COLORS.sector],
              borderColor: [...CHART_COLORS.sectorBorder],
              borderWidth: 2,
            },
          ],
        };
        break;
      case "region":
        chartData = {
          labels: (currentData.byRegion || []).map((item) => item.name),
          datasets: [
            {
              data: (currentData.byRegion || []).map((item) => item.percentage),
              backgroundColor: [...CHART_COLORS.region],
              borderColor: [...CHART_COLORS.regionBorder],
              borderWidth: 2,
            },
          ],
        };
        break;
      default:
        chartData = {
          labels: [],
          datasets: [
            { data: [], backgroundColor: [], borderColor: [], borderWidth: 2 },
          ],
        };
    }

    return { chartData, targetData };
  };

  const { chartData, targetData } = getChartData(activeTab);

  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { size: 13, weight: 500 },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          color: "#374151",
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 12,
        callbacks: {
          label: function (context: TooltipItem<"doughnut">) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            label += context.parsed + "%";
            return label;
          },
        },
      },
    },
    cutout: "65%",
  };

  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 13, weight: 500 },
          usePointStyle: true,
          pointStyle: "circle",
          color: "#374151",
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 12,
        callbacks: {
          label: function (context: TooltipItem<"bar">) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            label += context.parsed.x + "%";
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        title: {
          display: true,
          text: "資產配置百分比",
          font: { size: 12, weight: 500 },
          color: "#6B7280",
        },
        ticks: {
          callback: function (value: string | number) {
            return value + "%";
          },
          color: "#6B7280",
        },
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
      },
      y: {
        stacked: false,
        ticks: {
          color: "#374151",
          font: { size: 12, weight: 500 },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  // 計算當前與理想配置的偏差
  const calculateDeviation = (): DeviationItem[] => {
    if (activeTab !== "assetClass") return [];

    return (currentData.byAssetClass || []).map((item) => {
      const targetItem = targetAllocation.assetClass.find(
        (t) => t.name === item.name
      ) || { name: item.name, percentage: 0 };
      const deviation = Number(
        (item.percentage - targetItem.percentage).toFixed(1)
      );
      return {
        name: item.name,
        current: item.percentage,
        target: targetItem.percentage,
        deviation,
        status: deviation > 5 ? "過高" : deviation < -5 ? "過低" : "適中",
      };
    });
  };

  const deviations = calculateDeviation();

  // 獲取配置不平衡的資產（偏差超過5%）
  const getUnbalancedAssets = (): DeviationItem[] => {
    return deviations.filter((item) => Math.abs(item.deviation) > 5);
  };

  const unbalancedAssets = getUnbalancedAssets();

  // 處理標籤點擊事件
  const handleTabClick = useCallback((tab: TabType): void => {
    setActiveTab(tab);
  }, []);

  // 切換比較模式
  const handleToggleComparison = useCallback(() => {
    setShowComparison((prev) => !prev);
  }, []);

  // 動態生成顏色的輔助函數
  function generateDynamicColor(index: number): string {
    const colors = [
      "rgba(59, 130, 246, 0.7)",
      "rgba(16, 185, 129, 0.7)",
      "rgba(245, 158, 11, 0.7)",
      "rgba(239, 68, 68, 0.7)",
      "rgba(139, 92, 246, 0.7)",
      "rgba(236, 72, 153, 0.7)",
      "rgba(20, 184, 166, 0.7)",
      "rgba(34, 197, 94, 0.7)",
    ];
    return colors[index % colors.length];
  }

  return (
    <div className="space-y-8">
      {/* 主要配置圖表卡片 */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <ChartPieIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">資產配置分析</h2>
              <p className="text-sm text-gray-500 mt-1">
                投資組合多元化配置概況
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleToggleComparison}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                showComparison
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <ScaleIcon className="h-4 w-4 mr-2" />
              對比目標配置
            </button>
          </div>
        </div>

        {/* 配置類型選項卡 */}
        <div className="flex border-b border-gray-200 mb-8 relative z-10">
          <button
            onClick={() => handleTabClick("assetClass")}
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-all duration-200 ${
              activeTab === "assetClass"
                ? "border-blue-500 text-blue-600 bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <div className="flex items-center">
              <ChartPieIcon className="h-5 w-5 mr-2" />
              按資產類別
            </div>
          </button>
          <button
            onClick={() => handleTabClick("sector")}
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-all duration-200 ${
              activeTab === "sector"
                ? "border-blue-500 text-blue-600 bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <div className="flex items-center">
              <BuildingLibraryIcon className="h-5 w-5 mr-2" />
              按產業分布
            </div>
          </button>
          <button
            onClick={() => handleTabClick("region")}
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-all duration-200 ${
              activeTab === "region"
                ? "border-blue-500 text-blue-600 bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <div className="flex items-center">
              <GlobeAsiaAustraliaIcon className="h-5 w-5 mr-2" />
              按地區分布
            </div>
          </button>
        </div>

        {/* 圖表顯示區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
            <div className="h-80">
              {showComparison && activeTab === "assetClass" && targetData ? (
                <Bar data={targetData} options={barChartOptions} />
              ) : (
                <Doughnut data={chartData} options={chartOptions} />
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <SparklesIcon className="h-5 w-5 text-blue-500 mr-2" />
              配置明細
            </h4>
            <div className="space-y-3">
              {activeTab === "assetClass" && (
                <div className="overflow-hidden bg-white rounded-xl shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-linear-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          資產類別
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          目前配置
                        </th>
                        {showComparison && (
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            目標配置
                          </th>
                        )}
                        {showComparison && (
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            差異
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(currentData.byAssetClass || []).map((item, index) => {
                        const targetItem = showComparison
                          ? targetAllocation.assetClass.find(
                              (t) => t.name === item.name
                            ) || { name: item.name, percentage: 0 }
                          : null;
                        const deviation =
                          showComparison && targetItem
                            ? Number(
                                (
                                  item.percentage - targetItem.percentage
                                ).toFixed(1)
                              )
                            : 0;

                        return (
                          <tr
                            key={`${item.name}-${index}`}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-3"
                                  style={{
                                    backgroundColor:
                                      CHART_COLORS.assetClass[
                                        index % CHART_COLORS.assetClass.length
                                      ],
                                  }}
                                ></div>
                                <span className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                              {item.percentage}%
                            </td>
                            {showComparison && targetItem && (
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                                {targetItem.percentage}%
                              </td>
                            )}
                            {showComparison && (
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    deviation > 0
                                      ? "bg-red-100 text-red-800"
                                      : deviation < 0
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {deviation > 0 ? "+" : ""}
                                  {deviation}%
                                </span>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "sector" && (
                <div className="space-y-3">
                  {(currentData.bySector || []).map((item, index) => (
                    <div
                      key={`sector-${item.name}-${index}`}
                      className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{
                            backgroundColor: generateDynamicColor(index),
                          }}
                        ></div>
                        <span className="text-sm font-medium text-gray-800">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "region" && (
                <div className="space-y-3">
                  {(currentData.byRegion || []).map((item, index) => (
                    <div
                      key={`region-${item.name}-${index}`}
                      className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{
                            backgroundColor:
                              CHART_COLORS.region[
                                index % CHART_COLORS.region.length
                              ],
                          }}
                        ></div>
                        <span className="text-sm font-medium text-gray-800">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 配置分析與建議 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 配置風險分析 */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-linear-to-br from-red-100/40 to-orange-100/40 rounded-full blur-2xl -translate-y-16 -translate-x-16"></div>

          <div className="flex items-center mb-6 relative z-10">
            <div className="p-2 bg-linear-to-br from-red-500 to-orange-500 rounded-xl mr-3">
              <PresentationChartLineIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">配置風險分析</h3>
              <p className="text-sm text-gray-500 mt-1">投資組合風險評估</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="p-4 bg-linear-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-800">
                  集中度風險
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-900">
                  <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                  中等
                </span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-2 mb-2">
                <div
                  className="bg-linear-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">
                科技股佔比57.8%，高於建議的35%上限
              </p>
            </div>

            <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-800">
                  區域風險
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-900">
                  <ShieldExclamationIcon className="h-3 w-3 mr-1" />
                  適中
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div
                  className="bg-linear-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: "55%" }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">
                台灣市場佔比40%，地域集中度較高
              </p>
            </div>

            <div className="p-4 bg-linear-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-800">
                  通膨抵禦力
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-200 text-red-900">
                  <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                  較低
                </span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2 mb-2">
                <div
                  className="bg-linear-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: "30%" }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">
                抗通膨資產配置僅占8%，建議至少15%
              </p>
            </div>
          </div>
        </div>

        {/* 配置優化建議 */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-green-100/40 to-blue-100/40 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center">
              <div className="p-2 bg-linear-to-br from-green-500 to-blue-500 rounded-xl mr-3">
                <AdjustmentsHorizontalIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  配置優化建議
                </h3>
                <p className="text-sm text-gray-500 mt-1">AI智能調整方案</p>
              </div>
            </div>

            <button
              onClick={handleRebalanceAnalysis}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-xl transition-all duration-200"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              再平衡
            </button>
          </div>

          <div className="relative z-10">
            {showComparison && unbalancedAssets.length > 0 ? (
              <div className="space-y-4">
                {unbalancedAssets.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-linear-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {item.name}
                          </span>
                          <span
                            className={`ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.deviation > 0
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          現在:{" "}
                          <span className="font-medium">{item.current}%</span> |
                          目標:{" "}
                          <span className="font-medium">{item.target}%</span> |
                          差異:{" "}
                          <span
                            className={`font-medium ${
                              item.deviation > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {item.deviation > 0 ? "+" : ""}
                            {item.deviation}%
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                            item.deviation > 0
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {item.deviation > 0 ? "減持" : "增持"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button className="w-full px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg">
                    <SparklesSolidIcon className="h-4 w-4 inline mr-2" />
                    生成AI再平衡計畫
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {(currentData.recommendations || []).map(
                  (recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    >
                      <span
                        className={`shrink-0 p-2 rounded-lg mt-0.5 ${
                          recommendation.type === "positive"
                            ? "bg-green-100"
                            : recommendation.type === "neutral"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                        }`}
                      >
                        <span
                          className={`block w-2 h-2 rounded-full ${
                            recommendation.type === "positive"
                              ? "bg-green-500"
                              : recommendation.type === "neutral"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></span>
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {recommendation.text}
                        </p>
                        {recommendation.type === "negative" && (
                          <div className="mt-2">
                            <button className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors">
                              查看調整方案
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetAllocation;
