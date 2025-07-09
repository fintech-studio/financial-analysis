// 服務層基類
export abstract class BaseService {
  protected handleServiceError(error: unknown, context: string): never {
    const errorMessage = error instanceof Error ? error.message : "服務錯誤";
    console.error(`[${context}] Service Error:`, error);
    throw new Error(`${context}: ${errorMessage}`);
  }

  protected validateServiceInput(value: unknown, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new Error(`${fieldName} 不能為空`);
    }
  }

  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
    throw new Error("操作失敗");
  }
}

// 服務工廠
export class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, unknown> = new Map();

  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  getService<T>(serviceClass: new () => T): T {
    const className = serviceClass.name;
    if (!this.services.has(className)) {
      this.services.set(className, new serviceClass());
    }
    return this.services.get(className) as T;
  }

  clearServices(): void {
    this.services.clear();
  }
}
