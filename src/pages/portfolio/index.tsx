import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChartPieIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
// 型別定義與守衛（放在檔案頂部）
import type { RiskData, AIData, ChartData } from "../../types/portfolio";

// 重新定義 AssetAllocationData 與 PortfolioOverviewData 型別（保留原本結構，或考慮搬移到 types/portfolio.ts）
interface AssetItem {
  name: string;
  percentage: number;
}
interface Recommendation {
  text: string;
  type: "positive" | "neutral" | "negative";
}
interface AssetAllocationData {
  byAssetClass: AssetItem[];
  bySector: AssetItem[];
  byRegion: AssetItem[];
  recommendations: Recommendation[];
}
interface PortfolioOverviewData {
  totalValue: string | number;
  totalReturn: { value: string | number; percentage: string | number };
  lastUpdate: string;
  monthlyChange: string;
}

interface PortfolioData {
  overview: PortfolioOverviewData;
  allocation: AssetAllocationData;
  performance: unknown;
  transactions: unknown;
  risk?: RiskData;
  holdings?: unknown;
  aiRecommendations?: AIData;
}
function isPortfolioData(obj: unknown): obj is PortfolioData {
  return (
    !!obj &&
    typeof obj === "object" &&
    "overview" in obj &&
    "allocation" in obj &&
    "performance" in obj &&
    "transactions" in obj
  );
}
function isAssetAllocationData(obj: unknown): obj is AssetAllocationData {
  return (
    !!obj &&
    typeof obj === "object" &&
    Array.isArray((obj as AssetAllocationData).byAssetClass) &&
    Array.isArray((obj as AssetAllocationData).bySector) &&
    Array.isArray((obj as AssetAllocationData).byRegion) &&
    Array.isArray((obj as AssetAllocationData).recommendations)
  );
}
function isChartData(obj: unknown): obj is ChartData {
  return (
    !!obj &&
    typeof obj === "object" &&
    "daily" in obj &&
    "weekly" in obj &&
    "monthly" in obj &&
    "returns" in obj
  );
}

// 組件引入
import PortfolioOverview from "../../components/pages/Portfolio/PortfolioOverview";
import AssetAllocation from "../../components/pages/Portfolio/AssetAllocation";
import HoldingsTable from "../../components/pages/Portfolio/HoldingsTable";
import PerformanceChart from "../../components/pages/Portfolio/PerformanceChart";
import TransactionHistory from "../../components/pages/Portfolio/TransactionHistory";
import Footer from "../../components/Layout/Footer";

// 優化後的 MVC 架構引入
import { PortfolioController } from "../../controllers/PortfolioController";
import { UserController } from "../../controllers/UserController";

// 增強的Hook引入
import {
  useControllerWithRetry,
  usePreloadData,
} from "../../hooks/useMvcController";
import { useAppInitialization } from "../../utils/appInitializer";

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const PortfolioPage: React.FC = () => {
  const [selectedHolding, setSelectedHolding] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // 應用程式初始化
  const {
    isLoading,
    isInitialized,
    error: appError,
  } = useAppInitialization({
    enableCache: true,
    enableMockData: true,
  });

  // 控制器實例 - 使用 useMemo 避免重新創建
  const portfolioController = useMemo(
    () => PortfolioController.getInstance(),
    []
  );
  const userController = useMemo(() => UserController.getInstance(), []);

  // 使用優化後的 Hook 進行數據預加載
  const {
    data: preloadedData,
    loading: preloadLoading,
    errors: preloadErrors,
    isComplete,
    reload: reloadPreloadData,
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
      concurrent: false,
      onProgress: (loaded, total) => {
        console.log(`數據預加載進度: ${loaded}/${total}`);
      },
    }
  );

  // 優化實時數據更新 - 降低更新頻率並添加條件控制
  const {
    data: realtimeData,
    loading: realtimeLoading,
    error: realtimeError,
    retry: retryRealtime,
  } = useControllerWithRetry(
    useCallback(
      () => portfolioController.getPortfolio("user_001"),
      [portfolioController]
    ),
    {
      maxRetries: 2, // 減少重試次數
      retryDelay: 5000, // 增加重試延遲
      retryCondition: (error) =>
        error.message.includes("網路") || error.message.includes("timeout"),
      onRetry: (attempt, error) => {
        console.log(`重試第 ${attempt} 次，錯誤:`, error.message);
      },
      cacheKey: "portfolio_realtime",
      cacheTTL: 60000, // 增加緩存時間到1分鐘
      enabled: isInitialized && isComplete, // 只在初始化完成後啟用
    }
  );

  // 優化標籤數據 - 使用 useMemo 避免重新計算
  const tabs: Tab[] = useMemo(
    () => [
      {
        id: "overview",
        name: "投資組合概覽",
        icon: DocumentChartBarIcon,
        description: "總體資產狀況與關鍵指標",
      },
      {
        id: "allocation",
        name: "資產配置",
        icon: ChartPieIcon,
        description: "資產類別與地區分布分析",
      },
      {
        id: "holdings",
        name: "持倉明細",
        icon: CurrencyDollarIcon,
        description: "個股持倉詳細資訊",
      },
      {
        id: "performance",
        name: "績效分析",
        icon: ArrowTrendingUpIcon,
        description: "投資報酬與績效評估",
      },
      {
        id: "transactions",
        name: "交易歷史",
        icon: PlusCircleIcon,
        description: "歷史交易紀錄與分析",
      },
      {
        id: "risk",
        name: "風險與建議",
        icon: ShieldCheckIcon,
        description: "風險評估與AI智能建議",
      },
    ],
    []
  );

  // 手動刷新功能
  const handleManualRefresh = useCallback(async () => {
    try {
      setLastUpdateTime(new Date());
      await reloadPreloadData();
      if (realtimeError) {
        await retryRealtime();
      }
    } catch (error) {
      console.error("手動刷新失敗:", error);
    }
  }, [reloadPreloadData, retryRealtime, realtimeError]);

  // 頁面可見性控制 - 當頁面不可見時停止更新
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 頁面隱藏時，可以暫停一些更新
        console.log("頁面隱藏，暫停實時更新");
      } else {
        // 頁面顯示時，可以恢復更新
        console.log("頁面顯示，恢復實時更新");
        setLastUpdateTime(new Date());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 主要內容區域的數據處理 - 使用 useMemo 優化
  const processedData = useMemo(() => {
    const { user, portfolio, allocation, performance, transactions } =
      preloadedData;
    return {
      user,
      portfolio: realtimeData || portfolio, // 優先使用實時數據
      allocation,
      performance: performance as ChartData,
      transactions,
    } as {
      user: unknown;
      portfolio: unknown;
      allocation: unknown;
      performance: ChartData;
      transactions: unknown;
    };
  }, [preloadedData, realtimeData]);

  // 如果應用程式未初始化，顯示載入畫面
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">正在初始化應用程式...</p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">載入投資組合數據中...</p>
        </div>
      </div>
    );
  }

  // 錯誤處理
  if (Object.keys(preloadErrors).length > 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 統一的頁面標題區域 */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-xl relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white tracking-tight">
                投資組合管理
              </h1>
              <p className="text-red-200 mt-4 text-lg">載入過程中發生錯誤</p>
            </div>
          </div>
        </div>

        {/* 錯誤內容 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.3),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%),radial-gradient(circle_at_40%_80%,rgba(119,255,198,0.3),transparent_50%)] pointer-events-none" />

      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-2xl relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-5 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-32 h-32 bg-white opacity-5 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-white/10 to-transparent rounded-full"></div>
          
          {/* Additional floating elements */}
          <div className="absolute top-20 right-10 w-3 h-3 bg-white opacity-20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-20 w-2 h-2 bg-white opacity-30 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm mr-6 group hover:bg-white/20 transition-all duration-300">
                  <BriefcaseIcon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                    投資組合管理
                  </h1>
                  <p className="text-blue-100 mt-3 text-xl">
                    歡迎回來，
                    <span className="font-semibold text-white ml-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                      {typeof preloadedData.user === "object" &&
                      preloadedData.user &&
                      "name" in preloadedData.user &&
                      typeof preloadedData.user.name === "string"
                        ? preloadedData.user.name
                        : "投資者"}
                    </span>
                  </p>
                </div>
              </div>
              <p className="text-blue-100 text-xl max-w-3xl leading-relaxed">
                智能投資組合管理系統，追蹤績效表現、風險評估，並提供最佳化建議
              </p>
            </div>

            {/* Status Panel */}
            <div className="flex flex-col lg:items-end space-y-4">
              <div className="flex items-center space-x-4">
                {realtimeLoading && (
                  <div className="flex items-center bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-white/20 shadow-lg">
                    <ArrowPathIcon className="w-5 h-5 mr-3 animate-spin" />
                    <span className="text-sm font-medium">更新中...</span>
                  </div>
                )}
                {realtimeError && (
                  <button
                    onClick={retryRealtime}
                    className="text-red-200 hover:text-white text-sm flex items-center bg-red-500/20 hover:bg-red-500/30 px-6 py-3 rounded-full border border-red-300/30 transition-all duration-200 shadow-lg"
                  >
                    <ArrowPathIcon className="w-5 h-5 mr-2" />
                    重試
                  </button>
                )}
                
                <button
                  onClick={handleManualRefresh}
                  className="text-white/80 hover:text-white text-sm flex items-center bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full border border-white/20 transition-all duration-200 shadow-lg hover:shadow-xl"
                  title="手動刷新數據"
                >
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  刷新
                </button>
              </div>
              
              <div className="text-white/60 text-sm bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm">
                最後更新: {lastUpdateTime.toLocaleTimeString("zh-TW")}
              </div>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="mt-12">
            <nav className="flex flex-wrap gap-3 lg:gap-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 px-6 py-4 text-sm font-semibold rounded-2xl whitespace-nowrap transition-all duration-300 shadow-lg hover:shadow-xl ${
                      activeTab === tab.id
                        ? "bg-white text-indigo-700 shadow-white/20 scale-105"
                        : "text-white bg-white/10 hover:bg-white/20 hover:scale-105 backdrop-blur-sm border border-white/20"
                    }`}
                    title={tab.description}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                    {activeTab === tab.id && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="space-y-12">
          {/* Overview Section */}
          {activeTab === "overview" && (
            <div className="space-y-10 animate-fadeIn">
              {isPortfolioData(processedData.portfolio) ? (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-20"></div>
                  <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                    <div className="p-8 lg:p-12">
                      <PortfolioOverview data={processedData.portfolio.overview} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-white/30">
                  <div className="animate-pulse space-y-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto"></div>
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Allocation Section */}
          {activeTab === "allocation" && (
            <div className="animate-fadeIn">
              {isAssetAllocationData(processedData.allocation) ? (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl blur opacity-20"></div>
                  <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-200/50 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
                    <div className="p-8 lg:p-12">
                      <AssetAllocation data={processedData.allocation} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-white/30">
                  <div className="animate-pulse space-y-6">
                    <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto"></div>
                    <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Holdings Section */}
          {activeTab === "holdings" && (
            <div className="animate-fadeIn">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-indigo-200/50 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  
                  {/* Section Header */}
                  <div className="px-8 py-6 border-b border-gray-100/50 bg-gradient-to-r from-indigo-50/30 to-purple-50/30">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <CurrencyDollarIcon className="w-8 h-8 text-indigo-600 mr-3" />
                      持倉明細
                    </h2>
                    <p className="text-gray-600 mt-2">詳細的投資組合持倉資訊與表現</p>
                  </div>
                  
                  <div className="p-8 lg:p-12">
                    <HoldingsTable
                      holdings={
                        isPortfolioData(processedData.portfolio) &&
                        Array.isArray(processedData.portfolio.holdings)
                          ? processedData.portfolio.holdings
                          : []
                      }
                      onSelectHolding={setSelectedHolding}
                      selectedHolding={selectedHolding || undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Section */}
          {activeTab === "performance" && (
            <div className="animate-fadeIn space-y-10">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-3xl blur opacity-20"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-cyan-200/50 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
                  
                  {/* Section Header */}
                  <div className="px-8 py-6 border-b border-gray-100/50 bg-gradient-to-r from-cyan-50/30 to-blue-50/30">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <ArrowTrendingUpIcon className="w-8 h-8 text-cyan-600 mr-3" />
                      績效分析
                    </h2>
                    <p className="text-gray-600 mt-2">投資組合歷史表現與趨勢分析</p>
                  </div>
                  
                  <div className="p-8 lg:p-12">
                    <PerformanceChart
                      data={
                        isPortfolioData(processedData.portfolio) &&
                        processedData.performance &&
                        isChartData(processedData.performance)
                          ? (processedData.performance as ChartData)
                          : ({
                              daily: { labels: [], portfolio: [] },
                              weekly: { labels: [], portfolio: [] },
                              monthly: { labels: [], portfolio: [] },
                              returns: {},
                            } as ChartData)
                      }
                      timeRange={"1M"}
                      showDetails={true}
                      showBenchmark={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Section */}
          {activeTab === "transactions" && (
            <div className="animate-fadeIn">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 rounded-3xl blur opacity-20"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-200/50 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500"></div>
                  
                  {/* Section Header */}
                  <div className="px-8 py-6 border-b border-gray-100/50 bg-gradient-to-r from-orange-50/30 to-pink-50/30">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <PlusCircleIcon className="w-8 h-8 text-orange-600 mr-3" />
                      交易歷史
                    </h2>
                    <p className="text-gray-600 mt-2">完整的交易記錄與統計分析</p>
                  </div>
                  
                  <div className="p-8 lg:p-12">
                    <TransactionHistory
                      transactions={
                        processedData.transactions &&
                        Array.isArray(processedData.transactions)
                          ? processedData.transactions
                          : []
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Section */}
          {activeTab === "risk" && (
            <div className="animate-fadeIn">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 rounded-3xl blur opacity-20"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200/50 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500"></div>
                  
                  {/* Section Header */}
                  <div className="px-8 py-6 border-b border-gray-100/50 bg-gradient-to-r from-purple-50/30 to-fuchsia-50/30">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <ShieldCheckIcon className="w-8 h-8 text-purple-600 mr-3" />
                      風險評估與建議
                    </h2>
                    <p className="text-gray-600 mt-2">投資風險分析與AI智能建議</p>
                  </div>
                  
                  <div className="p-8 lg:p-12">
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <ShieldCheckIcon className="w-10 h-10 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">風險分析功能開發中</h3>
                      <p className="text-gray-600">我們正在為您準備更完善的風險評估工具</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default PortfolioPage;
