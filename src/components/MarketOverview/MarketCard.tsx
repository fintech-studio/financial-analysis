import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRightIcon, FireIcon } from "@heroicons/react/24/outline";

interface MarketCardProps {
  icon: React.ReactNode;
  name: string;
  value: string;
  change: string;
  changePercent: string;
  metrics: Array<{
    label: string;
    value: string;
    colorClass?: string;
  }>;
  highlight?: string;
  bgColor: string;
  textColor: string;
  detailsLink: string;
  iconBgColor: string;
}

const MarketCard = ({
  icon,
  name,
  value,
  change,
  changePercent,
  metrics,
  highlight,
  bgColor,
  textColor,
  detailsLink,
  iconBgColor,
}: MarketCardProps) => {
  function getTrendIcon(changePercent: string): React.ReactNode {
    const value = parseFloat(changePercent.replace("%", ""));
    if (value > 0) {
      return <span className="text-green-500">▲</span>;
    } else if (value < 0) {
      return <span className="text-red-500">▼</span>;
    } else {
      return <span className="text-gray-500">—</span>;
    }
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${bgColor} rounded-lg`}>{icon}</div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        </div>
        <Link
          href={detailsLink}
          className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
        >
          詳細分析
          <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-4xl font-bold text-gray-900">{value}</span>
        <span
          className={`${
            change.includes("+") ? "text-green-500" : "text-red-500"
          } font-semibold flex items-center`}
        >
          {getTrendIcon(changePercent)}
          <span className="ml-1">{changePercent}</span>
        </span>
      </div>
      <div className="space-y-3 text-sm">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-500">{metric.label}</span>
            <span
              className={`font-medium ${metric.colorClass || "text-gray-900"}`}
            >
              {metric.value}
            </span>
          </div>
        ))}
        {highlight && (
          <div
            className={`mt-4 p-3 ${bgColor} hover:bg-opacity-75 transition-colors cursor-pointer rounded-lg`}
          >
            <p className={`text-sm ${textColor} flex items-start`}>
              <FireIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              {highlight}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MarketCard;
