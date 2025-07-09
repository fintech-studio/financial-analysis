export interface ModelSettings {
  autoTrading: boolean;
  linebotNotification: boolean;
}

export interface PortfolioItem {
  symbol: string;
  stockCode: string;
  amount: number;
  status: string;
  date: string;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  change: number;
  status: "bullish" | "bearish" | "neutral";
  description: string;
}

export interface AIPrediction {
  confidence: number;
  direction: "up" | "down" | "neutral";
  priceTarget: number;
  timeframe: string;
  riskLevel: "低" | "中等" | "高";
  expectedReturn: string;
  signals: Array<{
    type: string;
    strength: string;
    color: string;
    score: number;
  }>;
}

export interface StockAnalysis {
  symbol: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  marketCap: string;
  prediction: AIPrediction;
  indicators: TechnicalIndicator[];
}

export interface PredictionRequest {
  symbol: string;
  timeRange: "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";
  features?: string[];
  model?: "lstm" | "transformer" | "ensemble";
}

export interface MarketTrendPrediction {
  timeframe: "short" | "medium" | "long"; // 短期/中期/長期
  period: string; // "1週", "1個月", "3個月"
  direction: "bullish" | "bearish" | "neutral";
  confidence: number;
  expectedReturn: number;
  keyFactors: string[];
  riskLevel: "低" | "中等" | "高";
}

export interface PricePredictionChart {
  symbol: string;
  currentPrice: number;
  predictions: Array<{
    date: string;
    predictedPrice: number;
    confidence: number;
    range: {
      high: number;
      low: number;
    };
  }>;
  historicalAccuracy: number;
  lastUpdated: string;
}

export interface AccuracyMetrics {
  overall: number;
  shortTerm: number; // 1-7天
  mediumTerm: number; // 1-4週
  longTerm: number; // 1-3個月
  bySymbol: Array<{
    symbol: string;
    accuracy: number;
    totalPredictions: number;
  }>;
  lastUpdated: string;
}

export interface RiskAssessment {
  symbol: string;
  overallRisk: "低" | "中等" | "高" | "極高";
  riskScore: number; // 0-100
  factors: Array<{
    category: string;
    risk: "低" | "中等" | "高";
    impact: number;
    description: string;
  }>;
  volatilityScore: number;
  liquidityRisk: "低" | "中等" | "高";
  recommendation: string;
}

export interface DashboardSummary {
  totalPredictions: number;
  accuracy: AccuracyMetrics;
  activeModels: number;
  marketTrends: MarketTrendPrediction[];
  topPerformingStocks: Array<{
    symbol: string;
    name: string;
    expectedReturn: number;
    confidence: number;
    riskLevel: string;
  }>;
  recentPredictions: Array<{
    symbol: string;
    confidence: number;
    direction: "up" | "down" | "neutral";
    time: string;
    actualResult?: "correct" | "incorrect" | "pending";
  }>;
}

export class AIPredictionModel {
  private static instance: AIPredictionModel;
  private predictions: Map<string, StockAnalysis> = new Map();
  private modelSettings: ModelSettings = {
    autoTrading: true,
    linebotNotification: true,
  };

  static getInstance(): AIPredictionModel {
    if (!AIPredictionModel.instance) {
      AIPredictionModel.instance = new AIPredictionModel();
      AIPredictionModel.instance.initializeDefaultData();
    }
    return AIPredictionModel.instance;
  }

  private initializeDefaultData(): void {
    // 創建模擬的股票分析數據
    const defaultAnalysis: StockAnalysis = {
      symbol: "TSMC",
      currentPrice: 580.0,
      priceChange: 12.5,
      priceChangePercent: 2.2,
      volume: 25847,
      marketCap: "15.05兆",
      prediction: {
        confidence: 87,
        direction: "up",
        priceTarget: 626.4,
        timeframe: "下週",
        riskLevel: "中等",
        expectedReturn: "+8.2%",
        signals: [
          {
            type: "技術面",
            strength: "強",
            color: "text-green-600",
            score: 85,
          },
          {
            type: "基本面",
            strength: "中性",
            color: "text-yellow-600",
            score: 65,
          },
          {
            type: "市場情緒",
            strength: "正面",
            color: "text-green-600",
            score: 78,
          },
        ],
      },
      indicators: [
        {
          name: "RSI",
          value: 67.8,
          change: 2.3,
          status: "bullish",
          description: "相對強弱指標顯示股票處於強勢區間",
        },
        {
          name: "MACD",
          value: 12.5,
          change: 1.8,
          status: "bullish",
          description: "MACD線位於信號線上方，呈現多頭趨勢",
        },
        {
          name: "布林通道",
          value: 0.78,
          change: 0.05,
          status: "neutral",
          description: "股價位於布林通道中軌附近",
        },
      ],
    };

    this.predictions.set("TSMC", defaultAnalysis);
    this.predictions.set("AAPL", {
      ...defaultAnalysis,
      symbol: "AAPL",
      currentPrice: 175.3,
      prediction: {
        ...defaultAnalysis.prediction,
        priceTarget: 185.2,
      },
    });
  }

  async getPrediction(symbol: string): Promise<StockAnalysis | null> {
    // 模擬 API 延遲
    await new Promise((resolve) => setTimeout(resolve, 500));

    return this.predictions.get(symbol) || null;
  }

  async generatePrediction(request: PredictionRequest): Promise<AIPrediction> {
    // 模擬 AI 預測生成
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockPrediction: AIPrediction = {
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100
      direction: Math.random() > 0.5 ? "up" : "down",
      priceTarget: 580 * (1 + (Math.random() * 0.2 - 0.1)), // ±10%
      timeframe: request.timeRange === "1D" ? "明天" : "下週",
      riskLevel: ["低", "中等", "高"][Math.floor(Math.random() * 3)] as
        | "低"
        | "中等"
        | "高",
      expectedReturn: `${Math.random() > 0.5 ? "+" : "-"}${(
        Math.random() * 15
      ).toFixed(1)}%`,
      signals: [
        {
          type: "技術面",
          strength: ["強", "中性", "弱"][Math.floor(Math.random() * 3)],
          color: "text-green-600",
          score: Math.floor(Math.random() * 40) + 60,
        },
        {
          type: "基本面",
          strength: ["強", "中性", "弱"][Math.floor(Math.random() * 3)],
          color: "text-yellow-600",
          score: Math.floor(Math.random() * 40) + 60,
        },
      ],
    };

    return mockPrediction;
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicator[]> {
    const analysis = await this.getPrediction(symbol);
    return analysis?.indicators || [];
  }

  async updateModelSettings(
    settings: Partial<ModelSettings>
  ): Promise<ModelSettings> {
    this.modelSettings = { ...this.modelSettings, ...settings };
    return this.modelSettings;
  }

  async getModelSettings(): Promise<ModelSettings> {
    return this.modelSettings;
  }

  async searchStocks(
    query: string
  ): Promise<Array<{ symbol: string; name: string }>> {
    // 模擬股票搜索
    const mockResults = [
      { symbol: "TSMC", name: "台積電" },
      { symbol: "AAPL", name: "蘋果公司" },
      { symbol: "MSFT", name: "微軟" },
      { symbol: "NVDA", name: "輝達" },
      { symbol: "GOOGL", name: "Alphabet" },
    ];

    return mockResults.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getPortfolioItems(): Promise<PortfolioItem[]> {
    // 模擬投資組合項目
    return [
      {
        symbol: "TSMC",
        stockCode: "2330",
        amount: 580.0,
        status: "已完成",
        date: new Date().toLocaleDateString("zh-TW"),
      },
      {
        symbol: "AAPL",
        stockCode: "AAPL",
        amount: 175.3,
        status: "已完成",
        date: new Date().toLocaleDateString("zh-TW"),
      },
    ];
  }

  async addPortfolioItem(
    userId: string,
    item: Omit<PortfolioItem, "date">
  ): Promise<PortfolioItem> {
    const newItem: PortfolioItem = {
      ...item,
      date: new Date().toLocaleDateString("zh-TW"),
    };

    // 這裡應該保存到實際數據庫
    return newItem;
  }

  clearCache(): void {
    this.predictions.clear();
    this.initializeDefaultData();
  }

  async getMarketTrendPredictions(): Promise<MarketTrendPrediction[]> {
    // 模擬市場趨勢預測
    await new Promise((resolve) => setTimeout(resolve, 300));

    return [
      {
        timeframe: "short",
        period: "1週",
        direction: "bullish",
        confidence: 78,
        expectedReturn: 3.2,
        keyFactors: ["技術面突破", "成交量放大", "外資買超"],
        riskLevel: "中等",
      },
      {
        timeframe: "medium",
        period: "1個月",
        direction: "neutral",
        confidence: 65,
        expectedReturn: 1.5,
        keyFactors: ["財報季影響", "政策不確定性", "國際情勢"],
        riskLevel: "中等",
      },
      {
        timeframe: "long",
        period: "3個月",
        direction: "bullish",
        confidence: 72,
        expectedReturn: 8.7,
        keyFactors: ["AI科技趨勢", "半導體循環", "經濟復甦"],
        riskLevel: "高",
      },
    ];
  }

  async getPricePredictionChart(
    symbol: string,
    days: number = 30
  ): Promise<PricePredictionChart> {
    // 模擬價格預測圖表數據
    await new Promise((resolve) => setTimeout(resolve, 500));

    const currentPrice = this.predictions.get(symbol)?.currentPrice || 580;
    const predictions = [];

    for (let i = 1; i <= days; i++) {
      const trend = Math.sin(i * 0.1) * 0.02; // 模擬趨勢
      const volatility = (Math.random() - 0.5) * 0.03; // 模擬波動
      const predictedPrice = currentPrice * (1 + trend + volatility);

      predictions.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        confidence: Math.max(60, 95 - i * 1.5), // 隨時間降低信心度
        range: {
          high: Math.round(predictedPrice * 1.05 * 100) / 100,
          low: Math.round(predictedPrice * 0.95 * 100) / 100,
        },
      });
    }

    return {
      symbol,
      currentPrice,
      predictions,
      historicalAccuracy: 84.7,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getAccuracyMetrics(): Promise<AccuracyMetrics> {
    // 模擬準確度指標
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      overall: 84.7,
      shortTerm: 89.2,
      mediumTerm: 82.5,
      longTerm: 78.9,
      bySymbol: [
        { symbol: "TSMC", accuracy: 87.3, totalPredictions: 156 },
        { symbol: "AAPL", accuracy: 83.1, totalPredictions: 142 },
        { symbol: "NVDA", accuracy: 91.4, totalPredictions: 98 },
        { symbol: "MSFT", accuracy: 79.8, totalPredictions: 134 },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  async getRiskAssessment(symbol: string): Promise<RiskAssessment> {
    // 模擬風險評估
    await new Promise((resolve) => setTimeout(resolve, 400));

    const riskFactors = [
      {
        category: "市場風險",
        risk: "中等" as const,
        impact: 0.25,
        description: "整體市場波動影響",
      },
      {
        category: "流動性風險",
        risk: "低" as const,
        impact: 0.15,
        description: "股票流動性充足",
      },
      {
        category: "基本面風險",
        risk: "低" as const,
        impact: 0.2,
        description: "公司基本面穩健",
      },
      {
        category: "技術面風險",
        risk: "中等" as const,
        impact: 0.2,
        description: "技術指標顯示整理格局",
      },
      {
        category: "產業風險",
        risk: "高" as const,
        impact: 0.2,
        description: "產業週期性波動風險",
      },
    ];

    // 計算風險分數
    const riskScore = riskFactors.reduce((acc, factor) => {
      const riskValue =
        factor.risk === "低" ? 1 : factor.risk === "中等" ? 2 : 3;
      return acc + riskValue * factor.impact * 33.33;
    }, 0);

    const overallRisk =
      riskScore < 40
        ? "低"
        : riskScore < 60
        ? "中等"
        : riskScore < 80
        ? "高"
        : "極高";

    return {
      symbol,
      overallRisk,
      riskScore: Math.round(riskScore),
      factors: riskFactors,
      volatilityScore: 68.5,
      liquidityRisk: "低",
      recommendation:
        overallRisk === "低"
          ? "適合積極投資"
          : overallRisk === "中等"
          ? "建議適度配置"
          : "建議謹慎投資或避免",
    };
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    // 並行獲取所有儀表板數據
    const [marketTrends, accuracy] = await Promise.all([
      this.getMarketTrendPredictions(),
      this.getAccuracyMetrics(),
    ]);

    return {
      totalPredictions: 1247,
      accuracy,
      activeModels: 3,
      marketTrends,
      topPerformingStocks: [
        {
          symbol: "NVDA",
          name: "輝達",
          expectedReturn: 15.3,
          confidence: 91,
          riskLevel: "中等",
        },
        {
          symbol: "TSMC",
          name: "台積電",
          expectedReturn: 12.7,
          confidence: 87,
          riskLevel: "低",
        },
        {
          symbol: "AAPL",
          name: "蘋果",
          expectedReturn: 8.9,
          confidence: 82,
          riskLevel: "低",
        },
      ],
      recentPredictions: [
        {
          symbol: "TSMC",
          confidence: 87,
          direction: "up",
          time: "5分鐘前",
          actualResult: "pending",
        },
        {
          symbol: "AAPL",
          confidence: 82,
          direction: "up",
          time: "12分鐘前",
          actualResult: "correct",
        },
        {
          symbol: "NVDA",
          confidence: 91,
          direction: "up",
          time: "18分鐘前",
          actualResult: "correct",
        },
        {
          symbol: "MSFT",
          confidence: 75,
          direction: "down",
          time: "25分鐘前",
          actualResult: "incorrect",
        },
      ],
    };
  }
}
