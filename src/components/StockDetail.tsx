import React, { useState } from "react";
import { ChartBarIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { Line } from "react-chartjs-2";

interface NewsItem {
  title: string;
  date: string;
  source: string;
}

interface ChartData {
  labels: string[];
  prices: number[];
}

interface Stock {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  industry: string;
  marketCap: string;
  pe: string;
  dividend: string;
  chartData: ChartData;
  news?: NewsItem[];
}

interface StockDetailProps {
  stock: Stock;
  isFavorite: boolean;
  onToggleFavorite: (symbol: string) => void;
}

type TabType = "overview" | "technical" | "fundamental" | "news";

const StockDetail: React.FC<StockDetailProps> = ({
  stock,
  isFavorite,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const getPriceChangeColor = (change: string): string => {
    if (parseFloat(change) > 0) {
      return "text-green-600";
    } else if (parseFloat(change) < 0) {
      return "text-red-600";
    } else {
      return "text-gray-600";
    }
  };

  const tabLabels: Record<TabType, string> = {
    overview: "概覽",
    technical: "技術面",
    fundamental: "基本面",
    news: "新聞",
  };

  const tabs: TabType[] = ["overview", "technical", "fundamental", "news"];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChartBarIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              {stock.symbol} {stock.name}
            </h3>
          </div>
          <button
            className={`flex items-center space-x-1 ${
              isFavorite
                ? "text-yellow-500"
                : "text-gray-400 hover:text-yellow-500"
            }`}
            onClick={() => onToggleFavorite(stock.symbol)}
          >
            {isFavorite ? (
              <StarIconSolid className="h-5 w-5" />
            ) : (
              <StarIcon className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">
              {isFavorite ? "已追蹤" : "加入追蹤"}
            </span>
          </button>
        </div>
      </div>

      <div className="px-6 pt-4">
        <div className="flex justify-between items-baseline">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {stock.price}
            </span>
            <span
              className={`ml-3 text-lg font-medium ${getPriceChangeColor(
                stock.change
              )}`}
            >
              {stock.change} ({stock.changePercent})
            </span>
          </div>
          <div className="text-sm text-gray-500">
            更新時間：{new Date().toLocaleTimeString("zh-TW")}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-500">開盤</div>
            <div className="text-sm font-medium text-gray-900">
              {stock.open}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">最高</div>
            <div className="text-sm font-medium text-green-600">
              {stock.high}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">最低</div>
            <div className="text-sm font-medium text-red-600">{stock.low}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">成交量</div>
            <div className="text-sm font-medium text-gray-900">
              {stock.volume}
            </div>
          </div>
        </div>

        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab(tab)}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "overview" && (
          <>
            <div className="h-64">
              <Line
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { intersect: false, mode: "index" },
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                  },
                  scales: {
                    y: { beginAtZero: false },
                  },
                }}
                data={{
                  labels: stock.chartData.labels,
                  datasets: [
                    {
                      label: "股價",
                      data: stock.chartData.prices,
                      borderColor: "rgb(59, 130, 246)",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      tension: 0.3,
                      fill: true,
                    },
                  ],
                }}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">產業</div>
                <div className="text-sm font-medium text-gray-900">
                  {stock.industry}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">市值</div>
                <div className="text-sm font-medium text-gray-900">
                  {stock.marketCap}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">本益比</div>
                <div className="text-sm font-medium text-gray-900">
                  {stock.pe}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">殖利率</div>
                <div className="text-sm font-medium text-green-600">
                  {stock.dividend}
                </div>
              </div>
            </div>

            {stock.news && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  相關新聞
                </h4>
                <div className="space-y-3">
                  {stock.news.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-1">
                        {item.title}
                      </h5>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{item.date}</span>
                        <span>{item.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "technical" && (
          <div className="space-y-6">{/* 技術分析內容 */}</div>
        )}

        {activeTab === "fundamental" && (
          <div className="space-y-6">{/* 基本面內容 */}</div>
        )}

        {activeTab === "news" && (
          <div className="space-y-4">{/* 新聞內容 */}</div>
        )}
      </div>
    </div>
  );
};

export default StockDetail;
