import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// 基礎 Hook 類型定義
export interface ControllerHookOptions {
  autoStart?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface RetryOptions extends ControllerHookOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface RealTimeOptions extends ControllerHookOptions {
  interval?: number;
  autoStart?: boolean;
}

export interface PreloadOptions {
  priority?: string[];
  concurrent?: boolean;
  onProgress?: (loaded: number, total: number) => void;
}

// 預加載數據 Hook
export function usePreloadData<T extends Record<string, () => Promise<any>>>(
  loaders: T,
  options: PreloadOptions = {}
) {
  const [data, setData] = useState<Record<keyof T, any>>(
    {} as Record<keyof T, any>
  );
  const [loading, setLoading] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );
  const [errors, setErrors] = useState<Record<keyof T, string>>(
    {} as Record<keyof T, string>
  );
  const [progress, setProgress] = useState({
    loaded: 0,
    total: Object.keys(loaders).length,
  });
  const [isComplete, setIsComplete] = useState(false);

  // 修復：使用 useRef 來穩定 loaders 引用
  const loadersRef = useRef(loaders);
  loadersRef.current = loaders;

  // 修復：使用 useRef 來穩定 options 引用
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const reload = useCallback(async () => {
    const currentOptions = optionsRef.current;
    const currentLoaders = loadersRef.current;

    setLoading(() => {
      const newLoading = {} as Record<keyof T, boolean>;
      Object.keys(currentLoaders).forEach((key) => {
        newLoading[key as keyof T] = true;
      });
      return newLoading;
    });

    setErrors({} as Record<keyof T, string>);
    setProgress({ loaded: 0, total: Object.keys(currentLoaders).length });

    const keys = Object.keys(currentLoaders) as Array<keyof T>;
    let loaded = 0;

    // 使用 Promise.allSettled 來並行載入，避免一個失敗影響其他
    const results = await Promise.allSettled(
      keys.map(async (key) => {
        try {
          const result = await currentLoaders[key]();
          return { key, result, success: true };
        } catch (error) {
          return {
            key,
            error: error instanceof Error ? error.message : "未知錯誤",
            success: false,
          };
        }
      })
    );

    // 處理結果
    const newData = {} as Record<keyof T, any>;
    const newErrors = {} as Record<keyof T, string>;
    const newLoading = {} as Record<keyof T, boolean>;

    results.forEach((result, index) => {
      const key = keys[index];
      newLoading[key] = false;

      if (result.status === "fulfilled" && result.value.success) {
        newData[key] = result.value.result;
        loaded++;
      } else {
        const errorMessage =
          result.status === "fulfilled"
            ? result.value.error || "載入失敗"
            : "載入失敗";
        newErrors[key] = errorMessage;
        console.warn(`載入 ${String(key)} 失敗:`, errorMessage);
      }
    });

    setData((prev) => ({ ...prev, ...newData }));
    setErrors(newErrors);
    setLoading(newLoading);
    setProgress({ loaded, total: keys.length });
    setIsComplete(true);

    currentOptions.onProgress?.(loaded, keys.length);
  }, []); // 修復：使用空依賴數組，通過 ref 訪問最新值

  // 修復：只在組件掛載時執行一次，避免無限重載
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (!hasExecutedRef.current) {
      hasExecutedRef.current = true;
      reload();
    }
  }, [reload]);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    data,
    loading,
    errors,
    progress,
    isComplete,
    hasErrors,
    reload,
  };
}

// 基礎控制器 Hook
export function useMvcController<T>(initialData?: T) {
  const [data, setData] = useState<T | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 使用 ref 來穩定執行狀態
  const isExecutingRef = useRef(false);
  const isMountedRef = useRef(true);

  // 清理函數
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    // 防止重複執行
    if (isExecutingRef.current || !isMountedRef.current) {
      return;
    }

    try {
      isExecutingRef.current = true;
      setLoading(true);
      setError(null);

      const result = await asyncFunction();

      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage =
          err instanceof Error ? err.message : "發生未知錯誤";
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      isExecutingRef.current = false;
    }
  }, []);

  return { data, loading, error, execute };
}

// 重試機制 Hook
export function useControllerWithRetry<T>(
  controllerFn: () => Promise<T>,
  options: RetryOptions & { enabled?: boolean } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = () => true,
    onRetry,
    enabled = true,
    cacheKey,
    cacheTTL = 300000,
    ...baseOptions
  } = options;

  // 使用 ref 來穩定函數引用，避免重複執行
  const controllerFnRef = useRef(controllerFn);
  controllerFnRef.current = controllerFn;

  const isMountedRef = useRef(true);
  const isExecutingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    // 防止重複執行和組件卸載後執行
    if (isExecutingRef.current || !isMountedRef.current || !enabled) {
      return;
    }

    // 檢查緩存
    if (cacheKey) {
      const cachedData = globalCacheManager.get(cacheKey);
      if (cachedData) {
        setData(cachedData);
        return;
      }
    }

    isExecutingRef.current = true;
    setLoading(true);
    setError(null);
    setRetryCount(0);

    const attemptExecution = async (attempt: number): Promise<void> => {
      try {
        const result = await controllerFnRef.current();

        if (isMountedRef.current) {
          setData(result);
          // 緩存結果
          if (cacheKey) {
            globalCacheManager.set(cacheKey, result, cacheTTL);
          }
          baseOptions.onSuccess?.(result);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");

        if (
          attempt < maxRetries &&
          retryCondition(error) &&
          isMountedRef.current
        ) {
          setRetryCount(attempt + 1);
          onRetry?.(attempt + 1, error);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return attemptExecution(attempt + 1);
        } else {
          if (isMountedRef.current) {
            setError(error);
            baseOptions.onError?.(error);
          }
        }
      }
    };

    await attemptExecution(0);

    if (isMountedRef.current) {
      setLoading(false);
    }
    isExecutingRef.current = false;
  }, [
    enabled,
    maxRetries,
    retryDelay,
    retryCondition,
    onRetry,
    cacheKey,
    cacheTTL,
    baseOptions,
  ]);

  const retry = useCallback(() => {
    if (!enabled) return;
    execute();
  }, [execute, enabled]);

  // 修復：只在 enabled 狀態改變或組件掛載時執行
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (enabled && baseOptions.autoStart !== false && !hasExecutedRef.current) {
      hasExecutedRef.current = true;
      execute();
    }
  }, [enabled, baseOptions.autoStart, execute]);

  return { data, loading, error, retryCount, execute, retry };
}

// 實時數據 Hook
export function useRealTimeData<T>(
  controllerFn: () => Promise<T>,
  interval = 30000,
  options: RealTimeOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isActive, setIsActive] = useState(false);

  const { autoStart = true, onSuccess, onError } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await controllerFn();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [controllerFn, onSuccess, onError]);

  const start = useCallback(() => {
    if (isActive) return;

    setIsActive(true);
    fetchData(); // 立即執行一次

    intervalRef.current = setInterval(fetchData, interval);
  }, [isActive, fetchData, interval]);

  const stop = useCallback(() => {
    if (!isActive) return;

    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isActive]);

  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      stop();
    };
  }, [autoStart, start, stop]);

  return {
    data,
    loading,
    error,
    isActive,
    start,
    stop,
    retry: fetchData,
  };
}

// 表單控制器 Hook
export function useFormController<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>,
  validator?: (values: T) => Partial<Record<keyof T, string | null>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string | null>>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);

  const setValue = useCallback(
    (key: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      // 清除該欄位的錯誤
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: null }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(async () => {
    if (validator) {
      const validationErrors = validator(values);
      const hasErrors = Object.values(validationErrors).some(
        (error) => error !== null
      );

      if (hasErrors) {
        setErrors(validationErrors);
        return;
      }
    }

    setSubmitting(true);
    setErrors({});

    try {
      await onSubmit(values);
    } catch (error) {
      console.error("表單提交失敗:", error);
    } finally {
      setSubmitting(false);
    }
  }, [values, validator, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    submitting,
    setValue,
    handleSubmit,
    reset,
  };
}

// 數據載入器 Hook
export function useDataLoader<T>(
  loader: () => Promise<T>,
  defaultValue: T,
  options: ControllerHookOptions = {}
) {
  const { data, loading, error, execute } = useMvcController<T>(defaultValue);

  useEffect(() => {
    if (options.autoStart !== false) {
      execute(loader);
    }
  }, [execute, loader, options.autoStart]);

  return { data, loading, error, execute };
}

// 智能搜索 Hook
export function useSmartSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  options: { debounceMs?: number; minQueryLength?: number } = {}
) {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { debounceMs = 300, minQueryLength = 2 } = options;

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        if (searchQuery.length < minQueryLength) {
          setResults([]);
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const searchResults = await searchFn(searchQuery);
          setResults(searchResults);
        } catch (err) {
          const error = err instanceof Error ? err : new Error("搜索失敗");
          setError(error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs),
    [searchFn, minQueryLength, debounceMs]
  );

  const performSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      debouncedSearch(searchQuery);
    },
    [debouncedSearch]
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery("");
    setError(null);
  }, []);

  return {
    query,
    setQuery: performSearch,
    results,
    loading,
    error,
    performSearch,
    clearResults,
  };
}

// 防抖函數
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// 緩存管理器
export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> =
    new Map();

  set(key: string, data: any, ttl: number = 300000): void {
    // 預設5分鐘
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// 全域緩存實例
export const globalCacheManager = new CacheManager();
