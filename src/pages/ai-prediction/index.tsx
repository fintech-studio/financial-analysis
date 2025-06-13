// src/pages/ai-prediction/index.tsx
import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  CpuChipIcon,
  ChartPieIcon,
  ShieldCheckIcon,
  ClockIcon,
  BeakerIcon,
  ArrowPathIcon,
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

// MVC 架構引入
import { AIPredictionController } from "../../controllers/AIPredictionController";
import { UserController } from "../../controllers/UserController";
import {
  ModelSettings,
  PortfolioItem,
  TechnicalIndicator as ModelTechnicalIndicator,
  AIPrediction,
  StockAnalysis,
} from "../../models/AIPredictionModel";
import { User } from "../../models/UserModel";
import {
  TimeRange as ComponentTimeRange,
  ActiveTab as ComponentActiveTab,
  TechnicalIndicator as ComponentTechnicalIndicator,
  StockData as ComponentStockData,
} from "../../types/prediction";

type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y";
type ActiveTab = "settings" | "portfolio" | "analysis";

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
  const [selectedStock, setSelectedStock] = useState<string>("TSMC");
  const [timeRange, setTimeRange] = useState<TimeRange>("1W");
  const [activeTab, setActiveTab] = useState<ActiveTab>("settings");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  // MVC 架構相關狀態
  const [user, setUser] = useState<User | null>(null);
  const [stockAnalysis, setStockAnalysis] = useState<StockAnalysis | null>(
    null
  );
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [technicalIndicators, setTechnicalIndicators] = useState<
    ModelTechnicalIndicator[]
  >([]);
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    autoTrading: true,
    linebotNotification: true,
  });
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [marketSentiment, setMarketSentiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 控制器實例
  const predictionController = AIPredictionController.getInstance();
  const userController = new UserController();

  const { chartData, chartOptions, trendDirection, trendPercent, isDataReady } =
    useChartData(selectedStock, timeRange as ComponentTimeRange);

  // 載入初始數據
  useEffect(() => {
    loadInitialData();
  }, []);

  // 當選擇的股票改變時重新分析
  useEffect(() => {
    if (selectedStock) {
      analyzeStock(selectedStock);
    }
  }, [selectedStock, timeRange]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = "user_001"; // 模擬用戶 ID

      // 並行載入基礎數據
      const [userResult, settingsResult, portfolioResult, sentimentResult] =
        await Promise.allSettled([
          userController.getUserProfile(userId),
          predictionController.getModelSettings(),
          predictionController.getPortfolioItems(userId),
          predictionController.getMarketSentiment(),
        ]);

      // 處理用戶數據
      if (userResult.status === "fulfilled") {
        setUser(userResult.value);
      } else {
        console.error("載入用戶資料失敗:", userResult.reason);
      }

      // 處理模型設定
      if (settingsResult.status === "fulfilled") {
        setModelSettings(settingsResult.value);
      } else {
        console.error("載入模型設定失敗:", settingsResult.reason);
      }

      // 處理投資組合
      if (portfolioResult.status === "fulfilled") {
        setPortfolioItems(portfolioResult.value);
      } else {
        console.error("載入投資組合失敗:", portfolioResult.reason);
      }

      // 處理市場情緒
      if (sentimentResult.status === "fulfilled") {
        setMarketSentiment(sentimentResult.value);
      } else {
        console.error("載入市場情緒失敗:", sentimentResult.reason);
      }

      // 載入預設股票分析
      await analyzeStock(selectedStock);
    } catch (error) {
      setError(error instanceof Error ? error.message : "載入數據失敗");
    } finally {
      setLoading(false);
    }
  };

  const analyzeStock = async (symbol: string) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      // 並行獲取股票分析和預測
      const [analysisResult, predictionResult, indicatorsResult] =
        await Promise.allSettled([
          predictionController.getStockAnalysis(symbol),
          predictionController.generatePrediction({
            symbol,
            timeRange,
            includeIndicators: true,
          }),
          predictionController.getTechnicalIndicators(symbol),
        ]);

      // 處理分析結果
      if (analysisResult.status === "fulfilled") {
        setStockAnalysis(analysisResult.value);
      } else {
        console.error("獲取股票分析失敗:", analysisResult.reason);
      }

      // 處理預測結果
      if (predictionResult.status === "fulfilled") {
        setPrediction(predictionResult.value.prediction);
        if (predictionResult.value.indicators) {
          setTechnicalIndicators(predictionResult.value.indicators);
        }
      } else {
        console.error("生成預測失敗:", predictionResult.reason);
      }

      // 處理技術指標
      if (indicatorsResult.status === "fulfilled") {
        setTechnicalIndicators(indicatorsResult.value);
      } else {
        console.error("獲取技術指標失敗:", indicatorsResult.reason);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "分析失敗");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTimeRangeChange = (newRange: TimeRange): void => {
    setTimeRange(newRange);
    analyzeStock(selectedStock);
  };

  const handleSettingChange = async (
    setting: keyof ModelSettings
  ): Promise<void> => {
    try {
      const newSettings = {
        ...modelSettings,
        [setting]: !modelSettings[setting],
      };

      const updatedSettings = await predictionController.updateModelSettings(
        newSettings
      );
      setModelSettings(updatedSettings);
    } catch (error) {
      console.error("更新設定失敗:", error);
      setError(error instanceof Error ? error.message : "更新設定失敗");
    }
  };

  const handleStockSearch = async (query: string): Promise<void> => {
    try {
      const results = await predictionController.searchStocks({
        query,
        limit: 10,
      });
      console.log("搜尋結果:", results);
      // 可以在這裡處理搜尋結果的顯示
    } catch (error) {
      console.error("搜尋失敗:", error);
    }
  };

  const handleAddToPortfolio = async (
    item: Omit<PortfolioItem, "date">
  ): Promise<void> => {
    try {
      if (!user) return;

      const updatedPortfolio = await predictionController.managePortfolio({
        userId: user.id,
        action: "add",
        item,
      });

      setPortfolioItems(updatedPortfolio);
    } catch (error) {
      console.error("新增到投資組合失敗:", error);
      setError(error instanceof Error ? error.message : "新增失敗");
    }
  };

  const handleRefreshData = async (): Promise<void> => {
    await loadInitialData();
  };

  const handleActiveTabChange = (tab: ComponentActiveTab): void => {
    setActiveTab(tab as ActiveTab);
  };

  // 解決 hydration 錯誤
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString("zh-TW"));
  }, []);

  // 載入狀態
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">載入 AI 分析系統中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
            <h3 className="text-lg font-medium text-red-800">載入失敗</h3>
            <p className="mt-2 text-red-600">{error}</p>
            <button
              onClick={handleRefreshData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              重新載入
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題區域 */}
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
                      <div className="flex items-center space-x-4 mb-3">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                          AI 投資智能分析
                        </h1>
                        <button
                          onClick={handleRefreshData}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                          title="刷新數據"
                        >
                          <ArrowPathIcon className="h-6 w-6" />
                        </button>
                      </div>
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
                  <div className="space-y-2">
                    {prediction?.signals?.map((signal, index) => (
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
                stockData={
                  stockAnalysis
                    ? {
                        price: stockAnalysis.currentPrice.toString(),
                        open: stockAnalysis.currentPrice.toString(),
                        high: (stockAnalysis.currentPrice * 1.02).toString(),
                        low: (stockAnalysis.currentPrice * 0.98).toString(),
                        lot: stockAnalysis.volume.toString(),
                        value: stockAnalysis.marketCap,
                        freq: "110 M",
                        chartLabels: Array.from(
                          { length: 30 },
                          (_, i) => i + 1
                        ),
                      }
                    : {
                        price: "0",
                        open: "0",
                        high: "0",
                        low: "0",
                        lot: "0",
                        value: "0",
                        freq: "0",
                        chartLabels: [],
                      }
                }
                timeRange={timeRange as ComponentTimeRange}
                onTimeRangeChange={(range) =>
                  handleTimeRangeChange(range as TimeRange)
                }
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
              <TechnicalIndicatorsCard
                indicators={technicalIndicators.map(
                  (indicator): ComponentTechnicalIndicator => ({
                    name: indicator.name,
                    value: indicator.value.toString(),
                    status:
                      indicator.status === "bullish"
                        ? "買入"
                        : indicator.status === "bearish"
                        ? "賣出"
                        : "持有",
                    statusColor:
                      indicator.status === "bullish"
                        ? "text-green-600"
                        : indicator.status === "bearish"
                        ? "text-red-600"
                        : "text-yellow-600",
                  })
                )}
              />
            </div>
          </div>

          {/* 右側控制面板 */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <PredictionSidebar
                activeTab={activeTab as ComponentActiveTab}
                setActiveTab={handleActiveTabChange}
                modelSettings={modelSettings}
                onSettingChange={handleSettingChange}
                portfolioItems={portfolioItems}
                setPortfolioItems={setPortfolioItems}
              />
            </div>
          </div>
        </div>

        {/* 系統資訊頁腳 */}
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
                {prediction && (
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                    預測信心度：{prediction.confidence}%
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">數據來源</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• 即時市場數據</div>
                <div>• 技術分析指標</div>
                <div>• 基本面數據</div>
                {marketSentiment && (
                  <div>• 市場情緒：{marketSentiment.overall}</div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">免責聲明</h4>
              <p className="text-sm text-gray-600">
                本系統提供的分析僅供參考，投資決策請自行評估風險。
              </p>
              {prediction && (
                <p className="text-sm text-blue-600 mt-2">
                  當前預測風險等級：{prediction.riskLevel}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPredictionPage;
