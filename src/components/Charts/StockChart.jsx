import React, { useMemo } from "react";
import { Line, Bar, Area } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  AreaElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockChart = ({ data, type = "line", showForecast = false, title }) => {
  // 確保 data 是一個有效的數組
  const validData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const chartData = useMemo(() => {
    // 如果數據包含預測數據，區分歷史與預測數據
    if (showForecast) {
      const historicalData = validData.filter((d) => !d.isForecast);
      const forecastData = validData.filter((d) => d.isForecast);

      return {
        labels: validData.map((d) => d.date),
        datasets: [
          {
            label: "歷史數據",
            data: historicalData.map((d) => d.price),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointBorderColor: "#fff",
            borderWidth: 2,
            tension: 0.3,
            fill: type === "area",
            segment: {
              borderColor: (ctx) => {
                if (ctx.p1.parsed.x >= historicalData.length - 1) {
                  return "rgba(59, 130, 246, 0.3)";
                }
                return "rgb(59, 130, 246)";
              },
            },
            spanGaps: true,
          },
          {
            label: "預測數據",
            data: [
              ...Array(historicalData.length).fill(null),
              ...forecastData.map((d) => d.price),
            ],
            borderColor: "rgb(99, 102, 241)",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            borderDash: [5, 5],
            borderWidth: 2,
            pointBackgroundColor: "rgb(99, 102, 241)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.3,
            fill: type === "area",
          },
        ],
      };
    }

    // 基本圖表數據
    return {
      labels: validData.map((d) => d.date),
      datasets: [
        {
          label: title || "價格",
          data: validData.map((d) => d.price),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor:
            type === "bar"
              ? "rgba(59, 130, 246, 0.5)"
              : "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          tension: 0.3,
          fill: type === "area",
        },
        validData[0]?.volume
          ? {
              label: "成交量",
              data: validData.map((d) => d.volume / 10), // 縮放成交量以適應同一個圖表
              type: "bar",
              backgroundColor: "rgba(156, 163, 175, 0.3)",
              borderColor: "rgba(156, 163, 175, 0.5)",
              borderWidth: 1,
              yAxisID: "y1",
            }
          : null,
      ].filter(Boolean),
    };
  }, [validData, type, showForecast, title]);

  const chartOptions = useMemo(() => {
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
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
              }
              return label;
            },
          },
        },
        legend: {
          position: "top",
          display: showForecast,
          labels: {
            usePointStyle: true,
            boxWidth: 6,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            display: !showForecast,
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6,
          },
        },
        y: {
          grid: {
            drawBorder: false,
          },
          ticks: {
            display: !showForecast,
          },
          beginAtZero: false,
        },
        y1: validData[0]?.volume
          ? {
              position: "right",
              grid: {
                display: false,
              },
              ticks: {
                display: !showForecast,
              },
            }
          : undefined,
      },
      elements: {
        point: {
          radius: showForecast ? 0 : 2,
          hoverRadius: 4,
        },
      },
    };
  }, [validData, showForecast]);

  const renderChart = () => {
    switch (type) {
      case "bar":
        return <Bar data={chartData} options={chartOptions} />;
      case "area":
        return <Line data={chartData} options={chartOptions} />;
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  };

  return <div className="w-full h-full">{renderChart()}</div>;
};

export default StockChart;
