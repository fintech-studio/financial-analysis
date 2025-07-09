import React, { useState } from "react";
import {
  XMarkIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ScaleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Line } from "react-chartjs-2";
import { ChartOptions } from "chart.js";

// TypeScript 類型定義
interface Stock {
  symbol: string;
  name: string;
  price: number;
  pe?: number;
  pb?: number;
  dividend?: string;
  marketCap?: string;
  volume?: string;
  high52w?: string;
  low52w?: string;
  [key: string]: unknown;
}

interface PriceHistoryPoint {
  date: string;
  price: string;
  change: number;
}

interface PerformanceData {
  performance: string;
  isPositive: boolean;
  startPrice: string;
  endPrice: string;
}

interface ChartDataset {
  label: string;
  data: string[];
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  fill: boolean;
  tension: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface StockComparisonProps {
  availableStocks: Stock[];
}

type ComparisonPeriod = "1W" | "1M" | "3M" | "6M" | "1Y";

interface MetricConfig {
  label: string;
  key: string;
  prefix?: string;
  suffix?: string;
}

const StockComparison: React.FC<StockComparisonProps> = ({
  availableStocks,
}) => {
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([]);
  const [comparisonPeriod, setComparisonPeriod] =
    useState<ComparisonPeriod>("1M");
  const [showAddStock, setShowAddStock] = useState<boolean>(false);

  // 生成模擬的歷史價格數據
  const generatePriceHistory = (
    stock: Stock,
    days: number
  ): PriceHistoryPoint[] => {
    const data: PriceHistoryPoint[] = [];
    let price = stock.price;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // 模擬價格波動
      const change = (Math.random() - 0.5) * 0.05; // ±2.5%
      price = price * (1 + change);

      data.push({
        date: date.toISOString().split("T")[0],
        price: price.toFixed(2),
        change: change,
      });
    }

    return data;
  };

  const getPeriodDays = (period: ComparisonPeriod): number => {
    switch (period) {
      case "1W":
        return 7;
      case "1M":
        return 30;
      case "3M":
        return 90;
      case "6M":
        return 180;
      case "1Y":
        return 365;
      default:
        return 30;
    }
  };

  const addStock = (stock: Stock): void => {
    if (
      selectedStocks.length < 4 &&
      !selectedStocks.find((s) => s.symbol === stock.symbol)
    ) {
      setSelectedStocks([...selectedStocks, stock]);
    }
    setShowAddStock(false);
  };

  const removeStock = (symbol: string): void => {
    setSelectedStocks(selectedStocks.filter((s) => s.symbol !== symbol));
  };

  const getChartData = (): ChartData | null => {
    if (selectedStocks.length === 0) return null;

    const days = getPeriodDays(comparisonPeriod);
    const labels: string[] = [];

    // 生成日期標籤
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString());
    }

    const datasets: ChartDataset[] = selectedStocks.map((stock, index) => {
      const history = generatePriceHistory(stock, days);
      const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B"];

      return {
        label: stock.symbol,
        data: history.map((h) => h.price),
        borderColor: colors[index],
        backgroundColor: colors[index] + "20",
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      };
    });

    return { labels, datasets };
  };

  const calculatePerformance = (stock: Stock): PerformanceData => {
    const days = getPeriodDays(comparisonPeriod);
    const history = generatePriceHistory(stock, days);
    const startPrice = parseFloat(history[0].price);
    const endPrice = parseFloat(history[history.length - 1].price);
    const performance = ((endPrice - startPrice) / startPrice) * 100;

    return {
      performance: performance.toFixed(2),
      isPositive: parseFloat(performance.toFixed(2)) >= 0,
      startPrice: startPrice.toFixed(2),
      endPrice: endPrice.toFixed(2),
    };
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `股票價格比較 - ${comparisonPeriod}`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "價格 ($)",
        },
      },
      x: {
        title: {
          display: true,
          text: "日期",
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  const metrics: MetricConfig[] = [
    { label: "當前價格", key: "price", prefix: "$" },
    { label: "52週高點", key: "high52w", prefix: "$" },
    { label: "52週低點", key: "low52w", prefix: "$" },
    { label: "P/E比", key: "pe" },
    { label: "P/B比", key: "pb" },
    { label: "股息收益率", key: "dividend", suffix: "%" },
    { label: "市值", key: "marketCap" },
    { label: "成交量", key: "volume" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ScaleIcon className="h-5 w-5 mr-2" />
              股票比較分析
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              並排比較多支股票的價格表現和技術指標
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={comparisonPeriod}
              onChange={(e) =>
                setComparisonPeriod(e.target.value as ComparisonPeriod)
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1W">1週</option>
              <option value="1M">1個月</option>
              <option value="3M">3個月</option>
              <option value="6M">6個月</option>
              <option value="1Y">1年</option>
            </select>

            <button
              onClick={() => setShowAddStock(true)}
              disabled={selectedStocks.length >= 4}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              添加股票
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {selectedStocks.length === 0 ? (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              開始比較股票
            </h4>
            <p className="text-gray-500 mb-6">
              選擇最多4支股票進行並排比較分析
            </p>
            <button
              onClick={() => setShowAddStock(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              添加第一支股票
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 已選股票卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedStocks.map((stock) => {
                const performance = calculatePerformance(stock);
                return (
                  <div
                    key={stock.symbol}
                    className="border border-gray-200 rounded-lg p-4 relative"
                  >
                    <button
                      onClick={() => removeStock(stock.symbol)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>

                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900">
                        {stock.symbol}
                      </h4>
                      <p className="text-sm text-gray-500">{stock.name}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">當前價格</span>
                        <span className="font-medium">${stock.price}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          {comparisonPeriod}表現
                        </span>
                        <div
                          className={`flex items-center ${
                            performance.isPositive
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {performance.isPositive ? (
                            <ArrowUpIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3 mr-1" />
                          )}
                          <span className="font-medium">
                            {performance.performance}%
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">P/E比</span>
                        <span className="font-medium">{stock.pe || "N/A"}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">市值</span>
                        <span className="font-medium">
                          {stock.marketCap || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 價格走勢圖 */}
            {getChartData() && (
              <div className="bg-gray-50 rounded-lg p-6">
                <Line data={getChartData()!} options={chartOptions} />
              </div>
            )}

            {/* 詳細比較表格 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      指標
                    </th>
                    {selectedStocks.map((stock) => (
                      <th
                        key={stock.symbol}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {stock.symbol}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.map((metric) => (
                    <tr key={metric.key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {metric.label}
                      </td>
                      {selectedStocks.map((stock) => (
                        <td
                          key={stock.symbol}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {metric.prefix || ""}
                          {stock[metric.key] !== undefined &&
                          stock[metric.key] !== null
                            ? String(stock[metric.key])
                            : "N/A"}
                          {metric.suffix || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 添加股票選擇器 */}
        {showAddStock && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">選擇股票</h4>
                <button
                  onClick={() => setShowAddStock(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {availableStocks
                  .filter(
                    (stock) =>
                      !selectedStocks.find((s) => s.symbol === stock.symbol)
                  )
                  .map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => addStock(stock)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-gray-500">{stock.name}</div>
                      <div className="text-sm text-gray-900">
                        ${stock.price}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockComparison;
