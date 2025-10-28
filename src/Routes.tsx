import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/index";
import Portfolio from "./pages/portfolio";
import MarketAnalysisPage from "./pages/market-analysis";
import StockQueryPage from "./pages/market-analysis/technical";
import FundamentalPage from "./pages/market-analysis/fundamental";
import TradeSignalsPage from "./pages/market-analysis/trade-signals";
import BacktestingPage from "./pages/market-analysis/backtesting";
import FinancialCodePage from "./pages/market-analysis/financial-code";
import PsychologyPage from "./pages/psychology";
import Education from "./pages/education";
import Community from "./pages/community";
import NewsPage from "./pages/news";
import ChatPage from "./pages/chat";
import PredictPage from "./pages/predict";

const AppRoutes = (): React.JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/market-analysis" element={<MarketAnalysisPage />}>
        <Route path="stock-query" element={<StockQueryPage />} />
        <Route path="fundamental" element={<FundamentalPage />} />
        <Route path="trade-signals" element={<TradeSignalsPage />} />
        <Route path="backtesting" element={<BacktestingPage />} />
        <Route path="financial-code" element={<FinancialCodePage />} />
      </Route>
      <Route path="/psychology" element={<PsychologyPage />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/education" element={<Education />} />
      <Route path="/community" element={<Community />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/predict" element={<PredictPage />} />
    </Routes>
  );
};

export default AppRoutes;
