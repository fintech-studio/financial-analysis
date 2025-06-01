import React from "react";
import { Bar } from "react-chartjs-2";
import { getStatusBadgeColor } from "@/utils/statusHelpers";
import {
  factorChartOptions,
  generateFactorChartData,
} from "@/utils/chartConfigs";

// TypeScript 型別定義
interface Factor {
  name: string;
  impact: string;
  strength: number;
  description: string;
  details: string[];
}

interface MarketData {
  factors: Factor[];
}

interface FactorsAnalysisProps {
  marketData: MarketData;
}

interface FactorCardProps {
  factor: Factor;
}

const FactorsAnalysis: React.FC<FactorsAnalysisProps> = ({ marketData }) => {
  const factorChartData = generateFactorChartData(marketData.factors);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">市場影響因素</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border-l-4 border-yellow-300 mb-6">
            以下因素可能對加密貨幣市場產生重大影響，投資者應密切關注這些因素的變化。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marketData.factors.map((factor) => (
              <FactorCard key={factor.name} factor={factor} />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            影響因素強度比較
          </h3>
          <span className="text-sm px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
            數據更新: 今日
          </span>
        </div>
        <div className="h-80">
          <Bar options={factorChartOptions} data={factorChartData} />
        </div>
      </div>
    </div>
  );
};

// 影響因素卡片子元件
const FactorCard: React.FC<FactorCardProps> = ({ factor }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div
        className={`h-2 ${
          factor.impact === "正面"
            ? "bg-green-500"
            : factor.impact === "負面"
            ? "bg-red-500"
            : "bg-blue-500"
        }`}
      ></div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{factor.name}</h3>
          <span
            className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(
              factor.impact
            )}`}
          >
            {factor.impact}
          </span>
        </div>
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-500">影響強度</span>
            <span className="text-sm font-medium">{factor.strength}/100</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                factor.impact === "正面"
                  ? "bg-green-500"
                  : factor.impact === "負面"
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${factor.strength}%` }}
            ></div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">{factor.description}</p>
        <ul className="space-y-1">
          {factor.details.map((detail, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full mt-1.5 mr-2"></span>
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FactorsAnalysis;
