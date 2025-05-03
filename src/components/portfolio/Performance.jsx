import React from "react";
import { Line } from "react-chartjs-2";
import {
  ArrowTrendingUpIcon,
  ScaleIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const Performance = ({ stats }) => {
  const performanceData = {
    labels: ["一月", "二月", "三月", "四月", "五月", "六月"],
    datasets: [
      {
        label: "投資組合績效",
        data: [2.5, 3.8, 2.9, 4.2, 3.5, 5.1],
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.4,
      },
      {
        label: "大盤指數",
        data: [2.1, 3.2, 2.5, 3.8, 3.0, 4.5],
        borderColor: "#9CA3AF",
        backgroundColor: "rgba(156, 163, 175, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const volatilityData = {
    labels: ["一月", "二月", "三月", "四月", "五月", "六月"],
    datasets: [
      {
        label: "波動率",
        data: [12, 15, 10, 18, 14, 16],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* 績效指標卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-500" />
            <h3 className="ml-2 text-lg font-medium">年化報酬</h3>
          </div>
          <p className="text-2xl font-bold text-green-500">+15.2%</p>
          <p className="text-sm text-gray-500">優於大盤 3.5%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ScaleIcon className="h-6 w-6 text-blue-500" />
            <h3 className="ml-2 text-lg font-medium">夏普比率</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">1.85</p>
          <p className="text-sm text-gray-500">風險調整後報酬</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-6 w-6 text-red-500" />
            <h3 className="ml-2 text-lg font-medium">最大回撤</h3>
          </div>
          <p className="text-2xl font-bold text-red-500">-12.5%</p>
          <p className="text-sm text-gray-500">過去一年</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ClockIcon className="h-6 w-6 text-purple-500" />
            <h3 className="ml-2 text-lg font-medium">操作勝率</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">68%</p>
          <p className="text-sm text-gray-500">獲利交易比例</p>
        </div>
      </div>

      {/* 績效走勢圖 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">績效走勢</h3>
          <Line
            data={performanceData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
                title: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => value + "%",
                  },
                },
              },
            }}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">波動率分析</h3>
          <Line
            data={volatilityData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
                title: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => value + "%",
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* 績效統計表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                時間區間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                報酬率
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                大盤報酬
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                超額報酬
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[
              {
                period: "近一個月",
                return: "+2.8%",
                benchmark: "+1.5%",
                alpha: "+1.3%",
              },
              {
                period: "近三個月",
                return: "+8.5%",
                benchmark: "+5.2%",
                alpha: "+3.3%",
              },
              {
                period: "近六個月",
                return: "+15.2%",
                benchmark: "+11.7%",
                alpha: "+3.5%",
              },
              {
                period: "今年以來",
                return: "+21.5%",
                benchmark: "+18.2%",
                alpha: "+3.3%",
              },
            ].map((item) => (
              <tr key={item.period}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.period}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">
                  {item.return}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.benchmark}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">
                  {item.alpha}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Performance;
