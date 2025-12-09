export type QuestionType = "open" | "mc" | "likert";

export const detectQuestionType = (q: string) => {
  if (!q) return "open" as QuestionType;
  if (/(1\s*到\s*5|1-5|1~5|1～5|likert|1[^\d]*5)/i.test(q))
    return "likert" as QuestionType;
  const chunks = q
    .split(/[\n;/；、]| \/ | \| /)
    .map((s) => s.trim())
    .filter(Boolean);
  return chunks.length >= 2 && chunks.length <= 10
    ? ("mc" as QuestionType)
    : ("open" as QuestionType);
};

export const extractOptions = (q: string) => {
  if (!q) return [] as string[];

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
  parts = parts.map((p) =>
    p.replace(/^[A-Za-z0-9).:\u3001\uFF0D\s-]+/, "").trim()
  );

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
      if (parts.slice(1).some((p) => p.length <= 80)) parts = parts.slice(1);
      else {
        const lastSpace = first.lastIndexOf(" ");
        if (lastSpace !== -1 && lastSpace < first.length - 1)
          parts[0] = first.slice(lastSpace + 1).trim();
      }
    }
  }

  const opts = parts
    .map((p) => p.replace(/^['"“”]+|['"“”]+$/g, "").trim())
    .filter(Boolean);
  return opts.length >= 2 ? opts : [];
};

export const deriveLikertDescriptor = (questionText: string, value: number) => {
  const q = (questionText || "").toLowerCase();
  const stressKeywords = ["壓力", "焦慮", "緊張", "擔心", "煩躁", "壓力大"];
  const agreementKeywords = ["認同", "同意", "贊同"];
  const riskKeywords = ["風險", "風險承受", "冒險", "風險偏好"];

  const baseLabels = ["從不", "偶爾", "有時", "經常", "非常常"];
  const label = baseLabels[Math.max(0, Math.min(4, value - 1))];

  if (stressKeywords.some((k) => q.includes(k))) {
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
    const suffix = ["非常不認同", "不認同", "中立/有保留", "認同", "非常認同"];
    return `${label}（${suffix[Math.max(0, Math.min(4, value - 1))]}）`;
  }

  return `${label}`;
};

export const computeProfileFromResponses = (
  responses: {
    question: string;
    answer: string;
    type: string;
    value?: number | null;
  }[]
) => {
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
          const posFactor = r.value / Math.max(1, (r.value || 1) - 1) - 0.5;
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

export const classifyInvestor = (p: {
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
