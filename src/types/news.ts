export interface NewsItem {
  id?: string;
  title: string;
  source: string;
  time: string;
  impact?: string;
  category: string;
  summary?: string;
  date?: string;
  content?: string;
  tags?: string[];
  author?: string;
  url?: string;
  urlToImage?: string;
  viewCount?: number;
  likeCount?: number;
  shareCount?: number;
  publishedAt?: string;
  sentiment?: string;
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  category: string;
  publishedAt: string;
  url?: string;
  imageUrl?: string;
  tags: string[];
  isBreaking?: boolean;
  readCount?: number;
  sentiment?: "positive" | "negative" | "neutral";
  time?: string; // 為了向後兼容
  impact?: string; // 為了向後兼容
}

export interface NewsFilters {
  category: string;
  showAll: boolean;
}
