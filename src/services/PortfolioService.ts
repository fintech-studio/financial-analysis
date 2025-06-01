import {
  Portfolio,
  Holding,
  Transaction,
  PerformanceData,
  AssetAllocation,
} from "@/types/portfolio";

export interface PortfolioSearchParams {
  userId: string;
  dateFrom?: string;
  dateTo?: string;
  symbol?: string;
  type?: "buy" | "sell";
}

export interface CreatePortfolioData {
  name: string;
  description?: string;
  isDefault?: boolean;
  userId: string;
}

export interface CreateTransactionData {
  portfolioId: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string;
  fees?: number;
  notes?: string;
}

export interface PortfolioAnalysis {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  bestPerformer: {
    symbol: string;
    gainLoss: number;
    gainLossPercent: number;
  };
  worstPerformer: {
    symbol: string;
    gainLoss: number;
    gainLossPercent: number;
  };
}

export class PortfolioService {
  private static instance: PortfolioService;

  static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService();
    }
    return PortfolioService.instance;
  }

  private constructor() {}

  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 模擬投資組合數據
      const mockPortfolios: Portfolio[] = [
        {
          id: "portfolio_1",
          name: "主要投資組合",
          description: "長期投資的核心持股",
          userId,
          totalValue: "1250000",
          totalCost: 1000000,
          totalGainLoss: 250000,
          totalGainLossPercent: 25.0,
          dayChange: 15000,
          dayChangePercent: 1.2,
          holdings: [],
          transactions: [],
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-06-01T10:00:00Z",
          isDefault: true,
        },
        {
          id: "portfolio_2",
          name: "短期交易組合",
          description: "短期交易和波段操作",
          userId,
          totalValue: "500000",
          totalCost: 480000,
          totalGainLoss: 20000,
          totalGainLossPercent: 4.17,
          dayChange: -5000,
          dayChangePercent: -1.0,
          holdings: [],
          transactions: [],
          createdAt: "2024-03-01T00:00:00Z",
          updatedAt: "2024-06-01T10:00:00Z",
          isDefault: false,
        },
      ];

      return mockPortfolios;
    } catch (error) {
      console.error("Error fetching user portfolios:", error);
      throw new Error("無法獲取投資組合");
    }
  }

  async getPortfolioById(portfolioId: string): Promise<Portfolio | null> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 200));

      const holdings = await this.getPortfolioHoldings(portfolioId);
      const transactions = await this.getPortfolioTransactions(portfolioId);

      const mockPortfolio: Portfolio = {
        id: portfolioId,
        name: "主要投資組合",
        description: "長期投資的核心持股",
        userId: "user_001",
        totalValue: "1250000",
        totalCost: 1000000,
        totalGainLoss: 250000,
        totalGainLossPercent: 25.0,
        dayChange: 15000,
        dayChangePercent: 1.2,
        holdings,
        transactions,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-06-01T10:00:00Z",
        isDefault: true,
      };

      return mockPortfolio;
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      throw new Error("無法獲取投資組合詳情");
    }
  }

  async getPortfolioHoldings(portfolioId: string): Promise<Holding[]> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 模擬持股數據
      const mockHoldings: Holding[] = [
        {
          id: "holding_1",
          portfolioId,
          symbol: "2330",
          name: "台積電",
          quantity: 1000,
          averagePrice: "500",
          currentPrice: "580",
          marketValue: 580000,
          costBasis: 500000,
          gainLoss: 80000,
          gainLossPercent: 16.0,
          dayChange: 10000,
          dayChangePercent: 1.75,
          weight: 46.4,
          lastUpdated: "2024-06-01T10:00:00Z",
        },
        {
          id: "holding_2",
          portfolioId,
          symbol: "2317",
          name: "鴻海",
          quantity: 2000,
          averagePrice: "100",
          currentPrice: "105.5",
          marketValue: 211000,
          costBasis: 200000,
          gainLoss: 11000,
          gainLossPercent: 5.5,
          dayChange: 5000,
          dayChangePercent: 2.43,
          weight: 16.9,
          lastUpdated: "2024-06-01T10:00:00Z",
        },
      ];

      return mockHoldings;
    } catch (error) {
      console.error("Error fetching portfolio holdings:", error);
      throw new Error("無法獲取持股明細");
    }
  }

  async getPortfolioTransactions(portfolioId: string): Promise<Transaction[]> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 250));

      // 模擬交易記錄
      const mockTransactions: Transaction[] = [
        {
          id: "tx_1",
          date: "2024-05-15",
          type: "買入",
          symbol: "2330",
          name: "台積電",
          quantity: 500,
          price: "520",
          total: "260000",
          note: "分批建倉",
        },
        {
          id: "tx_2",
          date: "2024-04-10",
          type: "買入",
          symbol: "2330",
          name: "台積電",
          quantity: 500,
          price: "480",
          total: "240000",
          note: "逢低加碼",
        },
        {
          id: "tx_3",
          date: "2024-03-20",
          type: "買入",
          symbol: "2317",
          name: "鴻海",
          quantity: 2000,
          price: "100",
          total: "200000",
          note: "新增持股",
        },
      ];

      return mockTransactions;
    } catch (error) {
      console.error("Error fetching portfolio transactions:", error);
      throw new Error("無法獲取交易記錄");
    }
  }

  async createPortfolio(data: CreatePortfolioData): Promise<Portfolio> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 400));

      const newPortfolio: Portfolio = {
        id: `portfolio_${Date.now()}`,
        name: data.name,
        description: data.description,
        userId: data.userId,
        totalValue: "0",
        totalCost: 0,
        totalGainLoss: 0,
        totalGainLossPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
        holdings: [],
        transactions: [],
        createdAt: new Date().toISOString(),
        isDefault: data.isDefault || false,
      };

      return newPortfolio;
    } catch (error) {
      console.error("Error creating portfolio:", error);
      throw new Error("無法創建投資組合");
    }
  }

  async updatePortfolio(
    portfolioId: string,
    updates: Partial<Portfolio>
  ): Promise<Portfolio> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 300));

      const existingPortfolio = await this.getPortfolioById(portfolioId);
      if (!existingPortfolio) {
        throw new Error("投資組合不存在");
      }

      const updatedPortfolio: Portfolio = {
        ...existingPortfolio,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      return updatedPortfolio;
    } catch (error) {
      console.error("Error updating portfolio:", error);
      throw new Error("無法更新投資組合");
    }
  }

  async deletePortfolio(portfolioId: string): Promise<void> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 200));
      console.log(`Portfolio ${portfolioId} deleted`);
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      throw new Error("無法刪除投資組合");
    }
  }

  async addTransaction(data: CreateTransactionData): Promise<Transaction> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        date: data.date,
        type: data.type === "buy" ? "買入" : "賣出",
        symbol: data.symbol,
        name: data.symbol, // 這裡應該根據 symbol 獲取股票名稱
        quantity: data.quantity,
        price: data.price.toString(),
        total: (data.quantity * data.price).toString(),
        note: data.notes,
      };

      return newTransaction;
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw new Error("無法新增交易記錄");
    }
  }

  async getPortfolioPerformance(
    portfolioId: string,
    timeRange: string = "1y"
  ): Promise<PerformanceData> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 400));

      // 生成模擬績效數據
      const generatePerformanceData = (range: string): PerformanceData => {
        const now = new Date();
        const labels: string[] = [];
        const values: number[] = [];
        let dataPoints = 0;

        switch (range) {
          case "1m":
            dataPoints = 30;
            break;
          case "3m":
            dataPoints = 90;
            break;
          case "6m":
            dataPoints = 180;
            break;
          case "1y":
          default:
            dataPoints = 365;
            break;
        }

        let currentValue = 1000000; // 起始價值

        for (let i = 0; i < dataPoints; i++) {
          const date = new Date(
            now.getTime() - (dataPoints - 1 - i) * 24 * 60 * 60 * 1000
          );
          labels.push(date.toISOString().split("T")[0]);

          // 模擬價值變化 (隨機走勢)
          const change = (Math.random() - 0.5) * 0.03; // ±1.5% daily change
          currentValue *= 1 + change;
          values.push(Math.round(currentValue));
        }

        return { labels, values };
      };

      return generatePerformanceData(timeRange);
    } catch (error) {
      console.error("Error fetching portfolio performance:", error);
      throw new Error("無法獲取投資組合績效");
    }
  }

  async getAssetAllocation(portfolioId: string): Promise<AssetAllocation[]> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 模擬資產配置數據
      const mockAllocation: AssetAllocation[] = [
        {
          name: "科技股",
          category: "科技股",
          value: 750000,
          percentage: 60.0,
          color: "#3B82F6",
        },
        {
          name: "金融股",
          category: "金融股",
          value: 250000,
          percentage: 20.0,
          color: "#10B981",
        },
        {
          name: "傳統產業",
          category: "傳統產業",
          value: 150000,
          percentage: 12.0,
          color: "#F59E0B",
        },
        {
          name: "現金",
          category: "現金",
          value: 100000,
          percentage: 8.0,
          color: "#6B7280",
        },
      ];

      return mockAllocation;
    } catch (error) {
      console.error("Error fetching asset allocation:", error);
      throw new Error("無法獲取資產配置");
    }
  }

  async getPortfolioAnalysis(portfolioId: string): Promise<PortfolioAnalysis> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 300));

      const holdings = await this.getPortfolioHoldings(portfolioId);

      const totalValue = holdings.reduce(
        (sum, holding) => sum + (holding.marketValue || 0),
        0
      );
      const totalCost = holdings.reduce(
        (sum, holding) => sum + (holding.costBasis || 0),
        0
      );
      const totalGainLoss = totalValue - totalCost;
      const totalGainLossPercent = (totalGainLoss / totalCost) * 100;
      const dayChange = holdings.reduce(
        (sum, holding) => sum + (holding.dayChange || 0),
        0
      );
      const dayChangePercent = (dayChange / totalValue) * 100;

      // 找出表現最好和最差的股票
      const sortedHoldings = [...holdings].sort(
        (a, b) => (b.gainLossPercent || 0) - (a.gainLossPercent || 0)
      );
      const bestPerformer = sortedHoldings[0];
      const worstPerformer = sortedHoldings[sortedHoldings.length - 1];

      const analysis: PortfolioAnalysis = {
        totalValue,
        totalCost,
        totalGainLoss,
        totalGainLossPercent,
        dayChange,
        dayChangePercent,
        bestPerformer: {
          symbol: bestPerformer.symbol,
          gainLoss: bestPerformer.gainLoss || 0,
          gainLossPercent: bestPerformer.gainLossPercent || 0,
        },
        worstPerformer: {
          symbol: worstPerformer.symbol,
          gainLoss: worstPerformer.gainLoss || 0,
          gainLossPercent: worstPerformer.gainLossPercent || 0,
        },
      };

      return analysis;
    } catch (error) {
      console.error("Error analyzing portfolio:", error);
      throw new Error("無法分析投資組合");
    }
  }

  async searchTransactions(
    params: PortfolioSearchParams
  ): Promise<Transaction[]> {
    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 這裡應該根據搜索參數過濾交易記錄
      const allTransactions = await this.getPortfolioTransactions(
        "portfolio_1"
      );

      let filteredTransactions = allTransactions;

      if (params.symbol) {
        filteredTransactions = filteredTransactions.filter(
          (tx) => tx.symbol === params.symbol
        );
      }

      if (params.type) {
        // 轉換搜索類型為中文
        const searchType = params.type === "buy" ? "買入" : "賣出";
        filteredTransactions = filteredTransactions.filter(
          (tx) => tx.type === searchType
        );
      }

      return filteredTransactions;
    } catch (error) {
      console.error("Error searching transactions:", error);
      throw new Error("無法搜索交易記錄");
    }
  }
}

export default PortfolioService;
