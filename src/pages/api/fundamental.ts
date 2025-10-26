import type { NextApiRequest, NextApiResponse } from "next";
import sql from "mssql";

// 資料庫連接配置
const dbConfig = {
  server: process.env.DB_SERVER || "localhost",
  port: parseInt(process.env.DB_PORT || "1433"),
  user: process.env.DB_WEBUSER || "sa",
  password: process.env.DB_WEBUSER_PASSWORD || "",
  database: "market_fundamental",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

// 市場對應的資料表映射
const MARKET_TABLE_MAP: Record<string, string> = {
  tw: "fundamental_data_tw",
  two: "fundamental_data_two",
  us: "fundamental_data_us",
};

// 市場對應的後綴映射
const MARKET_SUFFIX_MAP: Record<string, string> = {
  tw: ".TW",
  two: ".TWO",
  us: "", // 美股不需要後綴
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { market, symbol } = req.body;

  // 驗證參數
  if (!market || !symbol) {
    return res.status(400).json({
      success: false,
      error: "請提供市場（market）和股票代號（symbol）",
    });
  }

  // 驗證市場是否有效
  const tableName = MARKET_TABLE_MAP[market.toLowerCase()];
  if (!tableName) {
    return res.status(400).json({
      success: false,
      error: `無效的市場代碼: ${market}。支援的市場: tw, two, us`,
    });
  }

  let pool: sql.ConnectionPool | null = null;

  try {
    // 連接資料庫
    pool = await sql.connect(dbConfig);

    // 根據市場自動添加後綴
    const marketLower = market.toLowerCase();
    const suffix = MARKET_SUFFIX_MAP[marketLower] || "";
    let searchSymbol = symbol.toUpperCase().trim();

    // 如果用戶已經輸入了後綴，不重複添加
    if (suffix && !searchSymbol.endsWith(suffix)) {
      searchSymbol = searchSymbol + suffix;
    }

    // 查詢基本面資料
    const query = `
      SELECT TOP 1 *
      FROM ${tableName}
      WHERE symbol = @symbol
      ORDER BY lastUpdate DESC
    `;

    const result = await pool
      .request()
      .input("symbol", sql.VarChar, searchSymbol)
      .query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: `找不到股票代號 ${searchSymbol} 在 ${market.toUpperCase()} 市場的資料`,
      });
    }

    const data = result.recordset[0];

    // 格式化回傳資料(根據實際資料表結構映射)
    const fundamentalData = {
      symbol: data.symbol,
      name: data.shortName || null,
      market: market.toUpperCase(),
      basicInfo: {
        industry: data.industry || null,
        sector: data.sector || null,
        country: data.country || null,
        exchange: data.exchange || null,
        currency: data.currency || null,
      },
      valuation: {
        marketCap: data.marketCap || null,
        pe: data.trailingPE || null,
        forwardPE: data.forwardPE || null,
        pb: data.priceToBook || null,
        ps: data.priceToSales || null,
        peg: data.pegRatio || null,
        enterpriseToRevenue: data.enterpriseToRevenue || null,
        enterpriseToEbitda: data.enterpriseToEbitda || null,
      },
      financialHealth: {
        debtToEquity: data.debtToEquity || null,
        currentRatio: data.currentRatio || null,
        quickRatio: data.quickRatio || null,
        totalCash: data.totalCash || null,
        totalDebt: data.totalDebt || null,
      },
      profitability: {
        roe: data.returnOnEquity || null,
        roa: data.returnOnAssets || null,
        netMargin: data.profitMargins || null,
        operatingMargin: data.operatingMargins || null,
        grossMargin: data.grossMargins || null,
      },
      growth: {
        revenueGrowth: data.revenueGrowth || null,
        earningsGrowth: data.earningsGrowth || null,
        totalRevenue: data.totalRevenue || null,
      },
      dividend: {
        dividendYield: data.dividendYield || null,
        dividendAmount: data.dividendRate || null,
        payoutRatio: data.payoutRatio || null,
        exDividendDate: data.exDividendDate || null,
      },
      stockInfo: {
        beta: data.beta || null,
        bookValue: data.bookValue || null,
        week52High: data.fiftyTwoWeekHigh || null,
        week52Low: data.fiftyTwoWeekLow || null,
        avgVolume: data.averageVolume || null,
        sharesOutstanding: data.sharesOutstanding || null,
        netIncomeToCommon: data.netIncomeToCommon || null,
      },
      updatedAt: data.lastUpdate || null,
    };

    return res.status(200).json({
      success: true,
      data: fundamentalData,
    });
  } catch (error) {
    console.error("查詢基本面資料時發生錯誤:", error);
    return res.status(500).json({
      success: false,
      error: "查詢資料時發生錯誤",
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}
