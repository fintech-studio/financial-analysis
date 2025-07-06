import React, { useState, useEffect, FormEvent } from "react";
import Head from "next/head";
import { NewspaperIcon } from "@heroicons/react/24/outline";

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
    // 只在初始時查詢一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="container-responsive py-8">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="header text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <NewspaperIcon className="inline-block w-8 h-8 mr-2 text-blue-600" />
          <h1 className="text-3xl font-bold mb-2 gradient-text-primary">
            即時金融新聞總覽
          </h1>
        </div>
        <p className="lead text-gray-600 mb-4">
          來自 Google News 的即時金融報導
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row justify-center gap-2 mb-4"
        >
          <input
            type="text"
            className="input-field max-w-xs"
            placeholder="請輸入關鍵字查詢"
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            查詢
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
          >
            重整
          </button>
        </form>
      </div>
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
  );
}
