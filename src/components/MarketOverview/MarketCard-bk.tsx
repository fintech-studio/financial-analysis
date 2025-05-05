import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { FireIcon } from "@heroicons/react/24/solid";
import { getTrendIcon } from "@/utils/marketHelpers";

interface MarketCardProps {
  icon: React.ReactNode;
  name: string;
  value: string;
  change: string;
  changePercent: string;
  detailsLink: string;
  iconBgColor: string;
  iconColor: string;
  metrics: Array<{
    label: string;
    value: string;
  }>;
  highlight: string;
}

const MarketCard = ({
  icon,
  name,
  value,
  change,
  changePercent,
  detailsLink,
  iconBgColor,
  iconColor,
  metrics,
  highlight,
}: MarketCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${iconBgColor} rounded-lg`}>
            <div className={`h-6 w-6 ${iconColor}`}>{icon}</div>
          </div>
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
          className={`font-semibold flex items-center ${
            change.includes("+") ? "text-green-500" : "text-red-500"
          }`}
        >
          {getTrendIcon(changePercent)}
          <span className="ml-1">{changePercent}</span>
        </span>
      </div>

      <div className="space-y-3 text-sm">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-500">{metric.label}</span>
            <span className="font-medium text-gray-900">{metric.value}</span>
          </div>
        ))}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
          <p className="text-sm text-blue-700 flex items-start">
            <FireIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
            {highlight}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketCard;
