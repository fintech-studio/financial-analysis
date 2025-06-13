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

  async getPortfolioItems(userId: string): Promise<PortfolioItem[]> {
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
}
