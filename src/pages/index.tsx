import React, { useCallback } from "react";
import Link from "next/link";
import {
  SparklesIcon,
  NewspaperIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  BriefcaseIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import Wave from "@/components/Wave";
import Footer from "@/components/Layout/Footer";

// 增強的Hook引入
import { useFormController } from "@/hooks/useMvcController";

// 動態引入元件以改善首次載入效能
const TerminalAnimation = dynamic(
  () => import("@/components/Animation/TerminalAnimation"),
  { ssr: false }
);

export default function Home() {
  // 搜尋表單管理 - 穩定的 validator 函數
  const searchValidator = useCallback(
    (values: { query: string; type: string }) => ({
      query: !values.query.trim() ? "請輸入搜尋內容" : null,
    }),
    []
  );

  const searchSubmitHandler = useCallback(
    async (values: { query: string; type: string }) => {
      try {
        console.log("搜尋:", values.query, values.type);
        // 這裡可以導航到搜尋結果頁面
      } catch (error) {
        console.error("搜尋失敗:", error);
      }
    },
    []
  );

  const {
    values: searchValues,
    errors: searchErrors,
    setValue: setSearchValue,
    handleSubmit: handleSearchSubmit,
    submitting: searchSubmitting,
  } = useFormController(
    { query: "", type: "stocks" as const },
    searchSubmitHandler,
    searchValidator
  );

  // 處理搜尋
  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await handleSearchSubmit();
      } catch (error) {
        console.error("搜尋提交失敗:", error);
      }
    },
    [handleSearchSubmit]
  );

  return (
    <>
      <main>
        {/* Hero Section - 漸變背景與波浪效果 */}
        <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center overflow-hidden mt-[-60px]">
          {/* 動態網格背景 */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
                backgroundSize: "50px 50px",
              }}
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center min-h-screen py-20">
              {/* 主標題 */}
              <div className="space-y-6 lg:space-y-8">
                <div className="animate-fade-in-up ">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                    <span className="block text-white">未來金融</span>
                    <div className="relative">
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 animate-gradient">
                        智慧投資決策
                      </span>
                      {/* 文字光效 */}
                      <div className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 blur-sm opacity-50 animate-pulse"></div>
                    </div>
                  </h1>

                  <p className="mt-6 lg:mt-8 text-blue-100/90 text-lg lg:text-xl max-w-2xl leading-relaxed">
                    運用前沿 AI 技術與大數據分析，為您提供個人化投資洞察、
                    <span className="text-blue-300 font-semibold">
                      智能風險管理
                    </span>
                    與
                    <span className="text-purple-300 font-semibold">
                      精準市場預測
                    </span>
                    ，讓投資決策更加明智且高效。
                  </p>
                </div>

                {/* 搜尋區塊 - 使用Hook管理 */}
                <div className="max-w-2x1">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-xl blur opacity-40"></div>
                    <div className="relative bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-lg">
                      {/* 搜尋類型選擇標籤 */}
                      <div className="flex gap-2 mb-4">
                        {[
                          { key: "stocks", label: "股票" },
                          { key: "crypto", label: "加密貨幣" },
                          { key: "etf", label: "ETF" },
                        ].map((type) => (
                          <button
                            key={type.key}
                            onClick={() => setSearchValue("type", type.key)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                              searchValues.type === type.key
                                ? "bg-white/20 text-white border border-white/30 shadow-md"
                                : "text-white/70 hover:text-white hover:bg-white/10 border border-white/15 hover:border-white/25"
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>

                      {/* 搜尋輸入框容器 */}
                      <div className="relative">
                        <form onSubmit={handleSearch} className="relative">
                          <div className="relative">
                            <input
                              type="text"
                              value={searchValues.query}
                              onChange={(e) =>
                                setSearchValue("query", e.target.value)
                              }
                              placeholder={
                                searchValues.type === "stocks"
                                  ? "輸入股票代號或公司名稱..."
                                  : searchValues.type === "crypto"
                                  ? "輸入加密貨幣名稱..."
                                  : "輸入ETF代號..."
                              }
                              className="w-full px-4 py-3 pr-28 rounded-lg bg-white/10 border border-white/25 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400/40 transition-all duration-300 backdrop-blur-sm"
                            />
                            <button
                              type="submit"
                              disabled={searchSubmitting}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-4 py-2 rounded-md flex items-center space-x-1.5 transition-all duration-300 shadow-md hover:shadow-blue-500/25 disabled:opacity-50"
                            >
                              {searchSubmitting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <SparklesIcon className="h-4 w-4" />
                              )}
                              <span className="text-sm font-medium">
                                {searchSubmitting ? "搜尋中" : "AI 預測"}
                              </span>
                            </button>
                          </div>
                        </form>

                        {/* 顯示搜尋錯誤 */}
                        {searchErrors.query && (
                          <p className="text-red-300 text-sm mt-2 ml-4">
                            {searchErrors.query}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 熱門搜尋標籤 */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-white/70 font-medium">
                      熱門搜尋：
                    </span>
                    {["台積電", "聯發科", "鴻海", "緯創"].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchValue("query", term)}
                        className="px-3 py-1 rounded-full bg-white/8 border border-white/15 text-white/80 hover:bg-white/15 hover:text-white hover:border-white/30 transition-all duration-300 backdrop-blur-sm hover:scale-105"
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
                  </div>

                  {/* 終端機主體 */}
                  <div
                    className="text-gray-200 font-mono text-sm h-80 relative"
                    style={{ overflow: "hidden" }}
                  >
                    <div className="p-4 relative h-full">
                      <TerminalAnimation />
                    </div>
                  </div>

                  {/* 終端機底部狀態列 */}
                  <div className="bg-gray-800/70 px-3 py-1.5 border-t border-gray-700/40 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-green-500"></span>
                      已連接
                    </div>
                    <div className="flex items-center space-x-3">
                      <span>12ms 延遲</span>
                      <span>|</span>
                      <span>TLS 1.3 加密</span>
                    </div>
                  </div>
                </div>

                {/* 浮動資訊卡片 */}
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
        <section className="py-12 bg-slate-50 ">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <SparklesIcon className="w-4 h-4 mr-2" />
                核心功能
              </div>
              <div className="max-w-3xl mx-auto text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  智慧金融工具，讓您決策無憂
                </h2>
                <p className="text-xl text-gray-600">
                  整合多元化的功能與工具，協助您在投資路上走得更穩健
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <Link
                  key={feature.title}
                  href={feature.link}
                  className={`group bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl relative flex flex-col `}
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

      <Footer />

      {/* 根據需要添加全域樣式 */}
      <style>{`
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
