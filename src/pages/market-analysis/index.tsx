import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  GlobeAltIcon,
  BoltIcon,
  LightBulbIcon,
  FireIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";
import Footer from "@/components/Layout/Footer";

// MVC 架構引入
import { MarketController } from "../../controllers/MarketController";
import { UserController } from "../../controllers/UserController";
import {
  MarketOverview,
  MarketSentiment,
  MarketNews,
  HotStock,
  SectorPerformance,
} from "../../types/market";
import { MarketAnalytics, MarketTrend } from "../../models/MarketModel";
import { User } from "../../models/UserModel";

interface MarketData {
  index?: string;
  change?: string;
  changePercent?: string;
  trend?: string;
  volume?: string;
  highlights?: string;
  btc?: string;
  dominance?: string;
  dow?: string;
  vix?: string;
  status?: string;
  strength?: string;
}

interface AnalysisModule {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  data: MarketData;
  color: string;
  bgColor: string;
}

const MarketAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // MVC 架構相關狀態
  const [user, setUser] = useState<User | null>(null);
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(
    null
  );
  const [marketSentiment, setMarketSentiment] =
    useState<MarketSentiment | null>(null);
  const [marketNews, setMarketNews] = useState<MarketNews[]>([]);
  const [hotStocks, setHotStocks] = useState<HotStock[]>([]);
  const [sectorPerformance, setSectorPerformance] = useState<
    SectorPerformance[]
  >([]);
  const [marketAnalytics, setMarketAnalytics] =
    useState<MarketAnalytics | null>(null);
  const [marketTrend, setMarketTrend] = useState<MarketTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // 控制器實例
  const marketController = MarketController.getInstance();
  const userController = UserController.getInstance();

  // 載入初始數據
  const loadMarketData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = "user_001"; // 模擬用戶 ID

      // 並行載入所有市場數據
      const [
        userResult,
        overviewResult,
        sentimentResult,
        newsResult,
        hotStocksResult,
        sectorResult,
        analyticsResult,
        trendResult,
      ] = await Promise.allSettled([
        userController.getUserProfile(userId),
        marketController.getMarketOverview(),
        marketController.getMarketSentiment(),
        marketController.getMarketNews(10),
        marketController.getHotStocks(),
        marketController.getSectorPerformance(),
        marketController.getMarketAnalytics(),
        marketController.getMarketTrend("1d"),
      ]);

      // 處理各項結果
      if (userResult.status === "fulfilled") {
        setUser(userResult.value);
      }

      if (overviewResult.status === "fulfilled") {
        setMarketOverview(overviewResult.value);
      } else {
        console.error("載入市場概覽失敗:", overviewResult.reason);
      }

      if (sentimentResult.status === "fulfilled") {
        setMarketSentiment(sentimentResult.value);
      } else {
        console.error("載入市場情緒失敗:", sentimentResult.reason);
      }

      if (newsResult.status === "fulfilled") {
        setMarketNews(newsResult.value);
      } else {
        console.error("載入市場新聞失敗:", newsResult.reason);
      }

      if (hotStocksResult.status === "fulfilled") {
        setHotStocks(hotStocksResult.value);
      } else {
        console.error("載入熱門股票失敗:", hotStocksResult.reason);
      }

      if (sectorResult.status === "fulfilled") {
        setSectorPerformance(sectorResult.value);
      } else {
        console.error("載入板塊表現失敗:", sectorResult.reason);
      }

      if (analyticsResult.status === "fulfilled") {
        setMarketAnalytics(analyticsResult.value);
      } else {
        console.error("載入市場分析失敗:", analyticsResult.reason);
      }

      if (trendResult.status === "fulfilled") {
        setMarketTrend(trendResult.value);
      } else {
        console.error("載入市場趨勢失敗:", trendResult.reason);
      }

      setLastUpdate(new Date().toLocaleString("zh-TW"));
    } catch (error) {
      setError(error instanceof Error ? error.message : "載入數據失敗");
    } finally {
      setLoading(false);
    }
  }, [userController, marketController]);

  useEffect(() => {
    loadMarketData();
  }, [loadMarketData]);

  const handleRefreshData = async () => {
    try {
      await marketController.refreshMarketData();
      await loadMarketData();
    } catch (error) {
      console.error("刷新數據失敗:", error);
      setError(error instanceof Error ? error.message : "刷新失敗");
    }
  };

  // 模擬數據映射（從 MVC 數據生成）
  const marketData = React.useMemo(() => {
    if (!marketOverview || !marketSentiment) {
      return {
        stock: {
          index: "載入中...",
          change: "...",
          changePercent: "...",
          trend: "載入中",
          volume: "...",
          highlights: "載入中...",
        },
        crypto: {
          btc: "載入中...",
          change: "...",
          changePercent: "...",
          volume: "...",
          dominance: "...",
          highlights: "載入中...",
        },
        global: {
          dow: "載入中...",
          change: "...",
          changePercent: "...",
          trend: "載入中",
          vix: "...",
          highlights: "載入中...",
        },
        sentiment: {
          index: "載入中",
          status: "載入中",
          strength: "載入中",
          change: "...",
          highlights: "載入中...",
        },
      };
    }

    // 找到對應的市場指數
    const taiexIndex = marketOverview.indices?.find(
      (index) => index.symbol === "TAIEX" || index.name.includes("加權")
    );
    const dowIndex = marketOverview.indices?.find(
      (index) => index.symbol === "DJI" || index.name.includes("道瓊")
    );
    const cryptoIndex = marketOverview.indices?.find(
      (index) => index.symbol === "BTC" || index.name.includes("比特幣")
    );

    return {
      stock: {
        index: taiexIndex?.value || marketOverview.stock?.value || "17,935",
        change: taiexIndex?.change || marketOverview.stock?.change || "+125",
        changePercent:
          taiexIndex?.changePercent ||
          marketOverview.stock?.changePercent ||
          "+0.70%",
        trend:
          marketTrend?.direction === "up"
            ? "上漲"
            : marketTrend?.direction === "down"
            ? "下跌"
            : "持平",
        volume:
          marketAnalytics?.totalVolume ||
          marketOverview.stock?.volume ||
          "2,835億",
        highlights:
          marketOverview.stock?.highlights ||
          "科技股帶動大盤上漲，AI概念股表現強勁",
      },
      crypto: {
        btc: cryptoIndex?.value || marketOverview.crypto?.value || "65,280",
        change:
          cryptoIndex?.change || marketOverview.crypto?.change || "+1,250",
        changePercent:
          cryptoIndex?.changePercent ||
          marketOverview.crypto?.changePercent ||
          "+1.95%",
        volume: "485億",
        dominance: marketOverview.crypto?.dominance || "52.3%",
        highlights:
          marketOverview.crypto?.highlights ||
          "比特幣突破65,000美元，機構投資需求增加",
      },
      global: {
        dow: dowIndex?.value || marketOverview.global?.value || "38,790",
        change: dowIndex?.change || marketOverview.global?.change || "-125",
        changePercent:
          dowIndex?.changePercent ||
          marketOverview.global?.changePercent ||
          "-0.32%",
        trend: "下跌",
        vix: marketSentiment.vix?.value || "15.2",
        highlights:
          marketOverview.global?.highlights ||
          "美股科技股回調，歐洲市場維持穩定",
      },
      sentiment: {
        index: marketSentiment.score?.toString() || "65",
        status: marketSentiment.overall || "樂觀",
        strength:
          marketSentiment.indicators?.fearGreedIndex?.toString() || "強",
        change: "+5",
        highlights:
          marketSentiment.analysis?.summary || "市場情緒維持樂觀，風險偏好提升",
      },
    };
  }, [marketOverview, marketSentiment, marketTrend, marketAnalytics]);

  // 分析模組配置
  const analysisModules: AnalysisModule[] = [
    {
      title: "股票分析",
      description: "股票市場指數與產業表現",
      icon: ChartBarIcon,
      href: "/market-analysis/stock",
      data: marketData.stock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "加密貨幣",
      description: "主要幣種與市場趨勢",
      icon: CurrencyDollarIcon,
      href: "/market-analysis/crypto",
      data: marketData.crypto,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "全球市場",
      description: "國際指數與經濟指標",
      icon: GlobeAltIcon,
      href: "/market-analysis/global",
      data: marketData.global,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "趨勢預測",
      description: "AI智能趨勢預測",
      icon: LightBulbIcon,
      href: "/ai-prediction",
      data: { trend: "關注", status: "熱門" },
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const getStatusColor = (status?: string): string => {
    if (!status) return "text-blue-500";

    switch (status.toLowerCase()) {
      case "上漲":
      case "樂觀":
      case "強":
        return "text-green-500";
      case "下跌":
      case "悲觀":
      case "弱":
        return "text-red-500";
      default:
        return "text-blue-500";
    }
  };

  // 載入狀態
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">載入市場分析數據中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
            <h3 className="text-lg font-medium text-red-800">載入失敗</h3>
            <p className="mt-2 text-red-600">{error}</p>
            <button
              onClick={loadMarketData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              重新載入
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-xl relative overflow-hidden">
        {/* 裝飾性背景元素 */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-10 right-20 w-32 h-32 bg-white opacity-5 rounded-full"></div>
          <div className="absolute top-20 right-40 w-16 h-16 bg-white opacity-5 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          {/* 頂部區域 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center">
              <div className="p-3 bg-white/15 backdrop-blur-sm rounded-2xl shadow-lg mr-4">
                <ChartBarIcon className="h-9 w-9 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  市場分析
                </h1>
                <p className="text-blue-100 mt-1 text-sm">
                  專業投資數據分析與市場洞察
                </p>
              </div>
            </div>

            <div className="flex items-center mt-4 md:mt-0 space-x-3">
              <button
                onClick={handleRefreshData}
                className="p-2 bg-indigo-800/50 backdrop-blur-sm rounded-xl border border-indigo-400/30 text-blue-200 hover:text-white transition-colors"
                title="刷新數據"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>

              <div className="bg-indigo-800/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-indigo-400/30 flex items-center space-x-3">
                <div>
                  <div className="text-xs text-blue-200">最後更新</div>
                  <div className="text-sm font-medium text-white">
                    {lastUpdate || "載入中..."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 關鍵指標摘要 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-blue-100">台股加權</span>
                <div className="bg-green-500/20 rounded-full px-2 py-0.5">
                  <span className="text-xs text-green-300">
                    {marketData.stock.changePercent}
                  </span>
                </div>
              </div>
              <div className="text-lg font-bold text-white">
                {marketData.stock.index}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-blue-100">美元/台幣</span>
                <div className="bg-red-500/20 rounded-full px-2 py-0.5">
                  <span className="text-xs text-red-300">-0.25%</span>
                </div>
              </div>
              <div className="text-lg font-bold text-white">31.56</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-blue-100">比特幣</span>
                <div className="bg-green-500/20 rounded-full px-2 py-0.5">
                  <span className="text-xs text-green-300">
                    {marketData.crypto.changePercent}
                  </span>
                </div>
              </div>
              <div className="text-lg font-bold text-white">
                ${marketData.crypto.btc}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-blue-100">市場情緒</span>
                <div className="bg-blue-500/20 rounded-full px-2 py-0.5">
                  <span className="text-xs text-blue-300">
                    {marketData.sentiment.status}
                  </span>
                </div>
              </div>
              <div className="text-lg font-bold text-white">
                {marketData.sentiment.index}
              </div>
            </div>
          </div>

          {/* 導航標籤 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1 inline-flex border border-white/20 space-x-1">
            {["overview", "news", "alerts"].map((tab) => (
              <button
                key={tab}
                className={`${
                  activeTab === tab
                    ? "bg-white text-indigo-700 shadow-md"
                    : "text-white hover:bg-white/10"
                } px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "overview" && (
                  <div className="flex items-center">
                    <ChartBarIcon className="h-4 w-4 mr-1.5" />
                    <span>市場概況</span>
                  </div>
                )}
                {tab === "news" && (
                  <div className="flex items-center">
                    <NewspaperIcon className="h-4 w-4 mr-1.5" />
                    <span>市場新聞</span>
                  </div>
                )}
                {tab === "alerts" && (
                  <div className="flex items-center">
                    <BoltIcon className="h-4 w-4 mr-1.5" />
                    <span>重要提醒</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <>
            {/* 市場深度分析 */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
                市場深度分析
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 台股表現卡片 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      台股表現
                    </h3>
                    <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">加權指數</span>
                      <span className="text-green-500 font-medium">
                        {marketData.stock.index}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">漲跌幅</span>
                      <span className="text-green-500 font-medium">
                        {marketData.stock.changePercent}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">成交量</span>
                      <span className="text-gray-800 font-medium">
                        {marketData.stock.volume}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 美股表現卡片 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      美股表現
                    </h3>
                    <GlobeAltIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">道瓊指數</span>
                      <span className="text-red-500 font-medium">
                        {marketData.global.dow}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">那斯達克</span>
                      <span className="text-green-500 font-medium">17,245</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">S&P 500</span>
                      <span className="text-red-500 font-medium">5,475</span>
                    </div>
                  </div>
                </div>

                {/* 國際匯率卡片 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      國際匯率
                    </h3>
                    <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">美元/台幣</span>
                      <span className="text-red-500 font-medium">31.56</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">美元/歐元</span>
                      <span className="text-green-500 font-medium">1.088</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">美元/日元</span>
                      <span className="text-green-500 font-medium">153.25</span>
                    </div>
                  </div>
                </div>

                {/* 市場情緒卡片 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      市場情緒
                    </h3>
                    <HeartIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">情緒指數</span>
                      <span className="text-gray-800 font-medium">
                        {marketData.sentiment.index}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">整體狀態</span>
                      <span
                        className={`font-medium ${getStatusColor(
                          marketData.sentiment.status
                        )}`}
                      >
                        {marketData.sentiment.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">信心強度</span>
                      <span className="text-gray-800 font-medium">
                        {marketData.sentiment.strength}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 分析工具 */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CommandLineIcon className="h-5 w-5 text-blue-500 mr-2" />
                分析工具
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {analysisModules.map((module) => (
                  <Link
                    key={module.title}
                    href={module.href}
                    className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div
                      className={`w-full h-1 ${module.bgColor} group-hover:opacity-100 opacity-70 transition-opacity duration-300`}
                    ></div>
                    <div className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${module.bgColor}`}>
                          <module.icon className={`h-6 w-6 ${module.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {module.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {module.description}
                          </p>
                        </div>
                      </div>
                      {module.data && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              最新狀態
                            </span>
                            <span
                              className={`text-sm font-medium ${getStatusColor(
                                module.data.trend || module.data.status
                              )}`}
                            >
                              {module.data.trend || module.data.status}
                            </span>
                          </div>
                          {module.data.changePercent && (
                            <div className="mt-2 flex items-center">
                              {module.data.changePercent.startsWith("+") ? (
                                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                              ) : (
                                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                              )}
                              <span
                                className={`text-sm font-medium ${
                                  module.data.changePercent.startsWith("+")
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {module.data.changePercent}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* AI 市場見解 */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <SparklesIcon className="h-6 w-6 text-purple-600 mr-2" />
                AI 智能市場洞察
              </h2>

              <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-purple-100">
                {/* 頂部標題區 */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                        <SparklesIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          本週智能市場分析
                        </h3>
                        <p className="text-sm text-purple-100">
                          基於大數據與機器學習模型分析 |{" "}
                          {new Date().toLocaleDateString("zh-TW")}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleRefreshData}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                      >
                        <ArrowPathIcon className="h-4 w-4 text-white" />
                      </button>
                      <button className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors">
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 主要內容區 */}
                <div className="p-6">
                  {/* 市場摘要 */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-purple-100 rounded-md text-purple-600 mr-2">
                        <ChartBarIcon className="h-5 w-5" />
                      </div>
                      <h4 className="font-medium text-lg text-gray-900">
                        市場摘要
                      </h4>
                    </div>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border-l-4 border-purple-400">
                      {marketData.stock.highlights ||
                        "本週市場呈現震盪格局，科技股表現較強，金融股表現平淡。"}
                    </p>
                  </div>

                  {/* 關鍵洞察 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center mb-2">
                        <ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">
                          上漲動能
                        </span>
                      </div>
                      <p className="text-sm text-green-700">
                        科技股領漲，AI概念股表現強勁，預期短期內維持上漲趨勢。
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center mb-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="font-medium text-yellow-800">
                          風險提示
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        注意國際地緣政治風險，美聯儲政策變化可能影響市場情緒。
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <LightBulbIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-800">
                          投資建議
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        建議關注科技、醫療保健板塊，適度配置防禦性資產。
                      </p>
                    </div>
                  </div>

                  {/* 詳細分析按鈕 */}
                  <div className="flex justify-center">
                    <Link
                      href="/ai-prediction"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <SparklesIcon className="h-5 w-5 mr-2" />
                      查看完整 AI 預測報告
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "news" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <NewspaperIcon className="h-5 w-5 text-blue-500 mr-2" />
              最新市場新聞
            </h2>

            {marketNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketNews.map((news, index) => (
                  <div
                    key={news.id || index}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          news.impact === "高"
                            ? "bg-red-100 text-red-700"
                            : news.impact === "中"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {news.impact}影響
                      </span>
                      <span className="text-xs text-gray-500">{news.time}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {news.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {news.source}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          news.category === "股市"
                            ? "bg-blue-100 text-blue-700"
                            : news.category === "加密貨幣"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {news.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <NewspaperIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暫無市場新聞</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <BoltIcon className="h-5 w-5 text-orange-500 mr-2" />
              重要市場提醒
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                  <h3 className="font-semibold text-red-800">高風險警告</h3>
                </div>
                <p className="text-red-700 text-sm mb-3">
                  美聯儲會議本週舉行，利率決策可能對全球市場造成重大影響。
                </p>
                <div className="text-xs text-red-600">
                  風險等級: 高 | 預估影響: 全球股市、債市、匯市
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <BoltIcon className="h-6 w-6 text-yellow-600 mr-2" />
                  <h3 className="font-semibold text-yellow-800">
                    重要數據發布
                  </h3>
                </div>
                <p className="text-yellow-700 text-sm mb-3">
                  本週將公布消費者物價指數(CPI)數據，預期將影響通膨預期。
                </p>
                <div className="text-xs text-yellow-600">
                  重要性: 中高 | 發布時間: 本週三 21:30
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <EyeIcon className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-800">技術面信號</h3>
                </div>
                <p className="text-blue-700 text-sm mb-3">
                  台股加權指數接近前高阻力位，注意是否出現突破信號。
                </p>
                <div className="text-xs text-blue-600">
                  關鍵位置: 18,000點 | 建議: 密切關注成交量變化
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="font-semibold text-green-800">機會提醒</h3>
                </div>
                <p className="text-green-700 text-sm mb-3">
                  AI概念股持續受到市場關注，相關企業財報表現值得留意。
                </p>
                <div className="text-xs text-green-600">
                  投資機會: AI、半導體板塊 | 風險: 估值偏高需謹慎
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MarketAnalysis;
