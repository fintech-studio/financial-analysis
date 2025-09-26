import React, { useState, useEffect, FormEvent } from "react";
import Head from "next/head";
import { NewspaperIcon } from "@heroicons/react/24/outline";
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
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center overflow-hidden shadow-2xl">
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
          <div className="absolute bottom-12 right-24 w-36 h-36 bg-white opacity-5 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial from-white/10 to-transparent rounded-full"></div>

          {/* Enhanced floating elements */}
          <div className="absolute top-24 right-12 w-4 h-4 bg-white opacity-20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-24 left-24 w-3 h-3 bg-white opacity-30 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }}></div>
          <div className="absolute top-48 left-1/4 w-5 h-5 bg-white opacity-15 rounded-full animate-bounce" style={{ animationDelay: "2s" }}></div>
          <div className="absolute top-32 right-1/3 w-2 h-2 bg-white opacity-25 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 z-10 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm mr-6 group hover:bg-white/20 transition-all duration-300 shadow-lg">
                  <NewspaperIcon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
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
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="submit" 
                    className="px-8 py-4 bg-white text-blue-900 font-bold rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity"></span>
                    <span className="relative">查詢</span>
                  </button>
                  <button
                    type="button"
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    onClick={handleReset}
                  >
                    重整
                  </button>
                </div>
              </form>
            </div>

            {/* Enhanced Statistics Panel */}
            <div className="flex flex-col lg:items-end space-y-4">
              <div className="grid grid-cols-2 gap-6 lg:gap-8">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-3xl font-bold text-white">{news.length}</div>
                  <div className="text-blue-200 text-sm font-medium">新聞數量</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-3xl font-bold text-white">即時</div>
                  <div className="text-blue-200 text-sm font-medium">更新頻率</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="grid gap-4" id="newsList">
            {loading ? (
              <p className="text-center text-gray-500">載入中...</p>
            ) : news.length === 0 ? (
              <div>
                <div className="alert alert-warning">查無相關新聞</div>
              </div>
            ) : (
              news.map((article, idx) => (
                <div
                  className="flex items-start gap-2 p-4 bg-white rounded shadow"
                  key={idx}
                >
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
                  <div>
                    <div className="text-sm font-semibold text-gray-700">
                      {article.source}
                    </div>
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-base font-medium text-blue-700 hover:underline"
                    >
                      {article.title}
                    </a>
                    <div className="text-xs text-gray-400">{article.pubDate}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
      <Footer />
      </>
  );
}
