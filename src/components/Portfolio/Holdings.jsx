import React, { useState } from "react";
import {
  TrashIcon,
  PencilIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const Holdings = ({ data, onSort, sortConfig, onSelectStock }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    profitOnly: false,
    lossOnly: false,
    minValue: "",
    maxValue: "",
  });

  const filteredHoldings = data.holdings.filter((holding) => {
    const matchesSearch =
      holding.name.includes(searchTerm) || holding.symbol.includes(searchTerm);
    const profit = parseFloat(holding.returnPercentage);
    if (filters.profitOnly && profit <= 0) return false;
    if (filters.lossOnly && profit >= 0) return false;
    if (filters.minValue && holding.value < parseFloat(filters.minValue))
      return false;
    if (filters.maxValue && holding.value > parseFloat(filters.maxValue))
      return false;
    return matchesSearch;
  });

  const totalValue = filteredHoldings.reduce(
    (sum, holding) => sum + parseFloat(holding.value.replace(/,/g, "")),
    0
  );
  const totalReturn = filteredHoldings.reduce(
    (sum, holding) => sum + parseFloat(holding.return.replace(/[+,]/g, "")),
    0
  );

  return (
    <div className="space-y-6">
      {/* 搜尋和篩選工具列 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                placeholder="搜尋股票..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button className="ml-4 p-2 text-gray-500 hover:text-gray-700">
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setFilters((f) => ({ ...f, profitOnly: !f.profitOnly }))
              }
              className={`px-3 py-1.5 rounded ${
                filters.profitOnly
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100"
              }`}
            >
              獲利持股
            </button>
            <button
              onClick={() =>
                setFilters((f) => ({ ...f, lossOnly: !f.lossOnly }))
              }
              className={`px-3 py-1.5 rounded ${
                filters.lossOnly ? "bg-red-100 text-red-800" : "bg-gray-100"
              }`}
            >
              虧損持股
            </button>
          </div>
        </div>
      </div>

      {/* 持股統計摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">總市值</div>
          <div className="text-2xl font-bold">
            NT$ {totalValue.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">總報酬</div>
          <div
            className={`text-2xl font-bold ${
              totalReturn >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            NT$ {totalReturn >= 0 ? "+" : ""}
            {totalReturn.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">持股數</div>
          <div className="text-2xl font-bold">{filteredHoldings.length}</div>
        </div>
      </div>

      {/* 持股明細表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* ...existing table header code... */}
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHoldings.map((holding) => (
                <tr
                  key={holding.symbol}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectStock(holding)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {holding.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {holding.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {holding.shares.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    NT$ {holding.avgPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    NT$ {holding.currentPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    NT$ {holding.value}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      parseFloat(holding.return) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {holding.return}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      parseFloat(holding.returnPercentage) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {holding.returnPercentage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Holdings;
