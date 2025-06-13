import { MarketNews } from "@/types/news";

export interface NewsCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface NewsSource {
  id: string;
  name: string;
  description: string;
  url: string;
  isActive: boolean;
}

export interface NewsSearchParams {
  query?: string;
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

export class NewsModel {
  private static instance: NewsModel;
  private news: Map<string, MarketNews> = new Map();
  private categories: NewsCategory[] = [];
  private sources: NewsSource[] = [];
  private lastUpdateTime: number = 0;
  private updateInterval: number = 5 * 60 * 1000; // 5分鐘

  static getInstance(): NewsModel {
    if (!NewsModel.instance) {
      NewsModel.instance = new NewsModel();
    }
    return NewsModel.instance;
  }

  private constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    this.initializeCategories();
    this.initializeSources();
    this.initializeMockNews();
  }

  private initializeCategories(): void {
    this.categories = [
      {
        id: "market",
        name: "市場動態",
        description: "股市、匯市等金融市場新聞",
        count: 45,
      },
      {
        id: "company",
        name: "公司新聞",
        description: "上市公司相關消息",
        count: 32,
      },
      {
        id: "economy",
        name: "經濟政策",
        description: "政府政策、經濟指標等",
        count: 28,
      },
      {
        id: "technology",
        name: "科技產業",
        description: "科技公司與產業動態",
        count: 41,
      },
      {
        id: "international",
        name: "國際財經",
        description: "全球金融市場消息",
        count: 36,
      },
    ];
  }

  private initializeSources(): void {
    this.sources = [
      {
        id: "cnyes",
        name: "鉅亨網",
        description: "專業財經新聞網站",
        url: "https://news.cnyes.com",
        isActive: true,
      },
      {
        id: "moneydj",
        name: "MoneyDJ",
        description: "理財網財經新聞",
        url: "https://www.moneydj.com",
        isActive: true,
      },
      {
        id: "udn",
        name: "聯合新聞網",
        description: "聯合報系財經新聞",
        url: "https://udn.com/news/cate/6644",
        isActive: true,
      },
      {
        id: "chinatimes",
        name: "中時新聞網",
        description: "中國時報財經新聞",
        url: "https://www.chinatimes.com/money",
        isActive: true,
      },
      {
        id: "businessweekly",
        name: "商業周刊",
        description: "商業財經雜誌",
        url: "https://www.businessweekly.com.tw",
        isActive: true,
      },
    ];
  }

  private initializeMockNews(): void {
    const mockNews: MarketNews[] = [
      {
        id: "news_001",
        title: "台積電第三季營收創新高，EPS 達 11.26 元",
        summary:
          "台積電公布第三季財報，營收較去年同期成長 36.5%，主要受惠於先進製程需求強勁...",
        content:
          "台積電今日公布第三季財報，營收達 6,137 億元，較去年同期成長 36.5%...",
        source: "鉅亨網",
        category: "company",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小時前
        url: "https://news.cnyes.com/news/id/5048123",
        imageUrl: "https://example.com/tsmc-news.jpg",
        tags: ["台積電", "財報", "半導體"],
        isBreaking: true,
        readCount: 1520,
        sentiment: "positive",
      },
      {
        id: "news_002",
        title: "美聯準會宣布升息 1 碼，年底前可能再升息",
        summary:
          "美國聯邦準備理事會宣布調升聯邦資金利率目標區間 1 碼至 5.25%-5.5%...",
        content: "美國聯邦準備理事會(Fed)宣布調升聯邦資金利率目標區間 1 碼...",
        source: "MoneyDJ",
        category: "international",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4小時前
        url: "https://www.moneydj.com/kmdj/news/newsviewer.aspx?a=12345678",
        imageUrl: "https://example.com/fed-news.jpg",
        tags: ["美聯準會", "升息", "利率"],
        isBreaking: false,
        readCount: 2340,
        sentiment: "neutral",
      },
      {
        id: "news_003",
        title: "AI 概念股全面上漲，輝達股價創歷史新高",
        summary:
          "受惠於生成式 AI 需求爆發，輝達股價再創歷史新高，相關概念股全面上漲...",
        content: "輝達(NVIDIA)股價昨日收盤上漲 5.2%，創下歷史新高...",
        source: "商業周刊",
        category: "technology",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6小時前
        url: "https://www.businessweekly.com.tw/focus/blog/12345",
        imageUrl: "https://example.com/ai-news.jpg",
        tags: ["AI", "輝達", "概念股"],
        isBreaking: false,
        readCount: 1890,
        sentiment: "positive",
      },
      {
        id: "news_004",
        title: "台股加權指數收盤上漲 1.5%，站上萬八關卡",
        summary:
          "台股今日強勢上漲，加權指數收盤上漲 267 點，漲幅 1.5%，重新站上 18,000 點...",
        content: "台股今日表現強勢，電子權值股領漲，加權指數開盤後一路走高...",
        source: "聯合新聞網",
        category: "market",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8小時前
        url: "https://udn.com/news/story/7251/12345678",
        imageUrl: "https://example.com/taiwan-stock.jpg",
        tags: ["台股", "加權指數", "萬八"],
        isBreaking: false,
        readCount: 3210,
        sentiment: "positive",
      },
      {
        id: "news_005",
        title: "央行決議維持利率不變，關注通膨壓力",
        summary:
          "中央銀行理監事會決議維持政策利率 1.875% 不變，持續關注通膨發展...",
        content: "中央銀行今日召開理監事會，決議維持政策利率於 1.875% 不變...",
        source: "中時新聞網",
        category: "economy",
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10小時前
        url: "https://www.chinatimes.com/realtimenews/20240101001234",
        imageUrl: "https://example.com/central-bank.jpg",
        tags: ["央行", "利率", "通膨"],
        isBreaking: false,
        readCount: 1670,
        sentiment: "neutral",
      },
    ];

    mockNews.forEach((news) => {
      this.news.set(news.id, news);
    });

    this.lastUpdateTime = Date.now();
  }

  private needsUpdate(): boolean {
    return Date.now() - this.lastUpdateTime > this.updateInterval;
  }

  async getAllNews(params: NewsSearchParams = {}): Promise<NewsResponse> {
    if (this.needsUpdate()) {
      await this.refreshNews();
    }

    const {
      query,
      category,
      source,
      dateFrom,
      dateTo,
      limit = 20,
      page = 1,
    } = params;

    let filteredNews = Array.from(this.news.values());

    // 篩選邏輯
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredNews = filteredNews.filter(
        (news) =>
          news.title.toLowerCase().includes(searchTerm) ||
          news.summary.toLowerCase().includes(searchTerm) ||
          news.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (category) {
      filteredNews = filteredNews.filter((news) => news.category === category);
    }

    if (source) {
      filteredNews = filteredNews.filter((news) => news.source === source);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredNews = filteredNews.filter(
        (news) => new Date(news.publishedAt) >= fromDate
      );
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filteredNews = filteredNews.filter(
        (news) => new Date(news.publishedAt) <= toDate
      );
    }

    // 按發布時間排序（最新在前）
    filteredNews.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const total = filteredNews.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNews = filteredNews.slice(startIndex, endIndex);

    return {
      news: paginatedNews,
      total,
      page,
      totalPages,
    };
  }

  async getLatestNews(limit: number = 10): Promise<MarketNews[]> {
    const result = await this.getAllNews({ limit });
    return result.news;
  }

  async getNewsByCategory(category: string): Promise<MarketNews[]> {
    const result = await this.getAllNews({ category });
    return result.news;
  }

  async getNewsBySource(source: string): Promise<MarketNews[]> {
    const result = await this.getAllNews({ source });
    return result.news;
  }

  async searchNews(query: string): Promise<MarketNews[]> {
    const result = await this.getAllNews({ query });
    return result.news;
  }

  async getNewsById(id: string): Promise<MarketNews | null> {
    const news = this.news.get(id);
    if (news) {
      // 增加閱讀數
      if (news.readCount !== undefined) {
        news.readCount += 1;
      } else {
        news.readCount = 1;
      }
    }
    return news || null;
  }

  async getTopNews(limit: number = 5): Promise<MarketNews[]> {
    const allNews = Array.from(this.news.values());
    // 根據閱讀數和是否為重大新聞排序
    allNews.sort((a, b) => {
      if (a.isBreaking && !b.isBreaking) return -1;
      if (!a.isBreaking && b.isBreaking) return 1;
      return (b.readCount || 0) - (a.readCount || 0);
    });

    return allNews.slice(0, limit);
  }

  async getBreakingNews(): Promise<MarketNews[]> {
    const allNews = Array.from(this.news.values());
    return allNews.filter((news) => news.isBreaking);
  }

  async getNewsCategories(): Promise<NewsCategory[]> {
    return [...this.categories];
  }

  async getNewsSources(): Promise<NewsSource[]> {
    return [...this.sources];
  }

  private async refreshNews(): Promise<void> {
    // 模擬新聞更新（實際應用中會從 API 獲取）
    console.log("Refreshing news data...");
    this.lastUpdateTime = Date.now();
  }

  async markAsRead(newsId: string): Promise<void> {
    const news = this.news.get(newsId);
    if (news) {
      if (news.readCount !== undefined) {
        news.readCount += 1;
      } else {
        news.readCount = 1;
      }
    }
  }

  async getNewsByTag(tag: string): Promise<MarketNews[]> {
    const allNews = Array.from(this.news.values());
    return allNews.filter((news) => news.tags.includes(tag));
  }

  async getNewsByDateRange(
    dateFrom: string,
    dateTo: string
  ): Promise<MarketNews[]> {
    const result = await this.getAllNews({ dateFrom, dateTo });
    return result.news;
  }
}

export default NewsModel;
