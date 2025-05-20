import React, { useState } from "react";
import Link from "next/link";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  GlobeAsiaAustraliaIcon,
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

const MarketAnalysis = () => {
  // 更新導航標籤狀態
  const [activeTab, setActiveTab] = useState("overview");

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
  };

  // 新增分析模組
  const analysisModules = [
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
      href: "/market-analysis/trend-prediction",
      data: { trend: "關注", status: "熱門" },
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const getStatusColor = (status) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 - 使用漸層背景增加視覺效果 */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">市場分析中心</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <span>最後更新：</span>
              <span className="font-medium">
                {new Date().toLocaleDateString("zh-TW")}
              </span>
            </div>
          </div>

          {/* 導航標籤 */}
          <div className="mt-6">
            <nav className="flex space-x-6">
              {["overview", "news", "alerts"].map((tab) => (
                <button
                  key={tab}
                  className={`${
                    activeTab === tab
                      ? "text-white border-b-2 border-white"
                      : "text-blue-100 hover:text-white hover:border-blue-200 border-b-2 border-transparent"
                  } pb-2 px-1 font-medium text-sm transition-colors`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "overview" && "市場概況"}
                  {tab === "news" && "市場新聞"}
                  {tab === "alerts" && "重要提醒"}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    </div>
  );
};

export default MarketAnalysis;
