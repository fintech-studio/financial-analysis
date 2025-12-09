import React from "react";
import RadarChart from "./RadarChart";
import ShareExportButtons from "./ShareExportButtons";

export default function ResultsPanel({
  advice,
  serverProfile,
  profile,
  investorType,
  onReset,
}: {
  advice: string | null;
  serverProfile: {
    risk: number;
    stability: number;
    confidence: number;
    patience: number;
    sensitivity: number;
  } | null;
  profile: {
    risk: number;
    stability: number;
    confidence: number;
    patience: number;
    sensitivity: number;
  };
  investorType: string | null;
  onReset: () => void;
}) {
  const finalProfile = serverProfile || profile;

  return (
    <section
      aria-labelledby="result-heading"
      className="bg-white rounded-xl shadow-lg animate-slideIn"
    >
      <header className="border-b border-gray-200 px-6 py-4 bg-linear-to-r from-green-50 to-emerald-50">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-linear-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2
            id="result-heading"
            className="text-xl font-semibold text-gray-800"
          >
            測驗完成 — 個人化建議
          </h2>
        </div>
      </header>

      <div className="p-6" id="psychology-report">
        <div className="mb-6">
          <div className="bg-linear-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
              您的綜合心理報告
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <aside
                className="md:col-span-2 bg-white rounded-lg p-4 shadow-sm"
                aria-label="AI 建議"
              >
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  AI 建議
                </h4>
                <div className="text-gray-700 leading-relaxed font-sans text-lg">
                  {advice ? (
                    <pre className="whitespace-pre-wrap">{advice}</pre>
                  ) : (
                    <div className="text-gray-500">目前沒有建議內容。</div>
                  )}
                </div>
              </aside>

              <div
                className="md:col-span-1 bg-white rounded-lg p-4 shadow-sm text-center"
                aria-label="互動分析"
              >
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  互動分析
                </h4>
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-sm">
                    <RadarChart values={finalProfile} size={280} />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-gray-600">投資者類型</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {investorType || "綜合型（中庸平衡）"}
                  </div>
                </div>

                <div className="mt-4 text-left">
                  <div className="text-xs text-gray-500 mb-2">
                    指標（0-100）
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                    {Object.entries(finalProfile).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between items-center bg-gray-50 rounded-md px-3 py-2"
                      >
                        <div className="capitalize text-gray-600">
                          {k.replace(/([A-Z])/g, " $1")}
                        </div>
                        <div className="font-medium text-gray-800">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center space-x-4 mt-6">
          <ShareExportButtons
            exportRefId="psychology-report"
            title="我的心理檢測報告"
            description={advice || "我的投資心理檢測結果"}
          />
          <button
            onClick={onReset}
            className="bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 font-medium rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            重新測驗
          </button>
        </div>
      </div>
    </section>
  );
}
