import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface EducationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor: string;
  iconColor: string;
}

const EducationCard = ({
  icon,
  title,
  description,
  iconBgColor,
  iconColor,
}: EducationCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-2 ${iconBgColor} rounded-lg`}>
          <div className={`h-6 w-6 ${iconColor}`}>{icon}</div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 mb-6">{description}</p>
      <Link
        href="/education"
        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
      >
        了解更多
        <ChevronRightIcon className="h-4 w-4 ml-1" />
      </Link>
    </div>
  );
};

export default EducationCard;
