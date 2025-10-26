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
      const contentType = String(upstream.headers.get("content-type") || "");
      const isSSE = contentType.includes("text/event-stream");

      if (isSSE) {
        // 若 upstream 使用 SSE (text/event-stream)，我們把 event 的 data 欄位抽出並聚合成最終內容
        const decoder = new TextDecoder();
        let buf = "";
        const aggregatedParts: string[] = [];
        const rawEvents: string[] = []; // for debugging: store raw data: lines

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!value) continue;
          buf += decoder.decode(value, { stream: true });

          // SSE events are typically separated by a blank line
          let idx;
          while ((idx = buf.indexOf("\n\n")) !== -1) {
            const event = buf.slice(0, idx);
            buf = buf.slice(idx + 2);

            // collect data: lines
            const lines = event.split(/\r?\n/);
            const dataLines: string[] = [];
            for (const line of lines) {
              if (line.startsWith("data:")) {
                dataLines.push(line.replace(/^data:\s*/i, ""));
              }
            }
            const data = dataLines.join("\n").trim();
            rawEvents.push(data);
            if (!data) continue;

            // 常見的控制訊息 [DONE] 可忽略
            if (data === "[DONE]") continue;

            // 嘗試解析為 JSON，若成功則從常見欄位抽取文字並加入聚合陣列；若非 JSON 則視為純文字
            try {
              const parsed = JSON.parse(data);
              // 優先抽取 message.data / output / result / text / content / choices
              const candidates = [
                parsed.message?.content,
                parsed.output,
                parsed.result,
                parsed.text,
                parsed.content,
                parsed.choices?.[0]?.message?.content,
                parsed.choices?.[0]?.text,
              ];
              for (const c of candidates) {
                if (typeof c === "string" && c.trim()) {
                  aggregatedParts.push(c);
                }
              }
            } catch {
              // keep raw data for debugging
              aggregatedParts.push(data);
            }
          }
        }

        // 處理殘留 buffer
        if (buf.trim()) {
          const lines = buf.split(/\r?\n/);
          const dataLines: string[] = [];
          for (const line of lines) {
            if (line.startsWith("data:"))
              dataLines.push(line.replace(/^data:\s*/i, ""));
          }
          const data = dataLines.join("\n").trim();
          if (data && data !== "[DONE]") {
            try {
              const parsed = JSON.parse(data);
              const candidates = [
                parsed.message?.content,
                parsed.output,
                parsed.result,
                parsed.text,
                parsed.content,
                parsed.choices?.[0]?.message?.content,
                parsed.choices?.[0]?.text,
              ];
              for (const c of candidates) {
                if (typeof c === "string" && c.trim()) aggregatedParts.push(c);
              }
            } catch {
              aggregatedParts.push(data);
            }
          }
        }

        // 聚合後一次回傳完整 JSON（方便像 curl 的 client）
        const final = aggregatedParts.join("").trim();
        const reply: Record<string, unknown> = {
          model: upstream.headers.get("x-model") || "ollama",
          // created_at 由 proxy 產生
          created_at: new Date().toISOString(),
          message: { role: "assistant", content: final },
          done: true,
        };
        // include raw_events for debugging so callers can inspect exactly what upstream sent
        if (rawEvents.length) reply["raw_events"] = rawEvents;
        res.setHeader("content-type", "application/json;charset=utf-8");
        res.end(JSON.stringify(reply));
        return;
      } else {
        // 非 SSE，直接把原始二進位 chunk stream 寫回 client
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            // value 可能是 Uint8Array
            const chunk = Buffer.from(value);
            res.write(chunk);
          }
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
