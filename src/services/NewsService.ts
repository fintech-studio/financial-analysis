import { NewsItem } from "@/types/news";

export interface NewsSearchParams {
  query?: string;
  category?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  page?: number;
}

export interface NewsCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface NewsSource {
  id: string;
  name: string;
  domain: string;
  country: string;
  language: string;
  category: string;
}

export class NewsService {
  private static instance: NewsService;
  private baseUrl =
    process.env.NEXT_PUBLIC_NEWS_API_URL || "https://newsapi.example.com";

  static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }

  private constructor() {}

  async getNews(params: NewsSearchParams = {}): Promise<{
    articles: NewsItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 400));

      const { query, category, source, limit = 20, page = 1 } = params;

      // 模擬新聞數據
      const mockNews: NewsItem[] = [
        {
          id: "news_1",
          title: "台積電Q2財報超預期，營收創歷史新高",
          summary:
            "台積電公布第二季財報，營收達新台幣5,348億元，較去年同期成長32.8%，超越市場預期...",
          content:
            "台積電(2330)今日公布第二季財報表現亮眼，營收達新台幣5,348億元，較去年同期大幅成長32.8%，超越市場預期的5,200億元。淨利潤為2,018億元，每股盈餘達7.8元，同樣超越分析師預估...",
          source: "財經日報",
          time: "2024-06-01T10:30:00Z",
          author: "記者 張三",
          publishedAt: "2024-06-01T10:30:00Z",
          url: "https://example.com/news/tsmc-q2-earnings",
          urlToImage: "https://example.com/images/tsmc-earnings.jpg",
          category: "財經",
          tags: ["台積電", "財報", "半導體", "科技股"],
          sentiment: "positive",
          viewCount: 15420,
          likeCount: 89,
          shareCount: 45,
        },
        {
          id: "news_2",
          title: "央行宣布升息半碼，房市影響受關注",
          summary:
            "中央銀行理監事會決議升息0.125個百分點，重貼現率調升至2.0%，為今年第二次升息...",
          content:
            "中央銀行今日召開理監事會議，決議調升重貼現率0.125個百分點至2.0%，這是今年第二次升息。央行總裁楊金龍表示，此次升息主要是為了維持物價穩定，並密切關注通膨走勢...",
          source: "經濟時報",
          time: "2024-06-01T09:15:00Z",
          author: "記者 李四",
          publishedAt: "2024-06-01T09:15:00Z",
          url: "https://example.com/news/central-bank-rate-hike",
          urlToImage: "https://example.com/images/central-bank.jpg",
          category: "總經",
          tags: ["央行", "升息", "房市", "貨幣政策"],
          sentiment: "neutral",
          viewCount: 12350,
          likeCount: 67,
          shareCount: 32,
        },
        {
          id: "news_3",
          title: "AI概念股持續發燒，輝達帶動漲勢",
          summary:
            "受到輝達強勁財報激勵，AI相關概念股持續上漲，台股相關族群表現亮眼...",
          content:
            "美股輝達(NVIDIA)公布超預期財報後，全球AI概念股持續發燒。台股方面，AI伺服器相關供應鏈包括廣達、緯創、英業達等個股今日表現強勁，帶動電子股指數上漲...",
          source: "投資週刊",
          time: "2024-06-01T08:45:00Z",
          author: "記者 王五",
          publishedAt: "2024-06-01T08:45:00Z",
          url: "https://example.com/news/ai-stocks-rally",
          urlToImage: "https://example.com/images/ai-stocks.jpg",
          category: "科技",
          tags: ["AI", "輝達", "概念股", "電子股"],
          sentiment: "positive",
          viewCount: 18760,
          likeCount: 124,
          shareCount: 78,
        },
        {
          id: "news_4",
          title: "美中貿易緊張關係升溫，市場憂心影響",
          summary:
            "美國商務部新增對中國科技企業的制裁措施，市場擔心貿易戰再起...",
          content:
            "美國商務部昨日宣布將數家中國科技企業列入實體清單，限制其取得美國技術。此舉引發市場對美中貿易關係再度緊張的擁心，亞洲股市今日普遍下跌...",
          source: "國際財經",
          time: "2024-06-01T07:20:00Z",
          author: "記者 趙六",
          publishedAt: "2024-06-01T07:20:00Z",
          url: "https://example.com/news/us-china-trade-tension",
          urlToImage: "https://example.com/images/trade-war.jpg",
          category: "國際",
          tags: ["美中貿易", "制裁", "科技股", "地緣政治"],
          sentiment: "negative",
          viewCount: 9876,
          likeCount: 34,
          shareCount: 21,
        },
        {
          id: "news_5",
          title: "電動車市場競爭加劇，特斯拉調降售價",
          summary:
            "面對競爭對手的挑戰，特斯拉宣布在中國市場調降Model 3和Model Y售價...",
          content:
            "電動車巨頭特斯拉今日宣布在中國市場調降Model 3和Model Y的售價，降幅約2-4%。分析師認為，此舉是為了應對比亞迪、蔚來等中國本土品牌的激烈競爭...",
          source: "汽車新聞",
          time: "2024-05-31T16:30:00Z",
          author: "記者 錢七",
          publishedAt: "2024-05-31T16:30:00Z",
          url: "https://example.com/news/tesla-price-cut",
          urlToImage: "https://example.com/images/tesla.jpg",
          category: "產業",
          tags: ["特斯拉", "電動車", "價格戰", "中國市場"],
          sentiment: "neutral",
          viewCount: 7234,
          likeCount: 56,
          shareCount: 28,
        },
      ];

      let filteredNews = [...mockNews];

      // 應用篩選條件
      if (query) {
        const searchTerm = query.toLowerCase();
        filteredNews = filteredNews.filter(
          (news) =>
            news.title.toLowerCase().includes(searchTerm) ||
            (news.summary && news.summary.toLowerCase().includes(searchTerm)) ||
            (news.content && news.content.toLowerCase().includes(searchTerm)) ||
            (news.tags &&
              news.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
        );
      }

      if (category) {
        filteredNews = filteredNews.filter(
          (news) => news.category === category
        );
      }

      if (source) {
        filteredNews = filteredNews.filter((news) => news.source === source);
      }

      // 分頁處理
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedNews = filteredNews.slice(startIndex, endIndex);

      return {
        articles: paginatedNews,
        total: filteredNews.length,
        page,
        totalPages: Math.ceil(filteredNews.length / limit),
      };
    } catch (error) {
      console.error("Error fetching news:", error);
      throw new Error("無法獲取新聞資料");
    }
  }

  async getNewsById(id: string): Promise<NewsItem | null> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 200));

      const newsResult = await this.getNews();
      return newsResult.articles.find((news) => news.id === id) || null;
    } catch (error) {
      console.error("Error fetching news by id:", error);
      throw new Error("無法獲取新聞詳情");
    }
  }

  async getTopNews(limit: number = 10): Promise<NewsItem[]> {
    try {
      const newsResult = await this.getNews({ limit });
      return newsResult.articles;
    } catch (error) {
      console.error("Error fetching top news:", error);
      throw new Error("無法獲取熱門新聞");
    }
  }

  async getNewsByCategory(
    category: string,
    limit: number = 20
  ): Promise<NewsItem[]> {
    try {
      const newsResult = await this.getNews({ category, limit });
      return newsResult.articles;
    } catch (error) {
      console.error("Error fetching news by category:", error);
      throw new Error("無法獲取分類新聞");
    }
  }

  async searchNews(query: string, limit: number = 20): Promise<NewsItem[]> {
    try {
      const newsResult = await this.getNews({ query, limit });
      return newsResult.articles;
    } catch (error) {
      console.error("Error searching news:", error);
      throw new Error("無法搜索新聞");
    }
  }

  async getCategories(): Promise<NewsCategory[]> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 100));

      const mockCategories: NewsCategory[] = [
        {
          id: "finance",
          name: "財經",
          description: "股市、債市、匯市等金融市場新聞",
          count: 156,
        },
        {
          id: "tech",
          name: "科技",
          description: "科技產業、創新技術相關新聞",
          count: 89,
        },
        {
          id: "macro",
          name: "總經",
          description: "總體經濟、貨幣政策、經濟指標",
          count: 67,
        },
        {
          id: "industry",
          name: "產業",
          description: "各產業動態、企業新聞",
          count: 134,
        },
        {
          id: "international",
          name: "國際",
          description: "國際市場、全球經濟動態",
          count: 78,
        },
        {
          id: "policy",
          name: "政策",
          description: "政府政策、法規變動",
          count: 45,
        },
      ];

      return mockCategories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("無法獲取新聞分類");
    }
  }

  async getSources(): Promise<NewsSource[]> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 150));

      const mockSources: NewsSource[] = [
        {
          id: "financial-daily",
          name: "財經日報",
          domain: "finance-daily.com.tw",
          country: "TW",
          language: "zh",
          category: "business",
        },
        {
          id: "economic-times",
          name: "經濟時報",
          domain: "economic-times.com.tw",
          country: "TW",
          language: "zh",
          category: "business",
        },
        {
          id: "investment-weekly",
          name: "投資週刊",
          domain: "investment-weekly.com.tw",
          country: "TW",
          language: "zh",
          category: "business",
        },
        {
          id: "tech-news",
          name: "科技新報",
          domain: "tech-news.com.tw",
          country: "TW",
          language: "zh",
          category: "technology",
        },
        {
          id: "international-finance",
          name: "國際財經",
          domain: "intl-finance.com",
          country: "US",
          language: "zh",
          category: "business",
        },
      ];

      return mockSources;
    } catch (error) {
      console.error("Error fetching sources:", error);
      throw new Error("無法獲取新聞來源");
    }
  }

  async getTrendingNews(limit: number = 10): Promise<NewsItem[]> {
    try {
      const newsResult = await this.getNews({ limit: 50 });
      // 根據觀看次數和互動數排序
      const trendingNews = newsResult.articles
        .sort(
          (a, b) =>
            (b.viewCount || 0) +
            (b.likeCount || 0) +
            (b.shareCount || 0) -
            ((a.viewCount || 0) + (a.likeCount || 0) + (a.shareCount || 0))
        )
        .slice(0, limit);

      return trendingNews;
    } catch (error) {
      console.error("Error fetching trending news:", error);
      throw new Error("無法獲取熱門新聞");
    }
  }

  async getRecentNews(
    hours: number = 24,
    limit: number = 20
  ): Promise<NewsItem[]> {
    try {
      const newsResult = await this.getNews({ limit: 100 });
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

      // 篩選指定時間內的新聞
      const recentNews = newsResult.articles
        .filter(
          (news) => news.publishedAt && new Date(news.publishedAt) >= cutoffTime
        )
        .slice(0, limit);

      return recentNews;
    } catch (error) {
      console.error("Error fetching recent news:", error);
      throw new Error("無法獲取最新新聞");
    }
  }

  async getNewsBySentiment(
    sentiment: "positive" | "negative" | "neutral",
    limit: number = 20
  ): Promise<NewsItem[]> {
    try {
      const newsResult = await this.getNews({ limit: 100 });

      const filteredNews = newsResult.articles
        .filter((news) => news.sentiment === sentiment)
        .slice(0, limit);

      return filteredNews;
    } catch (error) {
      console.error("Error fetching news by sentiment:", error);
      throw new Error("無法根據情感篩選新聞");
    }
  }

  async likeNews(newsId: string, userId: string): Promise<void> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 100));
      console.log(`User ${userId} liked news ${newsId}`);
    } catch (error) {
      console.error("Error liking news:", error);
      throw new Error("無法點讚新聞");
    }
  }

  async shareNews(
    newsId: string,
    userId: string,
    platform: string
  ): Promise<void> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 100));
      console.log(`User ${userId} shared news ${newsId} on ${platform}`);
    } catch (error) {
      console.error("Error sharing news:", error);
      throw new Error("無法分享新聞");
    }
  }

  async incrementViewCount(newsId: string): Promise<void> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 50));
      console.log(`View count incremented for news ${newsId}`);
    } catch (error) {
      console.error("Error incrementing view count:", error);
      // 這個錯誤不需要拋出，因為不影響用戶體驗
    }
  }
}

export default NewsService;
