import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import EducationCard from "./EducationCard";

interface EducationContent {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor: string;
  iconColor: string;
}

interface EducationSectionProps {
  contents: EducationContent[];
}

const EducationSection = ({ contents }: EducationSectionProps) => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">理財知識</h2>
            <p className="mt-2 text-gray-600">提升您的投資理財能力</p>
          </div>
          <Link
            href="/education"
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            查看更多課程
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contents.map((content, index) => (
            <EducationCard key={index} {...content} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
