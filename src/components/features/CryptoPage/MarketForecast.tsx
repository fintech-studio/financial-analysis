import React from "react";
import { getStatusBadgeColor } from "@/utils/statusHelpers";

// TypeScript 型別定義
interface Forecast {
  period: string;
  outlook: string;
  confidence: number;
  keyFactors: string[];
}

interface MarketData {
  forecast: Forecast[];
}

interface MarketForecastProps {
  marketData: MarketData;
}

interface ForecastTimelineItemProps {
  forecast: Forecast;
}

const MarketForecast: React.FC<MarketForecastProps> = ({ marketData }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">市場預測</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border-l-4 border-purple-300 mb-6">
            以下預測基於技術分析、基本面分析及市場情緒綜合評估。預測結果僅供參考，不構成投資建議。
          </p>

          {/* 預測時間軸 */}
          <div className="relative pb-12">
            <div className="absolute h-full w-0.5 bg-gray-200 left-6"></div>

            {marketData.forecast.map((forecast) => (
              <ForecastTimelineItem key={forecast.period} forecast={forecast} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 預測時間軸項目子元件
const ForecastTimelineItem: React.FC<ForecastTimelineItemProps> = ({
  forecast,
}) => {
  return (
    <div className="relative mb-8">
      <div className="flex items-start">
        <div
          className={`absolute mt-1 -left-2 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center ${
            forecast.outlook === "偏多"
              ? "bg-green-100"
              : forecast.outlook === "偏空"
              ? "bg-red-100"
              : "bg-yellow-100"
          }`}
        >
          <span className="text-lg font-bold text-gray-800">
            {forecast.period === "短期"
              ? "短"
              : forecast.period === "中期"
              ? "中"
              : "長"}
          </span>
        </div>

        <div className="ml-20 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {forecast.period}展望
                </h3>
                <div className="text-sm text-gray-500">
                  時間範圍:{" "}
                  {forecast.period === "短期"
                    ? "1-3個月"
                    : forecast.period === "中期"
                    ? "3-6個月"
                    : "6-12個月"}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`text-sm px-2 py-1 rounded-full ${getStatusBadgeColor(
                    forecast.outlook
                  )}`}
                >
                  {forecast.outlook}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  信心指數: {forecast.confidence}%
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    forecast.outlook === "偏多"
                      ? "bg-green-500"
                      : forecast.outlook === "偏空"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                  style={{ width: `${forecast.confidence}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                關鍵影響因素
              </h4>
              <div className="flex flex-wrap gap-2">
                {forecast.keyFactors.map((factor, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-200 text-gray-800 rounded-md text-xs"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketForecast;
