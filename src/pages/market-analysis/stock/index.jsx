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

const StockMarket = () => {
  // 狀態管理
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStrategy, setSelectedStrategy] = useState("value");
  const [selectedSector, setSelectedSector] = useState("all");
  const [favoriteStocks, setFavoriteStocks] = useState(["2330"]);
  const [stockCompare, setStockCompare] = useState(() => {
    // 如果股票數據存在且有第一筆資料，則預選第一支股票
    if (marketData.stockDetails && marketData.stockDetails.length > 0) {
      return [marketData.stockDetails[0].symbol];
    }
    return [];
  });
  const [showComparison, setShowComparison] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("1M");
  const [customIndicatorOpen, setCustomIndicatorOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState("頭肩頂");
  const [newsFilter, setNewsFilter] = useState("latest");

  // 功能函數
  const toggleFavoriteStock = (symbol) => {
    if (favoriteStocks.includes(symbol)) {
      setFavoriteStocks(favoriteStocks.filter((s) => s !== symbol));
    } else {
      setFavoriteStocks([...favoriteStocks, symbol]);
    }
  };

  const toggleCompareStock = (symbol) => {
    if (stockCompare.includes(symbol)) {
      setStockCompare(stockCompare.filter((s) => s !== symbol));
    } else if (stockCompare.length < 3) {
      setStockCompare([...stockCompare, symbol]);
    }
  };

  // 處理表格排序
  const handleSort = (column) => {
    console.log("排序依據:", column);
    // 排序邏輯可以在這裡實現
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              stockDetails={marketData.stockDetails || []}
              favoriteStocks={favoriteStocks}
              toggleFavoriteStock={toggleFavoriteStock}
              showComparison={showComparison}
              setShowComparison={setShowComparison} // 新增的 prop
              toggleCompareStock={toggleCompareStock}
              stockCompare={stockCompare}
              handleSort={handleSort}
            />

            {/* 股票比較 */}
            {showComparison && stockCompare.length > 0 && (
              <StockComparison
                stockCompare={stockCompare}
                stockDetails={marketData.stockDetails || []}
                toggleCompareStock={toggleCompareStock}
                setStockCompare={setStockCompare} // 新增的 prop
              />
            )}

            {/* 個股詳細信息 */}
            {marketData.stockDetails && marketData.stockDetails[0] && (
              <StockDetails
                stock={marketData.stockDetails[0]}
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
      </div>
    </div>
  );
};

export default StockMarket;
