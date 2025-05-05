import React from "react";
import { MarketOverview as MarketOverviewType } from "@/types/market";
import MarketCard from "@/components/MarketOverview/MarketCard";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  GlobeAsiaAustraliaIcon,
  BuildingOfficeIcon,
  ChartPieIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const MARKET_CONFIGS = [
  {
    id: "stock",
    icon: ChartBarIcon,
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    id: "crypto",
    icon: CurrencyDollarIcon,
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
  },
  {
    id: "global",
    icon: GlobeAsiaAustraliaIcon,
    bgColor: "bg-green-50",
    textColor: "text-green-600",
  },
  {
    id: "realEstate",
    icon: BuildingOfficeIcon,
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
  },
  {
    id: "futures",
    icon: ChartPieIcon,
    bgColor: "bg-red-50",
    textColor: "text-red-600",
  },
  {
    id: "nft",
    icon: SparklesIcon,
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
] as const;

interface MarketCardMetric {
  label: string;
  value: string;
}

const getMetricsForMarket = (
  data: any,
  marketId: string
): MarketCardMetric[] => {
  switch (marketId) {
    case "stock":
      return [
        { label: "成交量", value: data.volume },
        { label: "漲跌比", value: data.upDownRatio },
      ];
    case "crypto":
      return [
        { label: "市值", value: data.marketCap },
        { label: "市佔率", value: data.dominance },
      ];
    case "global":
      return [
        { label: "趨勢", value: data.trend },
        { label: "VIX指數", value: data.vix },
      ];
    case "realEstate":
      return [
        { label: "成交量", value: data.volume },
        { label: "趨勢", value: data.trend },
      ];
    case "futures":
    case "nft":
      return [
        { label: "成交金額", value: data.turnover },
        { label: "趨勢", value: data.trend },
      ];
    default:
      return [];
  }
};

interface MarketOverviewProps {
  data: MarketOverviewType;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({
  data,
  timeRange,
  onTimeRangeChange,
}) => {
  const timeRanges = ["1d", "1w", "1m", "3m", "6m"];

  return (
    <section className="py-12 bg-gray-50/80 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              市場概況
            </h2>
            <p className="mt-2 text-gray-600">即時掌握全球金融市場動態</p>
          </div>
          <div className="flex space-x-2 overflow-x-auto scrollbar-thin pb-2">
            {timeRanges.map((range) => (
              <button
                key={range}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  range === timeRange
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => onTimeRangeChange(range)}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MARKET_CONFIGS.map((config) => {
            const marketData = data[config.id];
            if (!marketData) return null;

            return (
              <MarketCard
                key={config.id}
                icon={<config.icon />}
                name={marketData.name}
                value={
                  "value" in marketData
                    ? marketData.value
                    : marketData.volume || ""
                }
                change={marketData.change}
                changePercent={marketData.changePercent}
                detailsLink={`/market-analysis/${config.id}`}
                iconBgColor={config.bgColor}
                bgColor={config.bgColor}
                textColor={config.textColor}
                metrics={getMetricsForMarket(marketData, config.id)}
                highlight={marketData.highlights}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MarketOverview;
