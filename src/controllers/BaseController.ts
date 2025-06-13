// 統一錯誤處理類
export class ErrorHandler {
  static handleControllerError(error: any, context: string): never {
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
export interface ApiResponse<T = any> {
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

  static error(error: string, data?: any): ApiResponse {
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
  protected handleError(error: any, context: string): never {
    return ErrorHandler.handleControllerError(error, context);
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

  protected validateRequired(value: any, fieldName: string): void {
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
