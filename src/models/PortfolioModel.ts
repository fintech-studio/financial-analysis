export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number;
  totalReturn: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: Holding[];
  allocation: AssetAllocation[];
  performance: PerformanceData;
  transactions: Transaction[];
  risk: RiskData;
  overview: PortfolioOverviewData;
  aiRecommendations: AIRecommendation[];
}

export interface Holding {
  symbol: string;
  name: string;
  price: string;
  priceChange: number;
  quantity: string;
  marketValue: string;
  costBasis: string;
  totalReturn: {
    value: string;
    percentage: string;
  };
  weight: string;
}

export interface AssetAllocation {
  category: string;
  percentage: number;
  value: number;
  color: string;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  amount: number;
  date: string;
  fee: number;
  status: "completed" | "pending" | "cancelled";
}

export interface PerformanceData {
  labels: string[];
  portfolioValue: number[];
  benchmarkValue: number[];
  timeRange: "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";
}

export interface RiskData {
  riskScore: number;
  volatility: number;
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  riskLevel: "low" | "medium" | "high";
}

export interface PortfolioOverviewData {
  totalValue: number;
  totalReturn: number;
  dayChange: number;
  dayChangePercent: number;
  holdingsCount: number;
  lastUpdated: string;
}

export interface AIRecommendation {
  id: string;
  type: "buy" | "sell" | "hold" | "rebalance";
  symbol?: string;
  title: string;
  description: string;
  confidence: number;
  reasoning: string[];
  expectedReturn?: number;
  riskLevel: "low" | "medium" | "high";
  priority: "high" | "medium" | "low";
  createdAt: string;
}

export class PortfolioModel {
  private static instance: PortfolioModel;
  private portfolios: Map<string, Portfolio> = new Map();

  static getInstance(): PortfolioModel {
    if (!PortfolioModel.instance) {
      PortfolioModel.instance = new PortfolioModel();
    }
    return PortfolioModel.instance;
  }

  async getPortfolio(userId: string): Promise<Portfolio | null> {
    const portfolioId = `portfolio_${userId}`;

    if (this.portfolios.has(portfolioId)) {
      return this.portfolios.get(portfolioId)!;
    }

    // 創建模擬投資組合數據
    const mockPortfolio: Portfolio = {
      id: portfolioId,
      userId,
      totalValue: 1250000,
      totalReturn: 125000,
      dayChange: 15000,
      dayChangePercent: 1.2,
      holdings: [
        {
          symbol: "2330",
          name: "台積電",
          price: "580.00",
          priceChange: 1.75,
          quantity: "100",
          marketValue: "580,000",
          costBasis: "550,000",
          totalReturn: {
            value: "+30,000",
            percentage: "+5.45%",
          },
          weight: "46.4%",
        },
      ],
      allocation: [
        {
          category: "科技股",
          percentage: 60,
          value: 750000,
          color: "bg-blue-500",
        },
        {
          category: "金融股",
          percentage: 25,
          value: 312500,
          color: "bg-green-500",
        },
        {
          category: "現金",
          percentage: 15,
          value: 187500,
          color: "bg-gray-500",
        },
      ],
      performance: {
        labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
        portfolioValue: [1000000, 1050000, 1100000, 1150000, 1200000, 1250000],
        benchmarkValue: [1000000, 1030000, 1080000, 1120000, 1180000, 1220000],
        timeRange: "6M",
      },
      transactions: [
        {
          id: "tx_001",
          symbol: "2330",
          type: "buy",
          quantity: 100,
          price: 550,
          amount: 55000,
          date: "2024-06-01",
          fee: 100,
          status: "completed",
        },
      ],
      risk: {
        riskScore: 6.5,
        volatility: 15.2,
        beta: 1.1,
        sharpeRatio: 1.3,
        maxDrawdown: -8.5,
        riskLevel: "medium",
      },
      overview: {
        totalValue: 1250000,
        totalReturn: 125000,
        dayChange: 15000,
        dayChangePercent: 1.2,
        holdingsCount: 1,
        lastUpdated: "2024-06-30",
      },
      aiRecommendations: [
        {
          id: "rec_001",
          type: "buy",
          symbol: "2330",
          title: "Buy 台積電",
          description: "Based on recent performance and market trends.",
          confidence: 0.85,
          reasoning: [
            "Strong quarterly earnings",
            "Positive industry outlook",
            "Technicals indicate upward momentum",
          ],
          expectedReturn: 0.1,
          riskLevel: "medium",
          priority: "high",
          createdAt: "2024-06-30",
        },
      ],
    };

    this.portfolios.set(portfolioId, mockPortfolio);
    return mockPortfolio;
  }

  async addTransaction(
    userId: string,
    transaction: Omit<Transaction, "id">
  ): Promise<Transaction> {
    const portfolio = await this.getPortfolio(userId);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }

    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}`,
    };

    portfolio.transactions.push(newTransaction);
    this.portfolios.set(portfolio.id, portfolio);

    return newTransaction;
  }

  async updateHolding(
    userId: string,
    symbol: string,
    updates: Partial<Holding>
  ): Promise<Holding> {
    const portfolio = await this.getPortfolio(userId);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }

    const holdingIndex = portfolio.holdings.findIndex(
      (h) => h.symbol === symbol
    );
    if (holdingIndex === -1) {
      throw new Error("Holding not found");
    }

    portfolio.holdings[holdingIndex] = {
      ...portfolio.holdings[holdingIndex],
      ...updates,
    };

    this.portfolios.set(portfolio.id, portfolio);
    return portfolio.holdings[holdingIndex];
  }

  async calculatePortfolioMetrics(userId: string): Promise<{
    totalValue: number;
    totalReturn: number;
    riskScore: number;
  }> {
    const portfolio = await this.getPortfolio(userId);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }

    // 這裡可以實現複雜的投資組合計算邏輯
    return {
      totalValue: portfolio.totalValue,
      totalReturn: portfolio.totalReturn,
      riskScore: portfolio.risk.riskScore,
    };
  }
}
