import React from "react";
import Link from "next/link";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  GlobeAsiaAustraliaIcon,
  BuildingOfficeIcon,
  ChartPieIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const MarketCard = ({ data, config }) => {
  const Icon = config.icon;
  return (
    <Link href={config.href}>
      <div
        className={`${config.bgColor} rounded-xl p-6 hover:shadow-lg transition-shadow`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
          <Icon className={`h-6 w-6 ${config.textColor}`} />
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {data.value}
            </span>
            <span
              className={`text-sm font-medium ${
                data.changePercent?.startsWith("+")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {data.changePercent}
            </span>
          </div>
          <div className="text-sm text-gray-500">成交量：{data.volume}</div>
          {data.highlights && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {data.highlights}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

const MarketOverviewSection = ({ marketData }) => {
  const marketConfigs = [
    {
      id: "stock",
      icon: ChartBarIcon,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      href: "/market-analysis/stock",
    },
    {
      id: "crypto",
      icon: CurrencyDollarIcon,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      href: "/market-analysis/crypto",
    },
    {
      id: "global",
      icon: GlobeAsiaAustraliaIcon,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      href: "/market-analysis/global",
    },
    {
      id: "realEstate",
      icon: BuildingOfficeIcon,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      href: "/market-analysis/real-estate",
    },
    {
      id: "futures",
      icon: ChartPieIcon,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      href: "/market-analysis/futures",
    },
    {
      id: "nft",
      icon: SparklesIcon,
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      href: "/market-analysis/nft",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {marketConfigs.map((config) => {
        const data = marketData[config.id];
        if (!data) return null;
        return <MarketCard key={config.id} data={data} config={config} />;
      })}
    </div>
  );
};

export default MarketOverviewSection;
