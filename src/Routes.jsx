import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/index";
import Portfolio from "./pages/portfolio";
import StockAnalysis from "./pages/market-analysis/stock";
import CryptoAnalysis from "./pages/market-analysis/crypto";
import GlobalMarket from "./pages/market-analysis/global";
import Education from "./pages/education";
import Community from "./pages/community";
import Settings from "./pages/settings";
import Profile from "./pages/profile";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/market-analysis">
        <Route path="stock" element={<StockAnalysis />} />
        <Route path="crypto" element={<CryptoAnalysis />} />
        <Route path="global" element={<GlobalMarket />} />
      </Route>
      <Route path="/education" element={<Education />} />
      <Route path="/community" element={<Community />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
};

export default AppRoutes;
