// src/components/features/AIPrediction/PredictionSidebar.tsx
import React, { useCallback } from "react";
import TradingSettings from "./TradingSettings";
import PortfolioSection from "./PortfolioSection";
import RiskAnalysis from "./RiskAnalysis";
import type {
  ModelSettings,
  PortfolioItem,
  ActiveTab,
} from "@/types/prediction";

interface PredictionSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  modelSettings: ModelSettings;
  onSettingChange: (setting: keyof ModelSettings) => void;
  portfolioItems: PortfolioItem[];
  setPortfolioItems: React.Dispatch<React.SetStateAction<PortfolioItem[]>>;
}

const PredictionSidebar: React.FC<PredictionSidebarProps> = ({
  activeTab,
  setActiveTab,
  modelSettings,
  onSettingChange,
  portfolioItems,
  setPortfolioItems,
}) => {
  const tabs = [
    { id: "settings" as ActiveTab, label: "交易設定", icon: "⚙️" },
    { id: "portfolio" as ActiveTab, label: "投資組合", icon: "📊" },
    { id: "analysis" as ActiveTab, label: "風險分析", icon: "⚠️" },
  ];

  // 使用 useCallback 穩定標籤切換函數
  const handleTabClick = useCallback(
    (tabId: ActiveTab) => {
      setActiveTab(tabId);
    },
    [setActiveTab]
  );

  return (
    <div className="overflow-hidden">
      {/* 標籤頁切換 - 重新設計 */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 py-4 px-3 text-center text-sm font-medium transition-all duration-200 relative ${
                activeTab === tab.id
                  ? "text-blue-600 bg-white shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 內容區域 */}
      <div className="min-h-[500px] bg-white">
        {activeTab === "settings" && (
          <div className="animate-fadeIn">
            <TradingSettings
              modelSettings={modelSettings}
              onSettingChange={onSettingChange}
            />
          </div>
        )}
        {activeTab === "portfolio" && (
          <div className="animate-fadeIn">
            <PortfolioSection
              portfolioItems={portfolioItems}
              setPortfolioItems={setPortfolioItems}
            />
          </div>
        )}
        {activeTab === "analysis" && (
          <div className="animate-fadeIn">
            <RiskAnalysis />
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionSidebar;
