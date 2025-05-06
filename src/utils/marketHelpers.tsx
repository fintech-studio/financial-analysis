import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import {
  MARKET_STATUS,
  TREND_INDICATORS,
  STRENGTH_THRESHOLDS,
} from "@/constants/market/marketConstants";

export const getStatusColor = (status: string | undefined): string => {
  if (!status) return "text-gray-600";

  const statusLower = status.toLowerCase();
  if (MARKET_STATUS.POSITIVE.some((s) => s === statusLower)) {
    return "text-green-600";
  }
  if (MARKET_STATUS.NEGATIVE.some((s) => s === statusLower)) {
    return "text-red-600";
  }
  return "text-gray-600";
};

export const getStrengthColor = (strength: number): string => {
  if (strength >= STRENGTH_THRESHOLDS.HIGH) return "bg-green-500";
  if (strength >= STRENGTH_THRESHOLDS.MEDIUM) return "bg-yellow-500";
  return "bg-red-500";
};

export const getTrendIcon = (trend: string) => {
  if (TREND_INDICATORS.UP.some((t) => trend.includes(t))) {
    return <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />;
  }
  if (TREND_INDICATORS.DOWN.some((t) => trend.includes(t))) {
    return <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />;
  }
  return <ChartBarIcon className="h-5 w-5 text-blue-600" />;
};

// 新增格式化函數
export const formatNumber = (
  value: number,
  options: {
    decimals?: number;
    prefix?: string;
    suffix?: string;
  } = {}
): string => {
  const { decimals = 0, prefix = "", suffix = "" } = options;
  return `${prefix}${value.toLocaleString("zh-TW", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
};

export const formatPercentage = (value: number): string => {
  return formatNumber(value, { decimals: 2, suffix: "%" });
};

export const formatCurrency = (value: number): string => {
  return formatNumber(value, { prefix: "$" });
};
