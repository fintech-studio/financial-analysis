import React from "react";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface StockStats {
  open_price?: number;
  open?: number; // 添加可能的開盤價欄位
  high: number;
  low: number;
  latest: number; // 收盤價使用 latest
  volume?: number;
  change: number;
  changePercent: number;
  isRising: boolean;
  datetime?: string;
}

interface TradingCardProps {
  symbol: string;
  stats: StockStats;
  timeframe: "1d" | "1h";
}

const TradingCard: React.FC<TradingCardProps> = ({
  symbol,
  stats,
  timeframe,
}) => {
  const formatVolume = (volume?: number): string => {
    if (!volume) return "N/A";
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toLocaleString();
  };

  const formatPrice = (price?: number): string => {
    return price ? `$${price.toFixed(2)}` : "--";
  };
  const formatDateTime = (datetime?: string): string => {
    if (!datetime) return "--";
    try {
      // 創建 Date 對象
      let date = new Date(datetime);

      if (isNaN(date.getTime())) {
        // 嘗試標準化格式
        const normalizedDatetime = datetime.replace("T", " ").replace("Z", "");
        date = new Date(normalizedDatetime);
      }

      if (isNaN(date.getTime())) {
        return datetime;
      }

      // 使用 UTC 方法手動格式化，避免時區自動轉換
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const hour = String(date.getUTCHours()).padStart(2, "0");
      const minute = String(date.getUTCMinutes()).padStart(2, "0");

      return `${year}/${month}/${day} ${hour}:${minute}`;
    } catch (error) {
      return datetime;
    }
  };

  const isPositive = stats.change >= 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <ChartBarIcon className="h-5 w-5 text-gray-600" />
          </div>{" "}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{symbol}</h2>
            <p className="text-sm text-gray-500">
              {timeframe === "1d" ? "日線" : "小時線"} - 最新數據
            </p>
            <p className="text-xs text-gray-400 mt-1">
              數據時間：{formatDateTime(stats.datetime)}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPrice(stats.latest)}
          </div>
          <div
            className={`flex items-center text-sm font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
            )}
            {isPositive ? "+" : ""}
            {stats.change ? stats.change.toFixed(2) : "0.00"} (
            {isPositive ? "+" : ""}
            {stats.changePercent ? stats.changePercent.toFixed(2) : "0.00"}%)
          </div>
        </div>
      </div>

      {/* OHLCV Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            開盤 (O)
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {formatPrice(stats.open_price || stats.open)}
          </p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            最高 (H)
          </p>
          <p className="text-lg font-semibold text-green-600">
            {formatPrice(stats.high)}
          </p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            最低 (L)
          </p>
          <p className="text-lg font-semibold text-red-600">
            {formatPrice(stats.low)}
          </p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            收盤 (C)
          </p>
          <p
            className={`text-lg font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatPrice(stats.latest)}
          </p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            成交量 (V)
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {formatVolume(stats.volume)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TradingCard;
