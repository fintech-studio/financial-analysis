import React from "react";
import Footer from "@/components/Layout/Footer";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

const CryptoMarket: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題區域 */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              加密貨幣市場分析
            </h1>
            <p className="text-blue-100 mt-4 text-lg">
              此頁面正在重新設計中，敬請期待
            </p>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              頁面建構中
            </h2>
            <p className="text-gray-600 leading-relaxed">
              我們正在為您準備更好的加密貨幣市場分析功能，
              包含即時價格追蹤、技術分析圖表、市場趨勢預測等豐富內容。
            </p>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">預計完成時間：即將推出</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CryptoMarket;
