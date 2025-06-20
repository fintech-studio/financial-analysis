import { NextApiRequest, NextApiResponse } from "next";
import {
  DatabaseService,
  DatabaseConfig,
} from "../../../services/DatabaseService";

interface DatabaseApiRequest {
  action:
    | "testConnection"
    | "executeQuery"
    | "getTableList"
    | "getTableSchema"
    | "getDatabaseList";
  config: DatabaseConfig;
  query?: string;
  tableName?: string;
  params?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 只允許 POST 請求
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "僅支援 POST 方法",
    });
  }

  const { action, config, query, tableName, params }: DatabaseApiRequest =
    req.body;

  // 驗證必要參數
  if (!action || !config) {
    return res.status(400).json({
      success: false,
      error: "缺少必要參數：action 和 config",
    });
  }

  // 驗證 SQL Server 驗證配置
  if (!config.server) {
    return res.status(400).json({
      success: false,
      error: "伺服器地址不能為空",
    });
  }

  if (!config.user || !config.password) {
    return res.status(400).json({
      success: false,
      error: "需要提供使用者名稱和密碼",
    });
  }

  if (
    !config.database &&
    action !== "testConnection" &&
    action !== "getDatabaseList"
  ) {
    return res.status(400).json({
      success: false,
      error: "需要指定資料庫名稱",
    });
  }

  const dbService = DatabaseService.getInstance();

  try {
    let result: any;

    switch (action) {
      case "testConnection":
        result = await dbService.testConnection(config);
        break;

      case "executeQuery":
        if (!query) {
          return res.status(400).json({
            success: false,
            error: "執行查詢需要提供 query 參數",
          });
        }
        result = await dbService.executeQuery(config, query, params);
        break;

      case "getTableList":
        const tables = await dbService.getTableList(config);
        result = {
          success: true,
          data: tables,
          count: tables.length,
        };
        break;

      case "getTableSchema":
        if (!tableName) {
          return res.status(400).json({
            success: false,
            error: "獲取表結構需要提供 tableName 參數",
          });
        }
        const schema = await dbService.getTableSchema(config, tableName);
        result = {
          success: true,
          data: schema,
          count: schema.length,
        };
        break;

      case "getDatabaseList":
        const databases = await dbService.getDatabaseList(config);
        result = {
          success: true,
          data: databases,
          count: databases.length,
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          error: `不支援的操作：${action}`,
        });
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("API 錯誤:", error);

    // 根據錯誤類型返回適當的狀態碼
    let statusCode = 500;
    let errorMessage = error.message || "伺服器內部錯誤";

    if (
      error.message?.includes("連接失敗") ||
      error.message?.includes("登入失敗") ||
      error.message?.includes("驗證失敗")
    ) {
      statusCode = 401;
    } else if (
      error.message?.includes("找不到") ||
      error.message?.includes("無效")
    ) {
      statusCode = 404;
    } else if (
      error.message?.includes("語法錯誤") ||
      error.message?.includes("權限") ||
      error.message?.includes("不能為空")
    ) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
}
