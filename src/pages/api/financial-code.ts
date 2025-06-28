import type { NextApiRequest, NextApiResponse } from "next";
import mssql from "mssql";

// SQL Server 連線設定，請根據實際情況修改
const config = {
  user: process.env.DB_WEBUSER!,
  password: process.env.DB_WEBUSER_PASSWORD!,
  server: process.env.DB_SERVER!, // e.g. 'localhost'
  database: "market_data",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const TABLES = [
  { name: "tw_stock", label: "股票" },
  { name: "tw_index", label: "指數" },
  { name: "etf", label: "ETF" },
  { name: "etn", label: "ETN" },
  { name: "us_stock", label: "美股" },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 僅支援 symbol 參數
  const { symbol } = req.query;
  if (!symbol || typeof symbol !== "string") {
    return res.status(400).json({ error: "缺少查詢參數" });
  }

  let pool: mssql.ConnectionPool | null = null;
  try {
    pool = await mssql.connect(config);
    if (symbol === "all_tw_stock") {
      const result = await pool.request().query(`SELECT * FROM tw_stock`);
      return res.status(200).json({ results: result.recordset });
    }
    if (symbol === "all_tw_index") {
      const result = await pool.request().query(`SELECT * FROM tw_index`);
      return res.status(200).json({ results: result.recordset });
    }
    if (symbol === "all_etf") {
      const result = await pool.request().query(`SELECT * FROM etf`);
      return res.status(200).json({ results: result.recordset });
    }
    if (symbol === "all_etn") {
      const result = await pool.request().query(`SELECT * FROM etn`);
      return res.status(200).json({ results: result.recordset });
    }
    if (symbol === "all_us_stock") {
      const result = await pool
        .request()
        .query(
          `SELECT symbol, name, chinese_name, isin_code, country, ipo_year, sector_type, industry_type FROM us_stock`
        );
      return res.status(200).json({ results: result.recordset });
    }
    let results: any[] = [];
    for (const table of TABLES) {
      const request = pool.request();
      request.input("symbol", mssql.NVarChar, `%${symbol}%`);
      let selectFields: string[] = [];
      if (table.name === "us_stock") {
        selectFields = [
          "symbol",
          "name",
          "chinese_name",
          "isin_code",
          "country",
          "ipo_year",
          "sector_type",
          "industry_type",
        ];
      } else if (table.name === "tw_stock") {
        selectFields = [
          "symbol",
          "name",
          "isin_code",
          "date",
          "market_category",
          "market_type",
          "industry_type",
        ];
      } else if (table.name === "etf" || table.name === "etn") {
        selectFields = [
          "symbol",
          "name",
          "isin_code",
          "date",
          "market_type",
          "industry_type",
        ];
      } else if (table.name === "tw_index") {
        selectFields = ["symbol", "name", "isin_code", "date"];
      }
      const query = `SELECT ${selectFields.join(", ")} FROM ${
        table.name
      } WHERE symbol LIKE @symbol OR name LIKE @symbol`;
      const result = await request.query(query);
      if (result.recordset?.length) {
        if (table.name === "us_stock") {
          results = results.concat(
            result.recordset.map((row: any) => ({
              symbol: row.symbol,
              name: row.name,
              chinese_name: row.chinese_name || "",
              isin_code: row.isin_code || "",
              country: row.country || "",
              ipo_year: row.ipo_year || "",
              sector_type: row.sector_type || "",
              industry_type: row.industry_type || "",
              date: row.ipo_year ? String(row.ipo_year) : "", // 讓 date 欄位顯示 ipo_year
            }))
          );
        } else if (
          table.name === "tw_stock" ||
          table.name === "etf" ||
          table.name === "etn"
        ) {
          results = results.concat(
            result.recordset.map((row: any) => ({
              market_category: row.market_category || "",
              symbol: row.symbol,
              name: row.name,
              isin_code: row.isin_code || "",
              date: row.date ? formatDate(row.date) : "",
              market_type: row.market_type || "",
              industry_type: row.industry_type || "",
            }))
          );
        } else if (table.name === "tw_index") {
          results = results.concat(
            result.recordset.map((row: any) => ({
              symbol: row.symbol,
              name: row.name,
              isin_code: row.isin_code || "",
              date: row.date ? formatDate(row.date) : "",
            }))
          );
        }
      }
    }
    res.status(200).json({ results });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "查詢失敗，請稍後再試。" });
  } finally {
    if (pool) await pool.close();
  }
}

// 日期格式化工具
function formatDate(dateValue: any): string {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return String(dateValue); // 若無法轉換則原樣回傳
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
