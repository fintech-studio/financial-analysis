import React from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  ShieldCheckIcon,
  ChartPieIcon,
  ScaleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

// 註冊所需的 Chart.js 元件
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AssetAllocation = ({ data }) => {
  const riskScore = 75; // 風險分數 (0-100)

  return (
    <div className="space-y-6">
      {/* 資產分布概覽 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <ChartPieIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">股票配置</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">65.8%</p>
          <p className="text-sm text-gray-500">建議範圍: 50-70%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <ScaleIcon className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">債券配置</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">20.5%</p>
          <p className="text-sm text-gray-500">建議範圍: 20-40%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <ShieldCheckIcon className="h-5 w-5 text-purple-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">現金配置</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">13.7%</p>
          <p className="text-sm text-gray-500">建議範圍: 5-15%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">風險評分</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{riskScore}/100</p>
          <p className="text-sm text-gray-500">中度風險</p>
        </div>
      </div>

      {/* 資產配置圖表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">產業分布</h3>
          <div className="h-80">
            <Doughnut
              data={{
                labels: ["科技", "金融", "電信", "消費", "醫療", "其他"],
                datasets: [
                  {
                    data: [40, 20, 15, 10, 10, 5],
                    backgroundColor: [
                      "#4F46E5",
                      "#10B981",
                      "#F59E0B",
                      "#EF4444",
                      "#8B5CF6",
                      "#6B7280",
                    ],
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right",
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">地區分布</h3>
          <div className="h-80">
            <Bar
              data={{
                labels: ["台灣", "美國", "中國", "歐洲", "日本", "其他"],
                datasets: [
                  {
                    label: "投資占比",
                    data: [45, 25, 15, 8, 5, 2],
                    backgroundColor: "#4F46E5",
                  },
                ],
              }}
              options={{
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

      {/* 投資建議 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">配置建議</h3>
        <div className="space-y-4">
          {[
            {
              title: "產業配置",
              message: "科技股比重偏高，建議適度分散至其他產業以降低風險",
              type: "warning",
            },
            {
              title: "地區配置",
              message: "可考慮增加國際市場投資比重，分散地區風險",
              type: "info",
            },
            {
              title: "資產類別",
              message: "當前投資組合風險適中，符合您的風險承受度",
              type: "success",
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                item.type === "warning"
                  ? "bg-yellow-50 border border-yellow-200"
                  : item.type === "info"
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetAllocation;
