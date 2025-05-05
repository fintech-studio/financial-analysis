import React from "react";

const MarketOverviewCard = ({ title, value, change, changePercent }) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">{value}</span>
        <div className="flex items-center">
          <span
            className={`inline-flex items-center ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 7.828V20h-2V7.828l-5.364 5.364-1.414-1.414L12 4l7.778 7.778-1.414 1.414L13 7.828z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 16.172V4h-2v12.172l-5.364-5.364-1.414 1.414L12 20l7.778-7.778-1.414-1.414L13 16.172z" />
              </svg>
            )}
            <span className="ml-1">{Math.abs(changePercent).toFixed(2)}%</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarketOverviewCard;
