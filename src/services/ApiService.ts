export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export class ApiService {
  private static instance: ApiService;
  private config: ApiConfig;

  constructor(config?: Partial<ApiConfig>) {
    this.config = {
      baseURL:
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
      ...config,
    };
  }

  static getInstance(config?: Partial<ApiConfig>): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService(config);
    }
    return ApiService.instance;
  }

  setAuthToken(token: string): void {
    this.config.headers["Authorization"] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.config.headers["Authorization"];
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<ApiResponse<T>> {
    try {
      const url = new URL(endpoint, this.config.baseURL);
      if (params) {
        Object.keys(params).forEach((key) =>
          url.searchParams.append(
            key,
            params[key] !== undefined ? String(params[key]) : ""
          )
        );
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.config.headers,
        signal: AbortSignal.timeout(this.config.timeout),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        method: "POST",
        headers: this.config.headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(this.config.timeout),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        method: "PUT",
        headers: this.config.headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(this.config.timeout),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        method: "DELETE",
        headers: this.config.headers,
        signal: AbortSignal.timeout(this.config.timeout),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data as T,
        };
      } else {
        return {
          success: false,
          error:
            data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch {
      return {
        success: false,
        error: "回應解析失敗",
      };
    }
  }

  /**
   * 改進的錯誤處理機制
   */
  private handleError<T>(error: unknown): ApiResponse<T> {
    // 型別守衛
    let errObj: Record<string, unknown> = {};
    if (typeof error === "object" && error !== null) {
      errObj = error as Record<string, unknown>;
    }
    // 記錄詳細錯誤信息
    console.error("API Service Error:", {
      message: errObj.message,
      code: errObj.code,
      status: errObj.status,
      timestamp: new Date().toISOString(),
    });

    if (errObj.name === "AbortError") {
      return {
        success: false,
        error: "請求已取消",
        timestamp: new Date().toISOString(),
      };
    }

    // 網路連接錯誤
    if (errObj.code === "ECONNREFUSED" || errObj.code === "ENOTFOUND") {
      return {
        success: false,
        error: "無法連接到伺服器，請檢查網路連接",
        timestamp: new Date().toISOString(),
      };
    }

    // HTTP 狀態錯誤
    if (typeof errObj.status === "number") {
      const statusMessages: Record<number, string> = {
        400: "請求參數錯誤",
        401: "身份驗證失敗，請重新登入",
        403: "權限不足，無法存取此資源",
        404: "請求的資源不存在",
        408: "請求逾時，請稍後重試",
        429: "請求過於頻繁，請稍後重試",
        500: "伺服器內部錯誤",
        502: "伺服器暫時無法使用",
        503: "服務暫時無法使用",
        504: "請求逾時，請稍後重試",
      };

      return {
        success: false,
        error: statusMessages[errObj.status] || `HTTP 錯誤 ${errObj.status}`,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error:
        typeof errObj.message === "string"
          ? errObj.message
          : "發生未知錯誤，請稍後重試",
      timestamp: new Date().toISOString(),
    };
  }
}
