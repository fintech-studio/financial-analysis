import type { NextApiRequest, NextApiResponse } from "next";

// 由 server 端轉發到本機 Ollama，避免瀏覽器直接向不同 host/ip 發生 CORS 或綁定問題。
const OLLAMA_LOCAL = process.env.OLLAMA_LOCAL;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!OLLAMA_LOCAL) {
      res.status(500).json({
        error: "OLLAMA_LOCAL not set. Please set OLLAMA_LOCAL in your .env",
      });
      return;
    }
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        "content-type": "application/json",
      },
      // Next.js 會把 body 解析成物件，直接轉成 JSON 並轉發
      body:
        req.method && req.method.toUpperCase() !== "GET"
          ? JSON.stringify(req.body)
          : undefined,
    };

    const upstream = await fetch(String(OLLAMA_LOCAL), fetchOptions);

    // 將 upstream 的 status 與 headers 傳回給 client（排除可能造成問題的 header）
    res.status(upstream.status);
    const skipHeaders = new Set([
      "content-encoding",
      "content-length",
      "transfer-encoding",
      "connection",
    ]);
    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (skipHeaders.has(lower)) return;
      try {
        res.setHeader(key, value);
      } catch {
        // ignore header set errors
      }
    });

    // 如果 upstream 沒有 body，直接讀取文字並結束
    if (!upstream.body) {
      const txt = await upstream.text();
      res.send(txt);
      return;
    }

    // 開始串流回傳：先 flush headers
    res.flushHeaders?.();

    // 若 upstream.body 支援 pipe（Node Readable stream），直接 pipe
    const potentialNodeStream = upstream.body as unknown as {
      pipe?: (...args: unknown[]) => unknown;
    };
    if (potentialNodeStream && typeof potentialNodeStream.pipe === "function") {
      try {
        // runtime pipe for Node Readable stream
        const nodeReadable =
          potentialNodeStream as unknown as NodeJS.ReadableStream & {
            pipe?: (dest: NodeJS.WritableStream) => NodeJS.WritableStream;
          };
        const nodeWritable = res as unknown as NodeJS.WritableStream;
        nodeReadable.pipe?.(nodeWritable);
        return;
      } catch {
        // fallback to reader-based streaming
      }
    }

    // 否則把 Web ReadableStream 逐 chunk 讀出並寫到 res
    const reader = (
      upstream.body as unknown as ReadableStream<Uint8Array>
    ).getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          // value 可能是 Uint8Array
          const chunk = Buffer.from(value);
          res.write(chunk);
        }
      }
    } finally {
      try {
        await reader.cancel();
      } catch {
        // ignore
      }
      res.end();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message ?? "proxy error" });
  }
}
