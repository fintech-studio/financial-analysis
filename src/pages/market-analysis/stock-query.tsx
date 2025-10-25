import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import SearchBar from "@/components/pages/stock-query/SearchBar";
import TradingCard from "@/components/pages/stock-query/TradingCard";
import ChartContainer from "@/components/pages/stock-query/ChartContainer";
import DataTable from "@/components/pages/stock-query/DataTable";
import LoadingSpinner from "@/components/pages/stock-query/LoadingSpinner";
import {
  EmptyState,
  ErrorState,
} from "@/components/pages/stock-query/StateComponents";
import { useStockData } from "@/hooks/useStockData";
import { ChartBarIcon, TableCellsIcon } from "@heroicons/react/24/outline";
import TechnicalAnalysisPanel from "@/components/pages/stock-query/TechnicalAnalysisPanel";
import KLinePattern from "@/components/pages/stock-query/KLinePattern";
import AIInsights from "@/components/pages/stock-query/AIInsights";
import type { MarketType } from "@/components/pages/stock-query/SearchBar";
import Footer from "@/components/Layout/Footer";

// 型別與預設值集中
const VIEW_OPTIONS = [
  {
    key: "chart",
    label: "圖表",
    icon: <ChartBarIcon className="h-5 w-5 inline-block align-text-bottom" />,
  },
  {
    key: "table",
    label: "數據",
    icon: <TableCellsIcon className="h-5 w-5 inline-block align-text-bottom" />,
  },
] as const;
type ViewType = (typeof VIEW_OPTIONS)[number]["key"];
const DEFAULT_TIMEFRAME = "1d";
const DEFAULT_PERIOD = "1Y";

type Timeframe = "1d" | "1h";
type DataPeriod = "YTD" | "1M" | "3M" | "6M" | "1Y" | "ALL";

const StockAnalysisPage: React.FC = () => {
  const [queryState, setQueryState] = useState<{
    symbol: string;
    market: MarketType;
  }>({
    symbol: "",
    market: "market_stock_tw",
  });
  const [activeView, setActiveView] = useState<ViewType>("chart");
  const [timeframe, setTimeframe] = useState<Timeframe>(DEFAULT_TIMEFRAME);
  const [dataPeriod, setDataPeriod] = useState<DataPeriod>(DEFAULT_PERIOD);

  const {
    data,
    loading,
    error,
    stats,
    candlestickData,
    technicalData,
    refetch,
    clearError,
  } = useStockData(queryState.symbol, timeframe, queryState.market);

  // useCallback 依賴優化
  const handleSymbolChange = useCallback((symbol: string) => {
    setQueryState((q) => ({ ...q, symbol }));
  }, []);

  const handleMarketChange = useCallback((market: MarketType) => {
    setQueryState((q) => ({ ...q, market }));
  }, []);

  const handleSymbolAndMarketChange = useCallback(
    (symbol: string, market: MarketType) => {
      setQueryState({ symbol, market });
    },
    []
  );

  const handleTimeframeChange = useCallback((tf: Timeframe) => {
    setTimeframe(tf);
  }, []);

  const handleDataPeriodChange = useCallback((period: DataPeriod) => {
    setDataPeriod(period);
  }, []);

  // 取最新一根K線
  const latest = useMemo(
    () => candlestickData?.slice(-1)[0],
    [candlestickData]
  );

  // KLinePattern 與 TechnicalAnalysisPanel 統一渲染
  const renderPatternAndPanel = useCallback(
    () => (
      <>
        <KLinePattern
          data={data}
          loading={loading}
          error={error}
          symbol={queryState.symbol}
          timeframe={timeframe}
          market={queryState.market}
        />
        <TechnicalAnalysisPanel
          technicalData={technicalData}
          symbol={queryState.symbol}
          timeframe={timeframe}
          open_price={latest?.open}
          high_price={latest?.high}
          low_price={latest?.low}
          close_price={latest?.close}
          volume={latest?.volume}
          loading={loading}
          candlestickData={candlestickData}
        />
        {/* AI 分析與見解 */}
        <div className="mt-4">
          <AIInsights
            // model="fincoach"
            data={latest}
            symbol={queryState.symbol}
            timeframe={timeframe}
            open_price={latest?.open}
            high_price={latest?.high}
            low_price={latest?.low}
            close_price={latest?.close}
            volume={latest?.volume}
            technicalData={technicalData}
            candlestickData={candlestickData}
            nCandles={30} // 使用最近 30 根 K 線進行分析
            debug={false} // 啟用除錯模式以顯示更多資訊
          />
        </div>
      </>
    ),
    [
      latest,
      candlestickData,
      technicalData,
      queryState.symbol,
      timeframe,
      loading,
      queryState.market,
      data,
      error,
    ]
  );

  // renderContent 拆分
  const renderContent = useCallback(() => {
    if (loading) return <LoadingSpinner />;
    if (error)
      return (
        <ErrorState error={error} onRetry={refetch} onClear={clearError} />
      );
    if (!data || data.length === 0)
      return <EmptyState onQuickSelect={handleSymbolChange} />;
    switch (activeView) {
      case "chart":
        return (
          <>
            <ChartContainer
              data={candlestickData}
              technicalData={technicalData}
              symbol={queryState.symbol}
              timeframe={timeframe}
            />
            {renderPatternAndPanel()}
          </>
        );
      case "table":
        return (
          <>
            <DataTable
              data={data}
              timeframe={timeframe}
              symbol={queryState.symbol}
            />
            {renderPatternAndPanel()}
          </>
        );
      default:
        return null;
    }
  }, [
    loading,
    error,
    data,
    activeView,
    candlestickData,
    technicalData,
    queryState.symbol,
    timeframe,
    refetch,
    clearError,
    handleSymbolChange,
    renderPatternAndPanel,
  ]);
  return (
    <>
      {/* Header Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center overflow-hidden shadow-2xl">
        {/* 動態網格背景 */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Enhanced Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-12 left-12 w-24 h-24 bg-white opacity-5 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-12 right-24 w-36 h-36 bg-white opacity-5 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial from-white/10 to-transparent rounded-full"></div>

          {/* Enhanced floating elements */}
          <div className="absolute top-24 right-12 w-4 h-4 bg-white opacity-20 rounded-full animate-bounce"></div>
          <div
            className="absolute bottom-24 left-24 w-3 h-3 bg-white opacity-30 rounded-full animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
          <div
            className="absolute top-48 left-1/4 w-5 h-5 bg-white opacity-15 rounded-full animate-bounce"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-32 right-1/3 w-2 h-2 bg-white opacity-25 rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 z-10 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm mr-6 group hover:bg-white/20 transition-all duration-300 shadow-lg">
                  <ChartBarIcon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                    技術分析
                  </h1>
                  <p className="text-blue-200 mt-3 text-xl font-medium">
                    深入洞察市場趨勢
                  </p>
                </div>
              </div>
              <p className="text-blue-200 text-xl max-w-3xl leading-relaxed">
                利用先進的技術指標和圖表模式，深入分析股票走勢，幫助投資者做出明智決策。
              </p>
            </div>

            {/* Enhanced Statistics Panel */}
            <div className="flex flex-col lg:items-end space-y-4">
              <div className="grid grid-cols-1 gap-6 lg:gap-8">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-3xl font-bold text-white">yahoo</div>
                  <div className="text-blue-200 text-sm font-medium">
                    市場數據來源
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* 搜索欄 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <SearchBar
              symbol={queryState.symbol}
              onSymbolChange={handleSymbolChange}
              timeframe={timeframe}
              onTimeframeChange={handleTimeframeChange}
              loading={loading}
              dataPeriod={dataPeriod}
              onDataPeriodChange={handleDataPeriodChange}
              market={queryState.market}
              onMarketChange={handleMarketChange}
              onSymbolAndMarketChange={handleSymbolAndMarketChange}
            />
          </motion.div>

          {/* 視圖切換 */}
          {data && data.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                <div className="flex space-x-1">
                  {VIEW_OPTIONS.map((view) => (
                    <motion.button
                      key={view.key}
                      onClick={() => setActiveView(view.key as ViewType)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeView === view.key
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span className="mr-2">{view.icon}</span>
                      {view.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 交易卡片 */}
          {stats && data && data.length > 0 && !loading && !error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <TradingCard
                symbol={queryState.symbol}
                stats={stats}
                timeframe={timeframe}
              />
            </motion.div>
          ) : null}

          {/* 主要內容區域 */}
          {renderContent()}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default StockAnalysisPage;
