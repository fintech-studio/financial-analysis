"use client";

import React, { useState } from "react";
import {
  AcademicCapIcon,
  HeartIcon,
  ChartBarIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  FaceSmileIcon,
} from "@heroicons/react/24/outline";
import PageHeader from "@/components/Layout/PageHeader";
import Footer from "@/components/Layout/Footer";

export default function QuestionnairePage(): React.ReactElement {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const [streamingQuestion, setStreamingQuestion] = useState<string>("");
  const [isStreamingQuestion, setIsStreamingQuestion] =
    useState<boolean>(false);
  const [questionNumber, setQuestionNumber] = useState<number>(0);
  const [answer, setAnswer] = useState<string>("");
  const [finished, setFinished] = useState<boolean>(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = "http://localhost:8000";

  const startTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/questionnaire/start`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSessionId(data.session_id);
      setFinished(false);
      setAdvice(null);
      setAnswer("");
      setQuestionNumber(0);
      setLoading(false); // 在開始串流前就關閉載入

      // 開始串流第一個問題
      await streamQuestion(data.session_id, 0);
    } catch (e: any) {
      setError(String(e));
      setLoading(false);
    }
  };

  const streamQuestion = async (sessionId: string, questionNum: number) => {
    setIsStreamingQuestion(true);
    setStreamingQuestion("");
    setQuestion(null);

    try {
      const response = await fetch(`${apiBase}/questionnaire/stream-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          question_number: questionNum,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("無法建立串流讀取器");
      }

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                setQuestion(accumulatedText);
                setIsStreamingQuestion(false);
                // 不需要保存問題到後端
                return;
              }
              accumulatedText += data.text;
              setStreamingQuestion(accumulatedText);
            } catch (e) {
              // 忽略 JSON 解析錯誤
            }
          }
        }
      }
    } catch (e: any) {
      setError(`串流錯誤: ${String(e)}`);
      setIsStreamingQuestion(false);
    }
  };

  const submitAnswer = async () => {
    if (!sessionId) return setError("尚未開始測驗");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/questionnaire/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, answer: answer }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.has_next_question) {
        setFinished(true);
        setAdvice(data.advice); // 直接設定建議，不再串流
        setQuestion(null);
        setLoading(false);
      } else {
        setAnswer("");
        setQuestionNumber(questionNumber + 1);
        setLoading(false); // 在開始串流前就關閉載入
        // 串流下一個問題
        await streamQuestion(sessionId, questionNumber + 1);
      }
    } catch (e: any) {
      setError(String(e));
      setLoading(false);
    }
  };

  const Icon = FaceSmileIcon;
  const Title = "理財心理測評";
  const Subtitle = "基於心理學的投資性格分析";
  const Description =
    "透過科學的心理測評，深入了解您的投資心理特質與風險偏好，為您量身打造最適合的理財策略與建議。";
  const panelTitle = "AI 驅動";
  const panelSubtitle = "智能分析";
  const panelTitle2 = "個性化";
  const panelSubtitle2 = "專屬建議";

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
        {/* 主要內容區域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 開始測驗卡片 */}
          {!sessionId && (
            <div className="bg-white rounded-xl shadow-lg animate-slideIn">
              <div className="p-8 text-center">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-6 shadow-xl">
                    <HeartIcon className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    準備開始您的心理測評
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    我們將透過一系列問題來評估您的投資心理特質，整個過程大約需要
                    5-10 分鐘
                  </p>
                </div>

                <button
                  onClick={startTest}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-lg min-w-48 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
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
          )}

          {/* 問題回答卡片 */}
          {sessionId && !finished && (
            <div className="bg-white rounded-xl shadow-lg animate-slideIn">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                      <DocumentTextIcon className="w-4 h-4 text-white" />
                    </div>
                    問卷題目
                  </h2>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                      第 {questionNumber + 1} 題
                    </div>
                    {isStreamingQuestion && (
                      <div className="flex items-center text-sm text-purple-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                        AI 正在思考...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    題目：
                  </label>
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 p-6 rounded-lg relative overflow-hidden">
                    {/* 串流背景動畫 */}
                    {isStreamingQuestion && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/30 to-transparent animate-shimmer"></div>
                    )}

                    <div className="relative">
                      {isStreamingQuestion ? (
                        <div className="min-h-[3rem]">
                          <p className="text-gray-800 text-lg leading-relaxed">
                            {streamingQuestion}
                            <span className="inline-block w-0.5 h-6 bg-purple-500 animate-pulse ml-1 align-middle"></span>
                          </p>
                          {streamingQuestion.length === 0 && (
                            <div className="flex items-center text-purple-600">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                              <span className="ml-3 text-sm">
                                正在生成問題...
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-800 text-lg leading-relaxed">
                          {question}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    您的回答：
                  </label>
                  <textarea
                    value={answer}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setAnswer(e.target.value)
                    }
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                    placeholder="請在此輸入您的想法和回答（中文）..."
                    disabled={isStreamingQuestion}
                  />
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      字數：{answer.length} 字
                    </div>
                    {isStreamingQuestion && (
                      <div className="text-sm text-amber-600 flex items-center">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                        請等待問題生成完成
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={submitAnswer}
                    disabled={loading || !answer.trim() || isStreamingQuestion}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        提交中...
                      </div>
                    ) : (
                      <>
                        送出回答
                        <ChartBarIcon className="w-4 h-4 ml-2 inline" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 結果展示卡片 */}
          {finished && (
            <div className="bg-white rounded-xl shadow-lg animate-slideIn">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
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
                  <h2 className="text-xl font-semibold text-gray-800">
                    測驗完成 - 個人化建議
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      您的理財心理分析報告
                    </h3>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
                        {advice}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      // reset for new test
                      setSessionId(null);
                      setQuestion(null);
                      setAnswer("");
                      setFinished(false);
                      setAdvice(null);
                      setStreamingQuestion("");
                      setIsStreamingQuestion(false);
                      setQuestionNumber(0);
                    }}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 font-medium rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <svg
                      className="w-4 h-4 mr-2 inline"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    重新測驗
                  </button>
                </div>
              </div>
            </div>
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
                  <div className="flex-shrink-0">
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

        {/* 諮詢資訊區塊 */}
        <div className="bg-gray-50 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                {/* 測評方法 */}
                <div>
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <AcademicCapIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      測評方法
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <HeartIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">心理學理論：</span>
                      <span className="ml-1 font-medium text-gray-900">
                        行為金融學
                      </span>
                    </div>
                    <span className="block mt-2 text-xs text-gray-500">
                      基於認知偏差、風險偏好等心理因素進行投資性格分析
                    </span>
                  </div>
                </div>

                {/* 數據安全 */}
                <div>
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <svg
                        className="h-5 w-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      數據安全
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <svg
                        className="h-4 w-4 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-700">加密保護與匿名化</span>
                    </div>
                    <span className="block mt-2 text-xs text-gray-500">
                      所有回答都經過加密處理，不會洩露個人隱私
                    </span>
                  </div>
                </div>

                {/* 免責聲明 */}
                <div>
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      免責聲明
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    本測評結果僅供參考，投資決策請結合個人實際情況謹慎考慮。
                    <span className="block mt-2 text-xs text-gray-500">
                      建議搭配專業理財顧問的意見進行投資規劃。
                    </span>
                  </p>
                </div>
              </div>
              {/* 頁腳資訊 */}
              <div className="text-center pb-8 pt-4">
                <p className="text-sm text-gray-500">
                  © 2025 理財心理測評系統 | 數據安全受到保護
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
