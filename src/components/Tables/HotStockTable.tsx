import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import { ChevronRightIcon, FireIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export interface StockData {
  id: string;
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  recommendation?: string; // 股票推薦: '買入' | '持有' | '賣出'
  highlight?: boolean; // 是否高亮顯示
}

interface HotStockTableProps {
  stocks: StockData[];
  compact?: boolean;
  showRank?: boolean;
}

const HotStockTable: React.FC<HotStockTableProps> = ({
  stocks,
  compact = false,
  showRank = true,
}) => {
  if (!stocks || stocks.length === 0) {
    return <div className="p-6 text-center text-gray-500">暫無股票資料</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {showRank && (
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                排名
              </th>
            )}
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              股票
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              價格
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              漲跌幅
            </th>
            {!compact && (
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                成交量
              </th>
            )}
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {stocks.map((stock, index) => (
            <tr
              key={stock.id}
              className={`${
                stock.highlight ? "bg-blue-50" : ""
              } hover:bg-gray-50 transition-colors`}
            >
              {showRank && (
                <td className="px-4 py-3 whitespace-nowrap">
                  {index < 3 ? (
                    <span
                      className={`
                      inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium text-white
                      ${
                        index === 0
                          ? "bg-amber-500"
                          : index === 1
                          ? "bg-gray-400"
                          : "bg-amber-700"
                      }
                    `}
                    >
                      {index + 1}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">{index + 1}</span>
                  )}
                </td>
              )}

              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {stock.name}
                      <span className="text-gray-500 ml-1">{stock.code}</span>
                    </div>
                    {!compact && stock.recommendation && (
                      <div
                        className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-flex items-center
                        ${
                          stock.recommendation === "買入"
                            ? "bg-green-100 text-green-800"
                            : stock.recommendation === "賣出"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      `}
                      >
                        {stock.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              </td>

              <td className="px-4 py-3 whitespace-nowrap text-right">
                <div className="text-sm font-medium text-gray-900">
                  {stock.price.toLocaleString("zh-tw")}
                </div>
              </td>

              <td className="px-4 py-3 whitespace-nowrap text-right">
                <div
                  className={`text-sm font-medium flex items-center justify-end
                  ${stock.change >= 0 ? "text-green-600" : "text-red-600"}
                `}
                >
                  {stock.change >= 0 ? (
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                  )}
                  <span>
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change.toLocaleString("zh-tw")}(
                    {stock.change >= 0 ? "+" : ""}
                    {stock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </td>

              {!compact && (
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-500">
                    {(stock.volume / 1000).toFixed(0)}K
                  </div>
                </td>
              )}

              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  href={`/market-analysis/stock/${stock.code}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <span className="sr-only">查看</span>
                  <ChevronRightIcon className="h-5 w-5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HotStockTable;
