import type { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { symbol } = req.body;
  if (!symbol || typeof symbol !== "string") {
    return res.status(400).json({ error: "請提供正確的股票代號" });
  }

  // Python 腳本路徑
  const scriptPath = path.join(
    process.cwd(),
    "public",
    "python-app",
    "Trade-Signals",
    "analyze_signals.py"
  );

  // 執行 python 腳本，傳入 symbol 參數
  // 強制 python 腳本以 utf-8 輸出
  const py = spawn("python", [scriptPath, symbol], {
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    cwd: path.dirname(scriptPath),
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  let error = "";

  // 明確指定 Node stream 為 utf8
  if (py.stdout) py.stdout.setEncoding("utf8");
  if (py.stderr) py.stderr.setEncoding("utf8");
  py.stdout.on("data", (data) => {
    output += data;
  });
  py.stderr.on("data", (data) => {
    error += data;
  });
  py.on("close", (code) => {
    if (code === 0) {
      res.status(200).json({ output });
    } else {
      res.status(500).json({ error: error || "Python 腳本執行失敗" });
    }
  });
}
