import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartPieIcon,
  FireIcon,
  StarIcon,
  TableCellsIcon,
  AdjustmentsHorizontalIcon,
  Square3Stack3DIcon,
  BoltIcon,
  NewspaperIcon,
  InformationCircleIcon,
  HeartIcon,
  CurrencyDollarIcon,
  GlobeAsiaAustraliaIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  SparklesIcon,
  StarIcon as StarIconSolid,
} from "@heroicons/react/24/solid";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockMarket = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStrategy, setSelectedStrategy] = useState("value");
  const [selectedSector, setSelectedSector] = useState("all");
  const [favoriteStocks, setFavoriteStocks] = useState(["2330"]);
  const [stockCompare, setStockCompare] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("1M");
  const [customIndicatorOpen, setCustomIndicatorOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState("頭肩頂");
  const [newsFilter, setNewsFilter] = useState("latest");

  // 新增追蹤股票功能
  const toggleFavoriteStock = (symbol) => {
    if (favoriteStocks.includes(symbol)) {
      setFavoriteStocks(favoriteStocks.filter((s) => s !== symbol));
    } else {
      setFavoriteStocks([...favoriteStocks, symbol]);
    }
  };

  // 新增股票比較功能
  const toggleCompareStock = (symbol) => {
    if (stockCompare.includes(symbol)) {
      setStockCompare(stockCompare.filter((s) => s !== symbol));
    } else if (stockCompare.length < 3) {
      setStockCompare([...stockCompare, symbol]);
    }
  };

  // 模擬數據
  const marketData = {
    stock: {
      index: "17,935",
      change: "+125",
      changePercent: "+0.70%",
      trend: "上漲",
      volume: "2,835億",
      highlights: "科技股帶動大盤上漲，AI概念股表現強勁",
    },
    crypto: {
      btc: "65,280",
      change: "+1,250",
      changePercent: "+1.95%",
      volume: "485億",
      dominance: "52.3%",
      highlights: "比特幣突破65,000美元，機構投資需求增加",
    },
    global: {
      dow: "38,790",
      change: "-125",
      changePercent: "-0.32%",
      trend: "下跌",
      vix: "15.2",
      highlights: "美股科技股回調，歐洲市場維持穩定",
    },
    sentiment: {
      index: "65",
      status: "樂觀",
      strength: "強",
      change: "+5",
      highlights: "市場情緒維持樂觀，風險偏好提升",
    },
    // 新增個股詳細數據
    stockDetails: [
      {
        symbol: "2330",
        name: "台積電",
        price: "785",
        change: "+15",
        changePercent: "+1.95%",
        open: "770",
        high: "788",
        low: "768",
        volume: "25.6億",
        pe: "15.3",
        pb: "5.8",
        dividend: "2.6%",
        marketCap: "20.4兆",
        industry: "半導體",
        news: [
          {
            title: "台積電公布3奈米良率達標，超越預期",
            date: "2小時前",
            source: "經濟日報",
          },
          {
            title: "台積電投資美國廠進度超前，將提前量產",
            date: "昨天",
            source: "工商時報",
          },
        ],
        chartData: {
          labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
          prices: [700, 720, 740, 760, 775, 785],
        },
        technicalSignals: {
          ma: "多頭排列",
          kd: "低檔背離",
          macd: "黃金交叉",
          rsi: "58 (中性)",
          support: "765",
          resistance: "800",
        },
        fundamentals: {
          revenue: "+18.5%",
          profit: "+22.3%",
          assets: "2.3兆",
          liabilities: "0.8兆",
          roe: "25.8%",
          quarters: [
            { period: "2023 Q1", eps: "7.98", revenue: "5,088億" },
            { period: "2023 Q2", eps: "8.15", revenue: "5,345億" },
            { period: "2023 Q3", eps: "8.32", revenue: "5,468億" },
            { period: "2023 Q4", eps: "8.54", revenue: "5,774億" },
          ],
        },
        institutionalTrades: {
          foreign: { net: "+2.5億", trend: "連續5日買超" },
          investment: { net: "+0.8億", trend: "轉為買超" },
          dealer: { net: "-0.3億", trend: "小幅賣超" },
        },
        ratings: [
          { org: "摩根大通", target: "850", rating: "買進" },
          { org: "高盛", target: "830", rating: "持有" },
          { org: "美林", target: "900", rating: "強力買進" },
        ],
      },
      {
        symbol: "2317",
        name: "鴻海",
        price: "104.5",
        change: "-0.5",
        changePercent: "-0.48%",
        open: "105",
        high: "105.5",
        low: "103.5",
        volume: "8.7億",
        pe: "10.4",
        pb: "1.2",
        dividend: "4.2%",
        marketCap: "1.45兆",
        industry: "電子零組件",
        news: [
          {
            title: "鴻海印度廠正式量產，產能提升超乎預期",
            date: "3小時前",
            source: "聯合報",
          },
          {
            title: "鴻海電動車業務營收增長，法人看好",
            date: "2天前",
            source: "中央社",
          },
        ],
        chartData: {
          labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
          prices: [110, 108, 106, 107, 105, 104.5],
        },
      },
      {
        symbol: "2454",
        name: "聯發科",
        price: "925",
        change: "+23",
        changePercent: "+2.55%",
        open: "904",
        high: "928",
        low: "903",
        volume: "10.8億",
        pe: "18.3",
        pb: "3.2",
        dividend: "3.1%",
        marketCap: "1.47兆",
        industry: "半導體",
        news: [
          {
            title: "聯發科新一代5G晶片獲多家大廠採用",
            date: "今天",
            source: "經濟日報",
          },
        ],
        chartData: {
          labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
          prices: [860, 875, 890, 900, 905, 925],
        },
      },
    ],

    // 新增產業表現數據
    industryPerformance: [
      {
        name: "半導體",
        change: "+2.5%",
        leaders: ["2330", "2454"],
        volume: "456億",
      },
      {
        name: "電子零組件",
        change: "-0.8%",
        leaders: ["2317", "2308"],
        volume: "312億",
      },
      {
        name: "金融保險",
        change: "+1.2%",
        leaders: ["2882", "2881"],
        volume: "245億",
      },
      {
        name: "航運",
        change: "+3.1%",
        leaders: ["2603", "2609"],
        volume: "183億",
      },
      {
        name: "鋼鐵",
        change: "-1.5%",
        leaders: ["2002", "2006"],
        volume: "95億",
      },
      {
        name: "建材營造",
        change: "-0.6%",
        leaders: ["2207", "2506"],
        volume: "68億",
      },
    ],

    // 新增技術面篩選結果
    technicalScreener: {
      bullish: [
        {
          symbol: "2603",
          name: "長榮",
          signal: "突破阻力",
          pattern: "三重底",
          change: "+3.1%",
        },
        {
          symbol: "2454",
          name: "聯發科",
          signal: "均線多頭排列",
          pattern: "上升三角形",
          change: "+2.5%",
        },
        {
          symbol: "2881",
          name: "富邦金",
          signal: "成交量放大",
          pattern: "頭肩底",
          change: "+1.8%",
        },
      ],
      bearish: [
        {
          symbol: "2002",
          name: "中鋼",
          signal: "跌破支撐",
          pattern: "頭肩頂",
          change: "-2.1%",
        },
        {
          symbol: "2308",
          name: "台達電",
          signal: "死亡交叉",
          pattern: "下降三角形",
          change: "-1.4%",
        },
      ],
    },

    // 新增熱門討論股票
    trendingStocks: [
      { symbol: "2330", name: "台積電", mentions: 256, sentiment: "正面" },
      { symbol: "2603", name: "長榮", mentions: 187, sentiment: "正面" },
      { symbol: "2317", name: "鴻海", mentions: 145, sentiment: "中性" },
      { symbol: "2454", name: "聯發科", mentions: 128, sentiment: "正面" },
      { symbol: "2308", name: "台達電", mentions: 92, sentiment: "負面" },
    ],
  };

  // 分析工具模組
  const analysisModules = [
    {
      title: "技術分析",
      description: "K線、均線與技術指標分析",
      icon: ChartBarIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/market-analysis/technical",
      data: {
        status: "多頭排列",
        changePercent: "+2.5%",
      },
    },
    {
      title: "基本面分析",
      description: "財報、獲利與估值分析",
      icon: TableCellsIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/market-analysis/fundamental",
      data: {
        status: "高成長",
        changePercent: "+15.3%",
      },
    },
    {
      title: "產業分析",
      description: "產業類股走勢與比較",
      icon: ChartPieIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/market-analysis/sectors",
      data: {
        trend: "半導體領先",
        changePercent: "+3.2%",
      },
    },
    {
      title: "選股工具",
      description: "多重條件選股與排序",
      icon: FunnelIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      href: "/market-analysis/screener",
      data: {
        status: "已更新",
      },
    },
  ];

  // 根據漲跌幅返回顏色
  const getPriceChangeColor = (change) => {
    if (parseFloat(change) > 0) {
      return "text-green-600";
    } else if (parseFloat(change) < 0) {
      return "text-red-600";
    } else {
      return "text-gray-600";
    }
  };

  // 根據分析評級返回顏色
  const getRatingColor = (rating) => {
    if (rating.includes("買進") || rating.includes("強力")) {
      return "bg-green-100 text-green-800";
    } else if (rating.includes("賣出") || rating.includes("減持")) {
      return "bg-red-100 text-red-800";
    } else {
      return "bg-blue-100 text-blue-800";
    }
  };

  // 根據情緒返回顏色
  const getSentimentColor = (sentiment) => {
    if (sentiment === "正面") {
      return "text-green-600";
    } else if (sentiment === "負面") {
      return "text-red-600";
    } else {
      return "text-yellow-600";
    }
  };

  // 根據狀態返回顏色
  const getStatusColor = (status) => {
    if (
      status &&
      (status.includes("多頭") ||
        status.includes("上漲") ||
        status.includes("高成長"))
    ) {
      return "text-green-600";
    } else if ((status && status.includes("下跌")) || status.includes("空頭")) {
      return "text-red-600";
    } else if (status && status.includes("中性")) {
      return "text-blue-600";
    } else {
      return "text-gray-600";
    }
  };

  // 處理表格排序
  const handleSort = (column) => {
    // 排序邏輯
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 - 使用漸變背景提升視覺效果 */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">股票市場分析</h1>
            </div>

            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="relative flex-1 min-w-[240px]">
                <input
                  type="text"
                  placeholder="搜尋股票代號或名稱..."
                  className="w-full pl-10 pr-4 py-2 border border-white border-opacity-30 bg-white bg-opacity-20 rounded-full focus:ring-2 focus:ring-white focus:bg-white focus:bg-opacity-90 text-white focus:text-gray-900 placeholder-white placeholder-opacity-70"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-white absolute left-3 top-2.5" />
              </div>

              <div className="bg-white bg-opacity-20 rounded-full p-1 flex">
                {["1D", "1W", "1M", "3M", "YTD"].map((range) => (
                  <button
                    key={range}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      selectedTimeRange === range
                        ? "bg-white text-indigo-700"
                        : "text-white hover:bg-white hover:bg-opacity-20"
                    }`}
                    onClick={() => setSelectedTimeRange(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 導航標籤 */}
          <div className="mt-6">
            <nav className="flex space-x-6 overflow-x-auto pb-2 scrollbar-hide">
              {[
                "overview",
                "stocks",
                "sectors",
                "technical",
                "fundamental",
                "news",
                "screener",
              ].map((tab) => (
                <button
                  key={tab}
                  className={`${
                    activeTab === tab
                      ? "text-white border-b-2 border-white"
                      : "text-blue-100 hover:text-white hover:border-blue-200 border-b-2 border-transparent"
                  } pb-2 px-1 font-medium text-sm transition-colors whitespace-nowrap`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "overview" && "市場概況"}
                  {tab === "stocks" && "個股資訊"}
                  {tab === "sectors" && "產業分析"}
                  {tab === "technical" && "技術分析"}
                  {tab === "fundamental" && "基本面分析"}
                  {tab === "news" && "市場新聞"}
                  {tab === "screener" && "選股器"}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 市場概況頁面 */}
        {activeTab === "overview" && (
          <>
            {/* 市場概況 - 使用卡片陰影和圓角增強視覺層次 */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
                今日市場重點
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      台股指數
                    </h3>
                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-gray-900">
                      {marketData.stock.index}
                    </span>
                    <span className="text-green-500 font-semibold">
                      {marketData.stock.changePercent}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    成交量：{marketData.stock.volume}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      比特幣
                    </h3>
                    <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-gray-900">
                      ${marketData.crypto.btc}
                    </span>
                    <span className="text-green-500 font-semibold">
                      {marketData.crypto.changePercent}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    市值占比：{marketData.crypto.dominance}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      道瓊指數
                    </h3>
                    <GlobeAsiaAustraliaIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-gray-900">
                      {marketData.global.dow}
                    </span>
                    <span className="text-red-500 font-semibold">
                      {marketData.global.changePercent}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    VIX指數：{marketData.global.vix}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      市場情緒
                    </h3>
                    <HeartIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-gray-900">
                      {marketData.sentiment.index}
                    </span>
                    <span className="text-green-500 font-semibold">
                      {marketData.sentiment.change}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    狀態：{marketData.sentiment.status}
                  </div>
                </div>
              </div>
            </div>

            {/* 分析工具 - 增加間距和視覺分隔 */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 text-blue-500 mr-2" />
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
                      className={`w-full h-1 ${module.bgColor} group-hover:bg-opacity-100 bg-opacity-70`}
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

            {/* AI 市場見解 - 新增區塊 */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
                AI 市場見解
              </h2>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <SparklesIcon className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      本週市場摘要
                    </h3>
                    <p className="text-sm text-gray-500">
                      基於最新數據與趨勢分析
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      本週市場呈現震盪格局，科技股表現較強，金融股表現平淡。通膨數據好於預期，
                      可能支持央行降息預期，適合加碼布局成長股與科技龍頭。加密貨幣市場出現回升跡象，
                      比特幣站穩65,000美元。
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">
                        關注焦點
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 台積電海外擴產進度</li>
                        <li>• 美國非農就業數據</li>
                        <li>• 歐洲央行利率決議</li>
                      </ul>
                    </div>
                    <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">
                        投資機會
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• AI相關應用產業</li>
                        <li>• 低估值高股息標的</li>
                        <li>• 長線布局能源轉型</li>
                      </ul>
                    </div>
                    <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">
                        風險提示
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 地緣政治緊張加劇</li>
                        <li>• 高估值科技股修正</li>
                        <li>• 通膨預期反轉風險</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "news" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <NewspaperIcon className="h-5 w-5 text-blue-500 mr-2" />
              市場新聞動態
            </h2>
            {/* ...existing news content with improved visual design... */}
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BoltIcon className="h-5 w-5 text-orange-500 mr-2" />
              重要市場提醒
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-orange-50 rounded-xl shadow-md p-6 border-l-4 border-orange-500">
                <div className="flex items-center mb-3">
                  <BoltIcon className="h-5 w-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-800">
                    美國CPI數據發佈
                  </h3>
                </div>
                <p className="text-gray-600 mb-3">
                  美國將於本週三公布最新CPI數據，市場預期年增率為3.1%。此數據可能影響美聯儲未來利率政策走向。
                </p>
                <div className="text-sm text-gray-500">將於 2小時後發佈</div>
              </div>
              <div className="bg-blue-50 rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center mb-3">
                  <ChartBarIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-800">
                    台股季線即將跌破
                  </h3>
                </div>
                <p className="text-gray-600 mb-3">
                  台股指數近期走勢疲弱，即將測試季線支撐位。留意17,500點是否能守住，否則可能進一步回檔至17,200點。
                </p>
                <div className="text-sm text-gray-500">技術分析提醒</div>
              </div>
            </div>
          </div>
        )}

        {/* 個股資訊頁面 - 全新設計 */}
        {activeTab === "stocks" && (
          <div className="space-y-8">
            {/* 我的關注股票 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StarIconSolid className="h-5 w-5 text-yellow-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      我的關注
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">比較：</span>
                    <div className="relative">
                      <button
                        className={`flex items-center space-x-1 text-sm ${
                          showComparison
                            ? "text-blue-600 font-medium"
                            : "text-gray-600"
                        } hover:text-blue-600`}
                        onClick={() => setShowComparison(!showComparison)}
                      >
                        <Square3Stack3DIcon className="h-4 w-4" />
                        <span>{showComparison ? "取消比較" : "開始比較"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        {showComparison ? "選擇" : "追蹤"}
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <span
                          className="cursor-pointer flex items-center"
                          onClick={() => handleSort("symbol")}
                        >
                          代號/名稱{" "}
                          <AdjustmentsHorizontalIcon className="h-3 w-3 ml-1" />
                        </span>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <span
                          className="cursor-pointer flex items-center"
                          onClick={() => handleSort("price")}
                        >
                          股價{" "}
                          <AdjustmentsHorizontalIcon className="h-3 w-3 ml-1" />
                        </span>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <span
                          className="cursor-pointer flex items-center"
                          onClick={() => handleSort("change")}
                        >
                          漲跌{" "}
                          <AdjustmentsHorizontalIcon className="h-3 w-3 ml-1" />
                        </span>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        行業
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        成交量
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        P/E
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        殖利率
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {marketData.stockDetails.map((stock) => (
                      <tr
                        key={stock.symbol}
                        className={
                          favoriteStocks.includes(stock.symbol)
                            ? "bg-blue-50"
                            : ""
                        }
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              showComparison
                                ? toggleCompareStock(stock.symbol)
                                : toggleFavoriteStock(stock.symbol)
                            }
                            className="focus:outline-none"
                          >
                            {showComparison ? (
                              <div
                                className={`h-4 w-4 border rounded-sm ${
                                  stockCompare.includes(stock.symbol)
                                    ? "bg-blue-500 border-blue-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {stockCompare.includes(stock.symbol) && (
                                  <svg
                                    className="h-3 w-3 text-white m-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M5 13l4 4L19 7"
                                    ></path>
                                  </svg>
                                )}
                              </div>
                            ) : favoriteStocks.includes(stock.symbol) ? (
                              <StarIconSolid className="h-5 w-5 text-yellow-400" />
                            ) : (
                              <StarIcon className="h-5 w-5 text-gray-300 hover:text-yellow-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-1">
                              <div className="text-sm font-medium text-gray-900">
                                {stock.symbol}
                              </div>
                              <div className="text-xs text-gray-500">
                                {stock.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stock.price}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm font-medium ${getPriceChangeColor(
                              stock.change
                            )}`}
                          >
                            {stock.change} ({stock.changePercent})
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stock.industry}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stock.volume}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stock.pe}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stock.dividend}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <ChartBarIcon className="h-4 w-4" />
                            </button>
                            <button className="text-blue-600 hover:text-blue-800">
                              <InformationCircleIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 股票比較結果 */}
            {showComparison && stockCompare.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      股票比較
                    </h3>
                    <button
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                      onClick={() => setStockCompare([])}
                    >
                      清除所有
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stockCompare.map((symbol) => {
                      const stock = marketData.stockDetails.find(
                        (s) => s.symbol === symbol
                      );
                      if (!stock) return null;

                      return (
                        <div
                          key={symbol}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <span className="text-lg font-semibold text-gray-900">
                                {symbol}
                              </span>
                              <span className="ml-2 text-gray-600">
                                {stock.name}
                              </span>
                            </div>
                            <button
                              onClick={() => toggleCompareStock(symbol)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>

                          <div className="flex items-baseline mb-4">
                            <span className="text-2xl font-bold text-gray-900">
                              {stock.price}
                            </span>
                            <span
                              className={`ml-2 ${getPriceChangeColor(
                                stock.change
                              )}`}
                            >
                              {stock.changePercent}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">成交量</span>
                              <span className="text-gray-900">
                                {stock.volume}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">本益比</span>
                              <span className="text-gray-900">{stock.pe}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">股價淨值比</span>
                              <span className="text-gray-900">{stock.pb}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">殖利率</span>
                              <span className="text-gray-900">
                                {stock.dividend}
                              </span>
                            </div>
                          </div>

                          <div className="h-32 mt-4">
                            <Line
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                  x: { display: false },
                                  y: { display: false },
                                },
                              }}
                              data={{
                                labels: stock.chartData.labels,
                                datasets: [
                                  {
                                    data: stock.chartData.prices,
                                    borderColor:
                                      parseFloat(stock.change) >= 0
                                        ? "rgb(16, 185, 129)"
                                        : "rgb(239, 68, 68)",
                                    borderWidth: 2,
                                    tension: 0.3,
                                  },
                                ],
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {/* 添加按鈕 */}
                    {stockCompare.length < 3 && (
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                        <div className="text-center">
                          <span className="block text-gray-500 mb-1">
                            選擇最多3支股票進行比較
                          </span>
                          <span className="text-sm text-gray-400">
                            已選擇 {stockCompare.length}/3 支
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 個股詳細信息 */}
            {marketData.stockDetails[0] && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ChartBarIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {marketData.stockDetails[0].symbol}{" "}
                        {marketData.stockDetails[0].name} 詳細資訊
                      </h3>
                    </div>
                    <button
                      className={`flex items-center space-x-1 ${
                        favoriteStocks.includes(
                          marketData.stockDetails[0].symbol
                        )
                          ? "text-yellow-500"
                          : "text-gray-400 hover:text-yellow-500"
                      }`}
                      onClick={() =>
                        toggleFavoriteStock(marketData.stockDetails[0].symbol)
                      }
                    >
                      {favoriteStocks.includes(
                        marketData.stockDetails[0].symbol
                      ) ? (
                        <StarIconSolid className="h-5 w-5" />
                      ) : (
                        <StarIcon className="h-5 w-5" />
                      )}
                      <span className="text-sm font-medium">加入追蹤</span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 左側：基本資訊與價格圖表 */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-gray-900">
                              {marketData.stockDetails[0].price}
                            </span>
                            <span
                              className={`ml-3 text-lg font-medium ${getPriceChangeColor(
                                marketData.stockDetails[0].change
                              )}`}
                            >
                              {marketData.stockDetails[0].change} (
                              {marketData.stockDetails[0].changePercent})
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            更新時間：{new Date().toLocaleTimeString("zh-TW")}
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex space-x-4">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">開盤</div>
                            <div className="text-sm font-medium text-gray-900">
                              {marketData.stockDetails[0].open}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">最高</div>
                            <div className="text-sm font-medium text-green-600">
                              {marketData.stockDetails[0].high}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">最低</div>
                            <div className="text-sm font-medium text-red-600">
                              {marketData.stockDetails[0].low}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">成交量</div>
                            <div className="text-sm font-medium text-gray-900">
                              {marketData.stockDetails[0].volume}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 價格圖表 */}
                      <div className="h-80">
                        <Line
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: { intersect: false, mode: "index" },
                            plugins: {
                              legend: { display: false },
                              tooltip: { enabled: true },
                            },
                            scales: {
                              y: { beginAtZero: false },
                            },
                          }}
                          data={{
                            labels: marketData.stockDetails[0].chartData.labels,
                            datasets: [
                              {
                                label: "股價",
                                data: marketData.stockDetails[0].chartData
                                  .prices,
                                borderColor: "rgb(59, 130, 246)",
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                tension: 0.3,
                                fill: true,
                              },
                            ],
                          }}
                        />
                      </div>

                      {/* 技術指標 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">
                            技術指標
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                均線
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                {marketData.stockDetails[0].technicalSignals.ma}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                KD指標
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                {marketData.stockDetails[0].technicalSignals.kd}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                MACD
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                {
                                  marketData.stockDetails[0].technicalSignals
                                    .macd
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">
                            支撐與壓力
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                主要支撐
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {
                                  marketData.stockDetails[0].technicalSignals
                                    .support
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                主要壓力
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {
                                  marketData.stockDetails[0].technicalSignals
                                    .resistance
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">RSI</span>
                              <span className="text-sm font-medium text-blue-600">
                                {
                                  marketData.stockDetails[0].technicalSignals
                                    .rsi
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">
                            基本面數據
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                本益比
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {marketData.stockDetails[0].pe}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                股價淨值比
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {marketData.stockDetails[0].pb}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                殖利率
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                {marketData.stockDetails[0].dividend}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 右側：法人動態與股票評級 */}
                    <div className="space-y-6">
                      {/* 法人買賣超 */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700">
                            法人買賣超
                          </h4>
                        </div>
                        <div className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                外資
                              </span>
                              <div className="flex items-center">
                                <span
                                  className={`text-sm font-medium ${
                                    parseFloat(
                                      marketData.stockDetails[0]
                                        .institutionalTrades.foreign.net
                                    ) >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {
                                    marketData.stockDetails[0]
                                      .institutionalTrades.foreign.net
                                  }
                                </span>
                                <span className="ml-2 text-xs text-gray-500">
                                  {
                                    marketData.stockDetails[0]
                                      .institutionalTrades.foreign.trend
                                  }
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                投信
                              </span>
                              <div className="flex items-center">
                                <span
                                  className={`text-sm font-medium ${
                                    parseFloat(
                                      marketData.stockDetails[0]
                                        .institutionalTrades.investment.net
                                    ) >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {
                                    marketData.stockDetails[0]
                                      .institutionalTrades.investment.net
                                  }
                                </span>
                                <span className="ml-2 text-xs text-gray-500">
                                  {
                                    marketData.stockDetails[0]
                                      .institutionalTrades.investment.trend
                                  }
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                自營商
                              </span>
                              <div className="flex items-center">
                                <span
                                  className={`text-sm font-medium ${
                                    parseFloat(
                                      marketData.stockDetails[0]
                                        .institutionalTrades.dealer.net
                                    ) >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {
                                    marketData.stockDetails[0]
                                      .institutionalTrades.dealer.net
                                  }
                                </span>
                                <span className="ml-2 text-xs text-gray-500">
                                  {
                                    marketData.stockDetails[0]
                                      .institutionalTrades.dealer.trend
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 研究報告 */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700">
                            券商評等
                          </h4>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {marketData.stockDetails[0].ratings.map(
                            (rating, index) => (
                              <div key={index} className="p-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-900">
                                    {rating.org}
                                  </span>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${getRatingColor(
                                      rating.rating
                                    )}`}
                                  >
                                    {rating.rating}
                                  </span>
                                </div>
                                <div className="mt-1 flex justify-between items-center">
                                  <span className="text-xs text-gray-500">
                                    目標價
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    ${rating.target}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* 相關新聞 */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700">
                            相關新聞
                          </h4>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {marketData.stockDetails[0].news.map(
                            (item, index) => (
                              <div key={index} className="p-4">
                                <h5 className="text-sm font-medium text-gray-900 mb-1">
                                  {item.title}
                                </h5>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>{item.date}</span>
                                  <span>{item.source}</span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                        <div className="bg-gray-50 px-4 py-2 text-center">
                          <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
                            查看更多新聞
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 技術形態掃描 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      技術形態掃描
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={selectedPattern}
                      onChange={(e) => setSelectedPattern(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                      <option value="頭肩頂">頭肩頂/底</option>
                      <option value="三重頂">三重頂/底</option>
                      <option value="雙重頂">雙重頂/底</option>
                      <option value="楔形">楔形</option>
                      <option value="三角形">三角形</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-base font-medium text-green-700 mb-4 flex items-center">
                      <ArrowTrendingUpIcon className="h-5 w-5 mr-1" />
                      看漲形態
                    </h4>
                    <div className="space-y-3">
                      {marketData.technicalScreener.bullish.map(
                        (stock, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                          >
                            <div>
                              <div className="flex items-center">
                                <span className="text-base font-medium text-gray-900 mr-2">
                                  {stock.symbol}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {stock.name}
                                </span>
                              </div>
                              <div className="flex items-center mt-1">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  {stock.pattern}
                                </span>
                                <span className="mx-2 text-gray-300">•</span>
                                <span className="text-xs text-gray-500">
                                  {stock.signal}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-green-600">
                                {stock.change}
                              </div>
                              <button className="text-xs text-blue-600 hover:text-blue-800">
                                查看詳情
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-medium text-red-700 mb-4 flex items-center">
                      <ArrowTrendingDownIcon className="h-5 w-5 mr-1" />
                      看跌形態
                    </h4>
                    <div className="space-y-3">
                      {marketData.technicalScreener.bearish.map(
                        (stock, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                          >
                            <div>
                              <div className="flex items-center">
                                <span className="text-base font-medium text-gray-900 mr-2">
                                  {stock.symbol}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {stock.name}
                                </span>
                              </div>
                              <div className="flex items-center mt-1">
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                  {stock.pattern}
                                </span>
                                <span className="mx-2 text-gray-300">•</span>
                                <span className="text-xs text-gray-500">
                                  {stock.signal}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-red-600">
                                {stock.change}
                              </div>
                              <button className="text-xs text-blue-600 hover:text-blue-800">
                                查看詳情
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 熱門討論股票 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100">
                <div className="flex items-center">
                  <FireIcon className="h-5 w-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    熱門討論股票
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {marketData.trendingStocks.map((stock, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-base font-medium text-gray-900">
                          {stock.symbol}
                        </span>
                        <span
                          className={`text-sm ${getSentimentColor(
                            stock.sentiment
                          )}`}
                        >
                          {stock.sentiment}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {stock.name}
                      </div>
                      <div className="flex items-center">
                        <FireIcon className="h-4 w-4 text-orange-500 mr-1" />
                        <span className="text-xs text-gray-500">
                          {stock.mentions}則討論
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 產業分析頁面 */}
        {activeTab === "sectors" && <div>產業分析頁面內容</div>}

        {/* 技術分析頁面 */}
        {activeTab === "technical" && <div>技術分析頁面內容</div>}
      </div>
    </div>
  );
};

export default StockMarket;
