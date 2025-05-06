import React from "react";
import {
  BoltIcon,
  UserGroupIcon,
  ChartBarIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import SentimentCard from "./SentimentCard";
import Link from "next/link";
import { MarketSentiment } from "@/types/market";

interface SentimentSectionProps {
  sentiment: MarketSentiment;
}

const SentimentSection: React.FC<SentimentSectionProps> = ({ sentiment }) => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              市場情緒
            </h2>
            <p className="mt-2 text-gray-600">掌握市場投資氛圍與情緒指標</p>
          </div>
          <Link
            href="/market-analysis/market-sentiment"
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            查看完整分析
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SentimentCard
            icon={<BoltIcon />}
            title="VIX恐慌指數"
            value={sentiment.vix.value}
            change={sentiment.vix.change}
            status={sentiment.vix.status}
            description={sentiment.vix.description}
            iconBgColor="bg-yellow-50"
            iconColor="text-yellow-600"
          />
          <SentimentCard
            icon={<UserGroupIcon />}
            title="恐懼與貪婪指數"
            value={sentiment.fearGreed.value}
            change={sentiment.fearGreed.change}
            status={sentiment.fearGreed.status}
            description={sentiment.fearGreed.description}
            iconBgColor="bg-red-50"
            iconColor="text-red-600"
          />
          <SentimentCard
            icon={<ChartBarIcon />}
            title="市場廣度"
            value={sentiment.marketBreadth.value}
            change={sentiment.marketBreadth.change}
            status={sentiment.marketBreadth.status}
            description={sentiment.marketBreadth.description}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
        </div>
      </div>
    </div>
  );
};

export default SentimentSection;
