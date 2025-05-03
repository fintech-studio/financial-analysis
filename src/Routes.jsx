import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/index';
import Portfolio from './pages/portfolio';
import StockAnalysis from './pages/market-analysis/stock';
import CryptoAnalysis from './pages/market-analysis/crypto';
import GlobalMarket from './pages/market-analysis/global';
import MarketSentiment from './pages/market-analysis/market-sentiment';
import RealEstateMarket from './pages/market-analysis/real-estate';
import GoldMarket from './pages/market-analysis/gold';
import OilMarket from './pages/market-analysis/oil';
import FuturesMarket from './pages/market-analysis/futures';
import Education from './pages/education';
import Community from './pages/community';
import Settings from './pages/settings';
import Profile from './pages/profile';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/market-analysis">
        <Route path="stock" element={<StockAnalysis />} />
        <Route path="crypto" element={<CryptoAnalysis />} />
        <Route path="global" element={<GlobalMarket />} />
        <Route path="market-sentiment" element={<MarketSentiment />} />
        <Route path="real-estate" element={<RealEstateMarket />} />
        <Route path="gold" element={<GoldMarket />} />
        <Route path="oil" element={<OilMarket />} />
        <Route path="futures" element={<FuturesMarket />} />
      </Route>
      <Route path="/education" element={<Education />} />
      <Route path="/community" element={<Community />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
};

export default AppRoutes; 