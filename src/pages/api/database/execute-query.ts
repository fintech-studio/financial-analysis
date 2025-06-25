import { NextApiRequest, NextApiResponse } from "next";
import sql from "mssql";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "只允許 POST 請求",
      data: [],
      count: 0,
    });
  }

  try {
    const { config, query, params } = req.body;

    // 驗證必要參數
    if (!config || !config.server || !config.user || !config.password) {
      return res.status(400).json({
        success: false,
        message: "請提供完整的連接資訊：伺服器地址、使用者名稱和密碼",
        data: [],
        count: 0,
      });
    }

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "請提供要執行的 SQL 查詢語句",
        data: [],
        count: 0,
      });
    }

    console.log("[API] 執行資料庫查詢", {
      server: config.server,
      port: config.port || 1433,
      user: config.user,
      database: config.database || "master",
      queryLength: query.length,
    });

    // 建立資料庫連接配置
    const sqlConfig: sql.config = {
      user: config.user.trim(),
      password: config.password,
      server: config.server.trim(),
      port: config.port ? parseInt(config.port) : 1433,
      database: config.database?.trim() || "master",
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
      connectionTimeout: 30000,
      requestTimeout: 30000,
    };

    // 嘗試連接資料庫並執行查詢
    let pool: sql.ConnectionPool | null = null;

    try {
      pool = new sql.ConnectionPool(sqlConfig);
      await pool.connect();

      const request = pool.request();

      // 如果有參數，添加到請求中
      if (params && typeof params === "object") {
        Object.keys(params).forEach((key) => {
          request.input(key, params[key]);
        });
      }

      // 執行查詢
      const result = await request.query(query.trim());

      console.log("[API] 查詢執行結果", {
        success: true,
        recordCount: result.recordset?.length || 0,
      });

      res.status(200).json({
        success: true,
        data: result.recordset || [],
        count: result.recordset?.length || 0,
        message: `查詢成功執行，返回 ${result.recordset?.length || 0} 筆記錄`,
      });
    } catch (dbError: any) {
      console.error("[API] 資料庫查詢錯誤", dbError);

      let errorMessage = "資料庫查詢失敗";
      // 權限相關錯誤辨識（優先處理）
      const permissionKeywords = [
        "permission was denied",
        "permission denied",
        "The SELECT permission was denied",
        "權限",
        "denied",
      ];
      if (
        dbError.message &&
        permissionKeywords.some((kw) =>
          dbError.message.toLowerCase().includes(kw)
        )
      ) {
        errorMessage = "權限不足：您沒有存取此資料的權限，請聯絡資料庫管理員。";
      } else if (dbError.code === "ELOGIN") {
        errorMessage =
          "登入失敗：請檢查使用者名稱和密碼，或確認帳號是否有存取該資料庫的權限。";
      } else if (dbError.code === "ESOCKET") {
        errorMessage = "網路連接失敗：請檢查伺服器地址和端口";
      } else if (dbError.code === "ETIMEOUT") {
        errorMessage = "查詢超時：請檢查查詢語句或網路連接";
      } else if (dbError.message) {
        errorMessage = `查詢錯誤：${dbError.message}`;
      }

      res.status(400).json({
        success: false,
        message: errorMessage,
        data: [],
        count: 0,
      });
    } finally {
      if (pool) {
        try {
          await pool.close();
        } catch (closeError) {
          console.error("[API] 關閉連接池時發生錯誤", closeError);
        }
      }
    }
  } catch (error: any) {
    console.error("[API] 查詢執行發生錯誤", error);

    res.status(500).json({
      success: false,
      message: `伺服器錯誤: ${error.message || "未知錯誤"}`,
      data: [],
      count: 0,
    });
  }
}
