import React, { useState, useMemo } from "react";
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
  Filler,
  TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";

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
  Filler
);

// 型別定義
interface PerformanceData {
  labels: string[];
  portfolio: number[];
  benchmark?: number[];
  [key: string]: string[] | number[] | undefined;
}

interface ChartData {
  daily: PerformanceData;
  weekly: PerformanceData;
  monthly: PerformanceData;
  returns: Record<string, number>;
  keyPeriods?: KeyPeriod[];
}

interface KeyPeriod {
  name: string;
  range: [number, number];
  color?: string;
}

interface BenchmarkOption {
  id: string;
  name: string;
  color: string;
}

interface Metrics {
  drawdown: string;
  volatility: string;
  totalReturn: string;
  annualizedReturn: string;
  highest: string;
  lowest: string;
  current: string;
}

interface PerformanceChartProps {
  data: ChartData;
  timeRange: string;
  showBenchmark?: boolean;
  showDetails?: boolean;
}

type ChartType = "line" | "area" | "bar";

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  timeRange,
  showBenchmark = false,
  showDetails = false,
}) => {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [compareIndices, setCompareIndices] = useState<string[]>(["benchmark"]);
  const [highlightPeriods, setHighlightPeriods] = useState<boolean>(false);
  const [isFullScreen] = useState<boolean>(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>(timeRange);

  // 時間範圍選項
  const timeRangeOptions = [
    { label: "1週", value: "1W" },
    { label: "1月", value: "1M" },
    { label: "3月", value: "3M" },
    { label: "6月", value: "6M" },
    { label: "1年", value: "1Y" },
    { label: "全部", value: "ALL" },
  ];

  const benchmarkOptions: BenchmarkOption[] = useMemo<BenchmarkOption[]>(
    () => [
      { id: "benchmark", name: "大盤指數", color: "rgb(255, 99, 132)" },
      { id: "sp500", name: "S&P 500", color: "rgb(54, 162, 235)" },
      { id: "nasdaq", name: "納斯達克", color: "rgb(255, 206, 86)" },
      { id: "peers", name: "同類型投資者", color: "rgb(75, 192, 192)" },
    ],
    []
  );

  // 模擬不同時間範圍的績效數據
  const performanceData = useMemo(
    () => ({
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
    }),
    []
  );

  // 根據時間範圍篩選數據
  const filteredData = useMemo((): PerformanceData => {
    const currentData =
      performanceData[selectedTimeRange as keyof typeof performanceData];

    if (currentData) {
      return {
        labels: currentData.labels,
        portfolio: currentData.portfolio,
        benchmark: currentData.benchmark,
      };
    }

    // 備用邏輯：使用原有的 data
    const dailyLabels = data?.daily?.labels || [];
    const dailyPortfolio = data?.daily?.portfolio || [];
    const dailyBenchmark = data?.daily?.benchmark;

    switch (selectedTimeRange) {
      case "1W":
        return {
          labels: dailyLabels.slice(-7),
          portfolio: dailyPortfolio.slice(-7),
          benchmark: dailyBenchmark ? dailyBenchmark.slice(-7) : [],
        };
      case "1M":
        return {
          labels: dailyLabels.slice(-30),
          portfolio: dailyPortfolio.slice(-30),
          benchmark: dailyBenchmark ? dailyBenchmark.slice(-30) : [],
        };
      case "3M":
        return {
          labels: dailyLabels.slice(-90),
          portfolio: dailyPortfolio.slice(-90),
          benchmark: dailyBenchmark ? dailyBenchmark.slice(-90) : [],
        };
      case "6M":
        return data?.weekly || { labels: [], portfolio: [] };
      case "1Y":
        return data?.weekly || { labels: [], portfolio: [] };
      case "YTD":
        return {
          labels: dailyLabels.slice(-150),
          portfolio: dailyPortfolio.slice(-150),
          benchmark: dailyBenchmark ? dailyBenchmark.slice(-150) : [],
        };
      case "ALL":
      default:
        return data?.monthly || { labels: [], portfolio: [] };
    }
  }, [data, selectedTimeRange, performanceData]);

  // 績效指標數據
  const performanceMetrics = useMemo(() => {
    const currentData =
      performanceData[selectedTimeRange as keyof typeof performanceData];

    return [
      {
        title: "總回報率",
        value: currentData?.return || "+0.00%",
        isPositive: currentData?.isPositive || false,
        description: `${selectedTimeRange}期間表現`,
        icon: currentData?.isPositive
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
  }, [selectedTimeRange, performanceData]);

  // 計算績效指標
  const calculateMetrics = useMemo((): Metrics => {
    const portfolioValues = filteredData.portfolio;
    if (portfolioValues.length === 0) {
      return {
        drawdown: "0.0",
        volatility: "0.0",
        totalReturn: "0.0",
        annualizedReturn: "0.0",
        highest: "0",
        lowest: "0",
        current: "0",
      };
    }

    const highest = Math.max(...portfolioValues);
    const lowest = Math.min(...portfolioValues);
    const current = portfolioValues[portfolioValues.length - 1];
    const initial = portfolioValues[0];

    // 計算總回報率
    const totalReturn = (((current - initial) / initial) * 100).toFixed(1);

    // 計算最大回撤
    let maxDrawdown = 0;
    let peak = portfolioValues[0];

    for (const value of portfolioValues) {
      if (value > peak) {
        peak = value;
      }
      const drawdown = ((peak - value) / peak) * 100;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    // 計算波動率（簡化計算）
    const returns = portfolioValues
      .slice(1)
      .map(
        (value, index) =>
          (value - portfolioValues[index]) / portfolioValues[index]
      );
    const avgReturn =
      returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance =
      returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) /
      returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // 年化波動率

    // 年化收益率
    const dayCount = portfolioValues.length;
    const annualizedReturn = Math.pow(current / initial, 365 / dayCount) - 1;

    return {
      drawdown: maxDrawdown.toFixed(1),
      volatility: volatility.toFixed(1),
      totalReturn: totalReturn,
      annualizedReturn: (annualizedReturn * 100).toFixed(1),
      highest: highest.toLocaleString(),
      lowest: lowest.toLocaleString(),
      current: current.toLocaleString(),
    };
  }, [filteredData]);

  // 更多績效詳情內容
  const renderPerformanceDetails = () => (
    <div className="mt-6 border-t border-gray-200 pt-6 relative z-10">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">績效詳細數據</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-700 font-medium mb-1">總回報率</div>
          <div
            className={`text-2xl font-bold ${
              Number(calculateMetrics.totalReturn) >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {Number(calculateMetrics.totalReturn) >= 0 ? "+" : ""}
            {calculateMetrics.totalReturn}%
          </div>
          <div className="text-xs text-gray-500 mt-1">期間累計收益</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-700 font-medium mb-1">
            年化報酬
          </div>
          <div className="text-2xl font-bold text-green-600">
            +{calculateMetrics.annualizedReturn}%
          </div>
          <div className="text-xs text-gray-500 mt-1">年度化收益率</div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm text-red-700 font-medium mb-1">最大回撤</div>
          <div className="text-2xl font-bold text-red-600">
            -{calculateMetrics.drawdown}%
          </div>
          <div className="text-xs text-gray-500 mt-1">從最高點下跌</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-700 font-medium mb-1">波動率</div>
          <div className="text-2xl font-bold text-gray-800">
            {calculateMetrics.volatility}%
          </div>
          <div className="text-xs text-gray-500 mt-1">年化標準差</div>
        </div>
      </div>

      {/* 詳細統計表格 */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h5 className="text-lg font-medium text-gray-900">統計數據</h5>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  指標
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  投資組合
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  基準指數
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  超額表現
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  風險指標
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  總回報率
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                  +{calculateMetrics.totalReturn}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  +{(Number(calculateMetrics.totalReturn) - 21.5).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                  +18.3%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  1.65
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 費率與報酬率分析內容
  const renderFeeAnalysis = () => (
    <div className="mt-6 border-t border-gray-200 pt-6 relative z-10">
      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <ChartBarIcon className="h-5 w-5 text-blue-600 mr-2" />
        投資成本影響分析
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 費率影響分析 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-700 mb-3">管理費用影響</h5>
          <p className="text-sm text-gray-600 mb-4">
            目前投資組合的加權平均管理費率為 1.2%，略高於建議的 0.8%。
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">年度費用影響:</span>
              <span className="font-medium text-red-600">-0.4%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">長期影響 (10年):</span>
              <span className="font-medium text-red-600">-7.02%</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-600 font-medium">
            建議: 考慮將部分主動式基金轉為低費率ETF
          </div>
        </div>

        {/* 再平衡效益分析 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-700 mb-3">再平衡效益分析</h5>
          <p className="text-sm text-gray-600 mb-4">
            定期再平衡可以維持您的風險水平，同時可能提高長期回報率。
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">上次再平衡:</span>
              <span className="font-medium text-gray-800">30天前</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">建議頻率:</span>
              <span className="font-medium text-blue-600">每季度</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-green-600 font-medium">
            下次建議再平衡: 2024年9月15日
          </div>
        </div>
      </div>
    </div>
  );

  // 圖表配置選項
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
          label: function (context: TooltipItem<"line" | "bar">) {
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
          callback: function (value: number | string) {
            return "NT$" + (Number(value) / 1000000).toFixed(1) + "M";
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
    labels: filteredData.labels,
    datasets: [
      {
        label: "投資組合",
        data: filteredData.portfolio,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "台股加權指數",
        data: filteredData.benchmark || [],
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

  // 處理基準指標選擇
  const handleBenchmarkToggle = (benchmarkId: string): void => {
    if (compareIndices.includes(benchmarkId)) {
      setCompareIndices(compareIndices.filter((id) => id !== benchmarkId));
    } else {
      setCompareIndices([...compareIndices, benchmarkId]);
    }
  };

  return (
    <div
      className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden ${
        isFullScreen ? "fixed inset-0 z-50 overflow-auto" : ""
      }`}
    >
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

        <div className="flex items-center space-x-2">
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
              <div className="text-xs text-gray-500">{metric.description}</div>
            </div>
          );
        })}
      </div>

      {/* 圖表類型和指標選擇 */}
      <div className="flex flex-wrap justify-between items-center mb-4 relative z-10">
        <div className="flex space-x-2 mb-2 sm:mb-0">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setChartType("line")}
              className={`px-4 py-2 text-xs font-medium rounded-l-lg ${
                chartType === "line"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              線圖
            </button>
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={`px-4 py-2 text-xs font-medium ${
                chartType === "area"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-t border-b border-gray-300"
              }`}
            >
              區域圖
            </button>
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`px-4 py-2 text-xs font-medium rounded-r-lg ${
                chartType === "bar"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              柱狀圖
            </button>
          </div>

          <button
            type="button"
            onClick={() => setHighlightPeriods(!highlightPeriods)}
            className={`px-3 py-2 text-xs font-medium rounded-lg flex items-center ${
              highlightPeriods
                ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
            顯示關鍵時期
          </button>
        </div>

        {showBenchmark && (
          <div className="flex flex-wrap gap-2">
            {benchmarkOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleBenchmarkToggle(option.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full flex items-center ${
                  compareIndices.includes(option.id)
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: option.color }}
                ></span>
                {option.name}
              </button>
            ))}
          </div>
        )}
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
          <Line options={performanceChartOptions} data={performanceChartData} />
        </div>

        {/* 圖表底部說明 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-500">期間回報率</div>
              <div className="text-lg font-bold text-green-600">
                {performanceData[
                  selectedTimeRange as keyof typeof performanceData
                ]?.return || "+0.00%"}
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

      {/* 更多績效詳情 */}
      {showDetails && renderPerformanceDetails()}

      {/* 費率與報酬率分析 */}
      {showDetails && renderFeeAnalysis()}
    </div>
  );
};

export default PerformanceChart;
