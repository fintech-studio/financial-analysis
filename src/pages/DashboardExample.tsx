import React, { useState, useEffect } from "react";
import { UserController } from "../controllers/UserController";
import { PortfolioController } from "../controllers/PortfolioController";
import { StockController } from "../controllers/StockController";
import { User } from "../models/UserModel";
import { Portfolio } from "../models/PortfolioModel";
import { Stock } from "../models/StockModel";

// 使用 MVC 架構的範例頁面
const DashboardPage: React.FC = () => {
  // 狀態管理
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [hotStocks, setHotStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 控制器實例
  const userController = new UserController();
  const portfolioController = new PortfolioController();
  const stockController = new StockController();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 模擬用戶 ID
      const userId = "user_001";

      // 並行載入數據
      const [userResult, portfolioResult, hotStocksResult] =
        await Promise.allSettled([
          userController.getUserProfile(userId),
          portfolioController.getPortfolio(userId),
          stockController.getHotStocks(),
        ]);

      // 處理用戶數據
      if (userResult.status === "fulfilled") {
        setUser(userResult.value);
      } else {
        console.error("載入用戶資料失敗:", userResult.reason);
      }

      // 處理投資組合數據
      if (portfolioResult.status === "fulfilled") {
        setPortfolio(portfolioResult.value);
      } else {
        console.error("載入投資組合失敗:", portfolioResult.reason);
      }

      // 處理熱門股票數據
      if (hotStocksResult.status === "fulfilled") {
        setHotStocks(hotStocksResult.value);
      } else {
        console.error("載入熱門股票失敗:", hotStocksResult.reason);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "載入數據失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleStockSearch = async (query: string) => {
    try {
      const results = await stockController.searchStocks({ query, limit: 10 });
      console.log("搜尋結果:", results);
      // 這裡可以更新搜尋結果的狀態
    } catch (error) {
      console.error("搜尋失敗:", error);
    }
  };

  const handleAddTransaction = async (
    symbol: string,
    type: "buy" | "sell",
    quantity: number,
    price: number
  ) => {
    try {
      if (!user) return;

      const transaction = await portfolioController.addTransaction(user.id, {
        symbol,
        type,
        quantity,
        price,
        date: new Date().toISOString().split("T")[0],
      });

      console.log("交易新增成功:", transaction);

      // 重新載入投資組合數據
      const updatedPortfolio = await portfolioController.getPortfolio(user.id);
      setPortfolio(updatedPortfolio);
    } catch (error) {
      console.error("新增交易失敗:", error);
      setError(error instanceof Error ? error.message : "新增交易失敗");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800">載入失敗</h3>
            <p className="mt-2 text-red-600">{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              重新載入
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 用戶歡迎區塊 */}
        {user && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              歡迎回來，{user.name}！
            </h1>
            <p className="text-gray-600">
              {user.level} • {user.location} • {user.joinDate}
            </p>
          </div>
        )}

        {/* 投資組合概覽 */}
        {portfolio && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                總資產價值
              </h3>
              <p className="text-3xl font-bold text-green-600">
                NT$ {portfolio.totalValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                今日變動: {portfolio.dayChangePercent > 0 ? "+" : ""}
                {portfolio.dayChangePercent}%
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                總報酬
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                NT$ {portfolio.totalReturn.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                報酬率:{" "}
                {((portfolio.totalReturn / portfolio.totalValue) * 100).toFixed(
                  2
                )}
                %
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                持股數量
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {portfolio.holdings.length}
              </p>
              <p className="text-sm text-gray-500">支股票</p>
            </div>
          </div>
        )}

        {/* 熱門股票 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">熱門股票</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hotStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {stock.symbol}
                    </h4>
                    <p className="text-sm text-gray-600">{stock.name}</p>
                  </div>
                  <button
                    onClick={() =>
                      handleAddTransaction(
                        stock.symbol,
                        "buy",
                        100,
                        parseFloat(stock.price)
                      )
                    }
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                  >
                    買入
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{stock.price}</span>
                  <span
                    className={`text-sm ${
                      stock.changePercent.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stock.changePercent}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 搜尋功能示例 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">股票搜尋</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="輸入股票代號或名稱..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleStockSearch((e.target as HTMLInputElement).value);
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector(
                  "input"
                ) as HTMLInputElement;
                if (input) handleStockSearch(input.value);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              搜尋
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
