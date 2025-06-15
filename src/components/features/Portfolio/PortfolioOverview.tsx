import React, { useState } from "react";
import {
  CurrencyDollarIcon,
  ScaleIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ArrowUpRightIcon,
  GlobeAsiaAustraliaIcon,
  BuildingLibraryIcon,
  KeyIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon as SparklesSolidIcon } from "@heroicons/react/24/solid";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  ArcElement,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  ArcElement,
  Legend
);

// TypeScript 型別定義
interface TotalReturn {
  value: string;
  percentage: string;
}

interface PortfolioData {
  totalValue: string;
  totalReturn: TotalReturn;
  lastUpdate: string;
  monthlyChange: string;
}

interface PortfolioOverviewProps {
  data: PortfolioData;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor?: string | string[];
    borderWidth?: number;
    borderColor?: string;
    fill?: boolean;
    label?: string;
  }>;
}

interface InvestmentGoalProgress {
  currentAmount: number;
  targetAmount: number;
  progress: number;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ data }) => {
  // 資產配置小圖表數據
  const allocationChartData: ChartData = {
    labels: ["股票", "ETF", "債券", "加密貨幣", "現金"],
    datasets: [
      {
        data: [45, 20, 15, 12, 8], // 這些數據可以從 portfolioData.allocation 中獲取
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
        borderWidth: 0,
      },
    ],
  };

  // 迷你線圖配置
  const miniChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: {
      point: { radius: 0 },
      line: { tension: 0.4, borderWidth: 1.5 },
    },
  };

  // 最近30天走勢迷你圖數據
  const monthlyTrendData: ChartData = {
    labels: Array(30).fill(""),
    datasets: [
      {
        data: [
          2350000, 2355000, 2360000, 2365000, 2370000, 2375000, 2380000,
          2375000, 2370000, 2375000, 2380000, 2385000, 2390000, 2395000,
          2400000, 2405000, 2410000, 2415000, 2420000, 2425000, 2430000,
          2435000, 2440000, 2445000, 2450000, 2445000, 2440000, 2445000,
          2450000, 2450600,
        ],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
      },
    ],
  };

  // 預算達成進度數據
  const investmentGoalProgress: InvestmentGoalProgress = {
    currentAmount: 2450600,
    targetAmount: 5000000,
    progress: (2450600 / 5000000) * 100,
  };

  // 區域分布數據
  const regionData: ChartData = {
    labels: ["台灣", "美國", "歐洲", "亞洲其他", "其他"],
    datasets: [
      {
        data: [45, 30, 12, 8, 5],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
      },
    ],
  };

  // 產業分布數據
  const sectorData: ChartData = {
    labels: ["科技", "金融", "醫療", "能源", "消費", "其他"],
    datasets: [
      {
        label: "產業佔比",
        data: [35, 20, 15, 10, 10, 10],
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 159, 64, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      {/* 主要摘要面板 */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <DocumentChartBarIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                投資組合摘要
              </h2>
              <p className="text-sm text-gray-500 mt-1">您的財富增長概況</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              最後更新: {data.lastUpdate}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* 左側: 總資產與收益統計 */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end space-y-6 md:space-y-0 md:space-x-8">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  總資產價值
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {data.totalValue}
                </div>
                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>

              <div className="flex items-baseline space-x-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    總收益
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      parseFloat(data.totalReturn.value) >= 0
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {parseFloat(data.totalReturn.value) >= 0 ? "+" : ""}
                    {data.totalReturn.value}
                  </div>
                </div>
                <div
                  className={`text-xl font-semibold px-3 py-1 rounded-full ${
                    parseFloat(data.totalReturn.percentage) >= 0
                      ? "text-emerald-700 bg-emerald-100"
                      : "text-red-700 bg-red-100"
                  }`}
                >
                  ({data.totalReturn.percentage})
                </div>
              </div>
            </div>

            {/* 目標進度 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <KeyIcon className="h-5 w-5 text-blue-600" />
                  <div className="text-sm font-semibold text-blue-900">
                    投資目標進度
                  </div>
                </div>
                <div className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  <span className="font-semibold">
                    {investmentGoalProgress.currentAmount.toLocaleString()} NT$
                  </span>{" "}
                  / {investmentGoalProgress.targetAmount.toLocaleString()} NT$
                </div>
              </div>

              <div className="relative">
                <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full relative transition-all duration-1000 ease-out"
                    style={{
                      width: `${investmentGoalProgress.progress}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
                <div
                  className="absolute -top-1 bg-white rounded-full p-1 shadow-lg transition-all duration-1000 ease-out"
                  style={{
                    left: `${Math.min(investmentGoalProgress.progress, 95)}%`,
                  }}
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                </div>
              </div>

              <div className="text-xs text-blue-700 mt-2 flex justify-between">
                <span>
                  距離目標還差{" "}
                  <span className="font-semibold">
                    {(
                      investmentGoalProgress.targetAmount -
                      investmentGoalProgress.currentAmount
                    ).toLocaleString()}
                  </span>{" "}
                  NT$
                </span>
                <span className="font-semibold">
                  已完成 {investmentGoalProgress.progress.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* 月度趨勢迷你圖 */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-700">
                    近30日資產趨勢
                  </div>
                  <div className="text-xs text-gray-500">每日資產價值變化</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">較上月</div>
                  <div
                    className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      parseFloat(data.monthlyChange) >= 0
                        ? "text-emerald-700 bg-emerald-100"
                        : "text-red-700 bg-red-100"
                    }`}
                  >
                    {parseFloat(data.monthlyChange) >= 0 ? "+" : ""}
                    {data.monthlyChange}%
                  </div>
                </div>
              </div>
              <div className="h-28 relative">
                <Line options={miniChartOptions} data={monthlyTrendData} />
              </div>
            </div>
          </div>

          {/* 右側: 資產配置與關鍵指標 */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>

            <div className="relative z-10">
              <div className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <ChartPieIcon className="h-4 w-4 mr-2 text-gray-600" />
                資產配置
              </div>

              <div className="h-48 mb-6 relative">
                <Doughnut
                  data={allocationChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    cutout: "60%",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">100%</div>
                    <div className="text-xs text-gray-500">已配置</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {allocationChartData.labels.map((label, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <span
                        className="block w-3 h-3 rounded-full mr-3 shadow-sm"
                        style={{
                          backgroundColor:
                            allocationChartData.datasets[0].backgroundColor![
                              index
                            ],
                        }}
                      ></span>
                      <span className="text-sm text-gray-600">{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 bg-white px-2 py-1 rounded-full">
                      {allocationChartData.datasets[0].data[index]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 詳細分析面板 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* 區域分布 */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transform transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mr-3">
              <GlobeAsiaAustraliaIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">區域分布</h3>
              <p className="text-xs text-gray-500">投資地區多元化程度</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="h-44 relative">
              <Doughnut
                data={regionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  cutout: "50%",
                }}
              />
            </div>

            <div className="space-y-3">
              {regionData.labels.map((label, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span
                      className="block w-3 h-3 rounded-full mr-2 shadow-sm"
                      style={{
                        backgroundColor:
                          regionData.datasets[0].backgroundColor![index],
                      }}
                    ></span>
                    <span className="text-sm text-gray-600">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-full">
                    {regionData.datasets[0].data[index]}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 產業分布 */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transform transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mr-3">
              <BuildingLibraryIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">產業分布</h3>
              <p className="text-xs text-gray-500">各產業投資比重</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              {sectorData.labels.map((label, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">{label}</span>
                    <span className="text-gray-800 font-semibold">
                      {sectorData.datasets[0].data[index]}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${sectorData.datasets[0].data[index]}%`,
                        backgroundColor:
                          sectorData.datasets[0].backgroundColor![index],
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-44 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-gray-900">35%</div>
                <div className="text-sm text-gray-600">科技產業佔比</div>
                <div className="text-xs text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                  產業集中度較高
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 重要指標卡片列 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* 年化報酬率 */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                年化報酬率
              </h3>
              <p className="text-xs text-gray-500">年度化收益表現</p>
            </div>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">+22.4%</div>
          <div className="text-sm text-gray-500 mb-3">
            較市場指數{" "}
            <span className="text-emerald-600 font-semibold">+3.2%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: "75%" }}
            ></div>
          </div>
        </div>

        {/* 投資標的數 */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                投資標的數
              </h3>
              <p className="text-xs text-gray-500">分散投資程度</p>
            </div>
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">10</div>
          <div className="text-sm text-gray-500 mb-3">
            最高配置:{" "}
            <span className="font-semibold text-indigo-600">AAPL (12.8%)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              股票: 4
            </span>
            <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full">
              ETF: 3
            </span>
            <span className="text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              其他: 3
            </span>
          </div>
        </div>

        {/* β值 */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                投資組合β值
              </h3>
              <p className="text-xs text-gray-500">市場波動敏感度</p>
            </div>
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <ScaleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">0.85</div>
          <div className="text-sm text-gray-500 mb-3">較低市場波動敏感度</div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: "42%" }}
            ></div>
          </div>
        </div>

        {/* 最近交易 */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">最近交易</h3>
              <p className="text-xs text-gray-500">近期活動統計</p>
            </div>
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <CalendarDaysIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">5/15</div>
          <div className="text-sm text-gray-500 mb-2">
            買入:{" "}
            <span className="font-semibold text-green-600">台積電 (50股)</span>
          </div>
          <div className="text-xs text-gray-400">3筆交易 in 最近30天</div>
        </div>
      </div>

      {/* AI 投資建議摘要 */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <SparklesSolidIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI智能投資見解
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                個人化投資建議與風險提醒
              </p>
            </div>
          </div>
          <button className="text-sm text-blue-600 font-medium flex items-center bg-white/70 hover:bg-white px-4 py-2 rounded-full transition-all duration-200 transform hover:scale-105">
            查看完整建議
            <ArrowUpRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* 再平衡建議 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/30 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex-shrink-0">
                <LightBulbIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  再平衡建議
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  科技股比重達57.8%，明顯高於建議的35%上限。考慮減持AAPL和MSFT各15-20%。
                </p>
                <div className="flex items-center text-xs">
                  <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full mr-2 font-medium">
                    高優先
                  </span>
                  <span className="text-blue-600 font-medium">
                    預期風險降低15%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 投資機會 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/30 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex-shrink-0">
                <ArrowUpRightIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  投資機會
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  綠能產業具增長潛力，政策支持力度增強。建議分配約5%資金至ICLN清潔能源ETF。
                </p>
                <div className="flex items-center text-xs">
                  <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full mr-2 font-medium">
                    中優先
                  </span>
                  <span className="text-green-600 font-medium">
                    潛在年化收益+3.2%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 風險提醒 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/30 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex-shrink-0">
                <ShieldCheckIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  通膨風險防禦
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  面對攀升的通膨數據，投資組合缺少足夠的防禦性資產。建議增加GLD黃金ETF
                  (5-8%)。
                </p>
                <div className="flex items-center text-xs">
                  <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full mr-2 font-medium">
                    高優先
                  </span>
                  <span className="text-orange-600 font-medium">
                    通膨保護能力+40%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/30 flex justify-between items-center relative z-10">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-700">
              投資組合健康度
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xl font-bold text-blue-600">76</div>
              <div className="text-sm text-blue-400">/100</div>
              <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  style={{ width: "76%" }}
                ></div>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">
            最後更新: 2024-05-28 10:30
          </div>
        </div>
      </div>
    </>
  );
};

export default PortfolioOverview;
