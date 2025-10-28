import {
  PortfolioModel,
  Portfolio,
  Holding,
  Transaction,
  AssetAllocation,
  PerformanceData,
} from "@/models/PortfolioModel";
import { BaseController } from "./BaseController";
import { PortfolioService } from "@/services/PortfolioService";
import * as PortfolioTypes from "@/types/portfolio";

export interface AddTransactionRequest {
  portfolioId?: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string;
  fees?: number;
  notes?: string;
}

export interface UpdateHoldingRequest {
  symbol: string;
  updates: Partial<Holding>;
}

export interface PortfolioAnalysisRequest {
  userId: string;
  timeRange?: "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";
}

export class PortfolioController extends BaseController {
  private static instance: PortfolioController;
  private portfolioModel: PortfolioModel;
  private portfolioService: PortfolioService;

  private constructor() {
    super();
    this.portfolioModel = PortfolioModel.getInstance();
    this.portfolioService = PortfolioService.getInstance();
  }

  static getInstance(): PortfolioController {
    if (!PortfolioController.instance) {
      PortfolioController.instance = new PortfolioController();
    }
    return PortfolioController.instance;
  }

  // 類型轉換輔助函數
  private convertServicePortfolioToModel(
    servicePortfolio: PortfolioTypes.Portfolio
  ): Portfolio {
    return {
      id: servicePortfolio.id,
      userId: servicePortfolio.userId,
      totalValue:
        typeof servicePortfolio.totalValue === "string"
          ? parseFloat(servicePortfolio.totalValue.replace(/,/g, ""))
          : 0,
      totalReturn: servicePortfolio.totalGainLoss || 0,
      dayChange: servicePortfolio.dayChange || 0,
      dayChangePercent: servicePortfolio.dayChangePercent || 0,
      holdings: servicePortfolio.holdings.map((h) =>
        this.convertServiceHoldingToModel(h)
      ),
      allocation:
        servicePortfolio.allocation?.map((a) =>
          this.convertServiceAllocationToModel(a)
        ) || [],
      performance: this.convertServicePerformanceToModel(
        servicePortfolio.performance
      ),
      transactions:
        servicePortfolio.transactions?.map((t) =>
          this.convertServiceTransactionToModel(t)
        ) || [],
      risk: {
        riskScore: 5.0,
        volatility: 15.0,
        beta: 1.0,
        sharpeRatio: 1.0,
        maxDrawdown: -10.0,
        riskLevel: "medium",
      },
      overview: {
        totalValue:
          typeof servicePortfolio.totalValue === "string"
            ? parseFloat(servicePortfolio.totalValue.replace(/,/g, ""))
            : 0,
        totalReturn: servicePortfolio.totalGainLoss || 0,
        dayChange: servicePortfolio.dayChange || 0,
        dayChangePercent: servicePortfolio.dayChangePercent || 0,
        holdingsCount: servicePortfolio.holdings.length,
        lastUpdated: servicePortfolio.updatedAt || new Date().toISOString(),
      },
      aiRecommendations: [],
    };
  }

  private convertServiceHoldingToModel(
    serviceHolding: PortfolioTypes.Holding
  ): Holding {
    return {
      symbol: serviceHolding.symbol,
      name: serviceHolding.name,
      price: serviceHolding.currentPrice,
      priceChange: serviceHolding.dayChange || 0,
      quantity: serviceHolding.quantity.toString(),
      marketValue: serviceHolding.totalValue || "0",
      costBasis: (serviceHolding.costBasis || 0).toString(),
      totalReturn: {
        value: serviceHolding.unrealizedReturn || "0",
        percentage: serviceHolding.unrealizedReturnPercent || "0%",
      },
      weight: serviceHolding.weight ? `${serviceHolding.weight}%` : "0%",
    };
  }

  private convertServiceAllocationToModel(
    serviceAllocation: PortfolioTypes.AssetAllocation
  ): AssetAllocation {
    return {
      category: serviceAllocation.category || serviceAllocation.name,
      percentage: serviceAllocation.percentage,
      value: serviceAllocation.value,
      color: serviceAllocation.color,
    };
  }

  private convertServicePerformanceToModel(
    servicePerformance?: PortfolioTypes.PerformanceData
  ): PerformanceData {
    if (!servicePerformance) {
      return {
        labels: [],
        portfolioValue: [],
        benchmarkValue: [],
        timeRange: "1M",
      };
    }

    return {
      labels: servicePerformance.labels,
      portfolioValue: Array.isArray(servicePerformance.values)
        ? servicePerformance.values.map((v) =>
            typeof v === "string" ? parseFloat(v) : v
          )
        : [],
      benchmarkValue: servicePerformance.benchmarkValues
        ? servicePerformance.benchmarkValues.map((v) =>
            typeof v === "string" ? parseFloat(v) : v
          )
        : [],
      timeRange: "1M",
    };
  }

  private convertServiceTransactionToModel(
    serviceTransaction: PortfolioTypes.Transaction
  ): Transaction {
    return {
      id: serviceTransaction.id,
      symbol: serviceTransaction.symbol,
      type: serviceTransaction.type === "買入" ? "buy" : "sell",
      quantity:
        typeof serviceTransaction.quantity === "string"
          ? parseFloat(serviceTransaction.quantity)
          : serviceTransaction.quantity,
      price: parseFloat(serviceTransaction.price.replace(/[^\d.-]/g, "")),
      amount: parseFloat(serviceTransaction.total.replace(/[^\d.-]/g, "")),
      date: serviceTransaction.date,
      fee: 0,
      status: "completed" as const,
    };
  }

  async getPortfolio(userId: string): Promise<Portfolio> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequired(userId, "用戶ID");

      // 優先從服務層獲取數據，回退到模型層
      try {
        const portfolios = await this.portfolioService.getUserPortfolios(
          userId
        );
        const servicePortfolio =
          portfolios.find((p) => p.isDefault) || portfolios[0];
        if (servicePortfolio) {
          return this.convertServicePortfolioToModel(servicePortfolio);
        }
      } catch (serviceError) {
        console.warn("服務層獲取失敗，使用模型層:", serviceError);
      }

      const portfolio = await this.portfolioModel.getPortfolio(userId);
      if (!portfolio) {
        throw new Error("投資組合不存在");
      }
      return portfolio;
    }, "獲取投資組合");
  }

  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequired(userId, "用戶ID");
      const servicePortfolios = await this.portfolioService.getUserPortfolios(
        userId
      );
      return servicePortfolios.map((p) =>
        this.convertServicePortfolioToModel(p)
      );
    }, "獲取用戶投資組合列表");
  }

  async addTransaction(
    userId: string,
    request: AddTransactionRequest
  ): Promise<Transaction> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequired(userId, "用戶ID");
      this.validateRequired(request.symbol, "股票代碼");
      this.validatePositiveNumber(request.quantity, "數量");
      this.validatePositiveNumber(request.price, "價格");

      // 使用服務層處理交易邏輯
      const transactionData = {
        portfolioId: request.portfolioId || `${userId}_default`,
        symbol: request.symbol,
        type: request.type,
        quantity: request.quantity,
        price: request.price,
        date: request.date || new Date().toISOString(),
        fees: request.fees,
        notes: request.notes,
      };

      const serviceTransaction = await this.portfolioService.addTransaction(
        transactionData
      );
      return this.convertServiceTransactionToModel(serviceTransaction);
    }, "新增交易記錄");
  }

  async getPortfolioPerformance(
    userId: string,
    timeRange: "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL" = "1M"
  ): Promise<PerformanceData> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequired(userId, "用戶ID");

      const portfolio = await this.getPortfolio(userId);
      const servicePerformance =
        await this.portfolioService.getPortfolioPerformance(
          portfolio.id,
          timeRange.toLowerCase()
        );
      return this.convertServicePerformanceToModel(servicePerformance);
    }, "獲取投資組合績效");
  }

  async getAssetAllocation(userId: string): Promise<AssetAllocation[]> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequired(userId, "用戶ID");

      const serviceAllocations =
        await this.portfolioService.getAssetAllocation();
      return serviceAllocations.map((a) =>
        this.convertServiceAllocationToModel(a)
      );
    }, "獲取資產配置");
  }

  async getTransactionHistory(
    userId: string,
    limit?: number
  ): Promise<Transaction[]> {
    return this.executeWithErrorHandling(async () => {
      this.validateRequired(userId, "用戶ID");

      const serviceTransactions =
        await this.portfolioService.getPortfolioTransactions();

      const modelTransactions = serviceTransactions.map((t) =>
        this.convertServiceTransactionToModel(t)
      );
      return limit ? modelTransactions.slice(0, limit) : modelTransactions;
    }, "獲取交易歷史");
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

  async getPerformanceAnalysis(userId: string): Promise<PerformanceData> {
    try {
      const portfolio = await this.portfolioModel.getPortfolio(userId);
      if (!portfolio) {
        throw new Error("投資組合不存在");
      }
      return portfolio.performance;
    } catch (error) {
      throw new Error(
        `獲取績效分析失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getRiskAnalysis(userId: string): Promise<{
    riskScore: number;
    riskLevel: string;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    beta: number;
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
        sharpeRatio: portfolio.risk.sharpeRatio,
        maxDrawdown: portfolio.risk.maxDrawdown,
        beta: portfolio.risk.beta,
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
