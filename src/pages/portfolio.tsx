import React, { useState, useEffect } from "react";
import {
  ChartPieIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ClockIcon,
  ChartBarSquareIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import PortfolioOverview from "../components/features/Portfolio/PortfolioOverview";
import AssetAllocation from "../components/features/Portfolio/AssetAllocation";
import HoldingsTable from "../components/features/Portfolio/HoldingsTable";
import PerformanceChart from "../components/features/Portfolio/PerformanceChart";
import TransactionHistory from "../components/features/Portfolio/TransactionHistory";
import RiskAndRecommendations from "../components/features/Portfolio/RiskAndRecommendations";

// MVC 架構引入
import { PortfolioController } from "../controllers/PortfolioController";
import { UserController } from "../controllers/UserController";
import { Portfolio } from "../models/PortfolioModel";
import { User } from "../models/UserModel";

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface Holding {
  symbol: string;
  name: string;
  price: string;
  priceChange: number;
  quantity: string;
  marketValue: string;
  costBasis: string;
  totalReturn: {
    value: string;
    percentage: string;
  };
  weight: string;
}

const PortfolioPage: React.FC = () => {
  const [selectedHolding, setSelectedHolding] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // MVC 架构相关状态
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 控制器实例
  const portfolioController = new PortfolioController();
  const userController = new UserController();

  const tabs: Tab[] = [
    { id: "overview", name: "投資組合概覽", icon: ChartPieIcon },
    { id: "allocation", name: "資產配置", icon: ChartBarSquareIcon },
    { id: "holdings", name: "持倉明細", icon: CurrencyDollarIcon },
    { id: "performance", name: "績效分析", icon: ArrowTrendingUpIcon },
    { id: "history", name: "交易歷史", icon: ClockIcon },
    { id: "risk_ai", name: "風險與建議", icon: SparklesIcon },
  ];

  // 載入投資組合數據
  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 模擬用戶 ID
      const userId = "user_001";

      // 並行載入用戶和投資組合數據
      const [userResult, portfolioResult] = await Promise.allSettled([
        userController.getUserProfile(userId),
        portfolioController.getPortfolio(userId),
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
        setError("載入投資組合失敗");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "載入數據失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (): Promise<void> => {
    try {
      if (!user) return;

      // 這裡可以打開一個模態框或導向新增資產頁面
      console.log("開啟新增資產功能");

      // 示例：新增一筆交易
      const newTransaction = await portfolioController.addTransaction(user.id, {
        symbol: "AAPL",
        type: "buy",
        quantity: 10,
        price: 150,
        date: new Date().toISOString().split("T")[0],
      });

      console.log("新增交易成功:", newTransaction);

      // 重新載入投資組合數據
      await loadPortfolioData();
    } catch (error) {
      console.error("新增資產失敗:", error);
      setError(error instanceof Error ? error.message : "新增資產失敗");
    }
  };

  const handleExportReport = async (): Promise<void> => {
    try {
      if (!user || !portfolio) return;

      const report = await portfolioController.exportReport(user.id, "pdf");

      console.log("匯出報表成功:", report);
    } catch (error) {
      console.error("匯出報表失敗:", error);
      setError(error instanceof Error ? error.message : "匯出報表失敗");
    }
  };

  const handleRefreshData = async (): Promise<void> => {
    await loadPortfolioData();
  };

  const handleSelectHolding = (symbol: string): void => {
    setSelectedHolding(symbol);
  };

  // 載入狀態
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">載入投資組合中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
            <h3 className="text-lg font-medium text-red-800">載入失敗</h3>
            <p className="mt-2 text-red-600">{error}</p>
            <button
              onClick={handleRefreshData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              重新載入
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 沒有投資組合數據
  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gray-100 rounded-lg p-8">
            <BanknotesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              尚未建立投資組合
            </h3>
            <p className="text-gray-600 mb-4">
              開始您的投資之旅，建立第一個投資組合
            </p>
            <button
              onClick={handleAddAsset}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              建立投資組合
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BanknotesIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">我的投資組合</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefreshData}
                className="p-2 text-gray-400 hover:text-gray-500"
                title="更新資料"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleExportReport}
                className="p-2 text-gray-400 hover:text-gray-500"
                title="匯出報表"
              >
                <DocumentTextIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleAddAsset}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                新增資產
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 導航標籤 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 內容區域 */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <PortfolioOverview
              data={{
                ...portfolio.overview,
                lastUpdate: portfolio.overview.lastUpdated,
                monthlyChange: "8.5",
                totalValue: portfolio.overview.totalValue.toString(),
                totalReturn: {
                  value: portfolio.overview.totalReturn.toString(),
                  percentage: "8.5%",
                },
              }}
            />
            <PerformanceChart
              data={{
                daily: {
                  labels: portfolio.performance.labels,
                  portfolio: portfolio.performance.portfolioValue,
                  benchmark: portfolio.performance.benchmarkValue,
                },
                weekly: {
                  labels: portfolio.performance.labels,
                  portfolio: portfolio.performance.portfolioValue,
                  benchmark: portfolio.performance.benchmarkValue,
                },
                monthly: {
                  labels: portfolio.performance.labels,
                  portfolio: portfolio.performance.portfolioValue,
                  benchmark: portfolio.performance.benchmarkValue,
                },
                returns: {
                  "1W": 2.5,
                  "1M": 8.5,
                  "3M": 12.3,
                  "6M": 18.7,
                  "1Y": 22.4,
                  YTD: 15.2,
                  ALL: 85.6,
                },
              }}
              timeRange="1M"
            />
          </div>
        )}

        {activeTab === "allocation" && (
          <div className="space-y-6">
            <AssetAllocation
              data={{
                byAssetClass: portfolio.allocation.map((item) => ({
                  name: item.category,
                  category: item.category,
                  value: item.value,
                  percentage: item.percentage,
                  color: item.color,
                })),
                bySector: [],
                byRegion: [],
                recommendations: [],
              }}
            />
          </div>
        )}

        {activeTab === "holdings" && (
          <div className="space-y-6">
            <HoldingsTable
              holdings={portfolio.holdings}
              onSelectHolding={handleSelectHolding}
              selectedHolding={selectedHolding || undefined}
            />
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-6">
            <PerformanceChart
              data={{
                daily: {
                  labels: portfolio.performance.labels,
                  portfolio: portfolio.performance.portfolioValue,
                  benchmark: portfolio.performance.benchmarkValue,
                },
                weekly: {
                  labels: portfolio.performance.labels,
                  portfolio: portfolio.performance.portfolioValue,
                  benchmark: portfolio.performance.benchmarkValue,
                },
                monthly: {
                  labels: portfolio.performance.labels,
                  portfolio: portfolio.performance.portfolioValue,
                  benchmark: portfolio.performance.benchmarkValue,
                },
                returns: {
                  "1W": 2.5,
                  "1M": 8.5,
                  "3M": 12.3,
                  "6M": 18.7,
                  "1Y": 22.4,
                  YTD: 15.2,
                  ALL: 85.6,
                },
              }}
              timeRange="ALL"
              showBenchmark={true}
              showDetails={true}
            />
          </div>
        )}

        {activeTab === "history" && (
          <TransactionHistory
            transactions={portfolio.transactions.map((transaction) => ({
              ...transaction,
              type: transaction.type === "buy" ? "買入" : "賣出",
              name: `交易 ${transaction.symbol}`,
              total: `${(
                transaction.amount + transaction.fee
              ).toLocaleString()}`,
              quantity: transaction.quantity.toString(),
              price: transaction.price.toString(),
            }))}
          />
        )}

        {/* 整合的風險評估與AI建議頁面 */}
        {activeTab === "risk_ai" && (
          <RiskAndRecommendations
            riskData={{
              metrics: {
                volatility: portfolio.risk.volatility,
                volatilityVsMarket: portfolio.risk.volatility * 0.8,
                sharpeRatio: portfolio.risk.sharpeRatio,
                maxDrawdown: portfolio.risk.maxDrawdown,
                maxDrawdownDate: "2024-03-15",
              },
              volatility: {
                labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
                portfolio: [12.5, 13.2, 15.8, 14.1, 13.7, 15.2],
                market: [10.2, 11.1, 12.8, 11.9, 11.4, 12.6],
              },
              drawdown: {
                labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
                values: [-2.1, -1.8, -4.2, -3.1, -1.5, -0.8],
              },
              riskFactors: {
                labels: ["市場風險", "信用風險", "流動性風險", "匯率風險"],
                values: [6.5, 3.2, 2.8, 4.1],
              },
              otherMetrics: [
                {
                  name: "Beta 係數",
                  value: portfolio.risk.beta.toString(),
                  status: "neutral" as const,
                  interpretation: "投資組合與市場的相關性",
                },
              ],
            }}
            aiData={{
              summary: "您的投資組合整體表現良好，建議適度調整配置以降低風險。",
              healthScore: 78,
              optimizationPotential: 15,
              recommendationLevel: 3,
              recommendations: portfolio.aiRecommendations.map((rec) => ({
                type:
                  rec.type === "buy"
                    ? "opportunity"
                    : rec.type === "sell"
                    ? "risk"
                    : rec.type === "rebalance"
                    ? "rebalance"
                    : "adjustment",
                title: rec.title,
                priority: rec.priority,
                description: rec.description,
                actions: rec.reasoning,
                impact: rec.expectedReturn
                  ? `預期報酬: ${(rec.expectedReturn * 100).toFixed(1)}%`
                  : undefined,
              })),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
