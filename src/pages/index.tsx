import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  SparklesIcon,
  NewspaperIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  BriefcaseIcon,
  ChartBarIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { FaGithub } from "react-icons/fa";
import dynamic from "next/dynamic";
import Wave from "@/components/Wave";

// 動態引入元件以改善首次載入效能
const TerminalAnimation = dynamic(
  () => import("@/components/Animation/TerminalAnimation"),
  { ssr: false }
);

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("stocks");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 監聽滾動事件
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 處理搜尋
  interface SearchEvent {
    preventDefault: () => void;
  }

  const handleSearch = (e: SearchEvent): void => {
    e.preventDefault();
    if (searchQuery) {
      // 實作搜尋功能
      console.log("搜尋:", searchQuery);
    }
  };

  // 導覽選項 - 重新設計結構
  const navigationItems = [
    {
      name: "市場分析",
      href: "/market-analysis",
      icon: ChartBarIcon,
      description: "即時市場動態與技術分析",
      hasDropdown: true,
      subItems: [
        {
          name: "股票分析",
          href: "/market-analysis/stocks",
          icon: ChartBarIcon,
          description: "台股、美股即時分析",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        },
        {
          name: "加密貨幣",
          href: "/market-analysis/crypto",
          icon: CurrencyDollarIcon,
          description: "數位資產市場動態",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
        },
        {
          name: "全球市場",
          href: "/market-analysis/global",
          icon: GlobeAltIcon,
          description: "國際指數與外匯",
          color: "text-green-600",
          bgColor: "bg-green-50",
        },
        {
          name: "AI 智能預測",
          href: "/market-analysis/ai-predictions",
          icon: SparklesIcon,
          description: "機器學習市場預測",
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        },
      ],
    },
    {
      name: "投資組合",
      href: "/portfolio",
      icon: BriefcaseIcon,
      description: "智能投資組合管理",
      hasDropdown: false,
    },
    {
      name: "財經新聞",
      href: "/news",
      icon: NewspaperIcon,
      description: "AI 精選全球財經資訊",
      hasDropdown: false,
    },
    {
      name: "社群討論",
      href: "/community",
      icon: ChatBubbleLeftRightIcon,
      description: "投資者交流平台",
      hasDropdown: false,
    },
  ];

  return (
    <>
      {/* 重新設計的導覽列 */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200/50"
            : "bg-white/5 backdrop-blur-md border-b border-white/10"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            {/* 左側 - 品牌Logo區域 */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-xl font-bold transition-colors duration-300 ${
                      isScrolled ? "text-gray-900" : "text-white"
                    } group-hover:text-blue-600`}
                  >
                    FinTech
                  </span>
                  <span
                    className={`text-xs ${
                      isScrolled ? "text-gray-500" : "text-blue-200/80"
                    } font-medium`}
                  >
                    智慧投資平台
                  </span>
                </div>
              </Link>
            </div>

            {/* 中間 - 導覽連結區域 (桌面版) - 修正滑鼠感應區域 */}
            <div className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() =>
                    item.hasDropdown && setOpenDropdown(item.name)
                  }
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`group flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                      isScrolled
                        ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50/80"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="h-5 w-5 transition-transform group-hover:scale-110 duration-200" />
                    <span className="font-medium text-sm">{item.name}</span>
                    {item.hasDropdown && (
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform duration-200 ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    )}

                    {/* 懸停效果背景 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>

                  {/* 下拉選單 - 移除間距並添加連接橋樑 */}
                  {item.hasDropdown && openDropdown === item.name && (
                    <>
                      {/* 隱形的連接橋樑 - 填補空隙 */}
                      <div className="absolute top-full left-0 w-full h-1 bg-transparent"></div>

                      {/* 下拉選單主體 */}
                      <div className="absolute top-full left-0 pt-1 w-60 z-50">
                        <div className="bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 py-0 animate-fade-in-down">
                          {/* 子項目列表 */}
                          <div className="px-3 py-2">
                            {item.subItems?.map((subItem, index) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className="group flex items-start p-3 rounded-xl hover:bg-gray-50/80 transition-all duration-200 mb-1"
                              >
                                {/* 圖標區域 */}
                                <div
                                  className={`w-10 h-10 ${subItem.bgColor} rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200`}
                                >
                                  {typeof subItem.icon === "string" ? (
                                    <span className="text-lg">
                                      {subItem.icon}
                                    </span>
                                  ) : (
                                    <subItem.icon
                                      className={`h-5 w-5 ${subItem.color}`}
                                    />
                                  )}
                                </div>

                                {/* 內容區域 */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4
                                      className={`font-semibold text-sm text-gray-900 group-hover:${subItem.color} transition-colors`}
                                    >
                                      {subItem.name}
                                    </h4>
                                    <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-700 transition-colors">
                                    {subItem.description}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* 右側 - 操作區域 */}
            <div className="flex items-center space-x-3">
              {/* 搜尋按鈕 (桌面版) */}
              <button
                className={`hidden md:flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                  isScrolled
                    ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {/* 登入/註冊按鈕 */}
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/auth"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium text-sm shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-105"
                >
                  登入
                </Link>
              </div>

              {/* 手機版選單按鈕 */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2.5 rounded-xl transition-all duration-300 ${
                  isScrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* 手機版下拉選單 - 重新設計 */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white/98 backdrop-blur-xl border-b border-gray-200/50 shadow-2xl">
              <div className="px-4 py-6 space-y-1">
                {/* 手機版搜尋框 */}
                <div className="mb-6">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜尋股票、新聞、討論..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* 導覽項目 */}
                {navigationItems.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-4 px-4 py-4 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <item.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-base">
                          {item.name}
                        </span>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </Link>
                  </div>
                ))}

                {/* 手機版操作按鈕 */}
                <div className="pt-6 mt-6 border-t border-gray-200 space-y-3">
                  <Link
                    href="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-3 text-gray-700 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <UserIcon className="h-5 w-5 mr-2" />
                    登入帳戶
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main>
        {/* Hero Section - 漸變背景與波浪效果 */}
        <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-violet-900 flex items-center overflow-hidden">
          {/* 動態背景裝飾 */}
          <div className="absolute inset-0">
            {/* 浮動圓點裝飾 */}
            <div className="absolute top-20 right-[20%] w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 left-[10%] w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
            <div className="absolute top-40 left-[15%] w-36 h-36 bg-violet-400/30 rounded-full blur-2xl"></div>
          </div>

          <div className="container mx-auto px-4 pt-24 pb-24 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* 左側內容 */}
              <div className="space-y-10">
                <div className="animate-fade-in-up">
                  <h1 className="mt-8 text-5xl md:text-6xl xl:text-7xl font-bold leading-tight">
                    <span className="text-white">大數據驅動</span>
                    <br />
                    <div className="mt-2 inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-300 to-purple-200">
                      智慧投資決策
                    </div>
                  </h1>

                  <p className="mt-6 text-blue-100/90 text-xl max-w-xl leading-relaxed">
                    運用人工智能與大數據分析，提供專業市場洞察、風險評估與個人化投資建議，
                    讓您在複雜多變的金融市場中做出明智決策。
                  </p>
                </div>

                {/* 搜尋區塊 - 重新設計 */}
                <div className="max-w-xl animation-delay-400">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-30"></div>
                    <div className="relative bg-white/10 backdrop-blur-xl rounded-xl p-1.5">
                      {/* 搜尋類型標籤 */}
                      <div className="flex mb-2 px-2 pt-1">
                        {[
                          { id: "stocks", name: "股票" },
                          { id: "crypto", name: "加密貨幣" },
                          { id: "etf", name: "ETF" },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 rounded-lg mr-1 text-sm transition-all ${
                              activeTab === tab.id
                                ? "bg-white/20 text-white"
                                : "text-blue-200 hover:bg-white/10"
                            }`}
                          >
                            {tab.name}
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleSearch} className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={
                            activeTab === "stocks"
                              ? "輸入股票代號或公司名稱..."
                              : activeTab === "crypto"
                              ? "輸入加密貨幣名稱..."
                              : "輸入ETF代號..."
                          }
                          className="w-full px-6 py-4 pr-36 rounded-lg
                          bg-white/10
                          border border-white/20
                          text-white placeholder-blue-200/70
                          focus:outline-none focus:ring-2 focus:ring-blue-400/40
                          transition duration-200"
                        />
                        <Link
                          href={`/ai-prediction/${activeTab}/${searchQuery}`}
                          type="submit"
                          className="absolute right-2 top-1/2 -translate-y-1/2
                          bg-gradient-to-r from-blue-500 to-indigo-500
                          hover:from-blue-600 hover:to-indigo-600
                          text-white px-6 py-2.5 rounded-lg
                          flex items-center space-x-2
                          transition-all duration-200
                          shadow-lg shadow-indigo-500/30"
                        >
                          <SparklesIcon className="h-5 w-5" />
                          <span>AI 預測</span>
                        </Link>
                      </form>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-blue-200/80">
                    <span>熱門搜尋：</span>
                    {["台積電", "聯發科", "鴻海", "緯創"].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="px-2.5 py-1 rounded-full border border-blue-400/30 hover:bg-blue-500/20 hover:text-white transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 右側終端機 - 改進設計 */}
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
                        FinTech Terminal
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
                <div className="absolute -right-8 bottom-20 transform rotate-6 bg-gradient-to-r from-blue-600/90 to-blue-500/90 px-3 py-2 rounded-lg shadow-lg text-white text-xs flex items-center backdrop-blur-sm border border-blue-400/30 group-hover:scale-105 transition-transform">
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
                  <span>實時分析</span>
                </div>

                {/* 新增第二個資訊卡片 */}
                <div className="absolute -right-8 top-44 transform -rotate-6 bg-gradient-to-r from-emerald-600/80 to-emerald-500/80 px-3 py-2 rounded-lg shadow-lg text-white text-xs flex items-center backdrop-blur-sm border border-emerald-400/30">
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
                  <span>安全連線</span>
                </div>

                {/* 新增第三個資訊卡片 */}
                <div className="absolute -right-8 top-20 transform rotate-6 bg-gradient-to-r from-purple-600/80 to-purple-500/80 px-3 py-2 rounded-lg shadow-lg text-white text-xs flex items-center backdrop-blur-sm border border-purple-400/30">
                  <svg
                    className="h-3.5 w-3.5 mr-1.5 text-purple-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4m16 0a8 8 0 11-16 0 8 8 0 0116 0z"
                    />
                  </svg>
                  <span>即時更新</span>
                </div>
              </div>
            </div>
          </div>

          {/* 波浪裝飾 */}
          <Wave />
        </section>

        {/* 功能區塊 - 重新設計 */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                智慧金融工具，讓您決策無憂
              </h2>
              <p className="text-xl text-gray-600">
                整合多元化的功能與工具，協助您在投資路上走得更穩健
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Link
                  key={feature.title}
                  href={feature.link}
                  className={`group bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:border-blue-200 transition-all duration-300 block hover:shadow-xl relative flex flex-col `}
                >
                  <div>
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.iconBg} mb-6 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon
                        className={`h-7 w-7 ${feature.iconColor}`}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="mt-auto inline-flex items-center text-blue-600 group-hover:text-blue-700 font-medium">
                    探索功能
                    <ChevronRightIcon className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 頁腳 */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <a
              href="https://github.com/HaoXun97/financial-analysis"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
            >
              <FaGithub className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
            </a>
            <p>
              &copy; {new Date().getFullYear()} FinTech Studio 保留所有權利。
            </p>
          </div>
        </div>
      </footer>

      {/* 根據需要添加全域樣式 */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </>
  );
}

const features = [
  {
    title: "市場分析",
    description:
      "運用 AI 分析全球金融市場動態，提供即時市場趨勢、技術分析與基本面分析，協助您掌握投資先機",
    icon: ChartBarIcon,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    link: "/market-analysis",
  },
  {
    title: "投資組合",
    description:
      "智能投資組合管理系統，追蹤績效表現、風險評估，並提供最佳化建議，讓您的資產配置更有效率",
    icon: BriefcaseIcon,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    link: "/portfolio",
  },
  {
    title: "財經新聞",
    description:
      "AI 精選與分析全球財經新聞，即時掌握市場脈動，為您提供關鍵投資訊息與市場洞察",
    icon: NewspaperIcon,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    link: "/news",
  },
  {
    title: "社群討論",
    description:
      "連結專業投資者社群，分享投資心得與策略，集結群體智慧，擴展投資視野",
    icon: ChatBubbleLeftRightIcon,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    link: "/community",
  },
];

Home.hideNavigation = true;
