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
  MarketModel,
  MarketAnalytics,
  MarketTrend,
} from "@/models/MarketModel";

export interface MarketSearchParams {
  query?: string;
  category?: string;
  timeRange?: TimeRange;
  limit?: number;
}

export interface MarketBatchDataRequest {
  symbols?: string[];
  timeRange?: TimeRange;
  includeNews?: boolean;
  includeSentiment?: boolean;
}

export class MarketController {
  private static instance: MarketController;
  private marketModel: MarketModel;

  static getInstance(): MarketController {
    if (!MarketController.instance) {
      MarketController.instance = new MarketController();
    }
    return MarketController.instance;
  }

  private constructor() {
    this.marketModel = MarketModel.getInstance();
  }

  async getMarketOverview(
    forceRefresh: boolean = false
  ): Promise<MarketOverview> {
    try {
      return await this.marketModel.getMarketOverview(forceRefresh);
    } catch (error) {
      console.error("Error fetching market overview:", error);
      throw new Error("無法獲取市場概覽數據");
    }
  }

  async getMarketSentiment(
    forceRefresh: boolean = false
  ): Promise<MarketSentiment> {
    try {
      return await this.marketModel.getMarketSentiment(forceRefresh);
    } catch (error) {
      console.error("Error fetching market sentiment:", error);
      throw new Error("無法獲取市場情緒數據");
    }
  }

  async getChartData(timeRange: TimeRange = "1d"): Promise<ChartData> {
    try {
      return await this.marketModel.getChartData(timeRange);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      throw new Error("無法獲取圖表數據");
    }
  }

  async getHotStocks(): Promise<HotStock[]> {
    try {
      return await this.marketModel.getHotStocks();
    } catch (error) {
      console.error("Error fetching hot stocks:", error);
      throw new Error("無法獲取熱門股票數據");
    }
  }

  async getActiveStocks(): Promise<ActiveStock[]> {
    try {
      return await this.marketModel.getActiveStocks();
    } catch (error) {
      console.error("Error fetching active stocks:", error);
      throw new Error("無法獲取活躍股票數據");
    }
  }

  async getRecommendedStocks(): Promise<RecommendedStock[]> {
    try {
      return await this.marketModel.getRecommendedStocks();
    } catch (error) {
      console.error("Error fetching recommended stocks:", error);
      throw new Error("無法獲取推薦股票數據");
    }
  }

  async getSectorPerformance(): Promise<SectorPerformance[]> {
    try {
      return await this.marketModel.getSectorPerformance();
    } catch (error) {
      console.error("Error fetching sector performance:", error);
      throw new Error("無法獲取板塊表現數據");
    }
  }

  async getMarketNews(limit: number = 10): Promise<MarketNews[]> {
    try {
      return await this.marketModel.getMarketNews(limit);
    } catch (error) {
      console.error("Error fetching market news:", error);
      throw new Error("無法獲取市場新聞");
    }
  }

  async getLatestNews(limit: number = 5): Promise<MarketNews[]> {
    try {
      return await this.marketModel.getLatestNews(limit);
    } catch (error) {
      console.error("Error fetching latest news:", error);
      throw new Error("無法獲取最新新聞");
    }
  }

  async getMarketAnalytics(): Promise<MarketAnalytics> {
    try {
      return await this.marketModel.getMarketAnalytics();
    } catch (error) {
      console.error("Error fetching market analytics:", error);
      throw new Error("無法獲取市場分析數據");
    }
  }

  async getMarketTrend(timeRange: TimeRange = "1d"): Promise<MarketTrend> {
    try {
      return await this.marketModel.getMarketTrend(timeRange);
    } catch (error) {
      console.error("Error fetching market trend:", error);
      throw new Error("無法獲取市場趨勢數據");
    }
  }

  async searchMarketData(params: MarketSearchParams): Promise<MarketData[]> {
    try {
      const { query = "", limit = 20 } = params;
      const results = await this.marketModel.searchMarketData(query);
      return results.slice(0, limit);
    } catch (error) {
      console.error("Error searching market data:", error);
      throw new Error("無法搜索市場數據");
    }
  }

  async getMarketDataBatch(request: MarketBatchDataRequest): Promise<{
    overview?: MarketOverview;
    sentiment?: MarketSentiment;
    news?: MarketNews[];
    chartData?: ChartData;
  }> {
    try {
      const {
        timeRange = "1d",
        includeNews = false,
        includeSentiment = false,
      } = request;

      const result: any = {};

      // 並行獲取數據
      const promises: Promise<any>[] = [this.marketModel.getMarketOverview()];

      if (includeSentiment) {
        promises.push(this.marketModel.getMarketSentiment());
      }

      if (includeNews) {
        promises.push(this.marketModel.getMarketNews(10));
      }

      promises.push(this.marketModel.getChartData(timeRange));

      const results = await Promise.allSettled(promises);

      let index = 0;

      // 處理市場概覽
      if (results[index].status === "fulfilled") {
        result.overview = (results[index] as PromiseFulfilledResult<any>).value;
      }
      index++;

      // 處理市場情緒
      if (includeSentiment) {
        if (results[index].status === "fulfilled") {
          result.sentiment = (
            results[index] as PromiseFulfilledResult<any>
          ).value;
        }
        index++;
      }

      // 處理新聞
      if (includeNews) {
        if (results[index].status === "fulfilled") {
          result.news = (results[index] as PromiseFulfilledResult<any>).value;
        }
        index++;
      }

      // 處理圖表數據
      if (results[index].status === "fulfilled") {
        result.chartData = (
          results[index] as PromiseFulfilledResult<any>
        ).value;
      }

      return result;
    } catch (error) {
      console.error("Error fetching market data batch:", error);
      throw new Error("無法批量獲取市場數據");
    }
  }

  async refreshMarketData(): Promise<void> {
    try {
      // 清除快取並強制刷新
      this.marketModel.clearCache();
      await Promise.all([
        this.marketModel.getMarketOverview(true),
        this.marketModel.getMarketSentiment(true),
        this.marketModel.getChartData("1d"),
      ]);
    } catch (error) {
      console.error("Error refreshing market data:", error);
      throw new Error("無法刷新市場數據");
    }
  }

  async getMarketStatus(): Promise<{
    isOpen: boolean;
    nextOpen?: string;
    nextClose?: string;
    timezone: string;
  }> {
    // 模擬市場開放狀態檢查
    const now = new Date();
    const hour = now.getHours();
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
    const isOpen = isWeekday && hour >= 9 && hour < 14;

    return {
      isOpen,
      nextOpen: isOpen ? undefined : "09:00",
      nextClose: isOpen ? "13:30" : undefined,
      timezone: "Asia/Taipei",
    };
  }

  setUpdateInterval(interval: number): void {
    this.marketModel.setUpdateInterval(interval);
  }

  clearCache(): void {
    this.marketModel.clearCache();
  }

  async getMarketSummary(): Promise<{
    overview: MarketOverview;
    hotStocks: HotStock[];
    latestNews: MarketNews[];
    sentiment: MarketSentiment;
  }> {
    try {
      // 並行獲取市場摘要所需的數據
      const [overview, hotStocks, latestNews, sentiment] = await Promise.all([
        this.marketModel.getMarketOverview(),
        this.marketModel.getHotStocks(),
        this.marketModel.getLatestNews(5),
        this.marketModel.getMarketSentiment(),
      ]);

      return {
        overview,
        hotStocks,
        latestNews,
        sentiment,
      };
    } catch (error) {
      console.error("Error fetching market summary:", error);
      throw new Error("無法獲取市場摘要數據");
    }
  }
}

export default MarketController;
