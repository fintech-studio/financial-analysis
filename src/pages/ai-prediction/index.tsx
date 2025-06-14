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
import Footer from "@/components/Layout/Footer";

import StockSearchCard from "@/components/features/AIPrediction/StockSearchCard";
import TechnicalIndicatorsCard from "@/components/features/AIPrediction/TechnicalIndicatorsCard";
import PredictionSidebar from "@/components/features/AIPrediction/PredictionSidebar";
import { useChartData } from "@/hooks/useChartData";

// 優化後的 MVC 架構引入
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

// 優化後的Hook引入
import {
  usePreloadData,
  useControllerWithRetry,
  useRealTimeData,
  useFormController,
} from "../../hooks/useMvcController";
import { useAppInitialization } from "../../utils/appInitializer";

// 類型定義
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
  const [currentTime, setCurrentTime] = useState<string>("");

  // 應用程式初始化
  const {
    isLoading: appLoading,
    isInitialized,
    error: appError,
  } = useAppInitialization({
    enableCache: true,
    enableMockData: true,
  });

  // MVC 控制器實例
  const predictionController = AIPredictionController.getInstance();
  const userController = UserController.getInstance();

  // 使用優化後的預加載 Hook
  const {
    data: pageData,
    loading: pageLoading,
    errors: pageErrors,
    progress,
    isComplete,
    reload: reloadPageData,
  } = usePreloadData(
    {
      user: () => userController.getUserProfile("user_001"),
      modelSettings: () => predictionController.getModelSettings(),
      portfolioItems: () => predictionController.getPortfolioItems("user_001"),
      marketSentiment: () => predictionController.getMarketSentiment(),
      stockAnalysis: () => predictionController.getStockAnalysis(selectedStock),
      technicalIndicators: () =>
        predictionController.getTechnicalIndicators(selectedStock),
    },
    {
      priority: [
        "user",
        "modelSettings",
        "stockAnalysis",
        "technicalIndicators",
        "portfolioItems",
        "marketSentiment",
      ],
      concurrent: false,
      onProgress: (loaded, total) => {
        console.log(`AI預測數據預加載進度: ${loaded}/${total}`);
      },
    }
  );

  // 實時 AI 預測數據
  const {
    data: realtimePrediction,
    loading: predictionLoading,
    error: predictionError,
    isActive: predictionActive,
    start: startPrediction,
    stop: stopPrediction,
  } = useRealTimeData(
    () =>
      predictionController.generatePrediction({
        symbol: selectedStock,
        timeRange,
        includeIndicators: true,
      }),
    30000, // 30秒更新一次
    {
      autoStart: true,
      onSuccess: (data) => {
        console.log("實時AI預測更新:", data);
      },
      onError: (error) => {
        console.error("實時預測更新失敗:", error);
      },
    }
  );

  // 股票搜索Hook
  const {
    values: searchValues,
    errors: searchErrors,
    setValue: setSearchValue,
    handleSubmit: handleSearchSubmit,
    submitting: searchSubmitting,
  } = useFormController(
    { query: "" },
    async (values) => {
      const results = await predictionController.searchStocks({
        query: values.query,
        limit: 10,
      });
      console.log("搜尋結果:", results);
      // 不需要返回值，將結果保存到狀態中
      setSearchQuery(values.query);
    },
    (values) => ({
      query: !values.query.trim() ? "請輸入股票代號或名稱" : null,
    })
  );

  // 使用重試機制的智能分析
  const {
    data: smartAnalysis,
    loading: analysisLoading,
    error: analysisError,
    retry: retryAnalysis,
  } = useControllerWithRetry(
    () =>
      predictionController.generatePrediction({
        symbol: selectedStock,
        timeRange,
        includeIndicators: true,
      }),
    {
      maxRetries: 3,
      retryDelay: 2000,
      retryCondition: (error) =>
        error.message.includes("網路") || error.message.includes("timeout"),
      onRetry: (attempt, error) => {
        console.log(`重試AI分析第 ${attempt} 次，錯誤:`, error.message);
      },
      cacheKey: `ai_analysis_${selectedStock}_${timeRange}`,
      cacheTTL: 120000, // 2分鐘緩存
    }
  );

  const { chartData, chartOptions, trendDirection, trendPercent, isDataReady } =
    useChartData(selectedStock, timeRange as ComponentTimeRange);

  // 從預加載數據中提取
  const {
    user,
    modelSettings,
    portfolioItems,
    marketSentiment,
    stockAnalysis,
    technicalIndicators,
  } = pageData;

  // 當股票選擇改變時，重新獲取數據
  useEffect(() => {
    if (selectedStock && isInitialized) {
      retryAnalysis();
    }
  }, [selectedStock, timeRange, isInitialized, retryAnalysis]);

  // 解決 hydration 錯誤
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString("zh-TW"));
  }, []);

  // 控制實時數據流
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPrediction();
      } else {
        startPrediction();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startPrediction, stopPrediction]);

  // 事件處理函數
  const handleTimeRangeChange = (newRange: TimeRange): void => {
    setTimeRange(newRange);
  };

  const handleSettingChange = async (
    setting: keyof ModelSettings
  ): Promise<void> => {
    try {
      if (!modelSettings) return;

      const newSettings = {
        ...modelSettings,
        [setting]: !modelSettings[setting],
      };
      const updatedSettings = await predictionController.updateModelSettings(
        newSettings
      );
      // 重新載入數據以反映設定變更
      await reloadPageData();
    } catch (error) {
      console.error("更新設定失敗:", error);
    }
  };

  const handleStockSearch = async (query: string): Promise<void> => {
    setSearchValue("query", query);
    try {
      await handleSearchSubmit();
    } catch (error) {
      console.error("搜尋失敗:", error);
    }
  };

  const handleRefreshData = async () => {
    try {
      await reloadPageData();
    } catch (error) {
      console.error("刷新數據失敗:", error);
    }
  };

  const handleAddToPortfolio = async (
    item: Omit<PortfolioItem, "date">
  ): Promise<void> => {
    try {
      if (!user) return;

      await predictionController.managePortfolio({
        userId: user.id,
        action: "add",
        item,
      });

      // 重新載入投資組合數據
      await reloadPageData();
    } catch (error) {
      console.error("新增到投資組合失敗:", error);
    }
  };

  // 添加缺失的事件處理函數
  const handleActiveTabChange = (tabId: string): void => {
    // 處理標籤切換邏輯
    console.log("切換到標籤:", tabId);
  };

  // 應用程式載入檢查
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">正在初始化AI系統...</p>
          {appError && <p className="text-red-500 text-sm mt-2">{appError}</p>}
        </div>
      </div>
    );
  }

  // 數據載入中
  if (pageLoading && !isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.loaded / progress.total) * 100}%` }}
            />
          </div>
          <p className="mt-4 text-gray-600">
            載入AI分析系統中... ({progress.loaded}/{progress.total})
          </p>
        </div>
      </div>
    );
  }

  // 錯誤處理
  if (Object.keys(pageErrors).length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              載入失敗
            </h2>
            <ul className="text-red-700 text-sm space-y-1">
              {Object.entries(pageErrors).map(([key, error]) => (
                <li key={key}>
                  {key}: {error}
                </li>
              ))}
            </ul>
            <button
              onClick={reloadPageData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              重新載入
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 使用實時數據或智能分析數據
  const currentPrediction =
    realtimePrediction?.prediction || smartAnalysis?.prediction;
  const isAnalyzing = predictionLoading || analysisLoading;

  return (
    <>
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
                      {currentPrediction?.signals?.map((signal, index) => (
                        <div
                          key={index}
                          className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-gray-100"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              {signal.type}
                            </span>
                            <span
                              className={`text-sm font-bold ${signal.color}`}
                            >
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
                    (
                      indicator: ModelTechnicalIndicator
                    ): ComponentTechnicalIndicator => ({
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
                  setPortfolioItems={(
                    value: React.SetStateAction<PortfolioItem[]>
                  ) => {
                    // 處理函數類型或直接值類型
                    const items =
                      typeof value === "function"
                        ? value(portfolioItems || [])
                        : value;

                    // 這裡可以處理投資組合項目的更新
                    console.log("更新投資組合項目:", items);
                    // 如果需要持久化，可以調用控制器
                    // predictionController.updatePortfolioItems(user.id, items);
                  }}
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
                  {currentPrediction && (
                    <div className="flex items-center">
                      <ShieldCheckIcon className="h-4 w-4 mr-2" />
                      預測信心度：{currentPrediction.confidence}%
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
                {currentPrediction && (
                  <p className="text-sm text-blue-600 mt-2">
                    當前預測風險等級：{currentPrediction.riskLevel}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AIPredictionPage;
