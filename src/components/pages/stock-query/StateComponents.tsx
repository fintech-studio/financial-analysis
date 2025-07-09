import React from "react";
import {
  ExclamationTriangleIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";

interface EmptyStateProps {
  onQuickSelect: (symbol: string) => void;
}

const POPULAR_STOCKS = [
  { symbol: "2330", name: "台積電" },
  { symbol: "2454", name: "聯發科" },
  { symbol: "2317", name: "鴻海" },
  { symbol: "AAPL", name: "Apple" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "NVDA", name: "NVIDIA" },
];

const EmptyState: React.FC<EmptyStateProps> = ({ onQuickSelect }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-8 py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <RocketLaunchIcon className="h-8 w-8 text-gray-600" />
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          開始股票分析
        </h2>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          輸入股票代號，獲得專業的技術分析和投資建議
        </p>

        <div className="max-w-lg mx-auto">
          <p className="text-sm text-gray-700 mb-4">熱門股票：</p>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_STOCKS.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => onQuickSelect(stock.symbol)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
              >
                {stock.symbol} {stock.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onClear: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, onClear }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            查詢遇到問題
          </h3>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-red-700 text-sm">{error}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
            >
              重新查詢
            </button>
            <button
              onClick={onClear}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              清除錯誤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { EmptyState, ErrorState };
