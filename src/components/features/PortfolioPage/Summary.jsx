import React from "react";
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { Line } from "react-chartjs-2";

const Summary = ({ data }) => {
  const { totalAssets, returns, changes, distribution } = data;

  return (
    <div className="space-y-6">
      {/* 主要指標卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 總資產 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-500" />
              <h3 className="ml-2 text-lg font-medium">總資產價值</h3>
            </div>
          </div>
          <div className="text-2xl font-bold mb-2">NT$ {totalAssets.value}</div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>投資 {totalAssets.breakdown.investment}</span>
            <span>現金 {totalAssets.breakdown.cash}</span>
          </div>
        </div>

        {/* 累積報酬 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
              <h3 className="ml-2 text-lg font-medium">累積報酬</h3>
            </div>
          </div>
          <div className="text-2xl font-bold text-green-500 mb-2">
            {returns.total.percentage}
          </div>
          <div className="text-sm text-gray-500">NT$ {returns.total.value}</div>
        </div>

        {/* 年化報酬 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-2">
            <ChartBarIcon className="h-6 w-6 text-purple-500" />
            <h3 className="ml-2 text-lg font-medium">年化報酬</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">一年</span>
              <span className="font-semibold text-green-500">
                {returns.annualized.oneYear}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">三年</span>
              <span className="font-semibold text-green-500">
                {returns.annualized.threeYear}
              </span>
            </div>
          </div>
        </div>

        {/* 現金比例 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-2">
            <BanknotesIcon className="h-6 w-6 text-yellow-500" />
            <h3 className="ml-2 text-lg font-medium">現金部位</h3>
          </div>
          <div className="text-2xl font-bold mb-2">{totalAssets.cashRatio}</div>
          <div className="text-sm text-gray-500">建議範圍: 10-20%</div>
        </div>
      </div>

      {/* 投資表現追蹤 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">資產配置分布</h3>
          <div className="grid grid-cols-2 gap-4">
            {distribution.byIndustry.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{item.industry}</span>
                <span className="font-medium">{item.percentage}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">近期變動</h3>
          <div className="space-y-4">
            {Object.entries(changes).map(([period, data]) => (
              <div key={period} className="flex justify-between items-center">
                <span className="text-gray-600">
                  {period === "daily"
                    ? "日"
                    : period === "weekly"
                    ? "週"
                    : "月"}
                </span>
                <div className="text-right">
                  <div
                    className={`font-medium ${
                      parseFloat(data.percentage) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {data.percentage}
                  </div>
                  <div className="text-sm text-gray-500">{data.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
