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
  id?: string;
  title: string;
  source: string;
  time: string;
  impact: string;
  category: string;
  summary: string;
}

export interface NewsFilters {
  category: string;
  showAll: boolean;
}
