import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  PlayIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  BackwardIcon,
} from "@heroicons/react/24/outline";
import CandlestickChart from "@/components/Charts/CandlestickChart";
import PageHeader from "@/components/Layout/PageHeader";
import Footer from "@/components/Layout/Footer";

// =============================
// 型別定義
// =============================
interface Question {
  id?: number;
  symbol: string;
  name?: string;
  previous_prices: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  after_prices: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  previous_indicates: Record<string, unknown>;
  correct_ans: "buy" | "sell";
  explanations: Array<string>;
  profitLoss?: number;
}

interface TrainingState {
  isStarted: boolean;
  currentQuestion: number;
  answers: Array<{
    questionId: number;
    userAnswer: "buy" | "sell";
    isCorrect: boolean;
  }>;
  showResult: boolean;
  isComplete: boolean;
  correctCount: number;
}

// =============================
// 主頁元件
// =============================
const BacktestingPage: React.FC = () => {
  const [trainingState, setTrainingState] = useState<TrainingState>({
    isStarted: false,
    currentQuestion: 0,
    answers: [],
    showResult: false,
    isComplete: false,
    correctCount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const currentQuestion =
    trainingState.isStarted && !trainingState.isComplete && questions.length > 0
      ? questions[trainingState.currentQuestion]
      : null;

  // =============================
  // ✅ 修正版 fetchQuestions
  // =============================
  const fetchQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    try {
      // ✅ 調用 API（後端會返回 5 個問題的陣列）
      const response = await fetch("/api/py/backtesting/gen_q", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // 空對象，API 會自動從環境變量獲取配置
      });

      if (!response.ok) {
        throw new Error(`API 調用失敗: ${response.status}`);
      }

      const questionsData: Question[] = await response.json();
      console.log("✅ 後端回傳問題陣列:", questionsData);

      // 為每個問題添加前端 id
      questionsData.forEach((question, index) => {
        question.id = index + 1;
      });

      setQuestions(questionsData);
      console.log("✅ 成功獲取問題:", questionsData);
      return true;
    } catch (error) {
      console.error("❌ 獲取問題失敗:", error);
      return false;
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  // =============================
  // 控制流程邏輯
  // =============================
  const startGame = useCallback(async () => {
    setLoading(true);
    try {
      const success = await fetchQuestions();
      if (success) {
        setTrainingState({
          isStarted: true,
          currentQuestion: 0,
          answers: [],
          showResult: false,
          isComplete: false,
          correctCount: 0,
        });
      } else {
        alert("無法連接到後端服務，請確保 Python 後端正在運行。");
      }
    } catch (error) {
      console.error("開始訓練失敗:", error);
      alert("啟動訓練失敗，請檢查網路連接和後端服務。");
    } finally {
      setLoading(false);
    }
  }, [fetchQuestions]);

  const handleAnswer = useCallback(
    (userAnswer: "buy" | "sell") => {
      if (!currentQuestion || trainingState.showResult) return;

      const isCorrect = userAnswer === currentQuestion.correct_ans;

      const newAnswer = {
        questionId: currentQuestion.id || trainingState.currentQuestion + 1,
        userAnswer,
        isCorrect,
      };

      setTrainingState((prev) => ({
        ...prev,
        answers: [...prev.answers, newAnswer],
        showResult: true,
        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
      }));
    },
    [currentQuestion, trainingState.showResult]
  );

  const nextQuestion = useCallback(() => {
    setTrainingState((prev) => {
      const nextIndex = prev.currentQuestion + 1;
      if (nextIndex >= questions.length) {
        return { ...prev, showResult: false, isComplete: true };
      } else {
        return { ...prev, currentQuestion: nextIndex, showResult: false };
      }
    });
  }, [questions.length]);

  const resetGame = useCallback(() => {
    setTrainingState({
      isStarted: false,
      currentQuestion: 0,
      answers: [],
      showResult: false,
      isComplete: false,
      correctCount: 0,
    });
    setQuestions([]);
  }, []);

  const Icon = BackwardIcon;
  const Title = "回測系統";
  const Subtitle = "模擬交易體驗";
  const Description = "透過真實市場數據進行模擬交易，測試策略並累積經驗";
  const PanelTitle = "回測訓練系統";
  const PancelSubtitle = "提升您的市場分析與交易決策能力";

  return (
    <>
      <PageHeader
        icon={Icon}
        title={Title}
        subtitle={Subtitle}
        description={Description}
        panelTitle={PanelTitle}
        panelSubtitle={PancelSubtitle}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {!trainingState.isStarted ? (
            /* 開始畫面 */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-3xl shadow-lg border border-gray-100 p-12"
            >
              <div className="text-center space-y-6 max-w-2xl">
                <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <PlayIcon className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  開始回測訓練
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  觀察 K 線圖，判斷買入或賣出時機。
                </p>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={startGame}
                    disabled={loading || loadingQuestions}
                    className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 text-white px-12 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {loading || loadingQuestions ? "生成問題中..." : "開始訓練"}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : trainingState.isComplete ? (
            /* 完成畫面 */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center"
            >
              <div className="mb-8">
                <div
                  className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                    trainingState.correctCount >= questions.length * 0.6
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {trainingState.correctCount >= questions.length * 0.6 ? (
                    <CheckCircleIcon className="h-12 w-12 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-12 w-12 text-red-600" />
                  )}
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  訓練完成！
                </h2>
                <div
                  className={`text-3xl font-bold ${
                    trainingState.correctCount >= questions.length * 0.6
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {trainingState.correctCount}/{questions.length} 題正確
                </div>
                <div className="text-lg text-gray-600 mt-2">
                  答對率：
                  {Math.round(
                    (trainingState.correctCount / questions.length) * 100
                  )}
                  %
                </div>
              </div>
              <button
                onClick={resetGame}
                className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105"
              >
                重新訓練
              </button>
            </motion.div>
          ) : (
            /* 訓練中畫面 */
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    案例 {trainingState.currentQuestion + 1} / 5
                  </h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">答對題數</div>
                    <div
                      className={`text-xl font-bold ${
                        trainingState.correctCount >=
                        (trainingState.currentQuestion + 1) * 0.6
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {trainingState.correctCount}/
                      {trainingState.currentQuestion + 1}
                    </div>
                  </div>
                </div>

                {currentQuestion && (
                  <div className="mb-6">
                    <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
                      <div className="p-4">
                        {/* 圖表容器，帶錯誤處理 */}
                        {currentQuestion.previous_prices?.length > 0 ? (
                          <div style={{ height: "480px" }}>
                            <CandlestickChart
                              data={currentQuestion.previous_prices}
                              technicalData={
                                currentQuestion.previous_indicates || {}
                              }
                              title={currentQuestion.symbol}
                              timeframe="1d"
                              height={480}
                              showVolume={true}
                              theme="light"
                            />
                          </div>
                        ) : (
                          <div className="h-96 flex items-center justify-center bg-gray-100 rounded">
                            <p className="text-gray-500">沒有可用的圖表數據</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {!trainingState.showResult ? (
                      <div className="text-center">
                        <p className="text-lg font-medium text-gray-700 mb-6">
                          根據上方 K線圖，您認為應該：
                        </p>
                        <div className="flex gap-4 justify-center">
                          <button
                            onClick={() => handleAnswer("buy")}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
                          >
                            <ArrowUpIcon className="h-6 w-6" />
                            買入
                          </button>
                          <button
                            onClick={() => handleAnswer("sell")}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
                          >
                            <ArrowDownIcon className="h-6 w-6" />
                            賣出
                          </button>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 rounded-lg p-6"
                      >
                        <div className="text-center mb-4">
                          <div
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                              trainingState.answers[
                                trainingState.answers.length - 1
                              ]?.isCorrect
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {trainingState.answers[
                              trainingState.answers.length - 1
                            ]?.isCorrect ? (
                              <>
                                <CheckCircleIcon className="h-5 w-5" />{" "}
                                判斷正確！
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="h-5 w-5" /> 判斷錯誤！
                              </>
                            )}
                          </div>
                          <div className="mt-2 text-lg">
                            正確答案：
                            <span className="font-semibold">
                              {currentQuestion.correct_ans === "buy"
                                ? "買入"
                                : "賣出"}
                            </span>
                          </div>
                        </div>

                        {/* 顯示解釋說明 */}
                        {currentQuestion.explanations &&
                          currentQuestion.explanations.length > 0 && (
                            <div className="space-y-3">
                              <div>
                                <h6 className="font-semibold text-gray-800 mb-2">
                                  分析解釋：
                                </h6>
                                <div className="text-gray-600 space-y-1">
                                  {currentQuestion.explanations.map(
                                    (explanation, index) => (
                                      <p key={index} className="mb-1">
                                        • {explanation}
                                      </p>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                        <div className="text-center mt-6">
                          <button
                            onClick={nextQuestion}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
                          >
                            {trainingState.currentQuestion <
                            questions.length - 1
                              ? "下一案例"
                              : "查看績效"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BacktestingPage;
