// src/pages/ai-prediction/index.tsx
import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  CpuChipIcon,
  ChartPieIcon,
  ShieldCheckIcon,
  ClockIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import StockSearchCard from "@/components/features/AIPrediction/StockSearchCard";
import TechnicalIndicatorsCard from "@/components/features/AIPrediction/TechnicalIndicatorsCard";
import PredictionSidebar from "@/components/features/AIPrediction/PredictionSidebar";
import { useChartData } from "@/hooks/useChartData";
import {
  STOCK_DATA,
  TECHNICAL_INDICATORS,
} from "@/data/prediction/predictionData";
import type {
  ModelSettings,
  PortfolioItem,
  TimeRange,
  ActiveTab,
} from "@/types/prediction";

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AIPredictionPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStock, setSelectedStock] = useState<string>("IHSG");
  const [timeRange, setTimeRange] = useState<TimeRange>("1W");
  const [activeTab, setActiveTab] = useState<ActiveTab>("settings");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiInsights, setAiInsights] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    autoTrading: true,
    linebotNotification: true,
  });

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    {
      symbol: "IHSG",
      stockCode: "12345",
      amount: 100.0,
      status: "已完成",
      date: "17 Sep 2023 10:34 AM",
    },
    {
      symbol: "TSLA",
      stockCode: "12345",
      amount: 250.0,
      status: "已完成",
      date: "17 Sep 2023 10:34 AM",
    },
    {
      symbol: "NVDA",
      stockCode: "12345",
      amount: 120.0,
      status: "已完成",
      date: "17 Sep 2023 10:34 AM",
    },
  ]);

  const { chartData, chartOptions, trendDirection, trendPercent, isDataReady } =
    useChartData(selectedStock, timeRange);

  const handleTimeRangeChange = (newRange: TimeRange): void => {
    setTimeRange(newRange);
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1500);
  };

  const handleSettingChange = (setting: keyof ModelSettings): void => {
    setModelSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const currentStockData = STOCK_DATA[selectedStock];

  // AI 預測數據 (模擬)
  const aiPrediction = {
    confidence: 87,
    direction: trendDirection,
    priceTarget:
      currentStockData && typeof currentStockData.price === "number"
        ? currentStockData.price * 1.08
        : 0,
    timeframe: "下週",
    riskLevel: "中等",
    expectedReturn: "+8.2%",
    signals: [
      { type: "技術面", strength: "強", color: "text-green-600", score: 85 },
      { type: "基本面", strength: "中性", color: "text-yellow-600", score: 65 },
    ],
  };

  // 解決 hydration 錯誤：在客戶端載入後才設定時間
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString("zh-TW"));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 全新的頁面標題區域 */}
        <div className="mb-10">
          <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100">
            {/* 裝飾性漸變背景 */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full transform translate-x-32 -translate-y-32" />

            <div className="relative z-10 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-8 lg:mb-0">
                  <div className="flex items-start mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl mr-6 shadow-lg">
                      <CpuChipIcon className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
                        AI 投資智能分析
                      </h1>
                      <p className="text-gray-600 text-xl max-w-2xl leading-relaxed">
                        結合深度學習與量化分析，為您的投資決策提供科學化的智能洞察
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <BeakerIcon className="h-4 w-4 mr-1" />
                          深度神經網路
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <ChartBarIcon className="h-4 w-4 mr-1" />
                          即時市場數據
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <ShieldCheckIcon className="h-4 w-4 mr-1" />
                          風險控制
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI 狀態儀表板 */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-2 border border-gray-200 shadow-2xl min-w-[300px]">
                  {/* 市場信號分析 */}
                  <div className="space-y-2">
                    {aiPrediction.signals.map((signal, index) => (
                      <div
                        key={index}
                        className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            {signal.type}
                          </span>
                          <span className={`text-sm font-bold ${signal.color}`}>
                            {signal.strength}
                          </span>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-1000 ${
                                signal.score >= 80
                                  ? "bg-gradient-to-r from-green-400 to-green-600"
                                  : signal.score >= 60
                                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                  : "bg-gradient-to-r from-red-400 to-red-600"
                              }`}
                              style={{ width: `${signal.score}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs font-semibold text-gray-600">
                              {signal.score}/100
                            </span>
                            <div className="flex items-center space-x-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isAnalyzing
                                    ? "bg-orange-400 animate-bounce"
                                    : signal.score >= 80
                                    ? "bg-green-400"
                                    : signal.score >= 60
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                                }`}
                              />
                              <span className="text-xs text-gray-500">
                                {isAnalyzing ? "更新中" : "即時"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主要內容區域 */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* 左側主面板 */}
          <div className="xl:col-span-3 space-y-8">
            {/* 股票分析面板 */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <StockSearchCard
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedStock={selectedStock}
                stockData={currentStockData}
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
                chartData={chartData}
                chartOptions={chartOptions}
                trendDirection={trendDirection}
                trendPercent={trendPercent}
                isDataReady={isDataReady}
              />
            </div>

            {/* 技術指標面板 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <ChartPieIcon className="h-6 w-6 text-purple-600 mr-3" />
                  技術指標分析
                </h2>
              </div>
              <TechnicalIndicatorsCard indicators={TECHNICAL_INDICATORS} />
            </div>
          </div>

          {/* 右側控制面板 */}
          <div className="xl:col-span-1 space-y-6">
            {/* 主控制面板 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <PredictionSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                modelSettings={modelSettings}
                onSettingChange={handleSettingChange}
                portfolioItems={portfolioItems}
                setPortfolioItems={setPortfolioItems}
              />
            </div>
          </div>
        </div>

        {/* 增強版頁腳 */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">系統資訊</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  最後更新：{currentTime || "載入中..."}
                </div>
                <div className="flex items-center">
                  <CpuChipIcon className="h-4 w-4 mr-2" />
                  AI 模型：GPT-4 Enhanced v2.1.0
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">數據來源</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• 即時市場數據</div>
                <div>• 技術分析指標</div>
                <div>• 基本面數據</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">免責聲明</h4>
              <p className="text-sm text-gray-600">
                本系統提供的分析僅供參考，投資決策請自行評估風險。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPredictionPage;
