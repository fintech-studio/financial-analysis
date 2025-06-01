import React from "react";
import { CurrencyDollarIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

// TypeScript 型別定義
interface Coin {
  price: string;
  change: string;
}

interface Indicator {
  value: string;
  change: string;
}

interface MarketData {
  coins: Coin[];
  overview: {
    indicators: Indicator[];
  };
}

interface HeaderProps {
  lastUpdated: Date;
  onRefresh: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  marketData: MarketData;
}

interface MarketSummaryCardProps {
  title: string;
  value: string;
  change?: string;
  status?: string;
  statusColor?: string;
}

const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  onRefresh,
  activeTab,
  setActiveTab,
  marketData,
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-xl relative overflow-hidden">
      {/* 裝飾性背景元素 */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-5 rounded-full"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-white opacity-5 rounded-full"></div>
        <div className="absolute top-20 right-40 w-16 h-16 bg-white opacity-5 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* 頂部區域 - 標題和更新資訊 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-15 backdrop-blur-sm rounded-2xl shadow-lg mr-4">
              <CurrencyDollarIcon className="h-9 w-9 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                加密貨幣市場分析
              </h1>
              <p className="text-blue-100 mt-1 text-sm">
                全球加密貨幣市場行情與投資分析
              </p>
            </div>
          </div>

          <div className="flex items-center mt-4 md:mt-0">
            <div className="bg-indigo-800 bg-opacity-50 backdrop-blur-sm rounded-xl px-4 py-2 border border-indigo-400 border-opacity-30 flex items-center space-x-3">
              <ArrowPathIcon className="h-4 w-4 text-blue-200" />
              <div>
                <div className="text-xs text-blue-200">最後更新</div>
                <div className="text-sm font-medium text-white">
                  {lastUpdated.toLocaleString("zh-TW", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
            <button
              onClick={onRefresh}
              className="ml-3 p-2 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all"
            >
              <ArrowPathIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* 關鍵指標摘要 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <MarketSummaryCard
            title="比特幣"
            value={`$${marketData.coins[0].price}`}
            change={marketData.coins[0].change}
          />
          <MarketSummaryCard
            title="以太幣"
            value={`$${marketData.coins[1].price}`}
            change={marketData.coins[1].change}
          />
          <MarketSummaryCard
            title="24h成交量"
            value={marketData.overview.indicators[0].value}
            change={marketData.overview.indicators[0].change}
          />
          <MarketSummaryCard
            title="恐懼指數"
            value={marketData.overview.indicators[2].value}
            status="中等"
            statusColor="yellow"
          />
        </div>

        {/* 標籤導航 */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-1 inline-flex border border-white border-opacity-20">
          {[
            { id: "overview", name: "市場概況" },
            { id: "coins", name: "幣種分析" },
            { id: "factors", name: "影響因素" },
            { id: "forecast", name: "市場預測" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`${
                activeTab === tab.id
                  ? "bg-white text-indigo-700 shadow-md"
                  : "text-white hover:bg-white hover:bg-opacity-10"
              } px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 摘要卡片子元件
const MarketSummaryCard: React.FC<MarketSummaryCardProps> = ({
  title,
  value,
  change,
  status,
  statusColor,
}) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-3 border border-white border-opacity-20">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-blue-100">{title}</span>
        {change ? (
          <div
            className={`bg-opacity-20 rounded-full px-2 py-0.5 ${
              change.startsWith("+") ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <span
              className={`text-xs ${
                change.startsWith("+") ? "text-green-300" : "text-red-300"
              }`}
            >
              {change}
            </span>
          </div>
        ) : (
          status && (
            <div
              className={`bg-${statusColor}-500 bg-opacity-20 rounded-full px-2 py-0.5`}
            >
              <span className={`text-xs text-${statusColor}-300`}>
                {status}
              </span>
            </div>
          )
        )}
      </div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
};

export default Header;
