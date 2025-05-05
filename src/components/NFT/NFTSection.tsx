import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import NFTCategoryCard from "./NFTCategoryCard";
import { MarketOverview } from "@/types/market";

interface NFTSectionProps {
  categories: MarketOverview["nft"]["categories"];
}

const NFTSection = ({ categories }: NFTSectionProps) => {
  return (
    <section className="py-16 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">NFT分類</h2>
            <p className="mt-2 text-gray-600">了解不同類型的NFT市場動態</p>
          </div>
          <Link
            href="/market-analysis/nft"
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            查看完整分析
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <NFTCategoryCard
            name={categories.art.name}
            volume={categories.art.volume}
            changePercent={categories.art.changePercent}
            trend={categories.art.trend}
            iconBgColor="bg-pink-50"
            iconColor="text-pink-600"
          />
          <NFTCategoryCard
            name={categories.gaming.name}
            volume={categories.gaming.volume}
            changePercent={categories.gaming.changePercent}
            trend={categories.gaming.trend}
            iconBgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>
      </div>
    </section>
  );
};

export default NFTSection;
