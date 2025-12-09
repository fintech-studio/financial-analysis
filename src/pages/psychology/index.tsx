import React from "react";
import {
  HeartIcon,
  UserIcon,
  ExclamationTriangleIcon,
  FaceSmileIcon,
} from "@heroicons/react/24/outline";
import PageHeader from "@/components/Layout/PageHeader";
import usePsychology from "@/hooks/usePsychology";
import {
  deriveLikertDescriptor as deriveLikertDescriptorUtil,
  classifyInvestor as classifyInvestorUtil,
} from "@/utils/psychologyQuestionUtils";
import Footer from "@/components/Layout/Footer";
import ProgressPanel from "@/components/Psychology/ProgressPanel";
import QuestionCard from "@/components/Psychology/QuestionCard";
import ResultsPanel from "@/components/Psychology/ResultsPanel";

export default function QuestionnairePage(): React.ReactElement {
  const {
    sessionId,
    question,
    streamingQuestion,
    isStreamingQuestion,
    questionNumber,
    answer,
    setAnswer,
    finished,
    advice,
    loading,
    error,
    questionType,
    options,
    streamedOptions,
    selectedIndex,
    setSelectedIndex,
    likertValue,
    setLikertValue,
    // responses,
    serverProfile,
    setError,
    investorType,
    startTest,
    streamQuestion,
    submitAnswer,
    resetTest,
    computeProfile,
  } = usePsychology();
  // 新增：從後端取得的 profile 與 investor type
  // serverProfile, investorType from hook
  // const [showServerProfile, setShowServerProfile] = useState<boolean>(false);

  // 題型偵測與選項解析
  // helper for showing likert descriptor in UI
  const deriveLikertDescriptor = (questionText: string | null, value: number) =>
    deriveLikertDescriptorUtil(questionText || "", value);

  // keep streamedOptions from hook (streamedOptions variable is from usePsychology)

  // hook handles submission/streaming logic

  // 相關 UI 已移至 QuestionCard 元件

  // computeProfile moved to hook

  // classification moved to util/hook
  // use util classification

  // Radar chart 已拆出為 `components/Psychology/RadarChart.tsx`

  // UI constants & JSX — 保留原有整體邏輯，但改為全新版面格局（左側進度/摘要，右側題目）
  const Icon = FaceSmileIcon;
  const Title = "投資心理檢測";
  const Subtitle = "基於心理學的投資性格分析";
  const Description =
    "透過科學的心理檢測，深入了解您的投資心理特質與風險偏好，制定更適合的理財策略";
  const panelTitle = "AI 驅動";
  const panelSubtitle = "智能分析";
  const panelTitle2 = "個性化";
  const panelSubtitle2 = "專屬建議";

  const profile = computeProfile();
  const estimatedTotalQuestions = 8; // 用於進度條與預估時間（若後端有總題數可以改成動態）

  // 若用戶嘗試離開頁面，提示未保存之進度
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: BeforeUnloadEvent) => {
      if (sessionId && !finished) {
        e.preventDefault();
        e.returnValue = "您有未完成的測驗，確定要離開嗎？";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [sessionId, finished]);

  // resetTest handled via hook

  const computedInvestorType =
    investorType ||
    (serverProfile
      ? classifyInvestorUtil(serverProfile)
      : classifyInvestorUtil(profile));

  return (
    <>
      <PageHeader
        icon={Icon}
        title={Title}
        subtitle={Subtitle}
        description={Description}
        panelTitle={panelTitle}
        panelSubtitle={panelSubtitle}
        panelTitle2={panelTitle2}
        panelSubtitle2={panelSubtitle2}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 新版開場與左側進度面板 */}
          {!sessionId && (
            <div className="bg-white rounded-xl shadow-lg animate-slideIn p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col items-center justify-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-r from-purple-500 to-indigo-500 rounded-full mb-6 shadow-xl">
                    <HeartIcon className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    準備開始
                  </h2>
                  <p className="text-gray-600 text-center">
                    心理壓力與投資決策分析，約 5-10 分鐘。
                  </p>
                </div>
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        心理壓力檢測流程
                      </h3>
                      <p className="text-sm text-gray-500">
                        逐題回答後即可獲得個人化分析及建議
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      預估用時：5 - 10 分鐘
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-linear-to-r from-purple-50 to-indigo-50 p-4">
                    <ol className="flex items-center justify-between">
                      {["啟動", "問答", "結果"].map((s, idx) => {
                        const activeStep = sessionId ? (finished ? 2 : 1) : 0;
                        return (
                          <li key={s} className="flex-1 text-center">
                            <div
                              className={`mx-auto w-9 h-9 flex items-center justify-center rounded-full ${
                                idx === activeStep
                                  ? "bg-purple-600 text-white"
                                  : "bg-white text-gray-600"
                              } border`}
                            >
                              {idx + 1}
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                              {s}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                  <div className="mt-6 flex justify-start">
                    <button
                      onClick={startTest}
                      disabled={loading}
                      className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          準備中...
                        </div>
                      ) : (
                        <>
                          <UserIcon className="w-5 h-5 mr-2 inline" />
                          開始測驗
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 問題回答卡片（新版：兩欄）*/}
          {sessionId && !finished && (
            <div className="bg-white rounded-xl shadow-lg animate-slideIn p-0 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                {/* 左側欄：進度與輔助說明 (已拆成元件) */}
                <ProgressPanel
                  questionNumber={questionNumber}
                  estimatedTotalQuestions={estimatedTotalQuestions}
                  onCancel={() => {
                    if (confirm("確定要取消測驗，所有進度將會遺失？"))
                      resetTest();
                  }}
                  sessionId={sessionId}
                  finished={finished}
                />
                {/* 右側大區塊：題目與回答 */}
                <main className="md:col-span-3 p-6">
                  <QuestionCard
                    question={question}
                    streamingQuestion={streamingQuestion}
                    isStreamingQuestion={isStreamingQuestion}
                    questionType={questionType}
                    options={options}
                    streamedOptions={streamedOptions}
                    selectedIndex={selectedIndex}
                    setSelectedIndex={(idx) => setSelectedIndex(idx)}
                    likertValue={likertValue}
                    setLikertValue={(v) => setLikertValue(v)}
                    likertDescriptor={deriveLikertDescriptor(
                      question || streamingQuestion,
                      likertValue
                    )}
                    onRegenerate={() => {
                      if (sessionId) streamQuestion(sessionId, questionNumber);
                    }}
                    answer={answer}
                    setAnswer={(s) => setAnswer(s)}
                    submitAnswer={submitAnswer}
                    loading={loading}
                    questionNumber={questionNumber}
                  />
                </main>
              </div>
            </div>
          )}

          {/* 完成結果（新版卡片）：AI 建議 + 互動分析雷達圖 */}
          {finished && (
            <ResultsPanel
              advice={advice}
              serverProfile={serverProfile}
              profile={profile}
              investorType={computedInvestorType}
              onReset={resetTest}
            />
          )}

          {/* 載入指示器 */}
          {loading && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium">處理中，請稍候...</p>
              </div>
            </div>
          )}

          {/* 錯誤提示 */}
          {error && (
            <div className="bg-white rounded-xl border-red-200 border shadow-lg animate-slideIn">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      發生錯誤
                    </h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setError(null)}
                      className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
