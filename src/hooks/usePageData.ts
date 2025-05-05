import { useState, useEffect } from "react";

export interface PageDataState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

export const usePageData = (fetchFn: () => Promise<any>) => {
  const [state, setState] = useState<PageDataState>({
    isLoading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const data = await fetchFn();
        setState({ isLoading: false, error: null, data });
      } catch (error) {
        setState({
          isLoading: false,
          error: error instanceof Error ? error.message : "資料載入失敗",
          data: null,
        });
      }
    };

    loadData();
  }, [fetchFn]);

  return state;
};
