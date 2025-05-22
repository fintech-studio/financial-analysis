import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// 註冊 ChartJS 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HistoryData {
  date: string;
  value: number;
}

interface TrendChartProps {
  data: HistoryData[];
  timeRange: string; // '1d' | '1w' | '1m' | '3m' | '1y'
}

const TrendChart: React.FC<TrendChartProps> = ({ data, timeRange }) => {
  // 根據時間範圍過濾資料
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let filterDate = new Date();

    switch (timeRange) {
      case "1d":
        filterDate.setDate(now.getDate() - 1);
        break;
      case "1w":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "1m":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "3m":
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case "1y":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        filterDate.setDate(now.getDate() - 1);
    }

    return data.filter((item) => new Date(item.date) >= filterDate);
  }, [data, timeRange]);

  // 計算趨勢是正面還是負面
  const trend = useMemo(() => {
    if (filteredData.length <= 1) return 0;
    return filteredData[filteredData.length - 1].value - filteredData[0].value;
  }, [filteredData]);

  const chartData = {
    labels: filteredData.map((item) => {
      // 根據時間範圍調整日期顯示格式
      const date = new Date(item.date);
      if (timeRange === "1d") {
        return date.toLocaleTimeString("zh-tw", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (timeRange === "1w" || timeRange === "1m") {
        return date.toLocaleDateString("zh-tw", {
          month: "numeric",
          day: "numeric",
        });
      } else {
        return date.toLocaleDateString("zh-tw", {
          month: "numeric",
          day: "numeric",
        });
      }
    }),
    datasets: [
      {
        label: "指數值",
        data: filteredData.map((item) => item.value),
        borderColor:
          trend >= 0 ? "rgba(16, 185, 129, 1)" : "rgba(239, 68, 68, 1)",
        backgroundColor:
          trend >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString(
              "zh-tw"
            )}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
          font: {
            size: 10,
          },
        },
      },
      y: {
        position: "right" as const,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  return (
    <div className="w-full h-full">
      {filteredData.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          暫無資料
        </div>
      )}
    </div>
  );
};

export default TrendChart;
