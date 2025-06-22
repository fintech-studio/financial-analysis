import React from "react";
import CandlestickChart from "@/components/Charts/CandlestickChart";

interface CandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface TechnicalIndicatorData {
  [key: string]: number[];
}

interface ChartContainerProps {
  data: CandlestickData[];
  technicalData?: TechnicalIndicatorData;
  symbol: string;
  timeframe: "1d" | "1h";
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  data,
  technicalData,
  symbol,
  timeframe,
}) => {
  // 直接返回圖表組件，不包裝額外的容器
  return (
    <CandlestickChart
      data={data}
      technicalData={technicalData}
      title={`${symbol} K線圖`}
      height={600}
      showVolume={true}
      timeframe={timeframe}
      theme="light"
    />
  );
};

export default ChartContainer;
