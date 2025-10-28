// 導入必要的 Model 類別
import { UserModel, PortfolioModel } from "@/models";

// 統一錯誤處理類
export class ErrorHandler {
  static handleControllerError(error: unknown, context: string): never {
    const errorMessage = error instanceof Error ? error.message : "未知錯誤";
    console.error(`[${context}] ${errorMessage}`, error);

    // 根據錯誤類型提供更友好的用戶提示
    if (error instanceof TypeError) {
      throw new Error(`${context}: 數據格式錯誤`);
    }

    if (error instanceof ReferenceError) {
      throw new Error(`${context}: 系統參考錯誤`);
    }

    if (errorMessage.includes("網路")) {
      throw new Error(`${context}: 網路連線異常，請檢查網路設定`);
    }

    if (errorMessage.includes("權限")) {
      throw new Error(`${context}: 權限不足，請重新登入`);
    }

    throw new Error(`${context}: ${errorMessage}`);
  }

  static handleAsyncError<T>(promise: Promise<T>, context: string): Promise<T> {
    return promise.catch((error) => {
      this.handleControllerError(error, context);
    });
  }
}

// API響應狀態枚舉
export enum ApiStatus {
  SUCCESS = "success",
  ERROR = "error",
  LOADING = "loading",
  IDLE = "idle",
}

// 統一API響應格式
export interface ApiResponse<T = unknown> {
  status: ApiStatus;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// 創建統一響應格式的幫助函數
export class ResponseHelper {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      status: ApiStatus.SUCCESS,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static error(error: string, data?: unknown): ApiResponse {
    return {
      status: ApiStatus.ERROR,
      error,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static loading(message?: string): ApiResponse {
    return {
      status: ApiStatus.LOADING,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}

// 控制器基類
export abstract class BaseController {
  /**
   * 記錄信息日誌
   */
  protected logInfo(message: string, data?: unknown): void {
    console.log(`[INFO] ${message}`, data || "");
  }

  /**
   * 記錄錯誤日誌
   */
  protected logError(message: string, error?: unknown): void {
    console.error(`[ERROR] ${message}`, error || "");
  }

  /**
   * 記錄警告日誌
   */
  protected logWarning(message: string, data?: unknown): void {
    console.warn(`[WARNING] ${message}`, data || "");
  }

  /**
   * 改進錯誤處理 - 添加更詳細的錯誤信息和恢復機制
   */
  protected handleError(error: unknown, context: string): never {
    const errorMessage = error instanceof Error ? error.message : "未知錯誤";

    // 記錄詳細錯誤信息
    console.error(`[${context}] Error Details:`, {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      context,
    });

    // 根據錯誤類型提供更友好的用戶提示
    if (error instanceof TypeError) {
      throw new Error(`${context}: 數據格式錯誤，請檢查輸入數據`);
    }

    if (error instanceof ReferenceError) {
      throw new Error(`${context}: 系統參考錯誤，請聯繫技術支援`);
    }

    // 網路相關錯誤
    if (
      errorMessage.includes("網路") ||
      errorMessage.includes("network") ||
      (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "ECONNREFUSED")
    ) {
      throw new Error(`${context}: 網路連線異常，請檢查網路設定並稍後重試`);
    }

    // 權限相關錯誤
    if (
      errorMessage.includes("權限") ||
      errorMessage.includes("permission") ||
      errorMessage.includes("unauthorized")
    ) {
      throw new Error(`${context}: 權限不足，請重新登入或聯繫管理員`);
    }

    // 資料庫相關錯誤
    if (
      errorMessage.includes("Login failed") ||
      errorMessage.includes("database")
    ) {
      throw new Error(`${context}: 資料庫連接失敗，請檢查設定或聯繫技術支援`);
    }

    // 預設錯誤
    throw new Error(`${context}: ${errorMessage}`);
  }

  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error, context);
    }
  }

  protected validateRequired(value: unknown, fieldName: string): void {
    if (value === null || value === undefined || value === "") {
      throw new Error(`${fieldName} 是必填欄位`);
    }
  }

  protected validatePositiveNumber(value: number, fieldName: string): void {
    if (typeof value !== "number" || value <= 0) {
      throw new Error(`${fieldName} 必須是正數`);
    }
  }

  protected validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("電子郵件格式不正確");
    }
  }
}

// 依賴注入容器
export class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, unknown> = new Map();
  private factories: Map<string, () => unknown> = new Map();

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // 註冊單例服務
  registerSingleton<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }

  // 註冊實例
  registerInstance<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  // 獲取服務
  get<T>(key: string): T {
    if (this.services.has(key)) {
      return this.services.get(key) as T;
    }

    if (this.factories.has(key)) {
      const factory = this.factories.get(key)!;
      const instance = factory();
      this.services.set(key, instance);
      return instance as T;
    }

    throw new Error(`Service ${key} not found`);
  }

  // 清理容器
  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

// 服務鍵常量
export const SERVICE_KEYS = {
  USER_MODEL: "UserModel",
  PORTFOLIO_MODEL: "PortfolioModel",
  NEWS_MODEL: "NewsModel",
  EDUCATION_MODEL: "EducationModel",
} as const;

// 初始化容器
export function initializeDIContainer(): void {
  const container = DIContainer.getInstance();

  // 註冊所有模型
  container.registerSingleton(SERVICE_KEYS.USER_MODEL, () =>
    UserModel.getInstance()
  );
  container.registerSingleton(SERVICE_KEYS.PORTFOLIO_MODEL, () =>
    PortfolioModel.getInstance()
  );
  // ... 其他模型
}
