import React, { useState, useEffect } from "react";
import {
  ChartPieIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

// 組件引入
import PortfolioOverview from "../components/features/Portfolio/PortfolioOverview";
import AssetAllocation from "../components/features/Portfolio/AssetAllocation";
import HoldingsTable from "../components/features/Portfolio/HoldingsTable";
import PerformanceChart from "../components/features/Portfolio/PerformanceChart";
import TransactionHistory from "../components/features/Portfolio/TransactionHistory";
import RiskAndRecommendations from "../components/features/Portfolio/RiskAndRecommendations";
import Footer from "../components/Layout/Footer";

// 優化後的 MVC 架構引入
import { PortfolioController } from "../controllers/PortfolioController";
import { UserController } from "../controllers/UserController";
import { Portfolio } from "../models/PortfolioModel";
import { User } from "../models/UserModel";

// 增強的Hook引入
import {
  useControllerWithRetry,
  usePreloadData,
} from "../hooks/useMvcController";
import { useAppInitialization } from "../utils/appInitializer";

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: string;
  currentPrice: string;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

const PortfolioPage: React.FC = () => {
  const [selectedHolding, setSelectedHolding] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // 應用程式初始化
  const {
    isLoading: appLoading,
    isInitialized,
    error: appError,
  } = useAppInitialization({
    enableCache: true,
    enableMockData: true,
  });

  // 控制器實例
  const portfolioController = PortfolioController.getInstance();
  const userController = UserController.getInstance();

  // 使用優化後的 Hook 進行數據預加載
  const {
    data: preloadedData,
    loading: preloadLoading,
    errors: preloadErrors,
    progress,
    isComplete,
  } = usePreloadData(
    {
      user: () => userController.getUserProfile("user_001"),
      portfolio: () => portfolioController.getPortfolio("user_001"),
      portfolios: () => portfolioController.getUserPortfolios("user_001"),
      performance: () =>
        portfolioController.getPortfolioPerformance("user_001", "1M"),
      allocation: () => portfolioController.getAssetAllocation("user_001"),
      transactions: () =>
        portfolioController.getTransactionHistory("user_001", 10),
    },
    {
      priority: [
        "user",
        "portfolio",
        "allocation",
        "performance",
        "portfolios",
        "transactions",
      ],
      concurrent: false, // 順序加載以減少服務器負載
      onProgress: (loaded, total) => {
        console.log(`數據預加載進度: ${loaded}/${total}`);
      },
    }
  );

  // 使用重試機制的實時數據更新
  const {
    data: realtimeData,
    loading: realtimeLoading,
    error: realtimeError,
    retry: retryRealtime,
  } = useControllerWithRetry(
    () => portfolioController.getPortfolio("user_001"),
    {
      maxRetries: 3,
      retryDelay: 2000,
      retryCondition: (error) => error.message.includes("網路"),
      onRetry: (attempt, error) => {
        console.log(`重試第 ${attempt} 次，錯誤:`, error.message);
      },
      cacheKey: "portfolio_realtime",
      cacheTTL: 30000, // 30秒緩存
    }
  );

  const tabs: Tab[] = [
    {
      id: "overview",
      name: "投資組合概覽",
      icon: DocumentChartBarIcon,
      color: "from-blue-500 to-indigo-600",
      description: "總體資產狀況與關鍵指標",
    },
    {
      id: "allocation",
      name: "資產配置",
      icon: ChartPieIcon,
      color: "from-green-500 to-emerald-600",
      description: "資產類別與地區分布分析",
    },
    {
      id: "holdings",
      name: "持倉明細",
      icon: CurrencyDollarIcon,
      color: "from-purple-500 to-violet-600",
      description: "個股持倉詳細資訊",
    },
    {
      id: "performance",
      name: "績效分析",
      icon: ArrowTrendingUpIcon,
      color: "from-orange-500 to-red-600",
      description: "投資報酬與績效評估",
    },
    {
      id: "transactions",
      name: "交易歷史",
      icon: PlusCircleIcon,
      color: "from-cyan-500 to-blue-600",
      description: "歷史交易紀錄與分析",
    },
    {
      id: "risk",
      name: "風險與建議",
      icon: ShieldCheckIcon,
      color: "from-pink-500 to-rose-600",
      description: "風險評估與AI智能建議",
    },
  ];

  // 如果應用程式未初始化，顯示載入畫面
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-blue-200/30 to-purple-200/30 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-200/30 to-pink-200/30 blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <SparklesIcon className="w-16 h-16 text-blue-500 mx-auto animate-spin" />
            <div className="absolute inset-0 w-16 h-16 mx-auto bg-blue-500/20 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            正在初始化應用程式
          </h2>
          <div className="w-64 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
          </div>
          {appError && (
            <p className="text-red-500 text-sm mt-4 bg-red-50 px-4 py-2 rounded-lg inline-block">
              {appError}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 數據載入中
  if (preloadLoading && !isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
        {/* 背景動畫 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-gradient-to-br from-blue-300/20 to-purple-300/20 blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-300/20 to-pink-300/20 blur-3xl animate-float-delay"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              投資組合
            </h1>

            {/* 進度條 */}
            <div className="max-w-md mx-auto mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  載入進度
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {Math.round((progress.loaded / progress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-out relative"
                  style={{
                    width: `${(progress.loaded / progress.total) * 100}%`,
                  }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
            </div>

            <p className="text-gray-600 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full inline-block">
              正在載入您的投資數據... ({progress.loaded}/{progress.total})
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 錯誤處理
  if (Object.keys(preloadErrors).length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <h2 className="text-xl font-bold text-white">載入失敗</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-2 mb-6">
                  {Object.entries(preloadErrors).map(([key, error]) => (
                    <li
                      key={key}
                      className="flex items-center text-red-700 bg-red-50 px-3 py-2 rounded-lg"
                    >
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                      <span className="font-medium">{key}:</span>
                      <span className="ml-2">{error}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  重新載入
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { user, portfolio, allocation, performance, transactions } =
    preloadedData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* 背景裝飾元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-blue-200/20 to-purple-200/20 blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-200/20 to-pink-200/20 blur-3xl animate-float-delay"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* 頁面標題與實時更新狀態 */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              投資組合
            </h1>
            <p className="text-gray-600 flex items-center">
              <span>歡迎回來，</span>
              <span className="font-semibold text-blue-600 ml-1">
                {user?.name || "投資者"}
              </span>
              <SparklesIcon className="w-4 h-4 text-yellow-500 ml-2" />
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {realtimeLoading && (
              <div className="flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-full border border-blue-200">
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-sm font-medium">更新中...</span>
              </div>
            )}
            {realtimeError && (
              <button
                onClick={retryRealtime}
                className="text-red-600 hover:text-red-700 text-sm flex items-center bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full border border-red-200 transition-all duration-200"
              >
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                重試
              </button>
            )}
          </div>
        </div>

        {/* 標籤導航 - 更新為兩行佈局以容納6個標籤 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 mb-8 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="grid grid-cols-3 lg:grid-cols-6 gap-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex flex-col items-center py-4 px-3 font-medium text-sm transition-all duration-300 group rounded-xl ${
                      activeTab === tab.id
                        ? "text-white"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    title={tab.description}
                  >
                    {/* 活動標籤背景 */}
                    {activeTab === tab.id && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl shadow-lg`}
                      ></div>
                    )}

                    {/* 圖標和文字 */}
                    <div className="relative flex flex-col items-center space-y-1">
                      <Icon
                        className={`w-6 h-6 transition-transform duration-200 ${
                          activeTab === tab.id
                            ? "scale-110"
                            : "group-hover:scale-105"
                        }`}
                      />
                      <span className="text-xs text-center leading-tight">
                        {tab.name}
                      </span>
                    </div>

                    {/* 懸停效果 */}
                    {activeTab !== tab.id && (
                      <div className="absolute inset-0 bg-gray-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 內容區域 */}
        <div className="space-y-8">
          {/* 投資組合概覽 */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fadeIn">
              {(() => {
                const overviewData = realtimeData || portfolio;
                const showPortfolioOverview =
                  overviewData && typeof overviewData === "object";

                return showPortfolioOverview ? (
                  <PortfolioOverview data={overviewData} />
                ) : (
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
                    <div className="animate-pulse">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 資產配置 */}
          {activeTab === "allocation" && (
            <div className="animate-fadeIn transform transition-all duration-300">
              {(() => {
                const showAssetAllocation =
                  allocation && typeof allocation === "object";

                return showAssetAllocation ? (
                  <AssetAllocation data={allocation} />
                ) : (
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
                    <div className="animate-pulse">
                      <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 持倉明細 */}
          {activeTab === "holdings" && (
            <div className="animate-fadeIn transform transition-all duration-300 hover:scale-[1.005]">
              <HoldingsTable
                holdings={portfolio?.holdings || []}
                onSelectHolding={setSelectedHolding}
                selectedHolding={selectedHolding || undefined}
              />
            </div>
          )}

          {/* 績效分析 */}
          {activeTab === "performance" && (
            <div className="animate-fadeIn space-y-8">
              {(() => {
                const showPerformanceChart =
                  performance && typeof performance === "object";

                return (
                  <>
                    {showPerformanceChart ? (
                      <div className="transform transition-all duration-300 hover:scale-[1.02]">
                        <PerformanceChart data={performance} timeRange="1M" />
                      </div>
                    ) : (
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
                        <div className="animate-pulse">
                          <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* 交易歷史 */}
          {activeTab === "transactions" && (
            <div className="animate-fadeIn">
              <TransactionHistory transactions={transactions || []} />
            </div>
          )}

          {/* 風險與建議 */}
          {activeTab === "risk" && (
            <div className="animate-fadeIn transform transition-all duration-300 hover:scale-[1.01]">
              <RiskAndRecommendations
                riskData={{
                  metrics: portfolio?.riskData?.metrics || {
                    volatility: 0,
                    volatilityVsMarket: 0,
                    sharpeRatio: 0,
                    maxDrawdown: 0,
                    maxDrawdownDate: "",
                  },
                  volatility: portfolio?.riskData?.volatility || {
                    labels: [],
                    portfolio: [],
                    market: [],
                  },
                  riskFactors: portfolio?.riskData?.riskFactors || {
                    labels: [],
                    values: [],
                  },
                  drawdown: portfolio?.riskData?.drawdown || {
                    labels: [],
                    values: [],
                  },
                  otherMetrics: portfolio?.riskData?.otherMetrics || [],
                }}
                aiData={{
                  summary:
                    portfolio?.aiRecommendations?.summary || "正在分析中...",
                  healthScore: portfolio?.aiRecommendations?.healthScore || 0,
                  optimizationPotential:
                    portfolio?.aiRecommendations?.optimizationPotential || 0,
                  recommendationLevel:
                    portfolio?.aiRecommendations?.recommendationLevel || 0,
                  recommendations:
                    portfolio?.aiRecommendations?.recommendations || [],
                }}
              />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PortfolioPage;
