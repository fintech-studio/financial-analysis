import React, { useState } from "react";
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
import { portfolioData } from "../data/portfolio/portfolioData";

const PortfolioPage = () => {
  const [selectedHolding, setSelectedHolding] = useState(null);

  const tabs = [
    { id: "overview", name: "投資組合概覽", icon: ChartPieIcon },
    { id: "allocation", name: "資產配置", icon: ChartBarSquareIcon },
    { id: "holdings", name: "持倉明細", icon: CurrencyDollarIcon },
    { id: "performance", name: "績效分析", icon: ArrowTrendingUpIcon },
    { id: "history", name: "交易歷史", icon: ClockIcon },
    { id: "risk_ai", name: "風險與建議", icon: SparklesIcon },
  ];

  const [activeTab, setActiveTab] = useState("overview");

  const handleAddAsset = () => {};

  const handleExportReport = () => {};

  const handleRefreshData = () => {};

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
            <PortfolioOverview data={portfolioData.overview} />

            <PerformanceChart data={portfolioData.performance} timeRange="1M" />
          </div>
        )}

        {activeTab === "allocation" && (
          <div className="space-y-6">
            <AssetAllocation data={portfolioData.allocation} />
          </div>
        )}

        {activeTab === "holdings" && (
          <div className="space-y-6">
            <HoldingsTable
              holdings={portfolioData.holdings}
              onSelectHolding={setSelectedHolding}
              selectedHolding={selectedHolding}
            />
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-6">
            <PerformanceChart
              data={portfolioData.performance}
              timeRange="ALL"
              showBenchmark={true}
              showDetails={true}
            />
          </div>
        )}

        {activeTab === "history" && (
          <TransactionHistory transactions={portfolioData.transactions} />
        )}

        {/* 整合的風險評估與AI建議頁面 */}
        {activeTab === "risk_ai" && (
          <RiskAndRecommendations
            riskData={portfolioData.risk}
            aiData={portfolioData.aiRecommendations}
          />
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
