import { NextApiRequest, NextApiResponse } from "next";
import sql from "mssql";
import { getPool } from "@/utils/dbPool";

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
    // 支援管理頁傳入完整 config（user/password/server/port/database）
    const user = config?.user || process.env.DB_WEBUSER;
    const password = config?.password || process.env.DB_WEBUSER_PASSWORD;
    const server = config?.server || process.env.DB_SERVER;
    const port = config?.port
      ? parseInt(config.port)
      : process.env.DB_PORT
      ? parseInt(process.env.DB_PORT)
      : 1433;
    const database = config?.database;

    if (!server || !user || !password) {
      return res.status(400).json({
        success: false,
        message:
          "請於 .env.local 設定 DB_SERVER、DB_WEBUSER、DB_WEBUSER_PASSWORD，或由管理頁傳入完整連線資訊",
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
      server,
      port,
      user,
      database: database || "master",
      queryLength: query.length,
    });

    // 建立資料庫連接配置
    const sqlConfig: sql.config = {
      user: user.trim(),
      password,
      server: server.trim(),
      port,
      database: database?.trim() || "master",
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
      connectionTimeout: 30000,
      requestTimeout: 30000,
    };

    let pool: sql.ConnectionPool | null = null;

    try {
      // reuse pooled connection
      pool = await getPool(sqlConfig);
      const request = pool.request();
      if (params && typeof params === "object") {
        Object.keys(params).forEach((key) => {
          request.input(key, params[key]);
        });
      }
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
    } catch (dbError: unknown) {
      console.error("[API] 資料庫查詢錯誤", dbError);
      let errorMessage = "資料庫查詢失敗";
      const permissionKeywords = [
        "permission was denied",
        "permission denied",
        "The SELECT permission was denied",
        "權限",
        "denied",
      ];
      const dbErrorObj = dbError as { message?: string; code?: string };
      if (
        dbErrorObj.message &&
        permissionKeywords.some((kw) =>
          dbErrorObj.message!.toLowerCase().includes(kw)
        )
      ) {
        errorMessage = "權限不足：您沒有存取此資料的權限，請聯絡資料庫管理員。";
      } else if (dbErrorObj.code === "ELOGIN") {
        errorMessage =
          "登入失敗：請檢查使用者名稱和密碼，或確認帳號是否有存取該資料庫的權限。";
      } else if (dbErrorObj.code === "ESOCKET") {
        errorMessage = "網路連接失敗：請檢查伺服器地址和端口";
      } else if (dbErrorObj.code === "ETIMEOUT") {
        errorMessage = "查詢超時：請檢查查詢語句或網路連接";
      } else if (dbErrorObj.message) {
        errorMessage = `查詢錯誤：${dbErrorObj.message}`;
      }
      res.status(400).json({
        success: false,
        message: errorMessage,
        data: [],
        count: 0,
      });
    } finally {
      // Do not close pooled connections here; keep them for reuse
    }
  } catch (error: unknown) {
    console.error("[API] 查詢執行發生錯誤", error);
    const errorObj = error as { message?: string };
    res.status(500).json({
      success: false,
      message: `伺服器錯誤: ${errorObj.message || "未知錯誤"}`,
      data: [],
      count: 0,
    });
  }
}
