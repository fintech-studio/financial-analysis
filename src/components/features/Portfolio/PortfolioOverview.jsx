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

const PortfolioOverview = ({ data }) => {
  // 資產配置小圖表數據
  const allocationChartData = {
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
  const monthlyTrendData = {
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
  const investmentGoalProgress = {
    currentAmount: 2450600,
    targetAmount: 5000000,
    progress: (2450600 / 5000000) * 100,
  };

  // 區域分布數據
  const regionData = {
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
  const sectorData = {
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
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <DocumentChartBarIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              投資組合摘要
            </h2>
          </div>
          <span className="text-sm text-gray-500">
            最後更新: {data.lastUpdate}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 左側: 總資產與收益統計 */}
          <div className="md:col-span-2">
            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6 mb-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">總資產價值</div>
                <div className="text-3xl font-bold text-gray-900">
                  {data.totalValue}
                </div>
              </div>
              <div className="flex items-baseline space-x-3">
                <div>
                  <div className="text-sm text-gray-500 mb-1">總收益</div>
                  <div
                    className={`text-xl font-bold ${
                      parseFloat(data.totalReturn.value) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {parseFloat(data.totalReturn.value) >= 0 ? "+" : ""}
                    {data.totalReturn.value}
                  </div>
                </div>
                <div
                  className={`text-lg font-medium ${
                    parseFloat(data.totalReturn.percentage) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ({data.totalReturn.percentage})
                </div>
              </div>
            </div>

            {/* 目標進度 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <KeyIcon className="h-4 w-4 text-blue-600 mr-1" />
                  <div className="text-sm font-medium text-gray-700">
                    投資目標進度
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">
                    {investmentGoalProgress.currentAmount.toLocaleString()} NT$
                  </span>{" "}
                  / {investmentGoalProgress.targetAmount.toLocaleString()} NT$
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${investmentGoalProgress.progress}%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                距離目標還差{" "}
                {(
                  investmentGoalProgress.targetAmount -
                  investmentGoalProgress.currentAmount
                ).toLocaleString()}{" "}
                NT$ （已完成 {investmentGoalProgress.progress.toFixed(1)}%）
              </div>
            </div>

            {/* 月度趨勢迷你圖 */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-gray-700">
                  近30日資產趨勢
                </div>
                <div className="text-xs text-gray-500">
                  <span
                    className={
                      parseFloat(data.monthlyChange) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {parseFloat(data.monthlyChange) >= 0 ? "" : ""}
                    {data.monthlyChange}%
                  </span>
                  較上月
                </div>
              </div>
              <div className="h-24">
                <Line options={miniChartOptions} data={monthlyTrendData} />
              </div>
            </div>
          </div>

          {/* 右側: 資產配置與關鍵指標 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">
              資產配置
            </div>
            <div className="h-40 mb-4">
              <Doughnut
                data={allocationChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                      position: "right",
                      labels: {
                        font: { size: 10 },
                      },
                    },
                  },
                }}
              />
            </div>

            <div className="space-y-2">
              {allocationChartData.labels.map((label, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <div className="flex items-center">
                    <span
                      className="block w-2 h-2 rounded-full mr-1"
                      style={{
                        backgroundColor:
                          allocationChartData.datasets[0].backgroundColor[
                            index
                          ],
                      }}
                    ></span>
                    <span className="text-gray-500">{label}</span>
                  </div>
                  <span className="font-medium text-gray-700">
                    {allocationChartData.datasets[0].data[index]}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 詳細分析面板 - 重新布局為占據整頁寬度的兩個區塊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 區域分布 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-3">
            <GlobeAsiaAustraliaIcon className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-md font-semibold text-gray-900">區域分布</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="h-40">
              <Doughnut
                data={regionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            </div>

            <div className="space-y-2">
              {regionData.labels.map((label, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <div className="flex items-center">
                    <span
                      className="block w-2 h-2 rounded-full mr-1"
                      style={{
                        backgroundColor:
                          regionData.datasets[0].backgroundColor[index],
                      }}
                    ></span>
                    <span className="text-gray-500">{label}</span>
                  </div>
                  <span className="font-medium text-gray-700">
                    {regionData.datasets[0].data[index]}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 產業分布 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-3">
            <BuildingLibraryIcon className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-md font-semibold text-gray-900">產業分布</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {sectorData.labels.map((label, index) => (
                <div key={index}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-700">
                      {sectorData.datasets[0].data[index]}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${sectorData.datasets[0].data[index]}%`,
                        backgroundColor:
                          sectorData.datasets[0].backgroundColor[index],
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-40 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">35%</div>
                <div className="text-xs text-gray-500">科技產業佔比</div>
                <div className="text-xs text-blue-600 mt-1">產業集中度較高</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 重要指標卡片列 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">年化報酬率</h3>
            <ChartBarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">+22.4%</div>
          <div className="mt-2 text-sm text-gray-500">
            較市場指數 <span className="text-green-500">+3.2%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: "75%" }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">投資標的數</h3>
            <CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">10</div>
          <div className="mt-2 text-sm text-gray-500">
            最高配置: <span className="font-medium">AAPL (12.8%)</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span>股票: 4</span>
            <span>ETF: 3</span>
            <span>加密貨幣: 2</span>
            <span>債券: 1</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">投資組合β值</h3>
            <ScaleIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">0.85</div>
          <div className="mt-2 text-sm text-gray-500">較低市場波動敏感度</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
            <div
              className="bg-purple-600 h-1.5 rounded-full"
              style={{ width: "42%" }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">最近交易</h3>
            <CalendarDaysIcon className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">5/15</div>
          <div className="mt-2 text-sm text-gray-500">
            買入: <span className="font-medium">台積電 (50股)</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">3筆交易 in 最近30天</div>
        </div>
      </div>

      {/* AI 投資建議摘要 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <SparklesSolidIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              AI智能投資見解
            </h2>
          </div>
          <button className="text-sm text-blue-600 font-medium flex items-center">
            查看完整建議
            <ArrowUpRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-80 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-md">
                <LightBulbIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  再平衡建議
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  科技股比重達57.8%，明顯高於建議的35%上限。考慮減持AAPL和MSFT各15-20%。
                </p>
                <div className="flex items-center mt-2 text-xs text-blue-600 font-medium">
                  <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-800 rounded-full mr-2">
                    高優先
                  </span>
                  <span>預期風險降低15%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-80 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-md">
                <ArrowUpRightIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  投資機會
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  綠能產業具增長潛力，政策支持力度增強。建議分配約5%資金至ICLN清潔能源ETF。
                </p>
                <div className="flex items-center mt-2 text-xs text-blue-600 font-medium">
                  <span className="inline-flex items-center px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full mr-2">
                    中優先
                  </span>
                  <span>潛在年化收益+3.2%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-80 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-red-100 p-2 rounded-md">
                <ShieldCheckIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  通膨風險防禦
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  面對攀升的通膨數據，投資組合缺少足夠的防禦性資產。建議增加GLD黃金ETF
                  (5-8%)。
                </p>
                <div className="flex items-center mt-2 text-xs text-blue-600 font-medium">
                  <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-800 rounded-full mr-2">
                    高優先
                  </span>
                  <span>通膨保護能力+40%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-100 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-sm font-medium text-gray-700 mr-4">
              投資組合健康度
            </div>
            <div className="flex items-center">
              <div className="text-lg font-bold text-blue-600">76</div>
              <div className="text-sm text-blue-400 ml-1">/100</div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            最後更新: 2024-05-28 10:30
          </div>
        </div>
      </div>
    </>
  );
};

export default PortfolioOverview;
