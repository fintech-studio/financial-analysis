import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as PsychologyService from "@/services/PsychologyService";
import {
  detectQuestionType,
  extractOptions,
  deriveLikertDescriptor,
  computeProfileFromResponses,
} from "@/utils/psychologyQuestionUtils";

export interface QuestionMeta {
  question?: string;
  type?: "mc" | "likert" | "open" | string;
  option_type?: string;
  options?: string[];
  likert_range?: string;
  likert_option?: string[];
  dimension?: string;
}

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
  const [likertOptions, setLikertOptions] = useState<string[] | null>(null);
  const [likertRange, setLikertRange] = useState<string | null>(null);
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
  const [currentQuestionMeta, setCurrentQuestionMeta] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [serverAnalysis, setServerAnalysis] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [investorType, setInvestorType] = useState<string | null>(null);
  const [streamedOptions, setStreamedOptions] = useState<string[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  // Reduce streaming state updates by buffering incoming text
  const streamingBufferRef = useRef<string>("");
  const streamingTimerRef = useRef<number | null>(null);
  const STREAM_THROTTLE_MS = 100; // ms between UI updates

  useEffect(() => {
    return () => {
      // cleanup streaming when unmount
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (streamingTimerRef.current) {
        window.clearTimeout(streamingTimerRef.current);
        streamingTimerRef.current = null;
      }
    };
  }, []);

  const prepareQuestionUI = useCallback(
    (qText: string, meta?: Record<string, unknown>) => {
      // If server returned JSON in the question text itself, try to parse it as meta
      let effectiveMeta = meta;
      if (!effectiveMeta && qText && qText.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(qText);
          if (parsed && typeof parsed === "object")
            effectiveMeta = parsed as Record<string, unknown>;
        } catch {
          // ignore
        }
      }
      // prefer effective meta extracted from text; otherwise fallback to provided meta
      setCurrentQuestionMeta(effectiveMeta ?? meta ?? null);
      // prefer meta.question when present
      let q = qText;
      // Will set the question text after we normalize `q`
      if (effectiveMeta && typeof effectiveMeta === "object") {
        const m = effectiveMeta as QuestionMeta;
        if (m.question && typeof m.question === "string") q = m.question;
        const mtype = m.type;
        // if type is not provided but `options` exist, treat as mc
        if (!mtype && Array.isArray(m.options) && m.options.length >= 2) {
          setQuestionType("mc");
          setOptions(m.options.map((o) => String(o)));
          setSelectedIndex(null);
          setLikertOptions(null);
          setLikertRange(null);
          return;
        }
        if (
          !mtype &&
          Array.isArray(m.likert_option) &&
          m.likert_option.length >= 1
        ) {
          setQuestionType("likert");
          setLikertOptions(
            Array.isArray(m.likert_option)
              ? m.likert_option.map((o) => String(o))
              : null
          );
          setLikertRange(m.likert_range ? String(m.likert_range) : null);
          setOptions([]);
          setSelectedIndex(null);
          return;
        }
        if (mtype === "mc") {
          setQuestionType("mc");
          if (Array.isArray(m.options))
            setOptions(m.options.map((o) => String(o)));
          else setOptions(extractOptions(q));
          setSelectedIndex(null);
          setLikertOptions(null);
          setLikertRange(null);
          return;
        }
        if (mtype === "likert") {
          setQuestionType("likert");
          setLikertValue(3);
          setOptions([]);
          setSelectedIndex(null);
          setLikertOptions(
            Array.isArray(m.likert_option)
              ? m.likert_option.map((o) => String(o))
              : null
          );
          setLikertRange(m.likert_range ? String(m.likert_range) : null);
          return;
        }
        if (mtype === "open") {
          setQuestionType("open");
          setOptions([]);
          setLikertOptions(null);
          setLikertRange(null);
          setSelectedIndex(null);
          return;
        }
      }
      const t = detectQuestionType(q);
      setQuestionType(t as "open" | "mc" | "likert");
      if (t === "mc") {
        setOptions(extractOptions(qText));
        setSelectedIndex(null);
      } else {
        setOptions([]);
        setSelectedIndex(null);
      }
      if (t === "likert") {
        setLikertValue(3);
        setLikertOptions(null);
      }
      // set the final computed question text to UI (may be changed above)
      setQuestion(q);
    },
    []
  );

  const streamQuestionInternal = useCallback(
    async (sessionIdParam: string, questionNum: number) => {
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
                  const finalQ =
                    data.meta && data.meta.question
                      ? String(data.meta.question)
                      : accumulatedText;
                  setQuestion(finalQ);
                  setCurrentQuestionMeta(data.meta || null);
                  setLikertOptions(
                    data.meta && Array.isArray(data.meta["likert_option"])
                      ? (data.meta["likert_option"] as unknown[]).map((o) =>
                          String(o)
                        )
                      : null
                  );
                  setLikertRange(
                    data.meta && data.meta.likert_range
                      ? String(data.meta.likert_range)
                      : null
                  );
                  prepareQuestionUI(finalQ, data.meta || undefined);
                  setIsStreamingQuestion(false);
                  setStreamedOptions([]);
                  // flush any pending timer updates and reset buffer
                  if (streamingTimerRef.current) {
                    window.clearTimeout(streamingTimerRef.current);
                    streamingTimerRef.current = null;
                  }
                  streamingBufferRef.current = "";
                  abortControllerRef.current = null;
                  return;
                }
                accumulatedText += data.text;
                // Buffer and throttle UI updates to reduce re-renders
                streamingBufferRef.current = accumulatedText;
                if (streamingTimerRef.current) {
                  window.clearTimeout(streamingTimerRef.current);
                }
                streamingTimerRef.current = window.setTimeout(() => {
                  const text = streamingBufferRef.current || "";
                  setStreamingQuestion(text);
                  const type = detectQuestionType(text);
                  if (type === "mc") setStreamedOptions(extractOptions(text));
                  else setStreamedOptions([]);
                  streamingTimerRef.current = null;
                }, STREAM_THROTTLE_MS);
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
        if (streamingTimerRef.current) {
          window.clearTimeout(streamingTimerRef.current);
          streamingTimerRef.current = null;
        }
        streamingBufferRef.current = "";
      }
    },
    [prepareQuestionUI]
  );

  const startTest = useCallback(async () => {
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
      if (data.question || data.question_meta) {
        const qFromMeta =
          data.question_meta && data.question_meta.question
            ? String(data.question_meta.question)
            : undefined;
        const qtext = qFromMeta || data.question;
        setQuestion(qtext || null);
        setCurrentQuestionMeta(data.question_meta || null);
        prepareQuestionUI(qtext || "", data.question_meta || undefined);
      } else {
        await streamQuestionInternal(data.session_id, qn);
      }
    } catch (e: unknown) {
      setError(String(e));
      setLoading(false);
    }
  }, [streamQuestionInternal, prepareQuestionUI]);

  const submitAnswer = useCallback(async () => {
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
      let descriptor = deriveLikertDescriptor(qText, likertValue);
      if (
        currentQuestionMeta &&
        Array.isArray(currentQuestionMeta["likert_option"])
      ) {
        const opts = (currentQuestionMeta["likert_option"] as unknown[]).map(
          (o) => String(o)
        );
        if (opts.length >= likertValue) descriptor = opts[likertValue - 1];
      }
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
        setServerAnalysis(data.analysis || null);
        setCurrentQuestionMeta(null);
        setLikertOptions(null);
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
        if (data.question || data.question_meta) {
          const qFromMeta =
            data.question_meta && data.question_meta.question
              ? String(data.question_meta.question)
              : undefined;
          const qtext = qFromMeta || data.question;
          setQuestion(qtext || null);
          setCurrentQuestionMeta(data.question_meta || null);
          setLikertOptions(
            data.question_meta &&
              Array.isArray(data.question_meta["likert_option"])
              ? (data.question_meta["likert_option"] as unknown[]).map((o) =>
                  String(o)
                )
              : null
          );
          prepareQuestionUI(qtext || "", data.question_meta || undefined);
        } else {
          await streamQuestionInternal(sessionId, nextQn);
        }
      }
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [
    sessionId,
    question,
    streamingQuestion,
    likertValue,
    selectedIndex,
    questionType,
    options,
    prepareQuestionUI,
    streamQuestionInternal,
  ]);

  const resetTest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (streamingTimerRef.current) {
      window.clearTimeout(streamingTimerRef.current);
      streamingTimerRef.current = null;
    }
    streamingBufferRef.current = "";
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
    setCurrentQuestionMeta(null);
    setLikertOptions(null);
    setInvestorType(null);
    setServerAnalysis(null);
    setStreamedOptions([]);
    setTotalQuestions(null);
    setLoading(false);
    setError(null);
  }, []);

  const memoizedProfile = useMemo(
    () => computeProfileFromResponses(responses),
    [responses]
  );

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
    likertOptions,
    likertRange,
    responses,
    serverProfile,
    serverAnalysis,
    currentQuestionMeta,
    investorType,
    totalQuestions,

    // operations
    startTest,
    streamQuestion: streamQuestionInternal,
    submitAnswer,
    resetTest,
    computeProfile: () => memoizedProfile,
  } as const;
}
