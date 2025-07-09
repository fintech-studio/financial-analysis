import {
  AIPredictionModel,
  ModelSettings,
  PortfolioItem,
  TechnicalIndicator,
  AIPrediction,
  StockAnalysis,
  MarketTrendPrediction,
  PricePredictionChart,
  AccuracyMetrics,
  RiskAssessment,
  DashboardSummary,
} from "../models/AIPredictionModel";

export interface AIPredictionStockSearchRequest {
  query: string;
  limit?: number;
}

export interface PredictionAnalysisRequest {
  symbol: string;
  timeRange: "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";
  includeIndicators?: boolean;
  model?: "lstm" | "transformer" | "ensemble";
}

export interface PortfolioManagementRequest {
  userId: string;
  action: "add" | "remove" | "update";
  item?: Omit<PortfolioItem, "date">;
  symbol?: string;
}

export interface DashboardRequest {
  includeMarketTrends?: boolean;
  includeAccuracyMetrics?: boolean;
  includeTopStocks?: boolean;
  timeframe?: "short" | "medium" | "long" | "all";
}

export interface PredictionChartRequest {
  symbol: string;
  days?: number; // 預測天數，預設30天
  includeConfidenceInterval?: boolean;
}

export interface RiskAnalysisRequest {
  symbol: string;
  timeframe?: "1D" | "1W" | "1M" | "3M";
  includeFactorAnalysis?: boolean;
}

export class AIPredictionController {
  private static instance: AIPredictionController;
  private predictionModel: AIPredictionModel;

  constructor() {
    this.predictionModel = AIPredictionModel.getInstance();
  }

  static getInstance(): AIPredictionController {
    if (!AIPredictionController.instance) {
      AIPredictionController.instance = new AIPredictionController();
    }
    return AIPredictionController.instance;
  }

  async searchStocks(
    request: AIPredictionStockSearchRequest
  ): Promise<Array<{ symbol: string; name: string }>> {
    try {
      if (!request.query || request.query.trim().length === 0) {
        throw new Error("搜尋關鍵字不能為空");
      }

      const results = await this.predictionModel.searchStocks(request.query);

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

  async getStockAnalysis(symbol: string): Promise<StockAnalysis> {
    try {
      const analysis = await this.predictionModel.getPrediction(symbol);
      if (!analysis) {
        throw new Error(`找不到股票 ${symbol} 的分析數據`);
      }
      return analysis;
    } catch (error) {
      throw new Error(
        `獲取股票分析失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async generatePrediction(request: PredictionAnalysisRequest): Promise<{
    analysis: StockAnalysis | null;
    prediction: AIPrediction;
    indicators?: TechnicalIndicator[];
  }> {
    try {
      // 並行獲取數據
      const [analysis, prediction, indicators] = await Promise.all([
        this.predictionModel.getPrediction(request.symbol),
        this.predictionModel.generatePrediction({
          symbol: request.symbol,
          timeRange: request.timeRange,
          model: request.model,
        }),
        request.includeIndicators
          ? this.predictionModel.getTechnicalIndicators(request.symbol)
          : Promise.resolve([]),
      ]);

      return {
        analysis,
        prediction,
        indicators: request.includeIndicators ? indicators : undefined,
      };
    } catch (error) {
      throw new Error(
        `生成 AI 預測失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicator[]> {
    try {
      return await this.predictionModel.getTechnicalIndicators(symbol);
    } catch (error) {
      throw new Error(
        `獲取技術指標失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getModelSettings(): Promise<ModelSettings> {
    try {
      return await this.predictionModel.getModelSettings();
    } catch (error) {
      throw new Error(
        `獲取模型設定失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async updateModelSettings(
    settings: Partial<ModelSettings>
  ): Promise<ModelSettings> {
    try {
      return await this.predictionModel.updateModelSettings(settings);
    } catch (error) {
      throw new Error(
        `更新模型設定失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getPortfolioItems(): Promise<PortfolioItem[]> {
    try {
      return await this.predictionModel.getPortfolioItems();
    } catch (error) {
      throw new Error(
        `獲取投資組合項目失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async managePortfolio(
    request: PortfolioManagementRequest
  ): Promise<PortfolioItem[]> {
    try {
      switch (request.action) {
        case "add":
          if (!request.item) {
            throw new Error("新增項目時必須提供項目資料");
          }
          await this.predictionModel.addPortfolioItem(
            request.userId,
            request.item
          );
          break;

        case "remove":
          if (!request.symbol) {
            throw new Error("移除項目時必須提供股票代號");
          }
          // 這裡可以實現移除邏輯
          console.log(`移除投資組合項目: ${request.symbol}`);
          break;

        case "update":
          if (!request.item || !request.symbol) {
            throw new Error("更新項目時必須提供完整資料");
          }
          // 這裡可以實現更新邏輯
          console.log(`更新投資組合項目: ${request.symbol}`);
          break;

        default:
          throw new Error("不支援的操作類型");
      }

      // 返回更新後的投資組合
      return await this.predictionModel.getPortfolioItems();
    } catch (error) {
      throw new Error(
        `投資組合管理失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async performBatchAnalysis(
    symbols: string[],
    timeRange: "1D" | "1W" | "1M" | "3M" | "6M" | "1Y"
  ): Promise<{
    successful: Array<{
      symbol: string;
      analysis: StockAnalysis;
      prediction: AIPrediction;
    }>;
    failed: Array<{ symbol: string; error: string }>;
  }> {
    const results = await Promise.allSettled(
      symbols.map(async (symbol) => {
        const [analysis, prediction] = await Promise.all([
          this.predictionModel.getPrediction(symbol),
          this.predictionModel.generatePrediction({ symbol, timeRange }),
        ]);

        if (!analysis) {
          throw new Error(`找不到 ${symbol} 的分析數據`);
        }

        return { symbol, analysis, prediction };
      })
    );

    const successful: Array<{
      symbol: string;
      analysis: StockAnalysis;
      prediction: AIPrediction;
    }> = [];
    const failed: Array<{ symbol: string; error: string }> = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successful.push(result.value);
      } else {
        failed.push({
          symbol: symbols[index],
          error: result.reason?.message || "未知錯誤",
        });
      }
    });

    return { successful, failed };
  }

  async getMarketSentiment(): Promise<{
    overall: "bullish" | "bearish" | "neutral";
    score: number;
    factors: Array<{
      name: string;
      impact: "positive" | "negative" | "neutral";
      weight: number;
      description: string;
    }>;
  }> {
    try {
      // 模擬市場情緒分析
      const sentimentFactors = [
        {
          name: "技術面分析",
          impact: "positive" as const,
          weight: 0.3,
          description: "多數技術指標呈現多頭趨勢",
        },
        {
          name: "基本面數據",
          impact: "neutral" as const,
          weight: 0.25,
          description: "經濟數據表現穩定",
        },
        {
          name: "市場流動性",
          impact: "positive" as const,
          weight: 0.2,
          description: "市場流動性充足",
        },
        {
          name: "投資者情緒",
          impact: "negative" as const,
          weight: 0.15,
          description: "投資者情緒保持謹慎",
        },
        {
          name: "政策環境",
          impact: "positive" as const,
          weight: 0.1,
          description: "政策環境相對穩定",
        },
      ];

      // 計算綜合情緒分數
      const score = sentimentFactors.reduce((acc, factor) => {
        let impact = 0;
        if (factor.impact === "positive") {
          impact = 1;
        } else if (factor.impact === "negative") {
          impact = -1;
        } else {
          impact = 0; // neutral
        }
        return acc + impact * factor.weight;
      }, 0);

      const overall =
        score > 0.1 ? "bullish" : score < -0.1 ? "bearish" : "neutral";

      return {
        overall,
        score: Math.round((score + 1) * 50), // 轉換為 0-100 分數
        factors: sentimentFactors,
      };
    } catch (error) {
      throw new Error(
        `獲取市場情緒失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async refreshCache(): Promise<void> {
    try {
      this.predictionModel.clearCache();
    } catch (error) {
      throw new Error(
        `刷新快取失敗: ${error instanceof Error ? error.message : "未知錯誤"}`
      );
    }
  }

  async getModelPerformanceMetrics(): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    lastUpdated: string;
  }> {
    try {
      // 模擬模型性能指標
      return {
        accuracy: 0.847,
        precision: 0.823,
        recall: 0.856,
        f1Score: 0.839,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `獲取模型性能指標失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getDashboardSummary(
    request?: DashboardRequest
  ): Promise<DashboardSummary> {
    try {
      const summary = await this.predictionModel.getDashboardSummary();

      // 根據請求參數過濾數據
      if (request?.timeframe && request.timeframe !== "all") {
        summary.marketTrends = summary.marketTrends.filter(
          (trend) => trend.timeframe === request.timeframe
        );
      }

      return summary;
    } catch (error) {
      throw new Error(
        `獲取儀表板摘要失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getMarketTrendPredictions(): Promise<MarketTrendPrediction[]> {
    try {
      return await this.predictionModel.getMarketTrendPredictions();
    } catch (error) {
      throw new Error(
        `獲取市場趨勢預測失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getPricePredictionChart(
    request: PredictionChartRequest
  ): Promise<PricePredictionChart> {
    try {
      if (!request.symbol) {
        throw new Error("股票代號不能為空");
      }

      const days = request.days || 30;
      if (days <= 0 || days > 365) {
        throw new Error("預測天數必須在1-365之間");
      }

      return await this.predictionModel.getPricePredictionChart(
        request.symbol,
        days
      );
    } catch (error) {
      throw new Error(
        `獲取價格預測圖表失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getAccuracyMetrics(): Promise<AccuracyMetrics> {
    try {
      return await this.predictionModel.getAccuracyMetrics();
    } catch (error) {
      throw new Error(
        `獲取準確度指標失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getRiskAssessment(
    request: RiskAnalysisRequest
  ): Promise<RiskAssessment> {
    try {
      if (!request.symbol) {
        throw new Error("股票代號不能為空");
      }

      return await this.predictionModel.getRiskAssessment(request.symbol);
    } catch (error) {
      throw new Error(
        `獲取風險評估失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getEnhancedDashboardData(): Promise<{
    summary: DashboardSummary;
    marketTrends: MarketTrendPrediction[];
    accuracyMetrics: AccuracyMetrics;
    featuredStockChart?: PricePredictionChart;
    riskOverview: Array<{
      symbol: string;
      riskLevel: string;
      riskScore: number;
    }>;
  }> {
    try {
      // 並行獲取所有儀表板需要的數據
      const [summary, marketTrends, accuracyMetrics] = await Promise.all([
        this.predictionModel.getDashboardSummary(),
        this.predictionModel.getMarketTrendPredictions(),
        this.predictionModel.getAccuracyMetrics(),
      ]);

      // 獲取熱門股票的風險概覽
      const riskPromises = summary.topPerformingStocks
        .slice(0, 3)
        .map(async (stock) => {
          const risk = await this.predictionModel.getRiskAssessment(
            stock.symbol
          );
          return {
            symbol: stock.symbol,
            riskLevel: risk.overallRisk,
            riskScore: risk.riskScore,
          };
        });

      const riskOverview = await Promise.all(riskPromises);

      // 獲取第一支股票的預測圖表作為特色展示
      let featuredStockChart: PricePredictionChart | undefined;
      if (summary.topPerformingStocks.length > 0) {
        try {
          featuredStockChart =
            await this.predictionModel.getPricePredictionChart(
              summary.topPerformingStocks[0].symbol,
              14 // 14天預測
            );
        } catch (error) {
          // 如果獲取圖表失敗，不影響整體數據
          console.warn("獲取特色股票圖表失敗:", error);
        }
      }

      return {
        summary,
        marketTrends,
        accuracyMetrics,
        featuredStockChart,
        riskOverview,
      };
    } catch (error) {
      throw new Error(
        `獲取增強版儀表板數據失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async compareMultipleStockRisks(symbols: string[]): Promise<
    Array<{
      symbol: string;
      riskAssessment: RiskAssessment;
      recommendation: "推薦" | "謹慎" | "避免";
    }>
  > {
    try {
      if (symbols.length === 0) {
        throw new Error("股票代號列表不能為空");
      }

      if (symbols.length > 10) {
        throw new Error("最多只能比較10支股票");
      }

      const riskPromises = symbols.map(async (symbol) => {
        const riskAssessment = await this.predictionModel.getRiskAssessment(
          symbol
        );

        let recommendation: "推薦" | "謹慎" | "避免";
        if (riskAssessment.riskScore <= 40) {
          recommendation = "推薦";
        } else if (riskAssessment.riskScore <= 70) {
          recommendation = "謹慎";
        } else {
          recommendation = "避免";
        }

        return {
          symbol,
          riskAssessment,
          recommendation,
        };
      });

      return await Promise.all(riskPromises);
    } catch (error) {
      throw new Error(
        `比較股票風險失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }

  async getTimeframeAccuracyComparison(): Promise<{
    comparison: Array<{
      timeframe: string;
      accuracy: number;
      totalPredictions: number;
      trend: "improving" | "declining" | "stable";
    }>;
    bestPerformingTimeframe: string;
    insights: string[];
  }> {
    try {
      const metrics = await this.predictionModel.getAccuracyMetrics();

      const comparison = [
        {
          timeframe: "短期 (1-7天)",
          accuracy: metrics.shortTerm,
          totalPredictions: 450,
          trend: "improving" as const,
        },
        {
          timeframe: "中期 (1-4週)",
          accuracy: metrics.mediumTerm,
          totalPredictions: 520,
          trend: "stable" as const,
        },
        {
          timeframe: "長期 (1-3個月)",
          accuracy: metrics.longTerm,
          totalPredictions: 277,
          trend: "declining" as const,
        },
      ];

      // 找出表現最好的時間框架
      const bestPerforming = comparison.reduce((best, current) =>
        current.accuracy > best.accuracy ? current : best
      );

      const insights = [
        `${bestPerforming.timeframe}預測表現最佳，準確率達${bestPerforming.accuracy}%`,
        "短期預測受技術分析影響較大，準確率較高",
        "長期預測受更多不確定因素影響，建議搭配基本面分析",
        "模型在高流動性股票上表現更穩定",
      ];

      return {
        comparison,
        bestPerformingTimeframe: bestPerforming.timeframe,
        insights,
      };
    } catch (error) {
      throw new Error(
        `獲取時間框架準確度比較失敗: ${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    }
  }
}
