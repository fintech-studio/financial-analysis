import React from "react";
import { Line } from "react-chartjs-2";
import {
  priceChartOptions,
  generatePriceChartData,
} from "@/utils/chartConfigs";

const PriceChart = ({ historyData }) => {
  const chartData = generatePriceChartData(historyData);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">價格趨勢</h3>
        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
          過去6個月
        </span>
      </div>
      <div className="h-80">
        <Line options={priceChartOptions} data={chartData} />
      </div>
    </div>
  );
};

export default PriceChart;
