import React from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  InformationCircleIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import { getPriceChangeColor } from "@/utils/stockUtils";

// TypeScript 類型定義
interface StockDetail {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent?: string;
  industry: string;
  volume: string;
  pe: string;
  dividend?: string;
  dividendYield?: string;
}

interface StockListProps {
  stockDetails?: StockDetail[];
  favoriteStocks: string[];
  toggleFavoriteStock: (symbol: string) => void;
  showComparison: boolean;
  setShowComparison: (show: boolean) => void;
  toggleCompareStock: (symbol: string) => void;
  stockCompare: string[];
  handleSort: (field: string) => void;
}

const StockList: React.FC<StockListProps> = ({
  stockDetails,
  favoriteStocks,
  toggleFavoriteStock,
  showComparison,
  setShowComparison,
  toggleCompareStock,
  stockCompare,
  handleSort,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <StarIconSolid className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">我的關注</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">比較：</span>
            <div className="relative">
              <button
                className={`flex items-center space-x-1 text-sm ${
                  showComparison ? "text-blue-600 font-medium" : "text-gray-600"
                } hover:text-blue-600`}
                onClick={() => {
                  // 如果切換到比較模式且目前沒有任何股票被選中，則自動選中第一支股票
                  if (
                    !showComparison &&
                    stockCompare.length === 0 &&
                    stockDetails &&
                    stockDetails.length > 0
                  ) {
                    toggleCompareStock(stockDetails[0].symbol);
                  }
                  setShowComparison(!showComparison);
                }}
              >
                <Square3Stack3DIcon className="h-4 w-4" />
                <span>{showComparison ? "取消比較" : "開始比較"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                {showComparison ? "選擇" : "追蹤"}
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span
                  className="cursor-pointer flex items-center"
                  onClick={() => handleSort("symbol")}
                >
                  代號/名稱{" "}
                  <AdjustmentsHorizontalIcon className="h-3 w-3 ml-1" />
                </span>
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span
                  className="cursor-pointer flex items-center"
                  onClick={() => handleSort("price")}
                >
                  股價 <AdjustmentsHorizontalIcon className="h-3 w-3 ml-1" />
                </span>
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span
                  className="cursor-pointer flex items-center"
                  onClick={() => handleSort("change")}
                >
                  漲跌 <AdjustmentsHorizontalIcon className="h-3 w-3 ml-1" />
                </span>
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                行業
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                成交量
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                P/E
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                殖利率
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {stockDetails &&
              stockDetails.map((stock) => (
                <tr
                  key={stock.symbol}
                  className={
                    favoriteStocks.includes(stock.symbol) ? "bg-blue-50" : ""
                  }
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        showComparison
                          ? toggleCompareStock(stock.symbol)
                          : toggleFavoriteStock(stock.symbol)
                      }
                      className="focus:outline-none"
                    >
                      {showComparison ? (
                        <div
                          className={`h-4 w-4 border rounded-sm ${
                            stockCompare.includes(stock.symbol)
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {stockCompare.includes(stock.symbol) && (
                            <svg
                              className="h-3 w-3 text-white m-auto"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                          )}
                        </div>
                      ) : favoriteStocks.includes(stock.symbol) ? (
                        <StarIconSolid className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <StarIcon className="h-5 w-5 text-gray-300 hover:text-yellow-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-1">
                        <div className="text-sm font-medium text-gray-900">
                          {stock.symbol}
                        </div>
                        <div className="text-xs text-gray-500">
                          {stock.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stock.price}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${getPriceChangeColor(
                        stock.change
                      )}`}
                    >
                      {stock.change}{" "}
                      {stock.changePercent && `(${stock.changePercent})`}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.industry}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.volume}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.pe}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.dividend || stock.dividendYield}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <ChartBarIcon className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
                        <InformationCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {(!stockDetails || stockDetails.length === 0) && (
          <div className="py-6 text-center">
            <p className="text-gray-500">沒有找到股票資料</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockList;
