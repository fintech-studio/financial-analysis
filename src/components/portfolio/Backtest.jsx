import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const Backtest = () => {
  const [backtestParams, setBacktestParams] = useState({
    startDate: "2023-01-01",
    endDate: "2024-01-01",
    initialCapital: 1000000,
    rebalancingPeriod: "monthly",
  });

  const backtestResults = {
    totalReturn: "+25.8%",
    annualizedReturn: "15.2%",
    sharpeRatio: "1.85",
    maxDrawdown: "-12.5%",
    winRate: "65%",
    performance: {
      labels: ["2023-01", "2023-04", "2023-07", "2023-10", "2024-01"],
      portfolio: [100, 115, 108, 125, 128],
      benchmark: [100, 108, 105, 115, 120],
    },
  };

  return (
    <div className="space-y-6">
      {/* 回測參數設定 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">回測參數設定</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              起始日期
            </label>
            <input
              type="date"
              value={backtestParams.startDate}
              onChange={(e) =>
                setBacktestParams({
                  ...backtestParams,
                  startDate: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              結束日期
            </label>
            <input
              type="date"
              value={backtestParams.endDate}
              onChange={(e) =>
                setBacktestParams({
                  ...backtestParams,
                  endDate: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              初始資金
            </label>
            <input
              type="number"
              value={backtestParams.initialCapital}
              onChange={(e) =>
                setBacktestParams({
                  ...backtestParams,
                  initialCapital: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              再平衡週期
            </label>
            <select
              value={backtestParams.rebalancingPeriod}
              onChange={(e) =>
                setBacktestParams({
                  ...backtestParams,
                  rebalancingPeriod: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="monthly">每月</option>
              <option value="quarterly">每季</option>
              <option value="yearly">每年</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <PlayIcon className="h-5 w-5 mr-2" />
            開始回測
          </button>
        </div>
      </div>

      {/* 回測結果摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "總報酬率",
            value: backtestResults.totalReturn,
            color: "text-green-500",
          },
          {
            label: "年化報酬",
            value: backtestResults.annualizedReturn,
            color: "text-blue-500",
          },
          {
            label: "夏普比率",
            value: backtestResults.sharpeRatio,
            color: "text-indigo-500",
          },
          {
            label: "最大回撤",
            value: backtestResults.maxDrawdown,
            color: "text-red-500",
          },
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">{item.label}</div>
            <div className={`text-2xl font-bold ${item.color}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* 回測績效圖表 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">績效比較</h3>
        <div className="h-96">
          <Line
            data={{
              labels: backtestResults.performance.labels,
              datasets: [
                {
                  label: "投資組合",
                  data: backtestResults.performance.portfolio,
                  borderColor: "#4F46E5",
                  backgroundColor: "rgba(79, 70, 229, 0.1)",
                  tension: 0.4,
                },
                {
                  label: "大盤指數",
                  data: backtestResults.performance.benchmark,
                  borderColor: "#9CA3AF",
                  backgroundColor: "rgba(156, 163, 175, 0.1)",
                  tension: 0.4,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `${value}%`,
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Backtest;
