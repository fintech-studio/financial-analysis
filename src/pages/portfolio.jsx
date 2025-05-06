import React, { useState } from "react";
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ClockIcon,
  BellAlertIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  BookOpenIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import StockChart from "../components/Charts/StockChart";
import { Doughnut } from "react-chartjs-2";
import Summary from "../components/Portfolio/Summary";
import Recommendations from "../components/Portfolio/Recommendations";
import Performance from "../components/Portfolio/Performance";
import Backtest from "../components/Portfolio/Backtest";
import AssetAllocation from "../components/Portfolio/AssetAllocation";
import Notifications from "../components/Portfolio/Notifications";
import AIRecommendations from "../components/Portfolio/AIRecommendations";
import Holdings from "../components/Portfolio/Holdings";
import StockDetail from "../components/Portfolio/StockDetail";
import StrategySettings from "../components/Portfolio/StrategySettings";

// 註冊 Chart.js 元件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Portfolio = () => {
  // 更新為新的導航標籤系統
  const [activeTab, setActiveTab] = useState("overview");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [screenerFilters, setScreenerFilters] = useState({
    priceRange: { min: "", max: "" },
    marketCap: { min: "", max: "" },
    peRatio: { min: "", max: "" },
    dividendYield: { min: "", max: "" },
  });
  const [showStockDetail, setShowStockDetail] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  // 更新投資組合數據結構
  const portfolioData = {
    summary: {
      totalAssets: {
        value: "1,250,000",
        breakdown: {
          investment: "1,050,000",
          cash: "200,000",
        },
        cashRatio: "16%",
      },
      returns: {
        total: {
          value: "+125,000",
          percentage: "+11.11%",
        },
        annualized: {
          oneYear: "+15.2%",
          threeYear: "+32.5%",
          fiveYear: "+45.8%",
        },
      },
      changes: {
        daily: {
          value: "+12,500",
          percentage: "+1.01%",
        },
        weekly: {
          value: "+28,500",
          percentage: "+2.33%",
        },
        monthly: {
          value: "+45,000",
          percentage: "+3.74%",
        },
      },
      distribution: {
        byAssetType: [
          { type: "股票", percentage: "84%" },
          { type: "現金", percentage: "16%" },
        ],
        byIndustry: [
          { industry: "科技", percentage: "45%" },
          { industry: "金融", percentage: "25%" },
          { industry: "電信", percentage: "15%" },
          { industry: "其他", percentage: "15%" },
        ],
      },
    },
    holdings: [
      {
        symbol: "2330",
        name: "台積電",
        shares: 1000,
        avgPrice: "650",
        currentPrice: "785",
        value: "785,000",
        return: "+135,000",
        returnPercentage: "+20.77%",
      },
      {
        symbol: "2317",
        name: "鴻海",
        shares: 2000,
        avgPrice: "98",
        currentPrice: "105",
        value: "210,000",
        return: "+14,000",
        returnPercentage: "+7.14%",
      },
      {
        symbol: "2454",
        name: "聯發科",
        shares: 500,
        avgPrice: "950",
        currentPrice: "1085",
        value: "542,500",
        return: "+67,500",
        returnPercentage: "+14.21%",
      },
      {
        symbol: "2412",
        name: "中華電",
        shares: 1000,
        avgPrice: "110",
        currentPrice: "115",
        value: "115,000",
        return: "+5,000",
        returnPercentage: "+4.55%",
      },
    ],
    chartData: {
      dates: ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05"],
      values: [1125000, 1140000, 1160000, 1180000, 1250000],
    },
  };

  // 模擬股票篩選結果
  const screenerResults = [
    {
      symbol: "2330",
      name: "台積電",
      price: "785",
      marketCap: "20.3T",
      peRatio: "15.2",
      dividendYield: "2.1%",
    },
    {
      symbol: "2317",
      name: "鴻海",
      price: "105",
      marketCap: "1.4T",
      peRatio: "12.8",
      dividendYield: "3.5%",
    },
    {
      symbol: "2454",
      name: "聯發科",
      price: "1085",
      marketCap: "1.7T",
      peRatio: "18.5",
      dividendYield: "1.8%",
    },
    {
      symbol: "2412",
      name: "中華電",
      price: "115",
      marketCap: "0.9T",
      peRatio: "14.2",
      dividendYield: "4.2%",
    },
  ];

  // 新增投資組合分析數據
  const portfolioAnalysis = {
    riskMetrics: {
      beta: 1.15,
      sharpeRatio: 1.8,
      volatility: "15.2%",
      maxDrawdown: "-8.5%",
    },
    sectorAllocation: {
      labels: ["半導體", "電信", "金融", "其他"],
      data: [45, 25, 20, 10],
      colors: ["#4F46E5", "#06B6D4", "#10B981", "#6B7280"],
    },
    diversification: {
      score: 75,
      suggestion: "建議增加其他產業的配置以提高分散度",
    },
  };

  // 新增投資組合統計數據
  const portfolioStats = {
    monthlyPerformance: {
      returnRate: "+2.8%",
      benchmark: "+1.5%",
      alpha: "+1.3%",
    },
    riskIndicators: {
      volatility: "12.5%",
      beta: "0.92",
      sharpeRatio: "1.85",
      maxDrawdown: "-15.2%",
    },
    topHoldings: [
      { name: "台積電", weight: "25.3%", performance: "+12.5%" },
      { name: "聯發科", weight: "15.2%", performance: "+8.3%" },
      { name: "鴻海", weight: "12.8%", performance: "+5.2%" },
    ],
    aiPredictions: {
      shortTerm: { horizon: "1個月", prediction: "+3.2%", confidence: 75 },
      mediumTerm: { horizon: "3個月", prediction: "+8.5%", confidence: 65 },
      longTerm: { horizon: "1年", prediction: "+15.2%", confidence: 55 },
    },
    aiMetrics: {
      smartBeta: { score: 0.85, benchmark: 0.75 },
      sentiment: { score: 72, trend: "improving" },
      momentum: { score: 68, trend: "stable" },
    },
    riskMetrics: {
      volatility: "12.5%",
      beta: "0.92",
      sharpeRatio: "1.85",
      maxDrawdown: "-15.2%",
      stressTest: {
        marketCrash: -15.2,
        tradeWar: -8.5,
        rateHike: -5.2,
      },
    },
  };

  // 新增 AI 分析數據
  const aiAnalysisData = {
    marketAnalysis: {
      trend: "bullish",
      confidence: 85,
      keyFactors: [
        { factor: "市場氛圍", score: 75, trend: "improving" },
        { factor: "技術指標", score: 82, trend: "stable" },
        { factor: "基本面", score: 78, trend: "stable" },
      ],
    },
    portfolioOptimization: {
      suggestions: [
        { type: "rebalance", priority: "high", action: "調整科技股比重" },
        { type: "risk", priority: "medium", action: "增加防禦性資產" },
      ],
      expectedImprovement: {
        risk: -15,
        return: +8,
        sharpeRatio: +0.3,
      },
    },
    portfolioHealth: {
      score: 85,
      status: "健康",
      alerts: [
        { type: "risk", message: "投資組合風險偏高", severity: "warning" },
        { type: "opportunity", message: "市場機會出現", severity: "info" },
      ],
    },
    marketInsights: {
      overall: { trend: "bullish", confidence: 85 },
      sectors: [
        { name: "半導體", trend: "positive", strength: "strong" },
        { name: "金融", trend: "neutral", strength: "moderate" },
      ],
      opportunities: [
        { symbol: "2330", reason: "技術指標轉強", confidence: 85 },
        { symbol: "2317", reason: "評價具吸引力", confidence: 80 },
      ],
    },
    riskAnalysis: {
      concentration: {
        score: 65,
        issues: ["科技股比重過高", "單一持股超過30%"],
      },
      volatility: {
        score: 72,
        trend: "stable",
      },
      correlation: {
        score: 68,
        suggestion: "可增加非關聯性資產",
      },
    },
    aiPredictions: {
      portfolio: {
        nextMonth: { return: "+3.2%", confidence: 75 },
        nextQuarter: { return: "+8.5%", confidence: 65 },
      },
      market: {
        shortTerm: { trend: "sideways", probability: 0.65 },
        mediumTerm: { trend: "bullish", probability: 0.72 },
      },
    },
  };

  // 排序功能
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = parseFloat(a[sortConfig.key].replace(/[^0-9.-]/g, ""));
      const bValue = parseFloat(b[sortConfig.key].replace(/[^0-9.-]/g, ""));

      if (sortConfig.direction === "ascending") {
        return aValue - bValue;
      }
      return bValue - aValue;
    });
  };

  // 新增導航標籤配置
  const tabs = [
    { id: "overview", name: "投資組合總覽", icon: ChartPieIcon },
    { id: "allocation", name: "資產配置", icon: ScaleIcon },
    { id: "holdings", name: "持倉明細", icon: CurrencyDollarIcon },
    { id: "performance", name: "績效分析", icon: ArrowTrendingUpIcon },
    { id: "notifications", name: "異動提示", icon: BellAlertIcon },
    { id: "recommendations", name: "AI智能建議", icon: LightBulbIcon },
    { id: "backtest", name: "投資回測", icon: ArrowPathIcon },
    { id: "strategy", name: "投資策略", icon: AdjustmentsHorizontalIcon },
  ];

  // 處理選擇股票的函數
  const handleSelectStock = (stock) => {
    setSelectedStock({
      ...stock,
      aiAnalysis: {
        technical: {
          trend: "bullish",
          signals: [
            { indicator: "MACD", signal: "buy", strength: "strong" },
            { indicator: "RSI", signal: "neutral", strength: "moderate" },
          ],
        },
        fundamental: {
          score: 85,
          metrics: [
            { name: "ROE", value: "15.2%", evaluation: "good" },
            { name: "PEG", value: "1.2", evaluation: "fair" },
          ],
        },
        forecast: {
          targets: [
            { period: "3個月", price: 850, probability: 0.75 },
            { period: "1年", price: 920, probability: 0.65 },
          ],
          risks: ["市場波動", "產業競爭", "政策變動"],
        },
      },
    });
    setShowStockDetail(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題區 */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 md:h-20 flex items-center justify-between pt-4 md:pt-6">
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                我的投資組合
              </h1>
            </div>

            {/* 操作按鈕 */}
            <div className="flex items-center gap-2 md:gap-4">
              <button className="inline-flex items-center justify-center p-2 md:px-4 md:py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                <BanknotesIcon className="h-5 w-5 text-gray-600" />
                <span className="hidden md:inline ml-2">現金管理</span>
              </button>
              <button className="inline-flex items-center justify-center p-2 md:px-4 md:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                <PlusIcon className="h-5 w-5" />
                <span className="hidden md:inline ml-2">新增交易</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 導航標籤 - 使用橫向滾動 */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 md:top-20 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="overflow-x-auto scrollbar-none">
            <div className="flex px-4 sm:px-6 lg:px-8 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap
                    transition-colors duration-200
                    ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* 內容區域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <Summary data={portfolioData.summary} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                  <StockChart data={portfolioData.chartData} />
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <Recommendations />
                </div>
              </div>
            </div>
          )}

          {/* 其他分頁內容使用網格布局 */}
          {activeTab !== "overview" && (
            <div className="grid grid-cols-1 gap-6">
              {activeTab === "allocation" && (
                <AssetAllocation data={portfolioAnalysis} />
              )}
              {activeTab === "holdings" && (
                <Holdings
                  data={portfolioData}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                  onSelectStock={handleSelectStock}
                />
              )}
              {activeTab === "performance" && (
                <Performance stats={portfolioStats} />
              )}
              {activeTab === "notifications" && <Notifications />}
              {activeTab === "recommendations" && (
                <AIRecommendations
                  data={aiAnalysisData}
                  portfolio={portfolioData}
                  stats={portfolioStats}
                />
              )}
              {activeTab === "backtest" && <Backtest />}
              {activeTab === "strategy" && <StrategySettings />}
            </div>
          )}
        </div>
      </main>

      {/* 股票詳情彈窗 */}
      {showStockDetail && selectedStock && (
        <StockDetail
          stockInfo={selectedStock}
          onClose={() => {
            setShowStockDetail(false);
            setSelectedStock(null);
          }}
        />
      )}
    </div>
  );
};

export default Portfolio;
