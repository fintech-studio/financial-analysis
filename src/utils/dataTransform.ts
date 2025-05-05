import { MarketMetric, ChartData } from "@/types/market";

export const formatMarketMetric = (metric: MarketMetric) => {
  return {
    ...metric,
    formattedValue: metric.value.includes("%")
      ? metric.value
      : Number(metric.value).toLocaleString("zh-TW"),
    isPositive: metric.change.includes("+"),
  };
};

export const transformChartData = (data: ChartData) => {
  return {
    ...data,
    formattedDates: data.dates.map((date) =>
      new Date(date).toLocaleDateString("zh-TW")
    ),
    maxPrice: Math.max(...data.prices),
    minPrice: Math.min(...data.prices),
    priceChange: data.prices[data.prices.length - 1] - data.prices[0],
  };
};
