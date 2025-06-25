import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { MarketType } from "@/components/Stock/SearchBar";

interface StockData {
  symbol: string;
  datetime: string;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  close_price: number;
  volume?: number;
  [key: string]: any;
}

interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface StockStats {
  latest: number;
  change: number;
  changePercent: number;
  isRising: boolean;
  high: number;
  low: number;
  volume?: number;
  open_price?: number;
  open?: number;
  datetime?: string;
}

interface DatabaseConfig {
  server: string;
  user: string;
  password: string;
  database: string;
  port?: string;
}

const TIMEFRAMES = {
  "1d": { name: "日線", table: "stock_data_1d" },
  "1h": { name: "時線", table: "stock_data_1h" },
};

export const useStockData = (
  symbol: string,
  timeframe: "1d" | "1h",
  market: MarketType
) => {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestSymbolRef = useRef(symbol);

  useEffect(() => {
    latestSymbolRef.current = symbol;
  }, [symbol]);

  const databaseConfig = useMemo<DatabaseConfig>(
    () => ({
      server: "localhost",
      user: "testuser",
      password: "testuserPass123!",
      database: market,
      port: "1433",
    }),
    [market]
  );

  const fetchData = useCallback(async () => {
    if (!symbol.trim()) return;

    setLoading(true);
    setError(null);
    const currentSymbol = symbol;

    // 修正：tableName 固定為 stock_data_{時間選項}
    const tableName = TIMEFRAMES[timeframe].table;

    try {
      const query = `
        SELECT
          symbol, datetime, open_price, high_price, low_price, close_price, volume,
          rsi_5, rsi_7, rsi_10, rsi_14, rsi_21,
          dif, macd, macd_histogram,
          rsv, k_value, d_value, j_value,
          ma5, ma10, ma20, ma60, ema12, ema26,
          bb_upper, bb_middle, bb_lower,
          atr, cci, willr, mom
        FROM ${tableName}
        WHERE symbol = @symbol
        ORDER BY datetime DESC
      `;

      const response = await fetch("/api/database/execute-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: databaseConfig,
          query: query.trim(),
          params: { symbol: symbol.toUpperCase() },
        }),
      });

      if (latestSymbolRef.current !== currentSymbol) {
        // symbol 已變動，丟棄這次請求結果
        return;
      }

      if (!response.ok) {
        throw new Error(`查詢失敗: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data || []);
        if (!result.data || result.data.length === 0) {
          setError("查無資料");
        }
      } else {
        setData([]); // 查詢失敗時清空
        throw new Error(result.error || "查詢失敗");
      }
    } catch (err) {
      if (latestSymbolRef.current !== currentSymbol) {
        // symbol 已變動，丟棄這次請求錯誤
        return;
      }
      setData([]); // 捕獲錯誤時也清空
      setError(err instanceof Error ? err.message : "未知錯誤");
    } finally {
      if (latestSymbolRef.current === currentSymbol) {
        setLoading(false);
      }
    }
  }, [symbol, timeframe, market, databaseConfig]);
  const candlestickData = useMemo((): CandlestickData[] => {
    if (!data.length) return [];

    // 重要修復：不過濾數據，保持與技術指標的索引對應關係
    // 只反轉順序，讓最舊的數據在前面（正常時間順序）
    return data
      .slice()
      .reverse()
      .filter(
        (item) =>
          item.open_price !== undefined &&
          item.high_price !== undefined &&
          item.low_price !== undefined &&
          item.close_price !== undefined &&
          item.datetime
      )
      .map((item) => ({
        date: item.datetime,
        open: Number(item.open_price),
        high: Number(item.high_price),
        low: Number(item.low_price),
        close: Number(item.close_price),
        volume: item.volume ? Number(item.volume) : undefined,
      }));
  }, [data]);
  const technicalData = useMemo(() => {
    if (!data.length) return undefined;

    // 重要修復：保持技術指標數據與原始數據的索引對應關係
    const reversedData = data.slice().reverse();
    const result: any = {};

    const indicators = [
      "rsi_5",
      "rsi_7",
      "rsi_10",
      "rsi_14",
      "rsi_21",
      "dif",
      "macd",
      "macd_histogram",
      "k_value",
      "d_value",
      "j_value",
      "ma5",
      "ma10",
      "ma20",
      "ma60",
      "ema12",
      "ema26",
      "bb_upper",
      "bb_middle",
      "bb_lower",
      "atr",
      "cci",
      "willr",
      "mom",
    ];

    indicators.forEach((indicator) => {
      // 關鍵修復：不過濾空值，保持索引對應關係
      // 空值會在圖表組件中處理，這樣可以確保時間對齊
      const values = reversedData.map((d) => {
        const value = d[indicator];
        return value != null && !isNaN(Number(value)) ? Number(value) : null;
      });

      // 只有當至少有一些有效值時才添加這個指標
      const hasValidValues = values.some((v) => v !== null);
      if (hasValidValues) {
        result[indicator] = values;
      }
    });

    return result;
  }, [data]);
  const stats = useMemo((): StockStats | null => {
    if (!candlestickData.length || !data.length) return null;

    const latest = candlestickData[candlestickData.length - 1];
    const latestOriginalData = data[0]; // 因為 data 是按 datetime DESC 排序，所以第一個是最新的

    const previous =
      candlestickData.length > 1
        ? candlestickData[candlestickData.length - 2]
        : latest;

    const change = latest.close - previous.close;
    const changePercent = (change / previous.close) * 100;

    return {
      latest: latest.close,
      change,
      changePercent,
      isRising: change >= 0,
      high: latest.high,
      low: latest.low,
      volume: latest.volume,
      open_price: latest.open,
      open: latest.open,
      datetime: latestOriginalData?.datetime || latest.date,
    };
  }, [candlestickData, data]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 修正：當 symbol 變動時，立即清空 data、stats 狀態，避免殘留舊資料
  useEffect(() => {
    setData([]);
    // 這裡不需要 setStats，因為 stats 是 useMemo 計算的
    setError(null);
  }, [symbol, timeframe]);

  return {
    data,
    loading,
    error,
    stats,
    candlestickData,
    technicalData,
    refetch,
    clearError,
  };
};
