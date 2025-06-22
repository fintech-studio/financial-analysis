import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/Stock/SearchBar";
import TradingCard from "@/components/Stock/TradingCard";
import ChartContainer from "@/components/Stock/ChartContainer";
import DataTable from "@/components/Stock/DataTable";
import LoadingSpinner from "@/components/Stock/LoadingSpinner";
import { EmptyState, ErrorState } from "@/components/Stock/StateComponents";
import { useStockData } from "@/hooks/useStockData";

const StockAnalysisPage: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("2330");
  const [activeView, setActiveView] = useState<"chart" | "table" | "analytics">(
    "chart"
  );
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
  } = useStockData(selectedSymbol, timeframe);

  const handleSymbolChange = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
  }, []);

  const handleTimeframeChange = useCallback((tf: "1d" | "1h") => {
    setTimeframe(tf);
  }, []);

  const views = useMemo(
    () => [
      { key: "chart", label: "圖表", icon: "📊" },
      { key: "table", label: "數據", icon: "📋" },
    ],
    []
  );

  const renderContent = useMemo(() => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <ErrorState error={error} onRetry={refetch} onClear={clearError} />
      );
    }

    if (!data || data.length === 0) {
      return <EmptyState onQuickSelect={handleSymbolChange} />;
    }

    switch (activeView) {
      case "chart":
        return (
          <ChartContainer
            data={candlestickData}
            technicalData={technicalData}
            symbol={selectedSymbol}
            timeframe={timeframe}
          />
        );
      case "table":
        return <DataTable data={data} timeframe={timeframe} />;
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
    selectedSymbol,
    timeframe,
    refetch,
    clearError,
    handleSymbolChange,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 簡約標題區域 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-8"
        >
          <h1 className="text-4xl font-light text-gray-900 mb-3">
            股票分析平台
          </h1>
          <p className="text-gray-600 text-lg font-light max-w-xl mx-auto">
            專業技術分析與智能投資建議
          </p>
        </motion.div>

        {/* 搜索欄 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SearchBar
            symbol={selectedSymbol}
            onSymbolChange={handleSymbolChange}
            timeframe={timeframe}
            onTimeframeChange={handleTimeframeChange}
            loading={loading}
            onSearch={refetch}
            dataPeriod={dataPeriod}
            onDataPeriodChange={setDataPeriod}
          />
        </motion.div>

        {/* 交易卡片 */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <TradingCard
              symbol={selectedSymbol}
              stats={stats}
              timeframe={timeframe}
            />
          </motion.div>
        )}

        {/* 簡約視圖切換 */}
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
                    onClick={() => setActiveView(view.key as any)}
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

        {/* 主要內容區域 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StockAnalysisPage;
