import {
  MarketOverview,
  MarketSentiment,
  SectorPerformance,
  MarketNews,
  HotStock,
  RecommendedStock,
  ActiveStock,
  ChartData,
  TimeRange,
  MarketData,
} from "@/types/market";

import {
  marketOverview,
  marketSentiment,
  hotStocks,
  activeStocks,
  recommendedStocks,
  sectorPerformance,
  marketNews,
  latestNews,
  marketDataConfig,
} from "@/data/market/marketData";

export interface MarketAnalytics {
  totalVolume: string;
  activeUsers: string;
  marketCap: string;
  volatilityIndex: string;
}

export interface MarketTrend {
  period: TimeRange;
  direction: "up" | "down" | "sideways";
  strength: number;
  indicators: {
    rsi: number;
    macd: number;
    sma: number;
  };
}

export class MarketModel {
  private static instance: MarketModel;
  private marketOverviewCache: MarketOverview | null = null;
  private marketSentimentCache: MarketSentiment | null = null;
  private chartDataCache: Map<TimeRange, ChartData> = new Map();
  private lastUpdateTime: number = 0;
  private updateInterval: number = marketDataConfig.updateInterval;

  static getInstance(): MarketModel {
    if (!MarketModel.instance) {
      MarketModel.instance = new MarketModel();
    }
    return MarketModel.instance;
  }

  private constructor() {
    this.initializeData();
  }

  private async initializeData(): Promise<void> {
    try {
      await this.refreshMarketData();
    } catch (error) {
      console.error("Failed to initialize market data:", error);
    }
  }

  private needsUpdate(): boolean {
    return Date.now() - this.lastUpdateTime > this.updateInterval;
  }

  async getMarketOverview(
    forceRefresh: boolean = false
  ): Promise<MarketOverview> {
    if (!this.marketOverviewCache || forceRefresh || this.needsUpdate()) {
      await this.refreshMarketData();
    }
    return this.marketOverviewCache || marketOverview;
  }

  async getMarketSentiment(
    forceRefresh: boolean = false
  ): Promise<MarketSentiment> {
    if (!this.marketSentimentCache || forceRefresh || this.needsUpdate()) {
      await this.refreshMarketData();
    }
    return this.marketSentimentCache || marketSentiment;
  }

  async getChartData(timeRange: TimeRange = "1d"): Promise<ChartData> {
    if (!this.chartDataCache.has(timeRange) || this.needsUpdate()) {
      await this.refreshChartData(timeRange);
    }

    // 如果快取中有數據就返回，否則生成模擬數據
    const cachedData = this.chartDataCache.get(timeRange);
    if (cachedData) {
      return cachedData;
    }

    // 生成默認的 ChartData 格式
    return {
      dates: this.generateDateLabels(timeRange),
      values: this.generateMockValues(timeRange),
      volumes: this.generateMockVolumes(timeRange),
      prices: this.generateMockPrices(timeRange),
    };
  }

  async getHotStocks(): Promise<HotStock[]> {
    // 模擬 API 調用獲取熱門股票
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(hotStocks);
      }, 100);
    });
  }

  async getActiveStocks(): Promise<ActiveStock[]> {
    // 模擬 API 調用獲取活躍股票
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(activeStocks);
      }, 100);
    });
  }

  async getRecommendedStocks(): Promise<RecommendedStock[]> {
    // 模擬 API 調用獲取推薦股票
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(recommendedStocks);
      }, 100);
    });
  }

  async getSectorPerformance(): Promise<SectorPerformance[]> {
    // 模擬 API 調用獲取板塊表現
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(sectorPerformance);
      }, 100);
    });
  }

  async getMarketNews(limit: number = 10): Promise<MarketNews[]> {
    // 模擬 API 調用獲取市場新聞，轉換數據格式
    return new Promise((resolve) => {
      setTimeout(() => {
        const transformedNews: MarketNews[] = marketNews
          .slice(0, limit)
          .map((news) => ({
            title: news.title,
            source: news.source,
            time: news.time, // marketNews 使用 time 屬性
            impact: news.impact,
            category: news.category,
            summary: news.summary,
          }));
        resolve(transformedNews);
      }, 100);
    });
  }

  async getLatestNews(limit: number = 5): Promise<MarketNews[]> {
    // 模擬 API 調用獲取最新新聞，轉換數據格式
    return new Promise((resolve) => {
      setTimeout(() => {
        const transformedNews: MarketNews[] = latestNews
          .slice(0, limit)
          .map((news) => ({
            title: news.title,
            source: news.source,
            time: news.date, // latestNews 使用 date 屬性
            impact: "低",
            category: news.category,
            summary: `${news.title.substring(0, 50)}...`,
          }));
        resolve(transformedNews);
      }, 100);
    });
  }

  async getMarketAnalytics(): Promise<MarketAnalytics> {
    // 模擬 API 調用獲取市場分析數據
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalVolume: "2,847億",
          activeUsers: "15.6萬",
          marketCap: "56.8兆",
          volatilityIndex: "18.5",
        });
      }, 100);
    });
  }

  async getMarketTrend(timeRange: TimeRange = "1d"): Promise<MarketTrend> {
    // 模擬 API 調用獲取市場趨勢
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          period: timeRange,
          direction: "up",
          strength: 75,
          indicators: {
            rsi: 65.2,
            macd: 1.25,
            sma: 16234.56,
          },
        });
      }, 100);
    });
  }

  async searchMarketData(query: string): Promise<MarketData[]> {
    // 模擬搜索市場數據，確保返回正確的 MarketData 格式
    const allMarkets: MarketData[] = [
      {
        name: "台灣加權指數",
        value: "16,234.56",
        change: "+123.45",
        changePercent: "+0.77%",
        description: "台灣股市主要指數",
        volume: "2.1億",
        highlights: "科技股領漲",
      },
      {
        name: "美國道瓊指數",
        value: "34,567.89",
        change: "+234.56",
        changePercent: "+0.68%",
        description: "美國主要股市指數",
        volume: "3.2億",
        highlights: "持續上漲趨勢",
      },
      {
        name: "比特幣",
        value: "$42,567",
        change: "+1,234",
        changePercent: "+2.98%",
        description: "主要加密貨幣",
        volume: "28億",
        highlights: "突破重要阻力位",
      },
    ];

    return new Promise((resolve) => {
      setTimeout(() => {
        const results = allMarkets.filter((market) =>
          market.name.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      }, 200);
    });
  }

  private async refreshMarketData(): Promise<void> {
    try {
      // 模擬 API 調用更新市場數據
      await new Promise((resolve) => setTimeout(resolve, 500));

      this.marketOverviewCache = marketOverview;
      this.marketSentimentCache = marketSentiment;
      this.lastUpdateTime = Date.now();
    } catch (error) {
      console.error("Failed to refresh market data:", error);
      throw error;
    }
  }

  private async refreshChartData(timeRange: TimeRange): Promise<void> {
    try {
      // 模擬 API 調用更新圖表數據
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 根據時間範圍生成不同的數據
      const mockChartData: ChartData = {
        dates: this.generateDateLabels(timeRange),
        values: this.generateMockValues(timeRange),
        volumes: this.generateMockVolumes(timeRange),
        prices: this.generateMockPrices(timeRange),
      };

      this.chartDataCache.set(timeRange, mockChartData);
    } catch (error) {
      console.error("Failed to refresh chart data:", error);
      throw error;
    }
  }

  private generateDateLabels(timeRange: TimeRange): string[] {
    const now = new Date();
    const labels: string[] = [];

    switch (timeRange) {
      case "1d":
        for (let i = 0; i < 24; i++) {
          const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
          labels.push(
            time.toLocaleTimeString("zh-TW", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        }
        break;
      case "1w":
        for (let i = 0; i < 7; i++) {
          const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
          labels.push(
            date.toLocaleDateString("zh-TW", { month: "short", day: "numeric" })
          );
        }
        break;
      case "1m":
      case "3m":
      case "6m": {
        const days = timeRange === "1m" ? 30 : timeRange === "3m" ? 90 : 180;
        for (let i = 0; i < days; i++) {
          const date = new Date(
            now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000
          );
          labels.push(
            date.toLocaleDateString("zh-TW", { month: "short", day: "numeric" })
          );
        }
        break;
      }
      default:
        labels.push(now.toLocaleDateString());
    }

    return labels;
  }

  private generateMockValues(timeRange: TimeRange): number[] {
    const baseValue = 16234;
    const count =
      timeRange === "1d"
        ? 24
        : timeRange === "1w"
        ? 7
        : timeRange === "1m"
        ? 30
        : timeRange === "3m"
        ? 90
        : 180;
    const values: number[] = [];

    for (let i = 0; i < count; i++) {
      const randomChange = (Math.random() - 0.5) * 200;
      values.push(baseValue + randomChange);
    }

    return values;
  }

  private generateMockVolumes(timeRange: TimeRange): number[] {
    const count =
      timeRange === "1d"
        ? 24
        : timeRange === "1w"
        ? 7
        : timeRange === "1m"
        ? 30
        : timeRange === "3m"
        ? 90
        : 180;
    const volumes: number[] = [];

    for (let i = 0; i < count; i++) {
      volumes.push(Math.random() * 1000000 + 500000);
    }

    return volumes;
  }

  private generateMockPrices(timeRange: TimeRange): number[] {
    const basePrice = 580;
    const count =
      timeRange === "1d"
        ? 24
        : timeRange === "1w"
        ? 7
        : timeRange === "1m"
        ? 30
        : timeRange === "3m"
        ? 90
        : 180;
    const prices: number[] = [];

    for (let i = 0; i < count; i++) {
      const randomChange = (Math.random() - 0.5) * 20;
      prices.push(basePrice + randomChange);
    }

    return prices;
  }

  // 清除快取
  clearCache(): void {
    this.marketOverviewCache = null;
    this.marketSentimentCache = null;
    this.chartDataCache.clear();
    this.lastUpdateTime = 0;
  }

  // 設置更新間隔
  setUpdateInterval(interval: number): void {
    this.updateInterval = interval;
  }
}

export default MarketModel;
