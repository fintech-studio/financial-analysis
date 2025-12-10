import { useEffect, useRef, useState } from "react";
import * as PsychologyService from "@/services/PsychologyService";
import {
  detectQuestionType,
  extractOptions,
  deriveLikertDescriptor,
  computeProfileFromResponses,
} from "@/utils/psychologyQuestionUtils";

export default function usePsychology() {
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

  // 新增狀態
  const [questionType, setQuestionType] = useState<"open" | "mc" | "likert">(
    "open"
  );
  const [options, setOptions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [likertValue, setLikertValue] = useState<number>(3);
  const [responses, setResponses] = useState<
    {
      question: string;
      answer: string;
      type: string;
      value?: number | null;
    }[]
  >([]);
  const [serverProfile, setServerProfile] = useState<{
    risk: number;
    stability: number;
    confidence: number;
    patience: number;
    sensitivity: number;
  } | null>(null);
  const [investorType, setInvestorType] = useState<string | null>(null);
  const [streamedOptions, setStreamedOptions] = useState<string[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      // cleanup streaming when unmount
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const prepareQuestionUI = (qText: string) => {
    const t = detectQuestionType(qText);
    setQuestionType(t as "open" | "mc" | "likert");
    if (t === "mc") {
      setOptions(extractOptions(qText));
      setSelectedIndex(null);
    } else {
      setOptions([]);
      setSelectedIndex(null);
    }
    if (t === "likert") setLikertValue(3);
  };

  const startTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PsychologyService.startQuestionnaire();
      setSessionId(data.session_id);
      setFinished(false);
      setAdvice(null);
      setAnswer("");
      // make the question index shown to user consistent with server (1-indexed)
      const qn = data.question_number ?? 1;
      setQuestionNumber(qn);
      if (data.total_questions) setTotalQuestions(data.total_questions);
      setResponses([]);
      setServerProfile(null);
      setInvestorType(null);
      setLoading(false);
      // If server already returned a question text, use it directly, otherwise stream
      if (data.question) {
        setQuestion(data.question);
        prepareQuestionUI(data.question);
      } else {
        await streamQuestionInternal(data.session_id, qn);
      }
    } catch (e: unknown) {
      setError(String(e));
      setLoading(false);
    }
  };

  const streamQuestionInternal = async (
    sessionIdParam: string,
    questionNum: number
  ) => {
    // update the UI's current question index to the requested streaming number
    setQuestionNumber(questionNum);
    setIsStreamingQuestion(true);
    setStreamingQuestion("");
    setQuestion(null);
    setStreamedOptions([]);

    try {
      // cancel previous stream
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await PsychologyService.streamQuestion(
        sessionIdParam,
        questionNum,
        controller.signal
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("無法建立串流讀取器");
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
                prepareQuestionUI(accumulatedText);
                setIsStreamingQuestion(false);
                setStreamedOptions([]);
                abortControllerRef.current = null;
                return;
              }
              accumulatedText += data.text;
              setStreamingQuestion(accumulatedText);

              const type = detectQuestionType(accumulatedText);
              if (type === "mc") {
                const opts = extractOptions(accumulatedText);
                setStreamedOptions(opts);
              } else {
                setStreamedOptions([]);
              }
            } catch {
              // ignore malformed
            }
          }
        }
      }
    } catch (e: unknown) {
      setError(`串流錯誤: ${String(e)}`);
      setIsStreamingQuestion(false);
      setStreamedOptions([]);
    }
  };

  const submitAnswer = async () => {
    if (!sessionId) return setError("尚未開始測驗");
    setLoading(true);
    setError(null);

    let finalAnswer = answer;
    if (questionType === "mc") {
      if (selectedIndex === null) {
        setError("請選擇一個選項");
        setLoading(false);
        return;
      }
      finalAnswer = options[selectedIndex] || "";
    } else if (questionType === "likert") {
      const qText = question || streamingQuestion || "";
      const descriptor = deriveLikertDescriptor(qText, likertValue);
      finalAnswer = `${likertValue} — ${descriptor}`;
    }

    try {
      const data = await PsychologyService.answerQuestion(
        sessionId,
        finalAnswer as string
      );

      setResponses((prev) => [
        ...prev,
        {
          question: question || streamingQuestion || "",
          answer: finalAnswer as string,
          type: questionType,
          value:
            questionType === "likert"
              ? Number(likertValue)
              : questionType === "mc"
              ? selectedIndex
              : null,
        },
      ]);

      if (!data.has_next_question) {
        setFinished(true);
        setAdvice(data.advice || null);
        setServerProfile(data.profile || null);
        setInvestorType(data.investor_type || null);
        setQuestion(null);
        setStreamingQuestion("");
        setIsStreamingQuestion(false);
        setLoading(false);
      } else {
        setAnswer("");
        // rely on backend provided question_number to determine next index
        const nextQn = data.question_number ?? questionNumber + 1;
        if (data.total_questions) setTotalQuestions(data.total_questions);
        setQuestionNumber(nextQn);
        setLoading(false);
        // if server returned the next question body, use it; otherwise stream
        if (data.question) {
          setQuestion(data.question);
          prepareQuestionUI(data.question);
        } else {
          await streamQuestionInternal(sessionId, nextQn);
        }
      }
    } catch (e: unknown) {
      setError(String(e));
      setLoading(false);
    }
  };

  const resetTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setSessionId(null);
    setQuestion(null);
    setAnswer("");
    setFinished(false);
    setAdvice(null);
    setStreamingQuestion("");
    setIsStreamingQuestion(false);
    setQuestionNumber(0);
    setResponses([]);
    setQuestionType("open");
    setOptions([]);
    setSelectedIndex(null);
    setLikertValue(3);
    setServerProfile(null);
    setInvestorType(null);
    setStreamedOptions([]);
    setTotalQuestions(null);
    setLoading(false);
    setError(null);
  };

  return {
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
    setError,
    questionType,
    setQuestionType,
    options,
    streamedOptions,
    selectedIndex,
    setSelectedIndex,
    likertValue,
    setLikertValue,
    responses,
    serverProfile,
    investorType,
    totalQuestions,

    // operations
    startTest,
    streamQuestion: streamQuestionInternal,
    submitAnswer,
    resetTest,
    computeProfile: () => computeProfileFromResponses(responses),
  } as const;
}
