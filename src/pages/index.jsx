import React, { useState } from "react";
import {
  marketOverview,
  marketSentiment,
  sectorPerformance,
  marketNews,
  hotStocks,
  activeStocks,
  recommendedStocks,
  chartData,
  latestNews,
} from "../data/index"; // Adjust the import path as necessary
import ActiveStocksSection from "@/components/ActiveStocks/ActiveStocksSection";
import NewsSection from "@/components/News/NewsSection";
import TrendChart from "@/components/MarketTrends/TrendChart";
import HotStockTable from "@/components/HotStocks/HotStockTable";
import IndustrySection from "@/components/Industry/IndustrySection";
import EducationSection from "@/components/Education/EducationSection";
import NFTSection from "@/components/NFT/NFTSection";
import RecommendationsSection from "@/components/Recommendations/RecommendationsSection";
import SentimentSection from "@/components/MarketSentiment/SentimentSection";
import MarketOverviewSection from "@/components/MarketOverview/MarketOverviewSection";
import { EDUCATION_CONTENTS } from "@/constants/educationConfig";
import { NEWS_SECTION_CONFIG } from "@/constants/newsConfig";
import PageSection from "@/components/Layout/PageSection";

const HomePage = () => {
  const [timeRange, setTimeRange] = useState("1d");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [showAllNews, setShowAllNews] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <PageSection>
        <MarketOverviewSection data={marketOverview} />
      </PageSection>

      <ActiveStocksSection stocks={activeStocks} />

      <SentimentSection sentiment={marketSentiment} />

      <NewsSection
        marketNews={marketNews}
        latestNews={latestNews}
        selectedCategory={selectedCategory}
        showAllNews={showAllNews}
        onCategoryChange={setSelectedCategory}
        onToggleShowAll={() => setShowAllNews(!showAllNews)}
        config={NEWS_SECTION_CONFIG}
      />

      <TrendChart
        data={chartData}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        changePercent={marketOverview.stock.changePercent}
        change={marketOverview.stock.change}
      />

      <HotStockTable stocks={hotStocks} />

      <RecommendationsSection stocks={recommendedStocks} />

      <IndustrySection sectors={sectorPerformance} />

      <EducationSection contents={EDUCATION_CONTENTS} />
    </div>
  );
};

export default HomePage;
