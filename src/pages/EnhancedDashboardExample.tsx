import React, { useState } from "react";
import {
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// MVC 架構引入
import { UserController } from "../controllers/UserController";
import { PortfolioController } from "../controllers/PortfolioController";
import { StockController } from "../controllers/StockController";
import { MarketController } from "../controllers/MarketController";
import { useMvcController, useDataLoader } from "../hooks/useMvcController";
import { User } from "../models/UserModel";
import { Portfolio } from "../models/PortfolioModel";

// 使用新的 MVC 架構和 Hook 的範例頁面
const EnhancedDashboardPage: React.FC = () => {
  // 控制器實例
  const userController = new UserController();
  const portfolioController = new PortfolioController();
  const stockController = new StockController();
  const marketController = MarketController.getInstance();

  // 使用 MVC Hook 管理狀態 - 添加正確的類型
  const {
    data: userData,
    loading: userLoading,
    error: userError,
    execute: executeUser,
  } = useMvcController<User>();

  const {
    data: portfolioData,
    loading: portfolioLoading,
    error: portfolioError,
    execute: executePortfolio,
  } = useMvcController<Portfolio>();

  // 使用 DataLoader Hook 自動載入市場數據
  const {
    data: marketData,
    loading: marketLoading,
    error: marketError,
  } = useDataLoader(
    () => marketController.getMarketSummary(),
    {
      overview: {
        stock: {
          name: "台股加權",
          value: "0",
          change: "0",
          changePercent: "0%",
          volume: "0",
          upDownRatio: "0",
          highlights: "",
        },
        crypto: {
          name: "比特幣",
          value: "0",
          change: "0",
          changePercent: "0%",
          marketCap: "0",
          dominance: "0%",
          highlights: "",
        },
        global: {
          name: "全球指數",
          value: "0",
          change: "0",
          changePercent: "0%",
          trend: "中性",
          vix: "0",
          highlights: "",
        },
      },
      hotStocks: [],
      latestNews: [],
      sentiment: {
        vix: {
          value: "0",
          change: "0",
          changePercent: "0%",
          status: "低波動",
          description: "",
        },
        fearGreed: {
          value: "0",
          change: "0",
          changePercent: "0%",
          status: "中性",
          description: "",
        },
        marketBreadth: {
          value: "0",
          change: "0",
          changePercent: "0%",
          status: "中性",
          description: "",
        },
      },
    }, // 提供正確的預設值結構
    {
      onSuccess: (data) => {
        console.log("市場數據載入成功:", data);
      },
      onError: (error) => {
        console.error("市場數據載入失敗:", error);
      },
    }
  );

  // 重新載入市場數據的函數
  const reloadMarketData = async () => {
    try {
      const newData = await marketController.getMarketSummary();
      console.log("市場數據重新載入成功:", newData);
    } catch (error) {
      console.error("市場數據重新載入失敗:", error);
    }
  };

  // 載入用戶資料
  const loadUserData = async () => {
    const userId = "user_001"; // 模擬用戶 ID

    await executeUser(() => userController.getUserProfile(userId), {
      onSuccess: (user) => {
        console.log("用戶資料載入成功:", user);
      },
      onError: (error) => {
        console.error("用戶資料載入失敗:", error);
      },
    });
  };

  // 載入投資組合數據
  const loadPortfolioData = async () => {
    const userId = "user_001";

    await executePortfolio(() => portfolioController.getPortfolio(userId), {
      onSuccess: (portfolio) => {
        console.log("投資組合載入成功:", portfolio);
      },
      onError: (error) => {
        console.error("投資組合載入失敗:", error);
      },
    });
  };

  // 批量搜尋股票
  const searchMultipleStocks = async () => {
    const searchTerms = ["2330", "2454", "2317"];

    try {
      const results = await Promise.allSettled(
        searchTerms.map((term) =>
          stockController.searchStocks({ query: term, limit: 1 })
        )
      );

      console.log("批量搜尋結果:", results);
    } catch (error) {
      console.error("批量搜尋失敗:", error);
    }
  };

  // 狀態指示器組件
  const StatusIndicator: React.FC<{
    loading: boolean;
    error: string | null;
    success: boolean;
  }> = ({ loading, error, success }) => {
    if (loading) {
      return (
        <div className="flex items-center text-blue-600">
          <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
          載入中...
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center text-red-600">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          {error}
        </div>
      );
    }

    if (success) {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          載入成功
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            增強版儀表板 (MVC 架構)
          </h1>
          <p className="text-gray-600">
            展示如何使用新的 MVC 架構和 React Hooks
          </p>
        </div>

        {/* 控制面板 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 用戶資料卡片 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
              用戶資料
            </h3>

            <StatusIndicator
              loading={userLoading}
              error={userError}
              success={!!userData && !userError}
            />

            {userData && (
              <div className="mt-4 space-y-2">
                <p>
                  <span className="font-medium">姓名:</span> {userData.name}
                </p>
                <p>
                  <span className="font-medium">等級:</span> {userData.level}
                </p>
                <p>
                  <span className="font-medium">地區:</span> {userData.location}
                </p>
              </div>
            )}

            <button
              onClick={loadUserData}
              disabled={userLoading}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {userLoading ? "載入中..." : "載入用戶資料"}
            </button>
          </div>

          {/* 投資組合卡片 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">投資組合</h3>

            <StatusIndicator
              loading={portfolioLoading}
              error={portfolioError}
              success={!!portfolioData && !portfolioError}
            />

            {portfolioData && (
              <div className="mt-4 space-y-2">
                <p>
                  <span className="font-medium">總價值:</span>
                  {portfolioData.totalValue?.toLocaleString()} TWD
                </p>
                <p>
                  <span className="font-medium">總報酬:</span>
                  {portfolioData.totalReturn?.toLocaleString()} TWD
                </p>
                <p>
                  <span className="font-medium">持股數量:</span>
                  {portfolioData.holdings?.length || 0}
                </p>
              </div>
            )}

            <button
              onClick={loadPortfolioData}
              disabled={portfolioLoading}
              className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {portfolioLoading ? "載入中..." : "載入投資組合"}
            </button>
          </div>

          {/* 市場數據卡片 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">市場數據</h3>

            <StatusIndicator
              loading={marketLoading}
              error={marketError}
              success={!!marketData && !marketError}
            />

            {marketData && (
              <div className="mt-4 space-y-2">
                <p>
                  <span className="font-medium">市場概況:</span>
                  {marketData.overview?.stock?.name || "N/A"}
                </p>
                <p>
                  <span className="font-medium">熱門股票:</span>
                  {marketData.hotStocks?.length || 0} 支
                </p>
                <p>
                  <span className="font-medium">最新新聞:</span>
                  {marketData.latestNews?.length || 0} 則
                </p>
              </div>
            )}

            <button
              onClick={reloadMarketData}
              disabled={marketLoading}
              className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {marketLoading ? "載入中..." : "重新載入市場數據"}
            </button>
          </div>
        </div>

        {/* 功能測試區域 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">功能測試</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={searchMultipleStocks}
              className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700"
            >
              批量搜尋股票 (2330, 2454, 2317)
            </button>

            <button
              onClick={() => {
                // 清除所有數據
                window.location.reload();
              }}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              重置頁面
            </button>
          </div>
        </div>

        {/* MVC 架構說明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">
            MVC 架構特點
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Model (模型)</h4>
              <p>處理數據邏輯、業務規則和數據驗證</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">View (視圖)</h4>
              <p>React 組件負責 UI 渲染和用戶交互</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Controller (控制器)</h4>
              <p>協調 Model 和 View，處理業務邏輯</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboardPage;
