import React, { useState, useEffect, FormEvent } from "react";
import Head from "next/head";

type NewsItem = {
  title: string;
  link: string;
};

export default function NewsPage() {
  const [query, setQuery] = useState("金融");
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
    setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews(query);
    // eslint-disable-next-line
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchNews(query);
  };

  return (
    <div className="container-responsive py-8">
      <Head>
        <title>即時金融新聞</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="header text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 gradient-text-primary">📈 即時金融新聞總覽</h1>
        <p className="lead text-gray-600 mb-4">來自 Google News 的即時金融報導</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center gap-2 mb-4">
          <input
            type="text"
            className="input-field max-w-xs"
            placeholder="請輸入關鍵字查詢"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            查詢
          </button>
        </form>
      </div>
      <div className="grid-responsive" id="newsList">
        {loading ? (
          <p className="text-center text-gray-500">載入中...</p>
        ) : news.length === 0 ? (
          <div>
            <div className="alert alert-warning">查無相關新聞</div>
          </div>
        ) : (
          news.map((article, idx) => (
            <div className="card-responsive card animate-fadeIn" key={idx}>
              <div className="card-body">
                <h5 className="card-title mb-2">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article.title}
                  </a>
                </h5>
                <p className="card-text text-sm text-gray-500">來自 Google News</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
