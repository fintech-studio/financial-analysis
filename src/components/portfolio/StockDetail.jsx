import React from "react";
import { Line } from "react-chartjs-2";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ScaleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const StockDetail = ({ stockInfo, onClose }) => {
  const kpiData = {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [
      {
        label: "營收(億)",
        data: [1250, 1380, 1420, 1510],
        borderColor: "#4F46E5",
      },
    ],
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {stockInfo.name} ({stockInfo.symbol})
              </h2>
              <p className="text-gray-500">上市時間：2000/01/01</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                NT$ {stockInfo.currentPrice}
              </div>
              <div
                className={`text-lg ${
                  parseFloat(stockInfo.change) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {stockInfo.change} ({stockInfo.changePercent})
              </div>
            </div>
          </div>

          {/* 基本資訊卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "市值", value: "2.3兆", icon: CurrencyDollarIcon },
              { label: "本益比", value: "15.2", icon: ChartBarIcon },
              { label: "殖利率", value: "2.1%", icon: ScaleIcon },
              { label: "股本", value: "2,593億", icon: DocumentTextIcon },
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <item.icon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">{item.label}</span>
                </div>
                <div className="text-lg font-semibold">{item.value}</div>
              </div>
            ))}
          </div>

          {/* 營運數據圖表 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">營運概況</h3>
            <div className="h-64">
              <Line data={kpiData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          {/* 技術分析 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">技術分析</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-sm text-gray-500">MA線型判斷</span>
                <div className="text-green-500 font-medium mt-1">多頭排列</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <span className="text-sm text-gray-500">KD指標</span>
                <div className="text-red-500 font-medium mt-1">超賣區間</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
