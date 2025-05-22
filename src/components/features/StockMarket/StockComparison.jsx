import React from "react";
import { Line } from "react-chartjs-2";
import { getPriceChangeColor } from "@/utils/stockUtils";

const StockComparison = ({
  stockCompare,
  stockDetails,
  toggleCompareStock,
  setStockCompare,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">股票比較</h3>
          <button
            className="text-sm text-red-600 hover:text-red-800 font-medium"
            onClick={() => setStockCompare([])}
          >
            清除所有
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stockCompare.map((symbol) => {
            const stock = stockDetails.find((s) => s.symbol === symbol);
            if (!stock) return null;

            return (
              <div
                key={symbol}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-lg font-semibold text-gray-900">
                      {symbol}
                    </span>
                    <span className="ml-2 text-gray-600">{stock.name}</span>
                  </div>
                  <button
                    onClick={() => toggleCompareStock(symbol)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex items-baseline mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {stock.price}
                  </span>
                  <span className={`ml-2 ${getPriceChangeColor(stock.change)}`}>
                    {stock.changePercent || stock.change}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">成交量</span>
                    <span className="text-gray-900">{stock.volume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">本益比</span>
                    <span className="text-gray-900">{stock.pe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">股價淨值比</span>
                    <span className="text-gray-900">{stock.pb}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">殖利率</span>
                    <span className="text-gray-900">
                      {stock.dividend || stock.dividendYield}
                    </span>
                  </div>
                </div>

                <div className="h-32 mt-4">
                  <Line
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { display: false },
                        y: { display: false },
                      },
                    }}
                    data={{
                      labels: stock.chartData?.labels || [
                        "1月",
                        "2月",
                        "3月",
                        "4月",
                        "5月",
                        "6月",
                      ],
                      datasets: [
                        {
                          data: stock.chartData?.prices ||
                            stock.priceHistory || [80, 85, 88, 92, 90, 94],
                          borderColor:
                            parseFloat(stock.change) >= 0
                              ? "rgb(16, 185, 129)"
                              : "rgb(239, 68, 68)",
                          borderWidth: 2,
                          tension: 0.3,
                        },
                      ],
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* 添加按鈕 */}
          {stockCompare.length < 3 && (
            <div className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <span className="block text-gray-500 mb-1">
                  選擇最多3支股票進行比較
                </span>
                <span className="text-sm text-gray-400">
                  已選擇 {stockCompare.length}/3 支
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockComparison;
