import { ReactNode } from "react";
import { getStatusColor } from "@/utils/marketHelpers";

interface SentimentCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  change: string;
  status: string;
  iconBgColor: string;
  iconColor: string;
  description: string; // Added optional description property
}

const SentimentCard = ({
  icon,
  title,
  value,
  change,
  status,
  iconBgColor,
  iconColor,
  description,
}: SentimentCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-2 ${iconBgColor} rounded-lg`}>
          <div className={`h-6 w-6 ${iconColor}`}>{icon}</div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-4xl font-bold text-gray-900">{value}</span>
        <span className="text-green-500 font-semibold">{change}</span>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
          status
        )} bg-opacity-10`}
      >
        {status}
      </span>
    </div>
  );
};

export default SentimentCard;
