export interface NewsItem {
  title: string;
  source: string;
  time: string;
  impact?: string;
  category: string;
  summary?: string;
  date?: string;
}

export interface NewsFilters {
  category: string;
  showAll: boolean;
}
