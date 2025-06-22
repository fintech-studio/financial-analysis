import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData as LightweightCandlestickData,
  HistogramData,
  LineData,
  ColorType,
} from "lightweight-charts";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
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
  overlay?: boolean; // 是否疊加在主圖上
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

  // 優化的技術指標配置 - 使用 useMemo 避免重複創建
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

  // 優化的按類別分組指標
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

  // 優化的數據格式轉換
  const chartData = useMemo(() => {
    if (!data?.length) return null;

    try {
      const candleData: LightweightCandlestickData[] = data
        .map((item) => ({
          time: Math.floor(new Date(item.date).getTime() / 1000) as any,
          open: Number(item.open) || 0,
          high: Number(item.high) || 0,
          low: Number(item.low) || 0,
          close: Number(item.close) || 0,
        }))
        .filter(
          (item) =>
            item.open > 0 && item.high > 0 && item.low > 0 && item.close > 0
        );

      const volumeData: HistogramData[] = data
        .filter((item) => item.volume && Number(item.volume) > 0)
        .map((item) => ({
          time: Math.floor(new Date(item.date).getTime() / 1000) as any,
          value: Number(item.volume),
          color: item.close >= item.open ? "#ef444460" : "#10b98160", // 上漲紅色，下跌綠色
        }));

      return { candleData, volumeData };
    } catch (error) {
      console.error("Chart data conversion error:", error);
      return null;
    }
  }, [data]);
  // 優化的技術指標數據處理 - 修復時間對齊問題
  const technicalChartData = useMemo(() => {
    if (!technicalData || !data?.length) {
      return { overlay: {}, separate: {} };
    }

    const overlayData: Record<string, LineData[]> = {};
    const separateData: Record<string, LineData[]> = {};

    const enabledIndicators = technicalIndicators.filter((ind) => ind.enabled);
    enabledIndicators.forEach((indicator) => {
      const indicatorValues = technicalData[indicator.key];
      if (!indicatorValues?.length) {
        console.warn(`No data found for indicator: ${indicator.key}`);
        return;
      }

      console.log(
        `Processing indicator: ${indicator.key}, values length: ${indicatorValues.length}, data length: ${data.length}`
      );

      try {
        const lineData: LineData[] = []; // 關鍵修復：現在 candlestickData 已經是正確的時間順序（最舊到最新）
        // technicalData 中的數據也對應相同的順序
        // 所以 indicatorValues[i] 直接對應 data[i]

        const dataLength = data.length;
        const indicatorLength = indicatorValues.length;

        // 處理技術指標數據，確保時間對齊
        for (let i = 0; i < Math.min(dataLength, indicatorLength); i++) {
          const value = indicatorValues[i]; // 對應 data[i]
          const dateItem = data[i]; // 現在是直接對應的

          // 只有當值不為 null 且有效時才添加數據點
          if (
            value != null &&
            !isNaN(Number(value)) &&
            dateItem &&
            dateItem.date
          ) {
            const timeValue = Math.floor(
              new Date(dateItem.date).getTime() / 1000
            ) as any;

            lineData.push({
              time: timeValue,
              value: Number(value),
            });
          }
        }

        // 按時間排序，確保圖表正確顯示
        lineData.sort((a, b) => (a.time as number) - (b.time as number)); // 只有當有有效數據時才添加到圖表
        if (lineData.length > 0) {
          if (indicator.overlay) {
            overlayData[indicator.key] = lineData;
            console.log(
              `Added overlay indicator: ${indicator.key}, data points: ${lineData.length}`
            );
          } else {
            separateData[indicator.key] = lineData;
            console.log(
              `Added separate indicator: ${indicator.key}, data points: ${lineData.length}`
            );
          }
        } else {
          console.warn(`No valid data points for indicator: ${indicator.key}`);
        }
      } catch (error) {
        console.error(`Error processing indicator ${indicator.key}:`, error);
      }
    });

    return { overlay: overlayData, separate: separateData };
  }, [technicalData, data, technicalIndicators]);

  // 優化的統計數據計算
  const stats = useMemo(() => {
    if (!data?.length) return null;

    try {
      const latest = data[data.length - 1];
      const previous = data.length > 1 ? data[data.length - 2] : latest;
      const change = Number(latest.close) - Number(previous.close);
      const changePercent = (change / Number(previous.close)) * 100;

      return {
        latest,
        change,
        changePercent,
        isRising: change >= 0,
        high: Math.max(...data.map((d) => Number(d.high))),
        low: Math.min(...data.map((d) => Number(d.low))),
      };
    } catch (error) {
      console.error("Stats calculation error:", error);
      return null;
    }
  }, [data]);

  // 優化的圖表初始化
  useEffect(() => {
    if (!chartContainerRef.current || !chartData) return;

    const isDark = theme === "dark";

    try {
      // 清理舊圖表
      if (chartRef.current) {
        chartRef.current.remove();
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
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: "#ef4444", // 上漲紅色
        downColor: "#10b981", // 下跌綠色
        borderUpColor: "#dc2626", // 上漲紅色
        borderDownColor: "#059669", // 下跌綠色
        wickUpColor: "#dc2626", // 上漲紅色
        wickDownColor: "#059669", // 下跌綠色
        priceLineVisible: true,
        lastValueVisible: true,
      });

      candlestickSeriesRef.current = candlestickSeries;
      candlestickSeries.setData(chartData.candleData);

      // 添加成交量
      if (showVolume && chartData.volumeData.length > 0) {
        const volumeSeries = chart.addHistogramSeries({
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
      }

      // 添加主圖疊加的技術指標線
      const overlayIndicators = Object.keys(technicalChartData.overlay);
      if (overlayIndicators.length > 0) {
        const seriesMap = new Map<string, ISeriesApi<"Line">>();

        overlayIndicators.forEach((key) => {
          const data = technicalChartData.overlay[key];
          const indicator = technicalIndicators.find((ind) => ind.key === key);

          if (indicator && data && data.length > 0) {
            console.log(
              `Creating overlay series for ${indicator.name} with ${data.length} data points`
            );

            const lineSeries = chart.addLineSeries({
              color: indicator.color,
              lineWidth: (indicator.lineWidth || 2) as any,
              title: indicator.name,
              priceLineVisible: false,
              lastValueVisible: true,
              crosshairMarkerVisible: true,
              crosshairMarkerRadius: 4,
            });

            try {
              lineSeries.setData(data);
              seriesMap.set(key, lineSeries);
              console.log(
                `Successfully added overlay indicator: ${indicator.name}`
              );
            } catch (error) {
              console.error(
                `Error setting data for overlay indicator ${indicator.name}:`,
                error
              );
            }
          }
        });

        technicalSeriesRef.current = seriesMap;
      }

      // 添加獨立的技術指標圖表 (RSI, MACD 等)
      const separateIndicators = Object.keys(technicalChartData.separate);
      if (separateIndicators.length > 0) {
        // 這裡暫時只在主圖上顯示，後續可以擴展為獨立的子圖表
        separateIndicators.forEach((key) => {
          const data = technicalChartData.separate[key];
          const indicator = technicalIndicators.find((ind) => ind.key === key);

          if (indicator && data && data.length > 0) {
            console.log(
              `Creating separate indicator series for ${indicator.name} with ${data.length} data points`
            );

            // 為獨立指標創建單獨的價格刻度
            const priceScaleId = `indicator_${key}`;

            const lineSeries = chart.addLineSeries({
              color: indicator.color,
              lineWidth: (indicator.lineWidth || 2) as any,
              title: indicator.name,
              priceLineVisible: false,
              lastValueVisible: true,
              crosshairMarkerVisible: true,
              crosshairMarkerRadius: 4,
              priceScaleId: priceScaleId,
            });

            // 配置獨立的價格刻度
            chart.priceScale(priceScaleId).applyOptions({
              scaleMargins: {
                top: 0.7,
                bottom: 0.1,
              },
              borderVisible: false,
            });

            try {
              lineSeries.setData(data);
              // 將獨立指標也存儲在技術指標系列中
              if (!technicalSeriesRef.current) {
                technicalSeriesRef.current = new Map();
              }
              technicalSeriesRef.current.set(key, lineSeries);
              console.log(
                `Successfully added separate indicator: ${indicator.name}`
              );
            } catch (error) {
              console.error(
                `Error setting data for separate indicator ${indicator.name}:`,
                error
              );
            }
          }
        });
      }

      // 自動調整視圖
      chart.timeScale().fitContent();

      console.log(
        `Chart initialized with ${overlayIndicators.length} overlay and ${separateIndicators.length} separate indicators`
      );
    } catch (error) {
      console.error("Chart initialization error:", error);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
      technicalSeriesRef.current.clear();
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
  ]);

  // 優化的視窗大小處理
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: isFullscreen ? window.innerHeight - 180 : height,
        });
      }
    };

    if (isFullscreen) {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isFullscreen, height]);

  // 優化的指標切換函數
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

  // 優化的預設指標組合
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

  // 添加全部關閉功能
  const clearAllIndicators = useCallback(() => {
    setTechnicalIndicators((prev) =>
      prev.map((ind) => ({ ...ind, enabled: false }))
    );
  }, []);

  // 空狀態優化
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
        isFullscreen ? "fixed inset-0 z-[9999] m-0 rounded-none shadow-lg" : ""
      }`}
    >
      {/* 簡約頂部工具欄 */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <span className="text-sm text-gray-500">
              {timeframe === "1d" ? "日線" : "小時線"} • {data.length} 筆數據
            </span>

            {/* 價格統計 */}
            {stats && (
              <div className="hidden lg:flex items-center space-x-4 text-sm">
                <span className="text-gray-600">
                  最新價格:{" "}
                  <strong
                    className={`${
                      stats.isRising ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {Number(stats.latest.close).toFixed(2)}
                  </strong>
                </span>
                <span
                  className={`font-medium ${
                    stats.isRising ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {stats.change > 0 ? "+" : ""}
                  {stats.change.toFixed(2)} (
                  {stats.changePercent > 0 ? "+" : ""}
                  {stats.changePercent.toFixed(2)}%)
                </span>
              </div>
            )}
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

      {/* 簡化技術指標面板 */}
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
      <div className="p-4">
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
            數據點: {data.length} | 週期:{" "}
            {timeframe === "1d" ? "日線" : "小時線"}
          </span>
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
