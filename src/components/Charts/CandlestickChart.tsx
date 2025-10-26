import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  createChart,
  LineSeries,
  IChartApi,
  ISeriesApi,
  CandlestickData as LightweightCandlestickData,
  HistogramData,
  LineData,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface TechnicalIndicatorData {
  rsi_5?: number[];
  rsi_7?: number[];
  rsi_10?: number[];
  rsi_14?: number[];
  rsi_21?: number[];
  dif?: number[];
  macd?: number[];
  macd_histogram?: number[];
  k_value?: number[];
  d_value?: number[];
  j_value?: number[];
  ma5?: number[];
  ma10?: number[];
  ma20?: number[];
  ma60?: number[];
  ema12?: number[];
  ema26?: number[];
  bb_upper?: number[];
  bb_middle?: number[];
  bb_lower?: number[];
  atr?: number[];
  cci?: number[];
  willr?: number[];
  mom?: number[];
}

interface TechnicalIndicator {
  key: keyof TechnicalIndicatorData;
  name: string;
  color: string;
  enabled: boolean;
  lineWidth?: number;
  category: string;
  description?: string;
  overlay?: boolean;
}

interface CandlestickChartProps {
  data: CandlestickData[];
  technicalData?: TechnicalIndicatorData;
  title?: string;
  height?: number;
  showVolume?: boolean;
  theme?: "light" | "dark";
  timeframe?: "1d" | "1h";
}

// 🔧 數據清理和驗證工具函數
const cleanAndValidateData = (
  rawData: CandlestickData[],
  timeframe: "1d" | "1h"
): {
  candleData: LightweightCandlestickData[];
  volumeData: HistogramData[];
  warnings: string[];
  errors: string[];
} => {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!rawData || rawData.length === 0) {
    errors.push("沒有可用的數據");
    return { candleData: [], volumeData: [], warnings, errors };
  }

  console.log(`🔍 開始清理數據: ${rawData.length} 筆原始數據 (${timeframe})`);

  // 統計變量，用於控制台輸出
  let ohlcCorrectionCount = 0;
  let highCorrectionCount = 0;
  let lowCorrectionCount = 0;

  try {
    // Step 1: 基本數據轉換和驗證
    const processedItems = rawData
      .map((item, index) => {
        try {
          // 驗證必要欄位
          if (!item || !item.date) {
            warnings.push(`索引 ${index}: 缺少日期資訊`);
            return null;
          }

          // 轉換並驗證價格數據
          const open = Number(item.open);
          const high = Number(item.high);
          const low = Number(item.low);
          const close = Number(item.close);

          if ([open, high, low, close].some((val) => isNaN(val) || val <= 0)) {
            warnings.push(
              `索引 ${index}: 無效的價格數據 OHLC=[${open},${high},${low},${close}]`
            );
            return null;
          }

          // 靜默修正 OHLC 邏輯錯誤（不產生警告）
          const originalHigh = high;
          const originalLow = low;
          const correctedHigh = Math.max(open, high, low, close);
          const correctedLow = Math.min(open, high, low, close);

          // 只記錄統計信息，不產生用戶警告
          if (high !== correctedHigh || low !== correctedLow) {
            ohlcCorrectionCount++;
            if (high !== correctedHigh) highCorrectionCount++;
            if (low !== correctedLow) lowCorrectionCount++;

            // 只在開發模式下詳細記錄到控制台
            if (process.env.NODE_ENV === "development") {
              console.log(
                `靜默修正 索引 ${index}: H: ${high}→${correctedHigh}, L: ${low}→${correctedLow}`
              );
            }
          }

          // 處理時間戳
          let timeValue: string | number;
          let sortKey: number; // 用於排序的統一時間戳

          if (timeframe === "1d") {
            // 日線：使用 YYYY-MM-DD 格式
            const dateOnly = item.date.split("T")[0];
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
              warnings.push(`索引 ${index}: 無效的日期格式 ${dateOnly}`);
              return null;
            }
            timeValue = dateOnly;
            sortKey = new Date(dateOnly).getTime();
          } else {
            // 小時線：使用 Unix 時間戳
            const timestamp = Math.floor(new Date(item.date).getTime() / 1000);
            if (isNaN(timestamp) || timestamp <= 0) {
              warnings.push(`索引 ${index}: 無效的時間戳 ${item.date}`);
              return null;
            }
            timeValue = timestamp;
            sortKey = timestamp * 1000; // 轉換為毫秒便於排序
          }

          // 處理成交量
          const volume = item.volume ? Number(item.volume) : undefined;
          if (volume !== undefined && (isNaN(volume) || volume < 0)) {
            warnings.push(`索引 ${index}: 無效的成交量 ${item.volume}`);
          }

          // 額外的數據質量檢查（僅記錄嚴重異常）
          const priceRange = correctedHigh - correctedLow;
          const avgPrice = (open + correctedHigh + correctedLow + close) / 4;
          const rangePercentage = (priceRange / avgPrice) * 100;

          // 只對極端異常波動（超過50%）發出警告
          if (rangePercentage > 50) {
            warnings.push(
              `索引 ${index}: 極端價格波動 ${rangePercentage.toFixed(2)}%`
            );
          }

          return {
            originalIndex: index,
            timeValue,
            sortKey,
            open,
            high: correctedHigh,
            low: correctedLow,
            close,
            volume: volume && volume > 0 ? volume : undefined,
            originalDate: item.date,
            // 記錄修正信息用於統計
            wasHighCorrected: high !== correctedHigh,
            wasLowCorrected: low !== correctedLow,
            originalHigh,
            originalLow,
          };
        } catch (error) {
          warnings.push(`索引 ${index}: 處理失敗 - ${error}`);
          return null;
        }
      })
      .filter((item) => item !== null);

    if (processedItems.length === 0) {
      errors.push("所有數據都無效");
      return { candleData: [], volumeData: [], warnings, errors };
    }

    console.log(
      `✅ 基本處理完成: ${processedItems.length}/${rawData.length} 筆有效數據`
    );

    // 在控制台輸出OHLC修正統計（不影響UI警告）
    if (ohlcCorrectionCount > 0) {
      console.log(
        `🔧 OHLC自動修正統計: 總共 ${ohlcCorrectionCount} 筆 (高價修正: ${highCorrectionCount}, 低價修正: ${lowCorrectionCount})`
      );
    }

    // Step 2: 按時間排序
    processedItems.sort((a, b) => a!.sortKey - b!.sortKey);

    // Step 3: 移除重複時間戳 (關鍵修復)
    const uniqueItems: typeof processedItems = [];
    const timeSet = new Set<string | number>();
    let duplicateCount = 0;

    for (const item of processedItems) {
      if (item && !timeSet.has(item.timeValue)) {
        timeSet.add(item.timeValue);
        uniqueItems.push(item);
      } else if (item) {
        duplicateCount++;
        const timeStr =
          timeframe === "1d"
            ? (item.timeValue as string)
            : new Date((item.timeValue as number) * 1000).toISOString();
        warnings.push(`移除重複時間戳: ${timeStr}`);
      }
    }

    if (duplicateCount > 0) {
      console.log(`⚠️  移除 ${duplicateCount} 個重複時間戳`);
    }

    // Step 4: 最終驗證數據順序
    for (let i = 1; i < uniqueItems.length; i++) {
      const current = uniqueItems[i]!.sortKey;
      const previous = uniqueItems[i - 1]!.sortKey;

      if (current <= previous) {
        errors.push(`時間順序錯誤 at index ${i}: ${current} <= ${previous}`);
      }
    }

    if (errors.length > 0) {
      return { candleData: [], volumeData: [], warnings, errors };
    }

    // Step 5: 生成最終圖表數據
    const candleData: LightweightCandlestickData[] = uniqueItems.map(
      (item) => ({
        time: (timeframe === "1d"
          ? (item!.timeValue as string)
          : (item!.timeValue as number)) as LightweightCandlestickData["time"],
        open: item!.open,
        high: item!.high,
        low: item!.low,
        close: item!.close,
      })
    );

    const volumeData: HistogramData[] = uniqueItems
      .filter((item) => item!.volume !== undefined)
      .map((item) => ({
        time: (timeframe === "1d"
          ? (item!.timeValue as string)
          : (item!.timeValue as number)) as HistogramData["time"],
        value: item!.volume!,
        color: item!.close >= item!.open ? "#ef444460" : "#10b98160",
      }));

    console.log(`🎯 數據清理完成:`);
    console.log(`   - K線數據: ${candleData.length} 筆`);
    console.log(`   - 成交量數據: ${volumeData.length} 筆`);
    console.log(`   - 用戶警告: ${warnings.length} 個 (OHLC修正已靜默處理)`);

    return { candleData, volumeData, warnings, errors };
  } catch (error) {
    console.error("❌ 數據清理失敗:", error);
    errors.push(
      `數據處理異常: ${error instanceof Error ? error.message : String(error)}`
    );
    return { candleData: [], volumeData: [], warnings, errors };
  }
};

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  technicalData,
  title = "K線圖",
  height = 500,
  showVolume = true,
  theme = "light",
  timeframe = "1d",
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const technicalSeriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map());

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIndicators, setShowIndicators] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("移動平均");
  const [hoveredCandle, setHoveredCandle] = useState<CandlestickData | null>(
    null
  );
  const [hoveredPosition, setHoveredPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // 新增錯誤和警告狀態
  const [dataWarnings, setDataWarnings] = useState<string[]>([]);
  const [dataErrors, setDataErrors] = useState<string[]>([]);
  const [showWarningDetails, setShowWarningDetails] = useState(false);

  // 技術指標配置
  const defaultTechnicalIndicators = useMemo<TechnicalIndicator[]>(
    () => [
      // 移動平均線組
      {
        key: "ma5",
        name: "MA5",
        color: "#3b82f6",
        enabled: true,
        lineWidth: 2,
        category: "移動平均",
        description: "5日移動平均線",
        overlay: true,
      },
      {
        key: "ma10",
        name: "MA10",
        color: "#f59e0b",
        enabled: true,
        lineWidth: 2,
        category: "移動平均",
        description: "10日移動平均線",
        overlay: true,
      },
      {
        key: "ma20",
        name: "MA20",
        color: "#ef4444",
        enabled: false,
        lineWidth: 2,
        category: "移動平均",
        description: "20日移動平均線",
        overlay: true,
      },
      {
        key: "ma60",
        name: "MA60",
        color: "#8b5cf6",
        enabled: false,
        lineWidth: 2,
        category: "移動平均",
        description: "60日移動平均線",
        overlay: true,
      },
      {
        key: "ema12",
        name: "EMA12",
        color: "#06b6d4",
        enabled: false,
        lineWidth: 2,
        category: "移動平均",
        description: "12日指數移動平均",
        overlay: true,
      },
      {
        key: "ema26",
        name: "EMA26",
        color: "#84cc16",
        enabled: false,
        lineWidth: 2,
        category: "移動平均",
        description: "26日指數移動平均",
        overlay: true,
      },

      // 布林通道組
      {
        key: "bb_upper",
        name: "布林上軌",
        color: "#f87171",
        enabled: false,
        lineWidth: 1,
        category: "布林通道",
        description: "布林帶上軌",
        overlay: true,
      },
      {
        key: "bb_middle",
        name: "布林中軌",
        color: "#fbbf24",
        enabled: false,
        lineWidth: 2,
        category: "布林通道",
        description: "布林帶中軌",
        overlay: true,
      },
      {
        key: "bb_lower",
        name: "布林下軌",
        color: "#34d399",
        enabled: false,
        lineWidth: 1,
        category: "布林通道",
        description: "布林帶下軌",
        overlay: true,
      },

      // RSI指標組
      {
        key: "rsi_5",
        name: "RSI(5)",
        color: "#ef4444",
        enabled: false,
        lineWidth: 2,
        category: "震盪指標",
        description: "5日相對強弱指標",
        overlay: false,
      },
      {
        key: "rsi_7",
        name: "RSI(7)",
        color: "#f59e0b",
        enabled: false,
        lineWidth: 2,
        category: "震盪指標",
        description: "7日相對強弱指標",
        overlay: false,
      },
      {
        key: "rsi_14",
        name: "RSI(14)",
        color: "#8b5cf6",
        enabled: false,
        lineWidth: 2,
        category: "震盪指標",
        description: "14日相對強弱指標",
        overlay: false,
      },
      {
        key: "rsi_21",
        name: "RSI(21)",
        color: "#06b6d4",
        enabled: false,
        lineWidth: 2,
        category: "震盪指標",
        description: "21日相對強弱指標",
        overlay: false,
      },

      // MACD指標組
      {
        key: "macd",
        name: "MACD",
        color: "#3b82f6",
        enabled: false,
        lineWidth: 2,
        category: "趨勢指標",
        description: "MACD快線",
        overlay: false,
      },
      {
        key: "dif",
        name: "DIF",
        color: "#ef4444",
        enabled: false,
        lineWidth: 2,
        category: "趨勢指標",
        description: "MACD慢線",
        overlay: false,
      },

      // KD指標組
      {
        key: "k_value",
        name: "K值",
        color: "#3b82f6",
        enabled: false,
        lineWidth: 2,
        category: "隨機指標",
        description: "隨機指標K值",
        overlay: false,
      },
      {
        key: "d_value",
        name: "D值",
        color: "#ef4444",
        enabled: false,
        lineWidth: 2,
        category: "隨機指標",
        description: "隨機指標D值",
        overlay: false,
      },
      {
        key: "j_value",
        name: "J值",
        color: "#f59e0b",
        enabled: false,
        lineWidth: 2,
        category: "隨機指標",
        description: "隨機指標J值",
        overlay: false,
      },

      // 其他技術指標
      {
        key: "atr",
        name: "ATR",
        color: "#84cc16",
        enabled: false,
        lineWidth: 2,
        category: "其他指標",
        description: "平均真實波幅",
        overlay: false,
      },
      {
        key: "cci",
        name: "CCI",
        color: "#06b6d4",
        enabled: false,
        lineWidth: 2,
        category: "其他指標",
        description: "順勢指標",
        overlay: false,
      },
      {
        key: "willr",
        name: "WillR",
        color: "#8b5cf6",
        enabled: false,
        lineWidth: 2,
        category: "其他指標",
        description: "威廉指標",
        overlay: false,
      },
      {
        key: "mom",
        name: "MOM",
        color: "#f87171",
        enabled: false,
        lineWidth: 2,
        category: "其他指標",
        description: "動量指標",
        overlay: false,
      },
    ],
    []
  );

  const [technicalIndicators, setTechnicalIndicators] = useState<
    TechnicalIndicator[]
  >(defaultTechnicalIndicators);

  // 按類別分組指標
  const groupedIndicators = useMemo(() => {
    const groups: { [key: string]: TechnicalIndicator[] } = {};
    technicalIndicators.forEach((indicator) => {
      if (!groups[indicator.category]) {
        groups[indicator.category] = [];
      }
      groups[indicator.category].push(indicator);
    });
    return groups;
  }, [technicalIndicators]);

  // 🔧 修復的數據處理 - 加入完整的錯誤處理
  const chartData = useMemo(() => {
    if (!data?.length) {
      setDataErrors(["沒有可用的數據"]);
      setDataWarnings([]);
      return null;
    }

    try {
      const result = cleanAndValidateData(data, timeframe);

      setDataErrors(result.errors);
      setDataWarnings(result.warnings);

      if (result.errors.length > 0) {
        console.error("❌ 數據驗證失敗:", result.errors);
        return null;
      }

      if (result.warnings.length > 0) {
        console.warn("⚠️  數據警告:", result.warnings);
      }

      return {
        candleData: result.candleData,
        volumeData: result.volumeData,
      };
    } catch (error) {
      console.error("❌ chartData 處理失敗:", error);
      setDataErrors([
        `數據處理異常: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ]);
      setDataWarnings([]);
      return null;
    }
  }, [data, timeframe]);

  // 🔧 修復的技術指標數據處理 - 加入去重邏輯
  const technicalChartData = useMemo(() => {
    if (!technicalData || !data?.length || !chartData) {
      return { overlay: {}, separate: {} };
    }

    const overlayData: Record<string, LineData[]> = {};
    const separateData: Record<string, LineData[]> = {};

    try {
      const enabledIndicators = technicalIndicators.filter(
        (ind) => ind.enabled
      );

      enabledIndicators.forEach((indicator) => {
        try {
          const indicatorValues = technicalData[indicator.key];
          if (!indicatorValues?.length) {
            console.warn(`⚠️  指標 ${indicator.key} 沒有數據`);
            return;
          }

          const lineData: LineData[] = [];
          const dataLength = data.length;
          const indicatorLength = indicatorValues.length;

          // 右對齊技術指標數據
          for (let i = 0; i < dataLength; i++) {
            const indicatorIdx = i - (dataLength - indicatorLength);
            const value =
              indicatorIdx >= 0 ? indicatorValues[indicatorIdx] : null;
            const dateItem = data[i];

            if (value != null && !isNaN(Number(value)) && dateItem?.date) {
              const timeValue =
                timeframe === "1d"
                  ? dateItem.date.split("T")[0]
                  : Math.floor(new Date(dateItem.date).getTime() / 1000);

              lineData.push({
                time: timeValue as LineData["time"],
                value: Number(value),
              });
            }
          }

          // 排序並去重
          lineData.sort((a, b) => {
            if (timeframe === "1d") {
              return (a.time as string).localeCompare(b.time as string);
            } else {
              return (a.time as number) - (b.time as number);
            }
          });

          // 移除重複的時間戳
          const uniqueLineData: LineData[] = [];
          const timeSet = new Set<string | number>();

          for (const item of lineData) {
            if (!timeSet.has(item.time as string | number)) {
              timeSet.add(item.time as string | number);
              uniqueLineData.push(item);
            }
          }

          if (uniqueLineData.length > 0) {
            if (indicator.overlay) {
              overlayData[indicator.key] = uniqueLineData;
            } else {
              separateData[indicator.key] = uniqueLineData;
            }
            console.log(
              `✅ 指標 ${indicator.key} 處理完成: ${uniqueLineData.length} 個數據點`
            );
          } else {
            console.warn(`⚠️  指標 ${indicator.key} 沒有有效數據點`);
          }
        } catch (error) {
          console.error(`❌ 處理指標 ${indicator.key} 失敗:`, error);
        }
      });
    } catch (error) {
      console.error("❌ 技術指標數據處理失敗:", error);
    }

    return { overlay: overlayData, separate: separateData };
  }, [technicalData, data, technicalIndicators, timeframe, chartData]);

  // 圖表初始化 - 加入強健的錯誤處理
  useEffect(() => {
    if (!chartContainerRef.current || !chartData) {
      return;
    }

    const isDark = theme === "dark";

    try {
      // 清理舊圖表
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (error) {
          console.warn("清理舊圖表時出現警告:", error);
        }
      }

      // 清理舊的技術指標系列
      technicalSeriesRef.current.clear();

      // 創建圖表
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: {
            type: ColorType.Solid,
            color: isDark ? "#1f2937" : "#ffffff",
          },
          textColor: isDark ? "#e5e7eb" : "#374151",
        },
        width: chartContainerRef.current.clientWidth,
        height: isFullscreen ? window.innerHeight - 200 : height,
        grid: {
          vertLines: {
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          },
          horzLines: {
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          },
        },
        crosshair: { mode: 1 },
        rightPriceScale: {
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(0, 0, 0, 0.2)",
          scaleMargins: {
            top: 0.1,
            bottom: showVolume ? 0.3 : 0.1,
          },
        },
        timeScale: {
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(0, 0, 0, 0.2)",
          timeVisible: timeframe === "1h",
          secondsVisible: false,
        },
        localization: { locale: "zh-TW" },
      });

      chartRef.current = chart;

      // 添加K線圖
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#ef4444",
        downColor: "#10b981",
        borderUpColor: "#dc2626",
        borderDownColor: "#059669",
        wickUpColor: "#dc2626",
        wickDownColor: "#059669",
        priceLineVisible: true,
        lastValueVisible: true,
      });

      candlestickSeriesRef.current = candlestickSeries;

      // 🔧 安全地設置K線數據
      try {
        candlestickSeries.setData(chartData.candleData);
        console.log(`✅ K線數據設置成功: ${chartData.candleData.length} 筆`);
      } catch (error) {
        console.error("❌ K線數據設置失敗:", error);
        throw new Error(`K線數據設置失敗: ${error}`);
      }

      // 添加成交量
      if (showVolume && chartData.volumeData.length > 0) {
        try {
          const volumeSeries = chart.addSeries(HistogramSeries, {
            color: "#26a69a",
            priceFormat: { type: "volume" },
            priceScaleId: "volume",
          });

          chart.priceScale("volume").applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
            borderVisible: false,
          });

          volumeSeriesRef.current = volumeSeries;
          volumeSeries.setData(chartData.volumeData);
          console.log(
            `✅ 成交量數據設置成功: ${chartData.volumeData.length} 筆`
          );
        } catch (error) {
          console.error("❌ 成交量設置失敗:", error);
          // 成交量失敗不影響主圖表
        }
      }

      // 添加技術指標
      const overlayIndicators = Object.keys(technicalChartData.overlay);
      if (overlayIndicators.length > 0) {
        const seriesMap = new Map<string, ISeriesApi<"Line">>();

        overlayIndicators.forEach((key) => {
          try {
            const indicatorData = technicalChartData.overlay[key];
            const indicator = technicalIndicators.find(
              (ind) => ind.key === key
            );

            if (indicator && indicatorData && indicatorData.length > 0) {
              const lineSeries = chart.addSeries(LineSeries, {
                color: indicator.color,
                lineWidth: (indicator.lineWidth ?? 2) as 1 | 2 | 3 | 4,
                title: indicator.name,
                priceLineVisible: false,
                lastValueVisible: true,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 4,
              });

              lineSeries.setData(indicatorData);
              seriesMap.set(key, lineSeries);
              console.log(`✅ 疊加指標 ${indicator.name} 設置成功`);
            }
          } catch (error) {
            console.error(`❌ 疊加指標 ${key} 設置失敗:`, error);
            // 單個指標失敗不影響其他指標
          }
        });

        technicalSeriesRef.current = seriesMap;
      }

      // 添加獨立的技術指標
      const separateIndicators = Object.keys(technicalChartData.separate);
      if (separateIndicators.length > 0) {
        separateIndicators.forEach((key) => {
          try {
            const indicatorData = technicalChartData.separate[key];
            const indicator = technicalIndicators.find(
              (ind) => ind.key === key
            );

            if (indicator && indicatorData && indicatorData.length > 0) {
              const priceScaleId = `indicator_${key}`;

              const lineSeries = chart.addSeries(LineSeries, {
                color: indicator.color,
                lineWidth: (indicator.lineWidth ?? 2) as 1 | 2 | 3 | 4,
                title: indicator.name,
                priceLineVisible: false,
                lastValueVisible: true,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 4,
                priceScaleId: priceScaleId,
              });

              chart.priceScale(priceScaleId).applyOptions({
                scaleMargins: { top: 0.7, bottom: 0.1 },
                borderVisible: false,
              });

              lineSeries.setData(indicatorData);

              if (!technicalSeriesRef.current) {
                technicalSeriesRef.current = new Map();
              }
              technicalSeriesRef.current.set(key, lineSeries);
              console.log(`✅ 獨立指標 ${indicator.name} 設置成功`);
            }
          } catch (error) {
            console.error(`❌ 獨立指標 ${key} 設置失敗:`, error);
          }
        });
      }

      // 滑鼠事件
      chart.subscribeCrosshairMove((param) => {
        try {
          if (param && param.time && param.point) {
            const candle = chartData.candleData.find(
              (c) => c.time === param.time
            );
            if (candle) {
              const idx = chartData.candleData.findIndex(
                (c) => c.time === param.time
              );
              const origin = data[idx];
              setHoveredCandle(origin || null);
              setHoveredPosition({ x: param.point.x, y: param.point.y });
            } else {
              setHoveredCandle(null);
              setHoveredPosition(null);
            }
          } else {
            setHoveredCandle(null);
            setHoveredPosition(null);
          }
        } catch (error) {
          console.error("滑鼠事件處理錯誤:", error);
        }
      });

      console.log("🎯 圖表初始化成功");
    } catch (error) {
      console.error("❌ 圖表初始化失敗:", error);
      setDataErrors([
        `圖表初始化失敗: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ]);
    }

    return () => {
      try {
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
        candlestickSeriesRef.current = null;
        volumeSeriesRef.current = null;
        technicalSeriesRef.current.clear();
      } catch (error) {
        console.warn("圖表清理時出現警告:", error);
      }
    };
  }, [
    chartData,
    technicalChartData,
    showVolume,
    theme,
    height,
    isFullscreen,
    timeframe,
    technicalIndicators,
    data,
  ]);

  // 響應式處理
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        try {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: isFullscreen ? window.innerHeight - 180 : height,
          });
        } catch (error) {
          console.error("圖表大小調整失敗:", error);
        }
      }
    };

    if (isFullscreen) {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isFullscreen, height]);

  // 指標控制函數
  const toggleIndicator = useCallback(
    (indicatorKey: keyof TechnicalIndicatorData) => {
      setTechnicalIndicators((prev) =>
        prev.map((indicator) =>
          indicator.key === indicatorKey
            ? { ...indicator, enabled: !indicator.enabled }
            : indicator
        )
      );
    },
    []
  );

  const applyPreset = useCallback((presetName: string) => {
    const presetMappings: Record<string, string[]> = {
      基礎分析: ["ma5", "ma10", "ma20"],
      短線交易: ["ma5", "ma10", "rsi_14", "k_value", "d_value"],
      趨勢分析: [
        "ma20",
        "ma60",
        "macd",
        "dif",
        "bb_upper",
        "bb_middle",
        "bb_lower",
      ],
      全面分析: ["ma5", "ma10", "ma20", "rsi_14", "macd", "k_value", "d_value"],
    };

    const enabledKeys = presetMappings[presetName] || [];

    setTechnicalIndicators((prev) =>
      prev.map((ind) => ({
        ...ind,
        enabled: enabledKeys.includes(ind.key),
      }))
    );
  }, []);

  const clearAllIndicators = useCallback(() => {
    setTechnicalIndicators((prev) =>
      prev.map((ind) => ({ ...ind, enabled: false }))
    );
  }, []);

  // 工具函數
  const formatDateRange = (dataArr: { date: string }[]) => {
    if (!dataArr || dataArr.length === 0) return "--";
    const format = (d: { date: string }) => {
      if (!d) return "--";
      const date = new Date(d.date);
      if (isNaN(date.getTime())) return "--";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      if (timeframe === "1d") {
        return `${year}-${month}-${day}`;
      } else {
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hour}:${minute}`;
      }
    };
    return `${format(dataArr[0])} ~ ${format(dataArr[dataArr.length - 1])}`;
  };

  const formatCandleDate = (dateStr: string, timeframe: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    if (timeframe === "1d") {
      return `${year}-${month}-${day}`;
    } else {
      const hour = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${year}-${month}-${day} ${hour}:${min}`;
    }
  };

  // 錯誤狀態渲染
  if (dataErrors.length > 0) {
    return (
      <div
        className={`relative bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden ${
          isFullscreen ? "fixed inset-0 z-9999 m-0 rounded-none shadow-lg" : ""
        }`}
      >
        <div
          className="flex items-center justify-center p-8"
          style={{ height: `${height}px` }}
        >
          <div className="text-center max-w-md">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              圖表數據錯誤
            </h3>
            <div className="text-sm text-red-600 mb-4">
              {dataErrors.map((error, index) => (
                <div key={index} className="mb-1">
                  • {error}
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setDataErrors([]);
                setDataWarnings([]);
                // 觸發重新渲染
                setTechnicalIndicators((prev) => [...prev]);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              重試
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 空狀態
  if (!chartData) {
    return (
      <div
        className="flex items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">
            暫無圖表數據
          </h3>
          <p className="text-sm text-gray-500">請提供有效的價格數據</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-9999 m-0 rounded-none shadow-lg" : ""
      }`}
    >
      {/* 數據警告提示 - 修改顯示邏輯 */}
      {dataWarnings.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 shrink-0" />
            <div className="text-xs text-yellow-700">
              <span className="font-medium">數據品質提醒:</span>
              發現 {dataWarnings.length} 個需要注意的數據問題。
              <button
                onClick={() => setShowWarningDetails(!showWarningDetails)}
                className="ml-2 underline hover:no-underline"
              >
                {showWarningDetails ? "隱藏" : "查看"}詳情
              </button>
              {showWarningDetails && (
                <div className="mt-2 max-h-24 overflow-y-auto text-xs bg-yellow-100 p-2 rounded">
                  {dataWarnings.slice(0, 8).map((warning, index) => (
                    <div key={index} className="mb-1 leading-relaxed">
                      • {warning}
                    </div>
                  ))}
                  {dataWarnings.length > 8 && (
                    <div className="font-medium text-yellow-800">
                      ... 及其他 {dataWarnings.length - 8} 個問題
                    </div>
                  )}
                  <div className="mt-2 pt-2 border-t border-yellow-200 text-yellow-600">
                    <strong>說明:</strong>{" "}
                    OHLC價格邏輯錯誤已自動修正，不會影響圖表顯示
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 頂部工具欄 */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
            <span className="text-sm text-gray-500">
              {timeframe === "1d" ? "日線" : "小時線"} • {data.length} 筆數據 •{" "}
              {formatDateRange(data)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowIndicators(!showIndicators)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                showIndicators
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              技術指標設定
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title={isFullscreen ? "退出全屏" : "進入全屏"}
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="h-4 w-4" />
              ) : (
                <ArrowsPointingOutIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 技術指標面板 */}
      <AnimatePresence>
        {showIndicators && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-gray-200 bg-white"
          >
            <div className="p-4">
              {/* 快速設定 */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    快速設定:
                  </span>
                  {["基礎分析", "短線交易", "趨勢分析", "全面分析"].map(
                    (preset) => (
                      <button
                        key={preset}
                        onClick={() => applyPreset(preset)}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      >
                        {preset}
                      </button>
                    )
                  )}
                  <button
                    onClick={clearAllIndicators}
                    className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                  >
                    全部關閉
                  </button>
                </div>
              </div>

              {/* 類別選擇 */}
              <div className="mb-4">
                <div className="flex gap-2">
                  {Object.keys(groupedIndicators).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        selectedCategory === category
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* 指標列表 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {groupedIndicators[selectedCategory]?.map((indicator) => (
                  <label
                    key={indicator.key}
                    className={`flex flex-col items-start p-3 rounded-md border cursor-pointer transition-colors ${
                      indicator.enabled
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={indicator.enabled}
                        onChange={() => toggleIndicator(indicator.key)}
                        className="sr-only"
                      />
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: indicator.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {indicator.name}
                      </span>
                    </div>
                    {indicator.description && (
                      <span className="mt-1 text-xs text-gray-500">
                        {indicator.description}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 圖表區域 */}
      <div className="p-4 relative">
        {/* 懸停信息 */}
        {hoveredCandle && hoveredPosition && (
          <div
            className="absolute z-10 bg-white/95 border border-gray-200 rounded shadow-lg px-4 py-2 text-xs text-gray-800 pointer-events-none min-w-[140px] backdrop-blur-sm"
            style={{
              left: `calc(${hoveredPosition.x}px + 24px)`,
              top: `calc(${hoveredPosition.y}px + 12px)`,
              maxWidth: "220px",
            }}
          >
            <div>日期: {formatCandleDate(hoveredCandle.date, timeframe)}</div>
            <div>開盤: {hoveredCandle.open}</div>
            <div>最高: {hoveredCandle.high}</div>
            <div>最低: {hoveredCandle.low}</div>
            <div>收盤: {hoveredCandle.close}</div>
            {hoveredCandle.volume !== undefined && (
              <div>成交量: {hoveredCandle.volume.toLocaleString()}</div>
            )}

            {/* 技術指標資訊 */}
            {technicalData &&
              technicalIndicators.filter((ind) => ind.enabled).length > 0 && (
                <div className="mt-2 border-t pt-1 border-gray-200">
                  <div className="font-semibold text-gray-700 mb-1">
                    技術指標
                  </div>
                  {(() => {
                    const idx = data.findIndex(
                      (d) => d.date === hoveredCandle.date
                    );
                    return technicalIndicators
                      .filter((ind) => ind.enabled)
                      .slice(0, 5) // 限制顯示數量
                      .map((ind) => {
                        const valArr = technicalData[ind.key];
                        const indicatorIdx =
                          idx - (data.length - (valArr?.length ?? 0));
                        const val =
                          indicatorIdx >= 0 && valArr
                            ? valArr[indicatorIdx]
                            : undefined;
                        return (
                          <div
                            key={ind.key}
                            className="flex items-center gap-1"
                          >
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ background: ind.color }}
                            />
                            <span>{ind.name}:</span>
                            <span>
                              {val !== undefined
                                ? Number(val).toFixed(2)
                                : "--"}
                            </span>
                          </div>
                        );
                      });
                  })()}
                </div>
              )}
          </div>
        )}

        {/* 圖表容器 */}
        <div
          ref={chartContainerRef}
          style={{
            height: isFullscreen ? "calc(100vh - 150px)" : `${height}px`,
            width: "100%",
          }}
          className="bg-white rounded border border-gray-100"
        />
      </div>

      {/* 底部狀態欄 */}
      <div className="bg-gray-50 px-6 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            數據點: {chartData?.candleData.length || 0} | 成交量:{" "}
            {chartData?.volumeData.length || 0} | 週期:{" "}
            {timeframe === "1d" ? "日線" : "小時線"}
            {dataWarnings.length > 0 && ` | 警告: ${dataWarnings.length} 個`}
          </span>
          <div className="text-center text-[12px] select-none">
            Charting By TradingView Lightweight Charts
          </div>
          {technicalIndicators.filter((ind) => ind.enabled).length > 0 && (
            <span>
              啟用指標:{" "}
              {technicalIndicators.filter((ind) => ind.enabled).length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandlestickChart;
