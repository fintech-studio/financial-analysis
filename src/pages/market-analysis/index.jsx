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
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";

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
      {/* 頁面標題 - 更現代化的設計 */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-xl relative overflow-hidden">
        {/* 裝飾性背景元素 */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-10 right-20 w-32 h-32 bg-white opacity-5 rounded-full"></div>
          <div className="absolute top-20 right-40 w-16 h-16 bg-white opacity-5 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          {/* 頂部區域 - 標題和更新時間 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center">
              <div className="p-3 bg-white bg-opacity-15 backdrop-blur-sm rounded-2xl shadow-lg mr-4">
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

            <div className="flex items-center mt-4 md:mt-0">
              <div className="bg-indigo-800 bg-opacity-50 backdrop-blur-sm rounded-xl px-4 py-2 border border-indigo-400 border-opacity-30 flex items-center space-x-3">
                <ArrowPathIcon className="h-4 w-4 text-blue-200" />
                <div>
                  <div className="text-xs text-blue-200">最後更新</div>
                  <div className="text-sm font-medium text-white">
                    {new Date().toLocaleDateString("zh-TW", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 中間區域 - 關鍵指標摘要 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3 border border-white border-opacity-20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-blue-100">台股加權</span>
                <div className="bg-green-500 bg-opacity-20 rounded-full px-2 py-0.5">
                  <span className="text-xs text-green-300">+0.70%</span>
                </div>
              </div>
              <div className="text-lg font-bold text-white">17,935</div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3 border border-white border-opacity-20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-blue-100">美元/台幣</span>
                <div className="bg-red-500 bg-opacity-20 rounded-full px-2 py-0.5">
                  <span className="text-xs text-red-300">-0.25%</span>
                </div>
              </div>
              <div className="text-lg font-bold text-white">31.56</div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3 border border-white border-opacity-20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-blue-100">比特幣</span>
                <div className="bg-green-500 bg-opacity-20 rounded-full px-2 py-0.5">
                  <span className="text-xs text-green-300">+1.95%</span>
                </div>
              </div>
              <div className="text-lg font-bold text-white">$65,280</div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3 border border-white border-opacity-20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-blue-100">恐慌指數</span>
                <div className="bg-blue-500 bg-opacity-20 rounded-full px-2 py-0.5">
                  <span className="text-xs text-blue-300">適中</span>
                </div>
              </div>
              <div className="text-lg font-bold text-white">15.2</div>
            </div>
          </div>

          {/* 導航標籤 - 更現代的設計 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-1 inline-flex border border-white border-opacity-20">
            {["overview", "news", "alerts"].map((tab) => (
              <button
                key={tab}
                className={`${
                  activeTab === tab
                    ? "bg-white text-indigo-700 shadow-md"
                    : "text-white hover:bg-white hover:bg-opacity-10"
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
            {/* 移除重複的「今日市場重點」區塊，改為顯示更多深入分析和其他市場指標 */}
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
                      <span className="text-green-500 font-medium">17,935</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">漲跌幅</span>
                      <span className="text-green-500 font-medium">+0.70%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">成交量</span>
                      <span className="text-gray-800 font-medium">2,835億</span>
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
                      <span className="text-red-500 font-medium">38,790</span>
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

                {/* 國際匯率卡片 - 保留 */}
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

                {/* 經濟指標卡片 - 保留 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      經濟指標
                    </h3>
                    <HeartIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">美國CPI</span>
                      <span className="text-gray-800 font-medium">3.4%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">美國失業率</span>
                      <span className="text-gray-800 font-medium">3.9%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fed利率</span>
                      <span className="text-gray-800 font-medium">5.25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 分析工具 - 增加間距和視覺分隔 */}
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
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <SparklesIcon className="h-6 w-6 text-purple-600 mr-2" />
                AI 智能市場洞察
              </h2>

              <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-purple-100">
                {/* 頂部標題區 */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
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
                      <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors">
                        <ArrowPathIcon className="h-4 w-4 text-white" />
                      </button>
                      <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors">
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
                      本週市場呈現震盪格局，科技股表現較強，
                      <span className="font-medium text-blue-600">
                        金融股表現平淡
                      </span>
                      。通膨數據好於預期，可能支持央行降息預期，適合加碼布局成長股與科技龍頭。
                      加密貨幣市場出現回升跡象，比特幣站穩65,000美元。
                    </p>
                  </div>

                  {/* 三欄數據分析 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* 關注焦點 */}
                    <div className="bg-blue-50 rounded-lg p-5 border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-3">
                        <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-gray-800">關注焦點</h4>
                      </div>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                          <span>台積電海外擴產進度</span>
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                          <span>美國非農就業數據</span>
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                          <span>歐洲央行利率決議</span>
                        </li>
                      </ul>
                    </div>

                    {/* 投資機會 */}
                    <div className="bg-green-50 rounded-lg p-5 border border-green-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-3">
                        <LightBulbIcon className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-medium text-gray-800">投資機會</h4>
                      </div>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span>AI相關應用產業</span>
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span>低估值高股息標的</span>
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span>長線布局能源轉型</span>
                        </li>
                      </ul>
                    </div>

                    {/* 風險提示 */}
                    <div className="bg-red-50 rounded-lg p-5 border border-red-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-3">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                        <h4 className="font-medium text-gray-800">風險提示</h4>
                      </div>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                          <span>地緣政治緊張加劇</span>
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                          <span>高估值科技股修正</span>
                        </li>
                        <li className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                          <span>通膨預期反轉風險</span>
                        </li>
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
