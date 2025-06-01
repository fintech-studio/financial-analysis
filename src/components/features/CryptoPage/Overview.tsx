import React, { useState, useEffect } from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { Line, Doughnut } from "react-chartjs-2";
import {
  getStatusColor,
  getStatusBadgeColor,
  getTrendIcon,
} from "@/utils/statusHelpers";
import {
  rsiChartOptions,
  marketCapChartOptions,
  generateRsiChartData,
  generateMarketCapChartData,
} from "@/utils/chartConfigs";
import CombinedPriceVolumeChart from "@/components/Charts/CombinedPriceVolumeChart";
import IntradayPriceVolumeChart from "@/components/Charts/IntradayPriceVolumeChart";

// TypeScript 型別定義
interface MarketOverview {
  market: {
    overall: string;
    change: string;
    price: string;
    description: string;
  };
  indicators: Array<{
    name: string;
    value: string;
    change: string;
    trend: string;
  }>;
  technical: Array<{
    name: string;
    signal: string;
  }>;
}

interface HistoryData {
  intraday: {
    labels: string[];
    btcPrice: number[];
    volume: number[];
    priceChange: number[];
  };
  labels: string[];
  btcPrice: number[];
  ethPrice: number[];
  volume: number[];
  rsi: number[];
  // 其他歷史數據屬性...
}

interface CoinData {
  name: string;
  dominance: string;
  // 幣種數據屬性...
}

interface CryptoMarketData {
  overview: MarketOverview;
  history: HistoryData;
  coins: CoinData[];
}

interface OverviewProps {
  marketData: CryptoMarketData;
}

type TimeframeType = "1d" | "1w" | "1m" | "ytd";

const Overview: React.FC<OverviewProps> = ({ marketData }) => {
  // 將 timeframe 狀態改為多選項："1d", "1w", "1m", "ytd"
  const [timeframe, setTimeframe] = useState<TimeframeType>("1d");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // 生成圖表數據
  const rsiChartData = generateRsiChartData(marketData.history);
  const marketCapChartData = generateMarketCapChartData(marketData.coins);

  // 客戶端渲染時才設置時間
  useEffect(() => {
    setIsMounted(true);
    setCurrentTime(new Date().toLocaleString("zh-TW", { hour12: false }));
  }, []);

  // 時間範圍顯示文字映射
  const timeframeLabels: Record<TimeframeType, string> = {
    "1d": "過去24小時",
    "1w": "過去一週",
    "1m": "過去一個月",
    ytd: "年初至今",
  };

  const handleTimeframeChange = (newTimeframe: TimeframeType): void => {
    setTimeframe(newTimeframe);
  };

  return (
    <div className="space-y-8">
      {/* 市場概況摘要 */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">市場概況</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div
                    className={`p-2 ${getStatusBadgeColor(
                      marketData.overview.market.overall
                    )} rounded-lg mr-3`}
                  >
                    <ChartBarIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">市場狀態</div>
                    <div className="text-xl font-bold text-gray-900 flex items-center">
                      {marketData.overview.market.overall}
                      <span
                        className={`ml-2 text-base font-medium ${getStatusColor(
                          marketData.overview.market.change.startsWith("+")
                            ? "up"
                            : "down"
                        )}`}
                      >
                        {marketData.overview.market.change}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">BTC 當前價格</div>
                  <div className="text-xl font-bold text-gray-900">
                    ${marketData.overview.market.price}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-300">
                {marketData.overview.market.description}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {marketData.overview.indicators.map((indicator) => (
                <div key={indicator.name} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-700">
                      {indicator.name}
                    </div>
                    {getTrendIcon(indicator.trend)}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {indicator.value}
                  </div>
                  <div className={`text-xs ${getStatusColor(indicator.trend)}`}>
                    {indicator.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 時間範圍選擇器 */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* 標題與時間範圍選擇器 */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-wrap justify-between items-center">
            <div className="mb-3 md:mb-0">
              <h2 className="text-xl font-semibold text-gray-900">
                價格與成交量分析
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                透過不同時間範圍分析市場趨勢
              </p>
            </div>

            <div className="relative">
              <div className="inline-flex p-1 bg-slate-100 rounded-lg shadow-inner">
                <button
                  onClick={() => handleTimeframeChange("1d")}
                  className={`px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-all ${
                    timeframe === "1d"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-700 hover:bg-slate-200"
                  }`}
                >
                  1天
                </button>
                <button
                  onClick={() => handleTimeframeChange("1w")}
                  className={`px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-all ${
                    timeframe === "1w"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-700 hover:bg-slate-200"
                  }`}
                >
                  1週
                </button>
                <button
                  onClick={() => handleTimeframeChange("1m")}
                  className={`px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-all ${
                    timeframe === "1m"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-700 hover:bg-slate-200"
                  }`}
                >
                  1月
                </button>
                <button
                  onClick={() => handleTimeframeChange("ytd")}
                  className={`px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-all ${
                    timeframe === "ytd"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-700 hover:bg-slate-200"
                  }`}
                >
                  YTD
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 時間範圍指示器與額外資訊 */}
        <div className="bg-slate-50 px-5 py-3 border-b border-gray-100 flex flex-wrap justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">
              當前查看:
            </span>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
              {timeframeLabels[timeframe]}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            最後更新: {isMounted ? currentTime : "載入中..."}
          </div>
        </div>

        {/* 圖表內容 */}
        <div>
          {/* 根據選擇的時間範圍顯示不同圖表 */}
          {timeframe === "1d" ? (
            <IntradayPriceVolumeChart
              intradayData={{
                labels: marketData.history.labels,
                btcPrice: marketData.history.btcPrice,
                volume: marketData.history.volume,
              }}
            />
          ) : (
            <CombinedPriceVolumeChart
              historyData={marketData.history}
              coin="BTC"
              timeRange={timeframeLabels[timeframe]}
              timeframe={timeframe}
            />
          )}
        </div>
      </div>

      {/* 技術指標圖表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">技術指標</h3>
            <div className="flex">
              {marketData.overview.technical.map((indicator, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 ${getStatusBadgeColor(
                    indicator.signal
                  )} rounded-full ml-2`}
                >
                  {indicator.name}: {indicator.signal}
                </span>
              ))}
            </div>
          </div>
          <div className="h-80">
            <Line options={rsiChartOptions} data={rsiChartData} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">市值分布</h3>
            <span className="text-sm px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
              主要幣種
            </span>
          </div>
          <div className="h-80 flex items-center justify-center">
            <div className="w-2/3 h-full">
              <Doughnut
                options={marketCapChartOptions}
                data={marketCapChartData}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
