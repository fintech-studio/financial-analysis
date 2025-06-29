import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/Stock/SearchBar";
import TradingCard from "@/components/Stock/TradingCard";
import ChartContainer from "@/components/Stock/ChartContainer";
import DataTable from "@/components/Stock/DataTable";
import LoadingSpinner from "@/components/Stock/LoadingSpinner";
import { EmptyState, ErrorState } from "@/components/Stock/StateComponents";
import { useStockData } from "@/hooks/useStockData";
import { ChartBarIcon, TableCellsIcon } from "@heroicons/react/24/outline";
import TechnicalAnalysisPanel from "@/components/Stock/TechnicalAnalysisPanel";
import type { MarketType } from "@/components/Stock/SearchBar";

type ViewType = "chart" | "table";

const StockAnalysisPage: React.FC = () => {
  const [queryState, setQueryState] = useState<{
    symbol: string;
    market: MarketType;
  }>({
    symbol: "",
    market: "market_stock_tw",
  });
  const [activeView, setActiveView] = useState<ViewType>("chart");
  const [timeframe, setTimeframe] = useState<"1d" | "1h">("1d");
  const [dataPeriod, setDataPeriod] = useState<
    "YTD" | "1M" | "3M" | "6M" | "1Y" | "ALL"
  >("1Y");

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

  const handleTimeframeChange = useCallback((tf: "1d" | "1h") => {
    setTimeframe(tf);
  }, []);

  const handleDataPeriodChange = useCallback(
    (period: "YTD" | "1M" | "3M" | "6M" | "1Y" | "ALL") => {
      setDataPeriod(period);
    },
    []
  );

  const views = useMemo(
    () => [
      {
        key: "chart",
        label: "圖表",
        icon: (
          <ChartBarIcon className="h-5 w-5 inline-block align-text-bottom" />
        ),
      },
      {
        key: "table",
        label: "數據",
        icon: (
          <TableCellsIcon className="h-5 w-5 inline-block align-text-bottom" />
        ),
      },
    ],
    []
  );

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
            <TechnicalAnalysisPanel
              technicalData={technicalData}
              symbol={queryState.symbol}
              timeframe={timeframe}
              close_price={candlestickData?.slice(-1)[0]?.close} // 使用最新的收盤價
            />
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
            <TechnicalAnalysisPanel
              technicalData={technicalData}
              symbol={queryState.symbol}
              timeframe={timeframe}
              close_price={candlestickData?.slice(-1)[0]?.close} // 使用最新的收盤價
            />
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
  ]);

  return (
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
                {views.map((view) => (
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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StockAnalysisPage;
