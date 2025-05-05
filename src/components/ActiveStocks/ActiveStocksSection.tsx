import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import ActiveStockCard from "./ActiveStockCard";

interface ActiveStock {
  symbol: string;
  name: string;
  volume: string;
  volumeChange: string;
}

interface ActiveStocksSectionProps {
  stocks: ActiveStock[];
}

const ActiveStocksSection = ({ stocks }: ActiveStocksSectionProps) => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              活躍交易股票
            </h2>
            <p className="mt-2 text-gray-600">今日成交量最大的股票</p>
          </div>
          <Link
            href="/market-analysis/stock"
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
          >
            查看更多
            <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stocks.map((stock) => (
            <ActiveStockCard key={stock.symbol} {...stock} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActiveStocksSection;
