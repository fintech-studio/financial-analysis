import React, { useState, useMemo } from "react";
import {
  CurrencyDollarIcon,
  ScaleIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ArrowUpRightIcon,
  KeyIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
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
  value: string | number;
  percentage: string | number;
}

interface PortfolioData {
  totalValue: string | number;
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
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("1M");

  // 安全的數據轉換函數
  const formatCurrency = (value: string | number): string => {
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    if (typeof value === "string") {
      const numValue = parseFloat(value.replace(/[^\d.-]/g, ""));
      return isNaN(numValue) ? "0" : numValue.toLocaleString();
    }
    return "0";
  };

  const formatPercentage = (value: string | number): string => {
    if (typeof value === "number") {
      return value.toFixed(2) + "%";
    }
    if (typeof value === "string") {
      const cleanValue = value.replace("%", "");
      const numValue = parseFloat(cleanValue);
      return isNaN(numValue) ? "0.00%" : numValue.toFixed(2) + "%";
    }
    return "0.00%";
  };

  const getTotalReturnNumber = (value: string | number): number => {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      const numValue = parseFloat(value.replace(/[^\d.-]/g, ""));
      return isNaN(numValue) ? 0 : numValue;
    }
    return 0;
  };

  const getTotalReturnPercentageNumber = (value: string | number): number => {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      const cleanValue = value.replace("%", "");
      const numValue = parseFloat(cleanValue);
      return isNaN(numValue) ? 0 : numValue;
    }
    return 0;
  };

  // 時間範圍選項
  const timeRangeOptions = [
    { label: "1週", value: "1W" },
    { label: "1月", value: "1M" },
    { label: "3月", value: "3M" },
    { label: "6月", value: "6M" },
    { label: "1年", value: "1Y" },
    { label: "全部", value: "ALL" },
  ];

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

  // 迷你線圖配置 - 美化版本
  const miniChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(59, 130, 246, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: () => "",
          label: function (context: any) {
            return `NT$${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 4,
        backgroundColor: "rgb(59, 130, 246)",
        borderColor: "white",
        borderWidth: 2,
      },
      line: {
        tension: 0.4,
        borderWidth: 2.5,
        shadowColor: "rgba(59, 130, 246, 0.3)",
        shadowBlur: 10,
        shadowOffsetY: 2,
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  // 最近30天走勢迷你圖數據 - 增強版本
  const monthlyTrendData: ChartData = {
    labels: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toLocaleDateString("zh-TW", {
        month: "short",
        day: "numeric",
      });
    }),
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
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        fill: true,
      },
    ],
  };

  // 計算趨勢統計
  const trendStats = useMemo(() => {
    const data = monthlyTrendData.datasets[0].data;
    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const changePercent = ((lastValue - firstValue) / firstValue) * 100;
    const volatility = (((maxValue - minValue) / firstValue) * 100).toFixed(1);

    return {
      change: lastValue - firstValue,
      changePercent: parseFloat(changePercent.toFixed(2)),
      maxValue,
      minValue,
      volatility: parseFloat(volatility),
      upDays: data.slice(1).filter((value, index) => value > data[index])
        .length,
      totalDays: data.length - 1,
    };
  }, [monthlyTrendData]);

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

  // 績效走勢數據
  const performanceData = {
    "1W": {
      labels: ["6/10", "6/11", "6/12", "6/13", "6/14", "6/15", "6/16"],
      portfolio: [
        2450600, 2456800, 2463200, 2458900, 2465400, 2471800, 2475300,
      ],
      benchmark: [18500, 18520, 18545, 18532, 18558, 18575, 18583],
      return: "+1.01%",
      isPositive: true,
    },
    "1M": {
      labels: ["5/17", "5/24", "5/31", "6/7", "6/14", "6/16"],
      portfolio: [2385000, 2398500, 2415600, 2435800, 2455200, 2475300],
      benchmark: [18200, 18280, 18350, 18420, 18520, 18583],
      return: "+3.79%",
      isPositive: true,
    },
    "3M": {
      labels: ["4月", "5月", "6月"],
      portfolio: [2280000, 2385000, 2475300],
      benchmark: [17800, 18200, 18583],
      return: "+8.56%",
      isPositive: true,
    },
    "6M": {
      labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
      portfolio: [2150000, 2195000, 2245000, 2280000, 2385000, 2475300],
      benchmark: [17200, 17350, 17500, 17800, 18200, 18583],
      return: "+15.13%",
      isPositive: true,
    },
    "1Y": {
      labels: ["2023/6", "2023/9", "2023/12", "2024/3", "2024/6"],
      portfolio: [2000000, 2088000, 2156000, 2245000, 2475300],
      benchmark: [16500, 16800, 17100, 17500, 18583],
      return: "+23.77%",
      isPositive: true,
    },
    ALL: {
      labels: ["2022", "2023", "2024"],
      portfolio: [1800000, 2156000, 2475300],
      benchmark: [15800, 17100, 18583],
      return: "+37.52%",
      isPositive: true,
    },
  };

  const currentPerformanceData =
    performanceData[selectedTimeRange as keyof typeof performanceData];

  // 績效圖表配置
  const performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.datasetIndex === 0) {
              // 投資組合數據 - 顯示為貨幣
              label += "NT$" + context.parsed.y.toLocaleString();
            } else {
              // 基準指數 - 顯示數值
              label += context.parsed.y.toLocaleString();
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "投資組合價值 (NT$)",
        },
        ticks: {
          callback: function (value: any) {
            return "NT$" + (value / 1000000).toFixed(1) + "M";
          },
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "基準指數",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  // 績效圖表數據
  const performanceChartData = {
    labels: currentPerformanceData.labels,
    datasets: [
      {
        label: "投資組合",
        data: currentPerformanceData.portfolio,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "台股加權指數",
        data: currentPerformanceData.benchmark,
        borderColor: "rgb(156, 163, 175)",
        backgroundColor: "rgba(156, 163, 175, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        borderDash: [5, 5],
        yAxisID: "y1",
      },
    ],
  };

  // 績效指標數據
  const performanceMetrics = [
    {
      title: "總回報率",
      value: currentPerformanceData.return,
      isPositive: currentPerformanceData.isPositive,
      description: `${selectedTimeRange}期間表現`,
      icon: currentPerformanceData.isPositive
        ? ArrowTrendingUpIcon
        : ArrowTrendingDownIcon,
    },
    {
      title: "年化收益率",
      value: "+22.4%",
      isPositive: true,
      description: "折算年度表現",
      icon: ArrowTrendingUpIcon,
    },
    {
      title: "最大回撤",
      value: "-8.2%",
      isPositive: false,
      description: "最大下跌幅度",
      icon: ArrowTrendingDownIcon,
    },
    {
      title: "波動率",
      value: "15.3%",
      isPositive: null,
      description: "風險水平指標",
      icon: ChartBarIcon,
    },
  ];

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
              <h2 className="text-2xl font-bold text-gray-800 bg-clip-text">
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
            {/* 總資產價值和總收益 - 左右排列設計 */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between space-y-6 md:space-y-0 md:space-x-8">
              {/* 左側：總資產價值 */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  總資產價值
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-2">
                  NT$ {formatCurrency(data.totalValue)}
                </div>
                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full "></div>
              </div>

              {/* 右側：總收益 */}
              <div className="space-y-1 pb-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    總收益
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-sm font-semibold${
                      getTotalReturnPercentageNumber(
                        data.totalReturn.percentage
                      ) >= 0
                        ? "text-emerald-700 bg-emerald-100 border border-emerald-200"
                        : "text-red-700 bg-red-100 border border-red-200"
                    }`}
                  >
                    {getTotalReturnPercentageNumber(
                      data.totalReturn.percentage
                    ) >= 0
                      ? "+"
                      : ""}
                    {formatPercentage(data.totalReturn.percentage)}
                  </div>
                </div>
                <div
                  className={`text-4xl font-bold pb-2 ${
                    getTotalReturnNumber(data.totalReturn.value) >= 0
                      ? "text-emerald-600"
                      : "text-red-500"
                  }`}
                >
                  {getTotalReturnNumber(data.totalReturn.value) >= 0 ? "+" : ""}
                  NT$ {formatCurrency(data.totalReturn.value)}
                </div>
              </div>
            </div>

            {/* 資金運用進度 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <KeyIcon className="h-5 w-5 text-blue-600" />
                  <div className="text-sm font-semibold text-blue-900">
                    資金運用狀況
                  </div>
                </div>
                <div className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  <span className="font-semibold">
                    NT$ {investmentGoalProgress.currentAmount.toLocaleString()}
                  </span>{" "}
                  / NT$ {investmentGoalProgress.targetAmount.toLocaleString()}
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
                  className="absolute -top-1 bg-white rounded-full p-1 shadow-lg transition-all duration-1000 ease-out -ml-2"
                  style={{
                    left: `${Math.min(investmentGoalProgress.progress, 95)}%`,
                  }}
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                </div>
              </div>

              <div className="text-xs text-blue-700 mt-2 flex justify-between">
                <span>
                  可用餘額 NT${" "}
                  <span className="font-semibold">
                    {(
                      investmentGoalProgress.targetAmount -
                      investmentGoalProgress.currentAmount
                    ).toLocaleString()}
                  </span>
                </span>
                <span className="font-semibold">
                  資金運用率 {investmentGoalProgress.progress.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* 月度趨勢迷你圖 - 美化版本 */}
            <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-lg relative overflow-hidden">
              {/* 背景裝飾 */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-xl"></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                    <div className="text-base font-bold text-gray-800">
                      近30日資產趨勢
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    每日資產價值變化軌跡
                  </div>

                  {/* 趨勢統計摘要 */}
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">
                        上漲 {trendStats.upDays} 天
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">
                        下跌 {trendStats.totalDays - trendStats.upDays} 天
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="text-xs text-gray-500">較期初變化</div>
                  {/* 金額和百分比改為左右排列 */}
                  <div className="flex items-center space-x-2 justify-end">
                    <div className="text-xs text-gray-500">
                      NT$ {trendStats.change >= 0 ? "+" : ""}
                      {trendStats.change.toLocaleString()}
                    </div>
                    <div
                      className={`text-lg font-bold px-3 py-1.5 rounded-full shadow-sm ${
                        trendStats.changePercent >= 0
                          ? "text-emerald-700 bg-emerald-100 border border-emerald-200"
                          : "text-red-700 bg-red-100 border border-red-200"
                      }`}
                    >
                      {trendStats.changePercent >= 0 ? "+" : ""}
                      {trendStats.changePercent}%
                    </div>
                  </div>
                </div>
              </div>

              {/* 圖表區域 */}
              <div className="h-32 relative mb-4 bg-white rounded-xl p-3 shadow-inner">
                <Line options={miniChartOptions} data={monthlyTrendData} />
              </div>

              {/* 趨勢分析小提示 */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 relative z-10">
                <div className="flex items-start space-x-2">
                  <div className="p-1 bg-blue-500 rounded-full mt-0.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-blue-900 mb-1">
                      趨勢分析
                    </div>
                    <div className="text-xs text-blue-700">
                      {trendStats.changePercent > 0
                        ? `資產呈現上升趨勢，月內累計增長 ${trendStats.changePercent}%，表現穩健。`
                        : trendStats.changePercent < -2
                        ? `資產出現調整，建議關注市場變化並考慮風險控制。`
                        : `資產表現相對穩定，波動控制在合理範圍內。`}
                    </div>
                  </div>
                </div>
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

      {/* 重要指標卡片列 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* 年化報酬率 */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl">
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
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl">
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
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl">
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
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl">
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
          <button className="text-sm text-blue-600 font-medium flex items-center bg-white/70 hover:bg-white px-4 py-2 rounded-full transition-all duration-200">
            查看完整建議
            <ArrowUpRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* 再平衡建議 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/30 transition-all duration-300">
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/30 transition-all duration-300">
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/30 transition-all duration-300">
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

      {/* 績效走勢分析 */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-green-100/30 to-blue-100/30 rounded-full blur-3xl -translate-y-32 -translate-x-32"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 relative z-10">
          <div className="flex items-center space-x-3 mb-4 lg:mb-0">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg">
              <DocumentChartBarIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 bg-clip-text">
                績效走勢分析
              </h2>
              <p className="text-sm text-gray-500 mt-1">投資組合歷史表現追蹤</p>
            </div>
          </div>

          {/* 時間範圍選擇器 */}
          <div className="flex flex-wrap gap-2">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedTimeRange(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  selectedTimeRange === option.value
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 績效指標卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
          {performanceMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </div>
                  <IconComponent
                    className={`h-5 w-5 ${
                      metric.isPositive === true
                        ? "text-green-500"
                        : metric.isPositive === false
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  />
                </div>
                <div
                  className={`text-2xl font-bold mb-1 ${
                    metric.isPositive === true
                      ? "text-green-600"
                      : metric.isPositive === false
                      ? "text-red-600"
                      : "text-gray-800"
                  }`}
                >
                  {metric.value}
                </div>
                <div className="text-xs text-gray-500">
                  {metric.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* 績效圖表 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              投資組合 vs 基準指數
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600">投資組合</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-0.5 bg-gray-400 mr-2"></div>
                <span className="text-gray-600">台股加權指數</span>
              </div>
            </div>
          </div>

          <div className="h-[400px]">
            <Line
              options={performanceChartOptions}
              data={performanceChartData}
            />
          </div>

          {/* 圖表底部說明 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-500">期間回報率</div>
                <div
                  className={`text-lg font-bold ${
                    currentPerformanceData.isPositive
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {currentPerformanceData.return}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">超額回報率</div>
                <div className="text-lg font-bold text-blue-600">+5.2%</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">夏普比率</div>
                <div className="text-lg font-bold text-gray-800">1.65</div>
              </div>
            </div>
          </div>
        </div>

        {/* 績效分析洞察 */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 relative z-10">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-blue-900 mb-2">
                績效分析洞察
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-800 mb-2">
                    <span className="font-medium">✓ 表現優異：</span>
                    您的投資組合在{selectedTimeRange}
                    期間表現優於市場基準指數5.2%，顯示良好的選股和配置策略。
                  </p>
                </div>
                <div>
                  <p className="text-blue-800">
                    <span className="font-medium">→ 風險控制：</span>
                    夏普比率1.65表示在承擔相對風險下獲得了不錯的回報，風險調整後收益表現良好。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PortfolioOverview;
