// src/components/features/AIPrediction/TimeRangeButtons.tsx
import React from "react";
import type { TimeRange } from "@/types/prediction";

interface TimeRangeButtonsProps {
  currentRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const TimeRangeButtons: React.FC<TimeRangeButtonsProps> = ({
  currentRange,
  onRangeChange,
}) => {
  const ranges: TimeRange[] = ["1D", "1W", "1M", "3M", "1Y"];

  return (
    <div className="mb-3 mt-4 flex flex-wrap gap-2">
      {ranges.map((range) => (
        <button
          key={range}
          onClick={() => onRangeChange(range)}
          className={`px-3 py-1 ${
            currentRange === range
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          } rounded-md text-sm font-medium transition-colors`}
        >
          {range}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeButtons;
