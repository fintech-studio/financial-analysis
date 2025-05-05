import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { getStrengthColor } from "@/utils/marketHelpers";

interface IndustryCardProps {
  name: string;
  change: string;
  strength: number;
  leadingStocks: string[];
}

const IndustryCard = ({
  name,
  change,
  strength,
  leadingStocks,
}: IndustryCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        </div>
        <span
          className={`text-lg font-semibold ${
            change.startsWith("+") ? "text-green-500" : "text-red-500"
          }`}
        >
          {change}
        </span>
      </div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">產業強度</span>
          <span className="text-sm font-medium text-gray-900">{strength}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${getStrengthColor(strength)}`}
            style={{ width: `${strength}%` }}
          ></div>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">領先個股</h4>
        <div className="flex flex-wrap gap-2">
          {leadingStocks.map((stock, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
            >
              {stock}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndustryCard;
