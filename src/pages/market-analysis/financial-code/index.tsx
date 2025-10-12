import { DocumentMagnifyingGlassIcon, MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Footer from "@/components/Layout/Footer";

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
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
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
    setHasSearched(true);
    setSearchedQuery(query.trim());
    try {
      const res = await fetch(
        `/api/financial-code?symbol=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("查詢失敗");
      const data = await res.json();
      setResults(data.results || []);
      setCurrentPage(1); // 查詢時重設分頁
      setJumpPage("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("發生未知錯誤");
      }
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
    <>
    <div className="min-h-screen">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      {/* Header Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center overflow-hidden shadow-2xl">
        {/* 動態網格背景 */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Enhanced Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-12 left-12 w-24 h-24 bg-white opacity-5 rounded-full animate-pulse"></div>
          <div className="absolute bottom-12 right-24 w-36 h-36 bg-white opacity-5 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial from-white/10 to-transparent rounded-full"></div>

          {/* Enhanced floating elements */}
          <div className="absolute top-24 right-12 w-4 h-4 bg-white opacity-20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-24 left-24 w-3 h-3 bg-white opacity-30 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }}></div>
          <div className="absolute top-48 left-1/4 w-5 h-5 bg-white opacity-15 rounded-full animate-bounce" style={{ animationDelay: "2s" }}></div>
          <div className="absolute top-32 right-1/3 w-2 h-2 bg-white opacity-25 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 z-10 w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-6">
                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm mr-6 group hover:bg-white/20 transition-all duration-300 shadow-lg">
                  <DocumentMagnifyingGlassIcon className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                    金融代號查詢
                  </h1>
                  <p className="text-blue-200 mt-3 text-xl font-medium">
                    查詢股票、指數、ETF、ETN 金融商品代號
                  </p>
                </div>
              </div>
              <p className="text-blue-200 text-xl max-w-3xl leading-relaxed mb-8">
                快速查詢各類金融商品的代號資訊，包含股票、指數、ETF 等完整資料
              </p>
              
              {/* Search Form */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                className="flex flex-col sm:flex-row gap-4 max-w-2xl"
              >
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-white/40 transition-all duration-300 text-lg"
                    placeholder="請輸入代號或名稱查詢..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={loading}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="submit" 
                    className="px-8 py-4 bg-white text-blue-900 font-bold rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden group flex items-center gap-2"
                    disabled={loading}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity"></span>
                    <MagnifyingGlassIcon className="h-5 w-5 relative" />
                    <span className="relative">查詢</span>
                  </button>
                  <button
                    type="button"
                    className="px-8 py-4 bg-blue-600/80 backdrop-blur-sm border-2 border-blue-500/50 text-white font-bold rounded-2xl hover:bg-blue-600 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    onClick={() => router.push("financial-code/FinancialCode")}
                  >
                    代號一覽表
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-400/30 rounded-2xl backdrop-blur-sm">
                  <p className="text-red-200 font-medium text-center">{error}</p>
                </div>
              )}
            </div>

            {/* Enhanced Statistics Panel */}
            <div className="flex flex-col lg:items-end space-y-4">
              <div className="grid grid-cols-2 gap-6 lg:gap-8">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-3xl font-bold text-white">{results.length}</div>
                  <div className="text-blue-200 text-sm font-medium">查詢結果</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                  <div className="text-3xl font-bold text-white">2025-06-26</div>
                  <div className="text-blue-200 text-sm font-medium">資料更新</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin" style={{ animationDelay: '0.3s', animationDuration: '1.2s' }}></div>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-700 mb-2">查詢中...</p>
                <p className="text-gray-500">正在搜尋金融代號資料</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-6">
              {/* Results Table */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-center">
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
                      <tr className="bg-gradient-to-r from-blue-100 to-indigo-100">
                        {columns.map((col) => (
                          <th
                            key={col.key}
                            className="px-3 py-4 font-bold text-blue-800 whitespace-nowrap border-b border-blue-200 cursor-pointer select-none hover:bg-blue-200/70 transition-all duration-300 group"
                            onClick={() => handleSort(col.key)}
                          >
                            <span className="flex items-center justify-center gap-2">
                              {col.label}
                              {sortConfig?.key === col.key && (
                                <span className="text-blue-600 font-bold">
                                  {sortConfig.direction === "asc" ? "▲" : "▼"}
                                </span>
                              )}
                              {sortConfig?.key !== col.key && (
                                <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                  ⇅
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
                          className={`hover:bg-blue-50/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
                            idx % 2 === 0 ? "bg-white/80" : "bg-blue-25/50"
                          }`}
                        >
                          {columns.map((col) => (
                            <td
                              key={col.key}
                              className="px-3 py-4 border-b border-blue-100/50 whitespace-nowrap overflow-hidden text-ellipsis text-gray-700 relative group"
                            >
                              {row[col.key as keyof FinancialResult] ? (
                                <span className={`${col.key === 'symbol' ? 'font-bold text-blue-600' : col.key === 'name' ? 'font-semibold text-gray-800' : ''}`}>
                                  {row[col.key as keyof FinancialResult]}
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                              {/* Hover tooltip for long content */}
                              {row[col.key as keyof FinancialResult] && String(row[col.key as keyof FinancialResult]).length > 10 && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 pointer-events-none">
                                  {row[col.key as keyof FinancialResult]}
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Enhanced Pagination */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex flex-wrap justify-center items-center gap-3">
                  <button
                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium disabled:opacity-50 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 shadow-sm disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    首頁
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium disabled:opacity-50 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 shadow-sm disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    上一頁
                  </button>
                  
                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-2 border border-blue-200 shadow-sm">
                    <span className="text-blue-700 font-medium">第</span>
                    <span className="text-blue-800 font-bold text-lg">{currentPage}</span>
                    <span className="text-blue-700 font-medium">/ {totalPages} 頁</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={jumpPage}
                      onChange={(e) =>
                        setJumpPage(e.target.value.replace(/[^\d]/g, ""))
                      }
                      className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 shadow-sm"
                      placeholder="跳頁"
                      onKeyDown={(e) => e.key === "Enter" && handleJump()}
                      disabled={totalPages === 0}
                    />
                    <button
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-sm disabled:cursor-not-allowed"
                      onClick={handleJump}
                      disabled={
                        !jumpPage ||
                        Number(jumpPage) < 1 ||
                        Number(jumpPage) > totalPages
                      }
                    >
                      跳頁
                    </button>
                  </div>

                  <button
                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium disabled:opacity-50 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 shadow-sm disabled:cursor-not-allowed"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    下一頁
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium disabled:opacity-50 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 shadow-sm disabled:cursor-not-allowed"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    末頁
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 rounded-2xl border border-indigo-200 font-medium shadow-sm">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    共 {results.length} 筆資料
                  </span>
                </div>
              </div>
            </div>
          ) : !loading && hasSearched && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33" />
                </svg>
              </div>
              <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-yellow-200/50 max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">查無相關資料</h3>
                <p className="text-gray-600 leading-relaxed">
                  很抱歉，沒有找到與「<span className="font-semibold text-blue-600">{searchedQuery}</span>」相關的金融代號。
                </p>
                <p className="text-sm text-gray-500 mt-3">
                  請嘗試其他關鍵字或檢查拼寫
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
                <DocumentMagnifyingGlassIcon className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-blue-200/50 max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">開始搜尋</h3>
                <p className="text-gray-600 leading-relaxed">
                  請在上方輸入框中輸入您想查詢的金融代號或商品名稱
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default FinancialCodeTestPage;
