import React, { useState, useEffect, JSX } from "react";
import {
  PlayIcon,
  PauseIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BellIcon,
  BellSlashIcon,
} from "@heroicons/react/24/outline";

// TypeScript 型別定義
interface Stock {
  symbol: string;
  name: string;
  price: number;
  volume: string;
}

interface PriceUpdate {
  price: string;
  change: string;
  changePercent: string;
  volume: string;
  timestamp: string;
}

interface RealTimeMonitorProps {
  watchList: Stock[];
  onUpdateWatchList?: (watchList: Stock[]) => void;
}

const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({
  watchList,
  onUpdateWatchList,
}) => {
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [priceUpdates, setPriceUpdates] = useState<Record<string, PriceUpdate>>(
    {}
  );

  // 模擬即時價格更新
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMonitoring) {
      interval = setInterval(() => {
        const updates: Record<string, PriceUpdate> = {};
        watchList.forEach((stock) => {
          // 模擬價格變動 (-2% 到 +2%)
          const changePercent = (Math.random() - 0.5) * 4;
          const newPrice = stock.price * (1 + changePercent / 100);
          updates[stock.symbol] = {
            price: newPrice.toFixed(2),
            change: (newPrice - stock.price).toFixed(2),
            changePercent: changePercent.toFixed(2),
            volume: Math.floor(Math.random() * 10000) + "K",
            timestamp: new Date().toLocaleTimeString(),
          };
        });
        setPriceUpdates(updates);
      }, 2000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMonitoring, watchList]);

  const handleToggleAlert = (symbol: string): void => {
    setAlerts((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const getPriceChangeColor = (change: string): string => {
    return parseFloat(change) >= 0 ? "text-green-600" : "text-red-600";
  };

  const getPriceChangeIcon = (change: string): JSX.Element => {
    return parseFloat(change) >= 0 ? (
      <ArrowUpIcon className="h-4 w-4" />
    ) : (
      <ArrowDownIcon className="h-4 w-4" />
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">即時監控</h3>
            <p className="text-sm text-gray-500 mt-1">
              監控您關注的股票即時價格變動
            </p>
          </div>
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isMonitoring
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {isMonitoring ? (
              <>
                <PauseIcon className="h-4 w-4 mr-2" />
                停止監控
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                開始監控
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6">
        {watchList.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <BellIcon className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 text-sm">
              您的監控清單是空的，請先添加要監控的股票
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {watchList.map((stock) => {
              const update = priceUpdates[stock.symbol];
              const currentPrice = update
                ? update.price
                : stock.price.toString();
              const priceChange = update ? update.change : "0.00";
              const changePercent = update ? update.changePercent : "0.00";

              return (
                <div
                  key={stock.symbol}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-900 mr-2">
                          {stock.symbol} {stock.name}
                        </h4>
                        <button
                          onClick={() => handleToggleAlert(stock.symbol)}
                          className={`p-1 rounded-full transition-colors ${
                            alerts.includes(stock.symbol)
                              ? "text-yellow-500 hover:text-yellow-600"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {alerts.includes(stock.symbol) ? (
                            <BellIcon className="h-4 w-4" />
                          ) : (
                            <BellSlashIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 block">當前價格</span>
                          <span className="font-medium text-gray-900">
                            ${currentPrice}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">漲跌金額</span>
                          <div
                            className={`flex items-center ${getPriceChangeColor(
                              priceChange
                            )}`}
                          >
                            {getPriceChangeIcon(priceChange)}
                            <span className="ml-1 font-medium">
                              {priceChange}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 block">漲跌幅</span>
                          <span
                            className={`font-medium ${getPriceChangeColor(
                              changePercent
                            )}`}
                          >
                            {changePercent}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">成交量</span>
                          <span className="font-medium text-gray-900">
                            {update ? update.volume : stock.volume}
                          </span>
                        </div>
                      </div>

                      {update && (
                        <div className="mt-2 text-xs text-gray-400">
                          更新時間: {update.timestamp}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isMonitoring && watchList.length > 0 && (
          <div className="mt-6 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <p className="ml-3 text-sm text-green-700">
                即時監控已啟用 - 每2秒更新一次價格
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeMonitor;
