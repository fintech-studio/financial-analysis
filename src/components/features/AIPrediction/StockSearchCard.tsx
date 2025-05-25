// src/components/features/AIPrediction/StockSearchCard.tsx
import React from "react";
import { Line } from "react-chartjs-2";
import { SparklesIcon } from "@heroicons/react/24/solid";
import TimeRangeButtons from "./TimeRangeButtons";
import type { StockData, TimeRange, ChartData } from "@/types/prediction";

interface StockSearchCardProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStock: string;
  stockData: StockData;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  chartData: ChartData;
  chartOptions: any;
  trendDirection: string;
  trendPercent: string;
  isDataReady: boolean;
}

const StockSearchCard: React.FC<StockSearchCardProps> = ({
  searchQuery,
  setSearchQuery,
  selectedStock,
  stockData,
  timeRange,
  onTimeRangeChange,
  chartData,
  chartOptions,
  trendDirection,
  trendPercent,
  isDataReady,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm  border-gray-200 overflow-hidden">
      {/* 搜尋框 */}
      <div className="p-5 pb-0">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋加密貨幣、股票等等..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-3 pr-10 py-2"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button className="bg-green-600 text-white px-4 py-2 rounded-r-md h-full hover:bg-green-700 transition-colors">
              分析
            </button>
          </div>
        </div>
      </div>

      {/* 股票數據 */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{selectedStock}</h2>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              {stockData.price}
            </div>
          </div>
          <div className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-sm font-medium">
            +32.80 (+0.47%)
          </div>
        </div>

        {/* 時間範圍選擇 */}
        <TimeRangeButtons
          currentRange={timeRange}
          onRangeChange={onTimeRangeChange}
        />

        {/* 圖表區域 */}
        <div className="h-64 relative">
          <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium flex items-center z-10">
            <SparklesIcon className="h-3 w-3 mr-1" />
            AI預測區間
          </div>
          {isDataReady && <Line data={chartData} options={chartOptions} />}
        </div>

        {/* AI 預測說明 */}
        <div className="mt-4 bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <SparklesIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h4 className="font-medium text-blue-800">AI預測分析</h4>
          </div>
          <p className="text-sm text-blue-700">
            根據{timeRange}歷史數據分析，AI模型預測未來{trendDirection}趨勢，
            預期價格變動幅度約為{trendPercent}%。
          </p>
        </div>

        {/* 股票詳細信息 */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-gray-500">開盤價</div>
            <div className="font-medium text-gray-900">{stockData.open}</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-gray-500">最高價</div>
            <div className="font-medium text-pink-600">{stockData.high}</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-gray-500">最低價</div>
            <div className="font-medium text-gray-900">{stockData.low}</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-gray-500">Lot</div>
            <div className="font-medium text-gray-900">{stockData.lot}</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-gray-500">Value</div>
            <div className="font-medium text-gray-900">{stockData.value}</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-gray-500">Freq</div>
            <div className="font-medium text-gray-900">{stockData.freq}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockSearchCard;
