import type { NextApiRequest, NextApiResponse } from "next";

const PSYCHOLOGY_API_BASE = process.env.PSYCHOLOGY_API_BASE;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!PSYCHOLOGY_API_BASE) {
      res.status(500).json({
        error:
          "PSYCHOLOGY_API_BASE not set. Please set PSYCHOLOGY_API_BASE in your .env",
      });
      return;
    }

    // Build target URL
    const path = Array.isArray(req.query.path)
      ? req.query.path.join("/")
      : String(req.query.path || "");
    const upstreamUrl = `${PSYCHOLOGY_API_BASE}/${path}`.replace(
      /(?<!:)\/+/g,
      "/"
    );

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        "content-type": "application/json",
      },
      body:
        req.method && req.method.toUpperCase() !== "GET"
          ? JSON.stringify(req.body)
          : undefined,
    };

    const upstream = await fetch(upstreamUrl, fetchOptions);

    // Forward status and headers (skip hop-by-hop headers)
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

    // If no upstream body, return text or JSON
    if (!upstream.body) {
      const txt = await upstream.text();
      res.send(txt);
      return;
    }

    // Begin streaming back
    res.flushHeaders?.();

    const potentialNodeStream = upstream.body as unknown as {
      pipe?: (...args: unknown[]) => unknown;
    };
    if (potentialNodeStream && typeof potentialNodeStream.pipe === "function") {
      try {
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

    const reader = (
      upstream.body as unknown as ReadableStream<Uint8Array>
    ).getReader();
    try {
      const contentType = String(upstream.headers.get("content-type") || "");
      const isSSE = contentType.includes("text/event-stream");
      const decoder = new TextDecoder();
      let buf = "";

      if (isSSE) {
        const aggregatedParts: string[] = [];
        const rawEvents: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!value) continue;
          buf += decoder.decode(value, { stream: true });

          let idx;
          while ((idx = buf.indexOf("\n\n")) !== -1) {
            const event = buf.slice(0, idx);
            buf = buf.slice(idx + 2);
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
            if (data === "[DONE]") continue;
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

            // If the upstream SSE is long-running and our client expects streaming,
            // we could forward raw events, but for the questionnaire we'll aggregate
            // and return a final JSON (same as `ollama-proxy`).
          }
        }

        // process leftover buffer
        if (buf.trim()) {
          const lines = buf.split(/\r?\n/);
          const dataLines: string[] = [];
          for (const line of lines) {
            if (line.startsWith("data:"))
              dataLines.push(line.replace(/^data:\s*/i, ""));
          }
          const data = dataLines.join("\n").trim();
          if (data && data !== "[DONE]") aggregatedParts.push(data);
        }

        const final = aggregatedParts.join("").trim();
        const reply: Record<string, unknown> = {
          // we don't know model header; keep a consistent shape
          created_at: new Date().toISOString(),
          message: { content: final },
          done: true,
        };
        if (rawEvents.length) reply["raw_events"] = rawEvents;
        res.setHeader("content-type", "application/json;charset=utf-8");
        res.end(JSON.stringify(reply));
        return;
      } else {
        // Non-SSE: stream raw binary chunks
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
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
