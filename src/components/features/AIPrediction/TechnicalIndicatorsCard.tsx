// src/components/features/AIPrediction/TechnicalIndicatorsCard.tsx
import React from "react";
import type { TechnicalIndicator } from "@/types/prediction";

interface TechnicalIndicatorsCardProps {
  indicators: TechnicalIndicator[];
}

const TechnicalIndicatorsCard: React.FC<TechnicalIndicatorsCardProps> = ({
  indicators,
}) => {
  // 模擬完整的技術指標數據
  const enhancedIndicators = [
    {
      name: "RSI (14)",
      value: "68.5",
      status: "接近超買",
      statusColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      description: "相對強弱指標",
      progressColor: "bg-orange-500",
      progressValue: 68.5,
    },
    {
      name: "MACD",
      value: "+12.5",
      status: "看漲信號",
      statusColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "指數平滑移動平均",
      progressColor: "bg-green-500",
      progressValue: 75,
    },
    {
      name: "KD指標",
      value: "K:65 D:45",
      status: "黃金交叉",
      statusColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      description: "隨機震盪指標",
      progressColor: "bg-yellow-500",
      progressValue: 55,
    },
    {
      name: "移動平均線 (20日)",
      value: "7,032.50",
      status: "站上均線",
      statusColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "價格趨勢指標",
      progressColor: "bg-blue-500",
      progressValue: 82,
    },
    {
      name: "布林通道",
      value: "上軌: 7,150",
      status: "接近上軌",
      statusColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "波動率趨勢通道",
      progressColor: "bg-purple-500",
      progressValue: 88,
    },
    {
      name: "成交量",
      value: "+15%",
      status: "高於平均",
      statusColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      description: "相對成交量變化",
      progressColor: "bg-indigo-500",
      progressValue: 75,
    },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {enhancedIndicators.map((indicator, idx) => (
          <div
            key={idx}
            className={`${indicator.bgColor} rounded-2xl p-6 border ${indicator.borderColor} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="text-gray-800 text-base font-semibold mb-1">
                  {indicator.name}
                </div>
                <div className="text-xs text-gray-600">
                  {indicator.description}
                </div>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${indicator.statusColor
                  .replace("text-", "bg-")
                  .replace("-600", "-100")} ${indicator.statusColor}`}
              >
                {indicator.status}
              </span>
            </div>

            <div className="mb-4">
              <div
                className={`text-2xl font-bold ${indicator.statusColor} mb-2`}
              >
                {indicator.value}
              </div>
            </div>

            {/* 統一的進度條設計 */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${indicator.progressColor} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${indicator.progressValue}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span className="font-medium">{indicator.progressValue}%</span>
                <span>100</span>
              </div>
            </div>

            {/* 詳細數據展示 */}
            {indicator.name.includes("RSI") && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>超賣線 (30)</span>
                    <span className="text-red-500">●</span>
                  </div>
                  <div className="flex justify-between">
                    <span>超買線 (70)</span>
                    <span className="text-orange-500">●</span>
                  </div>
                </div>
              </div>
            )}

            {indicator.name.includes("MACD") && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="text-gray-500">DIF:</span>
                    <span className="font-medium ml-1">+8.2</span>
                  </div>
                  <div>
                    <span className="text-gray-500">DEM:</span>
                    <span className="font-medium ml-1">+4.3</span>
                  </div>
                </div>
              </div>
            )}

            {indicator.name.includes("KD") && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center bg-white/50 rounded-lg py-1">
                    <div className="text-gray-500">K值</div>
                    <div className="font-semibold text-yellow-700">65</div>
                  </div>
                  <div className="text-center bg-white/50 rounded-lg py-1">
                    <div className="text-gray-500">D值</div>
                    <div className="font-semibold text-yellow-700">45</div>
                  </div>
                </div>
              </div>
            )}

            {indicator.name.includes("移動平均線") && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>5日線</span>
                    <span className="font-medium">7,045</span>
                  </div>
                  <div className="flex justify-between">
                    <span>10日線</span>
                    <span className="font-medium">7,038</span>
                  </div>
                </div>
              </div>
            )}

            {indicator.name.includes("布林通道") && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>中軌 (MA20)</span>
                    <span className="font-medium">7,050</span>
                  </div>
                  <div className="flex justify-between">
                    <span>下軌</span>
                    <span className="font-medium">6,950</span>
                  </div>
                </div>
              </div>
            )}

            {indicator.name.includes("成交量") && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                  今日 vs 平均成交量
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 總體技術分析摘要 */}
      <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 rounded-3xl p-8 border border-gray-200 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex-shrink-0">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-6a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-4">
              AI 技術分析總結
            </h4>
            <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>
                  <span className="font-semibold text-green-700">
                    多頭信號：
                  </span>
                  MACD呈現黃金交叉，成交量放大支撐，顯示買盤積極介入
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>
                  <span className="font-semibold text-orange-700">
                    注意事項：
                  </span>
                  RSI接近超買區域，短期可能面臨技術性調整壓力
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>
                  <span className="font-semibold text-blue-700">
                    支撐壓力：
                  </span>
                  主要支撐位7,000點，上方壓力位7,150點，建議關注突破情況
                </p>
              </div>
            </div>

            {/* 綜合評分 */}
            <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  綜合技術評分
                </span>
                <span className="text-lg font-bold text-blue-600">7.2/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: "72%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalIndicatorsCard;
