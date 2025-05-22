import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// 註冊 ChartJS 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface SectorData {
  name: string;
  performance: number; // 表現百分比
  color?: string; // 可選的自定義顏色
}

interface SectorPerformanceChartProps {
  sectors: SectorData[];
}

const SectorPerformanceChart: React.FC<SectorPerformanceChartProps> = ({
  sectors,
}) => {
  // 確保數據已排序
  const sortedSectors = [...sectors].sort(
    (a, b) => b.performance - a.performance
  );

  // 為每個產業分配顏色
  const getBarColor = (performance: number, customColor?: string) => {
    if (customColor) return customColor;
    return performance >= 0
      ? "rgba(16, 185, 129, 0.8)"
      : "rgba(239, 68, 68, 0.8)";
  };

  const chartData = {
    labels: sortedSectors.map((sector) => sector.name),
    datasets: [
      {
        label: "表現 (%)",
        data: sortedSectors.map((sector) => sector.performance),
        backgroundColor: sortedSectors.map((sector) =>
          getBarColor(sector.performance, sector.color)
        ),
        borderColor: sortedSectors.map((sector) =>
          sector.performance >= 0
            ? "rgba(16, 185, 129, 1)"
            : "rgba(239, 68, 68, 1)"
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.x !== null) {
              label += context.parsed.x.toFixed(2) + "%";
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function (value: any) {
            return value + "%";
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      {sectors.length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          暫無產業數據
        </div>
      )}
    </div>
  );
};

export default SectorPerformanceChart;
