import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import IndustryCard from "./IndustryCard";
import { SectorPerformance } from "@/types/market";

interface IndustrySectionProps {
  sectors: SectorPerformance[];
}

const IndustrySection = ({ sectors }: IndustrySectionProps) => {
  return (
    <section className="py-16 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">產業表現</h2>
            <p className="mt-2 text-gray-600">掌握各產業板塊動態與領先個股</p>
          </div>
          <Link
            href="/market-analysis/stock"
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            查看完整分析
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sectors.map((sector, i) => (
            <IndustryCard key={i} {...sector} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustrySection;
