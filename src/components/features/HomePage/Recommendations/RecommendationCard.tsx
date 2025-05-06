import { motion } from "framer-motion";
import { StarIcon, LightBulbIcon } from "@heroicons/react/24/outline";

interface RecommendationCardProps {
  symbol: string;
  name: string;
  performance: string;
  reason: string;
}

const RecommendationCard = ({
  symbol,
  name,
  performance,
  reason,
}: RecommendationCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <StarIcon className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {symbol} {name}
            </h3>
          </div>
        </div>
        <span className="text-green-600 font-semibold">{performance}</span>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p className="flex items-center">
          <LightBulbIcon className="h-4 w-4 mr-1 text-yellow-500" />
          {reason}
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          查看詳情
        </button>
      </div>
    </motion.div>
  );
};

export default RecommendationCard;
