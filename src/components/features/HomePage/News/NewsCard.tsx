import { motion } from "framer-motion";
import { NewsItem } from "@/types/news";
import { getStatusColor } from "@/utils/marketHelpers";
import { NewspaperIcon } from "@heroicons/react/24/outline";

interface NewsCardProps {
  news: NewsItem;
  index: number;
  variant?: "important" | "latest";
}

const NewsCard = ({ news, index, variant = "important" }: NewsCardProps) => {
  if (variant === "latest") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            {news.category}
          </span>
          <span className="text-sm text-gray-500">{news.date}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
          {news.title}
        </h3>
        <div className="flex items-center text-sm text-gray-500">
          <NewspaperIcon className="h-4 w-4 mr-1" />
          {news.source}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
            {news.title}
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <span>{news.source}</span>
            <span className="mx-2">•</span>
            <span>{news.time}</span>
          </div>
        </div>
        {news.impact && (
          <span
            className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
              news.impact
            )} bg-opacity-10 ml-4`}
          >
            {news.impact}
          </span>
        )}
      </div>
      {news.summary && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {news.summary}
        </p>
      )}
    </motion.div>
  );
};

export default NewsCard;
