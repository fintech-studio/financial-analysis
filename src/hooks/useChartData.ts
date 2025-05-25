// src/hooks/useChartData.ts
import { useState, useEffect } from "react";
import type { ChartData, TimeRange } from "@/types/prediction";

interface UseChartDataReturn {
  chartData: ChartData;
  chartOptions: any;
  trendDirection: string;
  trendPercent: string;
  isDataReady: boolean;
}

export const useChartData = (
  selectedStock: string,
  timeRange: TimeRange
): UseChartDataReturn => {
  const [chartHistoryData, setChartHistoryData] = useState<number[]>([]);
  const [predictionData, setPredictionData] = useState<number[]>([]);
  const [allLabels, setAllLabels] = useState<string[]>([]);
  const [trendDirection, setTrendDirection] = useState<string>("上漲");
  const [trendPercent, setTrendPercent] = useState<string>("0.00");
  const [yAxisMin, setYAxisMin] = useState<number | null>(null);
  const [yAxisMax, setYAxisMax] = useState<number | null>(null);

  const getPredictionPointsForTimeRange = (range: TimeRange): number => {
    const pointsMap: Record<TimeRange, number> = {
      "1D": 4,
      "1W": 3,
      "1M": 7,
      "3M": 14,
      "1Y": 8,
    };
    return pointsMap[range];
  };

  const getDataPointsForTimeRange = (range: TimeRange): number => {
    return getPredictionPointsForTimeRange(range) * 2;
  };

  useEffect(() => {
    const historyLength = getDataPointsForTimeRange(timeRange);
    const predictionLength = getPredictionPointsForTimeRange(timeRange);

    // 波動係數設定
    const volatilityFactors: Record<TimeRange, number> = {
      "1D": 0.2,
      "1W": 0.5,
      "1M": 1.0,
      "3M": 1.5,
      "1Y": 2.5,
    };

    const volatilityFactor = volatilityFactors[timeRange];
    const baseValue = 7000;

    // 生成歷史數據
    const historyData: number[] = [];
    for (let i = 0; i < historyLength; i++) {
      if (i === 0) {
        const randomChange = (Math.random() - 0.5) * 100 * volatilityFactor;
        historyData.push(baseValue + randomChange);
      } else {
        const prevValue = historyData[i - 1];
        const change = (Math.random() - 0.45) * 30 * volatilityFactor;
        historyData.push(prevValue + change);
      }
    }
    setChartHistoryData(historyData);

    // 生成預測數據
    const lastValue = historyData[historyData.length - 1];
    const predictions: number[] = [];

    for (let i = 0; i < predictionLength; i++) {
      const trend = Math.random() > 0.4;
      const change =
        lastValue * (0.002 + Math.random() * 0.01) * volatilityFactor;
      predictions.push(lastValue + (i + 1) * (trend ? change : -change));
    }
    setPredictionData(predictions);

    // 生成標籤
    const labels = generateLabels(timeRange, historyLength, predictionLength);
    setAllLabels(labels);

    // 計算趨勢
    const direction =
      predictions[predictions.length - 1] > lastValue ? "上漲" : "下跌";
    setTrendDirection(direction);

    const percent = Math.abs(
      ((predictions[predictions.length - 1] - lastValue) / lastValue) * 100
    ).toFixed(2);
    setTrendPercent(percent);

    // 設定 Y 軸範圍
    const allData = [...historyData, ...predictions];
    const minValue = Math.min(...allData);
    const maxValue = Math.max(...allData);
    const range = maxValue - minValue;
    const paddingFactor = 0.1;

    setYAxisMin(Math.floor(minValue - range * paddingFactor));
    setYAxisMax(Math.ceil(maxValue + range * paddingFactor));
  }, [selectedStock, timeRange]);

  const generateLabels = (
    timeRange: TimeRange,
    historyLength: number,
    predictionLength: number
  ): string[] => {
    const labels: string[] = [];
    const today = new Date();

    switch (timeRange) {
      case "1D":
        for (let i = 0; i < historyLength; i++) {
          const hour = (9 - historyLength + i) % 24;
          labels.push(`${hour >= 0 ? hour : hour + 24}:00`);
        }
        for (let i = 0; i < predictionLength; i++) {
          const hour = (9 + i) % 24;
          labels.push(`${hour}:00`);
        }
        break;

      case "1W":
        const days = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
        const currentDay = today.getDay();
        const startDayOffset = historyLength % 7;

        for (let i = 0; i < historyLength; i++) {
          const dayIndex = (currentDay - startDayOffset + i + 7) % 7;
          labels.push(days[dayIndex]);
        }
        for (let i = 0; i < predictionLength; i++) {
          const dayIndex = (currentDay + i) % 7;
          labels.push(days[dayIndex]);
        }
        break;

      default:
        for (let i = 0; i < historyLength; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - (historyLength - i));
          labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
        }
        for (let i = 0; i < predictionLength; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i + 1);
          labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
        }
    }

    return labels;
  };

  // 創建圖表數據的函數
  const createChartData = (): ChartData => {
    // 確保數據陣列長度有效
    if (chartHistoryData.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // 創建預測數據線，前面用 null 填充
    const predictionLineData: (number | null)[] = [];

    // 計算需要填充的 null 數量（歷史數據長度 - 1）
    const nullFillLength = Math.max(0, chartHistoryData.length - 1);

    // 添加 null 值
    for (let i = 0; i < nullFillLength; i++) {
      predictionLineData.push(null);
    }

    // 添加連接點（最後一個歷史數據點）
    if (chartHistoryData.length > 0) {
      predictionLineData.push(chartHistoryData[chartHistoryData.length - 1]);
    }

    // 添加預測數據
    predictionLineData.push(...predictionData);

    return {
      labels: allLabels,
      datasets: [
        {
          label: "歷史價格",
          data: chartHistoryData,
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.08)",
          fill: true,
          tension: 0.3,
        },
        {
          label: "AI預測",
          data: predictionLineData,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderDash: [5, 5],
          fill: true,
          tension: 0.3,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: { size: 12 },
          usePointStyle: true,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        filter: function (tooltipItem: any) {
          // 隱藏 null 值的 tooltip
          return tooltipItem.parsed.y !== null;
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: { display: false },
        grid: { display: false },
      },
      y: {
        display: true,
        title: { display: false },
        min: yAxisMin,
        max: yAxisMax,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
    elements: {
      point: {
        radius: function (context: any) {
          // 隱藏 null 值的點
          return context.parsed.y === null ? 0 : 3;
        },
      },
    },
  };

  return {
    chartData: createChartData(),
    chartOptions,
    trendDirection,
    trendPercent,
    isDataReady: chartHistoryData.length > 0,
  };
};
