import {
  PortfolioModel,
  Portfolio,
  Holding,
  Transaction,
  AssetAllocation,
  PerformanceData,
} from "../models/PortfolioModel";

export interface AddTransactionRequest {
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string;
}

export interface UpdateHoldingRequest {
  symbol: string;
  updates: Partial<Holding>;
}

export interface PortfolioAnalysisRequest {
  userId: string;
  timeRange?: "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";
}

export class PortfolioController {
  private portfolioModel: PortfolioModel;

  constructor() {
    this.portfolioModel = PortfolioModel.getInstance();
  }

  async getPortfolio(userId: string): Promise<Portfolio> {
    try {
      const portfolio = await this.portfolioModel.getPortfolio(userId);
      if (!portfolio) {
        throw new Error("投資組合不存在");
      }
      return portfolio;
    } catch (error) {
      throw new Error(
        `獲取投資組合失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async addTransaction(
    userId: string,
    request: AddTransactionRequest
  ): Promise<Transaction> {
    try {
      // 驗證交易數據
      if (request.quantity <= 0) {
        throw new Error("交易數量必須大於0");
      }
      if (request.price <= 0) {
        throw new Error("交易價格必須大於0");
      }

      const transaction = await this.portfolioModel.addTransaction(userId, {
        symbol: request.symbol,
        type: request.type,
        quantity: request.quantity,
        price: request.price,
        amount: request.quantity * request.price,
        date: request.date,
        fee: this.calculateTransactionFee(request.quantity * request.price),
        status: "completed",
      });

      return transaction;
    } catch (error) {
      throw new Error(
        `新增交易失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
      );
    }
  }

  async getPortfolioPerformance(
    userId: string,
    timeRange: "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL" = "1M"
  ): Promise<PerformanceData> {
    try {
      const portfolio = await this.portfolioModel.getPortfolio(userId);
      if (!portfolio) {
        throw new Error("投資組合不存在");
      }

      // 這裡可以根據時間範圍重新計算績效數據
      return {
        ...portfolio.performance,
        timeRange,
      };
    } catch (error) {
      throw new Error(
        `獲取投資組合績效失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getAssetAllocation(userId: string): Promise<AssetAllocation[]> {
    try {
      const portfolio = await this.portfolioModel.getPortfolio(userId);
      if (!portfolio) {
        throw new Error("投資組合不存在");
      }
      return portfolio.allocation;
    } catch (error) {
      throw new Error(
        `獲取資產配置失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getTransactionHistory(
    userId: string,
    limit?: number
  ): Promise<Transaction[]> {
    try {
      const portfolio = await this.portfolioModel.getPortfolio(userId);
      if (!portfolio) {
        throw new Error("投資組合不存在");
      }

      let transactions = portfolio.transactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      if (limit && limit > 0) {
        transactions = transactions.slice(0, limit);
      }

      return transactions;
    } catch (error) {
      throw new Error(
        `獲取交易歷史失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async updateHolding(
    userId: string,
    request: UpdateHoldingRequest
  ): Promise<Holding> {
    try {
      return await this.portfolioModel.updateHolding(
        userId,
        request.symbol,
        request.updates
      );
    } catch (error) {
      throw new Error(
        `更新持股失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
      );
    }
  }

  async getPortfolioSummary(userId: string): Promise<{
    totalValue: number;
    totalReturn: number;
    dayChange: number;
    dayChangePercent: number;
    holdingsCount: number;
    topHolding: Holding | null;
  }> {
    try {
      const portfolio = await this.portfolioModel.getPortfolio(userId);
      if (!portfolio) {
        throw new Error("投資組合不存在");
      }

      const topHolding =
        portfolio.holdings.length > 0
          ? portfolio.holdings.reduce((prev, current) =>
              parseFloat(prev.marketValue.replace(",", "")) >
              parseFloat(current.marketValue.replace(",", ""))
                ? prev
                : current
            )
          : null;

      return {
        totalValue: portfolio.totalValue,
        totalReturn: portfolio.totalReturn,
        dayChange: portfolio.dayChange,
        dayChangePercent: portfolio.dayChangePercent,
        holdingsCount: portfolio.holdings.length,
        topHolding,
      };
    } catch (error) {
      throw new Error(
        `獲取投資組合摘要失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getRiskAnalysis(userId: string): Promise<{
    riskScore: number;
    riskLevel: string;
    volatility: number;
    recommendations: string[];
  }> {
    try {
      const portfolio = await this.portfolioModel.getPortfolio(userId);
      if (!portfolio) {
        throw new Error("投資組合不存在");
      }

      const recommendations = this.generateRiskRecommendations(
        portfolio.risk.riskLevel
      );

      return {
        riskScore: portfolio.risk.riskScore,
        riskLevel: portfolio.risk.riskLevel,
        volatility: portfolio.risk.volatility,
        recommendations,
      };
    } catch (error) {
      throw new Error(
        `獲取風險分析失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async exportPortfolioReport(
    userId: string,
    format: "pdf" | "excel" = "pdf"
  ): Promise<{
    downloadUrl: string;
    fileName: string;
  }> {
    try {
      // 模擬報表生成
      const portfolio = await this.portfolioModel.getPortfolio(userId);
      if (!portfolio) {
        throw new Error("投資組合不存在");
      }

      const fileName = `portfolio_report_${userId}_${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      const downloadUrl = `/api/reports/${fileName}`;

      return {
        downloadUrl,
        fileName,
      };
    } catch (error) {
      throw new Error(
        `匯出投資組合報表失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getAllocation(userId: string): Promise<AssetAllocation[]> {
    // 這是 getAssetAllocation 的別名，為了保持一致性
    return this.getAssetAllocation(userId);
  }

  async exportReport(
    userId: string,
    format: "pdf" | "excel" = "pdf"
  ): Promise<{
    downloadUrl: string;
    fileName: string;
  }> {
    // 這是 exportPortfolioReport 的別名，為了保持一致性
    return this.exportPortfolioReport(userId, format);
  }

  private calculateTransactionFee(amount: number): number {
    // 簡單的手續費計算邏輯
    const feeRate = 0.001425; // 0.1425%
    const minFee = 20;
    return Math.max(amount * feeRate, minFee);
  }

  private generateRiskRecommendations(riskLevel: string): string[] {
    switch (riskLevel) {
      case "low":
        return [
          "您的投資組合風險較低，適合穩健型投資者",
          "可考慮增加一些成長型股票以提升報酬率",
          "建議維持適當的現金比例",
        ];
      case "medium":
        return [
          "您的投資組合風險適中，配置較為均衡",
          "建議定期檢視並調整資產配置",
          "可考慮分散投資至不同產業",
        ];
      case "high":
        return [
          "您的投資組合風險較高，請注意風險控制",
          "建議增加防御性資產的比例",
          "考慮設定停損點以控制損失",
        ];
      default:
        return ["建議諮詢專業理財顧問"];
    }
  }
}
