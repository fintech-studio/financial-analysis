import React, { useState } from "react";
import Link from "next/link";
import TerminalAnimation from "@/components/Animation/TerminalAnimation";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  NewspaperIcon,
  FireIcon,
  SparklesIcon,
  BuildingLibraryIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  RectangleGroupIcon,
} from "@heroicons/react/24/outline";
import { marketData } from "@/data/marketData";
import { Tab } from "@headlessui/react";
import TrendChart from "@/components/Charts/TrendChart";
import MarketSentimentCard from "@/components/Cards/MarketSentimentCard";
import HotStockTable from "@/components/Tables/HotStockTable";
import NewsCard from "@/components/Cards/NewsCard";
import SectorPerformanceChart from "@/components/Charts/SectorPerformanceChart";
import EducationResourceCard from "@/components/Cards/EducationResourceCard";

export default function Home() {
  const [timeRange, setTimeRange] = useState("1d");
  const [customizeMode, setCustomizeMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 頂部歡迎區塊 */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16 relative overflow-hidden">
          {/* 裝飾元素 - 增強視覺層次感 */}
          <div className="absolute -top-24 right-0 w-72 h-72 bg-indigo-500 opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-blue-300 opacity-10 rounded-full blur-2xl"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* 左側：主標題區域 */}
            <div className="relative z-10">
              <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  <span className="text-white drop-shadow-md">
                    智慧金融分析
                  </span>
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-50 drop-shadow-sm">
                    做出明智投資決策
                  </span>
                </h1>
                <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
                  結合 AI 科技與專業金融智慧，幫助您掌握市場脈動、發現投資機會
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/market-analysis">
                    <button className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      開始探索市場
                    </button>
                  </Link>
                  <button className="backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    觀看功能導覽
                  </button>
                </div>
              </div>
            </div>

            {/* 右側：終端機動畫 */}
            <div className="relative z-10 hidden lg:block">
              <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-gray-700/30 transition-all duration-300 hover:shadow-blue-900/30 group">
                {/* 終端機頂部 - 優化設計 */}
                <div className="bg-gray-800/90 px-4 py-2.5 flex items-center border-b border-gray-700/40 backdrop-blur-sm">
                  <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors cursor-pointer"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-400 transition-colors cursor-pointer"></div>
                  </div>
                  <div className="text-gray-300 text-sm font-mono flex-1 text-center font-medium flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                    <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-indigo-300 transition-all">
                      智能投資終端
                    </span>
                    <span className="ml-1.5 text-xs px-1.5 py-0.5 bg-blue-600/30 rounded-md text-blue-300 border border-blue-500/20">
                      v3.2.1
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 ml-4"></div>
                </div>

                {/* 終端機主體 */}
                <div
                  className="text-gray-200 font-mono text-sm h-80 relative"
                  style={{ overflow: "hidden" }}
                >
                  {/* 增加陰影效果 */}
                  <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-gray-900/40 to-transparent pointer-events-none z-10"></div>

                  {/* 終端機內容 */}
                  <div className="p-4 relative h-full">
                    <TerminalAnimation />
                  </div>

                  {/* 底部漸層效果 */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900/80 to-transparent pointer-events-none"></div>
                </div>

                {/* 終端機底部狀態列 */}
                <div className="bg-gray-800/70 px-3 py-1.5 border-t border-gray-700/40 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                    已連接
                  </div>
                  <div className="flex items-center space-x-3">
                    <span>12ms 延遲</span>
                    <span>|</span>
                    <span>TLS 1.3 加密</span>
                  </div>
                </div>
              </div>

              {/* 重新設計浮動資訊卡片 */}
              <div className="absolute -right-4 top-16 transform rotate-6 bg-gradient-to-r from-blue-600/90 to-blue-500/90 px-3 py-2 rounded-lg shadow-lg text-white text-xs flex items-center backdrop-blur-sm border border-blue-400/30 group-hover:scale-105 transition-transform">
                <div className="absolute inset-0 bg-blue-600 animate-pulse-slow opacity-30 rounded-lg"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 mr-1.5 text-blue-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>即時分析中</span>
              </div>

              {/* 新增第二個資訊卡片 */}
              <div className="absolute -left-20 bottom-16 transform -rotate-6 bg-gradient-to-r from-emerald-600/80 to-emerald-500/80 px-3 py-2 rounded-lg shadow-lg text-white text-xs flex items-center backdrop-blur-sm border border-emerald-400/30">
                <svg
                  className="h-3.5 w-3.5 mr-1.5 text-emerald-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>安全連接</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 快速導覽卡片 - 全新設計 */}
      <div className="container mx-auto px-4 -mt-10 mb-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 股票分析卡片 */}
          <Link
            href="/market-analysis/stock"
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl mr-4">
                  <ChartBarIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                    股票分析
                  </h3>
                  <p className="text-gray-500 mt-1 mb-3 line-clamp-2">
                    探索台股市場趨勢動態
                  </p>
                </div>
              </div>
              <div className="flex items-center text-sm text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                立即查看
                <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
              </div>
            </div>
          </Link>

          {/* 加密貨幣卡片 */}
          <Link
            href="/market-analysis/crypto"
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl mr-4">
                  <CurrencyDollarIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-purple-600 transition-colors">
                    加密貨幣
                  </h3>
                  <p className="text-gray-500 mt-1 mb-3 line-clamp-2">
                    了解虛擬貨幣市場動態
                  </p>
                </div>
              </div>
              <div className="flex items-center text-sm text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
                立即查看
                <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
              </div>
            </div>
          </Link>

          {/* 投資組合卡片 */}
          <Link
            href="/portfolio"
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl mr-4">
                  <BuildingLibraryIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors">
                    投資組合
                  </h3>
                  <p className="text-gray-500 mt-1 mb-3 line-clamp-2">
                    管理您的資產與投資表現
                  </p>
                </div>
              </div>
              <div className="flex items-center text-sm text-emerald-600 font-medium group-hover:translate-x-1 transition-transform">
                立即查看
                <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
              </div>
            </div>
          </Link>

          {/* 智能預測卡片 */}
          <Link
            href="/ai-prediction"
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="h-2 bg-gradient-to-r from-amber-500 to-amber-600"></div>
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl mr-4">
                  <SparklesIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-amber-600 transition-colors">
                    智能預測
                  </h3>
                  <p className="text-gray-500 mt-1 mb-3 line-clamp-2">
                    AI驅動的市場趨勢預測
                  </p>
                </div>
              </div>
              <div className="flex items-center text-sm text-amber-600 font-medium group-hover:translate-x-1 transition-transform">
                立即查看
                <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 底部CTA區塊 */}
    </div>
  );
}
