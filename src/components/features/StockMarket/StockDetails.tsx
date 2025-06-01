import React from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { Line } from "react-chartjs-2";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { getPriceChangeColor, getRatingColor } from "@/utils/stockUtils";

// TypeScript 類型定義
interface ChartData {
  labels?: string[];
  prices?: number[];
}

interface TechnicalSignals {
  ma?: string;
  kd?: string;
  macd?: string;
  support?: string;
  resistance?: string;
  rsi?: string;
}

interface InstitutionalTrade {
  net?: string;
  trend?: string;
}

interface InstitutionalTrades {
  foreign?: InstitutionalTrade;
  investment?: InstitutionalTrade;
  dealer?: InstitutionalTrade;
}

interface Rating {
  org: string;
  rating: string;
  target: string;
}

interface NewsItem {
  title: string;
  date: string;
  source: string;
}

interface Stock {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent?: string;
  open: string;
  high: string;
  low: string;
  volume: string;
  pe: string;
  pb: string;
  dividend?: string;
  dividendYield?: string;
  chartData?: ChartData;
  priceHistory?: number[];
  technicalSignals?: TechnicalSignals;
  institutionalTrades?: InstitutionalTrades;
  ratings?: Rating[];
  news?: NewsItem[];
}

interface StockDetailsProps {
  stock: Stock;
  favoriteStocks: string[];
  toggleFavoriteStock: (symbol: string) => void;
}

const StockDetails: React.FC<StockDetailsProps> = ({
  stock,
  favoriteStocks,
  toggleFavoriteStock,
}) => {
  // 默認圖表數據
  const defaultLabels = ["1月", "2月", "3月", "4月", "5月", "6月"];
  const defaultPrices = [120, 125, 122, 130, 128, 135];

  // 默認評級數據
  const defaultRatings: Rating[] = [
    { org: "元大證券", rating: "強力買進", target: "650.00" },
    { org: "國泰證券", rating: "買進", target: "630.00" },
    { org: "富邦證券", rating: "持有", target: "580.00" },
  ];

  // 默認新聞數據
  const defaultNews: NewsItem[] = [
    {
      title: "台積電宣布新一代5nm製程進度超前，客戶反應熱烈",
      date: "2023-05-15",
      source: "經濟日報",
    },
    {
      title: "分析師：AI晶片需求強勁，台積電下半年營收可望突破新高",
      date: "2023-05-14",
      source: "工商時報",
    },
    {
      title: "台積電擴大資本支出，今年將達400億美元",
      date: "2023-05-13",
      source: "財經網",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChartBarIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              {stock.symbol} {stock.name} 詳細資訊
            </h3>
          </div>
          <button
            className={`flex items-center space-x-1 ${
              favoriteStocks.includes(stock.symbol)
                ? "text-yellow-500"
                : "text-gray-400 hover:text-yellow-500"
            }`}
            onClick={() => toggleFavoriteStock(stock.symbol)}
          >
            {favoriteStocks.includes(stock.symbol) ? (
              <StarIconSolid className="h-5 w-5" />
            ) : (
              <StarIcon className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">加入追蹤</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：基本資訊與價格圖表 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    {stock.price}
                  </span>
                  <span
                    className={`ml-3 text-lg font-medium ${getPriceChangeColor(
                      stock.change
                    )}`}
                  >
                    {stock.change} ({stock.changePercent || "0%"})
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  更新時間：{new Date().toLocaleTimeString("zh-TW")}
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-4">
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
                  <div className="text-sm font-medium text-red-600">
                    {stock.low}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">成交量</div>
                  <div className="text-sm font-medium text-gray-900">
                    {stock.volume}
                  </div>
                </div>
              </div>
            </div>

            {/* 價格圖表 */}
            <div className="h-80">
              <Line
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { intersect: false, mode: "index" as const },
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                  },
                  scales: {
                    y: { beginAtZero: false },
                  },
                }}
                data={{
                  labels: stock.chartData?.labels || defaultLabels,
                  datasets: [
                    {
                      label: "股價",
                      data:
                        stock.chartData?.prices ||
                        stock.priceHistory ||
                        defaultPrices,
                      borderColor: "rgb(59, 130, 246)",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      tension: 0.3,
                      fill: true,
                    },
                  ],
                }}
              />
            </div>

            {/* 技術指標 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">技術指標</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">均線</span>
                    <span className="text-sm font-medium text-green-600">
                      {stock.technicalSignals?.ma || "多頭排列"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">KD指標</span>
                    <span className="text-sm font-medium text-green-600">
                      {stock.technicalSignals?.kd || "超買區"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">MACD</span>
                    <span className="text-sm font-medium text-green-600">
                      {stock.technicalSignals?.macd || "黃金交叉"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">支撐與壓力</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">主要支撐</span>
                    <span className="text-sm font-medium text-gray-900">
                      {stock.technicalSignals?.support ||
                        (parseFloat(stock.price) * 0.95).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">主要壓力</span>
                    <span className="text-sm font-medium text-gray-900">
                      {stock.technicalSignals?.resistance ||
                        (parseFloat(stock.price) * 1.05).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">RSI</span>
                    <span className="text-sm font-medium text-blue-600">
                      {stock.technicalSignals?.rsi || "65.4"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">基本面數據</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">本益比</span>
                    <span className="text-sm font-medium text-gray-900">
                      {stock.pe}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">股價淨值比</span>
                    <span className="text-sm font-medium text-gray-900">
                      {stock.pb}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">殖利率</span>
                    <span className="text-sm font-medium text-green-600">
                      {stock.dividend || stock.dividendYield || "1.8%"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：法人動態與股票評級 */}
          <div className="space-y-6">
            {/* 法人買賣超 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700">
                  法人買賣超
                </h4>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">外資</span>
                    <div className="flex items-center">
                      <span
                        className={`text-sm font-medium ${
                          parseFloat(
                            stock.institutionalTrades?.foreign?.net || "1250"
                          ) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stock.institutionalTrades?.foreign?.net || "+1,250"}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {stock.institutionalTrades?.foreign?.trend || "連買3日"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">投信</span>
                    <div className="flex items-center">
                      <span
                        className={`text-sm font-medium ${
                          parseFloat(
                            stock.institutionalTrades?.investment?.net || "350"
                          ) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stock.institutionalTrades?.investment?.net || "+350"}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {stock.institutionalTrades?.investment?.trend ||
                          "連買5日"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">自營商</span>
                    <div className="flex items-center">
                      <span
                        className={`text-sm font-medium ${
                          parseFloat(
                            stock.institutionalTrades?.dealer?.net || "-50"
                          ) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stock.institutionalTrades?.dealer?.net || "-50"}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {stock.institutionalTrades?.dealer?.trend ||
                          "賣出轉買入"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 研究報告 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700">券商評等</h4>
              </div>
              <div className="divide-y divide-gray-100">
                {(stock.ratings || defaultRatings).map((rating, index) => (
                  <div key={index} className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {rating.org}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getRatingColor(
                          rating.rating
                        )}`}
                      >
                        {rating.rating}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between items-center">
                      <span className="text-xs text-gray-500">目標價</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${rating.target}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 相關新聞 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700">相關新聞</h4>
              </div>
              <div className="divide-y divide-gray-100">
                {(stock.news || defaultNews).map((item, index) => (
                  <div key={index} className="p-4">
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
              <div className="bg-gray-50 px-4 py-2 text-center">
                <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
                  查看更多新聞
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetails;
