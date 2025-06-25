import { BaseService } from "./BaseService";

// 數據庫配置介面 - 簡化版，只支援 SQL Server 驗證
export interface DatabaseConfig {
  user: string;
  password: string;
  server: string;
  database?: string;
  port?: number;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
  };
}

// 查詢結果介面
export interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  message?: string;
  count?: number;
}

// 連接結果介面
export interface ConnectionResult {
  success: boolean;
  message: string;
}

/**
 * 前端數據庫服務類 - 通過 API 調用處理資料庫操作
 */
export class DatabaseService extends BaseService {
  private static instance: DatabaseService;
  private enableLog = true; // 可切換日誌

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private constructor() {
    super();
  }

  private logInfo(message: string, data?: any): void {
    if (this.enableLog) console.log(`[DatabaseService] ${message}`, data || "");
  }
  private logError(message: string, error?: any): void {
    if (this.enableLog)
      console.error(`[DatabaseService] ${message}`, error || "");
  }

  private getApiBaseUrl(): string {
    return typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXTAUTH_URL || "http://localhost:3000";
  }

  /** 統一錯誤訊息 */
  private extractError(result: QueryResult): string {
    return result.error || result.message || "操作失敗";
  }

  /**
   * 驗證連接配置
   */
  private validateConnectionConfig(config: DatabaseConfig): void {
    if (!config.server) throw new Error("伺服器地址不能為空");
    if (!config.user || !config.password)
      throw new Error("SQL Server 驗證模式需要提供用戶名和密碼");
  }

  /**
   * 測試數據庫連接
   */
  async testConnection(config: DatabaseConfig): Promise<ConnectionResult> {
    try {
      this.logInfo("開始測試數據庫連接", {
        server: config.server,
        database: config.database || "預設",
        user: config.user,
      });
      this.validateConnectionConfig(config);
      const baseUrl = this.getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/database/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const result: ConnectionResult = await response.json();
      if (result.success) {
        this.logInfo("數據庫連接測試成功", result.message);
        return result;
      } else {
        this.logError("數據庫連接測試失敗", result.message);
        return result;
      }
    } catch (error: any) {
      this.logError("數據庫連接測試發生錯誤", error);
      return {
        success: false,
        message: `連接失敗：${error.message || "網路錯誤"}`,
      };
    }
  }

  /**
   * 執行 SQL 查詢
   */
  async executeQuery(
    config: DatabaseConfig,
    query: string,
    params?: any
  ): Promise<QueryResult> {
    try {
      this.logInfo("開始執行 SQL 查詢", {
        query: query.substring(0, 100) + "...",
      });
      if (!query || !query.trim()) {
        return { success: false, error: "SQL 查詢語句不能為空" };
      }
      const baseUrl = this.getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/database/execute-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, query, params }),
      });
      const result: QueryResult = await response.json();
      if (result.success) {
        this.logInfo("SQL 查詢執行成功", {
          recordCount: result.data?.length || 0,
        });
        return {
          success: true,
          data: result.data || [],
          count: result.data?.length || 0,
          message: result.message,
        };
      } else {
        this.logError("SQL 查詢執行失敗", this.extractError(result));
        return { success: false, error: this.extractError(result) };
      }
    } catch (error: any) {
      this.logError("SQL 查詢執行發生錯誤", error);
      return {
        success: false,
        error: `查詢失敗：${error.message || "網路錯誤"}`,
      };
    }
  }

  /**
   * 獲取數據庫表列表
   */
  async getTableList(config: DatabaseConfig): Promise<string[]> {
    try {
      this.logInfo("開始獲取數據庫表列表");
      const query = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME`;
      const result = await this.executeQuery(config, query);
      if (result.success && result.data) {
        const tables = result.data.map((row: any) => row.TABLE_NAME);
        this.logInfo("成功獲取表列表", { tableCount: tables.length });
        return tables;
      } else {
        // 針對登入失敗訊息給予更友善的說明
        const errMsg = this.extractError(result);
        if (errMsg.includes("登入失敗")) {
          this.logError("登入失敗：請檢查使用者名稱、密碼，或確認帳號是否有存取該資料庫的權限。如有疑問請聯絡資料庫管理員。", errMsg);
          return [];
        }
        this.logError("獲取表列表失敗", errMsg);
        return [];
      }
    } catch (error: any) {
      this.logError("獲取表列表失敗", error);
      return [];
    }
  }

  /**
   * 獲取表結構信息
   */
  async getTableSchema(
    config: DatabaseConfig,
    tableName: string
  ): Promise<any[]> {
    try {
      this.logInfo("開始獲取表結構", { tableName });
      const query = `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @tableName ORDER BY ORDINAL_POSITION`;
      const result = await this.executeQuery(config, query, { tableName });
      if (result.success && result.data) {
        this.logInfo("成功獲取表結構", { columnCount: result.data.length });
        return result.data;
      } else {
        throw new Error(this.extractError(result));
      }
    } catch (error: any) {
      this.logError("獲取表結構失敗", error);
      throw new Error(error.message || "獲取表結構失敗");
    }
  }

  /**
   * 獲取資料庫列表
   */
  async getDatabaseList(config: DatabaseConfig): Promise<string[]> {
    try {
      this.logInfo("開始獲取資料庫列表");
      const masterConfig = { ...config, database: "master" };
      const query = `SELECT name FROM sys.databases WHERE database_id > 4 ORDER BY name`;
      const result = await this.executeQuery(masterConfig, query);
      if (result.success && result.data) {
        const databases = result.data.map((row: any) => row.name);
        this.logInfo("成功獲取資料庫列表", { databaseCount: databases.length });
        return databases;
      } else {
        throw new Error(this.extractError(result));
      }
    } catch (error: any) {
      this.logError("獲取資料庫列表失敗", error);
      throw new Error(error.message || "獲取資料庫列表失敗");
    }
  }
}
