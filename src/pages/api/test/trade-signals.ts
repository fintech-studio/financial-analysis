import type { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 改為 GET 串流 SSE
  let symbol = "";
  if (req.method === "GET") {
    symbol = req.query.symbol as string;
  } else if (req.method === "POST") {
    // 明確指定 req.body 型別為 Record<string, unknown>
    const body = req.body as Record<string, unknown>;
    symbol = typeof body.symbol === "string" ? body.symbol : "";
  }
  if (!symbol || typeof symbol !== "string") {
    res.status(400).json({ error: "請提供正確的股票代號" });
    return;
  }

  // Python 腳本路徑
  const scriptPath = path.join(
    process.cwd(),
    "public",
    "python-app",
    "Trade-Signals",
    "analyze_signals.py"
  );

  // SSE: 設定 header
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  // flushHeaders for Node.js http.ServerResponse (not always available in Next.js)
  // 型別擴充: 斷言 res 可能有 flushHeaders
  if (
    typeof (res as unknown as { flushHeaders?: () => void }).flushHeaders ===
    "function"
  ) {
    (res as unknown as { flushHeaders: () => void }).flushHeaders();
  }
  // 定時 keep-alive 防止連線被關閉
  const keepAlive = setInterval(() => {
    res.write(":keep-alive\n\n");
  }, 15000);

  const py = spawn("python", [scriptPath, symbol], {
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    cwd: path.dirname(scriptPath),
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (py.stdout) py.stdout.setEncoding("utf8");
  if (py.stderr) py.stderr.setEncoding("utf8");

  py.stdout.on("data", (data) => {
    // 逐行分割並串流
    const lines = data.split(/\r?\n/);
    for (const line of lines) {
      if (line.trim() !== "") {
        res.write(`data: ${line}\n\n`);
        // 立即 flush (for Node.js http.ServerResponse)
        if (
          typeof (res as unknown as { flush?: () => void }).flush === "function"
        ) {
          (res as unknown as { flush: () => void }).flush();
        }
      }
    }
  });
  py.stderr.on("data", (data) => {
    const lines = data.split(/\r?\n/);
    for (const line of lines) {
      if (line.trim() !== "") {
        res.write(`data: [錯誤] ${line}\n\n`);
        if (
          typeof (res as unknown as { flush?: () => void }).flush === "function"
        ) {
          (res as unknown as { flush: () => void }).flush();
        }
      }
    }
  });
  py.on("close", () => {
    res.write("event: end\ndata: END\n\n");
    res.end();
    clearInterval(keepAlive);
    // 這裡的 res.end() 已經結束回應，後續 write/flush 可省略
  });
}
