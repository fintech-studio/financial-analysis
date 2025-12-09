import React from "react";

export default function ProgressPanel({
  questionNumber,
  estimatedTotalQuestions,
  onCancel,
  sessionId,
  finished,
}: {
  questionNumber: number;
  estimatedTotalQuestions: number;
  onCancel: () => void;
  sessionId: string | null;
  finished: boolean;
}) {
  const activeStep = sessionId ? (finished ? 2 : 1) : 0;
  const progress = Math.min(
    100,
    (questionNumber / Math.max(1, estimatedTotalQuestions)) * 100 || 5
  );
  return (
    <aside className="md:col-span-1 bg-linear-to-b from-indigo-700 to-purple-700 text-white p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold mb-2">進度</h3>
        <div className="h-3 w-full bg-indigo-600/30 rounded-full mb-4">
          <div
            className="h-3 bg-green-400 rounded-full"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
        </div>

        <div className="text-sm text-indigo-100">
          第 {questionNumber + 1} 題
        </div>
        <div className="mt-4 text-sm text-indigo-100">預估剩餘時間：5 分鐘</div>
        <div className="mt-6 text-sm text-indigo-100">
          請如實回答，系統將分析您的心理傾向與壓力來源。
        </div>
        <div className="mt-4 text-xs text-indigo-200">
          <ol className="flex items-center justify-between">
            {["啟動", "問答", "結果"].map((s, idx) => (
              <li key={s} className="flex-1 text-center">
                <div
                  className={`mx-auto w-7 h-7 flex items-center justify-center rounded-full ${
                    idx === activeStep
                      ? "bg-white text-indigo-700"
                      : "bg-white/10 text-indigo-200"
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="mt-1 text-[10px]">{s}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="mt-6">
        <button
          className="w-full bg-white/10 border border-white/20 px-4 py-2 rounded-md text-sm hover:bg-white/20"
          onClick={onCancel}
        >
          取消測驗
        </button>
      </div>
    </aside>
  );
}
