import React, { useState, useEffect } from "react";
import { AIPredictionController } from "@/controllers/AIPredictionController";

interface StockRecommendation {
  symbol: string;
  name: string;
  price: string;
  change: string;
  confidence: number;
  reason: string;
  action: "買入" | "賣出" | "持有";
  targetPrice: string;
  sector: string;
  riskLevel: "低" | "中等" | "高";
  investmentStyle: "價值投資" | "成長投資" | "混合";
  expectedReturn: number;
  timeframe: string;
}

interface SectorRotation {
  sector: string;
  trend: "上升" | "下降" | "持平";
  confidence: number;
  description: string;
  keyStocks: string[];
}

interface InvestmentStrategy {
  type: "價值投資" | "成長投資";
  description: string;
  criteria: string[];
  recommendations: StockRecommendation[];
  performance: {
    monthlyReturn: number;
    riskScore: number;
    sharpeRatio: number;
  };
}

interface UserRiskProfile {
  type: "保守" | "穩健" | "積極" | "激進";
  riskTolerance: number; // 0-100
  investmentHorizon: "短期" | "中期" | "長期";
  preferences: string[];
}

const SmartStockRecommendations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "hot" | "personalized" | "sector" | "strategy"
  >("hot");
  const [userRiskProfile, setUserRiskProfile] = useState<UserRiskProfile>({
    type: "穩健",
    riskTolerance: 60,
    investmentHorizon: "中期",
    preferences: ["科技股", "ESG投資"],
  });
  const [loading, setLoading] = useState(false);

  // AI推薦的熱門股票
  const [hotStocks, setHotStocks] = useState<StockRecommendation[]>([
    {
      symbol: "NVDA",
      name: "輝達",
      price: "$455.78",
      change: "+3.1%",
      confidence: 91,
      reason: "AI晶片需求強勁，Q4財報超預期",
      action: "買入",
      targetPrice: "$485.00",
      sector: "科技",
      riskLevel: "中等",
      investmentStyle: "成長投資",
      expectedReturn: 15.3,
      timeframe: "3-6個月",
    },
    {
      symbol: "TSMC",
      name: "台積電",
      price: "NT$580.00",
      change: "+2.2%",
      confidence: 87,
      reason: "先進製程技術領先，AI晶片代工需求旺盛",
      action: "買入",
      targetPrice: "NT$626.40",
      sector: "半導體",
      riskLevel: "低",
      investmentStyle: "價值投資",
      expectedReturn: 12.7,
      timeframe: "6-12個月",
    },
    {
      symbol: "MSFT",
      name: "微軟",
      price: "$378.85",
      change: "+1.8%",
      confidence: 85,
      reason: "雲端服務增長穩定，AI整合效益顯現",
      action: "持有",
      targetPrice: "$395.00",
      sector: "軟體",
      riskLevel: "低",
      investmentStyle: "混合",
      expectedReturn: 10.2,
      timeframe: "12個月",
    },
    {
      symbol: "AAPL",
      name: "蘋果",
      price: "$175.30",
      change: "+1.5%",
      confidence: 82,
      reason: "iPhone 15系列銷售表現穩定，服務營收成長",
      action: "持有",
      targetPrice: "$185.20",
      sector: "消費電子",
      riskLevel: "低",
      investmentStyle: "價值投資",
      expectedReturn: 8.9,
      timeframe: "6-9個月",
    },
  ]);

  // 個人化推薦
  const getPersonalizedRecommendations = (): StockRecommendation[] => {
    return hotStocks.filter((stock) => {
      // 根據風險偏好篩選
      if (userRiskProfile.type === "保守" && stock.riskLevel === "高")
        return false;
      if (userRiskProfile.type === "激進" && stock.riskLevel === "低")
        return false;

      // 根據偏好篩選
      if (
        userRiskProfile.preferences.includes("科技股") &&
        ["科技", "半導體", "軟體"].includes(stock.sector)
      )
        return true;

      return stock.riskLevel === "低" || stock.riskLevel === "中等";
    });
  };

  // 行業輪動預測
  const [sectorRotation, setSectorRotation] = useState<SectorRotation[]>([
    {
      sector: "科技股",
      trend: "上升",
      confidence: 78,
      description: "AI革命帶動科技股新一輪上升週期",
      keyStocks: ["NVDA", "MSFT", "GOOGL"],
    },
    {
      sector: "半導體",
      trend: "上升",
      confidence: 82,
      description: "AI晶片需求爆發，半導體進入景氣上升期",
      keyStocks: ["TSMC", "ASML", "AMD"],
    },
    {
      sector: "金融",
      trend: "持平",
      confidence: 65,
      description: "利率環境穩定，銀行股表現中性",
      keyStocks: ["JPM", "BAC", "WFC"],
    },
    {
      sector: "能源",
      trend: "下降",
      confidence: 71,
      description: "綠能轉型壓力，傳統能源面臨挑戰",
      keyStocks: ["XOM", "CVX", "BP"],
    },
  ]);

  // 投資策略建議
  const [investmentStrategies, setInvestmentStrategies] = useState<
    InvestmentStrategy[]
  >([
    {
      type: "價值投資",
      description: "尋找被低估的優質公司，注重基本面分析和長期價值",
      criteria: ["低本益比", "穩定股息", "強勁現金流", "優質管理團隊"],
      recommendations: hotStocks.filter(
        (s) => s.investmentStyle === "價值投資"
      ),
      performance: {
        monthlyReturn: 8.5,
        riskScore: 35,
        sharpeRatio: 1.2,
      },
    },
    {
      type: "成長投資",
      description: "投資高成長潛力公司，重視營收和獲利成長性",
      criteria: ["高營收成長率", "創新技術", "市場領導地位", "擴張潛力"],
      recommendations: hotStocks.filter(
        (s) => s.investmentStyle === "成長投資"
      ),
      performance: {
        monthlyReturn: 12.8,
        riskScore: 68,
        sharpeRatio: 0.9,
      },
    },
  ]);

  const controller = AIPredictionController.getInstance();

  const getActionColor = (action: string) => {
    switch (action) {
      case "買入":
        return "bg-green-100 text-green-800";
      case "賣出":
        return "bg-red-100 text-red-800";
      case "持有":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "低":
        return "text-green-600";
      case "中等":
        return "text-yellow-600";
      case "高":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "上升":
        return "text-green-600 bg-green-100";
      case "下降":
        return "text-red-600 bg-red-100";
      case "持平":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const renderStockCard = (stock: StockRecommendation, showDetails = true) => (
    <div
      key={stock.symbol}
      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{stock.symbol}</span>
          <span className="text-sm text-gray-600">{stock.name}</span>
          <span
            className={`text-sm px-2 py-1 rounded ${getActionColor(
              stock.action
            )}`}
          >
            {stock.action}
          </span>
          {showDetails && (
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
              {stock.sector}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            {stock.confidence}%
          </div>
          <div className="text-xs text-gray-500">信心度</div>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-2">
        <span className="text-lg font-semibold">{stock.price}</span>
        <span className="text-green-600">{stock.change}</span>
        <span className="text-sm text-gray-500">
          目標價: {stock.targetPrice}
        </span>
      </div>

      {showDetails && (
        <div className="flex items-center space-x-4 mb-2 text-sm">
          <span className="text-gray-600">
            風險:{" "}
            <span className={getRiskColor(stock.riskLevel)}>
              {stock.riskLevel}
            </span>
          </span>
          <span className="text-gray-600">
            預期報酬:{" "}
            <span className="text-green-600">+{stock.expectedReturn}%</span>
          </span>
          <span className="text-gray-600">時間框架: {stock.timeframe}</span>
        </div>
      )}

      <p className="text-sm text-gray-600 mb-2">{stock.reason}</p>

      {showDetails && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          💡 {stock.investmentStyle} - {stock.reason}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 標題和標籤導航 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">🎯 智能選股推薦</h3>
        <span className="text-sm text-gray-500">即時更新</span>
      </div>

      {/* 標籤導航 */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {(
          [
            { id: "hot", name: "🔥 熱門推薦" },
            { id: "personalized", name: "👤 個人化" },
            { id: "sector", name: "🔄 行業輪動" },
            { id: "strategy", name: "📈 投資策略" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* 熱門推薦標籤 */}
      {activeTab === "hot" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">AI 推薦熱門股票</h4>
            <div className="flex space-x-2">
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                4支推薦
              </span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                平均信心度: 86%
              </span>
            </div>
          </div>
          {hotStocks.map((stock) => renderStockCard(stock))}
        </div>
      )}

      {/* 個人化推薦標籤 */}
      {activeTab === "personalized" && (
        <div className="space-y-4">
          {/* 風險偏好設定 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-3">📊 您的投資偏好</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-blue-800 mb-1 block">
                  風險類型
                </label>
                <select
                  value={userRiskProfile.type}
                  onChange={(e) =>
                    setUserRiskProfile({
                      ...userRiskProfile,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full border border-blue-300 rounded px-2 py-1 text-sm"
                >
                  <option value="保守">保守型</option>
                  <option value="穩健">穩健型</option>
                  <option value="積極">積極型</option>
                  <option value="激進">激進型</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-blue-800 mb-1 block">
                  投資期限
                </label>
                <select
                  value={userRiskProfile.investmentHorizon}
                  onChange={(e) =>
                    setUserRiskProfile({
                      ...userRiskProfile,
                      investmentHorizon: e.target.value as any,
                    })
                  }
                  className="w-full border border-blue-300 rounded px-2 py-1 text-sm"
                >
                  <option value="短期">短期 (3個月內)</option>
                  <option value="中期">中期 (3-12個月)</option>
                  <option value="長期">長期 (1年以上)</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-blue-800 mb-1 block">
                  風險承受度
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={userRiskProfile.riskTolerance}
                    onChange={(e) =>
                      setUserRiskProfile({
                        ...userRiskProfile,
                        riskTolerance: parseInt(e.target.value),
                      })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm text-blue-800 w-8">
                    {userRiskProfile.riskTolerance}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">基於您偏好的推薦</h4>
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
              {userRiskProfile.type} • {userRiskProfile.investmentHorizon}
            </span>
          </div>
          {getPersonalizedRecommendations().map((stock) =>
            renderStockCard(stock)
          )}
        </div>
      )}

      {/* 行業輪動標籤 */}
      {activeTab === "sector" && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 mb-4">🔄 行業輪動預測</h4>
          {sectorRotation.map((sector, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {sector.sector}
                  </span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${getTrendColor(
                      sector.trend
                    )}`}
                  >
                    {sector.trend}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {sector.confidence}%
                  </div>
                  <div className="text-xs text-gray-500">信心度</div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{sector.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">關鍵股票:</span>
                  {sector.keyStocks.map((stock, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                    >
                      {stock}
                    </span>
                  ))}
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  查看詳情
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 投資策略標籤 */}
      {activeTab === "strategy" && (
        <div className="space-y-6">
          <h4 className="font-medium text-gray-900 mb-4">
            📈 價值投資 vs 成長投資建議
          </h4>

          {investmentStrategies.map((strategy, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {strategy.type}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      strategy.type === "價值投資"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {strategy.recommendations.length} 檔推薦
                  </span>
                </div>
                <div className="flex space-x-4 text-sm">
                  <span className="text-green-600">
                    月報酬: +{strategy.performance.monthlyReturn}%
                  </span>
                  <span className="text-yellow-600">
                    風險分數: {strategy.performance.riskScore}
                  </span>
                  <span className="text-blue-600">
                    夏普比率: {strategy.performance.sharpeRatio}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {strategy.description}
              </p>

              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  篩選標準:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {strategy.criteria.map((criterion, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                    >
                      {criterion}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-900">推薦股票:</h5>
                {strategy.recommendations.map((stock) =>
                  renderStockCard(stock, false)
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 操作按鈕 */}
      <div className="mt-6 flex justify-center space-x-3">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => setLoading(true)}
        >
          {loading ? "更新中..." : "獲取更多推薦"}
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          匯出推薦清單
        </button>
        <button className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">
          設定提醒
        </button>
      </div>
    </div>
  );
};

export default SmartStockRecommendations;
