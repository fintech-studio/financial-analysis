import React, { useState } from "react";

const TradeSignalsPage: React.FC = () => {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleAnalyze = async () => {
    setLoading(true);
    setResult("");
    setError("");
    try {
      // 呼叫後端 API 觸發 python 執行
      const res = await fetch("/api/trade-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      if (!res.ok) throw new Error("API 請求失敗");
      const data = await res.json();
      setResult(data.output || "無輸出");
    } catch (e: any) {
      setError(e.message || "分析失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">進階交易訊號分析</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2 text-lg"
          placeholder="請輸入股票代號 (如 2330)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          disabled={loading}
        />
        <button
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-lg font-semibold disabled:opacity-60"
          onClick={handleAnalyze}
          disabled={!symbol || loading}
        >
          {loading ? "分析中..." : "分析"}
        </button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {result && (
        <pre className="bg-gray-100 rounded p-4 whitespace-pre-wrap text-sm mt-4 max-h-[500px] overflow-auto">
          {result}
        </pre>
      )}
    </div>
  );
};

export default TradeSignalsPage;
