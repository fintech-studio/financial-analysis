import React, { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
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
    <div className="p-6">
      {/* 標題區域 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-3">
            <ChartBarIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              投資組合管理
            </h3>
            <p className="text-sm text-gray-500">追蹤與管理您的投資項目</p>
          </div>
        </div>
        <button
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          title="新增投資項目"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      {/* 投資組合總覽卡片 */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 mb-6 border border-blue-100 shadow-lg">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">
                總投資金額
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ${totalValue.toLocaleString()}
            </div>
            <div className="text-xs text-green-600 font-medium">
              +12.3% 總收益
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DocumentChartBarIcon className="h-6 w-6 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">
                持倉數量
              </span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {portfolioItems.length}
            </div>
            <div className="text-xs text-gray-500">個投資項目</div>
          </div>
        </div>

        {/* 績效指標 */}
        <div className="mt-6 pt-6 border-t border-blue-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500 mb-1">今日損益</div>
              <div className="text-sm font-semibold text-green-600">+$234</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">總收益率</div>
              <div className="text-sm font-semibold text-blue-600">+8.7%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">風險評級</div>
              <div className="text-sm font-semibold text-orange-600">中等</div>
            </div>
          </div>
        </div>
      </div>

      {/* 新增項目表單 */}
      {isAddingNew && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 mb-6 border border-gray-200 shadow-lg animate-slideIn">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-3">
              <PlusIcon className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">新增投資項目</h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                股票代碼
              </label>
              <input
                type="text"
                placeholder="例: AAPL, TSMC"
                value={newItem.symbol}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    symbol: e.target.value.toUpperCase(),
                  }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                股票編號
              </label>
              <input
                type="text"
                placeholder="例: 2330"
                value={newItem.stockCode}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, stockCode: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                投資金額 (USD)
              </label>
              <input
                type="number"
                placeholder="1000"
                value={newItem.amount || ""}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    amount: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 bg-white transition-all duration-200"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleAddItem}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                確認新增
              </button>
              <button
                onClick={() => setIsAddingNew(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium transition-all duration-200"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 投資組合列表 */}
      <div className="space-y-4 mb-6">
        {portfolioItems.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
            <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              尚未有投資項目
            </h4>
            <p className="text-sm text-gray-500 mb-4">開始建立您的投資組合</p>
            <button
              onClick={() => setIsAddingNew(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg"
            >
              新增第一個投資項目
            </button>
          </div>
        ) : (
          portfolioItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-4">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      {item.symbol}
                    </h4>
                    <p className="text-sm text-gray-500">#{item.stockCode}</p>
                    <div className="mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                  title="移除項目"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">投資金額</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${item.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">當前損益</div>
                  <div className="text-xl font-bold text-green-600">+$234</div>
                  <div className="text-sm font-medium text-green-600">
                    +2.34%
                  </div>
                </div>
              </div>

              {/* 進度條 */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>績效表現</span>
                  <span>+8.7%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: "67%" }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 快速操作按鈕 */}
      {portfolioItems.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <div className="flex items-center justify-center">
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              重新平衡
            </div>
          </button>
          <button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <div className="flex items-center justify-center">
              <BanknotesIcon className="h-5 w-5 mr-2" />
              導出報告
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default PortfolioSection;
