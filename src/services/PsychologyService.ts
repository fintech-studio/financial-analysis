const BASE = "/api/psychology/questionnaire";

export async function startQuestionnaire() {
  const res = await fetch(`${BASE}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function streamQuestion(
  sessionId: string,
  questionNumber: number,
  signal?: AbortSignal
) {
  const res = await fetch(`${BASE}/stream-question`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Request SSE/streaming from backend
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      session_id: sessionId,
      question_number: questionNumber,
    }),
    signal,
  });
  return res; // caller handles streaming via res.body
}

export async function answerQuestion(sessionId: string, answer: string) {
  const res = await fetch(`${BASE}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, answer }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function getQuestionUrlPaths() {
  return {
    start: `${BASE}/start`,
    stream: `${BASE}/stream-question`,
    answer: `${BASE}/answer`,
  };
}
