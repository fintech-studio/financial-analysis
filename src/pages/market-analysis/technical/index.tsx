import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import SearchBar from "@/components/PageComponents/TechnicalAnalysis/SearchBar";
import TradingCard from "@/components/PageComponents/TechnicalAnalysis/TradingCard";
import ChartContainer from "@/components/PageComponents/TechnicalAnalysis/ChartContainer";
import DataTable from "@/components/PageComponents/TechnicalAnalysis/DataTable";
import LoadingSpinner from "@/components/PageComponents/TechnicalAnalysis/LoadingSpinner";
import {
  EmptyState,
  ErrorState,
} from "@/components/PageComponents/TechnicalAnalysis/StateComponents";
import { useStockData } from "@/hooks/useStockData";
import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import TechnicalAnalysisPanel from "@/components/PageComponents/TechnicalAnalysis/TechnicalAnalysisPanel";
import KLinePattern from "@/components/PageComponents/TechnicalAnalysis/KLinePattern";
import AIInsights from "@/components/PageComponents/TechnicalAnalysis/AIInsights";
import type { MarketType } from "@/components/PageComponents/TechnicalAnalysis/SearchBar";
import Footer from "@/components/Layout/Footer";
import PageHeader from "@/components/Layout/PageHeader";

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
            model="FinCoach"
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

  const Icon = ArrowTrendingUpIcon;
  const Title = "技術分析";
  const Subtitle = "深入洞察市場趨勢";
  const Description =
    "提供完整的技術分析工具，助您洞察市場趨勢，做出明智的投資決策";
  const panelTitle = "FinCoach";
  const panelSubtitle = "投資心教練";

  return (
    <>
      <PageHeader
        icon={Icon}
        title={Title}
        subtitle={Subtitle}
        description={Description}
        panelTitle={panelTitle}
        panelSubtitle={panelSubtitle}
      />

      <div className="min-h-screen bg-slate-50">
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
      </div>

      <Footer />
    </>
  );
};

export default StockAnalysisPage;
