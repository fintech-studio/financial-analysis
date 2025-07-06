import React, { useState, useEffect, useCallback } from "react";
import { ChartBarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import Footer from "@/components/Layout/Footer";
import { marketData, analysisModules } from "@/data/marketData";

// MVC 架構引入
import { StockController } from "@/controllers/StockController";
import { MarketController } from "@/controllers/MarketController";
import { UserController } from "@/controllers/UserController";
import { useMvcController, useDataLoader } from "@/hooks/useMvcController";
import { StockDetail } from "@/models/StockModel";
import { User } from "@/models/UserModel";

// 引入組件
import Overview from "@/components/pages/StockMarket/Overview";
import StockList from "@/components/pages/StockMarket/StockList";
import StockComparison from "@/components/pages/StockMarket/StockComparison";
import StockDetails from "@/components/pages/StockMarket/StockDetails";
import TechnicalPatterns from "@/components/pages/StockMarket/TechnicalPatterns";
import Screener from "@/components/pages/StockMarket/Screener";
import { load } from "cheerio";

// TypeScript 型別定義
interface StockMarketProps {}

type TabType = "overview" | "stocks" | "sectors" | "technical" | "screener";
type StrategyType = "value" | "growth" | "momentum" | "quality";
type SectorType = "all" | "tech" | "finance" | "healthcare" | "energy";
type TimeRangeType = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";
type NewsFilterType = "latest" | "relevant" | "analysis";

// 組件期望的股票介面
interface StockDetailForList {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent?: string;
  industry: string;
  volume: string;
  pe: string;
  dividend?: string;
  dividendYield?: string;
}

interface StockForComparison {
  symbol: string;
  name: string;
  price: number;
  pe?: number;
  pb?: number;
  dividend?: string;
  marketCap?: string;
  volume?: string;
  high52w?: string;
  low52w?: string;
  [key: string]: any;
}

interface StockForDetails {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent?: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  pe: string;
  pb: string;
  dividend?: string;
  dividendYield?: string;
  chartData?: any;
  priceHistory?: number[];
  technicalSignals?: any;
  institutionalTrades?: any;
  ratings?: any[];
  news?: any[];
}

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockMarket: React.FC<StockMarketProps> = () => {
  // 基本狀態管理
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStrategy, setSelectedStrategy] =
    useState<StrategyType>("value");
  const [selectedSector, setSelectedSector] = useState<SectorType>("all");
  const [favoriteStocks, setFavoriteStocks] = useState<string[]>(["2330"]);
  const [stockCompare, setStockCompare] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRangeType>("1M");
  const [customIndicatorOpen, setCustomIndicatorOpen] =
    useState<boolean>(false);
  const [selectedPattern, setSelectedPattern] = useState<string>("頭肩頂");
  const [newsFilter, setNewsFilter] = useState<NewsFilterType>("latest");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 新增載入狀態追蹤
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // MVC 架構 - 控制器和狀態管理
  const stockController = StockController.getInstance();
  const marketController = MarketController.getInstance();
  const userController = UserController.getInstance();

  const { data: user, execute: executeUser } = useMvcController<User>();

  const {
    data: marketOverview,
    loading: marketLoading,
    error: marketError,
  } = useDataLoader(() => marketController.getMarketOverview(), null, {
    onSuccess: (data) => {
      console.log("市場概覽數據載入成功:", data);
      setLastUpdated(new Date());
    },
    onError: (error) => {
      console.error("載入市場概覽失敗:", error);
      setLoadingError(
        error instanceof Error ? error.message : "載入市場概覽失敗"
      );
    },
  });

  const {
    data: stockDetails,
    loading: stocksLoading,
    error: stocksError,
    execute: executeStocksRefresh,
  } = useMvcController<StockDetail[]>();

  const {
    data: technicalAnalysis,
    loading: technicalLoading,
    error: technicalError,
    execute: executeTechnicalRefresh,
  } = useMvcController<any>();

  const {
    data: sectorData,
    loading: sectorLoading,
    error: sectorError,
    execute: executeSectorRefresh,
  } = useMvcController<any>();

  useMvcController<any>();

  // 使用 useCallback 避免函數重新創建導致的無限載入
  const loadStockData = useCallback(async () => {
    try {
      const filters = {
        sector: selectedSector !== "all" ? selectedSector : undefined,
        search: searchQuery || undefined,
        strategy: selectedStrategy,
      };

      await executeStocksRefresh(() => stockController.getStocks(filters));
    } catch (error: any) {
      console.error("載入股票數據失敗:", error);
      setLoadingError(error?.message || "載入股票數據失敗");
    }
  }, [
    selectedSector,
    searchQuery,
    selectedStrategy,
    executeStocksRefresh,
    stockController,
  ]);

  const loadTechnicalAnalysis = useCallback(async () => {
    try {
      await executeTechnicalRefresh(() =>
        stockController.getTechnicalAnalysis()
      );
    } catch (error: any) {
      console.error("載入技術分析失敗:", error);
      setLoadingError(error?.message || "載入技術分析失敗");
    }
  }, [executeTechnicalRefresh, stockController]);

  const loadSectorData = useCallback(async () => {
    try {
      await executeSectorRefresh(() => marketController.getSectorPerformance());
    } catch (error: any) {
      console.error("載入板塊數據失敗:", error);
      setLoadingError(error?.message || "載入板塊數據失敗");
    }
  }, [executeSectorRefresh, marketController]);

  const loadInitialData = useCallback(async () => {
    const userId = "user_001"; // 模擬用戶ID
    setIsInitialLoading(true);
    setLoadingError(null);

    try {
      // 並行載入基礎數據
      await Promise.allSettled([
        executeUser(() => userController.getUserProfile(userId)),
        loadStockData(),
        loadTechnicalAnalysis(),
        loadSectorData(),
      ]);
    } catch (error) {
      console.error("載入初始數據失敗:", error);
      setLoadingError(
        error instanceof Error ? error.message : "載入初始數據失敗"
      );
    } finally {
      setIsInitialLoading(false);
    }
  }, [
    executeUser,
    userController,
    loadStockData,
    loadTechnicalAnalysis,
    loadSectorData,
  ]);

  // 載入初始數據
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 當搜尋條件變化時重新載入股票數據 - 使用防抖
  useEffect(() => {
    if (!isInitialLoading) {
      const timeoutId = setTimeout(() => {
        loadStockData();
      }, 500); // 500ms 防抖

      return () => clearTimeout(timeoutId);
    }
  }, [
    searchQuery,
    selectedSector,
    selectedStrategy,
    isInitialLoading,
    loadStockData,
  ]);

  // 刷新所有數據
  const handleRefreshData = async () => {
    try {
      setLastUpdated(new Date());
      setLoadingError(null);
      await Promise.allSettled([
        loadStockData(),
        loadTechnicalAnalysis(),
        loadSectorData(),
      ]);
      console.log("股票市場數據刷新完成");
    } catch (error) {
      console.error("刷新股票市場數據失敗:", error);
      setLoadingError(error instanceof Error ? error.message : "刷新數據失敗");
    }
  };

  // 處理股票搜尋 - 添加防抖和避免無限更新
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const query = e.target.value;
      setSearchQuery(query);
    },
    []
  );

  const handleSort = useCallback((column: string): void => {
    console.log("排序依據:", column);
    // TODO: 實現排序邏輯
  }, []);

  // 處理收藏股票 - 使用 useCallback 避免無限更新
  const toggleFavoriteStock = useCallback(
    async (symbol: string): Promise<void> => {
      if (!user) return;

      try {
        if (favoriteStocks.includes(symbol)) {
          await stockController.removeFavoriteStock(user.id, symbol);
          setFavoriteStocks((prev) => prev.filter((s) => s !== symbol));
        } else {
          await stockController.addFavoriteStock(user.id, symbol);
          setFavoriteStocks((prev) => [...prev, symbol]);
        }
      } catch (error) {
        console.error("更新收藏股票失敗:", error);
      }
    },
    [user, favoriteStocks, stockController]
  );

  const toggleCompareStock = useCallback((symbol: string): void => {
    setStockCompare((prev) => {
      if (prev.includes(symbol)) {
        return prev.filter((s) => s !== symbol);
      } else if (prev.length < 3) {
        return [...prev, symbol];
      }
      return prev;
    });
  }, []);

  // 數據轉換函數
  const transformStockDetailsForList = (
    stocks: StockDetail[]
  ): StockDetailForList[] => {
    if (!stocks || stocks.length === 0) return [];

    return stocks.map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      price:
        typeof stock.price === "number"
          ? `$${stock.price.toFixed(2)}`
          : String(stock.price),
      change: stock.change || "0",
      changePercent: stock.changePercent || stock.change || "0%",
      industry: stock.industry || "未分類",
      volume: stock.volume?.toString() || "N/A",
      pe: stock.pe?.toString() || "N/A",
      dividend: stock.dividendYield?.toString() || "N/A",
      dividendYield: stock.dividendYield?.toString() || "N/A",
    }));
  };

  const transformStocksForComparison = (
    stocks: StockDetail[]
  ): StockForComparison[] => {
    if (!stocks || stocks.length === 0) return [];

    return stocks.map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      price:
        typeof stock.price === "number"
          ? stock.price
          : parseFloat(String(stock.price)) || 0,
      pe: stock.pe,
      pb: stock.pb,
      dividend: stock.dividendYield?.toString(),
      marketCap: stock.marketCap?.toString(),
      volume: stock.volume?.toString(),
      high52w: stock.high52w?.toString(),
      low52w: stock.low52w?.toString(),
    }));
  };

  const transformStockForDetails = (
    stocks: StockDetail[]
  ): StockForDetails | null => {
    if (!stocks || stocks.length === 0) return null;

    const stock = stocks[0];
    return {
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price?.toString() || "0",
      change: stock.change || "0",
      changePercent: stock.changePercent || stock.change || "0%",
      open: stock.open?.toString() || "0",
      high: stock.high?.toString() || "0",
      low: stock.low?.toString() || "0",
      volume: stock.volume?.toString() || "N/A",
      pe: stock.pe?.toString() || "N/A",
      pb: stock.pb?.toString() || "N/A",
      dividend: stock.dividendYield?.toString(),
      dividendYield: stock.dividendYield?.toString(),
      priceHistory: stock.priceHistory,
    };
  };

  // 使用轉換後的數據
  const transformedStockDetails = transformStockDetailsForList(
    stockDetails || []
  );
  const transformedStocksForComparison = transformStocksForComparison(
    stockDetails || []
  );
  const transformedStockForDetails = transformStockForDetails(
    stockDetails || []
  );

  // 改善載入狀態判斷
  const isLoading = isInitialLoading || (marketLoading && !marketOverview);
  const hasError =
    loadingError || marketError || stocksError || technicalError || sectorError;

  // 載入狀態
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">載入股票市場數據中...</p>
          <p className="mt-2 text-sm text-gray-500">
            請稍候，正在初始化數據...
          </p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
            <h3 className="text-lg font-medium text-red-800">載入失敗</h3>
            <p className="mt-2 text-red-600">{String(hasError)}</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 頁面標題與搜尋框 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            {/* 標題 */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">股票市場分析</h1>
                <p className="text-blue-100 text-sm">
                  最後更新: {lastUpdated.toLocaleString("zh-TW")}
                </p>
              </div>
            </div>

            {/* 搜尋與刷新 */}
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              {/* 搜尋框 */}
              <div className="relative flex-1 min-w-[240px]">
                <input
                  type="text"
                  placeholder="搜尋股票代號或名稱..."
                  className="w-full pl-10 pr-4 py-2 border border-white/30 bg-white/20 rounded-full focus:ring-2 focus:ring-white text-white placeholder-white/70"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-white absolute left-3 top-2.5" />
              </div>

              {/* 刷新按鈕 */}
              <button
                onClick={handleRefreshData}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="刷新數據"
                disabled={stocksLoading || technicalLoading || sectorLoading}
              >
                <svg
                  className={`h-5 w-5 text-white ${
                    stocksLoading || technicalLoading || sectorLoading
                      ? "animate-spin"
                      : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 導航標籤 */}
          <div className="mt-6">
            <nav className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  activeTab === "overview"
                    ? "bg-white text-indigo-700"
                    : "text-white hover:bg-white/10"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                市場概覽
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  activeTab === "stocks"
                    ? "bg-white text-indigo-700"
                    : "text-white hover:bg-white/10"
                }`}
                onClick={() => setActiveTab("stocks")}
              >
                個股分析
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  activeTab === "sectors"
                    ? "bg-white text-indigo-700"
                    : "text-white hover:bg-white/10"
                }`}
                onClick={() => setActiveTab("sectors")}
              >
                產業分析
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  activeTab === "technical"
                    ? "bg-white text-indigo-700"
                    : "text-white hover:bg-white/10"
                }`}
                onClick={() => setActiveTab("technical")}
              >
                技術分析
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  activeTab === "screener"
                    ? "bg-white text-indigo-700"
                    : "text-white hover:bg-white/10"
                }`}
                onClick={() => setActiveTab("screener")}
              >
                選股器
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <Overview
            marketData={marketOverview || marketData} // 使用 MVC 數據或回退到預設數據
            analysisModules={analysisModules} // 傳遞正確的分析模組
          />
        )}

        {activeTab === "stocks" && (
          <div className="space-y-8">
            {/* 載入指示器 */}
            {stocksLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">載入股票數據中...</span>
                </div>
              </div>
            )}

            {/* 股票列表 */}
            <StockList
              stockDetails={transformedStockDetails}
              favoriteStocks={favoriteStocks}
              toggleFavoriteStock={toggleFavoriteStock}
              showComparison={showComparison}
              setShowComparison={setShowComparison}
              toggleCompareStock={toggleCompareStock}
              stockCompare={stockCompare}
              handleSort={handleSort}
            />

            {/* 股票比較 */}
            {showComparison && stockCompare.length > 0 && (
              <StockComparison
                availableStocks={transformedStocksForComparison}
              />
            )}

            {/* 個股詳細信息 */}
            {transformedStockForDetails && (
              <StockDetails
                stock={transformedStockForDetails}
                favoriteStocks={favoriteStocks}
                toggleFavoriteStock={toggleFavoriteStock}
              />
            )}

            {/* 技術形態掃描 */}
            <TechnicalPatterns
              bullishStocks={technicalAnalysis?.bullish || []}
              bearishStocks={technicalAnalysis?.bearish || []}
              selectedPattern={selectedPattern}
              setSelectedPattern={setSelectedPattern}
            />
          </div>
        )}

        {/* 其他選項卡內容 */}
        {activeTab === "sectors" && (
          <div>
            {sectorLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">載入板塊分析中...</span>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">產業分析</h2>
                <p className="text-gray-600">
                  板塊分析頁面內容 - 使用 {sectorData ? "真實" : "模擬"} 數據
                </p>
                {sectorError && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-800">
                      載入板塊數據時出現問題: {String(sectorError)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "technical" && (
          <div>
            {technicalLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">載入技術分析中...</span>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">技術分析</h2>
                <p className="text-gray-600">
                  技術分析頁面內容 - 使用 {technicalAnalysis ? "真實" : "模擬"}{" "}
                  數據
                </p>
                {technicalError && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-800">
                      載入技術分析數據時出現問題: {String(technicalError)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "screener" && (
          <Screener
            favoriteStocks={favoriteStocks}
            toggleFavoriteStock={toggleFavoriteStock}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default StockMarket;
