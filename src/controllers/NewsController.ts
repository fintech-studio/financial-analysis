import { MarketNews } from "@/types/news";
import { marketNews, latestNews } from "@/data/news/newsData";

export interface NewsSearchParams {
  category?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  page?: number;
}

export interface NewsResponse {
  news: MarketNews[];
  total: number;
  page: number;
  totalPages: number;
}

export class NewsController {
  private static instance: NewsController;

  static getInstance(): NewsController {
    if (!NewsController.instance) {
      NewsController.instance = new NewsController();
    }
    return NewsController.instance;
  }

  private constructor() {}

  async getAllNews(params: NewsSearchParams = {}): Promise<NewsResponse> {
    const { category, source, limit = 20, page = 1 } = params;

    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 200));

    let filteredNews = [...marketNews];

    // 篩選邏輯
    if (category) {
      filteredNews = filteredNews.filter((news) =>
        news.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (source) {
      filteredNews = filteredNews.filter((news) =>
        news.source.toLowerCase().includes(source.toLowerCase())
      );
    }

    // 分頁處理
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNews = filteredNews.slice(startIndex, endIndex);

    return {
      news: paginatedNews,
      total: filteredNews.length,
      page,
      totalPages: Math.ceil(filteredNews.length / limit),
    };
  }

  async getLatestNews(limit: number = 10): Promise<MarketNews[]> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 轉換 latestNews 格式到 MarketNews
    const transformedNews: MarketNews[] = latestNews
      .slice(0, limit)
      .map((news) => ({
        title: news.title,
        source: news.source,
        time: news.date,
        impact: "中等",
        category: news.category,
        summary: `${news.title.substring(0, 100)}...`,
      }));

    return transformedNews;
  }

  async getNewsByCategory(category: string): Promise<MarketNews[]> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 100));

    return marketNews.filter(
      (news) => news.category.toLowerCase() === category.toLowerCase()
    );
  }

  async getNewsBySource(source: string): Promise<MarketNews[]> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 100));

    return marketNews.filter((news) =>
      news.source.toLowerCase().includes(source.toLowerCase())
    );
  }

  async searchNews(query: string): Promise<MarketNews[]> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 200));

    const searchTerm = query.toLowerCase();
    return marketNews.filter(
      (news) =>
        news.title.toLowerCase().includes(searchTerm) ||
        news.summary.toLowerCase().includes(searchTerm) ||
        news.category.toLowerCase().includes(searchTerm)
    );
  }

  async getNewsById(id: string): Promise<MarketNews | null> {
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 由於模擬數據沒有 id，這裡用 index 作為 id
    const index = parseInt(id);
    return marketNews[index] || null;
  }

  async getTopNews(limit: number = 5): Promise<MarketNews[]> {
    // 模擬 API 調用獲取熱門新聞
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 根據影響程度排序
    const sortedNews = [...marketNews].sort((a, b) => {
      const impactOrder = { 高: 3, 中等: 2, 低: 1 };
      return (
        (impactOrder[b.impact as keyof typeof impactOrder] || 0) -
        (impactOrder[a.impact as keyof typeof impactOrder] || 0)
      );
    });

    return sortedNews.slice(0, limit);
  }

  async getNewsCategories(): Promise<string[]> {
    // 模擬 API 調用獲取新聞分類
    await new Promise((resolve) => setTimeout(resolve, 50));

    const categories = [...new Set(marketNews.map((news) => news.category))];
    return categories.sort();
  }

  async getNewsSources(): Promise<string[]> {
    // 模擬 API 調用獲取新聞來源
    await new Promise((resolve) => setTimeout(resolve, 50));

    const sources = [...new Set(marketNews.map((news) => news.source))];
    return sources.sort();
  }
}

export default NewsController;
