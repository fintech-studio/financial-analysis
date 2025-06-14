import React, { useState, useEffect } from "react";
import {
  ChartPieIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  ArrowPathIcon,
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
    { id: "overview", name: "總覽", icon: ChartPieIcon },
    { id: "holdings", name: "持股明細", icon: CurrencyDollarIcon },
    { id: "performance", name: "績效分析", icon: ArrowTrendingUpIcon },
    { id: "transactions", name: "交易記錄", icon: PlusCircleIcon },
  ];

  // 如果應用程式未初始化，顯示載入畫面
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            正在初始化應用程式...
          </h2>
          {appError && <p className="text-red-500 text-sm">{appError}</p>}
        </div>
      </div>
    );
  }

  // 數據載入中
  if (preloadLoading && !isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">投資組合</h1>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(progress.loaded / progress.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-gray-600">
              載入中... ({progress.loaded}/{progress.total})
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 錯誤處理
  if (Object.keys(preloadErrors).length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              載入失敗
            </h2>
            <ul className="text-red-700">
              {Object.entries(preloadErrors).map(([key, error]) => (
                <li key={key}>
                  {key}: {error}
                </li>
              ))}
            </ul>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              重新載入
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { user, portfolio, allocation, performance, transactions } =
    preloadedData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題與實時更新狀態 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">投資組合</h1>
            <p className="text-gray-600 mt-2">
              歡迎回來，{user?.name || "投資者"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {realtimeLoading && (
              <div className="flex items-center text-blue-600">
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-sm">更新中...</span>
              </div>
            )}
            {realtimeError && (
              <button
                onClick={retryRealtime}
                className="text-red-600 hover:text-red-700 text-sm flex items-center"
              >
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                重試
              </button>
            )}
          </div>
        </div>

        {/* 標籤導航 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 內容區域 */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <>
              <PortfolioOverview data={realtimeData || portfolio} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AssetAllocation data={allocation} />
                <PerformanceChart data={performance} timeRange="1M" />
              </div>
              {/* 風險評估與智能建議 */}
              <RiskAndRecommendations
                riskData={
                  portfolio?.riskData || {
                    metrics: {
                      volatility: 0,
                      volatilityVsMarket: 0,
                      sharpeRatio: 0,
                      maxDrawdown: 0,
                      maxDrawdownDate: "",
                    },
                    volatility: {
                      labels: [],
                      portfolio: [],
                      market: [],
                    },
                    riskFactors: {
                      labels: [],
                      values: [],
                    },
                    drawdown: {
                      labels: [],
                      values: [],
                    },
                    otherMetrics: [],
                  }
                }
                aiData={
                  portfolio?.aiRecommendations || {
                    summary: "正在分析中...",
                    healthScore: 0,
                    optimizationPotential: 0,
                    recommendationLevel: 0,
                    recommendations: [],
                  }
                }
              />
            </>
          )}

          {activeTab === "holdings" && (
            <HoldingsTable
              holdings={portfolio?.holdings || []}
              onSelectHolding={setSelectedHolding}
              selectedHolding={selectedHolding || undefined}
            />
          )}

          {activeTab === "performance" && (
            <div className="grid grid-cols-1 gap-6">
              <PerformanceChart data={performance} timeRange="1M" />
              <RiskAndRecommendations
                riskData={
                  portfolio?.riskData || {
                    metrics: {
                      volatility: 0,
                      volatilityVsMarket: 0,
                      sharpeRatio: 0,
                      maxDrawdown: 0,
                      maxDrawdownDate: "",
                    },
                    volatility: {
                      labels: [],
                      portfolio: [],
                      market: [],
                    },
                    riskFactors: {
                      labels: [],
                      values: [],
                    },
                    drawdown: {
                      labels: [],
                      values: [],
                    },
                    otherMetrics: [],
                  }
                }
                aiData={
                  portfolio?.aiRecommendations || {
                    summary: "正在分析中...",
                    healthScore: 0,
                    optimizationPotential: 0,
                    recommendationLevel: 0,
                    recommendations: [],
                  }
                }
              />
            </div>
          )}

          {activeTab === "transactions" && (
            <TransactionHistory transactions={transactions || []} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PortfolioPage;
