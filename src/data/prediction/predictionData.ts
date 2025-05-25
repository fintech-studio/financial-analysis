// src/data/prediction/predictionData.ts
import type { StockData, TechnicalIndicator } from "@/types/prediction";

export const STOCK_DATA: Record<string, StockData> = {
  IHSG: {
    price: "7,056.04",
    open: "7,091.76",
    high: "7,100.81",
    low: "7,016.70",
    lot: "186.26 M",
    value: "9.88 T",
    freq: "110 M",
    chartLabels: Array.from({ length: 30 }, (_, i) => i + 1),
  },
};

export const TECHNICAL_INDICATORS: TechnicalIndicator[] = [
  {
    name: "RSI (14)",
    value: "68.5",
    status: "接近超買",
    statusColor: "text-yellow-600",
  },
  {
    name: "MACD",
    value: "+12.5",
    status: "看漲信號",
    statusColor: "text-green-600",
    valueColor: "text-green-600",
  },
  {
    name: "KD指標",
    value: "K:65 D:45",
    status: "黃金交叉",
    statusColor: "text-green-600",
  },
  {
    name: "移動平均線 (20日)",
    value: "7,032.50",
    status: "站上均線",
    statusColor: "text-green-600",
    valueColor: "text-red-600",
  },
  {
    name: "布林通道",
    value: "上軌: 7,150",
    status: "中軌: 7,050 | 下軌: 6,950",
    statusColor: "text-gray-600",
  },
  {
    name: "成交量",
    value: "+15%",
    status: "高於平均",
    statusColor: "text-blue-600",
    valueColor: "text-blue-600",
  },
];
