import React from "react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FaceSmileIcon,
  FaceFrownIcon,
} from "@heroicons/react/24/outline";

// 獲取顏色樣式，根據狀態
export const getStatusColor = (status) => {
  if (!status) return "text-blue-500";

  switch (status.toLowerCase()) {
    case "up":
    case "強勢":
    case "正面":
    case "偏多":
    case "多頭":
      return "text-green-500";
    case "down":
    case "弱勢":
    case "負面":
    case "偏空":
    case "空頭":
      return "text-red-500";
    case "neutral":
    case "中性":
    case "盤整":
      return "text-yellow-500";
    default:
      return "text-blue-500";
  }
};

// 獲取狀態徽章樣式
export const getStatusBadgeColor = (status) => {
  if (!status) return "bg-blue-100 text-blue-800";

  switch (status.toLowerCase()) {
    case "up":
    case "強勢":
    case "正面":
    case "偏多":
    case "多頭":
      return "bg-green-100 text-green-800";
    case "down":
    case "弱勢":
    case "負面":
    case "偏空":
    case "空頭":
      return "bg-red-100 text-red-800";
    case "neutral":
    case "中性":
    case "盤整":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

// 獲取趨勢圖示
export const getTrendIcon = (trend) => {
  if (trend === "up") {
    return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
  } else if (trend === "down") {
    return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
  } else {
    return <ChartBarIcon className="h-5 w-5 text-yellow-500" />;
  }
};

// 獲取情緒圖示
export const getSentimentIcon = (value) => {
  if (parseInt(value) > 50) {
    return <FaceSmileIcon className="h-6 w-6 text-green-500" />;
  } else {
    return <FaceFrownIcon className="h-6 w-6 text-red-500" />;
  }
};
