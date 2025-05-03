import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  GlobeAsiaAustraliaIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  SparklesIcon,
  CubeIcon,
  EyeIcon,
  StarIcon,
  BellAlertIcon,
  FireIcon,
  LightBulbIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import StockChart from "../components/Charts/StockChart";
import { motion } from "framer-motion";

const HomePage = () => {
  // 模擬市場概覽數據
  const marketOverview = {
    stock: {
      name: "股票分析",
      value: "17,935",
      change: "+125.49",
      changePercent: "+0.70%",
      volume: "2,835億",
      upDownRatio: "1.2",
      highlights: "科技股帶動大盤上漲，AI概念股表現強勁",
    },
    crypto: {
      name: "加密貨幣",
      value: "65,280",
      change: "+1,250",
      changePercent: "+1.95%",
      marketCap: "1.02兆美元",
      dominance: "52.3%",
      highlights: "比特幣突破65,000美元，機構投資需求增加",
    },
    global: {
      name: "全球指數",
      value: "38,790",
      change: "-125",
      changePercent: "-0.32%",
      trend: "下跌",
      vix: "15.2",
      highlights: "美股科技股回調，歐洲市場維持穩定",
    },
    realEstate: {
      name: "房市",
      value: "125.8",
      change: "+0.5",
      changePercent: "+0.40%",
      volume: "1,250億",
      trend: "上漲",
      highlights: "房市交易量回升，價格穩步上揚",
    },
    futures: {
      name: "期貨市場",
      volume: "2.5億口",
      change: "+0.3億口",
      changePercent: "+13.6%",
      trend: "上漲",
      turnover: "3.2兆元",
      highlights: "原油期貨因中東局勢緊張上漲，黃金期貨因避險需求增加",
      commodities: {
        oil: {
          name: "原油期貨",
          price: "75.5",
          change: "-0.6",
          changePercent: "-0.79%",
          trend: "下跌",
          strength: 45,
        },
        gold: {
          name: "黃金期貨",
          price: "2,035",
          change: "+15",
          changePercent: "+0.74%",
          trend: "上漲",
          strength: 75,
        },
      },
    },
    nft: {
      name: "NFT市場",
      volume: "1.2億美元",
      change: "+0.3億美元",
      changePercent: "+33.3%",
      trend: "上漲",
      turnover: "3.5億美元",
      highlights: "NFT交易量持續增長，藝術品和遊戲資產需求強勁",
      categories: {
        art: {
          name: "藝術品NFT",
          volume: "5,800萬美元",
          change: "+1,200萬美元",
          changePercent: "+26.1%",
          trend: "上漲",
          strength: 85,
        },
        gaming: {
          name: "遊戲資產NFT",
          volume: "4,200萬美元",
          change: "+800萬美元",
          changePercent: "+23.5%",
          trend: "上漲",
          strength: 75,
        },
      },
    },
  };

  const marketSentiment = {
    vix: {
      value: "14.21",
      change: "-5.2%",
      status: "低波動",
      description: "市場波動性維持在低檔，投資人信心穩定",
    },
    fearGreed: {
      value: "72",
      change: "+5",
      status: "貪婪",
      description: "市場情緒偏向樂觀，風險偏好提升",
    },
    marketBreadth: {
      value: "65%",
      change: "+2.3%",
      status: "擴張",
      description: "市場廣度持續改善，上漲家數增加",
    },
  };

  const sectorPerformance = [
    {
      name: "半導體",
      change: "+3.2%",
      strength: 85,
      leadingStocks: ["台積電", "聯發科", "聯電"],
      highlights: "AI需求帶動產業成長，先進製程產能滿載",
    },
    {
      name: "金融",
      change: "-0.5%",
      strength: 55,
      leadingStocks: ["國泰金", "富邦金", "兆豐金"],
      highlights: "利率環境維持穩定，財富管理業務成長",
    },
    {
      name: "航運",
      change: "-2.1%",
      strength: 35,
      leadingStocks: ["長榮", "陽明", "萬海"],
      highlights: "運價持續下跌，市場供過於求",
    },
  ];

  const marketNews = [
    {
      title: "台積電宣布在日本熊本縣建設第二座先進封裝廠",
      source: "經濟日報",
      time: "2小時前",
      impact: "正面",
      category: "科技",
      summary: "台積電擴大海外布局，強化全球供應鏈韌性",
    },
    {
      title: "央行維持利率不變，市場解讀為鴿派訊號",
      source: "工商時報",
      time: "4小時前",
      impact: "正面",
      category: "財經",
      summary: "央行維持寬鬆貨幣政策，支持經濟復甦",
    },
    {
      title: "全球航運運價持續下跌，航運股普遍承壓",
      source: "財訊",
      time: "6小時前",
      impact: "負面",
      category: "航運",
      summary: "全球貿易量下滑，航運業面臨挑戰",
    },
  ];

  // 模擬熱門股票數據
  const hotStocks = [
    {
      symbol: "2330",
      name: "台積電",
      price: "785",
      change: "+15",
      changePercent: "+1.95%",
      highlights: "AI需求強勁，先進製程產能滿載",
    },
    {
      symbol: "2317",
      name: "鴻海",
      price: "105",
      change: "-1",
      changePercent: "-0.94%",
      highlights: "電動車業務持續擴展，獲利能力提升",
    },
    {
      symbol: "2454",
      name: "聯發科",
      price: "1,085",
      change: "+25",
      changePercent: "+2.36%",
      highlights: "AI晶片需求增加，市占率持續提升",
    },
    {
      symbol: "2412",
      name: "中華電",
      price: "115",
      change: "+1",
      changePercent: "+0.88%",
      highlights: "5G用戶成長，資安業務擴展",
    },
  ];

  // 模擬最新新聞
  const latestNews = [
    {
      title: "台積電宣布在日本熊本縣建設第二座先進封裝廠",
      date: "2024-03-15",
      source: "經濟日報",
      category: "科技",
    },
    {
      title: "聯發科推出新一代AI晶片，搶攻AI手機市場",
      date: "2024-03-14",
      source: "科技新報",
      category: "科技",
    },
    {
      title: "央行宣布維持利率不變，強調通膨風險可控",
      date: "2024-03-14",
      source: "中央社",
      category: "財經",
    },
  ];

  // 模擬圖表數據
  const chartData = {
    dates: ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05"],
    prices: [17000, 17100, 17200, 17300, 17935],
    volumes: [25000000000, 28000000000, 30000000000, 27000000000, 32456789],
  };

  // 新增：活躍股票資料（以市場成交量排序）
  const activeStocks = [
    {
      symbol: "2330",
      name: "台積電",
      volume: "95.2億",
      volumeChange: "+12.3%",
    },
    {
      symbol: "2317",
      name: "鴻海",
      volume: "42.8億",
      volumeChange: "+8.5%",
    },
    {
      symbol: "2454",
      name: "聯發科",
      volume: "36.5億",
      volumeChange: "+15.2%",
    },
    {
      symbol: "2412",
      name: "中華電",
      volume: "28.7億",
      volumeChange: "-3.8%",
    },
  ];

  // 新增：個人化推薦股票
  const recommendedStocks = [
    {
      symbol: "2603",
      name: "長榮",
      reason: "符合您的投資偏好",
      performance: "+5.2%",
    },
    {
      symbol: "2382",
      name: "廣達",
      reason: "類似於您關注的科技股",
      performance: "+3.7%",
    },
    {
      symbol: "2881",
      name: "富邦金",
      reason: "股息率符合您的篩選條件",
      performance: "+1.8%",
    },
  ];

  // 新增：時間範圍狀態
  const [timeRange, setTimeRange] = useState("1d");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [showAllNews, setShowAllNews] = useState(false);

  const getStatusColor = (status) => {
    if (!status) return "text-gray-600";

    switch (status.toLowerCase()) {
      case "貪婪":
      case "擴張":
      case "多頭":
      case "強勢":
      case "正面":
        return "text-green-600";
      case "恐慌":
      case "收縮":
      case "空頭":
      case "弱勢":
      case "負面":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStrengthColor = (strength) => {
    if (strength >= 70) return "bg-green-500";
    if (strength >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  // 新增：取得趨勢圖標
  const getTrendIcon = (trend) => {
    if (trend === "上漲" || trend.includes("增加") || trend.includes("+")) {
      return <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />;
    } else if (
      trend === "下跌" ||
      trend.includes("減少") ||
      trend.includes("-")
    ) {
      return <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />;
    } else {
      return <ChartBarIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 直接開始主要內容，刪除了頂部快速市場總覽區塊 */}

      {/* 市場概況 */}
      <section className="py-12 bg白 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                市場概況
              </h2>
              <p className="mt-2 text-gray-600">即時掌握全球金融市場動態</p>
            </div>
            <div className="flex space-x-2 overflow-x-auto scrollbar-thin pb-2">
              {["1d", "1w", "1m", "3m", "6m"].map((range) => (
                <button
                  key={range}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    range === timeRange
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setTimeRange(range)}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 股票分析 */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {marketOverview.stock.name}
                  </h3>
                </div>
                <Link
                  href="/market-analysis/stock"
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
                >
                  詳細分析
                  <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {marketOverview.stock.value}
                </span>
                <span
                  className={
                    marketOverview.stock.change.includes("+")
                      ? "text-green-500 font-semibold flex items-center"
                      : "text-red-500 font-semibold flex items-center"
                  }
                >
                  {getTrendIcon(marketOverview.stock.changePercent)}
                  <span className="ml-1">
                    {marketOverview.stock.changePercent}
                  </span>
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">成交量</span>
                  <span className="font-medium text-gray-900">
                    {marketOverview.stock.volume}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">漲跌比</span>
                  <span className="font-medium text-gray-900">
                    {marketOverview.stock.upDownRatio}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                  <p className="text-sm text-blue-700 flex items-start">
                    <FireIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    {marketOverview.stock.highlights}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 加密貨幣 */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {marketOverview.crypto.name}
                  </h3>
                </div>
                <Link
                  href="/market-analysis/crypto"
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
                >
                  詳細分析
                  <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${marketOverview.crypto.value}
                </span>
                <span
                  className={
                    marketOverview.crypto.change.includes("+")
                      ? "text-green-500 font-semibold flex items-center"
                      : "text-red-500 font-semibold flex items-center"
                  }
                >
                  {getTrendIcon(marketOverview.crypto.changePercent)}
                  <span className="ml-1">
                    {marketOverview.crypto.changePercent}
                  </span>
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">市值</span>
                  <span className="font-medium text-gray-900">
                    {marketOverview.crypto.marketCap}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">市佔率</span>
                  <span className="font-medium text-gray-900">
                    {marketOverview.crypto.dominance}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                  <p className="text-sm text-purple-700 flex items-start">
                    <FireIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    {marketOverview.crypto.highlights}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 全球指數 */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <GlobeAsiaAustraliaIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {marketOverview.global.name}
                  </h3>
                </div>
                <Link
                  href="/market-analysis/global"
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
                >
                  詳細分析
                  <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {marketOverview.global.value}
                </span>
                <span
                  className={
                    marketOverview.global.change.includes("+")
                      ? "text-green-500 font-semibold flex items-center"
                      : "text-red-500 font-semibold flex items-center"
                  }
                >
                  {getTrendIcon(marketOverview.global.changePercent)}
                  <span className="ml-1">
                    {marketOverview.global.changePercent}
                  </span>
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">趨勢</span>
                  <span
                    className={`font-medium ${getStatusColor(
                      marketOverview.global.trend
                    )}`}
                  >
                    {marketOverview.global.trend}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">VIX指數</span>
                  <span className="font-medium text-gray-900">
                    {marketOverview.global.vix}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                  <p className="text-sm text-green-700 flex items-start">
                    <FireIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    {marketOverview.global.highlights}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 房市指數 */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <BuildingOfficeIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {marketOverview.realEstate.name}
                  </h3>
                </div>
                <Link
                  href="/market-analysis/real-estate"
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
                >
                  詳細分析
                  <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {marketOverview.realEstate.value}
                </span>
                <span
                  className={
                    marketOverview.realEstate.change.includes("+")
                      ? "text-green-500 font-semibold flex items-center"
                      : "text-red-500 font-semibold flex items-center"
                  }
                >
                  {getTrendIcon(marketOverview.realEstate.changePercent)}
                  <span className="ml-1">
                    {marketOverview.realEstate.changePercent}
                  </span>
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">成交量</span>
                  <span className="font-medium text-gray-900">
                    {marketOverview.realEstate.volume}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">趨勢</span>
                  <span
                    className={`font-medium ${getStatusColor(
                      marketOverview.realEstate.trend
                    )}`}
                  >
                    {marketOverview.realEstate.trend}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                  <p className="text-sm text-orange-700 flex items-start">
                    <FireIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    {marketOverview.realEstate.highlights}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 期貨市場 */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <ChartPieIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {marketOverview.futures.name}
                  </h3>
                </div>
                <Link
                  href="/market-analysis/futures"
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
                >
                  詳細分析
                  <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {marketOverview.futures.volume}
                </span>
                <span
                  className={
                    marketOverview.futures.change.includes("+")
                      ? "text-green-500 font-semibold flex items-center"
                      : "text-red-500 font-semibold flex items-center"
                  }
                >
                  {getTrendIcon(marketOverview.futures.changePercent)}
                  <span className="ml-1">
                    {marketOverview.futures.changePercent}
                  </span>
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">成交金額</span>
                  <span className="font-medium text-gray-900">
                    {marketOverview.futures.turnover}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">趨勢</span>
                  <span
                    className={`font-medium ${getStatusColor(
                      marketOverview.futures.trend
                    )}`}
                  >
                    {marketOverview.futures.trend}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
                  <p className="text-sm text-red-700 flex items-start">
                    <FireIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    {marketOverview.futures.highlights}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* NFT市場 */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <SparklesIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {marketOverview.nft.name}
                  </h3>
                </div>
                <Link
                  href="/market-analysis/nft"
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
                >
                  詳細分析
                  <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {marketOverview.nft.volume}
                </span>
                <span
                  className={
                    marketOverview.nft.change.includes("+")
                      ? "text-green-500 font-semibold flex items-center"
                      : "text-red-500 font-semibold flex items-center"
                  }
                >
                  {getTrendIcon(marketOverview.nft.changePercent)}
                  <span className="ml-1">
                    {marketOverview.nft.changePercent}
                  </span>
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">成交金額</span>
                  <span className="font-medium text-gray-900">
                    {marketOverview.nft.turnover}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">趨勢</span>
                  <span
                    className={`font-medium ${getStatusColor(
                      marketOverview.nft.trend
                    )}`}
                  >
                    {marketOverview.nft.trend}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
                  <p className="text-sm text-indigo-700 flex items-start">
                    <FireIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    {marketOverview.nft.highlights}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 新增：活躍交易股票 */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                活躍交易股票
              </h2>
              <p className="mt-2 text-gray-600">今日成交量最大的股票</p>
            </div>
            <Link
              href="/market-analysis/stock"
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
            >
              查看更多
              <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {activeStocks.map((stock) => (
              <motion.div
                key={stock.symbol}
                whileHover={{ y: -3 }}
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-sm text-blue-600 font-medium">
                      {stock.symbol}
                    </span>
                    <h3 className="text-lg font-bold">{stock.name}</h3>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      stock.volumeChange.includes("+")
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {stock.volumeChange}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  成交量：{stock.volume}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 市場情緒 - 優化現有區塊 */}
      <section className="py-12 bg白 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                市場情緒
              </h2>
              <p className="mt-2 text-gray-600">掌握市場投資氛圍與情緒指標</p>
            </div>
            <Link
              href="/market-analysis/market-sentiment"
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
            >
              查看完整分析
              <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <BoltIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  VIX恐慌指數
                </h3>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {marketSentiment.vix.value}
                </span>
                <span className="text-green-500 font-semibold">
                  {marketSentiment.vix.change}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                  marketSentiment.vix.status
                )} bg-opacity-10`}
              >
                {marketSentiment.vix.status}
              </span>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-red-50 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  恐懼與貪婪指數
                </h3>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {marketSentiment.fearGreed.value}
                </span>
                <span className="text-green-500 font-semibold">
                  {marketSentiment.fearGreed.change}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                  marketSentiment.fearGreed.status
                )} bg-opacity-10`}
              >
                {marketSentiment.fearGreed.status}
              </span>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  市場廣度
                </h3>
              </div>
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {marketSentiment.marketBreadth.value}
                </span>
                <span className="text-green-500 font-semibold">
                  {marketSentiment.marketBreadth.change}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                  marketSentiment.marketBreadth.status
                )} bg-opacity-10`}
              >
                {marketSentiment.marketBreadth.status}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 市場新聞 - 優化顯示和交互 */}
      <section className="py-12 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                市場新聞
              </h2>
              <p className="mt-2 text-gray-600">
                即時掌握重要市場訊息與最新動態
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2 overflow-x-auto scrollbar-thin">
                {["全部", "財經", "科技", "產業"].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        category === selectedCategory
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <Link
                href="/news"
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
              >
                查看全部新聞
                <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 重要市場新聞 */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FireIcon className="h-5 w-5 mr-2 text-orange-500" />
                重要市場新聞
              </h3>
              <div className="space-y-4">
                {marketNews
                  .slice(0, showAllNews ? marketNews.length : 3)
                  .map((news, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                            {news.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{news.source}</span>
                            <span className="mx-2">•</span>
                            <span>{news.time}</span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                            news.impact
                          )} bg-opacity-10 ml-4`}
                        >
                          {news.impact}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {news.summary}
                      </p>
                    </motion.div>
                  ))}
                {marketNews.length > 3 && (
                  <button
                    onClick={() => setShowAllNews(!showAllNews)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mx-auto"
                  >
                    {showAllNews ? "顯示較少" : "查看更多新聞"}
                    <ChevronRightIcon
                      className={`h-4 w-4 ml-1 transition-transform ${
                        showAllNews ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* 最新新聞 */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <NewspaperIcon className="h-5 w-5 mr-2 text-blue-500" />
                最新消息
              </h3>
              <div className="space-y-4">
                {latestNews.map((news, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {news.category}
                      </span>
                      <span className="text-sm text-gray-500">{news.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {news.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <NewspaperIcon className="h-4 w-4 mr-1" />
                      {news.source}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 市場走勢圖 - 優化視覺效果和互動性 */}
      <section className="py-12 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                市場走勢
              </h2>
              <p className="mt-2 text-gray-600">掌握市場趨勢與技術分析</p>
            </div>
            <div className="flex space-x-2">
              {["1d", "1w", "1m", "3m", "6m"].map((range) => (
                <button
                  key={range}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      range === timeRange
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  onClick={() => setTimeRange(range)}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  大盤指數走勢
                </h3>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                    marketOverview.stock.change.includes("+")
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {marketOverview.stock.changePercent} 今日
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                  技術指標
                </button>
                <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                  對比指數
                </button>
              </div>
            </div>
            <StockChart data={chartData} />
          </div>
        </div>
      </section>

      {/* 新增：個性化推薦 */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                為您推薦
              </h2>
              <p className="mt-2 text-gray-600">根據您的關注與投資偏好</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedStocks.map((stock) => (
              <motion.div
                key={stock.symbol}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <StarIcon className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {stock.symbol} {stock.name}
                      </h3>
                    </div>
                  </div>
                  <span className="text-green-600 font-semibold">
                    {stock.performance}
                  </span>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p className="flex items-center">
                    <LightBulbIcon className="h-4 w-4 mr-1 text-yellow-500" />
                    {stock.reason}
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    查看詳情
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 熱門股票 - 優化表格顯示 */}
      <section className="py-12 bg白 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                熱門股票
              </h2>
              <p className="mt-2 text-gray-600">即時掌握市場關注焦點</p>
            </div>
            <Link
              href="/market-analysis/stock"
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
            >
              查看完整分析
              <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      股票代號
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      股票名稱
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      現價
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      漲跌
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      漲跌幅
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      亮點
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hotStocks.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {stock.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stock.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stock.price}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          stock.change.startsWith("+")
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {stock.change}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          stock.changePercent.startsWith("+")
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {stock.changePercent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {stock.highlights}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 產業表現 */}
      <section className="py-16 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">產業表現</h2>
              <p className="mt-2 text-gray-600">掌握各產業板塊動態與領先個股</p>
            </div>
            <Link
              href="/market-analysis/stock"
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
            >
              查看完整分析
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sectorPerformance.map((sector, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sector.name}
                    </h3>
                  </div>
                  <span
                    className={`text-lg font-semibold ${
                      sector.change.startsWith("+")
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {sector.change}
                  </span>
                </div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">產業強度</span>
                    <span className="text-sm font-medium text-gray-900">
                      {sector.strength}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor(sector.strength)}`}
                      style={{ width: `${sector.strength}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    領先個股
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sector.leadingStocks.map((stock, j) => (
                      <span
                        key={j}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                      >
                        {stock}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 理財知識 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">理財知識</h2>
              <p className="mt-2 text-gray-600">提升您的投資理財能力</p>
            </div>
            <Link
              href="/education"
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
            >
              查看更多課程
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  基礎知識
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                學習投資的基本概念和策略，建立穩固的投資基礎
              </p>
              <Link
                href="/education"
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                了解更多
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  技術分析
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                掌握技術分析工具和方法，提升交易決策能力
              </p>
              <Link
                href="/education"
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                了解更多
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <BoltIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  風險管理
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                學習如何控制投資風險，保護您的投資組合
              </p>
              <Link
                href="/education"
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                了解更多
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NFT分類 */}
      <section className="py-16 bg白 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">NFT分類</h2>
              <p className="mt-2 text-gray-600">了解不同類型的NFT市場動態</p>
            </div>
            <Link
              href="/market-analysis/nft"
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
            >
              查看完整分析
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 藝術品NFT */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-pink-50 rounded-lg">
                    <CubeIcon className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {marketOverview.nft.categories.art.name}
                  </h3>
                </div>
                <span className="text-green-500 font-semibold">
                  {marketOverview.nft.categories.art.changePercent}
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">成交量</span>
                  <span className="font-medium text-gray-900">
                    {marketOverview.nft.categories.art.volume}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">趨勢</span>
                  <span
                    className={`font-medium ${getStatusColor(
                      marketOverview.nft.categories.art.trend
                    )}`}
                  >
                    {marketOverview.nft.categories.art.trend}
                  </span>
                </div>
              </div>
            </div>

            {/* 遊戲資產NFT */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CubeIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {marketOverview.nft.categories.gaming.name}
                  </h3>
                </div>
                <span className="text-green-500 font-semibold">
                  {marketOverview.nft.categories.gaming.changePercent}
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">成交量</span>
                  <span className="font-medium text-gray-900">
                    {marketOverview.nft.categories.gaming.volume}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">趨勢</span>
                  <span
                    className={`font-medium ${getStatusColor(
                      marketOverview.nft.categories.gaming.trend
                    )}`}
                  >
                    {marketOverview.nft.categories.gaming.trend}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
