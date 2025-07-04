import React, { useState } from "react";
import {
  SparklesIcon,
  ArrowPathIcon,
  CpuChipIcon,
  ClockIcon,
  ServerIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon as SparklesIconSolid } from "@heroicons/react/24/solid";
import Footer from "@/components/Layout/Footer";
import EnhancedAIPredictionDashboard from "@/components/pages/AIPrediction/EnhancedAIPredictionDashboard";
import SmartStockRecommendations from "@/components/pages/AIPrediction/SmartStockRecommendations";
import TechnicalAnalysisAI from "@/components/pages/AIPrediction/TechnicalAnalysisAI";

const AIPredictionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [lastUpdateTime] = useState<Date>(new Date());

  const tabs = [
    {
      id: "dashboard",
      name: "AI智能預測",
      icon: SparklesIcon,
      description: "運用深度學習模型進行市場趨勢預測",
    },
    {
      id: "recommendations",
      name: "AI智能選股",
      icon: CpuChipIcon,
      description: "基於多因子模型的智能股票推薦",
    },
    {
      id: "technical-analysis",
      name: "技術分析AI",
      icon: SparklesIcon,
      description: "AI驅動的技術指標分析與信號識別",
    },
  ];

  const handleRefreshData = () => {
    // 刷新數據邏輯
    console.log("刷新AI預測數據");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 統一的頁面標題區域 */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-xl relative overflow-hidden">
        {/* 裝飾性背景元素 */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-10 right-20 w-32 h-32 bg-white opacity-5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-white/10 to-transparent rounded-full"></div>
          <div className="absolute top-20 right-40 w-16 h-16 bg-white opacity-5 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-8 lg:mb-0">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm mr-4">
                  <SparklesIconSolid className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white tracking-tight">
                    AI 投資智能分析
                  </h1>
                  <p className="text-blue-100 mt-2">
                    運用前沿人工智慧技術，提供精準的投資分析與預測
                  </p>
                </div>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                整合深度學習、機器學習與量化分析，為您的投資決策提供智能支援
              </p>
            </div>

            {/* 右側操作區域 */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefreshData}
                className="p-2 bg-indigo-800/50 backdrop-blur-sm rounded-xl border border-indigo-400/30 text-blue-200 hover:text-white transition-colors"
                title="刷新AI預測數據"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>

              <div className="bg-indigo-800/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-indigo-400/30 flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-xs text-blue-200">AI模型狀態</div>
                  <div className="text-sm font-medium text-white">運行中</div>
                </div>
              </div>

              <div className="bg-indigo-800/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-indigo-400/30 flex items-center space-x-3">
                <ArrowPathIcon className="h-4 w-4 text-blue-200" />
                <div>
                  <div className="text-xs text-blue-200">最後更新</div>
                  <div className="text-sm font-medium text-white">
                    {lastUpdateTime.toLocaleTimeString("zh-TW")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 導航標籤 */}
          <div className="mt-8">
            <nav className="flex space-x-6 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-white text-indigo-700 shadow-lg"
                        : "text-white hover:bg-white/10 hover:text-white"
                    }`}
                    title={tab.description}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* AI智能預測 */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              <EnhancedAIPredictionDashboard />
            </div>
          )}

          {/* AI智能選股 */}
          {activeTab === "recommendations" && (
            <div className="animate-fadeIn">
              <SmartStockRecommendations />
            </div>
          )}

          {/* 技術分析AI */}
          {activeTab === "technical-analysis" && (
            <div className="animate-fadeIn">
              <TechnicalAnalysisAI />
            </div>
          )}
        </div>
      </div>

      {/* 諮詢資訊區塊 */}
      <div className="bg-gray-50 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* 系統資訊 */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <ServerIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    系統資訊
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">最後更新：</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {new Date().toLocaleDateString("zh-TW")} 下午2:24:17
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CpuChipIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">AI 模型：</span>
                    <span className="ml-1 font-medium text-gray-900">
                      GPT-4 Enhanced v2.1.0
                    </span>
                  </div>
                </div>
              </div>

              {/* 數據來源 */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <SparklesIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    數據來源
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">即時市場數據</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">技術分析指標</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">基本面數據</span>
                  </div>
                </div>
              </div>

              {/* 免責聲明 */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    免責聲明
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  本系統提供的分析僅供參考，投資決策請自行評估風險。
                  <span className="block mt-2 text-xs text-gray-500">
                    AI預測結果基於歷史數據分析，不保證未來表現。
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* 動畫樣式 */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default AIPredictionPage;
