import React from "react";
import StockChart from "@/components/Charts/StockChart";

interface TrendChartProps {
  data: {
    dates: string[];
    prices: number[];
    volumes: number[];
  };
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  changePercent: string;
  change: string;
}

const TrendChart = ({
  data,
  timeRange,
  onTimeRangeChange,
  changePercent,
  change,
}: TrendChartProps) => {
  const timeRanges = ["1d", "1w", "1m", "3m", "6m"];

  return (
    <section className="py-12 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              市場走勢
            </h2>
            <p className="mt-2 text-gray-600">掌握市場趨勢與技術分析</p>
          </div>
          <div className="flex space-x-2">
            {timeRanges.map((range) => (
              <button
                key={range}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    range === timeRange
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                onClick={() => onTimeRangeChange(range)}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">
                大盤指數走勢
              </h3>
              <span
                className={`text-sm font-medium px-2 py-1 rounded-full ${
                  change.includes("+")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {changePercent} 今日
              </span>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                技術指標
              </button>
              <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                對比指數
              </button>
            </div>
          </div>
          <StockChart data={data} />
        </div>
      </div>
    </section>
  );
};

export default TrendChart;
