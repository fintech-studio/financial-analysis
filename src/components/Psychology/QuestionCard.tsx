import React, { useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

function QuestionCard({
  question,
  streamingQuestion,
  isStreamingQuestion,
  questionType,
  options,
  streamedOptions,
  selectedIndex,
  setSelectedIndex,
  likertValue,
  setLikertValue,
  likertDescriptor,
  likertOptions,
  answer,
  setAnswer,
  submitAnswer,
  loading,
  onRegenerate,
  questionNumber,
  questionMeta,
}: {
  question: string | null;
  streamingQuestion: string | null;
  isStreamingQuestion: boolean;
  questionType: "open" | "mc" | "likert";
  options: string[];
  streamedOptions: string[];
  selectedIndex: number | null;
  setSelectedIndex: (idx: number) => void;
  likertValue: number;
  setLikertValue: (v: number) => void;
  likertDescriptor?: string | null;
  likertOptions?: string[] | null;
  answer: string;
  setAnswer: (s: string) => void;
  submitAnswer: () => Promise<void>;
  loading: boolean;
  onRegenerate?: () => void;
  questionNumber: number;
  questionMeta?: Record<string, unknown> | null;
}) {
  const renderOptions = useCallback(
    () => (
      <div
        className="space-y-3"
        role="listbox"
        aria-label="選項列表"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            const cur = selectedIndex === null ? -1 : selectedIndex;
            setSelectedIndex((cur + 1) % options.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const cur = selectedIndex === null ? options.length : selectedIndex;
            setSelectedIndex(cur - 1 < 0 ? options.length - 1 : cur - 1);
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            // noop - selection is done on focus highlight
          }
        }}
      >
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            aria-selected={selectedIndex === idx}
            role="option"
            className={`w-full text-left px-4 py-3 rounded-lg border transition ${
              selectedIndex === idx
                ? "bg-purple-600 text-white border-transparent"
                : "bg-white text-gray-800 border-gray-200 hover:shadow-sm"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    ),
    [options, selectedIndex, setSelectedIndex]
  );

  const defaultLabels = ["非常不認同", "不認同", "中立", "認同", "非常認同"];
  const labels =
    likertOptions && likertOptions.length >= 1 ? likertOptions : defaultLabels;
  const renderLikert = useCallback(
    () => (
      <div className="flex flex-col items-center space-y-2">
        <div className="text-sm text-gray-600 mb-1">
          請依程度選擇（1 = 最低，5 = 最高）
        </div>
        <div
          className="flex items-end justify-center space-x-3"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft")
              setLikertValue(Math.max(1, likertValue - 1));
            else if (e.key === "ArrowRight")
              setLikertValue(Math.min(5, likertValue + 1));
          }}
        >
          {labels.map((lbl, idx) => {
            const v = idx + 1;
            return (
              <div key={v} className="flex flex-col items-center">
                <button
                  onClick={() => setLikertValue(v)}
                  aria-label={`Likert ${v} - ${lbl}`}
                  className={`px-3 py-2 rounded-md border focus:outline-none transition ${
                    likertValue === v
                      ? "bg-purple-600 text-white border-transparent"
                      : "bg-white text-gray-800 border-gray-200"
                  }`}
                >
                  {v}
                </button>
                <div className="text-xs text-gray-500 mt-1">{lbl}</div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          左：程度低 — 右：程度高
        </div>
        {likertDescriptor && (
          <div className="mt-2 text-sm text-gray-700 font-medium">
            {likertDescriptor}
          </div>
        )}
      </div>
    ),
    [likertValue, setLikertValue, likertDescriptor]
  );

  return (
    <div>
      <div className="border-b border-gray-200 px-6 py-4 bg-linear-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <div className="w-8 h-8 bg-linear-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            問卷題目
            {questionMeta && (questionMeta["dimension"] as string) && (
              <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                {String(questionMeta["dimension"])}
              </span>
            )}
            {questionMeta && (questionMeta["option_type"] as string) && (
              <span className="ml-3 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                {String(questionMeta["option_type"])}
              </span>
            )}
          </h2>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
              第 {questionNumber} 題
            </div>
            {isStreamingQuestion && (
              <div className="flex items-center text-sm text-purple-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                AI 正在思考...
              </div>
            )}
            {!isStreamingQuestion && onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={loading || isStreamingQuestion}
                className="text-sm bg-white/10 hover:bg-white/20 text-gray-700 px-3 py-1 rounded-md"
                aria-label="重新生成題目"
              >
                重新生成
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            題目：
          </label>
          <div className="bg-linear-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 p-6 rounded-lg relative overflow-hidden">
            {isStreamingQuestion ? (
              <div
                className="text-gray-800 text-lg leading-relaxed"
                aria-live="polite"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamingQuestion || ""}
                </ReactMarkdown>
              </div>
            ) : (
              <div
                className="text-gray-800 text-lg leading-relaxed"
                aria-live="polite"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {question || ""}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            您的回答：
          </label>

          {/* 串流時即顯示選項（streamedOptions），否則用正式 options */}
          {isStreamingQuestion && streamedOptions.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">
                （選項預覽，AI生成中）
              </div>
              <div className="space-y-3">
                {streamedOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled
                    className="w-full text-left px-4 py-3 rounded-lg border bg-gray-100 text-gray-400 border-gray-200"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {questionType === "mc" && !isStreamingQuestion && (
            <div className="mb-4">{renderOptions()}</div>
          )}
          {questionType === "likert" && !isStreamingQuestion && (
            <div className="mb-4">{renderLikert()}</div>
          )}
          {questionType === "open" && !isStreamingQuestion && (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
              placeholder="請在此輸入您的想法和回答（中文）..."
              disabled={isStreamingQuestion}
            />
          )}

          <div className="mt-2 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              字數：
              {questionType === "open"
                ? answer.length
                : questionType === "likert"
                ? likertValue
                : selectedIndex !== null
                ? selectedIndex + 1
                : 0}
            </div>
            {isStreamingQuestion && (
              <div className="text-sm text-amber-600 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                請等待問題生成完成
              </div>
            )}
          </div>
        </div>
        {questionType === "open" && answer.trim().length < 5 && (
          <div className="text-sm text-amber-600 mt-2">
            請輸入至少 5 個字以便 AI 有足夠的上下文分析
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={submitAnswer}
            disabled={
              loading ||
              (questionType === "open" && answer.trim().length < 5) ||
              (questionType === "mc" && selectedIndex === null) ||
              (questionType === "likert" && !likertValue)
            }
            className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                提交中...
              </div>
            ) : (
              <>
                <span>送出回答</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(QuestionCard);
