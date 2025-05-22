import React from "react";
import {
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { getStatusColor, getStatusBadgeColor } from "@/utils/statusHelpers";

const CoinAnalysis = ({
  searchQuery,
  setSearchQuery,
  filterStrength,
  setFilterStrength,
  filteredCoins,
}) => {
  return (
    <div className="space-y-6">
      {/* 幣種篩選器 */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">幣種分析</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜尋幣種..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterStrength("all")}
                className={`px-3 py-2 ${
                  filterStrength === "all"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                } rounded-lg text-sm`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterStrength("強勢")}
                className={`px-3 py-2 ${
                  filterStrength === "強勢"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                } rounded-lg text-sm`}
              >
                強勢
              </button>
              <button
                onClick={() => setFilterStrength("中性")}
                className={`px-3 py-2 ${
                  filterStrength === "中性"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                } rounded-lg text-sm`}
              >
                中性
              </button>
              <button
                onClick={() => setFilterStrength("弱勢")}
                className={`px-3 py-2 ${
                  filterStrength === "弱勢"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                } rounded-lg text-sm`}
              >
                弱勢
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 幣種卡片 */}
      {filteredCoins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCoins.map((coin) => (
            <CoinCard key={coin.symbol} coin={coin} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            未找到相符的幣種
          </h3>
          <p className="text-gray-500">請嘗試不同的搜尋條件或篩選器</p>
        </div>
      )}
    </div>
  );
};

// 幣種卡片子元件
const CoinCard = ({ coin }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div
        className={`h-2 ${
          coin.strength === "強勢"
            ? "bg-green-500"
            : coin.strength === "弱勢"
            ? "bg-red-500"
            : "bg-yellow-500"
        }`}
      ></div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div
              className={`p-2 ${getStatusBadgeColor(
                coin.strength
              )} rounded-lg mr-3`}
            >
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {coin.name}
              </h3>
              <div className="text-sm text-gray-500">{coin.symbol}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">${coin.price}</div>
            <div
              className={`text-sm font-medium ${getStatusColor(
                coin.change.startsWith("+") ? "up" : "down"
              )}`}
            >
              {coin.change}
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{coin.description}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">24h成交量</div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium text-gray-900">
                {coin.volume}
              </div>
              <div
                className={`text-xs ${getStatusColor(
                  coin.volumeChange.startsWith("+") ? "up" : "down"
                )}`}
              >
                {coin.volumeChange}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">市值</div>
            <div className="text-lg font-medium text-gray-900">
              {coin.marketCap}
            </div>
            <div className="text-xs text-gray-500">
              市占率: {coin.dominance}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <span
              className={`px-2 py-1 text-xs font-medium ${getStatusBadgeColor(
                coin.strength
              )} rounded-full`}
            >
              {coin.strength}
            </span>
          </div>
          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
            詳細分析
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinAnalysis;
