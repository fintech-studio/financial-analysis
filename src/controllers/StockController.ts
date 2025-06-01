import { StockModel, Stock, StockData, MarketData } from "../models/StockModel";

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
  private stockModel: StockModel;

  constructor() {
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

  async removeFromWatchlist(userId: string, symbol: string): Promise<boolean> {
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
}
