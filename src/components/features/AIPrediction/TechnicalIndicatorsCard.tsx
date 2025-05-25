// src/components/features/AIPrediction/TechnicalIndicatorsCard.tsx
import React from "react";
import { ChartPieIcon } from "@heroicons/react/24/outline";
import type { TechnicalIndicator } from "@/types/prediction";

interface TechnicalIndicatorsCardProps {
  indicators: TechnicalIndicator[];
}

const TechnicalIndicatorsCard: React.FC<TechnicalIndicatorsCardProps> = ({
  indicators,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {indicators.map((indicator, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">{indicator.name}</div>
              <div
                className={`text-lg font-semibold ${
                  indicator.valueColor || "text-gray-900"
                }`}
              >
                {indicator.value}
              </div>
              <div className={`text-xs ${indicator.statusColor}`}>
                {indicator.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechnicalIndicatorsCard;
