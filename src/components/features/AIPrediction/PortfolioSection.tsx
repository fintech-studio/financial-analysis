import React, { useState } from "react";
import { PlusIcon, TrashIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import type { PortfolioItem } from "@/types/prediction";

interface PortfolioSectionProps {
  portfolioItems: PortfolioItem[];
  setPortfolioItems: React.Dispatch<React.SetStateAction<PortfolioItem[]>>;
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  portfolioItems,
  setPortfolioItems,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState({
    symbol: "",
    stockCode: "",
    amount: 0,
  });

  const handleAddItem = () => {
    if (newItem.symbol && newItem.amount > 0) {
      const item: PortfolioItem = {
        ...newItem,
        status: "進行中",
        date: new Date().toLocaleString("zh-TW"),
      };
      setPortfolioItems((prev) => [...prev, item]);
      setNewItem({ symbol: "", stockCode: "", amount: 0 });
      setIsAddingNew(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    setPortfolioItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "已完成":
        return "bg-green-100 text-green-800";
      case "進行中":
        return "bg-blue-100 text-blue-800";
      case "暫停":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalValue = portfolioItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">投資組合</h3>
        </div>
        <button
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {/* 投資組合總覽 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">總投資金額</p>
            <p className="text-2xl font-bold text-gray-900">
              ${totalValue.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">持倉數量</p>
            <p className="text-2xl font-bold text-blue-600">
              {portfolioItems.length}
            </p>
          </div>
        </div>
      </div>

      {/* 新增項目表單 */}
      {isAddingNew && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-gray-900 mb-3">新增投資項目</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="股票代碼 (例: AAPL)"
              value={newItem.symbol}
              onChange={(e) =>
                setNewItem((prev) => ({
                  ...prev,
                  symbol: e.target.value.toUpperCase(),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="股票編號"
              value={newItem.stockCode}
              onChange={(e) =>
                setNewItem((prev) => ({ ...prev, stockCode: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="投資金額 (USD)"
              value={newItem.amount || ""}
              onChange={(e) =>
                setNewItem((prev) => ({
                  ...prev,
                  amount: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAddItem}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                確認新增
              </button>
              <button
                onClick={() => setIsAddingNew(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 投資組合列表 */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {portfolioItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p>尚未有投資項目</p>
            <p className="text-sm">點擊右上角的 + 按鈕新增</p>
          </div>
        ) : (
          portfolioItems.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{item.symbol}</h4>
                  <p className="text-sm text-gray-500">#{item.stockCode}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    ${item.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">+2.34%</p>
                  <p className="text-xs text-gray-500">今日損益</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 快速操作按鈕 */}
      {portfolioItems.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm">
            重新平衡
          </button>
          <button className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors text-sm">
            導出報告
          </button>
        </div>
      )}
    </div>
  );
};

export default PortfolioSection;
