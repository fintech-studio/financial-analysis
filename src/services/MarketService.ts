import {
  MarketOverview,
  MarketSector,
  MarketSentiment,
  MarketTrend,
  MarketIndex,
  HotStock,
  MarketNews,
} from "@/types/market";

export interface MarketDataParams {
  period?: string;
  limit?: number;
  sector?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export class MarketService {
  private static instance: MarketService;
  private baseUrl =
    process.env.NEXT_PUBLIC_MARKET_API_URL || "https://api.market.example.com";

  static getInstance(): MarketService {
    if (!MarketService.instance) {
      MarketService.instance = new MarketService();
    }
    return MarketService.instance;
  }

  private constructor() {}

  async getMarketOverview(): Promise<MarketOverview> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 300));

      const mockOverview: MarketOverview = {
        indices: [
          {
            id: "TWSE",
            name: "加權指數",
            symbol: "TWSE",
            value: "18456.72",
            change: "89.45",
            changePercent: "0.49",
            volume: "2847365000",
            updateTime: new Date().toISOString(),
            status: "open",
          },
          {
            id: "TPEx",
            name: "櫃買指數",
            symbol: "TPEx",
            value: "254.78",
            change: "-1.23",
            changePercent: "-0.48",
            volume: "891234000",
            updateTime: new Date().toISOString(),
            status: "open",
          },
          {
            id: "NASDAQ",
            name: "那斯達克",
            symbol: "NASDAQ",
            value: "15834.23",
            change: "127.89",
            changePercent: "0.81",
            volume: "4523789000",
            updateTime: new Date().toISOString(),
            status: "closed",
          },
          {
            id: "SP500",
            name: "標普500",
            symbol: "S&P 500",
            value: "4567.89",
            change: "23.45",
            changePercent: "0.52",
            volume: "3245678000",
            updateTime: new Date().toISOString(),
            status: "closed",
          },
        ],
        summary: {
          totalMarketCap: 58900000000000,
          totalVolume: 2847365000,
          advancingStocks: 856,
          decliningStocks: 634,
          unchangedStocks: 78,
          newHighs: 23,
          newLows: 12,
          topGainers: 145,
          topLosers: 89,
        },
        sectors: [
          {
            id: "technology",
            name: "科技類股",
            change: 1.24,
            changePercent: 2.1,
            volume: 1234567890,
            marketCap: 15600000000000,
            stockCount: 89,
          },
          {
            id: "finance",
            name: "金融類股",
            change: -0.67,
            changePercent: -0.89,
            volume: 789123456,
            marketCap: 8900000000000,
            stockCount: 67,
          },
          {
            id: "electronics",
            name: "電子類股",
            change: 0.89,
            changePercent: 1.45,
            volume: 2345678901,
            marketCap: 12300000000000,
            stockCount: 156,
          },
        ],
        lastUpdate: new Date().toISOString(),
      };

      return mockOverview;
    } catch (error) {
      console.error("Error fetching market overview:", error);
      throw new Error("無法獲取市場總覽");
    }
  }

  async getMarketIndices(): Promise<MarketIndex[]> {
    try {
      const overview = await this.getMarketOverview();
      return overview.indices || [];
    } catch (error) {
      console.error("Error fetching market indices:", error);
      throw new Error("無法獲取市場指數");
    }
  }

  async getMarketSectors(): Promise<MarketSector[]> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 250));

      const mockSectors: MarketSector[] = [
        {
          id: "technology",
          name: "科技類股",
          change: "1.24",
          changePercent: "2.1",
          volume: 1234567890,
          marketCap: 15600000000000,
          stockCount: 89,
          topStocks: [
            { symbol: "2330", name: "台積電", change: 2.5 },
            { symbol: "2454", name: "聯發科", change: 1.8 },
            { symbol: "3008", name: "大立光", change: -0.5 },
          ],
        },
        {
          id: "finance",
          name: "金融類股",
          change: "-0.67",
          changePercent: "-0.89",
          volume: 789123456,
          marketCap: 8900000000000,
          stockCount: 67,
          topStocks: [
            { symbol: "2881", name: "富邦金", change: -1.2 },
            { symbol: "2882", name: "國泰金", change: -0.8 },
            { symbol: "2883", name: "開發金", change: 0.3 },
          ],
        },
        {
          id: "electronics",
          name: "電子類股",
          change: "0.89",
          changePercent: "1.45",
          volume: 2345678901,
          marketCap: 12300000000000,
          stockCount: 156,
          topStocks: [
            { symbol: "2317", name: "鴻海", change: 1.5 },
            { symbol: "2382", name: "廣達", change: 2.1 },
            { symbol: "2303", name: "聯電", change: 0.7 },
          ],
        },
        {
          id: "petrochemical",
          name: "石化類股",
          change: "-1.23",
          changePercent: "-2.1",
          volume: 456789123,
          marketCap: 3400000000000,
          stockCount: 34,
          topStocks: [
            { symbol: "1301", name: "台塑", change: -2.3 },
            { symbol: "1303", name: "南亞", change: -1.8 },
            { symbol: "6505", name: "台塑化", change: -0.9 },
          ],
        },
        {
          id: "steel",
          name: "鋼鐵類股",
          change: "0.45",
          changePercent: "1.2",
          volume: 234567890,
          marketCap: 1800000000000,
          stockCount: 23,
          topStocks: [
            { symbol: "2002", name: "中鋼", change: 1.5 },
            { symbol: "2006", name: "東和鋼鐵", change: 0.8 },
            { symbol: "2027", name: "大成鋼", change: 2.1 },
          ],
        },
      ];

      return mockSectors;
    } catch (error) {
      console.error("Error fetching market sectors:", error);
      throw new Error("無法獲取產業分類");
    }
  }

  async getMarketSentiment(): Promise<MarketSentiment> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 200));

      const mockSentiment: MarketSentiment = {
        vix: {
          value: "18.45",
          change: "-0.25",
          changePercent: "-1.34",
          status: "low",
          description: "恐慌指數偏低，市場情緒穩定",
        },
        fearGreed: {
          value: "68",
          change: "5",
          changePercent: "7.94",
          status: "greed",
          description: "市場情緒偏向貪婪",
        },
        marketBreadth: {
          value: "856/634",
          change: "122",
          changePercent: "16.17",
          status: "positive",
          description: "上漲股票數量明顯多於下跌",
        },
        overall: "bullish",
        score: 72,
        indicators: {
          fearGreedIndex: 68,
          vixLevel: 18.45,
          putCallRatio: 0.89,
          marginDebt: 456789123456,
          shortInterest: 12.3,
        },
        sentiment: {
          bullish: 68,
          neutral: 22,
          bearish: 10,
        },
        analysis: {
          summary: "市場情緒偏向樂觀，投資人信心回升",
          factors: [
            "科技股表現強勁",
            "經濟數據超預期",
            "央行政策支持",
            "外資持續買超",
          ],
          risks: ["通膨壓力仍存", "地緣政治風險", "美中貿易關係"],
        },
        lastUpdate: new Date().toISOString(),
      };

      return mockSentiment;
    } catch (error) {
      console.error("Error fetching market sentiment:", error);
      throw new Error("無法獲取市場情緒");
    }
  }

  async getMarketTrends(period: string = "1M"): Promise<MarketTrend[]> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 350));

      const mockTrends: MarketTrend[] = [
        {
          id: "ai_trend",
          name: "AI 人工智慧",
          category: "technology",
          description: "人工智慧相關概念股持續發燒",
          strength: 85,
          duration: "3個月",
          relatedStocks: [
            { symbol: "2454", name: "聯發科", correlation: 0.89 },
            { symbol: "3711", name: "日月光投控", correlation: 0.76 },
            { symbol: "2382", name: "廣達", correlation: 0.82 },
          ],
          performance: {
            "1D": 2.1,
            "1W": 8.5,
            "1M": 15.3,
            "3M": 28.7,
          },
        },
        {
          id: "green_energy",
          name: "綠能環保",
          category: "energy",
          description: "再生能源與環保概念受到關注",
          strength: 72,
          duration: "2個月",
          relatedStocks: [
            { symbol: "6176", name: "瑞儀", correlation: 0.68 },
            { symbol: "3576", name: "聯合再生", correlation: 0.74 },
            { symbol: "6282", name: "康舒", correlation: 0.65 },
          ],
          performance: {
            "1D": 1.2,
            "1W": 4.8,
            "1M": 9.6,
            "3M": 18.2,
          },
        },
        {
          id: "electric_vehicle",
          name: "電動車",
          category: "automotive",
          description: "電動車供應鏈受惠於全球電動化趨勢",
          strength: 78,
          duration: "4個月",
          relatedStocks: [
            { symbol: "2308", name: "台達電", correlation: 0.81 },
            { symbol: "1513", name: "中興電", correlation: 0.69 },
            { symbol: "2327", name: "國巨", correlation: 0.73 },
          ],
          performance: {
            "1D": 0.8,
            "1W": 3.2,
            "1M": 12.1,
            "3M": 22.5,
          },
        },
      ];

      return mockTrends;
    } catch (error) {
      console.error("Error fetching market trends:", error);
      throw new Error("無法獲取市場趨勢");
    }
  }

  async getHotStocks(params: MarketDataParams = {}): Promise<HotStock[]> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 280));

      const { limit = 20, sortBy = "volume" } = params;

      const mockHotStocks: HotStock[] = [
        {
          symbol: "2330",
          name: "台積電",
          price: "589.0",
          change: "12.0",
          changePercent: "2.08",
          volume: "45678901",
          turnover: "26915024490",
          highlights: "AI晶片需求強勁",
        },
        {
          symbol: "2454",
          name: "聯發科",
          price: "1045.0",
          change: "25.0",
          changePercent: "2.45",
          volume: "12345678",
          turnover: "12901033100",
          highlights: "5G晶片出貨增加",
        },
        {
          symbol: "2317",
          name: "鴻海",
          price: "108.5",
          change: "2.5",
          changePercent: "2.36",
          volume: "89012345",
          turnover: "9658004325",
          highlights: "iPhone訂單增加",
        },
        {
          symbol: "2382",
          name: "廣達",
          price: "234.5",
          change: "8.5",
          changePercent: "3.76",
          volume: "23456789",
          turnover: "5501516805",
          highlights: "AI伺服器訂單暢旺",
        },
        {
          symbol: "2881",
          name: "富邦金",
          price: "67.8",
          change: "-1.2",
          changePercent: "-1.74",
          volume: "34567890",
          turnover: "2343750822",
          highlights: "升息環境有利",
        },
      ];

      // 根據排序條件排序
      let sortedStocks = [...mockHotStocks];
      if (sortBy === "volume") {
        sortedStocks.sort(
          (a, b) => parseFloat(b.volume || "0") - parseFloat(a.volume || "0")
        );
      } else if (sortBy === "changePercent") {
        sortedStocks.sort(
          (a, b) =>
            Math.abs(parseFloat(b.changePercent)) -
            Math.abs(parseFloat(a.changePercent))
        );
      } else if (sortBy === "turnover") {
        sortedStocks.sort(
          (a, b) =>
            parseFloat(b.turnover || "0") - parseFloat(a.turnover || "0")
        );
      }

      return sortedStocks.slice(0, limit);
    } catch (error) {
      console.error("Error fetching hot stocks:", error);
      throw new Error("無法獲取熱門股票");
    }
  }

  async getTopGainers(limit: number = 10): Promise<HotStock[]> {
    try {
      const hotStocks = await this.getHotStocks({ limit: 50 });
      return hotStocks
        .filter((stock) => parseFloat(stock.changePercent) > 0)
        .sort(
          (a, b) => parseFloat(b.changePercent) - parseFloat(a.changePercent)
        )
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching top gainers:", error);
      throw new Error("無法獲取漲幅榜");
    }
  }

  async getTopLosers(limit: number = 10): Promise<HotStock[]> {
    try {
      const hotStocks = await this.getHotStocks({ limit: 50 });
      return hotStocks
        .filter((stock) => parseFloat(stock.changePercent) < 0)
        .sort(
          (a, b) => parseFloat(a.changePercent) - parseFloat(b.changePercent)
        )
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching top losers:", error);
      throw new Error("無法獲取跌幅榜");
    }
  }

  async getTopVolume(limit: number = 10): Promise<HotStock[]> {
    try {
      const hotStocks = await this.getHotStocks({
        limit: 50,
        sortBy: "volume",
      });
      return hotStocks.slice(0, limit);
    } catch (error) {
      console.error("Error fetching top volume:", error);
      throw new Error("無法獲取成交量排行");
    }
  }

  async getMarketNews(limit: number = 10): Promise<MarketNews[]> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 200));

      const mockMarketNews: MarketNews[] = [
        {
          id: "market_news_1",
          title: "台股收盤上漲89點，重回18400點",
          source: "財經新聞",
          time: new Date().toISOString(),
          impact: "positive",
          category: "market",
          summary: "台股今日在電子股帶領下收紅，加權指數終場上漲89.45點...",
          severity: "medium",
          affectedSectors: ["electronics", "technology"],
          publishedAt: new Date().toISOString(),
        },
        {
          id: "market_news_2",
          title: "Fed官員暗示可能暫停升息",
          source: "國際財經",
          time: new Date(Date.now() - 3600000).toISOString(),
          impact: "positive",
          category: "finance",
          summary: "美聯儲官員表示將根據經濟數據決定未來政策方向...",
          severity: "high",
          affectedSectors: ["finance", "all"],
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "market_news_3",
          title: "AI晶片需求持續強勁，半導體族群受惠",
          source: "科技新聞",
          time: new Date(Date.now() - 7200000).toISOString(),
          impact: "positive",
          category: "technology",
          summary: "人工智慧應用持續擴展，帶動相關晶片需求...",
          severity: "medium",
          affectedSectors: ["technology", "semiconductor"],
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ];

      return mockMarketNews.slice(0, limit);
    } catch (error) {
      console.error("Error fetching market news:", error);
      throw new Error("無法獲取市場新聞");
    }
  }

  async getMarketStatistics(): Promise<{
    trading: {
      totalVolume: number;
      totalTurnover: number;
      totalTransactions: number;
      averagePrice: number;
    };
    stocks: {
      total: number;
      advancing: number;
      declining: number;
      unchanged: number;
      suspended: number;
    };
    limits: {
      limitUp: number;
      limitDown: number;
      nearLimitUp: number;
      nearLimitDown: number;
    };
  }> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 150));

      return {
        trading: {
          totalVolume: 2847365000,
          totalTurnover: 234567890123,
          totalTransactions: 1234567,
          averagePrice: 82.45,
        },
        stocks: {
          total: 1768,
          advancing: 856,
          declining: 634,
          unchanged: 278,
          suspended: 0,
        },
        limits: {
          limitUp: 12,
          limitDown: 5,
          nearLimitUp: 34,
          nearLimitDown: 18,
        },
      };
    } catch (error) {
      console.error("Error fetching market statistics:", error);
      throw new Error("無法獲取市場統計");
    }
  }

  async refreshMarketData(): Promise<void> {
    try {
      // 模擬刷新市場數據
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("Market data refreshed");
    } catch (error) {
      console.error("Error refreshing market data:", error);
      throw new Error("無法刷新市場數據");
    }
  }
}

export default MarketService;
