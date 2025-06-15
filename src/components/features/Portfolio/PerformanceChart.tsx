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
  ChartOptions,
  TooltipItem,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  ArrowsPointingOutIcon,
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

interface ChartDataset {
  label: string;
  data: number[] | (number | null)[];
  borderColor: string;
  backgroundColor: string;
  tension?: number;
  fill?: boolean;
  borderWidth: number;
  borderDash?: number[];
  pointRadius?: number;
}

interface FormattedChartData {
  labels: string[];
  datasets: ChartDataset[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  timeRange,
  showBenchmark = false,
  showDetails = false,
}) => {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [compareIndices, setCompareIndices] = useState<string[]>(["benchmark"]);
  const [highlightPeriods, setHighlightPeriods] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const benchmarkOptions: BenchmarkOption[] = [
    { id: "benchmark", name: "大盤指數", color: "rgb(255, 99, 132)" },
    { id: "sp500", name: "S&P 500", color: "rgb(54, 162, 235)" },
    { id: "nasdaq", name: "納斯達克", color: "rgb(255, 206, 86)" },
    { id: "peers", name: "同類型投資者", color: "rgb(75, 192, 192)" },
  ];

  // 根據時間範圍篩選數據
  const filteredData = useMemo((): PerformanceData => {
    // 安全地訪問 data.daily 和 data.daily.benchmark
    const dailyLabels = data?.daily?.labels || [];
    const dailyPortfolio = data?.daily?.portfolio || [];
    const dailyBenchmark = data?.daily?.benchmark;

    switch (timeRange) {
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
  }, [data, timeRange]);

  // 格式化貨幣
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // 簡化的波動率計算
  const calculateVolatility = (dataPoints: number[]): number => {
    if (dataPoints.length <= 1) return 0;

    let sum = 0;
    const changes: number[] = [];

    for (let i = 1; i < dataPoints.length; i++) {
      const change =
        ((dataPoints[i] - dataPoints[i - 1]) / dataPoints[i - 1]) * 100;
      changes.push(change);
      sum += change;
    }

    const mean = sum / changes.length;

    let variance = 0;
    for (const change of changes) {
      variance += Math.pow(change - mean, 2);
    }
    variance = variance / changes.length;

    const annualizedVolatility = Math.sqrt(variance) * Math.sqrt(252);
    return annualizedVolatility;
  };

  // 簡化的年化回報率計算
  const calculateAnnualizedReturn = (
    totalReturn: number,
    timeRange: string
  ): number => {
    const yearsMapping: Record<string, number> = {
      "1W": 1 / 52,
      "1M": 1 / 12,
      "3M": 3 / 12,
      "6M": 6 / 12,
      "1Y": 1,
      YTD: 0.5,
      ALL: 3,
    };

    const years = yearsMapping[timeRange] || 1;
    return Math.pow(1 + totalReturn / 100, 1 / years) - 1;
  };

  // 計算關鍵指標
  const metrics = useMemo((): Metrics => {
    const portfolioData = filteredData?.portfolio || [];
    if (portfolioData.length === 0) {
      return {
        drawdown: "0.00",
        volatility: "0.00",
        totalReturn: "0.00",
        annualizedReturn: "0.00",
        highest: formatCurrency(0),
        lowest: formatCurrency(0),
        current: formatCurrency(0),
      };
    }

    const highest = Math.max(...portfolioData);
    const lowest = Math.min(...portfolioData);
    const current = portfolioData[portfolioData.length - 1];
    const first = portfolioData[0];

    const drawdown = highest !== 0 ? ((highest - current) / highest) * 100 : 0;
    const volatility = calculateVolatility(portfolioData);
    const totalReturn = first !== 0 ? ((current - first) / first) * 100 : 0;
    const annualizedReturn = calculateAnnualizedReturn(totalReturn, timeRange);

    return {
      drawdown: drawdown.toFixed(2),
      volatility: volatility.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      annualizedReturn: annualizedReturn.toFixed(2),
      highest: formatCurrency(highest),
      lowest: formatCurrency(lowest),
      current: formatCurrency(current),
    };
  }, [filteredData, timeRange]);

  // 圖表數據
  const getChartData = (): FormattedChartData => {
    const datasets: ChartDataset[] = [];
    const currentPortfolioData = filteredData?.portfolio || [];
    const currentLabels = filteredData?.labels || [];

    if (currentPortfolioData.length > 0) {
      datasets.push({
        label: "投資組合",
        data: currentPortfolioData,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor:
          chartType === "area"
            ? "rgba(53, 162, 235, 0.2)"
            : "rgba(53, 162, 235, 0.7)",
        tension: 0.3,
        fill: chartType === "area",
        borderWidth: 2,
      });
    }

    if (showBenchmark) {
      compareIndices.forEach((indexId) => {
        const option = benchmarkOptions.find((opt) => opt.id === indexId);
        // 安全地訪問 filteredData[indexId]
        const benchmarkSpecificData = filteredData?.[indexId] as number[] | undefined;
        if (option && benchmarkSpecificData && benchmarkSpecificData.length > 0) {
          datasets.push({
            label: option.name,
            data: benchmarkSpecificData,
            borderColor: option.color,
            backgroundColor: `${option.color}${
              chartType === "bar" ? "70" : "20"
            }`,
            tension: 0.3,
            fill: chartType === "area",
            borderDash: indexId === "benchmark" ? [5, 5] : undefined,
            borderWidth: 2,
          });
        }
      });
    }

    // 安全地訪問 data.keyPeriods
    if (highlightPeriods && data?.keyPeriods && data.keyPeriods.length > 0) {
      data.keyPeriods.forEach((period) => {
        if (
          period.range[0] >= 0 &&
          period.range[1] < currentLabels.length &&
          currentPortfolioData.length > 0 // 確保有數據可以高亮
        ) {
          const highlightData: (number | null)[] = Array(
            currentLabels.length
          ).fill(null);
          for (let i = period.range[0]; i <= period.range[1]; i++) {
            highlightData[i] = currentPortfolioData[i];
          }

          datasets.push({
            label: period.name,
            data: highlightData,
            borderColor: period.color || "rgba(255, 99, 132, 1)",
            backgroundColor: period.color || "rgba(255, 99, 132, 0.4)",
            pointRadius: 0,
            borderWidth: 0,
            fill: true,
            tension: 0.3,
          });
        }
      });
    }

    return {
      labels: currentLabels,
      datasets,
    };
  };

  const chartData = getChartData();

  // 圖表配置選項
  const chartOptions: ChartOptions<"line" | "bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context: TooltipItem<"line" | "bar">) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    hover: {
      mode: "nearest",
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function (value: string | number) {
            return formatCurrency(Number(value));
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
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
      className={`bg-white rounded-xl shadow-lg p-6 ${
        isFullScreen ? "fixed inset-0 z-50 overflow-auto" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <DocumentChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">績效走勢分析</h3>
        </div>

        <div className="flex items-center space-x-2">
          {showDetails && (
            <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full">
              {timeRange}期間報酬率：
              <span
                className={
                  (data?.returns?.[timeRange] ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {(data?.returns?.[timeRange] ?? 0) >= 0 ? "+" : ""}
                {data?.returns?.[timeRange] ?? 0}%
              </span>
            </span>
          )}

          <button
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "退出全屏" : "全屏查看"}
          >
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 圖表類型和指標選擇 */}
      <div className="flex flex-wrap justify-between items-center mb-4">
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

      {/* 圖表顯示 */}
      <div className="h-[400px]">
        {chartType === "bar" ? (
          <Bar options={chartOptions as ChartOptions<"bar">} data={chartData} />
        ) : (
          <Line
            options={chartOptions as ChartOptions<"line">}
            data={chartData}
          />
        )}
      </div>

      {/* 績效指標卡片 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-700 font-medium mb-1">總回報率</div>
          <div
            className={`text-2xl font-bold ${
              Number(metrics.totalReturn) >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {Number(metrics.totalReturn) >= 0 ? "+" : ""}
            {metrics.totalReturn}%
          </div>
          <div className="text-xs text-gray-500 mt-1">{timeRange} 期間</div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="text-sm text-indigo-700 font-medium mb-1">
            年化回報率
          </div>
          <div
            className={`text-2xl font-bold ${
              Number(metrics.annualizedReturn) >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {Number(metrics.annualizedReturn) >= 0 ? "+" : ""}
            {metrics.annualizedReturn}%
          </div>
          <div className="text-xs text-gray-500 mt-1">折算年度表現</div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm text-red-700 font-medium mb-1">最大回撤</div>
          <div className="text-2xl font-bold text-red-600">
            {metrics.drawdown}%
          </div>
          <div className="text-xs text-gray-500 mt-1">從最高點下跌</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-700 font-medium mb-1">波動率</div>
          <div className="text-2xl font-bold text-gray-800">
            {metrics.volatility}%
          </div>
          <div className="text-xs text-gray-500 mt-1">年化標準差</div>
        </div>
      </div>

      {/* 更多績效詳情 */}
      {showDetails && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            績效詳細數據
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h5 className="font-medium text-gray-700">期間回報率</h5>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(data?.returns || {}).map(([period, value]) => (
                    <div
                      key={period}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600">{period}:</span>
                      <span
                        className={`text-sm font-medium ${
                          value >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {value >= 0 ? "+" : ""}
                        {value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h5 className="font-medium text-gray-700">資產價值走勢</h5>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">當前價值:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {metrics.current}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">初始價值:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {/* 安全地訪問 filteredData.portfolio[0] */}
                      {formatCurrency(filteredData?.portfolio?.[0] ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">最高點:</span>
                    <span className="text-sm font-medium text-green-600">
                      {metrics.highest}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">最低點:</span>
                    <span className="text-sm font-medium text-red-600">
                      {metrics.lowest}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden md:col-span-2">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h5 className="font-medium text-gray-700">績效對比</h5>
              </div>
              <div className="p-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        指標
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        報酬率
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        超額報酬
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        年化報酬
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        夏普比率
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        投資組合
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-green-600">
                        +{metrics.totalReturn}%
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                        -
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-green-600">
                        +{metrics.annualizedReturn}%
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                        1.45
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        大盤指數
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-green-600">
                        +16.8%
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-green-600">
                        +{(Number(metrics.totalReturn) - 16.8).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-green-600">
                        +14.2%
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                        1.12
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        S&P 500
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-green-600">
                        +21.5%
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-red-600">
                        {(Number(metrics.totalReturn) - 21.5).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-green-600">
                        +18.3%
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium">
                        1.65
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 費率與報酬率分析 */}
      {showDetails && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 text-blue-600 mr-2" />
            投資的影響因素分析
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-3">投資成本影響</h5>
              <p className="text-sm text-gray-600 mb-4">
                交易費用和管理費會影響您的實際報酬率。減少不必要的交易和選擇低費率產品可以提高收益。
              </p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-600">平均費率:</span>
                <span className="font-medium text-red-600">-0.68%/年</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-600">長期影響 (10年):</span>
                <span className="font-medium text-red-600">-7.02%</span>
              </div>
              <div className="mt-3 text-xs text-blue-600 font-medium">
                建議: 考慮將部分主動式基金轉為低費率ETF
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-3">再平衡效益分析</h5>
              <p className="text-sm text-gray-600 mb-4">
                定期再平衡可以維持您的風險水平，同時可能提高長期回報率。
              </p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-600">上次再平衡:</span>
                <span className="font-medium text-gray-800">90天前</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-600">預估效益:</span>
                <span className="font-medium text-green-600">+0.35%/年</span>
              </div>
              <div className="mt-3 text-xs text-blue-600 font-medium">
                建議: 考慮進行季度再平衡
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-700 mb-3">稅務效率分析</h5>
              <p className="text-sm text-gray-600 mb-4">
                稅務策略可以顯著影響您的淨回報。稅務損失收割和稅務遞延帳戶可以優化稅後回報。
              </p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-600">稅務損失機會:</span>
                <span className="font-medium text-green-600">NT$15,400</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-600">稅務效率指數:</span>
                <span className="font-medium text-gray-800">7.5/10</span>
              </div>
              <div className="mt-3 text-xs text-blue-600 font-medium">
                建議: 考慮賣出特斯拉實現稅務損失
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceChart;
