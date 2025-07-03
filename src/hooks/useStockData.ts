import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { MarketType } from "@/components/Stock/SearchBar";

// 型別集中管理
export interface StockData {
  symbol: string;
  datetime: string;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  close_price: number;
  volume?: number;
  [key: string]: any;
}
export interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}
export interface StockStats {
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

const TIMEFRAMES = {
  "1d": { name: "日線", table: "stock_data_1d" },
  "1h": { name: "時線", table: "stock_data_1h" },
} as const;

type Timeframe = keyof typeof TIMEFRAMES;

export const useStockData = (
  symbol: string,
  timeframe: Timeframe,
  market: MarketType
) => {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestSymbolRef = useRef(symbol);

  useEffect(() => {
    latestSymbolRef.current = symbol;
  }, [symbol]);

  const databaseConfig = useMemo(() => ({ database: market }), [market]);

  const fetchData = useCallback(async () => {
    if (!symbol.trim()) return;
    setLoading(true);
    setError(null);
    const currentSymbol = symbol;
    const tableName = TIMEFRAMES[timeframe].table;
    const db = market;
    const query = `
      SELECT
        symbol, datetime, open_price, high_price, low_price, close_price, volume,
        rsi_5, rsi_7, rsi_10, rsi_14, rsi_21,
        dif, macd, macd_histogram,
        rsv, k_value, d_value, j_value,
        ma5, ma10, ma20, ma60, ema12, ema26,
        bb_upper, bb_middle, bb_lower,
        atr, cci, willr, mom, pattern_signals
      FROM [${db}].[dbo].[${tableName}]
      WHERE symbol = @symbol
      ORDER BY datetime DESC
    `;
    try {
      const response = await fetch("/api/database/execute-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: databaseConfig,
          query: query.trim(),
          params: { symbol: symbol.toUpperCase() },
        }),
      });
      if (latestSymbolRef.current !== currentSymbol) return;
      if (!response.ok) throw new Error(`查詢失敗: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data || []);
        if (!result.data || result.data.length === 0) setError("查無資料");
      } else {
        setData([]);
        throw new Error(result.error || "查詢失敗");
      }
    } catch (err) {
      if (latestSymbolRef.current !== currentSymbol) return;
      setData([]);
      setError(err instanceof Error ? err.message : "未知錯誤");
    } finally {
      if (latestSymbolRef.current === currentSymbol) setLoading(false);
    }
  }, [symbol, timeframe, market, databaseConfig]);

  const candlestickData = useMemo((): CandlestickData[] => {
    if (!data.length) return [];
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
    const reversedData = data.slice().reverse();
    const result: Record<string, number[]> = {};
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
      "pattern_signals", // 新增形態信號
    ];
    indicators.forEach((indicator) => {
      // 過濾掉 null，只保留 number
      const values = reversedData
        .map((d) => {
          const value = d[indicator];
          return value != null && !isNaN(Number(value)) ? Number(value) : null;
        })
        .filter((v): v is number => v !== null);
      if (values.length > 0) {
        result[indicator] = values;
      }
    });
    return result;
  }, [data]);

  const stats = useMemo((): StockStats | null => {
    if (!candlestickData.length || !data.length) return null;
    const latest = candlestickData[candlestickData.length - 1];
    const latestOriginalData = data[0];
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
  useEffect(() => {
    setData([]);
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
