import { useState, useEffect, useCallback } from "react";

// 基本的 MVC 控制器 Hook
export function useMvcController<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (
      action: () => Promise<T>,
      options?: {
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      try {
        setLoading(true);
        setError(null);
        const result = await action();
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "未知錯誤";
        setError(errorMessage);
        options?.onError?.(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, execute, setData };
}

// 數據載入 Hook
export function useDataLoader<T>(
  loader: () => Promise<T>,
  defaultValue: T,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await loader();
        setData(result);
        options?.onSuccess?.(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "載入失敗";
        setError(errorMessage);
        options?.onError?.(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
}

// 分頁數據 Hook
export function usePaginatedData<T>(
  loader: (
    page: number,
    limit: number
  ) => Promise<{
    data: T[];
    total: number;
    page: number;
    totalPages: number;
  }>,
  pageSize: number = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadPage = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        setError(null);
        const result = await loader(page, pageSize);
        setData(result.data);
        setCurrentPage(result.page);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "載入失敗";
        setError(errorMessage);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [loader, pageSize]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      loadPage(currentPage + 1);
    }
  }, [currentPage, totalPages, loadPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      loadPage(currentPage - 1);
    }
  }, [currentPage, loadPage]);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    loadPage,
    nextPage,
    prevPage,
  };
}
