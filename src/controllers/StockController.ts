import {
  StockModel,
  Stock,
  StockDetail,
  MarketData,
} from "../models/StockModel";

export interface StockSearchRequest {
  query: string;
  limit?: number;
}

export interface StockMarketDataRequest {
  type: "stock" | "global" | "forex" | "all";
}

export interface StockPriceRequest {
  symbol: string;
  interval?: "1m" | "5m" | "15m" | "1h" | "1d";
  range?: "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y";
}

export class StockController {
  private static instance: StockController;
  private stockModel: StockModel;

  static getInstance(): StockController {
    if (!StockController.instance) {
      StockController.instance = new StockController();
    }
    return StockController.instance;
  }

  private constructor() {
    this.stockModel = StockModel.getInstance();
  }

  async getStock(symbol: string): Promise<Stock> {
    try {
      const stock = await this.stockModel.getStock(symbol);
      if (!stock) {
        throw new Error(`找不到股票代號 ${symbol}`);
      }
      return stock;
    } catch (error) {
      throw new Error(
        `獲取股票資料失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async searchStocks(request: StockSearchRequest): Promise<Stock[]> {
    try {
      if (!request.query || request.query.trim().length === 0) {
        throw new Error("搜尋關鍵字不能為空");
      }

      const results = await this.stockModel.searchStocks(request.query);

      // 應用限制
      if (request.limit && request.limit > 0) {
        return results.slice(0, request.limit);
      }

      return results;
    } catch (error) {
      throw new Error(
        `股票搜尋失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
      );
    }
  }

  async getMarketData(request: StockMarketDataRequest): Promise<MarketData> {
    try {
      const marketData = await this.stockModel.getMarketData();

      // 根據請求類型過濾數據
      switch (request.type) {
        case "stock":
          return { stock: marketData.stock };
        case "global":
          return { global: marketData.global };
        case "forex":
          return { forex: marketData.forex };
        case "all":
        default:
          return marketData;
      }
    } catch (error) {
      throw new Error(
        `獲取市場資料失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getHotStocks(): Promise<Stock[]> {
    try {
      return await this.stockModel.getHotStocks();
    } catch (error) {
      throw new Error(
        `獲取熱門股票失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getStockPrice(request: StockPriceRequest): Promise<{
    symbol: string;
    currentPrice: number;
    change: number;
    changePercent: number;
    volume: string;
    timestamp: string;
  }> {
    try {
      const stock = await this.stockModel.getStock(request.symbol);
      if (!stock) {
        throw new Error(`找不到股票代號 ${request.symbol}`);
      }

      // 解析價格資料
      const currentPrice = parseFloat(stock.price);
      const change = parseFloat(stock.change.replace("+", ""));
      const changePercent = parseFloat(
        stock.changePercent.replace("%", "").replace("+", "")
      );

      return {
        symbol: stock.symbol,
        currentPrice,
        change,
        changePercent,
        volume: stock.volume,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `獲取股價失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
      );
    }
  }

  async getStockNews(symbol: string): Promise<
    Array<{
      title: string;
      date: string;
      source: string;
      url?: string;
    }>
  > {
    try {
      const stock = await this.stockModel.getStock(symbol);
      if (!stock) {
        throw new Error(`找不到股票代號 ${symbol}`);
      }

      // 返回股票相關新聞
      return (
        stock.news || [
          {
            title: `${stock.name}第三季財報超預期`,
            date: "2024-06-01",
            source: "經濟日報",
          },
          {
            title: `分析師上調${stock.name}目標價`,
            date: "2024-05-30",
            source: "工商時報",
          },
        ]
      );
    } catch (error) {
      throw new Error(
        `獲取股票新聞失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async addToWatchlist(userId: string, symbol: string): Promise<boolean> {
    try {
      // 模擬添加到觀察清單的邏輯
      const stock = await this.stockModel.getStock(symbol);
      if (!stock) {
        throw new Error(`找不到股票代號 ${symbol}`);
      }

      // 這裡應該將股票添加到用戶的觀察清單
      return true;
    } catch (error) {
      throw new Error(
        `添加到觀察清單失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async removeFromWatchlist(): Promise<boolean> {
    try {
      // 模擬從觀察清單移除的邏輯
      return true;
    } catch (error) {
      throw new Error(
        `從觀察清單移除失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getWatchlist(): Promise<Stock[]> {
    try {
      // 模擬用戶關注列表
      const watchlistSymbols = ["2330", "2454", "2317", "3008", "2882"];

      const watchlist = await Promise.all(
        watchlistSymbols.map(async (symbol) => {
          const stock = await this.stockModel.getStock(symbol);
          return stock;
        })
      );

      return watchlist.filter((stock) => stock !== null) as Stock[];
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      throw new Error("無法獲取關注列表");
    }
  }

  async getStocks(filters?: any): Promise<StockDetail[]> {
    try {
      // 獲取股票列表，支援篩選
      const stocks = await this.stockModel.getStocks();

      if (!filters) return stocks;

      let filteredStocks = stocks;

      // 按板塊篩選
      if (filters.sector && filters.sector !== "all") {
        filteredStocks = filteredStocks.filter((stock) =>
          stock.industry?.toLowerCase().includes(filters.sector.toLowerCase())
        );
      }

      // 按搜尋關鍵字篩選
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredStocks = filteredStocks.filter(
          (stock) =>
            stock.name.toLowerCase().includes(searchTerm) ||
            stock.symbol.toLowerCase().includes(searchTerm)
        );
      }

      return filteredStocks;
    } catch (error) {
      throw new Error("獲取股票列表失敗");
    }
  }

  async getTechnicalAnalysis(): Promise<any> {
    try {
      // 模擬技術分析數據
      return {
        bullish: [
          {
            symbol: "2330",
            name: "台積電",
            pattern: "突破阻力線",
            confidence: 85,
          },
          {
            symbol: "2454",
            name: "聯發科",
            pattern: "黃金交叉",
            confidence: 78,
          },
        ],
        bearish: [
          { symbol: "2317", name: "鴻海", pattern: "頭肩頂", confidence: 72 },
          {
            symbol: "3008",
            name: "大立光",
            pattern: "死亡交叉",
            confidence: 68,
          },
        ],
      };
    } catch (error) {
      throw new Error("獲取技術分析失敗");
    }
  }

  async addFavoriteStock(userId: string, symbol: string): Promise<void> {
    try {
      // 模擬添加收藏股票
      console.log(`User ${userId} added ${symbol} to favorites`);
    } catch (error) {
      throw new Error("添加收藏股票失敗");
    }
  }

  async removeFavoriteStock(userId: string, symbol: string): Promise<void> {
    try {
      // 模擬移除收藏股票
      console.log(`User ${userId} removed ${symbol} from favorites`);
    } catch (error) {
      throw new Error("移除收藏股票失敗");
    }
  }

  // 轉換 Stock 類型為 UI 期望的格式
  convertStockForUI(stock: Stock): {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: string;
  } {
    return {
      symbol: stock.symbol,
      name: stock.name,
      price: parseFloat(stock.price.replace(/,/g, "")),
      change: parseFloat(stock.change.replace(/[+,]/g, "")),
      changePercent: parseFloat(stock.changePercent.replace(/[+%]/g, "")),
      volume: stock.volume,
    };
  }
}
