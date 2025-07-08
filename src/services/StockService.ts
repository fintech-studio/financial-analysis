import { Stock, ChartData } from "@/models/StockModel";
import { TimeRange } from "@/types/market";

export interface StockSearchParams {
  query?: string;
  industry?: string;
  marketCap?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  limit?: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface StockNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export class StockService {
  private static instance: StockService;
  private baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://api.example.com";

  static getInstance(): StockService {
    if (!StockService.instance) {
      StockService.instance = new StockService();
    }
    return StockService.instance;
  }

  private constructor() {}

  async searchStocks(params: StockSearchParams): Promise<Stock[]> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 模擬股票搜索結果
      const mockStocks: Stock[] = [
        {
          symbol: "2330",
          name: "台積電",
          price: "580.00",
          change: "+10.00",
          changePercent: "+1.75%",
          open: "570.00",
          high: "585.00",
          low: "568.00",
          volume: "35,862",
          industry: "半導體",
          marketCap: "15.05兆",
          pe: "18.5",
          dividend: "11.00",
          chartData: {
            labels: ["09:00", "10:00", "11:00", "12:00", "13:00"],
            prices: [570, 575, 580, 578, 580],
          },
        },
        {
          symbol: "2317",
          name: "鴻海",
          price: "105.50",
          change: "+2.50",
          changePercent: "+2.43%",
          open: "103.00",
          high: "106.00",
          low: "102.50",
          volume: "28,456",
          industry: "電子製造",
          marketCap: "1.47兆",
          pe: "12.3",
          dividend: "5.20",
          chartData: {
            labels: ["09:00", "10:00", "11:00", "12:00", "13:00"],
            prices: [103, 104, 105, 104.5, 105.5],
          },
        },
      ];

      let filteredStocks = mockStocks;

      if (params.query) {
        const searchTerm = params.query.toLowerCase();
        filteredStocks = filteredStocks.filter(
          (stock) =>
            stock.symbol.includes(searchTerm) ||
            stock.name.toLowerCase().includes(searchTerm)
        );
      }

      if (params.industry) {
        filteredStocks = filteredStocks.filter(
          (stock) => stock.industry === params.industry
        );
      }

      return filteredStocks.slice(0, params.limit || 50);
    } catch (error) {
      console.error("Error searching stocks:", error);
      throw new Error("無法搜索股票數據");
    }
  }

  async getStockQuote(symbol: string): Promise<StockQuote> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 模擬即時報價
      const mockQuote: StockQuote = {
        symbol,
        price: 580.5,
        change: 12.5,
        changePercent: 2.2,
        volume: 35862000,
        timestamp: new Date().toISOString(),
      };

      return mockQuote;
    } catch (error) {
      console.error("Error fetching stock quote:", error);
      throw new Error("無法獲取股票報價");
    }
  }

  async getStockChart(
    symbol: string,
    timeRange: TimeRange = "1d"
  ): Promise<ChartData> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 400));

      // 根據時間範圍生成不同的圖表數據
      const generateChartData = (range: TimeRange): ChartData => {
        const now = new Date();
        const labels: string[] = [];
        const prices: number[] = [];
        let dataPoints = 0;

        switch (range) {
          case "1d":
            dataPoints = 24;
            for (let i = 0; i < dataPoints; i++) {
              const time = new Date(
                now.getTime() - (dataPoints - 1 - i) * 60 * 60 * 1000
              );
              labels.push(
                time.toLocaleTimeString("zh-TW", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              );
              prices.push(580 + (Math.random() - 0.5) * 20);
            }
            break;
          case "1w":
            dataPoints = 7;
            for (let i = 0; i < dataPoints; i++) {
              const date = new Date(
                now.getTime() - (dataPoints - 1 - i) * 24 * 60 * 60 * 1000
              );
              labels.push(
                date.toLocaleDateString("zh-TW", {
                  month: "short",
                  day: "numeric",
                })
              );
              prices.push(580 + (Math.random() - 0.5) * 40);
            }
            break;
          case "1m":
            dataPoints = 30;
            for (let i = 0; i < dataPoints; i++) {
              const date = new Date(
                now.getTime() - (dataPoints - 1 - i) * 24 * 60 * 60 * 1000
              );
              labels.push(
                date.toLocaleDateString("zh-TW", {
                  month: "short",
                  day: "numeric",
                })
              );
              prices.push(580 + (Math.random() - 0.5) * 60);
            }
            break;
          default:
            dataPoints = 30;
            for (let i = 0; i < dataPoints; i++) {
              labels.push(`Day ${i + 1}`);
              prices.push(580 + (Math.random() - 0.5) * 60);
            }
        }

        return { labels, prices };
      };

      return generateChartData(timeRange);
    } catch (error) {
      console.error("Error fetching stock chart:", error);
      throw new Error("無法獲取股票圖表數據");
    }
  }

  async getStockNews(symbol: string, limit: number = 10): Promise<StockNews[]> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 模擬股票新聞
      const mockNews: StockNews[] = [
        {
          id: "1",
          title: `${symbol === "2330" ? "台積電" : "股票"}第二季財報超預期`,
          summary: "公司公布亮眼財報數據，營收和獲利均超越市場預期...",
          source: "財經日報",
          publishedAt: "2024-06-01T10:00:00Z",
          url: "https://example.com/news/1",
          sentiment: "positive",
        },
        {
          id: "2",
          title: `分析師上調${symbol === "2330" ? "台積電" : "股票"}目標價`,
          summary: "多家投資銀行調升目標價，看好未來發展前景...",
          source: "投資週刊",
          publishedAt: "2024-06-01T08:30:00Z",
          url: "https://example.com/news/2",
          sentiment: "positive",
        },
      ];

      return mockNews.slice(0, limit);
    } catch (error) {
      console.error("Error fetching stock news:", error);
      throw new Error("無法獲取股票新聞");
    }
  }

  async getTechnicalIndicators(): Promise<TechnicalIndicators> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 250));

      // 模擬技術指標
      const mockIndicators: TechnicalIndicators = {
        rsi: 65.2,
        macd: {
          value: 1.25,
          signal: 0.85,
          histogram: 0.4,
        },
        sma20: 578.5,
        sma50: 572.3,
        bollinger: {
          upper: 590.0,
          middle: 580.0,
          lower: 570.0,
        },
      };

      return mockIndicators;
    } catch (error) {
      console.error("Error fetching technical indicators:", error);
      throw new Error("無法獲取技術指標");
    }
  }

  async getWatchlist(): Promise<Stock[]> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 這裡應該根據用戶 ID 獲取其關注列表
      return await this.searchStocks({ limit: 10 });
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      throw new Error("無法獲取關注列表");
    }
  }

  async addToWatchlist(userId: string, symbol: string): Promise<void> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 150));
      console.log(`Added ${symbol} to watchlist for user ${userId}`);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      throw new Error("無法加入關注列表");
    }
  }

  async removeFromWatchlist(userId: string, symbol: string): Promise<void> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 150));
      console.log(`Removed ${symbol} from watchlist for user ${userId}`);
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      throw new Error("無法從關注列表移除");
    }
  }

  async getTopGainers(limit: number = 10): Promise<Stock[]> {
    try {
      const stocks = await this.searchStocks({ limit: 50 });
      return stocks
        .sort(
          (a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent)
        )
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching top gainers:", error);
      throw new Error("無法獲取漲幅榜");
    }
  }

  async getTopLosers(limit: number = 10): Promise<Stock[]> {
    try {
      const stocks = await this.searchStocks({ limit: 50 });
      return stocks
        .sort(
          (a, b) => parseFloat(a.changePercent) - parseFloat(b.changePercent)
        )
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching top losers:", error);
      throw new Error("無法獲取跌幅榜");
    }
  }

  async getMostActive(limit: number = 10): Promise<Stock[]> {
    try {
      const stocks = await this.searchStocks({ limit: 50 });
      return stocks
        .sort(
          (a, b) =>
            parseInt(b.volume.replace(/,/g, "")) -
            parseInt(a.volume.replace(/,/g, ""))
        )
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching most active stocks:", error);
      throw new Error("無法獲取成交量排行");
    }
  }
}

export default StockService;
