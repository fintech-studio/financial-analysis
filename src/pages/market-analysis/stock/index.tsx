import React, { useState } from "react";
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
import { marketData, analysisModules } from "@/data/marketData";

// 引入組件
import Overview from "@/components/features/StockMarket/Overview";
import StockList from "@/components/features/StockMarket/StockList";
import StockComparison from "@/components/features/StockMarket/StockComparison";
import StockDetails from "@/components/features/StockMarket/StockDetails";
import TechnicalPatterns from "@/components/features/StockMarket/TechnicalPatterns";
import Screener from "@/components/features/StockMarket/Screener";

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
  // 狀態管理
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStrategy, setSelectedStrategy] =
    useState<StrategyType>("value");
  const [selectedSector, setSelectedSector] = useState<SectorType>("all");
  const [favoriteStocks, setFavoriteStocks] = useState<string[]>(["2330"]);

  // 將 marketData.stockDetails 轉換為 StockList 組件期望的格式
  const transformedStockDetails: StockDetailForList[] =
    marketData.stockDetails?.map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      price:
        typeof stock.price === "number"
          ? `$${stock.price.toFixed(2)}`
          : String(stock.price),
      change: stock.change,
      changePercent: stock.change,
      industry: "科技業", // 預設值，可以根據需要調整
      volume: stock.volume || "N/A",
      pe: stock.pe || "N/A",
      dividend: stock.dividendYield || "N/A",
      dividendYield: stock.dividendYield || "N/A",
    })) || [];

  // 將資料轉換為 StockComparison 組件期望的格式
  const transformedStocksForComparison: StockForComparison[] =
    marketData.stockDetails?.map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      price:
        typeof stock.price === "number"
          ? stock.price
          : parseFloat(String(stock.price)) || 0,
      pe: stock.pe ? parseFloat(String(stock.pe)) : undefined,
      pb: stock.pb ? parseFloat(String(stock.pb)) : undefined,
      dividend: stock.dividendYield,
      marketCap: stock.marketCap,
      volume: stock.volume,
      high52w: stock.high52w,
      low52w: stock.low52w,
    })) || [];

  // 將資料轉換為 StockDetails 組件期望的格式
  const transformedStockForDetails: StockForDetails | null =
    marketData.stockDetails && marketData.stockDetails[0]
      ? {
          symbol: marketData.stockDetails[0].symbol,
          name: marketData.stockDetails[0].name,
          price:
            typeof marketData.stockDetails[0].price === "number"
              ? marketData.stockDetails[0].price.toString()
              : String(marketData.stockDetails[0].price),
          change: marketData.stockDetails[0].change,
          changePercent: marketData.stockDetails[0].change,
          open: marketData.stockDetails[0].open || "0",
          high: marketData.stockDetails[0].high || "0",
          low: marketData.stockDetails[0].low || "0",
          volume: marketData.stockDetails[0].volume || "N/A",
          pe: marketData.stockDetails[0].pe || "N/A",
          pb: marketData.stockDetails[0].pb || "N/A",
          dividend: marketData.stockDetails[0].dividendYield,
          dividendYield: marketData.stockDetails[0].dividendYield,
          priceHistory: marketData.stockDetails[0].priceHistory,
        }
      : null;

  const [stockCompare, setStockCompare] = useState<string[]>(() => {
    // 如果股票數據存在且有第一筆資料，則預選第一支股票
    if (transformedStockDetails && transformedStockDetails.length > 0) {
      return [transformedStockDetails[0].symbol];
    }
    return [];
  });
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRangeType>("1M");
  const [customIndicatorOpen, setCustomIndicatorOpen] =
    useState<boolean>(false);
  const [selectedPattern, setSelectedPattern] = useState<string>("頭肩頂");
  const [newsFilter, setNewsFilter] = useState<NewsFilterType>("latest");

  // 功能函數
  const toggleFavoriteStock = (symbol: string): void => {
    if (favoriteStocks.includes(symbol)) {
      setFavoriteStocks(favoriteStocks.filter((s) => s !== symbol));
    } else {
      setFavoriteStocks([...favoriteStocks, symbol]);
    }
  };

  const toggleCompareStock = (symbol: string): void => {
    if (stockCompare.includes(symbol)) {
      setStockCompare(stockCompare.filter((s) => s !== symbol));
    } else if (stockCompare.length < 3) {
      setStockCompare([...stockCompare, symbol]);
    }
  };

  // 處理表格排序
  const handleSort = (column: string): void => {
    console.log("排序依據:", column);
    // 排序邏輯可以在這裡實現
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 頁面標題與搜尋框 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            {/* 標題 */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">股票市場分析</h1>
            </div>

            {/* 搜尋與時間範圍 */}
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              {/* 搜尋框 */}
              <div className="relative flex-1 min-w-[240px]">
                <input
                  type="text"
                  placeholder="搜尋股票代號或名稱..."
                  className="w-full pl-10 pr-4 py-2 border border-white border-opacity-30 bg-white bg-opacity-20 rounded-full focus:ring-2 focus:ring-white focus:bg-white focus:bg-opacity-90 text-white focus:text-gray-900 placeholder-white placeholder-opacity-70"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-white absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          {/* 導航標籤 */}
          <div className="mt-6">
            <nav className="flex space-x-6 overflow-x-auto pb-2 scrollbar-hide">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === "overview"
                    ? "bg-white text-indigo-700"
                    : "text-white hover:bg-white hover:bg-opacity-10"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                市場概覽
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === "stocks"
                    ? "bg-white text-indigo-700"
                    : "text-white hover:bg-white hover:bg-opacity-10"
                }`}
                onClick={() => setActiveTab("stocks")}
              >
                個股分析
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === "sectors"
                    ? "bg-white text-indigo-700"
                    : "text-white hover:bg-white hover:bg-opacity-10"
                }`}
                onClick={() => setActiveTab("sectors")}
              >
                產業分析
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === "technical"
                    ? "bg-white text-indigo-700"
                    : "text-white hover:bg-white hover:bg-opacity-10"
                }`}
                onClick={() => setActiveTab("technical")}
              >
                技術分析
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === "screener"
                    ? "bg-white text-indigo-700"
                    : "text-white hover:bg-white hover:bg-opacity-10"
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
          <Overview marketData={marketData} analysisModules={analysisModules} />
        )}

        {activeTab === "stocks" && (
          <div className="space-y-8">
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
              bullishStocks={marketData.technicalScreener?.bullish || []}
              bearishStocks={marketData.technicalScreener?.bearish || []}
              selectedPattern={selectedPattern}
              setSelectedPattern={setSelectedPattern}
            />
          </div>
        )}

        {/* 其他選項卡內容... */}
        {activeTab === "sectors" && <div>產業分析頁面內容</div>}
        {activeTab === "technical" && <div>技術分析頁面內容</div>}
        {activeTab === "screener" && (
          <Screener
            favoriteStocks={favoriteStocks}
            toggleFavoriteStock={toggleFavoriteStock}
          />
        )}
      </div>
    </div>
  );
};

export default StockMarket;
