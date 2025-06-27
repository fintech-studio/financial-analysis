import type { NextApiRequest, NextApiResponse } from "next";
import sql from "mssql";

// 資料庫連線設定
const config = {
  user: process.env.DB_WEBUSER,
  password: process.env.DB_WEBUSER_PASSWORD,
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "market_data",
  options: {
    encrypt: false, // 若為 Azure 請設 true
    trustServerCertificate: true,
  },
};

// 市場資料表設定
interface MarketTable {
  table: string;
  market_category: string;
  market_type?: string;
  hasMarketType: boolean;
}

const marketTables: MarketTable[] = [
  {
    table: "tw_stock",
    market_category: "台股",
    market_type: "market_stock_tw",
    hasMarketType: true,
  },
  {
    table: "etf",
    market_category: "ETF",
    market_type: "market_etf",
    hasMarketType: true,
  },
  {
    table: "etn",
    market_category: "ETN",
    market_type: "market_etn",
    hasMarketType: true,
  },
  {
    table: "tw_index",
    market_category: "臺灣指數",
    hasMarketType: false, // 沒有 market_type 欄位
  },
];

// 回傳型別
interface MarketSuggestion {
  market_category: string;
  symbol: string;
  name: string;
  market_type?: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q } = req.query;
  if (typeof q !== "string" || !q.trim()) {
    return res.status(400).json({ error: "Missing query parameter q" });
  }
  const query = q.trim();
  try {
    await sql.connect(config);
    // 組合 union SQL
    const unionSql = marketTables
      .map((m) =>
        m.hasMarketType
          ? `SELECT TOP 20 market_category, symbol, name, market_type FROM ${m.table} WHERE symbol LIKE @q OR name LIKE @q`
          : `SELECT TOP 20 market_category, symbol, name, NULL AS market_type FROM ${m.table} WHERE symbol LIKE @q OR name LIKE @q`
      )
      .join(" UNION ALL ");
    const request = new sql.Request();
    request.input("q", sql.NVarChar, `%${query}%`);
    const result = await request.query(unionSql);
    // 統一型別，過濾多餘欄位
    const data: MarketSuggestion[] = (result.recordset || []).map((row) => ({
      market_category: row.market_category,
      symbol: row.symbol,
      name: row.name,
      market_type: row.market_type ?? undefined,
    }));
    res.status(200).json(data.slice(0, 50)); // 最多回傳 50 筆
  } catch (err) {
    console.error("[market_data] DB error:", err);
    res.status(500).json({ error: "Database query error", detail: String(err) });
  }
}
