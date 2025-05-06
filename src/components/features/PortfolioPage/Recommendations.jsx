import React from "react";
import {
  LightBulbIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const Recommendations = () => {
  const recommendations = [
    {
      type: "風險警告",
      message: "您的投資組合過於集中在科技股，建議適度分散投資",
      severity: "warning",
    },
    {
      type: "投資建議",
      message: "根據市場分析，建議可考慮增加防禦性產業的配置",
      severity: "info",
    },
    {
      type: "投資機會",
      message: "最近金融股評價具吸引力，可考慮逢低布局",
      severity: "success",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <LightBulbIcon className="h-6 w-6 text-yellow-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">AI 智能建議</h2>
      </div>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <ExclamationCircleIcon
                className={`h-5 w-5 mr-2 ${
                  rec.severity === "warning"
                    ? "text-yellow-500"
                    : rec.severity === "info"
                    ? "text-blue-500"
                    : "text-green-500"
                }`}
              />
              <span className="font-medium text-gray-900">{rec.type}</span>
            </div>
            <p className="text-gray-600">{rec.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
