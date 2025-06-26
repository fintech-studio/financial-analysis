import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import React, { useState, useRef } from "react";
import { useRouter } from "next/router";

interface FinancialResult {
  market_category?: string;
  symbol: string;
  name: string;
  isin_code?: string;
  date?: string;
  market_type?: string;
  industry_type?: string;
}

const FinancialCodeTestPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FinancialResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpPage, setJumpPage] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const resultsPerPage = 20;
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("請輸入查詢內容");
      return;
    }
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch(
        `/api/financial-code?symbol=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("查詢失敗");
      const data = await res.json();
      setResults(data.results || []);
      setCurrentPage(1); // 查詢時重設分頁
      setJumpPage("");
    } catch (err: any) {
      setError(err.message || "發生未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 排序處理
  const sortedResults = React.useMemo(() => {
    if (!sortConfig) return results;
    const sorted = [...results];
    sorted.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof FinancialResult] || "";
      const bValue = b[sortConfig.key as keyof FinancialResult] || "";
      if (typeof aValue === "string" && typeof bValue === "string") {
        if (sortConfig.direction === "asc") {
          return aValue.localeCompare(bValue, "zh-Hant");
        } else {
          return bValue.localeCompare(aValue, "zh-Hant");
        }
      }
      return 0;
    });
    return sorted;
  }, [results, sortConfig]);

  // 分頁計算
  const totalPages = Math.ceil(sortedResults.length / resultsPerPage);
  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  // 跳頁功能
  const handleJump = () => {
    const page = Number(jumpPage);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 排序點擊事件
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1); // 排序時回到第一頁
  };

  // 動態產生欄位
  const columns = [
    { key: "market_category", label: "市場" },
    { key: "symbol", label: "代號" },
    { key: "name", label: "名稱" },
    { key: "isin_code", label: "ISIN 國際證券識別號碼" },
    { key: "date", label: "上市/發行/登記日期" },
    { key: "market_type", label: "市場類別" },
    { key: "industry_type", label: "產業類別" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100 flex flex-col items-center justify-start py-10">
      <div className="bg-white/90 p-10 rounded-2xl shadow-xl w-full max-w-7xl border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
            <DocumentMagnifyingGlassIcon className="h-8 w-8 text-blue-600" />
            金融代號查詢
            <span className="mt-4 text-sm font-normal text-gray-400  select-none">
              資料更新：2025-06-26
            </span>
          </h1>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition"
              onClick={() => router.push("financial-code/FinancialCode")}
            >
              代號一覽表
            </button>
          </div>
        </div>
        <div className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            className="border-2 border-blue-200 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="請輸入股票、指數、ETF、ETN 代號或名稱"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={loading}
          />
          <button
            className={`px-6 py-2 rounded-lg font-semibold shadow transition text-white min-w-28 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
            }`}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">查詢中</span>
            ) : (
              "查詢"
            )}
          </button>
        </div>
        {error && (
          <div className="text-red-600 mb-4 font-medium text-center animate-pulse">
            {error}
          </div>
        )}
        <div className="mt-4">
          {results.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-lg border border-blue-100 shadow-sm bg-white/80">
                <table className="w-full text-sm text-center table-fixed">
                  <colgroup>
                    {columns.map((col) => (
                      <col
                        key={col.key}
                        style={{
                          width:
                            col.key === "market_category"
                              ? "100px"
                              : col.key === "symbol"
                              ? "110px"
                              : col.key === "name"
                              ? "140px"
                              : col.key === "isin_code"
                              ? "180px"
                              : col.key === "date"
                              ? "130px"
                              : col.key === "market_type"
                              ? "110px"
                              : col.key === "industry_type"
                              ? "130px"
                              : "100px",
                        }}
                      />
                    ))}
                  </colgroup>
                  <thead>
                    <tr className="bg-blue-100 text-blue-800">
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className="px-3 py-2 font-semibold whitespace-nowrap border-b border-blue-200 cursor-pointer select-none hover:bg-blue-200 transition"
                          onClick={() => handleSort(col.key)}
                        >
                          <span className="flex items-center justify-center gap-1">
                            {col.label}
                            {sortConfig?.key === col.key && (
                              <span>
                                {sortConfig.direction === "asc" ? "▲" : "▼"}
                              </span>
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedResults.map((row, idx) => (
                      <tr
                        key={idx + (currentPage - 1) * resultsPerPage}
                        className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}
                      >
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className="px-3 py-2 border-b border-blue-100 whitespace-nowrap overflow-hidden text-ellipsis"
                          >
                            {row[col.key as keyof FinancialResult] || (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* 分頁控制元件 */}
              <div className="flex flex-wrap justify-center items-center gap-2 mt-6 w-full">
                <button
                  className="px-3 py-1 rounded border bg-white text-gray-700 font-normal disabled:opacity-50 text-sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  首頁
                </button>
                <button
                  className="px-3 py-1 rounded border bg-white text-gray-700 font-normal disabled:opacity-50 text-sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  上一頁
                </button>
                <span className="px-2 text-gray-700 select-none text-sm">
                  第 {currentPage} / {totalPages} 頁
                </span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPage}
                  onChange={(e) =>
                    setJumpPage(e.target.value.replace(/[^\d]/g, ""))
                  }
                  className="w-16 px-2 py-1 border rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  placeholder="跳頁"
                  onKeyDown={(e) => e.key === "Enter" && handleJump()}
                  disabled={totalPages === 0}
                />
                <button
                  className="px-3 py-1 rounded border bg-white text-gray-700 font-normal disabled:opacity-50 text-sm"
                  onClick={handleJump}
                  disabled={
                    !jumpPage ||
                    Number(jumpPage) < 1 ||
                    Number(jumpPage) > totalPages
                  }
                >
                  跳頁
                </button>
                <button
                  className="px-3 py-1 rounded border bg-white text-gray-700 font-normal disabled:opacity-50 text-sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  下一頁
                </button>
                <button
                  className="px-3 py-1 rounded border bg-white text-gray-700 font-normal disabled:opacity-50 text-sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  末頁
                </button>
              </div>
            </>
          ) : (
            !loading && (
              <div className="text-gray-400 text-center py-8 text-lg select-none">
                尚無查詢結果
              </div>
            )
          )}
        </div>
        <div className="mt-4 mb-[-12px] text-sm text-gray-400 text-center select-none">
          {results.length > 0 && (
            <>
              <div>共 {results.length} 筆資料</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialCodeTestPage;
