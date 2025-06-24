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
    return price
      ? price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : "--";
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

  // 新增：根據 timeframe 顯示不同格式
  const formatDateByTimeframe = (datetime?: string) => {
    if (!datetime) return "--";
    try {
      let date = new Date(datetime);
      if (isNaN(date.getTime())) {
        const normalizedDatetime = datetime.replace("T", " ").replace("Z", "");
        date = new Date(normalizedDatetime);
      }
      if (isNaN(date.getTime())) return datetime;
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      if (timeframe === "1d") {
        return `${year}/${month}/${day}`;
      } else {
        const hour = String(date.getUTCHours()).padStart(2, "0");
        const minute = String(date.getUTCMinutes()).padStart(2, "0");
        return `${year}/${month}/${day} ${hour}:${minute}`;
      }
    } catch (error) {
      return datetime;
    }
  };

  const isPositive = stats.change >= 0;

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        {/* 左側：圖標與標題 */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-center">
            <ArrowTrendingUpIcon className="h-7 w-7 text-gray-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight mb-1">
              {symbol}
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <span className="font-medium">
                {timeframe === "1d" ? "日線" : "小時線"}
              </span>
              <span className="hidden sm:inline">|</span>
              <span>最後更新：{formatDateByTimeframe(stats.datetime)}</span>
            </div>
          </div>
        </div>
        {/* 右側：價格與漲跌幅 */}
        <div className="text-right min-w-[120px] flex flex-col items-end justify-center">
          <div
            className={`text-3xl font-extrabold mb-1 ${
              isPositive ? "text-red-600" : "text-green-600"
            }`}
          >
            {formatPrice(stats.latest)}
          </div>
          <div
            className={`flex items-center text-base font-semibold ${
              isPositive ? "text-red-600" : "text-green-600"
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
            {stats.changePercent ? stats.changePercent.toFixed(2) : "0.00"}% )
          </div>
        </div>
      </div>

      {/* OHLCV Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
          <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            開盤 (O)
          </span>
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(stats.open_price || stats.open)}
          </span>
        </div>
        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
          <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            最高 (H)
          </span>
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(stats.high)}
          </span>
        </div>
        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
          <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            最低 (L)
          </span>
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(stats.low)}
          </span>
        </div>
        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
          <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            收盤 (C)
          </span>
          <span
            className={`text-lg font-bold ${
              isPositive ? "text-red-600" : "text-green-600"
            }`}
          >
            {formatPrice(stats.latest)}
          </span>
        </div>
        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
          <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            成交量 (V)
          </span>
          <span className="text-lg font-bold text-gray-900">
            {formatVolume(stats.volume)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TradingCard;
