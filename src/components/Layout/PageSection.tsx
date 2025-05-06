import { SPACING } from "@/constants/layout/config";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface PageSectionProps {
  title: string;
  description?: string;
  moreLink?: string;
  moreLinkText?: string;
  className?: string;
  children: React.ReactNode;
}

const PageSection = ({
  title,
  description,
  moreLink,
  moreLinkText = "查看更多",
  className = "",
  children,
}: PageSectionProps) => {
  return (
    <section
      className={`py-0 bg-gray-50/80 border-y border-gray-100 ${className}`}
    >
      <div className={`${SPACING.container} ${SPACING.section.px}`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {title}
            </h2>
            {description && <p className="mt-2 text-gray-600">{description}</p>}
          </div>
          {moreLink && (
            <Link
              href={moreLink}
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm group"
            >
              {moreLinkText}
              <ChevronRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
};

export default PageSection;
