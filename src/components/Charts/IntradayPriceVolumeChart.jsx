import React, { useState, useEffect } from "react";
import { Chart } from "react-chartjs-2";
// 修改 Heroicons 導入方式，適應 v2 版本
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

const IntradayPriceVolumeChart = ({ intradayData }) => {
  const [hoverValue, setHoverValue] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const { labels, btcPrice, volume, priceChange } = intradayData;

  // 客戶端渲染時才設置時間
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString("zh-TW"));
  }, []);

  // 計算價格變化
  const priceChangeValue = btcPrice[btcPrice.length - 1] - btcPrice[0];
  const priceChangePercent = ((priceChangeValue / btcPrice[0]) * 100).toFixed(
    2
  );
  const isPriceUp = priceChangeValue >= 0;

  // 根據價格變化生成成交量顏色
  const volumeColors = volume.map((_, index) => {
    const isUp = priceChange
      ? priceChange[index] > 0
      : index > 0
      ? btcPrice[index] > btcPrice[index - 1]
      : true;
    return isUp ? "rgba(56, 178, 87, 0.85)" : "rgba(230, 78, 98, 0.85)";
  });

  const data = {
    labels,
    datasets: [
      {
        type: "bar",
        label: "成交量",
        data: volume,
        backgroundColor: volumeColors,
        yAxisID: "y-volume",
        order: 2,
        barPercentage: 0.85,
        categoryPercentage: 0.95,
      },
      {
        type: "line",
        label: "價格",
        data: btcPrice,
        // 將藍色改為橘色
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        borderWidth: 2.5,
        fill: true,
        tension: 0.25,
        pointRadius: 0,
        pointHoverRadius: 5,
        // 懸停點也改為對應的橘色
        pointHoverBackgroundColor: "rgb(59, 130, 246)",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
        yAxisID: "y-price",
        order: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    hover: {
      mode: "index",
      intersect: false,
      onHover: (event, elements) => {
        if (elements && elements.length > 0) {
          const dataIndex = elements[0].index;
          setHoverValue({
            price: btcPrice[dataIndex],
            volume: volume[dataIndex],
            label: labels[dataIndex],
          });
        } else {
          setHoverValue(null);
        }
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#334155",
        bodyColor: "#475569",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
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
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#64748b",
          font: {
            size: 11,
            weight: "500",
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
          padding: 8,
        },
        grid: {
          display: true,
          color: "rgba(203, 213, 225, 0.3)",
          drawBorder: false,
          lineWidth: 0.5,
        },
        border: {
          color: "rgba(203, 213, 225, 0.7)",
        },
      },
      "y-volume": {
        type: "linear",
        position: "left",
        beginAtZero: true,
        title: {
          display: true,
          text: "成交量 (K)",
          color: "#64748b",
          font: {
            size: 13,
            weight: "500",
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
          },
          padding: 8,
          callback: function (value) {
            return value.toLocaleString();
          },
        },
        grid: {
          color: "rgba(203, 213, 225, 0.3)",
          drawBorder: false,
          lineWidth: 0.5,
        },
        border: {
          color: "rgba(203, 213, 225, 0.7)",
        },
      },
      "y-price": {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "價格 (USD)",
          color: "#64748b",
          font: {
            size: 13,
            weight: "500",
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
          color: "rgba(203, 213, 225, 0.7)",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      {/* 圖表頭部信息 */}
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            BTC/USD 24小時價格走勢
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            展示最近交易日內的價格與成交量變化
          </p>
        </div>
        <div className="flex items-center bg-slate-50 rounded-lg px-4 py-2 border border-slate-100">
          <div className="mr-4">
            <div className="text-xs text-gray-500 mb-1">當前價格</div>
            <div className="text-lg font-bold text-slate-800">
              ${btcPrice[btcPrice.length - 1].toLocaleString()}
            </div>
          </div>
          <div
            className={`flex items-center ${
              isPriceUp ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {/* 使用 Heroicons v2 的圖標 */}
            {isPriceUp ? (
              <ArrowUpIcon className="h-5 w-5 mr-1" />
            ) : (
              <ArrowDownIcon className="h-5 w-5 mr-1" />
            )}
            <span className="font-semibold">
              {isPriceUp ? "+" : ""}$
              {Math.abs(priceChangeValue).toLocaleString()} (
              {isPriceUp ? "+" : ""}
              {priceChangePercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* 圖表主體 */}
      <div className="h-[400px]">
        <Chart type="bar" data={data} options={options} />
      </div>

      {/* 自定義圖例 */}
      <div className="mt-5 flex flex-wrap items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center flex-wrap gap-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 mr-2">
              <span className="bg-blue-500 w-3 h-1.5"></span>
            </div>
            <span className="text-sm text-gray-700 font-medium">價格變化</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-green-100 mr-2">
              <span className="bg-emerald-500 w-3 h-3"></span>
            </div>
            <span className="text-sm text-gray-700 font-medium">
              上漲成交量
            </span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-red-100 mr-2">
              <span className="bg-rose-500 w-3 h-3"></span>
            </div>
            <span className="text-sm text-gray-700 font-medium">
              下跌成交量
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500 font-medium mt-2 sm:mt-0">
          價格更新時間: {currentTime}
        </div>
      </div>
    </div>
  );
};

export default IntradayPriceVolumeChart;
