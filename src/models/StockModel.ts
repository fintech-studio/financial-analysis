export interface Stock {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  industry: string;
  marketCap: string;
  pe: string;
  dividend: string;
  chartData: ChartData;
  news?: NewsItem[];
}

export interface ChartData {
  labels: string[];
  prices: number[];
}

export interface NewsItem {
  title: string;
  date: string;
  source: string;
}

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  volume: string;
  high: string;
  low: string;
  lot: string;
  value: string;
  freq: string;
}

export interface MarketData {
  stock?: {
    index?: string;
    change?: string;
    changePercent?: string;
    volume?: string;
    highlights?: string;
  };
  global?: {
    dow?: string;
    change?: string;
    changePercent?: string;
    volume?: string;
    highlights?: string;
  };
  forex?: {
    usdtwd?: string;
    change?: string;
    changePercent?: string;
    volume?: string;
    highlights?: string;
  };
}

export interface StockDetail {
  symbol: string;
  name: string;
  price: number;
  change?: string;
  changePercent?: string;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  industry?: string;
  marketCap?: number;
  pe?: number;
  pb?: number;
  dividendYield?: number;
  high52w?: number;
  low52w?: number;
  priceHistory?: number[];
}

export interface MarketOverview {
  totalValue: number;
  change: number;
  changePercent: number;
  volume: string;
  status: string;
  sectors: Array<{
    name: string;
    change: number;
    changePercent: number;
  }>;
}

export class StockModel {
  private static instance: StockModel;
  private stocks: Map<string, Stock> = new Map();
  private marketData: MarketData = {};

  static getInstance(): StockModel {
    if (!StockModel.instance) {
      StockModel.instance = new StockModel();
    }
    return StockModel.instance;
  }

  async getStock(symbol: string): Promise<Stock | null> {
    // 模擬 API 調用
    if (this.stocks.has(symbol)) {
      return this.stocks.get(symbol)!;
    }

    // 模擬從外部 API 獲取數據
    const mockStock: Stock = {
      symbol,
      name: symbol === "2330" ? "台積電" : "股票名稱",
      price: "580.00",
      change: "+10.00",
      changePercent: "+1.75%",
      open: "570.00",
      high: "585.00",
      low: "568.00",
      volume: "35,862",
      industry: "半導體",
      marketCap: "15.05兆",
      pe: "18.5",
      dividend: "11.00",
      chartData: {
        labels: ["09:00", "10:00", "11:00", "12:00", "13:00"],
        prices: [570, 575, 580, 578, 580],
      },
    };

    this.stocks.set(symbol, mockStock);
    return mockStock;
  }

  async searchStocks(query: string): Promise<Stock[]> {
    // 模擬搜索功能
    const mockResults: Stock[] = [
      await this.getStock("2330"),
      await this.getStock("2454"),
    ].filter((stock) => stock !== null) as Stock[];

    return mockResults.filter(
      (stock) => stock.symbol.includes(query) || stock.name.includes(query)
    );
  }

  async getMarketData(): Promise<MarketData> {
    // 模擬市場數據
    this.marketData = {
      stock: {
        index: "16,234.56",
        change: "+123.45",
        changePercent: "+0.77%",
        volume: "2.1億",
        highlights: "台積電領漲科技股",
      },
      global: {
        dow: "34,567.89",
        change: "+234.56",
        changePercent: "+0.68%",
        volume: "3.2億",
        highlights: "美股持續上漲",
      },
      forex: {
        usdtwd: "31.25",
        change: "+0.15",
        changePercent: "+0.48%",
        volume: "12億",
        highlights: "台幣相對穩定",
      },
    };

    return this.marketData;
  }

  async getHotStocks(): Promise<Stock[]> {
    const hotSymbols = ["2330", "2454", "2317", "3008"];
    const results = await Promise.all(
      hotSymbols.map((symbol) => this.getStock(symbol))
    );
    return results.filter((stock) => stock !== null) as Stock[];
  }

  async getStocks(): Promise<StockDetail[]> {
    // 模擬獲取股票列表
    const mockStocks: StockDetail[] = [
      {
        symbol: "2330",
        name: "台積電",
        price: 580,
        change: "+1.75%",
        changePercent: "+1.75%",
        open: 570,
        high: 585,
        low: 568,
        volume: 35862,
        industry: "半導體",
        marketCap: 15050000,
        pe: 18.5,
        pb: 4.2,
        dividendYield: 1.9,
        high52w: 625,
        low52w: 445,
        priceHistory: [570, 575, 580, 578, 580],
      },
      {
        symbol: "2454",
        name: "聯發科",
        price: 950,
        change: "+2.15%",
        changePercent: "+2.15%",
        open: 925,
        high: 955,
        low: 920,
        volume: 28450,
        industry: "半導體",
        marketCap: 1520000,
        pe: 15.2,
        pb: 3.8,
        dividendYield: 2.1,
        high52w: 1100,
        low52w: 680,
        priceHistory: [925, 930, 950, 948, 950],
      },
      {
        symbol: "2317",
        name: "鴻海",
        price: 105,
        change: "-0.95%",
        changePercent: "-0.95%",
        open: 106,
        high: 107,
        low: 104,
        volume: 45200,
        industry: "電子",
        marketCap: 1460000,
        pe: 12.8,
        pb: 1.2,
        dividendYield: 4.5,
        high52w: 115,
        low52w: 88,
        priceHistory: [106, 105, 105, 104, 105],
      },
    ];

    return mockStocks;
  }
}
