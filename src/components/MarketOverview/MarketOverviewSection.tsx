import React, { useState } from "react";
import Link from "next/link";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  GlobeAsiaAustraliaIcon,
  BuildingOfficeIcon,
  ChartPieIcon,
  SparklesIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { MarketOverview } from "@/types/market";
import MarketCard from "@/components/MarketOverview/MarketCard";

type MetricItem = {
  label: string;
  value: string;
  colorClass?: string;
};

interface MarketData extends Record<string, any> {
  name: string;
  value?: string;
  change?: string;
  changePercent?: string;
  volume?: string;
  highlights?: string;
  trend?: string;
}

interface MarketCardProps {
  data: MarketData;
  config: {
    icon: React.ElementType;
    bgColor: string;
    textColor: string;
    href: string;
    id: string;
  };
}

const MarketMetrics: React.FC<{ data: MarketData; id: string }> = ({
  data,
  id,
}) => {
  // 依據不同市場類型返回對應的指標配置
  const getMetrics = (): MetricItem[] => {
    const metrics: MetricItem[] = [];

    if (id === "stock") {
      data.upDownRatio &&
        metrics.push({ label: "漲跌比", value: data.upDownRatio });
      data.volume && metrics.push({ label: "成交量", value: data.volume });
    } else if (id === "crypto") {
      data.marketCap && metrics.push({ label: "市值", value: data.marketCap });
      data.dominance &&
        metrics.push({ label: "市佔率", value: data.dominance });
    } else if (id === "global") {
      data.vix && metrics.push({ label: "VIX指數", value: data.vix });
      data.trend &&
        metrics.push({
          label: "趨勢",
          value: data.trend,
          colorClass: data.trend === "上漲" ? "text-green-600" : "text-red-600",
        });
    } else if (id === "realEstate") {
      // 修正房市指標的顯示邏輯
      if (data.volume) {
        metrics.push({ label: "成交量", value: data.volume });
      }
      if (data.trend) {
        metrics.push({
          label: "趨勢",
          value: data.trend,
          colorClass: data.trend === "上漲" ? "text-green-600" : "text-red-600",
        });
      }
    } else if (["futures", "nft"].includes(id)) {
      data.turnover &&
        metrics.push({ label: "成交金額", value: data.turnover });
      data.trend &&
        metrics.push({
          label: "趨勢",
          value: data.trend,
          colorClass: data.trend === "上漲" ? "text-green-600" : "text-red-600",
        });
    }

    return metrics;
  };

  const metrics = getMetrics();

  return (
    <div className="space-y-2">
      {metrics.map((metric, index) => (
        <div key={index} className="flex justify-between text-sm">
          <span className="text-gray-500">{metric.label}</span>
          <span
            className={`font-medium ${metric.colorClass || "text-gray-900"}`}
          >
            {metric.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const MarketCardComponent: React.FC<MarketCardProps> = ({ data, config }) => {
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 ${config.bgColor} rounded-lg`}>
            <Icon className={`h-5 w-5 ${config.textColor}`} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">{data.name}</h3>
        </div>
        <Link
          href={config.href}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          詳細分析 {">"}
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold text-gray-900">
            {config.id === "crypto" && "$"}
            {data.value || data.volume}
          </span>
          <span
            className={`text-sm font-medium flex items-center gap-1 ${
              data.changePercent?.includes("+")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {data.changePercent?.includes("+") ? (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4" />
            )}
            {data.changePercent}
          </span>
        </div>

        <MarketMetrics data={data} id={config.id} />

        {data.highlights && (
          <div className={`${config.bgColor} p-3 rounded-lg`}>
            <p className={`text-sm ${config.textColor} flex items-start gap-2`}>
              <FireIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{data.highlights}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface MarketOverviewSectionProps {
  data: MarketOverview;
}

const MarketOverviewSection: React.FC<MarketOverviewSectionProps> = ({
  data,
}) => {
  const [timeRange, setTimeRange] = useState("1D");
  const timeRanges = ["1D", "1W", "1M", "3M", "6M"];

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

  const getMetricsForCard = (marketData: any, id: string) => {
    const metrics = [];
    if (id === "stock") {
      marketData.upDownRatio &&
        metrics.push({ label: "漲跌比", value: marketData.upDownRatio });
      marketData.volume &&
        metrics.push({ label: "成交量", value: marketData.volume });
    } else if (id === "crypto") {
      marketData.marketCap &&
        metrics.push({ label: "市值", value: marketData.marketCap });
      marketData.dominance &&
        metrics.push({ label: "市佔率", value: marketData.dominance });
    } else if (id === "global") {
      marketData.vix &&
        metrics.push({ label: "VIX指數", value: marketData.vix });
      marketData.trend &&
        metrics.push({
          label: "趨勢",
          value: marketData.trend,
          colorClass:
            marketData.trend === "上漲" ? "text-green-600" : "text-red-600",
        });
    } else if (id === "realEstate") {
      marketData.volume &&
        metrics.push({ label: "成交量", value: marketData.volume });
      marketData.trend &&
        metrics.push({
          label: "趨勢",
          value: marketData.trend,
          colorClass:
            marketData.trend === "上漲" ? "text-green-600" : "text-red-600",
        });
    } else if (["futures", "nft"].includes(id)) {
      marketData.turnover &&
        metrics.push({ label: "成交金額", value: marketData.turnover });
      marketData.trend &&
        metrics.push({
          label: "趨勢",
          value: marketData.trend,
          colorClass:
            marketData.trend === "上漲" ? "text-green-600" : "text-red-600",
        });
    }
    return metrics;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            市場概況
          </h2>
          <p className="mt-2 text-gray-600">即時掌握全球金融市場動態</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2 overflow-x-auto scrollbar-thin">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    range === timeRange
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
          <Link
            href="/market-analysis"
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
          >
            查看完整分析
            <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketConfigs.map((config) => {
          const marketData = data[config.id as keyof MarketOverview];
          if (!marketData) return null;

          return (
            <MarketCard
              key={config.id}
              icon={<config.icon className={`h-5 w-5 ${config.textColor}`} />}
              name={marketData.name}
              value={
                "value" in marketData
                  ? marketData.value
                  : marketData.volume || ""
              }
              change={marketData.change || ""}
              changePercent={marketData.changePercent || ""}
              metrics={getMetricsForCard(marketData, config.id)}
              highlight={marketData.highlights || ""}
              bgColor={config.bgColor}
              textColor={config.textColor}
              iconBgColor={config.bgColor}
              detailsLink={config.href}
            />
          );
        })}
      </div>
    </>
  );
};

export default MarketOverviewSection;
