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
    <div className="container py-5">
      <Head>
        <title>即時金融新聞</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/style.css" />
      </Head>
      <div className="header text-center">
        <h1 className="display-5 mb-3">📈 即時金融新聞總覽</h1>
        <p className="lead">來自 Google News 的即時金融報導</p>
        <form onSubmit={handleSubmit} className="row justify-content-center mb-4">
          <div className="col-auto">
            <input
              type="text"
              className="form-control"
              placeholder="請輸入關鍵字查詢"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-primary">
              查詢
            </button>
          </div>
        </form>
      </div>
      <div className="row row-cols-1 row-cols-md-2 g-4" id="newsList">
        {loading ? (
          <p>載入中...</p>
        ) : news.length === 0 ? (
          <div className="col">
            <div className="alert alert-warning">查無相關新聞</div>
          </div>
        ) : (
          news.map((article, idx) => (
            <div className="col" key={idx}>
              <div className="card h-100 p-3">
                <div className="card-body">
                  <h5 className="card-title">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dark"
                    >
                      {article.title}
                    </a>
                  </h5>
                  <p className="card-text text-muted small">來自 Google News</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
