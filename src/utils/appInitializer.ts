// 應用程式初始化器
import {
  DIContainer,
  initializeDIContainer,
} from "../controllers/BaseController";
import { ServiceFactory } from "../services/BaseService";
import { globalCacheManager } from "../hooks/useMvcController";

// 應用程式配置
export interface AppConfig {
  apiBaseUrl: string;
  environment: "development" | "production" | "test";
  enableCache: boolean;
  cacheDefaultTTL: number;
  retryAttempts: number;
  retryDelay: number;
  enableMockData: boolean;
}

// 預設配置
const defaultConfig: AppConfig = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
  environment:
    (process.env.NODE_ENV as "development" | "production" | "test") ||
    "development",
  enableCache: true,
  cacheDefaultTTL: 300000, // 5分鐘
  retryAttempts: 3,
  retryDelay: 1000,
  enableMockData: process.env.NODE_ENV === "development",
};

// 應用程式狀態管理
class AppStateManager {
  private static instance: AppStateManager;
  private config: AppConfig;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    this.config = defaultConfig;
  }

  static getInstance(): AppStateManager {
    if (!AppStateManager.instance) {
      AppStateManager.instance = new AppStateManager();
    }
    return AppStateManager.instance;
  }

  async initialize(customConfig?: Partial<AppConfig>): Promise<void> {
    if (this.initialized) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.performInitialization(customConfig);
    await this.initPromise;
  }

  private async performInitialization(
    customConfig?: Partial<AppConfig>
  ): Promise<void> {
    try {
      console.log("🚀 正在初始化應用程式...");

      // 合併配置
      this.config = { ...defaultConfig, ...customConfig };

      // 初始化依賴注入容器
      initializeDIContainer();
      console.log("✅ 依賴注入容器已初始化");

      // 清理緩存 (如果需要)
      if (!this.config.enableCache) {
        globalCacheManager.clear();
        console.log("🧹 緩存已清理");
      }

      // 清理服務工廠 (開發環境)
      if (this.config.environment === "development") {
        ServiceFactory.getInstance().clearServices();
        console.log("🔄 服務工廠已重置");
      }

      // 預加載重要數據
      await this.preloadCriticalData();

      this.initialized = true;
      console.log("✨ 應用程式初始化完成");
    } catch (error) {
      console.error("❌ 應用程式初始化失敗:", error);
      throw error;
    }
  }

  private async preloadCriticalData(): Promise<void> {
    try {
      // 這裡可以預加載一些關鍵數據
      // 例如：用戶偏好設定、系統配置等
      console.log("📦 正在預加載關鍵數據...");

      // 模擬預加載
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("✅ 關鍵數據預加載完成");
    } catch (error) {
      console.warn("⚠️ 關鍵數據預加載失敗:", error);
      // 不阻斷初始化流程
    }
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // 重置應用程式狀態 (主要用於測試)
  reset(): void {
    this.initialized = false;
    this.initPromise = null;
    globalCacheManager.clear();
    ServiceFactory.getInstance().clearServices();
    DIContainer.getInstance().clear();
  }
}

// 導出單例實例
export const appStateManager = AppStateManager.getInstance();

// React Hook 用於應用程式初始化
import { useState, useEffect } from "react";

export function useAppInitialization(customConfig?: Partial<AppConfig>) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await appStateManager.initialize(customConfig);

        setIsInitialized(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "應用程式初始化失敗";
        setError(errorMessage);
        console.error("App initialization failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!appStateManager.isInitialized()) {
      initializeApp();
    } else {
      setIsInitialized(true);
      setIsLoading(false);
    }
  }, [customConfig]);

  return {
    isLoading,
    error,
    isInitialized,
    config: appStateManager.getConfig(),
  };
}
