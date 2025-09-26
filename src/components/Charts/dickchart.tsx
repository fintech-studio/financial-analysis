import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  LineSeries,
  IChartApi,
  ISeriesApi,
  LineData,
  ColorType,
} from "lightweight-charts";
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

interface LineChartData {
  date: string;
  value: number;
  predictValue?: number; // 新增預測值字段
}

interface LineChartProps {
  data: LineChartData[];
  title?: string;
  height?: number;
  theme?: "light" | "dark";
  timeframe?: "1d" | "1h";
  showBothLines?: boolean; // 新增雙線顯示控制
}

const CombinedChart: React.FC<LineChartProps> = ({
  data,
  title = "趨勢圖",
  height = 500,
  theme = "light",
  showBothLines = false,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const predictSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredData, setHoveredData] = useState<LineChartData | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  
  const [showMean, setShowMean] = useState(true);

  useEffect(() => {
    console.log("Chart initialization - data:", data?.length);
    
    if (!chartContainerRef.current) {
      console.error("Chart container is null");
      return;
    }
    
    if (!data?.length) {
      console.error("No data provided");
      return;
    }

    const isDark = theme === "dark";

    try {
      // 清理舊圖表
      if (chartRef.current) {
        console.log("Removing old chart");
        chartRef.current.remove();
        chartRef.current = null;
      }

      console.log("Creating chart with container width:", chartContainerRef.current.clientWidth);
      
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: {
            type: ColorType.Solid,
            color: isDark ? "#1f2937" : "#ffffff",
          },
          textColor: isDark ? "#e5e7eb" : "#374151",
        },
        width: chartContainerRef.current.clientWidth || 800,
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
        },
        timeScale: {
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(0, 0, 0, 0.2)",
          timeVisible: true,
          secondsVisible: false,
        },
        localization: { locale: "zh-TW" },
      });

      chartRef.current = chart;
      console.log("Chart created successfully");

      // 準備主線數據和預測線數據
      const lineData: LineData[] = [];
      const predictData: LineData[] = [];

      data.forEach((item, index) => {
        // 修改時間處理邏輯以支持小時級別
        const timeValue = item.date.includes('T') 
          ? Math.floor(new Date(item.date).getTime() / 1000) // 轉換為 Unix 時間戳
          : item.date.split('T')[0];
        
        console.log(`Processing data point ${index}:`, {
          date: item.date,
          timeValue,
          value: item.value,
          predictValue: item.predictValue,
        });

        // 主線數據（真實值）
        if (item.value != null && !isNaN(Number(item.value))) {
          lineData.push({
            time: timeValue as import("lightweight-charts").Time,
            value: Number(item.value),
          });
        }

        // 預測線數據
        if (showBothLines && item.predictValue != null && !isNaN(Number(item.predictValue))) {
          predictData.push({
            time: timeValue as import("lightweight-charts").Time,
            value: Number(item.predictValue),
          });
        }
      });

      console.log("Processed data:", {
        lineData: lineData.length,
        predictData: predictData.length,
      });

      // 添加主線（真實值）
      if (showMean && lineData.length > 0) {
        const lineSeries = chart.addSeries(LineSeries, {
          color: "#3b82f6",
          lineWidth: 3,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 6,
        });

        console.log("Setting main line data:", lineData.length, "points");
        lineSeries.setData(lineData);
        lineSeriesRef.current = lineSeries;
      }

      // 添加預測線（評估模式）
      if (showBothLines && predictData.length > 0) {
        const predictSeries = chart.addSeries(LineSeries, {
          color: "#10b981",
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          lineStyle: 2, // 虛線樣式
        });

        console.log("Setting predict line data:", predictData.length, "points");
        predictSeries.setData(predictData);
        predictSeriesRef.current = predictSeries;
      }

      // 設置十字線事件
      chart.subscribeCrosshairMove((param) => {
        if (param && param.time && param.point) {
          const timeStr = param.time.toString();
          const dataPoint = data.find((d) => {
            const itemTime = d.date.includes('T') 
              ? Math.floor(new Date(d.date).getTime() / 1000).toString()
              : d.date.split('T')[0];
            return itemTime === timeStr;
          });
          
          if (dataPoint) {
            setHoveredData(dataPoint);
            setHoveredPosition({ x: param.point.x, y: param.point.y });
          } else {
            setHoveredData(null);
            setHoveredPosition(null);
          }
        } else {
          setHoveredData(null);
          setHoveredPosition(null);
        }
      });

      // 適配內容
      chart.timeScale().fitContent();
      console.log("Chart initialization completed successfully");

    } catch (error) {
      console.error("Chart initialization error:", error);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      lineSeriesRef.current = null;
      predictSeriesRef.current = null;
    };
  }, [data, theme, height, isFullscreen, showMean, showBothLines]);

  // 處理視窗大小變化
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

  // 全螢幕時滾動到頂部
  useEffect(() => {
    if (isFullscreen) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isFullscreen]);

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    // 統一格式化邏輯，支持 LineChart 的日期顯示需求
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    
    // 如果只是日期，不顯示時間
    if (hour === '00' && minute === '00') {
      return `${year}/${month}/${day}`;
    }
    
    return `${year}/${month}/${day} ${hour}:${minute}`;
  };

  // 格式化日期範圍顯示
  const formatDateRange = () => {
    if (!data?.length) return "--";
    const startDate = formatDate(data[0].date);
    const endDate = formatDate(data[data.length - 1].date);
    return `${startDate} ~ ${endDate}`;
  };

  // 調試信息
  console.log("Render - data length:", data?.length, "chart ref exists:", !!chartRef.current);

  // 空狀態
  if (!data?.length) {
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
          <p className="text-sm text-gray-500">請提供有效的預測數據</p>
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
      {/* 頂部工具欄 */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <span className="text-sm text-gray-500">
              {data.length} 個預測點 • {formatDateRange()}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* 線條顯示控制 */}
            <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <button
                onClick={() => setShowMean(!showMean)}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                  showMean ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {showMean ? <EyeIcon className="h-3 w-3" /> : <EyeSlashIcon className="h-3 w-3" />}
                <span>預測值</span>
              </button>
            </div>

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

      {/* 圖表區域 */}
      <div className="p-4 relative">
        {hoveredData && hoveredPosition && (
          <div
            className="absolute z-10 bg-white/95 border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-800 pointer-events-none"
            style={{
              left: `calc(${hoveredPosition.x}px + 20px)`,
              top: `calc(${hoveredPosition.y}px - 10px)`,
              minWidth: "180px",
            }}
          >
            <div className="font-medium text-gray-900 mb-2">
              {formatDate(hoveredData.date)}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{showBothLines ? "真實值:" : "預測值:"}</span>
                <span className="font-medium text-blue-600">
                  {hoveredData.value.toFixed(4)}
                </span>
              </div>
              {showBothLines && hoveredData.predictValue !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">預測值:</span>
                  <span className="font-medium text-green-600">
                    {hoveredData.predictValue.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div
          ref={chartContainerRef}
          style={{
            height: isFullscreen ? "calc(100vh - 150px)" : `${height}px`,
            width: "100%",
            minHeight: "400px",
          }}
          className="bg-white rounded border border-gray-100"
        />
      </div>

      {/* 底部狀態欄 */}
      <div className="bg-gray-50 px-6 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>預測點數: {data.length}</span>
          <div className="flex items-center space-x-4">
            {showMean && (
              <span className="flex items-center">
                <span className="w-3 h-0.5 bg-blue-600 mr-1"></span>
                {showBothLines ? "真實值" : "預測值"}
              </span>
            )}
            {showBothLines && (
              <span className="flex items-center">
                <span className="w-3 h-0.5 bg-green-600 mr-1"></span>
                預測值
              </span>
            )}
          </div>
          <div className="text-center text-[12px] select-none">
            Powered by TradingView Lightweight Charts
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedChart;