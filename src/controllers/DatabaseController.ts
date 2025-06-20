import { BaseController } from "./BaseController";
import { DatabaseService, DatabaseConfig } from "../services/DatabaseService";

/**
 * 簡化的資料庫控制器 - 只支援 SQL Server 驗證
 */
export class DatabaseController extends BaseController {
  private databaseService: DatabaseService;

  constructor() {
    super();
    this.databaseService = DatabaseService.getInstance();
  }

  /**
   * 測試資料庫連接
   */
  async testConnection(config: DatabaseConfig) {
    try {
      this.logInfo("開始測試資料庫連接", {
        server: config.server,
        user: config.user,
        database: config.database || "預設",
      });

      // 驗證必要參數
      if (!config.server || !config.user || !config.password) {
        throw new Error("請提供完整的連接資訊：伺服器地址、使用者名稱和密碼");
      }

      const result = await this.databaseService.testConnection(config);

      this.logInfo("資料庫連接測試完成", { success: result.success });

      // 直接返回服務層的結果，不要重新包裝
      return result;
    } catch (error: any) {
      this.logError("資料庫連接測試失敗", error);

      // 返回一個失敗的結果對象，而不是拋出錯誤
      return {
        success: false,
        message: error.message || "資料庫連接測試失敗，請檢查連接設定",
      };
    }
  }

  /**
   * 執行 SQL 查詢
   */
  async executeQuery(config: DatabaseConfig, query: string, params?: any) {
    try {
      this.logInfo("開始執行 SQL 查詢", {
        server: config.server,
        user: config.user,
        queryLength: query?.length || 0,
      });

      if (!query || !query.trim()) {
        throw new Error("SQL 查詢語句不能為空");
      }

      const result = await this.databaseService.executeQuery(
        config,
        query,
        params
      );

      this.logInfo("SQL 查詢執行完成", {
        success: result.success,
        recordCount: result.count || 0,
      });

      return result;
    } catch (error) {
      this.logError("SQL 查詢執行失敗", error);
      throw error;
    }
  }

  /**
   * 獲取資料庫表列表
   */
  async getTableList(config: DatabaseConfig) {
    try {
      this.logInfo("開始獲取表列表", {
        server: config.server,
        database: config.database,
      });

      const tables = await this.databaseService.getTableList(config);

      this.logInfo("獲取表列表完成", { tableCount: tables.length });
      return {
        success: true,
        data: tables,
        count: tables.length,
      };
    } catch (error) {
      this.logError("獲取表列表失敗", error);
      throw error;
    }
  }

  /**
   * 獲取表結構信息
   */
  async getTableSchema(config: DatabaseConfig, tableName: string) {
    try {
      this.logInfo("開始獲取表結構", {
        server: config.server,
        database: config.database,
        tableName,
      });

      if (!tableName || !tableName.trim()) {
        throw new Error("表名不能為空");
      }

      const schema = await this.databaseService.getTableSchema(
        config,
        tableName
      );

      this.logInfo("獲取表結構完成", { columnCount: schema.length });
      return {
        success: true,
        data: schema,
        count: schema.length,
      };
    } catch (error) {
      this.logError("獲取表結構失敗", error);
      throw error;
    }
  }

  /**
   * 獲取資料庫列表
   */
  async getDatabaseList(config: DatabaseConfig) {
    try {
      this.logInfo("開始獲取資料庫列表", {
        server: config.server,
        user: config.user,
      });

      const databases = await this.databaseService.getDatabaseList(config);

      this.logInfo("獲取資料庫列表完成", { databaseCount: databases.length });
      return {
        success: true,
        data: databases,
        count: databases.length,
      };
    } catch (error) {
      this.logError("獲取資料庫列表失敗", error);
      throw error;
    }
  }
}
