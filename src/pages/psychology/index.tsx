import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
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
  // ...existing simple states...
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

  // 新增：題型與互動狀態
  const [questionType, setQuestionType] = useState<"open" | "mc" | "likert">(
    "open"
  );
  const [options, setOptions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [likertValue, setLikertValue] = useState<number>(3);
  const [responses, setResponses] = useState<
    { question: string; answer: string; type: string; value?: number | null }[]
  >([]);
  // 新增：從後端取得的 profile 與 investor type
  const [serverProfile, setServerProfile] = useState<{
    risk: number;
    stability: number;
    confidence: number;
    patience: number;
    sensitivity: number;
  } | null>(null);
  const [investorType, setInvestorType] = useState<string | null>(null);
  // const [showServerProfile, setShowServerProfile] = useState<boolean>(false);

  const apiBase = "http://172.25.1.24:8080";

  // 題型偵測與選項解析
  const detectQuestionType = (q: string) => {
    if (!q) return "open";
    if (/(1\s*到\s*5|1-5|1~5|1～5|likert|1[^\d]*5)/i.test(q)) return "likert";
    const chunks = q
      .split(/[\n;/；、]| \/ | \| /)
      .map((s) => s.trim())
      .filter(Boolean);
    return chunks.length >= 2 && chunks.length <= 10 ? "mc" : "open";
  };

  const extractOptions = (q: string) => {
    if (!q) return [];

    // 優先以 "/" 分割，否則以換行/分號/or/pipe 分割
    let parts = q
      .split(/\s*\/\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length < 2)
      parts = q
        .split(/\r?\n|;|；|、|\s+or\s+|\|/i)
        .map((s) => s.trim())
        .filter(Boolean);
    if (parts.length < 2) return [];

    // 清理前綴（編號、標點等）
    parts = parts.map((p) => p.replace(/^[A-Za-z0-9:\-、\s]+/, "").trim());

    // 若第一段像題目（過長或含問號/冒號），嘗試從該段取出可能的選項或丟棄題目段
    const first = parts[0];
    const looksLikeQuestion = first.length > 80 || /[？：:。]/.test(first);
    if (looksLikeQuestion) {
      const lastPunct = Math.max(
        first.lastIndexOf("？"),
        first.lastIndexOf("?"),
        first.lastIndexOf("："),
        first.lastIndexOf(":"),
        first.lastIndexOf("。"),
        first.lastIndexOf(".")
      );
      let candidate = first;
      if (lastPunct !== -1 && lastPunct < first.length - 1) {
        candidate = first.slice(lastPunct + 1).trim();
        parts[0] = candidate;
      } else if (first.includes("/")) {
        const seg = first
          .split("/")
          .map((s) => s.trim())
          .filter(Boolean);
        if (seg.length > 1) parts[0] = seg.pop()!.trim();
      } else {
        // 若後續段落看起來更像選項，捨棄第一段
        if (parts.slice(1).some((p) => p.length <= 80)) parts = parts.slice(1);
        else {
          const lastSpace = first.lastIndexOf(" ");
          if (lastSpace !== -1 && lastSpace < first.length - 1)
            parts[0] = first.slice(lastSpace + 1).trim();
        }
      }
    }

    const opts = parts
      .map((p) => p.replace(/^["'“”]+|["'“”]+$/g, "").trim())
      .filter(Boolean);
    return opts.length >= 2 ? opts : [];
  };

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
      setResponses([]);
      setLoading(false);
      await streamQuestion(data.session_id, 0);
    } catch (e: unknown) {
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
                return;
              }
              accumulatedText += data.text;
              setStreamingQuestion(accumulatedText);
            } catch {
              // ignore
            }
          }
        }
      }
    } catch (e: unknown) {
      setError(`串流錯誤: ${String(e)}`);
      setIsStreamingQuestion(false);
    }
  };

  // 提交回答：依題型整理答案、儲存本地回應並呼叫 API
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
      // 組合數值與語意描述，讓分析模型能理解「程度與語意」
      const qText = question || streamingQuestion || "";
      const descriptor = deriveLikertDescriptor(qText, likertValue);
      finalAnswer = `${likertValue} — ${descriptor}`;
    } else finalAnswer = answer;

    try {
      const res = await fetch(`${apiBase}/questionnaire/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, answer: finalAnswer }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // 儲存本地回應（用於備援分析）
      setResponses((prev) => [
        ...prev,
        {
          question: question || streamingQuestion || "",
          answer: finalAnswer,
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
        // 從後端取得 advice 與 profile, investor_type
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
        setQuestionNumber((qn) => qn + 1);
        setLoading(false);
        await streamQuestion(sessionId, questionNumber + 1);
      }
    } catch (e: unknown) {
      setError(String(e));
      setLoading(false);
    }
  };

  // 新增：根據題目語意推論 Likert 描述詞（返回中文描述）
  const deriveLikertDescriptor = (questionText: string, value: number) => {
    const q = (questionText || "").toLowerCase();
    // 常見壓力/情緒關鍵字
    const stressKeywords = ["壓力", "焦慮", "緊張", "擔心", "煩躁", "壓力大"];
    const agreementKeywords = ["認同", "同意", "贊同"];
    const riskKeywords = ["風險", "風險承受", "冒險", "風險偏好"];

    // 基本提示詞
    const baseLabels = ["從不", "偶爾", "有時", "經常", "非常常"];
    const label = baseLabels[Math.max(0, Math.min(4, value - 1))];

    // 根據題目判斷語意
    if (stressKeywords.some((k) => q.includes(k))) {
      // 強調「壓力/焦慮」語意
      const suffix = [
        "不會感到壓力",
        "偶爾感到壓力",
        "有時感到壓力",
        "經常感到壓力",
        "非常常感到壓力",
      ];
      return suffix[Math.max(0, Math.min(4, value - 1))];
    }

    if (riskKeywords.some((k) => q.includes(k))) {
      const suffix = ["非常保守", "偏保守", "中性", "偏冒險", "非常冒險"];
      return `${label}（${suffix[Math.max(0, Math.min(4, value - 1))]}）`;
    }

    if (agreementKeywords.some((k) => q.includes(k))) {
      const suffix = [
        "非常不認同",
        "不認同",
        "中立/有保留",
        "認同",
        "非常認同",
      ];
      return `${label}（${suffix[Math.max(0, Math.min(4, value - 1))]}）`;
    }

    // 預設回傳 base label
    return `${label}`;
  };

  // MC / Likert UI helpers
  const renderOptions = () => (
    <div className="space-y-3">
      {options.map((opt, idx) => (
        <button
          key={idx}
          onClick={() => setSelectedIndex(idx)}
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
  );

  const renderLikert = () => {
    const labels = ["從不", "偶爾", "有時", "經常", "非常常"]; // 1..5 的提示詞
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="text-sm text-gray-600 mb-1">
          請依程度選擇（1 = 最低，5 = 最高）
        </div>
        <div className="flex items-end justify-center space-x-3">
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
      </div>
    );
  };

  // 互動分析：計算 profile
  const computeProfile = () => {
    let risk = 50,
      stability = 50,
      confidence = 50,
      patience = 50,
      sensitivity = 50;

    for (const r of responses) {
      if (r.type === "likert" && typeof r.value === "number") {
        const v = r.value;
        risk += (v - 3) * 8;
        stability += (3 - v) * 6;
        confidence += (v - 3) * 6;
        patience += (v - 3) * 4;
        sensitivity += (3 - v) * 6;
      } else if (r.type === "mc") {
        const text = (r.answer || "").toLowerCase();
        if (/(加碼|買入|進場|冒險)/.test(text)) {
          risk += 12;
          confidence += 8;
          sensitivity += 6;
        } else if (/(賣出|逃離|恐慌|立刻賣出|減碼)/.test(text)) {
          risk -= 12;
          stability -= 8;
          sensitivity += 10;
        } else if (/(觀望|冷靜|等待|持有)/.test(text)) {
          stability += 10;
          patience += 8;
          risk -= 4;
        } else {
          if (typeof r.value === "number") {
            const posFactor = r.value / Math.max(1, options.length - 1) - 0.5;
            risk += posFactor * 16;
            confidence += posFactor * 10;
            sensitivity -= posFactor * 6;
          }
        }
      } else {
        const len = (r.answer || "").length;
        if (len > 80) {
          confidence += 6;
          patience += 4;
        }
      }
    }

    const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
    return {
      risk: clamp(risk),
      stability: clamp(stability),
      confidence: clamp(confidence),
      patience: clamp(patience),
      sensitivity: clamp(sensitivity),
    };
  };

  const classifyInvestor = (p: {
    risk: number;
    stability: number;
    confidence: number;
    patience: number;
    sensitivity: number;
  }) => {
    if (p.risk > 60 && p.stability < 40) return "波動型（情緒受市場影響）";
    if (p.risk > 60 && p.stability >= 40) return "探險型（高風險偏好）";
    if (p.risk <= 40 && p.stability >= 60) return "冷靜型（理性決策）";
    if (p.risk <= 40 && p.stability < 60) return "謹慎型（保守穩健）";
    return "綜合型（中庸平衡）";
  };

  // RadarChart SVG (調整預設 size，由 220 提升到 300)
  const RadarChart = ({
    values,
    size = 300, // 放大預設尺寸
  }: {
    values: {
      risk: number;
      stability: number;
      confidence: number;
      patience: number;
      sensitivity: number;
    };
    size?: number;
  }) => {
    const labels = [
      "風險承受度",
      "情緒穩定度",
      "決策信心",
      "長期耐心",
      "市場敏感度",
    ];
    const dims = Object.values(values);
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 20;
    const points = dims.map((v, i) => {
      const angle = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
      const radius = (v / 100) * r;
      return `${cx + radius * Math.cos(angle)},${
        cy + radius * Math.sin(angle)
      }`;
    });
    const outer = labels.map((_, i) => {
      const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    });

    return (
      <svg width={size} height={size} className="mx-auto">
        {[0.2, 0.4, 0.6, 0.8, 1].map((s, idx) => {
          const poly = labels
            .map((_, i) => {
              const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
              const radius = s * r;
              return `${cx + radius * Math.cos(angle)},${
                cy + radius * Math.sin(angle)
              }`;
            })
            .join(" ");
          return (
            <polygon
              key={idx}
              points={poly}
              fill="none"
              stroke="#E6E6E6"
              strokeWidth={1}
            />
          );
        })}
        {outer.map((pt, i) => {
          const [x, y] = pt.split(",").map(Number);
          const dx = x > cx ? 8 : x < cx ? -8 : 0;
          const anchor = x > cx ? "start" : x < cx ? "end" : "middle";
          return (
            <text
              key={i}
              x={x + dx}
              y={y}
              fontSize={Math.max(10, size * 0.045)}
              fill="#374151"
              textAnchor={anchor}
              dominantBaseline="middle"
            >
              {labels[i]}
            </text>
          );
        })}
        <polygon
          points={points.join(" ")}
          fill="rgba(124,58,237,0.15)"
          stroke="#7C3AED"
          strokeWidth={2}
        />
        {points.map((pt, i) => {
          const [x, y] = pt.split(",").map(Number);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={Math.max(3, size * 0.01)}
              fill="#7C3AED"
            />
          );
        })}
      </svg>
    );
  };

  // UI constants & JSX — 保留原有整體佈局，但已在題目回答區與完成畫面整合上方功能
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
          {/* 開始卡片 - 保留 */}
          {!sessionId && (
            <div className="bg-white rounded-xl shadow-lg animate-slideIn">
              <div className="p-8 text-center">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-r from-purple-500 to-indigo-500 rounded-full mb-6 shadow-xl">
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
                  className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-lg min-w-48 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
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
              <div className="border-b border-gray-200 px-6 py-4 bg-linear-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="w-8 h-8 bg-linear-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                      <DocumentTextIcon className="w-4 h-4 text-white" />
                    </div>
                    問卷題目
                  </h2>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                      第 {questionNumber + 1} 題
                    </div>
                    <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                      已回答 {responses.length} 題
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
                  <div className="bg-linear-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 p-6 rounded-lg relative overflow-hidden">
                    {isStreamingQuestion ? (
                      <div className="text-gray-800 text-lg leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {streamingQuestion}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-gray-800 text-lg leading-relaxed">
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

                  {questionType === "mc" && (
                    <div className="mb-4">{renderOptions()}</div>
                  )}
                  {questionType === "likert" && (
                    <div className="mb-4">{renderLikert()}</div>
                  )}
                  {questionType === "open" && (
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

                <div className="flex justify-end">
                  <button
                    onClick={submitAnswer}
                    disabled={
                      loading ||
                      (questionType === "open" && !answer.trim()) ||
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
                        <ChartBarIcon className="w-4 h-4 ml-2 inline" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 完成結果：AI 建議 + 互動分析雷達圖 */}
          {finished && (
            <div className="bg-white rounded-xl shadow-lg animate-slideIn">
              <div className="border-b border-gray-200 px-6 py-4 bg-linear-to-r from-green-50 to-emerald-50">
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
                  <h2 className="text-xl font-semibold text-gray-800">
                    測驗完成 - 個人化建議
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <div className="bg-linear-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                      您的理財心理分析報告
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          AI 建議
                        </h4>
                        <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
                          {advice}
                        </pre>
                      </div>

                      <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          互動分析
                        </h4>
                        <div className="flex items-center justify-center">
                          <div className="w-full max-w-lg">
                            <RadarChart
                              values={serverProfile || profile}
                              size={340}
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="text-sm text-gray-600">
                            投資者類型
                          </div>
                          <div className="text-lg font-semibold text-gray-800">
                            {investorType || classifyInvestor(profile)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
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
                    }}
                    className="bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 font-medium rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
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
