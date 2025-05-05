import { CubeIcon } from "@heroicons/react/24/outline";
import { getStatusColor } from "@/utils/marketHelpers";

interface NFTCategoryCardProps {
  name: string;
  volume: string;
  changePercent: string;
  trend: string;
  iconBgColor: string;
  iconColor: string;
}

const NFTCategoryCard = ({
  name,
  volume,
  changePercent,
  trend,
  iconBgColor,
  iconColor,
}: NFTCategoryCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${iconBgColor} rounded-lg`}>
            <CubeIcon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        </div>
        <span className="text-green-500 font-semibold">{changePercent}</span>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">成交量</span>
          <span className="font-medium text-gray-900">{volume}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">趨勢</span>
          <span className={`font-medium ${getStatusColor(trend)}`}>
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NFTCategoryCard;
