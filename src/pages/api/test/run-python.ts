import type { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const symbol = req.query.symbol as string;
  if (!symbol) {
    res.status(400).json({ error: "缺少股票代號" });
    return;
  }
  // SSE header
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  if (res.flushHeaders) res.flushHeaders();

  const scriptPath = path.resolve(
    process.cwd(),
    "public/python-app/Technical-Indicators/main.py"
  );
  // 支援多個 symbol（用空格分隔）
  const symbols = symbol.match(/"[^"]+"|[^\s]+/g) || [];
  const args = [
    "-u",
    scriptPath,
    ...symbols.map((s) => s.replace(/^"|"$/g, "")),
  ];
  const py = spawn("python", args, {
    cwd: path.dirname(scriptPath),
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
  });

  py.stdout.on("data", (data) => {
    (data.toString().split(/\r?\n/) as string[]).forEach((line: string) => {
      if (line) res.write(`data: ${line}\n\n`);
      // @ts-expect-error: res.flush 不是標準型別，但部分 Node.js/Express 環境支援
      if (res.flush) res.flush();
    });
  });
  py.stderr.on("data", (data) => {
    (data.toString().split(/\r?\n/) as string[]).forEach((line: string) => {
      if (line) res.write(`data: [stderr] ${line}\n\n`);
      // @ts-expect-error: res.flush 不是標準型別，但部分 Node.js/Express 環境支援
      if (res.flush) res.flush();
    });
  });
  py.on("close", (code) => {
    res.write(`event: end\ndata: 程式結束 (code=${code})\n\n`);
    // @ts-expect-error: res.flush 不是標準型別，但部分 Node.js/Express 環境支援
    if (res.flush) res.flush();
    res.end();
  });
  req.on("close", () => {
    py.kill();
  });
}
