import React from "react";
import Link from "next/link";
import {
  AcademicCapIcon,
  BookOpenIcon,
  PlayIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export interface EducationResource {
  id: string;
  title: string;
  type: "video" | "article" | "course" | "guide" | "tool";
  description?: string;
  imageUrl?: string;
  url: string;
  author?: string;
  duration?: string; // 可能是 "5分鐘" 或 "2小時"等
  level?: "beginner" | "intermediate" | "advanced";
  rating?: number; // 評分 (1-5)
  tags?: string[];
}

interface EducationResourceCardProps {
  resource: EducationResource;
}

const EducationResourceCard: React.FC<EducationResourceCardProps> = ({
  resource,
}) => {
  // 根據資源類型獲取圖標
  const getTypeIcon = (): JSX.Element => {
    switch (resource.type) {
      case "video":
        return <PlayIcon className="h-5 w-5 text-red-500" />;
      case "article":
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case "course":
        return <AcademicCapIcon className="h-5 w-5 text-purple-500" />;
      case "guide":
        return <BookOpenIcon className="h-5 w-5 text-green-500" />;
      case "tool":
        return <ChartBarIcon className="h-5 w-5 text-amber-500" />;
    }
  };

  // 獲取難度等級標籤
  const getLevelBadge = (): JSX.Element | null => {
    if (!resource.level) return null;

    const levelClasses = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-blue-100 text-blue-800",
      advanced: "bg-purple-100 text-purple-800",
    };

    const levelText = {
      beginner: "入門",
      intermediate: "中級",
      advanced: "進階",
    };

    return (
      <span
        className={`${
          levelClasses[resource.level]
        } text-xs px-2 py-0.5 rounded-full`}
      >
        {levelText[resource.level]}
      </span>
    );
  };

  // 顯示星級評分
  const renderRating = (): JSX.Element | null => {
    if (!resource.rating) return null;

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(resource.rating || 0)
                ? "text-amber-400 fill-current"
                : i < (resource.rating || 0)
                ? "text-amber-400 fill-current opacity-50"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({resource.rating})</span>
      </div>
    );
  };

  return (
    <Link href={resource.url} className="block group">
      <div className="flex items-start space-x-4">
        <div
          className={`flex-shrink-0 p-2 rounded-lg
          ${
            resource.type === "video"
              ? "bg-red-100"
              : resource.type === "article"
              ? "bg-blue-100"
              : resource.type === "course"
              ? "bg-purple-100"
              : resource.type === "guide"
              ? "bg-green-100"
              : "bg-amber-100"
          }
        `}
        >
          {getTypeIcon()}
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {resource.title}
          </h4>

          <div className="mt-1.5 flex flex-wrap items-center text-xs text-gray-500 gap-x-2 gap-y-1">
            {resource.author && <span>{resource.author}</span>}

            {resource.duration && (
              <div className="flex items-center">
                <ClockIcon className="h-3 w-3 mr-1" />
                <span>{resource.duration}</span>
              </div>
            )}

            {resource.level && getLevelBadge()}
          </div>

          {resource.rating && <div className="mt-1">{renderRating()}</div>}
        </div>
      </div>
    </Link>
  );
};

export default EducationResourceCard;
