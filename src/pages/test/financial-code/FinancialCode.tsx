import React, { useEffect, useState, useMemo } from "react";

interface StockRow {
  symbol: string;
  name: string;
  isin_code?: string;
  date?: string;
  market_category?: string;
  market_type?: string;
  industry_type?: string;
}

const tabConfigs = [
  {
    key: "tw-stock",
    label: "台股",
    api: "/api/financial-code?symbol=all_tw_stock",
    columns: [
      { key: "symbol", label: "股票代號" },
      { key: "name", label: "股票名稱" },
      { key: "isin_code", label: "ISIN 國際證券識別號碼" },
      { key: "date", label: "上市/發行/登記日期" },
      { key: "market_type", label: "市場類別" },
      { key: "industry_type", label: "產業類別" },
    ],
    title: "台灣股票代號一覽表",
  },
  {
    key: "etf",
    label: "ETF",
    api: "/api/financial-code?symbol=all_etf",
    columns: [
      { key: "symbol", label: "ETF 代號" },
      { key: "name", label: "ETF 名稱" },
      { key: "isin_code", label: "ISIN 國際證券識別號碼" },
      { key: "date", label: "上市日期" },
      { key: "market_type", label: "市場類別" },
      { key: "industry_type", label: "產業類別" },
    ],
    title: "台灣 ETF 代號一覽表",
  },
  {
    key: "etn",
    label: "ETN",
    api: "/api/financial-code?symbol=all_etn",
    columns: [
      { key: "symbol", label: "ETN 代號" },
      { key: "name", label: "ETN 名稱" },
      { key: "isin_code", label: "ISIN 國際證券識別號碼" },
      { key: "date", label: "上市日期" },
      { key: "market_type", label: "市場類別" },
      { key: "industry_type", label: "產業類別" },
    ],
    title: "台灣 ETN 代號一覽表",
  },
  {
    key: "tw-index",
    label: "台灣指數",
    api: "/api/financial-code?symbol=all_tw_index",
    columns: [
      { key: "symbol", label: "指數代號" },
      { key: "name", label: "指數名稱" },
      { key: "isin_code", label: "ISIN 國際證券識別號碼" },
      { key: "date", label: "發布日期" },
    ],
    title: "台灣指數代號一覽表",
  },
];

const FinancialCodeTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabConfigs[0].key);
  const [data, setData] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [marketTypeFilter, setMarketTypeFilter] = useState<string>("");
  const [industryTypeFilter, setIndustryTypeFilter] = useState<string>("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [jumpPage, setJumpPage] = useState("");

  const currentTab = tabConfigs.find((tab) => tab.key === activeTab)!;

  useEffect(() => {
    setLoading(true);
    setError("");
    setSearch("");
    setSortKey(null);
    setSortOrder("asc");
    setPage(1);
    setMarketTypeFilter("");
    setIndustryTypeFilter("");
    setDateStart("");
    setDateEnd("");
    fetch(currentTab.api)
      .then((res) => res.json())
      .then((res) => {
        setData(res.results || []);
        setLoading(false);
      })
      .catch(() => {
        setError("查詢失敗，請稍後再試。");
        setLoading(false);
      });
  }, [activeTab]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    marketTypeFilter,
    industryTypeFilter,
    dateStart,
    dateEnd,
    rowsPerPage,
  ]);

  // 取得所有市場類別與產業類別選項
  const marketTypeOptions = useMemo(
    () =>
      Array.from(new Set(data.map((row) => row.market_type).filter(Boolean))),
    [data]
  );
  const industryTypeOptions = useMemo(
    () =>
      Array.from(new Set(data.map((row) => row.industry_type).filter(Boolean))),
    [data]
  );

  // 搜尋、篩選與排序
  const filteredData = useMemo(
    () =>
      data.filter((row) => {
        if (marketTypeFilter && row.market_type !== marketTypeFilter)
          return false;
        if (industryTypeFilter && row.industry_type !== industryTypeFilter)
          return false;
        if ((dateStart || dateEnd) && row.date) {
          const dateStr = formatDate(row.date);
          if (dateStart && dateStr < dateStart) return false;
          if (dateEnd && dateStr > dateEnd) return false;
        }
        if (!search.trim()) return true;
        return currentTab.columns.some((col) => {
          const value = (row as any)[col.key];
          return (
            value &&
            value.toString().toLowerCase().includes(search.toLowerCase())
          );
        });
      }),
    [
      data,
      marketTypeFilter,
      industryTypeFilter,
      dateStart,
      dateEnd,
      search,
      currentTab.columns,
    ]
  );

  const sortedData = useMemo(
    () =>
      sortKey
        ? [...filteredData].sort((a, b) => {
            const aValue = (a as any)[sortKey] || "";
            const bValue = (b as any)[sortKey] || "";
            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
          })
        : filteredData,
    [filteredData, sortKey, sortOrder]
  );

  const pagedData = useMemo(
    () => sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [sortedData, page, rowsPerPage]
  );
  const totalPages = Math.ceil(sortedData.length / rowsPerPage) || 1;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // 日期格式化函式
  function formatDate(dateStr?: string) {
    if (!dateStr) return "-";
    let d = dateStr.trim();
    if (/^\d{8}$/.test(d)) {
      return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    }
    if (/^\d{4}[-\/]\d{2}[-\/]\d{2}$/.test(d)) {
      return d.replace(/\//g, "-");
    }
    const dateObj = new Date(d);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString().slice(0, 10);
    }
    return d;
  }

  // 跳頁功能
  const handleJumpPage = () => {
    const num = Number(jumpPage);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      setPage(num);
    }
    setJumpPage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100 flex flex-col items-center py-10">
      <div className="bg-white/90 p-8 rounded-2xl shadow-xl w-full max-w-7xl border border-blue-100 relative">
        {/* 返回按鈕 */}
        <button
          className="absolute left-6 top-6 flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-sm transition-colors duration-150"
          onClick={() =>
            window.history.length > 1
              ? window.history.back()
              : window.location.assign("/")
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          返回
        </button>
        <div className="flex justify-center mb-6">
          {tabConfigs.map((tab) => (
            <button
              key={tab.key}
              className={`px-6 py-2 mx-1 rounded-t-lg font-semibold border-b-2 transition-colors duration-200 focus:outline-none ${
                activeTab === tab.key
                  ? "bg-blue-100 text-blue-700 border-blue-500"
                  : "bg-white text-gray-500 border-transparent hover:bg-blue-50"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          {currentTab.title}
        </h1>
        {/* 搜尋、篩選與每頁顯示筆數 */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <div className="flex items-center gap-2 ">
            {/* 市場類別篩選 */}
            {currentTab.columns.some((col) => col.key === "market_type") && (
              <>
                <span className="text-gray-500 text-sm">市場類別</span>
                <select
                  className="border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={marketTypeFilter}
                  onChange={(e) => {
                    setMarketTypeFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">全部</option>
                  {marketTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </>
            )}
            {/* 產業類別篩選 */}
            {currentTab.columns.some((col) => col.key === "industry_type") && (
              <>
                <span className="text-gray-500 text-sm">產業類別</span>
                <select
                  className="border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={industryTypeFilter}
                  onChange={(e) => {
                    setIndustryTypeFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">全部</option>
                  {industryTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </>
            )}
            {/* 日期範圍篩選 */}
            {currentTab.columns.some((col) => col.key === "date") && (
              <>
                <span className="text-gray-500 text-sm">日期範圍</span>
                <input
                  type="date"
                  className="border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={dateStart}
                  max={dateEnd || new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDateStart(val);
                    // 若結束日小於起始日，自動修正
                    if (dateEnd && val && val > dateEnd) {
                      setDateEnd(val);
                    }
                    setPage(1);
                  }}
                />
                <span className="text-gray-500 text-sm">至</span>
                <input
                  type="date"
                  className="border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={dateEnd}
                  min={dateStart || undefined}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDateEnd(val);
                    // 若起始日大於結束日，自動修正
                    if (dateStart && val && val < dateStart) {
                      setDateStart(val);
                    }
                    setPage(1);
                  }}
                />
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">每頁顯示</span>
            <select
              className="border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-gray-500 text-sm">筆</span>
          </div>
          <input
            type="text"
            className="border border-blue-200 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="搜尋..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="text-blue-500 text-center py-8">載入中...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-blue-100 shadow-sm bg-white/80">
              <table className="w-full text-sm text-center table-fixed">
                <colgroup>
                  {currentTab.columns.map((col) => (
                    <col
                      key={col.key}
                      style={{
                        width:
                          col.key === "symbol"
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
                    {currentTab.columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-3 py-2 font-semibold whitespace-nowrap border-b border-blue-200 cursor-pointer select-none hover:bg-blue-200 transition"
                        onClick={() => handleSort(col.key)}
                      >
                        <span className="flex items-center justify-center gap-1">
                          {col.label}
                          {sortKey === col.key && (
                            <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedData.map((row, idx) => (
                    <tr
                      key={row.symbol + row.name}
                      className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}
                    >
                      {currentTab.columns.map((col) => {
                        let value = (row as any)[col.key];
                        if (col.key === "date" && value) {
                          value = formatDate(value);
                        }
                        return (
                          <td
                            key={col.key}
                            className="px-3 py-2 border-b border-blue-100 whitespace-nowrap overflow-hidden text-ellipsis"
                          >
                            {value !== undefined &&
                            value !== null &&
                            value !== "" ? (
                              value
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 分頁按鈕 */}
            <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
              <button
                className="px-2 py-1 rounded border text-sm disabled:opacity-50"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                首頁
              </button>
              <button
                className="px-2 py-1 rounded border text-sm disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                上一頁
              </button>
              <span className="text-gray-600 text-sm">
                第 {page} / {totalPages} 頁
              </span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpPage}
                onChange={(e) =>
                  setJumpPage(e.target.value.replace(/[^\d]/g, ""))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleJumpPage();
                }}
                className="w-16 px-2 py-1 border rounded text-center text-sm"
                placeholder="跳頁"
              />
              <button
                className="px-2 py-1 rounded border text-sm"
                onClick={handleJumpPage}
                disabled={
                  !jumpPage ||
                  Number(jumpPage) < 1 ||
                  Number(jumpPage) > totalPages
                }
              >
                跳頁
              </button>
              <button
                className="px-2 py-1 rounded border text-sm disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                下一頁
              </button>
              <button
                className="px-2 py-1 rounded border text-sm disabled:opacity-50"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >
                末頁
              </button>
            </div>
          </>
        )}
        <div className="mt-4 mb-[-8px] text-sm text-gray-400 text-center select-none">
          共 {filteredData.length} 筆資料
          <br />
          資料更新：2025-06-26
        </div>
      </div>
    </div>
  );
};

export default FinancialCodeTabs;
