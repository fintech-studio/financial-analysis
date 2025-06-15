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
    { id: "settings" as ActiveTab, label: "交易設定" },
    { id: "portfolio" as ActiveTab, label: "投資組合" },
    { id: "analysis" as ActiveTab, label: "風險分析" },
  ];

  // 使用 useCallback 穩定標籤切換函數
  const handleTabClick = useCallback(
    (tabId: ActiveTab) => {
      setActiveTab(tabId);
    },
    [setActiveTab]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 標籤頁切換 */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 內容區域 */}
      <div className="min-h-[400px]">
        {activeTab === "settings" && (
          <TradingSettings
            modelSettings={modelSettings}
            onSettingChange={onSettingChange}
          />
        )}
        {activeTab === "portfolio" && (
          <PortfolioSection
            portfolioItems={portfolioItems}
            setPortfolioItems={setPortfolioItems}
          />
        )}
        {activeTab === "analysis" && <RiskAnalysis />}
      </div>
    </div>
  );
};

export default PredictionSidebar;
