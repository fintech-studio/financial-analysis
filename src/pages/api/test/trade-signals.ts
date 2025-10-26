import type { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";
import path from "path";

interface TradeSignalResult {
  summary: {
    totalRecords: number;
    signalRecords: number;
    signalPercentage: number;
  };
  signals: {
    [key: string]: {
      count: number;
      percentage: number;
    };
  };
  strength: {
    buyAverage?: number;
    buyMax?: number;
    sellAverage?: number;
    sellMax?: number;
  };
  recentSignals: Array<{
    date: string;
    signal: string;
    strength: string;
    price: number;
  }>;
  latestData: {
    date: string;
    price: number;
    signal: string;
    strength: string;
    buySignals: number;
    sellSignals: number;
  } | null;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let symbol = "";
  if (req.method === "GET") {
    symbol = req.query.symbol as string;
  } else if (req.method === "POST") {
    const body = req.body as Record<string, unknown>;
    symbol = typeof body.symbol === "string" ? body.symbol : "";
  }

  if (!symbol || typeof symbol !== "string") {
    res.status(400).json({ error: "請提供正確的股票代號" });
    return;
  }

  const scriptPath = path.join(
    process.cwd(),
    "public",
    "python-app",
    "Trade-Signals",
    "analyze_signals.py"
  );

  const py = spawn("python", [scriptPath, symbol], {
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    cwd: path.dirname(scriptPath),
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (py.stdout) py.stdout.setEncoding("utf8");
  if (py.stderr) py.stderr.setEncoding("utf8");

  let outputData = "";
  let errorData = "";

  py.stdout.on("data", (data) => {
    outputData += data;
  });

  py.stderr.on("data", (data) => {
    errorData += data;
  });

  py.on("close", (code) => {
    // 先檢查輸出內容是否包含錯誤訊息
    const hasDataError =
      outputData.includes("找不到") ||
      outputData.includes("沒有資料可分析") ||
      outputData.includes("錯誤:");

    if (code !== 0 || hasDataError) {
      // 區分不同類型的錯誤
      if (hasDataError) {
        const errorMatch = outputData.match(/錯誤:\s*([^\n]+)/);
        const errorMsg = errorMatch ? errorMatch[1] : "找不到該股票代號的資料";

        // 資料不存在的情況返回404而非500
        res.status(404).json({
          error: errorMsg,
          details: "股票代號不存在或資料庫中無此資料",
          suggestion: "請確認股票代號是否正確，或聯繫管理員確認資料狀態",
        });
      } else {
        // 其他系統錯誤返回500
        res.status(500).json({
          error: "分析過程發生錯誤",
          details: errorData || "未知錯誤",
        });
      }
      return;
    }

    try {
      // 解析Python輸出的結構化數據
      const result = parseAnalysisOutput(outputData);
      res.status(200).json({
        success: true,
        symbol,
        timestamp: new Date().toISOString(),
        data: result,
      });
    } catch (error) {
      // 解析錯誤的情況
      if (
        error instanceof Error &&
        (error.message.includes("找不到") || error.message.includes("沒有資料"))
      ) {
        res.status(404).json({
          error: error.message,
          details: "股票代號不存在或資料解析失敗",
          suggestion: "請確認輸入的股票代號是否正確",
        });
      } else {
        res.status(500).json({
          error: "解析分析結果失敗",
          details: error instanceof Error ? error.message : "未知錯誤",
        });
      }
    }
  });
}

function parseAnalysisOutput(output: string): TradeSignalResult {
  // 檢查是否找不到資料的情況
  if (output.includes("找不到") || output.includes("沒有資料可分析")) {
    throw new Error("找不到該股票代號的資料，請確認股票代號是否正確");
  }

  // 檢查是否有錯誤訊息
  if (output.includes("讀取資料時發生錯誤") || output.includes("程式結束")) {
    const errorMatch = output.match(/錯誤:\s*([^\n]+)/);
    const errorMsg = errorMatch ? errorMatch[1] : "資料讀取失敗";
    throw new Error(errorMsg);
  }

  // 解析Python腳本的輸出，提取關鍵資訊
  const result: TradeSignalResult = {
    summary: { totalRecords: 0, signalRecords: 0, signalPercentage: 0 },
    signals: {},
    strength: {},
    recentSignals: [],
    latestData: null,
  };

  // 解析總體統計 - 總資料筆數來自 len(df)
  const totalMatch = output.match(/總資料筆數:\s*([\d,]+)/);
  const signalMatch = output.match(/有訊號筆數:\s*([\d,]+)\s*\((\d+\.?\d*)%\)/);

  // 如果找不到基本統計資料，可能是沒有資料
  if (!totalMatch) {
    throw new Error("無法解析分析結果，可能該股票沒有足夠的歷史資料");
  }

  if (totalMatch) {
    // 移除千位分隔符號後轉換為數字
    result.summary.totalRecords = parseInt(totalMatch[1].replace(/,/g, ""));

    // 如果總資料筆數為0，表示沒有資料
    if (result.summary.totalRecords === 0) {
      throw new Error("該股票代號沒有任何歷史資料");
    }
  }

  if (signalMatch) {
    result.summary.signalRecords = parseInt(signalMatch[1].replace(/,/g, ""));
    result.summary.signalPercentage = parseFloat(signalMatch[2]);
  }

  // 訊號覆蓋率 = 有訊號筆數 ÷ 總資料筆數 × 100
  // 其中有訊號筆數是 df['Trade_Signal'] 不為空的行數
  // 總資料筆數是 df 的總行數
  // Python 端計算方式：
  // signal_records = len(df[df['Trade_Signal'] != ''])
  // total_records = len(df)
  // signalPercentage = signal_records / total_records * 100

  // 解析交易訊號統計
  const signalMatches = output.matchAll(
    /\s+([^:]+):\s*([\d,]+)\s*次\s*\((\d+\.?\d*)%\)/g
  );
  for (const match of signalMatches) {
    const [, signal, count, percentage] = match;
    if (signal.trim()) {
      result.signals[signal.trim()] = {
        count: parseInt(count.replace(/,/g, "")),
        percentage: parseFloat(percentage),
      };
    }
  }

  // 解析訊號強度
  const buyStrengthMatch = output.match(
    /多頭訊號強度:\s*平均\s*(\d+\.?\d*)分,\s*最高\s*(\d+\.?\d*)分/
  );
  const sellStrengthMatch = output.match(
    /空頭訊號強度:\s*平均\s*(\d+\.?\d*)分,\s*最高\s*(\d+\.?\d*)分/
  );

  if (buyStrengthMatch) {
    result.strength.buyAverage = parseFloat(buyStrengthMatch[1]);
    result.strength.buyMax = parseFloat(buyStrengthMatch[2]);
  }
  if (sellStrengthMatch) {
    result.strength.sellAverage = parseFloat(sellStrengthMatch[1]);
    result.strength.sellMax = parseFloat(sellStrengthMatch[2]);
  }

  // 解析最近訊號（包含價格資訊）
  const recentSignalsSection = output.split("最近3個交易訊號:")[1];
  if (recentSignalsSection) {
    const recentMatches = recentSignalsSection.matchAll(
      /\s+(\d{4}-\d{2}-\d{2}):\s*([^(]+)\s*\(([^)]+)\)\s*價格:\s*(\d+\.?\d*)/g
    );
    for (const match of recentMatches) {
      const [, date, signal, strength, price] = match;
      result.recentSignals.push({
        date: date.trim(),
        signal: signal.trim(),
        strength: strength.trim(),
        price: parseFloat(price),
      });
    }
  }

  // 解析最新資料狀態
  const latestDataSection = output.split("最新資料狀態:")[1];
  if (latestDataSection) {
    const dateMatch = latestDataSection.match(/日期:\s*(\d{4}-\d{2}-\d{2})/);
    const priceMatch = latestDataSection.match(/收盤價:\s*(\d+\.?\d*)/);
    const signalMatch = latestDataSection.match(/當前訊號:\s*([^\n]+)/);
    const strengthMatch = latestDataSection.match(/訊號強度:\s*([^\n]+)/);
    const buySignalsMatch = latestDataSection.match(/多頭分數:\s*(\d+\.?\d*)/);
    const sellSignalsMatch = latestDataSection.match(/空頭分數:\s*(\d+\.?\d*)/);

    if (dateMatch && priceMatch) {
      result.latestData = {
        date: dateMatch[1].trim(),
        price: parseFloat(priceMatch[1]),
        signal: signalMatch ? signalMatch[1].trim() : "",
        strength: strengthMatch ? strengthMatch[1].trim() : "",
        buySignals: buySignalsMatch ? parseFloat(buySignalsMatch[1]) : 0,
        sellSignals: sellSignalsMatch ? parseFloat(sellSignalsMatch[1]) : 0,
      };
    }
  }

  return result;
}
