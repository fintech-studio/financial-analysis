import React from "react";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

// TypeScript 類型定義
interface Stock {
  symbol: string;
  name: string;
  confidence: string;
  price: string;
  formation: string;
  target: string;
}

interface TechnicalPatternsProps {
  bullishStocks?: Stock[];
  bearishStocks?: Stock[];
  selectedPattern: string;
  setSelectedPattern: (pattern: string) => void;
}

const TechnicalPatterns: React.FC<TechnicalPatternsProps> = ({
  bullishStocks,
  bearishStocks,
  selectedPattern,
  setSelectedPattern,
}) => {
  // 技術形態類型選項
  const patternTypes: string[] = [
    "頭肩頂",
    "頭肩底",
    "雙頂",
    "雙底",
    "三角形整理",
    "旗形",
    "缺口",
    "島狀反轉",
  ];

  // 技術形態說明
  const patternDescriptions: Record<string, string> = {
    頭肩頂:
      "由三個高點組成的反轉形態，中間高點最高，表示目前趨勢可能由多轉空。",
    頭肩底:
      "由三個低點組成的反轉形態，中間低點最低，表示目前趨勢可能由空轉多。",
    雙頂: "價格兩次到達相似高點但無法突破，形成M形，通常是看空反轉信號。",
    雙底: "價格兩次到達相似低點並反彈，形成W形，通常是看多反轉信號。",
    三角形整理:
      "價格在收斂的高低點間波動，表示市場猶豫，突破方向將指示下一波趨勢。",
    旗形: "短暫的矩形整理區間，通常是強勁趨勢中的暫停，突破後將繼續原趨勢。",
    缺口: "價格在連續交易日之間形成的斷層，常伴隨重要的市場訊號。",
    島狀反轉: "由兩個缺口形成的模式，中間交易形成「島」，指示價格可能反轉。",
  };

  // 默認多頭股票數據
  const defaultBullishStocks: Stock[] = [
    {
      symbol: "2330",
      name: "台積電",
      confidence: "87%",
      price: "580.00",
      formation: "3日內",
      target: "645",
    },
    {
      symbol: "2454",
      name: "聯發科",
      confidence: "79%",
      price: "920.00",
      formation: "5日內",
      target: "980",
    },
    {
      symbol: "3008",
      name: "大立光",
      confidence: "68%",
      price: "2,340.00",
      formation: "上週",
      target: "2,500",
    },
  ];

  // 默認空頭股票數據
  const defaultBearishStocks: Stock[] = [
    {
      symbol: "2317",
      name: "鴻海",
      confidence: "81%",
      price: "105.50",
      formation: "2日內",
      target: "95.00",
    },
    {
      symbol: "2353",
      name: "宏碁",
      confidence: "74%",
      price: "28.05",
      formation: "昨日",
      target: "26.20",
    },
    {
      symbol: "1301",
      name: "台塑",
      confidence: "65%",
      price: "76.80",
      formation: "上週",
      target: "72.50",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">技術形態掃描</h3>
        <p className="text-sm text-gray-500 mt-1">
          自動偵測股票價格中的技術形態，提供交易參考
        </p>
      </div>

      <div className="p-6">
        {/* 形態選擇器 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {patternTypes.map((pattern) => (
            <button
              key={pattern}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                selectedPattern === pattern
                  ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                  : "bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300"
              }`}
              onClick={() => setSelectedPattern(pattern)}
            >
              {pattern}
            </button>
          ))}
        </div>

        {/* 形態說明 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <SparklesIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">
                {selectedPattern}
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                {patternDescriptions[selectedPattern] || "形態說明未提供。"}
              </p>
            </div>
          </div>
          {/* 形態示例圖 
          <div className="mt-3 flex justify-center">
            <img 
              src={getPatternChartUrl(selectedPattern)} 
              alt={`${selectedPattern} pattern`} 
              className="h-24 opacity-75" 
            />
          </div>
          */}
        </div>

        {/* 多頭形態股票 */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 mr-2" />
            <h4 className="text-sm font-medium text-gray-700">多頭形態股票</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    股票
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    形態確認度
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    價格
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    形成時間
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    形態目標
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {(bullishStocks || defaultBullishStocks).map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {stock.symbol}
                        </div>
                        <div className="text-xs text-gray-500">
                          {stock.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: stock.confidence }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {stock.confidence}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{stock.price}</td>
                    <td className="px-4 py-3 text-sm">{stock.formation}</td>
                    <td className="px-4 py-3 text-sm text-green-600">
                      {stock.target}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 空頭形態股票 */}
        <div>
          <div className="flex items-center mb-3">
            <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 mr-2" />
            <h4 className="text-sm font-medium text-gray-700">空頭形態股票</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    股票
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    形態確認度
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    價格
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    形成時間
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    形態目標
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {(bearishStocks || defaultBearishStocks).map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {stock.symbol}
                        </div>
                        <div className="text-xs text-gray-500">
                          {stock.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div
                            className="bg-red-500 h-1.5 rounded-full"
                            style={{ width: stock.confidence }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {stock.confidence}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{stock.price}</td>
                    <td className="px-4 py-3 text-sm">{stock.formation}</td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      {stock.target}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalPatterns;
