import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AIPredictionController } from "@/controllers/AIPredictionController";
import {
  STOCK_DATA,
  TECHNICAL_INDICATORS,
} from "@/data/prediction/predictionData";
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
  ChartOptions,
  ChartTypeRegistry,
  ScriptableContext,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import {
  MagnifyingGlassIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  LightBulbIcon,
  MinusIcon,
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
  Legend
);

interface OhlcvData {
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

// 簡單的種子隨機數生成器，確保數據一致性
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const EnhancedAIPredictionDashboard: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState("TWSE");
  const [stockData, setStockData] = useState(STOCK_DATA.TWSE);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ symbol: string; name: string }>
  >([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [timeRange, setTimeRange] = useState<
    "1D" | "1W" | "1M" | "3M" | "6M" | "1Y"
  >("1W");
  const [currentTime, setCurrentTime] = useState(new Date());

  const controller = AIPredictionController.getInstance();

  // 更新時間 - 改為每30秒更新一次，減少重新渲染
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // 台股指數 OHLC 數據
  const ohlcvData: OhlcvData = useMemo(
    () => ({
      open: stockData?.open || "18,091",
      high: stockData?.high || "18,157",
      low: stockData?.low || "18,017",
      close: stockData?.price || "18,125",
      volume: stockData?.lot || "2,186億",
    }),
    [stockData]
  );

  // 計算價格變化
  const priceChange = useMemo(() => {
    const current = parseFloat(ohlcvData.close.replace(/,/g, ""));
    const open = parseFloat(ohlcvData.open.replace(/,/g, ""));
    const change = current - open;
    const changePercent = (change / open) * 100;

    return {
      value: change,
      percent: changePercent,
      isPositive: change >= 0,
    };
  }, [ohlcvData]);

  // 簡化的圖表數據 - 使用穩定的模擬數據
  const chartData = useMemo(() => {
    const basePrice = parseFloat(ohlcvData.close.replace(/,/g, ""));
    const baseVolume =
      parseFloat(ohlcvData.volume.replace(/[億,]/g, "")) * 100000000; // 轉換億為數字
    const days =
      timeRange === "1D"
        ? 1
        : timeRange === "1W"
        ? 7
        : timeRange === "1M"
        ? 30
        : timeRange === "3M"
        ? 90
        : timeRange === "6M"
        ? 180
        : 365; // 1Y

    const labels = [];
    const historicalPrices = [];
    const predictedPrices = [];
    const historicalVolumes = [];
    const predictedVolumes = [];

    // 針對1D模式的特殊處理
    if (timeRange === "1D") {
      // 1D模式：顯示今天的小時級數據
      for (let i = 6; i >= 1; i--) {
        const date = new Date();
        date.setHours(date.getHours() - i);
        labels.push(
          date.toLocaleTimeString("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );

        // 使用種子隨機數確保數據穩定
        const seed = i + 1000;
        const randomFactor = (seededRandom(seed) - 0.5) * 0.01;
        const price = basePrice * (1 + randomFactor - i * 0.0002);
        historicalPrices.push(price);

        // 生成成交量數據
        const volumeSeed = i + 2000;
        const volumeRandomFactor = (seededRandom(volumeSeed) - 0.5) * 0.3;
        const volume = baseVolume * (0.3 + volumeRandomFactor + i * 0.05);
        historicalVolumes.push(volume);
      }

      // 當前時刻
      labels.push("現在");
      historicalPrices.push(basePrice);
      historicalVolumes.push(baseVolume);
    } else {
      // 其他模式：歷史數據 - 使用穩定的種子生成數據 (不包含今日)
      for (let i = days; i >= 2; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i + 1);
        labels.push(
          date.toLocaleDateString("zh-TW", { month: "short", day: "numeric" })
        );

        // 使用種子隨機數確保數據穩定
        const seed =
          i +
          (timeRange === "1W"
            ? 2000
            : timeRange === "1M"
            ? 3000
            : timeRange === "3M"
            ? 4000
            : timeRange === "6M"
            ? 5000
            : 6000);
        const randomFactor = (seededRandom(seed) - 0.5) * 0.02;
        const price = basePrice * (1 + randomFactor - (i - 1) * 0.0005);
        historicalPrices.push(price);

        // 生成成交量數據
        const volumeSeed = seed + 1000;
        const volumeRandomFactor = (seededRandom(volumeSeed) - 0.5) * 0.4;
        const volume =
          baseVolume * (0.6 + volumeRandomFactor + (days - i) * 0.02);
        historicalVolumes.push(volume);
      }

      // 當前
      labels.push("今日");
      historicalPrices.push(basePrice);
      historicalVolumes.push(baseVolume);
    }

    // AI 預測 - 使用穩定的種子生成數據
    const predictionPeriod = timeRange === "1D" ? 6 : 7; // 1D模式預測6小時，其他模式預測7天
    for (let i = 1; i <= predictionPeriod; i++) {
      if (timeRange === "1D") {
        // 1D模式：預測未來小時
        const date = new Date();
        date.setHours(date.getHours() + i);
        labels.push(
          date.toLocaleTimeString("zh-TW", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } else {
        // 其他模式：預測未來天數
        const date = new Date();
        date.setDate(date.getDate() + i);
        labels.push(
          date.toLocaleDateString("zh-TW", { month: "short", day: "numeric" })
        );
      }

      // 使用種子隨機數確保預測數據穩定
      const seed =
        i +
        5000 +
        (timeRange === "1D"
          ? 100
          : timeRange === "1W"
          ? 200
          : timeRange === "1M"
          ? 300
          : timeRange === "3M"
          ? 400
          : timeRange === "6M"
          ? 500
          : 600);
      const randomFactor = (seededRandom(seed) - 0.5) * 0.01;
      const trendFactor = timeRange === "1D" ? 0.001 : 0.003; // 1D模式變化更小
      const price = basePrice * (1 + i * trendFactor + randomFactor);
      predictedPrices.push(price);

      // 生成預測成交量數據
      const volumeSeed = seed + 2000;
      const volumeRandomFactor = (seededRandom(volumeSeed) - 0.5) * 0.3;
      const volume = baseVolume * (0.8 + volumeRandomFactor + i * 0.05);
      predictedVolumes.push(volume);
    }

    return {
      labels,
      datasets: [
        {
          type: "line" as const,
          label: "歷史價格",
          data: [
            ...historicalPrices,
            ...Array(predictedPrices.length).fill(null),
          ],
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.05)",
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: "#3B82F6",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          spanGaps: false,
          yAxisID: "y",
        },
        {
          type: "line" as const,
          label: "AI 預測",
          data: [
            ...Array(historicalPrices.length - 1).fill(null), // 填充到歷史價格最後一點之前
            historicalPrices[historicalPrices.length - 1], // 與歷史價格最後一點相同
            ...predictedPrices,
          ],
          borderColor: "#EC4899",
          backgroundColor: "rgba(236, 72, 153, 0.05)",
          borderWidth: 3,
          borderDash: [8, 4],
          tension: 0.6,
          pointBackgroundColor: "#EC4899",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 8,
          fill: false,
          spanGaps: false,
          yAxisID: "y",
        },
        {
          type: "bar" as const,
          label: "成交量",
          data: [...historicalVolumes, ...predictedVolumes],
          backgroundColor: (context: ScriptableContext<"bar">) => {
            const index = context.dataIndex;
            const isHistorical = index < historicalVolumes.length;
            return isHistorical
              ? "rgba(34, 197, 94, 0.6)"
              : "rgba(168, 85, 247, 0.4)";
          },
          borderColor: (context: ScriptableContext<"bar">) => {
            const index = context.dataIndex;
            const isHistorical = index < historicalVolumes.length;
            return isHistorical
              ? "rgba(34, 197, 94, 0.8)"
              : "rgba(168, 85, 247, 0.6)";
          },
          borderWidth: 1,
          yAxisID: "y1",
          order: 1,
        },
      ],
    };
  }, [ohlcvData, timeRange]);

  // 穩定的技術指標數據
  const stableIndicatorData = useMemo(() => {
    return TECHNICAL_INDICATORS.slice(0, 6).map((indicator, index) => {
      // 使用指標索引作為種子，確保每個指標的數據穩定
      const seed = index + 6000;
      const signalStrength = Math.floor(seededRandom(seed) * 41) + 60;
      return {
        ...indicator,
        signalStrength,
      };
    });
  }, []);

  // 穩定的市場情緒數據
  const stableMarketSentiment = useMemo(() => {
    return ["技術面", "基本面", "資金面"].map((label, index) => {
      const seed = index + 7000;
      const percentage = Math.floor(seededRandom(seed) * 41) + 60;
      return { label, percentage };
    });
  }, []);

  // 優化的圖表選項
  const chartOptions: ChartOptions<keyof ChartTypeRegistry> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 13,
            weight: 500,
          },
          color: "#374151",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#F9FAFB",
        bodyColor: "#F9FAFB",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const isVolumeData = context.dataset.label?.includes("成交量");
            if (isVolumeData) {
              // 成交量數據格式化為億，並根據數據索引動態顯示標籤
              const volumeInBillion = (value || 0) / 100000000;
              const dataIndex = context.dataIndex;

              // 動態計算歷史數據的實際長度
              const actualHistoricalLength =
                timeRange === "1D"
                  ? 7
                  : timeRange === "1W"
                  ? 7
                  : timeRange === "1M"
                  ? 30
                  : timeRange === "3M"
                  ? 90
                  : timeRange === "6M"
                  ? 180
                  : 365; // 1Y

              const isHistorical = dataIndex < actualHistoricalLength;
              const label = isHistorical ? "歷史成交量" : "AI預測成交量";
              return `${label}: ${volumeInBillion.toFixed(2)}億`;
            }
            return `${context.dataset.label}: ${value?.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
          },
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        beginAtZero: false,
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          color: "#3B82F6",
          font: {
            size: 11,
          },
          callback: function (value) {
            return (value as number).toLocaleString();
          },
        },
        title: {
          display: true,
          text: "價格 (NT$)",
          color: "#3B82F6",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        beginAtZero: true,
        grid: {
          drawOnChartArea: false, // 不在圖表區域繪製網格線，避免重複
        },
        ticks: {
          color: "#22C55E",
          font: {
            size: 11,
          },
          callback: function (value) {
            // 成交量以億為單位顯示
            const volumeInBillion = (value as number) / 100000000;
            return `${volumeInBillion.toFixed(1)}億`;
          },
        },
        title: {
          display: true,
          text: "成交量",
          color: "#22C55E",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  // 搜尋功能
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.length > 1) {
        const results = await controller.searchStocks({ query });
        setSearchResults(results);
        setShowSearchResults(true);
      } else {
        setShowSearchResults(false);
      }
    },
    [controller]
  );

  const selectStock = useCallback((symbol: string) => {
    setSelectedStock(symbol);
    setStockData(
      STOCK_DATA[symbol as keyof typeof STOCK_DATA] || STOCK_DATA.TWSE
    );
    setShowSearchResults(false);
    setSearchQuery("");
  }, []);

  return (
    <div className="space-y-8">
      {/* 優化的標題區域 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              AI 預測儀表板
            </h1>
            <p className="text-gray-600 flex items-center">
              <SparklesIcon className="h-4 w-4 mr-2 text-blue-500" />
              智能股市分析與預測系統
            </p>
          </div>
        </div>
      </div>

      {/* 優化的搜尋列 */}
      <div className="mb-8">
        <div className="relative max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜尋股票代碼或名稱..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
          />

          {/* 搜尋結果 */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-10 mt-2 w-full bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden">
              {searchResults.map((result) => (
                <div
                  key={result.symbol}
                  onClick={() => selectStock(result.symbol)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 border-b border-gray-50 last:border-0"
                >
                  <span className="font-semibold text-gray-900">
                    {result.symbol}
                  </span>
                  <span className="ml-2 text-gray-600">{result.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 主圖表區域 */}
        <div className="lg:col-span-3">
          {/* 股票資訊卡片 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 hover:shadow-xl transition-shadow duration-300">
            {/* 股票標題 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-lg font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {selectedStock}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900">
                      台股加權指數
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      更新時間：
                      {currentTime.toLocaleString("zh-TW", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 簡約的時間範圍選擇 */}
              <div className="flex bg-white rounded-lg border border-gray-200 shadow-sm">
                {["1D", "1W", "1M", "3M", "6M", "1Y"].map((range) => (
                  <button
                    key={range}
                    onClick={() =>
                      setTimeRange(
                        range as "1D" | "1W" | "1M" | "3M" | "6M" | "1Y"
                      )
                    }
                    className={`px-3 py-2 text-sm font-medium transition-all duration-200 first:rounded-l-lg last:rounded-r-lg ${
                      timeRange === range
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* 價格資訊區域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* 主要價格顯示 */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-end space-x-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {ohlcvData.close}
                  </div>
                  <div
                    className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      priceChange.isPositive
                        ? "bg-emerald-50 text-emerald-700"
                        : priceChange.percent === 0
                        ? "bg-gray-50 text-gray-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {priceChange.isPositive ? (
                      <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
                    ) : priceChange.percent === 0 ? (
                      <MinusIcon className="h-5 w-5 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-5 w-5 mr-1" />
                    )}
                    <span>
                      {priceChange.isPositive ? "+" : ""}
                      {priceChange.value.toFixed(2)} (
                      {priceChange.isPositive ? "+" : ""}
                      {priceChange.percent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* OHLC 資訊 - 同一行排列，無背景 */}
              <div className="flex items-center justify-between lg:justify-end space-x-6">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1 font-medium">
                    開盤
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {ohlcvData.open}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1 font-medium">
                    最高
                  </div>
                  <div className="text-base font-semibold text-emerald-600">
                    {ohlcvData.high}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1 font-medium">
                    最低
                  </div>
                  <div className="text-base font-semibold text-red-600">
                    {ohlcvData.low}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1 font-medium">
                    成交量
                  </div>
                  <div className="text-base font-semibold text-blue-600">
                    {ohlcvData.volume}
                  </div>
                </div>
              </div>
            </div>

            {/* 優化的圖表 */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-6 border border-gray-100">
              <div className="h-96">
                <Chart type="line" data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* 優化的技術指標 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <ChartBarIcon className="h-6 w-6 text-blue-600 mr-3" />
                技術指標分析
                <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  即時更新
                </span>
              </h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                  上次更新:{" "}
                  {currentTime.toLocaleTimeString("zh-TW", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>

            {/* 主要技術指標 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {stableIndicatorData.map((indicator, index) => {
                // 計算信號強度（模擬）
                const isPositive = indicator.statusColor === "text-green-600";
                const isNeutral =
                  indicator.statusColor === "text-yellow-600" ||
                  indicator.statusColor === "text-gray-600";

                return (
                  <div
                    key={index}
                    className="group p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-200 transition-all duration-200 bg-gradient-to-br from-white to-gray-50/50 min-h-[180px] flex flex-col justify-between"
                  >
                    {/* 標題與狀態 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm truncate">
                          {indicator.name}
                        </span>
                        <div className="ml-2 flex-shrink-0">
                          {isPositive ? (
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                          ) : isNeutral ? (
                            <MinusIcon className="h-4 w-4 text-amber-500" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${
                          indicator.statusColor === "text-green-600"
                            ? "bg-emerald-100 text-emerald-700"
                            : indicator.statusColor === "text-red-600"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {indicator.status}
                      </span>
                    </div>

                    {/* 數值 */}
                    <div className="text-xl font-bold text-gray-900 mb-2">
                      {indicator.value}
                    </div>

                    {/* 信號強度條 */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500 font-medium">
                          信號強度
                        </span>
                        <span className="text-xs font-bold text-gray-700">
                          {indicator.signalStrength}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                            indicator.statusColor === "text-green-600"
                              ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                              : indicator.statusColor === "text-red-600"
                              ? "bg-gradient-to-r from-red-400 to-red-600"
                              : "bg-gradient-to-r from-amber-400 to-amber-600"
                          }`}
                          style={{ width: `${indicator.signalStrength}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 額外資訊 */}
                    <div className="text-xs text-gray-500 space-y-1 mt-auto">
                      {index === 0 && (
                        <>
                          <div>標準值: 30-70</div>
                          <div>超買線: 70+ | 超賣線: 30-</div>
                        </>
                      )}
                      {index === 1 && (
                        <>
                          <div>DIF: +8.2 | DEA: +3.7</div>
                          <div>柱狀圖: +4.5</div>
                        </>
                      )}
                      {index === 2 && (
                        <>
                          <div>K值: 65.2 | D值: 45.8</div>
                          <div>J值: 84.6</div>
                        </>
                      )}
                      {index === 3 && (
                        <>
                          <div>5日線: 7,045 | 10日線: 7,038</div>
                          <div>60日線: 6,985</div>
                        </>
                      )}
                      {index === 4 && (
                        <>
                          <div>中軌: 7,050 | 下軌: 6,950</div>
                          <div>寬度: 200點 (2.8%)</div>
                        </>
                      )}
                      {index === 5 && (
                        <>
                          <div>20日均量: 162M</div>
                          <div>量比: 1.15</div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 進階技術指標 */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
                進階技術指標
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 威廉指標 */}
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 min-h-[120px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        威廉指標 (WR)
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        超賣區
                      </span>
                    </div>
                    <div className="text-lg font-bold text-purple-600 mb-1">
                      -25.6
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>建議: 可考慮逢低買進</div>
                    <div>風險: 中等</div>
                  </div>
                </div>

                {/* CCI指標 */}
                <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-100 min-h-[120px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        CCI 指標
                      </span>
                      <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full">
                        中性
                      </span>
                    </div>
                    <div className="text-lg font-bold text-cyan-600 mb-1">
                      +86.2
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>範圍: -100 ~ +100</div>
                    <div>趨勢: 溫和上漲</div>
                  </div>
                </div>

                {/* 乖離率 */}
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 min-h-[120px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        乖離率 (BIAS)
                      </span>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        正乖離
                      </span>
                    </div>
                    <div className="text-lg font-bold text-emerald-600 mb-1">
                      +2.1%
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>5日線乖離: +1.8%</div>
                    <div>20日線乖離: +2.1%</div>
                  </div>
                </div>

                {/* 動量指標 */}
                <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 min-h-[120px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        動量指標 (MTM)
                      </span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                        強勢
                      </span>
                    </div>
                    <div className="text-lg font-bold text-orange-600 mb-1">
                      +125.4
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>12日動量: +125.4</div>
                    <div>趨勢: 持續向上</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 技術分析建議 */}
            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
              <h5 className="font-bold text-gray-900 mb-3 flex items-center">
                <LightBulbIcon className="h-4 w-4 text-indigo-600 mr-2" />
                技術分析建議
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-green-700 mb-2">
                    ✅ 買進信號
                  </div>
                  <ul className="text-gray-700 space-y-1 text-xs">
                    <li>• MACD 出現黃金交叉</li>
                    <li>• KD 指標呈現買進信號</li>
                    <li>• 突破 20 日均線阻力</li>
                    <li>• 成交量明顯放大</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-amber-700 mb-2">
                    ⚠️ 風險提醒
                  </div>
                  <ul className="text-gray-700 space-y-1 text-xs">
                    <li>• RSI 接近超買區域</li>
                    <li>• 需注意回檔風險</li>
                    <li>• 建議分批進場</li>
                    <li>• 設定停損點位</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 優化的右側資訊 */}
        <div className="space-y-6">
          {/* AI 預測結果 */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg border border-emerald-100 p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <SparklesIcon className="h-5 w-5 text-emerald-600 mr-2" />
              AI 預測結果
            </h3>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                +2.3%
              </div>
              <div className="text-sm text-gray-600 font-medium">
                預期漲幅 (7天)
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">AI 信心度</span>
                <span className="font-bold text-blue-600 text-lg">87%</span>
              </div>

              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-2000 ease-out"
                    style={{ width: "87%" }}
                  ></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse"></div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-emerald-200">
                <div className="text-center p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                  <div className="text-xs text-gray-600 mb-1">目標價位</div>
                  <div className="font-bold text-gray-900">18,542</div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                  <div className="text-xs text-gray-600 mb-1">風險等級</div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    中等
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 市場情緒 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📊 市場情緒
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">整體趨勢</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium flex items-center">
                  <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                  看漲
                </span>
              </div>

              <div className="space-y-3">
                {stableMarketSentiment.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-600 font-medium">
                      {item.label}
                    </span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            item.label === "技術面"
                              ? "bg-emerald-500"
                              : item.label === "基本面"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium w-8">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 智能建議 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
              <LightBulbIcon className="h-5 w-5 text-blue-600 mr-2" />
              💡 AI 智能建議
            </h3>
            <div className="text-sm text-blue-800 space-y-3">
              {[
                "建議分批買進，控制風險",
                "設定止損點在 17,500",
                "關注國際市場動向",
                "建議持有期間 2-4 週",
              ].map((suggestion, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="font-medium">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAIPredictionDashboard;
