import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/index";
import Portfolio from "./pages/portfolio";
import StockAnalysis from "./pages/market-analysis/stock";
import CryptoAnalysis from "./pages/market-analysis/crypto";
import GlobalMarket from "./pages/market-analysis/global";
import Education from "./pages/education";
import Community from "./pages/community";
import NewsPage from "./pages/news";
import AIPredictionPage from "./pages/ai-prediction";

const AppRoutes = (): React.JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/market-analysis">
        <Route path="stock" element={<StockAnalysis />} />
        <Route path="crypto" element={<CryptoAnalysis />} />
        <Route path="global" element={<GlobalMarket />} />
      </Route>
      <Route path="/ai-prediction" element={<AIPredictionPage />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/education" element={<Education />} />
      <Route path="/community" element={<Community />} />
      <Route path="/news" element={<NewsPage />} />
    </Routes>
  );
};

export default AppRoutes;
