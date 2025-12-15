import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RadarChart from "./RadarChart";
import ShareExportButtons from "./ShareExportButtons";
import rehypeSanitize from "rehype-sanitize";

type ResultsPanelProps = {
  advice: string | null;
  serverProfile: {
    risk: number;
    stability: number;
    confidence: number;
    patience: number;
    sensitivity: number;
  } | null;
  serverAnalysis?: Record<string, unknown> | null;
  profile: {
    risk: number;
    stability: number;
    confidence: number;
    patience: number;
    sensitivity: number;
  };
  investorType: string | null;
  onReset: () => void;
};

export default function ResultsPanel({
  advice,
  serverProfile,
  serverAnalysis,
  profile,
  investorType,
  onReset,
}: ResultsPanelProps) {
  // props are typed via ResultsPanelProps
  const finalProfile = serverProfile || profile;
  const rawRadar = (serverAnalysis && serverAnalysis.radar) || finalProfile;
  const radarValues: Record<string, number> = Object.fromEntries(
    Object.entries(rawRadar || {}).map(([k, v]) => [k, Number(v ?? 0)])
  ) as Record<string, number>;
  const stressIndex = serverAnalysis ? serverAnalysis.stress_index : null;
  const timeHorizon = serverAnalysis ? serverAnalysis.time_horizon : null;
  const investorDesc = serverAnalysis
    ? serverAnalysis.investor_description
    : null;
  const investorDescStr = investorDesc ? String(investorDesc) : null;

  return (
    <div id="psychology-report">
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <aside
            className="md:col-span-2 bg-white rounded-lg p-4 shadow-md border"
            aria-label="AI 建議"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-700 mb-2 ml-2">
                  AI 建議
                </h4>
                <div className="text-gray-700 leading-relaxed font-sans text-base bg-gray-50 p-3 rounded-md border">
                  {serverAnalysis?.advice || advice ? (
                    <div className="prose prose-sm prose-slate">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-3 leading-relaxed text-md text-gray-800">
                              {children}
                            </p>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-semibold my-3">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl font-semibold my-3">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-semibold my-2">
                              {children}
                            </h3>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc ml-6 space-y-1 mb-3">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal ml-6 space-y-1 mb-3">
                              {children}
                            </ol>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 pl-4 italic text-gray-600 my-3">
                              {children}
                            </blockquote>
                          ),
                          code: (props) => {
                            const p = props as unknown as {
                              inline?: boolean;
                              className?: string;
                              children?: React.ReactNode;
                            };
                            const { inline, className, children } = p;
                            if (inline)
                              return (
                                <code className="bg-gray-100 px-1 rounded text-sm">
                                  {children}
                                </code>
                              );
                            return (
                              <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-auto text-sm my-3">
                                <code className={className}>{children}</code>
                              </pre>
                            );
                          },
                          table: ({ children }) => (
                            <div className="overflow-auto rounded-md border border-gray-100 my-4">
                              <table className="min-w-full divide-y divide-gray-200 text-sm">
                                {children}
                              </table>
                            </div>
                          ),
                          hr: () => (
                            <hr className="border-t border-gray-200 my-6" />
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-gray-50">{children}</thead>
                          ),
                          tbody: ({ children }) => (
                            <tbody className="bg-white divide-y divide-gray-100">
                              {children}
                            </tbody>
                          ),
                          tr: ({ children }) => (
                            <tr className="hover:bg-gray-50">{children}</tr>
                          ),
                          th: ({ children }) => (
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="px-4 py-3 align-top whitespace-normal text-sm">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {String(serverAnalysis?.advice || advice)}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-gray-500">目前沒有建議內容。</div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <div
            className="md:col-span-1 bg-white rounded-lg p-4 shadow-md text-center"
            aria-label="互動分析"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">互動分析</h4>
              <div className="flex items-center space-x-2">
                {typeof stressIndex === "number" && (
                  <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    壓力 {stressIndex}
                  </div>
                )}
                {typeof timeHorizon === "number" && (
                  <div className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                    {timeHorizon >= 75
                      ? "偏長期"
                      : timeHorizon <= 25
                      ? "偏短期"
                      : "中期"}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <RadarChart values={radarValues} size={320} />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-gray-600">投資者類型</div>
              <div className="text-lg font-semibold text-gray-800">
                {investorType || "綜合型（中庸平衡）"}
              </div>
            </div>

            {investorDescStr && (
              <div className="mt-3 text-left text-sm text-gray-700 prose prose-sm prose-slate">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {investorDescStr}
                </ReactMarkdown>
              </div>
            )}

            <div className="mt-4 text-left">
              <div className="text-xs text-gray-500 mb-2">指標（0-100）</div>
              <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
                {Object.entries(radarValues).map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-md px-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="capitalize text-gray-600">
                        {k.replace(/([A-Z_])/g, " $1").replaceAll("_", " ")}
                      </div>
                      <div className="font-medium text-gray-800">
                        {String(v)}
                      </div>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-3 rounded-full bg-linear-to-r from-green-400 to-emerald-500 transition-all duration-300"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, Number(v || 0))
                          )}%`,
                        }}
                      />
                      <div
                        className="absolute right-2 top-0 text-xs text-white font-medium"
                        style={{ lineHeight: "12px" }}
                      >
                        {String(v)}
                      </div>
                    </div>
                  </div>
                ))}
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
  );
}
