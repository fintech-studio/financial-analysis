import React, { useState, useEffect, useMemo } from "react";
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
  ArrowTrendingUpIcon,
  PresentationChartLineIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";

// MVC 架構引入
import { PortfolioController } from "../../../controllers/PortfolioController";
import { useMvcController } from "../../../hooks/useMvcController";
import { AssetAllocation as AssetAllocationType } from "../../../models/PortfolioModel";

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

// 定義顏色常量
const CHART_COLORS = {
  assetClass: [
    "rgba(54, 162, 235, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(255, 99, 132, 0.6)",
    "rgba(255, 159, 64, 0.6)",
  ],
  assetClassBorder: [
    "rgba(54, 162, 235, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(255, 159, 64, 1)",
  ],
  sector: [
    "rgba(54, 162, 235, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(255, 99, 132, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(255, 159, 64, 0.6)",
    "rgba(255, 99, 71, 0.6)",
    "rgba(46, 139, 87, 0.6)",
  ],
  sectorBorder: [
    "rgba(54, 162, 235, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 159, 64, 1)",
    "rgba(255, 99, 71, 1)",
    "rgba(46, 139, 87, 1)",
  ],
  region: [
    "rgba(54, 162, 235, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(255, 99, 132, 0.6)",
    "rgba(153, 102, 255, 0.6)",
  ],
  regionBorder: [
    "rgba(54, 162, 235, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(153, 102, 255, 1)",
  ],
} as const;

const AssetAllocation: React.FC<AssetAllocationProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<
    "assetClass" | "sector" | "region"
  >("assetClass");
  const [showComparison, setShowComparison] = useState<boolean>(false);

  // MVC 控制器
  const portfolioController = PortfolioController.getInstance();

  // 使用 MVC Hook 管理資產配置數據
  const {
    data: assetAllocationData,
    loading: allocationLoading,
    error: allocationError,
    execute: executeAllocation,
  } = useMvcController<AssetAllocationType[]>();

  // 載入最新的資產配置數據
  const loadAssetAllocation = async () => {
    const userId = "user_001"; // 應該從認證上下文獲取
    await executeAllocation(async () => {
      const data = await portfolioController.getAssetAllocation(userId);
      console.log("資產配置載入成功:", data);
      return data;
    });
  };

  // 初始化時載入數據
  useEffect(() => {
    if (!data || data.byAssetClass.length === 0) {
      loadAssetAllocation().catch((error: any) => {
        console.error("載入資產配置失敗:", error);
      });
    }
  }, []);

  // 處理重新平衡建議 - 通過控制器
  const handleRebalanceAnalysis = async () => {
    try {
      const userId = "user_001";
      // 可以添加專門的重新平衡分析方法到控制器
      const analysis = await portfolioController.getRiskAnalysis(userId);
      console.log("重新平衡分析:", analysis);
      // 顯示分析結果的邏輯
    } catch (error) {
      console.error("重新平衡分析失敗:", error);
    }
  };

  // 使用MVC數據或者props數據，並轉換格式以符合AssetItem接口
  const currentData = useMemo(() => {
    if (assetAllocationData && assetAllocationData.length > 0) {
      // 轉換MVC數據格式為組件期望的格式
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

  const getChartData = (
    type: "assetClass" | "sector" | "region"
  ): ChartResult => {
    let chartData: ChartData;
    let targetData: ChartData | undefined;

    switch (type) {
      case "assetClass":
        chartData = {
          labels: currentData.byAssetClass.map((item) => item.name),
          datasets: [
            {
              data: currentData.byAssetClass.map((item) => item.percentage),
              backgroundColor: [...CHART_COLORS.assetClass],
              borderColor: [...CHART_COLORS.assetClassBorder],
              borderWidth: 1,
            },
          ],
        };

        if (showComparison) {
          targetData = {
            labels: currentData.byAssetClass.map((item) => item.name),
            datasets: [
              {
                label: "目前配置",
                data: currentData.byAssetClass.map((item) => item.percentage),
                backgroundColor: ["rgba(54, 162, 235, 0.6)"],
                borderColor: ["rgba(54, 162, 235, 1)"],
                borderWidth: 1,
              },
              {
                label: "推薦配置",
                data: targetAllocation.assetClass.map(
                  (item) => item.percentage
                ),
                backgroundColor: ["rgba(255, 99, 132, 0.6)"],
                borderColor: ["rgba(255, 99, 132, 1)"],
                borderWidth: 1,
              },
            ],
          };
        }
        break;
      case "sector":
        chartData = {
          labels: currentData.bySector.map((item) => item.name),
          datasets: [
            {
              data: currentData.bySector.map((item) => item.percentage),
              backgroundColor: [...CHART_COLORS.sector],
              borderColor: [...CHART_COLORS.sectorBorder],
              borderWidth: 1,
            },
          ],
        };
        break;
      case "region":
        chartData = {
          labels: currentData.byRegion.map((item) => item.name),
          datasets: [
            {
              data: currentData.byRegion.map((item) => item.percentage),
              backgroundColor: [...CHART_COLORS.region],
              borderColor: [...CHART_COLORS.regionBorder],
              borderWidth: 1,
            },
          ],
        };
        break;
      default:
        chartData = {
          labels: [],
          datasets: [
            { data: [], backgroundColor: [], borderColor: [], borderWidth: 1 },
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
          font: { size: 12 },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
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
  };

  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { size: 12 },
          usePointStyle: true,
        },
      },
      tooltip: {
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
        },
        ticks: {
          callback: function (value: string | number) {
            return value + "%";
          },
        },
      },
      y: {
        stacked: false,
      },
    },
  };

  // 計算當前與理想配置的偏差
  const calculateDeviation = (): DeviationItem[] => {
    if (activeTab !== "assetClass") return [];

    return currentData.byAssetClass.map((item) => {
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
  const handleTabClick = (tab: "assetClass" | "sector" | "region"): void => {
    setActiveTab(tab);
  };

  // 切換比較模式
  const handleToggleComparison = (): void => {
    setShowComparison(!showComparison);
  };

  // 動態生成顏色的輔助函數
  function generateDynamicColor(index: number): string {
    const colors = [
      "rgba(54, 162, 235, 0.6)",
      "rgba(75, 192, 192, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(255, 99, 132, 0.6)",
      "rgba(153, 102, 255, 0.6)",
      "rgba(255, 159, 64, 0.6)",
      "rgba(255, 99, 71, 0.6)",
      "rgba(46, 139, 87, 0.6)",
    ];
    return colors[index % colors.length];
  }

  return (
    <div className="space-y-6">
      {/* 主要配置圖表卡片 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ChartPieIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              資產配置分析
            </h3>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleToggleComparison}
              className={`flex items-center px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                showComparison
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <ScaleIcon className="h-4 w-4 mr-1" />
              對比目標配置
            </button>
          </div>
        </div>

        {/* 配置類型選項卡 */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => handleTabClick("assetClass")}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "assetClass"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <ChartPieIcon className="h-4 w-4 mr-2" />
              按資產類別
            </div>
          </button>
          <button
            onClick={() => handleTabClick("sector")}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "sector"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <BuildingLibraryIcon className="h-4 w-4 mr-2" />
              按產業分布
            </div>
          </button>
          <button
            onClick={() => handleTabClick("region")}
            className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "region"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <GlobeAsiaAustraliaIcon className="h-4 w-4 mr-2" />
              按地區分布
            </div>
          </button>
        </div>

        {/* 圖表顯示區域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 md:h-80">
            {showComparison && activeTab === "assetClass" && targetData ? (
              <Bar data={targetData} options={barChartOptions} />
            ) : (
              <Doughnut data={chartData} options={chartOptions} />
            )}
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">配置明細</h4>
            <div className="space-y-2">
              {activeTab === "assetClass" && (
                <div className="overflow-hidden bg-white rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          資產類別
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          目前配置
                        </th>
                        {showComparison && (
                          <th
                            scope="col"
                            className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            目標配置
                          </th>
                        )}
                        {showComparison && (
                          <th
                            scope="col"
                            className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            差異
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentData.byAssetClass.map((item, index) => {
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
                            className="hover:bg-gray-50"
                          >
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {item.name}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                              {item.percentage}%
                            </td>
                            {showComparison && targetItem && (
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                                {targetItem.percentage}%
                              </td>
                            )}
                            {showComparison && (
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                                <span
                                  className={`${
                                    deviation > 0
                                      ? "text-red-600"
                                      : deviation < 0
                                      ? "text-green-600"
                                      : "text-gray-600"
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
                <div className="space-y-2">
                  {currentData.bySector.map((item, index) => (
                    <div
                      key={`sector-${item.name}-${index}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: generateDynamicColor(index),
                          }}
                        ></div>
                        <span className="text-sm text-gray-700">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "region" && (
                <div className="space-y-2">
                  {currentData.byRegion.map((item, index) => (
                    <div
                      key={`region-${item.name}-${index}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: `rgba(${(index * 50) % 255}, ${
                              (index * 70 + 50) % 255
                            }, ${(index * 40 + 150) % 255}, 0.6)`,
                          }}
                        ></div>
                        <span className="text-sm text-gray-700">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 配置風險分析 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <PresentationChartLineIcon className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              配置風險分析
            </h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  集中度風險
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                  中等
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-yellow-500 h-1.5 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                科技股佔比57.8%，高於建議的35%上限
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  區域風險
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                  中等
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-yellow-500 h-1.5 rounded-full"
                  style={{ width: "55%" }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                台灣市場佔比40%，地域集中度較高
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  通膨抵禦力
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 font-medium">
                  較低
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-red-500 h-1.5 rounded-full"
                  style={{ width: "30%" }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                抗通膨資產配置僅占8%，建議至少15%
              </p>
            </div>
          </div>
        </div>

        {/* 配置優化建議 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                配置優化建議
              </h3>
            </div>

            <button className="text-sm text-blue-600 font-medium flex items-center">
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              再平衡
            </button>
          </div>

          {showComparison && unbalancedAssets.length > 0 ? (
            <div className="space-y-3">
              {unbalancedAssets.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {item.name}
                      </span>
                      <span
                        className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          item.deviation > 0
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      現在: {item.current}% | 目標: {item.target}% | 差異:{" "}
                      <span
                        className={
                          item.deviation > 0 ? "text-red-600" : "text-green-600"
                        }
                      >
                        {item.deviation > 0 ? "+" : ""}
                        {item.deviation}%
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      className={`text-xs px-2 py-1 rounded ${
                        item.deviation > 0
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {item.deviation > 0 ? "減持" : "增持"}
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-3 mt-3 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                  生成再平衡計畫
                </button>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.recommendations.map((recommendation, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-2 p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                >
                  <span
                    className={`flex-shrink-0 p-1 rounded-md mt-0.5 ${
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
                  <div>
                    <p className="text-sm text-gray-800">
                      {recommendation.text}
                    </p>
                    {recommendation.type === "negative" && (
                      <div className="mt-2">
                        <button className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                          查看調整方案
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetAllocation;
