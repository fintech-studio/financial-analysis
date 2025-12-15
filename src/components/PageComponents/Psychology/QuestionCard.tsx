import React, { useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { stripOptionsFromQuestion } from "@/utils/psychologyQuestionUtils";

type QuestionCardProps = {
  question: string | null;
  streamingQuestion: string | null;
  isStreamingQuestion: boolean;
  questionType: "single";
  options: string[];
  streamedOptions: string[];
  selectedIndex: number | null;
  setSelectedIndex: (idx: number) => void;
  submitAnswer: () => Promise<void>;
  loading: boolean;
  onRegenerate?: () => void;
  questionNumber: number;
  questionMeta?: Record<string, unknown> | null;
  answer?: string | null;
  setAnswer?: (s: string) => void;
};

function QuestionCard(props: QuestionCardProps) {
  const {
    question,
    streamingQuestion,
    isStreamingQuestion,
    questionType,
    options,
    streamedOptions,
    selectedIndex,
    setSelectedIndex,
    submitAnswer,
    loading,
    onRegenerate,
    questionNumber,
    questionMeta,
  } = props;
  const { incompleteReason, hasIncompleteQuestion } = useMemo(() => {
    const qText = (isStreamingQuestion ? streamingQuestion : question) || "";
    const trimmed = qText.trim();
    // heuristics: empty / too short / contains imbalance / placeholder pattern
    if (!trimmed)
      return { incompleteReason: "題目為空", hasIncompleteQuestion: true };
    const tooShort = trimmed.length > 0 && trimmed.length < 8;
    const placeholders1 = /\b(?:選擇|選項)\s*[A-D]\b/u;
    const placeholders2 = /\b[A-D]\b\s*\/\s*\b[A-D]\b/u;
    const containsPlaceholders =
      placeholders1.test(qText) || placeholders2.test(qText);
    const ellipsis = /\.{2,}|…/.test(qText);
    // check options presence
    const mcOptionsCount =
      (options?.length || 0) + (streamedOptions?.length || 0);
    const mcOptionsInsufficient =
      questionType === "single" && mcOptionsCount < 2;
    const metaIncomplete =
      (questionMeta &&
        typeof questionMeta === "object" &&
        String(questionMeta["type"]) === "single" &&
        (!Array.isArray(questionMeta["options"]) ||
          questionMeta["options"].length < 2)) ||
      false;

    if (mcOptionsInsufficient)
      return { incompleteReason: "選項不足", hasIncompleteQuestion: true };

    if (tooShort)
      return { incompleteReason: "題目過短", hasIncompleteQuestion: true };
    if (containsPlaceholders)
      return {
        incompleteReason: "題目包含占位符",
        hasIncompleteQuestion: true,
      };
    if (ellipsis)
      return {
        incompleteReason: "題目似乎被截斷",
        hasIncompleteQuestion: true,
      };
    if (metaIncomplete)
      return {
        incompleteReason: "Meta 資訊不完整",
        hasIncompleteQuestion: true,
      };
    return { incompleteReason: null, hasIncompleteQuestion: false };
  }, [
    question,
    streamingQuestion,
    isStreamingQuestion,
    questionMeta,
    options,
    streamedOptions,
    questionType,
  ]);
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
        {options.map((opt, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => {
                setSelectedIndex(idx);
              }}
              aria-selected={isSelected}
              role="option"
              className={`w-full text-left px-4 py-3 rounded-lg border transition flex items-center gap-3 ${
                isSelected
                  ? "bg-purple-600 text-white border-transparent"
                  : "bg-white text-gray-800 border-gray-200 hover:shadow-sm"
              }`}
            >
              <div className="flex-1 text-left">{opt}</div>
              {isSelected && (
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  已選擇
                </div>
              )}
            </button>
          );
        })}
      </div>
    ),
    [options, selectedIndex, setSelectedIndex]
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
                AI 正在生成...
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
                {streamingQuestion ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {stripOptionsFromQuestion(streamingQuestion || "")}
                  </ReactMarkdown>
                ) : (
                  /* streaming skeleton */
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/6"></div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="text-gray-800 text-lg leading-relaxed"
                aria-live="polite"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {stripOptionsFromQuestion(question || "")}
                </ReactMarkdown>
              </div>
            )}
            {/* If question is incomplete or may be malformed, show a hint and allow regeneration */}
            {!isStreamingQuestion && hasIncompleteQuestion && onRegenerate && (
              <div className="mt-3 p-3 bg-amber-50 border-l-4 border-amber-300 rounded-md flex items-center justify-between">
                <div className="text-amber-700 text-sm">
                  {incompleteReason
                    ? `題目錯誤：${incompleteReason} — 可重新生成題目。若為誤判請忽略此訊息。`
                    : "似乎題目未完整生成或有問題：可重新生成題目"}
                </div>
                <div>
                  <button
                    onClick={onRegenerate}
                    disabled={loading || isStreamingQuestion}
                    className="bg-amber-200 text-amber-900 px-3 py-1 rounded-md text-sm hover:bg-amber-300 disabled:opacity-60"
                  >
                    重新生成
                  </button>
                </div>
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

          {questionType === "single" && !isStreamingQuestion && (
            <div className="mb-4">{renderOptions()}</div>
          )}

          <div className="mt-2 flex justify-between items-center">
            {isStreamingQuestion && (
              <div className="text-sm text-amber-600 flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                請等待問題生成完成
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">覺得題目或選項有問題？</div>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={loading || isStreamingQuestion}
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-gray-700 px-3 py-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="重新生成題目"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>重新生成</span>
              </button>
            )}
          </div>
          <button
            onClick={submitAnswer}
            disabled={
              loading || (questionType === "single" && selectedIndex === null)
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
