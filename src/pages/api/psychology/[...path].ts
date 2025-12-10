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
    if (!upstream.ok) {
      const text = await upstream.text();
      console.error(
        "Proxy upstream error",
        upstream.status,
        upstream.statusText,
        text
      );
    }

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

      if (isSSE) {
        // Forward SSE events directly to the client (don't aggregate), preserving streaming
        res.setHeader("content-type", "text/event-stream; charset=utf-8");
        res.setHeader("cache-control", "no-cache, no-transform");
        res.setHeader("connection", "keep-alive");
        res.flushHeaders?.();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!value) continue;
          const chunk = decoder.decode(value);
          // Write raw chunk back to client; downstream client handles parsing
          res.write(chunk);
        }
        // end
        await reader.cancel();
        res.end();
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
