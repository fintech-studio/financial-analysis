import React, { useMemo, useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

// 註冊 Chart.js 元件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CombinedPriceVolumeChart = ({
  historyData,
  coin = "BTC",
  timeRange = "長期趨勢",
  timeframe = "1m",
}) => {
  const [hoverData, setHoverData] = useState(null);
  const [updateTime, setUpdateTime] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // 客戶端渲染時才設置時間，並標記元件已掛載
  useEffect(() => {
    setIsMounted(true);
    setUpdateTime(new Date().toLocaleString("zh-TW"));
  }, []);

  // 根據時間範圍取得對應的顯示標題
  const timeframeTitle = useMemo(() => {
    const titles = {
      "1w": "週度趨勢",
      "1m": "月度趨勢",
      ytd: "年初至今表現",
    };
    return titles[timeframe] || timeRange;
  }, [timeframe, timeRange]);

  // 處理圖表數據
  const chartData = useMemo(() => {
    // 從historyData中取得需要的數據
    let { labels, btcPrice, volume, priceChange } = historyData;

    // 根據不同的時間範圍選擇適當的數據點數量
    if (timeframe === "1w") {
      // 僅顯示最近7天的數據
      const dataPoints = Math.min(7, labels.length);
      labels = labels.slice(-dataPoints);
      btcPrice = btcPrice.slice(-dataPoints);
      volume = volume.slice(-dataPoints);
      if (priceChange) priceChange = priceChange.slice(-dataPoints);
    } else if (timeframe === "1m") {
      // 僅顯示最近30天的數據
      const dataPoints = Math.min(30, labels.length);
      labels = labels.slice(-dataPoints);
      btcPrice = btcPrice.slice(-dataPoints);
      volume = volume.slice(-dataPoints);
      if (priceChange) priceChange = priceChange.slice(-dataPoints);
    }
    // ytd 使用完整數據集，或針對年初至今進行特殊處理

    // 計算價格變化百分比
    const firstPrice = btcPrice[0];
    const lastPrice = btcPrice[btcPrice.length - 1];
    const priceChangeValue = lastPrice - firstPrice;
    const percentChange = ((priceChangeValue / firstPrice) * 100).toFixed(2);

    // 儲存計算結果供後續使用
    setHoverData({
      currentPrice: lastPrice,
      priceChange: priceChangeValue,
      percentChange: percentChange,
      isPositive: priceChangeValue >= 0,
    });

    // 計算成交量的顏色
    const volumeColors = volume.map((_, i) => {
      if (priceChange) {
        return priceChange[i] > 0
          ? "rgba(52, 211, 153, 0.85)" // 上漲成交量 - 綠色
          : "rgba(244, 63, 94, 0.85)"; // 下跌成交量 - 紅色
      } else {
        return i === 0 || btcPrice[i] >= btcPrice[i - 1]
          ? "rgba(52, 211, 153, 0.85)"
          : "rgba(244, 63, 94, 0.85)";
      }
    });

    const lineColor = "rgb(59, 130, 246)";
    const areaColor = "rgba(59, 130, 246, 0.15)";

    return {
      labels,
      datasets: [
        {
          type: "bar",
          label: "成交量",
          data: volume,
          backgroundColor: volumeColors,
          yAxisID: "y-volume",
          order: 2,
          barPercentage: 0.9,
          categoryPercentage: 0.95,
        },
        {
          type: "line",
          label: "價格",
          data: btcPrice,
          borderColor: lineColor,
          backgroundColor: areaColor,
          borderWidth: 2.5,
          fill: true,
          tension: 0.25,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: lineColor,
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 2,
          yAxisID: "y-price",
          order: 1,
          z: 10,
        },
      ],
    };
  }, [historyData, timeframe]);

  // 根據時間範圍調整圖表選項
  const options = useMemo(() => {
    // 根據時間範圍設定適當的X軸刻度數量
    const ticksConfig = {
      "1w": { maxTicksLimit: 7, maxRotation: 0 },
      "1m": { maxTicksLimit: 10, maxRotation: 0 },
      ytd: { maxTicksLimit: 12, maxRotation: 30 },
    };

    const { maxTicksLimit = 12, maxRotation = 0 } =
      ticksConfig[timeframe] || {};

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          titleColor: "#0f172a",
          bodyColor: "#334155",
          borderColor: "#e2e8f0",
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)",
          boxPadding: 6,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) label += ": ";

              if (context.datasetIndex === 1) {
                // 價格數據
                label += "$" + context.parsed.y.toLocaleString();
              } else {
                // 成交量數據
                label += context.parsed.y.toLocaleString() + "K";
              }
              return label;
            },
          },
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: true,
            color: "rgba(226, 232, 240, 0.6)",
            drawBorder: false,
            lineWidth: 0.5,
          },
          ticks: {
            color: "#64748b",
            font: {
              size: 11,
              weight: "500",
              family: "'Inter', sans-serif",
            },
            maxRotation,
            autoSkip: true,
            maxTicksLimit,
            padding: 8,
          },
          border: {
            color: "#e2e8f0",
            dash: [4, 4],
          },
        },
        "y-volume": {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "成交量 (K)",
            color: "#64748b",
            font: {
              size: 12,
              weight: "600",
              family: "'Inter', sans-serif",
            },
            padding: {
              bottom: 10,
            },
          },
          ticks: {
            color: "#64748b",
            font: {
              size: 11,
              weight: "500",
              family: "'Inter', sans-serif",
            },
            padding: 8,
            callback: function (value) {
              return value.toLocaleString();
            },
          },
          grid: {
            color: "rgba(226, 232, 240, 0.6)",
            drawBorder: false,
            lineWidth: 0.5,
          },
          border: {
            color: "#e2e8f0",
            dash: [4, 4],
          },
        },
        "y-price": {
          type: "linear",
          display: true,
          position: "right",
          title: {
            display: true,
            text: "價格 (USD)",
            color: "#64748b",
            font: {
              size: 12,
              weight: "600",
              family: "'Inter', sans-serif",
            },
            padding: {
              bottom: 10,
            },
          },
          ticks: {
            color: "#64748b",
            font: {
              size: 11,
              weight: "500",
              family: "'Inter', sans-serif",
            },
            padding: 8,
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
          grid: {
            display: false,
            drawBorder: false,
            lineWidth: 0.5,
          },
          border: {
            color: "#e2e8f0",
            dash: [4, 4],
          },
        },
      },
    };
  }, [timeframe]);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* 圖表頭部 */}
      <div className="p-5 bg-gradient-to-r from-slate-50 to-white border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {coin}/USD {timeframeTitle}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {timeframe === "ytd" ? "年初至今價格變化" : "歷史趨勢分析"}
            </p>
          </div>

          {hoverData && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-slate-50 rounded-lg px-4 py-2 border border-slate-100">
                <div className="text-xs text-gray-500">當前價格</div>
                <div className="text-lg font-bold text-slate-800">
                  ${hoverData.currentPrice?.toLocaleString() || "N/A"}
                </div>
              </div>

              {hoverData.priceChange && (
                <div
                  className={`flex items-center ${
                    hoverData.isPositive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {hoverData.isPositive ? (
                    <ArrowUpIcon className="h-5 w-5 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-5 w-5 mr-1" />
                  )}
                  <div>
                    <div className="font-semibold">
                      {hoverData.isPositive ? "+" : ""}$
                      {Math.abs(hoverData.priceChange).toLocaleString()}
                    </div>
                    <div className="text-xs">
                      {hoverData.isPositive ? "+" : ""}
                      {hoverData.percentChange}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 圖表內容 */}
      <div className="p-5">
        <div className="h-[400px]">
          <Chart type="bar" data={chartData} options={options} />
        </div>

        {/* 自定義圖例 */}
        <div className="mt-5 flex flex-wrap items-center justify-between border-t border-gray-200 pt-4">
          <div className="flex items-center flex-wrap gap-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 mr-2">
                <span className="bg-blue-500 w-3 h-1.5"></span>
              </div>
              <span className="text-sm text-gray-700 font-medium">
                價格走勢
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-green-50 mr-2">
                <span className="bg-emerald-500 w-3 h-3"></span>
              </div>
              <span className="text-sm text-gray-700 font-medium">
                上漲成交量
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-red-50 mr-2">
                <span className="bg-rose-500 w-3 h-3"></span>
              </div>
              <span className="text-sm text-gray-700 font-medium">
                下跌成交量
              </span>
            </div>
          </div>

          {/* 只在客戶端渲染時顯示時間 */}
          <div className="text-xs text-gray-500 font-medium mt-2 sm:mt-0">
            數據更新時間: {isMounted ? updateTime : "載入中..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedPriceVolumeChart;
