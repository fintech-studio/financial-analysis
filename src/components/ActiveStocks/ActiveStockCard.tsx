import { motion } from "framer-motion";
import { ChartBarIcon } from "@heroicons/react/24/outline";

interface ActiveStockCardProps {
  symbol: string;
  name: string;
  volume: string;
  volumeChange: string;
}

const ActiveStockCard = ({
  symbol,
  name,
  volume,
  volumeChange,
}: ActiveStockCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-sm text-blue-600 font-medium">{symbol}</span>
          <h3 className="text-lg font-bold">{name}</h3>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            volumeChange.includes("+")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {volumeChange}
        </span>
      </div>
      <div className="flex items-center text-sm text-gray-500">
        <ChartBarIcon className="h-4 w-4 mr-1" />
        成交量：{volume}
      </div>
    </motion.div>
  );
};

export default ActiveStockCard;
