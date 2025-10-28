import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="text-center py-12">
        <div className="w-12 h-12 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">正在載入數據</h3>
        <p className="text-gray-500">請稍候，正在處理股票資訊...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
