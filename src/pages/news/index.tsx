import React, { useState, useEffect, FormEvent } from "react";
import Head from "next/head";
import {
  NewspaperIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Footer from "@/components/Layout/Footer";

// 定義 NewsItem 型別
type NewsItem = {
  title: string;
  link: string;
  source: string;
  pubDate: string;
};

export default function NewsPage() {
  const [query, setQuery] = useState("金融"); // 查詢關鍵字
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");

  const fetchNews = async (q: string) => {
    setLoading(true);
    const res = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    });
    const data = await res.json();
    setNews(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews(query);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchNews(query);
    setSearchedQuery(query.trim());
  };

  // 新增重整按鈕的事件
  const handleReset = () => {
    fetchNews(query);
  };

  return (
    <>
      <div className="min-h-screen">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        {/* Header Section */}
        <section className="relative bg-linear-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center overflow-hidden shadow-2xl">
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

          {/* Enhanced Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-12 left-12 w-24 h-24 bg-white opacity-5 rounded-full animate-pulse"></div>
            <div
              className="absolute bottom-12 right-24 w-36 h-36 bg-white opacity-5 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial from-white/10 to-transparent rounded-full"></div>

            {/* Enhanced floating elements */}
            <div className="absolute top-24 right-12 w-4 h-4 bg-white opacity-20 rounded-full animate-bounce"></div>
            <div
              className="absolute bottom-24 left-24 w-3 h-3 bg-white opacity-30 rounded-full animate-pulse"
              style={{ animationDelay: "1.5s" }}
            ></div>
            <div
              className="absolute top-48 left-1/4 w-5 h-5 bg-white opacity-15 rounded-full animate-bounce"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute top-32 right-1/3 w-2 h-2 bg-white opacity-25 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 z-10 w-full">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center mb-6">
                  <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm mr-6 group hover:bg-white/20 transition-all duration-300 shadow-lg">
                    <NewspaperIcon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                      即時金融新聞
                    </h1>
                    <p className="text-blue-200 mt-3 text-xl font-medium">
                      來自 Google News 的即時金融報導
                    </p>
                  </div>
                </div>
                <p className="text-blue-200 text-xl max-w-3xl leading-relaxed mb-8">
                  掌握最新的金融市場動態，獲取及時準確的財經資訊與市場分析
                </p>

                {/* Search Form */}
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-4 max-w-2xl"
                >
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-white/40 transition-all duration-300 text-lg"
                      placeholder="請輸入關鍵字查詢..."
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-8 py-4 bg-white text-blue-900 font-bold rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden group flex items-center gap-2"
                    >
                      <span className="absolute inset-0 bg-linear-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity"></span>
                      <MagnifyingGlassIcon className="h-5 w-5 relative" />
                      <span className="relative">查詢</span>
                    </button>
                    <button
                      type="button"
                      className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 group"
                      onClick={handleReset}
                    >
                      <ArrowPathIcon className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                      <span>重整</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Enhanced Statistics Panel */}
              <div className="flex flex-col lg:items-end space-y-4">
                <div className="grid grid-cols-2 gap-6 lg:gap-8">
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                    <div className="text-3xl font-bold text-white">
                      {news.length}
                    </div>
                    <div className="text-blue-200 text-sm font-medium">
                      新聞數量
                    </div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                    <div className="text-3xl font-bold text-white">即時</div>
                    <div className="text-blue-200 text-sm font-medium">
                      更新頻率
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="relative bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-64 h-64 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-linear-to-br from-indigo-100 to-purple-100 rounded-full opacity-20 blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
            <div className="grid gap-6" id="newsList">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div
                      className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin"
                      style={{
                        animationDelay: "0.3s",
                        animationDuration: "1.2s",
                      }}
                    ></div>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-700 mb-2">
                      載入中...
                    </p>
                    <p className="text-gray-500">正在為您搜尋最新的金融新聞</p>
                  </div>
                </div>
              ) : news.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="w-24 h-24 bg-linear-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
                    <svg
                      className="w-12 h-12 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33"
                      />
                    </svg>
                  </div>
                  <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-yellow-200/50 max-w-md">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      查無相關新聞
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      很抱歉，目前沒有找到與「
                      <span className="font-semibold text-blue-600">
                        {searchedQuery}
                      </span>
                      」相關的新聞。
                    </p>
                    <p className="text-sm text-gray-500 mt-3">
                      請嘗試其他關鍵字或稍後再試
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    {news.map((article, idx) => (
                      <div
                        className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-2xl hover:border-blue-300/50 transition-all duration-300 hover:-translate-y-1"
                        key={idx}
                      >
                        {/* Hover effect background */}
                        <div className="absolute inset-0 bg-linear-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                        <div className="relative flex items-start gap-4">
                          <div className="shrink-0 mt-1">
                            <div className="w-3 h-3 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 shadow-lg group-hover:scale-125 transition-transform duration-300"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 group-hover:bg-blue-200 transition-colors duration-300">
                                {article.source}
                              </span>
                              <span className="text-sm text-gray-500">
                                {article.pubDate}
                              </span>
                            </div>
                            <a
                              href={article.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block group/link"
                            >
                              <h3 className="text-lg font-semibold text-gray-800 group-hover/link:text-blue-600 transition-colors duration-300 leading-relaxed mb-2 line-clamp-3">
                                {article.title}
                              </h3>
                              <div className="flex items-center text-sm text-blue-600 font-medium group-hover/link:text-blue-700 transition-colors duration-300">
                                <span>閱讀全文</span>
                                <svg
                                  className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
