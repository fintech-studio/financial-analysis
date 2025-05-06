import Link from "next/link";
import {
  ChevronRightIcon,
  FireIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";
import NewsCard from "./NewsCard";
import { NewsItem } from "@/types/news";

interface NewsSectionProps {
  marketNews: NewsItem[];
  latestNews: NewsItem[];
  selectedCategory: string;
  showAllNews: boolean;
  onCategoryChange: (category: string) => void;
  onToggleShowAll: () => void;
}

const NewsSection = ({
  marketNews,
  latestNews,
  selectedCategory,
  showAllNews,
  onCategoryChange,
  onToggleShowAll,
}: NewsSectionProps) => {
  const categories = ["全部", "財經", "科技", "產業"];

  return (
    <section className="py-12 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              市場新聞
            </h2>
            <p className="mt-2 text-gray-600">即時掌握重要市場訊息與最新動態</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2 overflow-x-auto scrollbar-thin">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      category === selectedCategory
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <Link
              href="/news"
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
            >
              查看全部新聞
              <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 重要市場新聞 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FireIcon className="h-5 w-5 mr-2 text-orange-500" />
              重要市場新聞
            </h3>
            <div className="space-y-4">
              {marketNews
                .slice(0, showAllNews ? marketNews.length : 3)
                .map((news, i) => (
                  <NewsCard key={i} news={news} index={i} variant="important" />
                ))}
              {marketNews.length > 3 && (
                <button
                  onClick={onToggleShowAll}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mx-auto"
                >
                  {showAllNews ? "顯示較少" : "查看更多新聞"}
                  <ChevronRightIcon
                    className={`h-4 w-4 ml-1 transition-transform ${
                      showAllNews ? "rotate-90" : ""
                    }`}
                  />
                </button>
              )}
            </div>
          </div>

          {/* 最新新聞 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <NewspaperIcon className="h-5 w-5 mr-2 text-blue-500" />
              最新消息
            </h3>
            <div className="space-y-4">
              {latestNews.map((news, index) => (
                <NewsCard
                  key={index}
                  news={news}
                  index={index}
                  variant="latest"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
