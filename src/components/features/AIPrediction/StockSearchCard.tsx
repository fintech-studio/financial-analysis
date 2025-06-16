// src/components/features/AIPrediction/StockSearchCard.tsx
import React from "react";
import { Line } from "react-chartjs-2";
import { SparklesIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
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
    <div className="p-6">
      {/* 搜尋框 */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋股票代號或名稱 (例: TSMC, 台積電)"
            className="block w-full pl-12 pr-20 py-3 border border-gray-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 placeholder-gray-500 bg-white transition-all duration-200"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-r-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg">
              分析
            </button>
          </div>
        </div>
      </div>

      {/* 股票資訊卡片 */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 mb-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {selectedStock}
            </h2>
            <div className="text-3xl font-bold text-gray-900">
              NT$ {stockData.price}
            </div>
          </div>
          <div className="text-right">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-xl text-sm font-medium shadow-lg">
              +32.80 (+0.47%)
            </div>
            <div className="text-xs text-gray-500 mt-1">今日變化</div>
          </div>
        </div>

        {/* 時間範圍選擇 */}
        <TimeRangeButtons
          currentRange={timeRange}
          onRangeChange={onTimeRangeChange}
        />
      </div>

      {/* 圖表區域 */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">價格走勢</h3>
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-lg text-xs font-medium flex items-center">
            <SparklesIcon className="h-3 w-3 mr-1" />
            AI預測區間
          </div>
        </div>

        <div className="h-64 relative">
          {isDataReady && <Line data={chartData} options={chartOptions} />}
        </div>
      </div>

      {/* AI 預測說明 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 mb-6">
        <div className="flex items-center mb-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mr-3">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <h4 className="font-semibold text-blue-900">AI預測分析</h4>
        </div>
        <p className="text-sm text-blue-800 leading-relaxed">
          根據{timeRange}歷史數據分析，AI模型預測未來{trendDirection}趨勢，
          預期價格變動幅度約為
          <span className="font-semibold">{trendPercent}%</span>。
          建議投資者密切關注市場動態並適時調整投資策略。
        </p>
      </div>

      {/* 股票詳細信息 */}
      <div className="grid grid-cols-3 gap-4">
        {/*
          { label: "開盤價", value: stockData.open, color: "text-gray-900" },
          { label: "最高價", value: stockData.high, color: "text-green-600" },
          { label: "最低價", value: stockData.low, color: "text-red-600" },
          { label: "成交量", value: stockData.lot, color: "text-blue-600" },
          { label: "市值", value: stockData.value, color: "text-purple-600" },
          { label: "週轉率", value: stockData.freq, color: "text-indigo-600" },
        */}
        {Object.entries(stockData).map(([key, value], index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
          >
            <div className="text-xs text-gray-500 mb-1">{key}</div>
            <div className="font-semibold text-gray-900">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockSearchCard;
