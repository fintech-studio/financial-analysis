import React from "react";
import Link from "next/link";
import { ClockIcon } from "@heroicons/react/24/outline";

export interface NewsItem {
  id: string;
  title: string;
  source: string; // 新聞來源
  publishedAt: string; // ISO時間字符串
  summary?: string; // 新聞摘要
  url: string;
  imageUrl?: string; // 可選的圖片URL
  sentiment?: "positive" | "negative" | "neutral"; // 情緒分析
  category?: string; // 新聞類別
  related?: {
    stocks?: string[]; // 相關股票代碼
    sectors?: string[]; // 相關產業
  };
}

interface NewsCardProps {
  news: NewsItem;
  compact?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, compact = false }) => {
  // 格式化時間
  const formatPublishedTime = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} 分鐘前`;
    } else if (diffMins < 24 * 60) {
      return `${Math.floor(diffMins / 60)} 小時前`;
    } else {
      return date.toLocaleDateString("zh-tw", {
        month: "numeric",
        day: "numeric",
      });
    }
  };

  const getSentimentBadge = (sentiment?: string) => {
    if (!sentiment) return null;

    const badgeClasses = {
      positive: "bg-green-100 text-green-800",
      negative: "bg-red-100 text-red-800",
      neutral: "bg-gray-100 text-gray-800",
    };

    const sentimentText = {
      positive: "正面",
      negative: "負面",
      neutral: "中立",
    };

    return (
      <span
        className={`${
          badgeClasses[sentiment as keyof typeof badgeClasses]
        } text-xs px-2 py-1 rounded-full`}
      >
        {sentimentText[sentiment as keyof typeof sentimentText]}
      </span>
    );
  };

  if (compact) {
    return (
      <Link href={news.url} target="_blank" className="block group">
        <div className="flex items-start space-x-4">
          {news.imageUrl && (
            <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden">
              <img
                src={news.imageUrl}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {news.title}
            </h4>
            <div className="mt-1 flex items-center text-xs text-gray-500">
              <span>{news.source}</span>
              <span className="mx-1.5">•</span>
              <span>{formatPublishedTime(news.publishedAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white overflow-hidden border border-gray-200 rounded-lg transition-shadow hover:shadow-md">
      {news.imageUrl && (
        <div className="h-40 overflow-hidden">
          <img
            src={news.imageUrl}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <span className="font-medium">{news.source}</span>
          <span className="mx-1.5">•</span>
          <ClockIcon className="h-3 w-3 mr-1" />
          <span>{formatPublishedTime(news.publishedAt)}</span>

          {news.sentiment && (
            <>
              <span className="mx-1.5">•</span>
              {getSentimentBadge(news.sentiment)}
            </>
          )}
        </div>

        <Link href={news.url} target="_blank" className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
            {news.title}
          </h3>
        </Link>

        {news.summary && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {news.summary}
          </p>
        )}

        {news.related &&
          (news.related.stocks?.length || news.related.sectors?.length) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {news.related.stocks?.map((stock) => (
                <Link
                  href={`/market-analysis/stock/${stock}`}
                  key={stock}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  ${stock}
                </Link>
              ))}

              {news.related.sectors?.map((sector) => (
                <Link
                  href={`/market-analysis/sectors/${sector}`}
                  key={sector}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100"
                >
                  {sector}
                </Link>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default NewsCard;
