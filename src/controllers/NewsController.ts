import {
  NewsModel,
  NewsCategory,
  NewsSource,
  NewsSearchParams,
  NewsResponse,
} from "../models/NewsModel";
import { MarketNews } from "@/types/news";

export class NewsController {
  private static instance: NewsController;
  private newsModel: NewsModel;

  static getInstance(): NewsController {
    if (!NewsController.instance) {
      NewsController.instance = new NewsController();
    }
    return NewsController.instance;
  }

  private constructor() {
    this.newsModel = NewsModel.getInstance();
  }

  async getAllNews(params: NewsSearchParams = {}): Promise<NewsResponse> {
    try {
      return await this.newsModel.getAllNews(params);
    } catch (error) {
      console.error("Error fetching all news:", error);
      throw new Error("無法獲取新聞列表");
    }
  }

  async getLatestNews(limit: number = 10): Promise<MarketNews[]> {
    try {
      return await this.newsModel.getLatestNews(limit);
    } catch (error) {
      console.error("Error fetching latest news:", error);
      throw new Error("無法獲取最新新聞");
    }
  }

  async getNewsByCategory(category: string): Promise<MarketNews[]> {
    try {
      if (!category || category.trim().length === 0) {
        throw new Error("分類不能為空");
      }
      return await this.newsModel.getNewsByCategory(category);
    } catch (error) {
      console.error("Error fetching news by category:", error);
      throw new Error("無法獲取分類新聞");
    }
  }

  async getNewsBySource(source: string): Promise<MarketNews[]> {
    try {
      if (!source || source.trim().length === 0) {
        throw new Error("新聞來源不能為空");
      }
      return await this.newsModel.getNewsBySource(source);
    } catch (error) {
      console.error("Error fetching news by source:", error);
      throw new Error("無法獲取來源新聞");
    }
  }

  async searchNews(query: string): Promise<MarketNews[]> {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error("搜尋關鍵字不能為空");
      }
      return await this.newsModel.searchNews(query);
    } catch (error) {
      console.error("Error searching news:", error);
      throw new Error("新聞搜尋失敗");
    }
  }

  async getNewsById(id: string): Promise<MarketNews | null> {
    try {
      if (!id || id.trim().length === 0) {
        throw new Error("新聞ID不能為空");
      }
      return await this.newsModel.getNewsById(id);
    } catch (error) {
      console.error("Error fetching news by ID:", error);
      throw new Error("無法獲取新聞詳情");
    }
  }

  async getTopNews(limit: number = 5): Promise<MarketNews[]> {
    try {
      if (limit <= 0) {
        throw new Error("限制數量必須大於0");
      }
      return await this.newsModel.getTopNews(limit);
    } catch (error) {
      console.error("Error fetching top news:", error);
      throw new Error("無法獲取熱門新聞");
    }
  }

  async getBreakingNews(): Promise<MarketNews[]> {
    try {
      return await this.newsModel.getBreakingNews();
    } catch (error) {
      console.error("Error fetching breaking news:", error);
      throw new Error("無法獲取突發新聞");
    }
  }

  async getNewsCategories(): Promise<NewsCategory[]> {
    try {
      return await this.newsModel.getNewsCategories();
    } catch (error) {
      console.error("Error fetching news categories:", error);
      throw new Error("無法獲取新聞分類");
    }
  }

  async getNewsSources(): Promise<NewsSource[]> {
    try {
      return await this.newsModel.getNewsSources();
    } catch (error) {
      console.error("Error fetching news sources:", error);
      throw new Error("無法獲取新聞來源");
    }
  }

  async markAsRead(newsId: string): Promise<void> {
    try {
      if (!newsId || newsId.trim().length === 0) {
        throw new Error("新聞ID不能為空");
      }
      await this.newsModel.markAsRead(newsId);
    } catch (error) {
      console.error("Error marking news as read:", error);
      // 不拋出錯誤，因為這不是關鍵功能
    }
  }

  async getNewsByTag(tag: string): Promise<MarketNews[]> {
    try {
      if (!tag || tag.trim().length === 0) {
        throw new Error("標籤不能為空");
      }
      return await this.newsModel.getNewsByTag(tag);
    } catch (error) {
      console.error("Error fetching news by tag:", error);
      throw new Error("無法獲取標籤新聞");
    }
  }

  async getNewsByDateRange(
    dateFrom: string,
    dateTo: string
  ): Promise<MarketNews[]> {
    try {
      if (!dateFrom || !dateTo) {
        throw new Error("日期範圍不能為空");
      }

      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);

      if (fromDate > toDate) {
        throw new Error("開始日期不能晚於結束日期");
      }

      return await this.newsModel.getNewsByDateRange(dateFrom, dateTo);
    } catch (error) {
      console.error("Error fetching news by date range:", error);
      throw new Error("無法獲取日期範圍新聞");
    }
  }

  async getMarketSummaryNews(): Promise<MarketNews[]> {
    try {
      // 模擬獲取市場摘要新聞
      const allNews = await this.newsModel.getAllNews({ limit: 5 });
      return allNews.news.filter(
        (news) => news.category === "市場摘要" || news.category === "市場分析"
      );
    } catch (error) {
      console.error("Error fetching market summary news:", error);
      throw new Error("無法獲取市場摘要新聞");
    }
  }

  async getRelatedNews(newsId: string): Promise<MarketNews[]> {
    try {
      if (!newsId || newsId.trim().length === 0) {
        throw new Error("新聞ID不能為空");
      }

      // 模擬獲取相關新聞邏輯
      const allNews = await this.newsModel.getAllNews({ limit: 20 });
      return allNews.news.slice(0, 5); // 返回前5則作為相關新聞
    } catch (error) {
      console.error("Error fetching related news:", error);
      throw new Error("無法獲取相關新聞");
    }
  }

  async getTrendingNews(limit: number = 10): Promise<MarketNews[]> {
    try {
      if (limit <= 0) {
        throw new Error("限制數量必須大於0");
      }

      // 獲取熱門新聞（按照發布時間排序）
      const allNews = await this.newsModel.getAllNews({ limit: limit * 2 });
      return allNews.news
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        )
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching trending news:", error);
      throw new Error("無法獲取熱門新聞");
    }
  }

  async getNewsBatch(params: {
    categories?: string[];
    sources?: string[];
    limit?: number;
    timeRange?: "today" | "week" | "month";
  }): Promise<{
    categorized: { [category: string]: MarketNews[] };
    bySource: { [source: string]: MarketNews[] };
    latest: MarketNews[];
  }> {
    try {
      const {
        categories = [],
        sources = [],
        limit = 10,
        timeRange = "today",
      } = params;

      // 並行獲取不同類型的新聞
      const [latestNews, ...categoryResults] = await Promise.allSettled([
        this.newsModel.getLatestNews(limit),
        ...categories.map((category) =>
          this.newsModel.getNewsByCategory(category)
        ),
      ]);

      const categorized: { [category: string]: MarketNews[] } = {};
      const bySource: { [source: string]: MarketNews[] } = {};

      // 處理分類結果
      categories.forEach((category, index) => {
        const result = categoryResults[index];
        if (result.status === "fulfilled") {
          categorized[category] = result.value;
        } else {
          categorized[category] = [];
        }
      });

      // 獲取來源新聞
      if (sources.length > 0) {
        const sourceResults = await Promise.allSettled(
          sources.map((source) => this.newsModel.getNewsBySource(source))
        );

        sources.forEach((source, index) => {
          const result = sourceResults[index];
          if (result.status === "fulfilled") {
            bySource[source] = result.value;
          } else {
            bySource[source] = [];
          }
        });
      }

      return {
        categorized,
        bySource,
        latest: latestNews.status === "fulfilled" ? latestNews.value : [],
      };
    } catch (error) {
      console.error("Error fetching news batch:", error);
      throw new Error("無法批量獲取新聞");
    }
  }

  async refreshNews(): Promise<void> {
    try {
      // 模擬刷新新聞數據
      console.log("刷新新聞數據...");
      // 如果需要實際的快取清除邏輯，可以在這裡實現
    } catch (error) {
      console.error("Error refreshing news:", error);
      throw new Error("無法刷新新聞");
    }
  }
}

export default NewsController;
