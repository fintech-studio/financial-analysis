import React from "react";

export default function ProgressPanel({
  questionNumber,
  estimatedTotalQuestions,
  onCancel,
  sessionId,
  finished,
}: // profile,
// serverProfile,
{
  questionNumber: number;
  estimatedTotalQuestions: number;
  onCancel: () => void;
  sessionId: string | null;
  finished: boolean;
  profile: Record<string, number> | null;
  serverProfile: Record<string, number> | null;
}) {
  const activeStep = sessionId ? (finished ? 2 : 1) : 0;
  const progress = Math.min(
    100,
    (questionNumber / Math.max(1, estimatedTotalQuestions)) * 100 || 5
  );
  const remaining = Math.max(0, estimatedTotalQuestions - questionNumber);
  // const snapshotSource = serverProfile || profile || {};
  return (
    <aside
      className="md:col-span-1 bg-linear-to-b from-indigo-700 to-purple-700 text-white p-6 flex flex-col justify-between shadow-2xl"
      aria-label="進度欄"
    >
      <div>
        <h3 className="text-lg font-semibold mb-2 text-indigo-100">進度</h3>
        <div
          className="h-3 w-full bg-indigo-600/30 rounded-full mb-4"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="h-3 bg-green-400 rounded-full"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
        </div>

        <div className="text-sm text-indigo-100">
          第 {questionNumber} 題 - 共 {estimatedTotalQuestions} 題
        </div>
        <div className="mt-4 text-sm text-indigo-100">
          預估剩餘：約 {Math.max(1, remaining * 0.75).toFixed(0)} 分鐘
        </div>
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

      <div className="mt-6 flex flex-col gap-3">
        {/* quick profile snapshot */}
        {/* <div className="mb-4 bg-white/5 rounded-md p-3 text-sm">
          <div className="text-xs text-indigo-100 mb-2">快速檢視</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(snapshotSource).length === 0 ? (
              <div className="text-xs text-indigo-200">尚無資料</div>
            ) : (
              Object.entries(snapshotSource).map(([k, v]) => (
                <div
                  key={k}
                  className="text-xs px-2 py-1 rounded-md bg-white/10 text-indigo-100"
                >
                  {k}: {v}
                </div>
              ))
            )}
          </div>
        </div> */}
        <div className="text-xs text-indigo-200 wrap-break-words">
          {sessionId ? `Section ID: ${sessionId}` : "尚未啟動"}
        </div>
        <button
          className="w-full bg-white/10 border border-white/20 px-4 py-2 rounded-md text-sm hover:bg-white/20 text-left"
          onClick={onCancel}
          aria-label="取消測驗"
        >
          取消測驗
        </button>
      </div>
    </aside>
  );
}
