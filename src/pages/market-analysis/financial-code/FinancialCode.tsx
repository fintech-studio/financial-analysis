import Footer from "@/components/Layout/Footer";
import React, { useEffect, useState, useMemo, useCallback } from "react";

interface StockRow {
  symbol: string;
  name: string;
  isin_code?: string;
  date?: string;
  market_category?: string;
  market_type?: string;
  industry_type?: string;
}

interface USStockRow extends StockRow {
  sector_type?: string;
  country?: string;
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
    icon: "🇹🇼",
    color: "from-blue-500 to-indigo-600",
  },
  {
    key: "us-stock",
    label: "美股",
    api: "/api/financial-code?symbol=all_us_stock",
    columns: [
      { key: "symbol", label: "股票代號" },
      { key: "name", label: "股票名稱" },
      { key: "chinese_name", label: "中文股票名稱" },
      { key: "isin_code", label: "ISIN 國際證券識別號碼" },
      { key: "country", label: "國家" },
      { key: "ipo_year", label: "上市年份" },
      { key: "sector_type", label: "產業類股" },
      { key: "industry_type", label: "產業類別" },
    ],
    title: "美國股票代號一覽表",
    icon: "🇺🇸",
    color: "from-emerald-500 to-teal-600",
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
    icon: "📈",
    color: "from-purple-500 to-violet-600",
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
    icon: "📊",
    color: "from-orange-500 to-red-600",
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
    icon: "📉",
    color: "from-cyan-500 to-blue-600",
  },
];

// 抽取 Select 篩選元件，減少重複
const FilterSelect: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div className="flex flex-col gap-1">
    <span className="text-gray-600 text-xs font-medium">{label}</span>
    <select
      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent hover:border-gray-300 transition-all duration-200 shadow-sm min-w-[120px]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">全部</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

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

  const [sectorTypeFilter, setSectorTypeFilter] = useState<string>("");
  const [countryFilter, setCountryFilter] = useState<string>("");

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
    setSectorTypeFilter("");
    setCountryFilter("");
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
  }, [activeTab, currentTab.api]);

  // 合併 setPage(1) 的 useEffect
  useEffect(() => {
    setPage(1);
  }, [
    search,
    marketTypeFilter,
    industryTypeFilter,
    sectorTypeFilter,
    countryFilter,
    dateStart,
    dateEnd,
    rowsPerPage,
  ]);

  // 取得所有市場類別與產業類別選項（過濾 undefined）
  const marketTypeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .map((row) => row.market_type)
            .filter((v): v is string => Boolean(v))
        )
      ),
    [data]
  );
  const industryTypeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .map((row) => row.industry_type)
            .filter((v): v is string => Boolean(v))
        )
      ),
    [data]
  );
  // 美股專屬篩選
  const sectorTypeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .map((row: USStockRow) => row.sector_type)
            .filter((v): v is string => Boolean(v))
        )
      ),
    [data]
  );
  const countryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .map((row: USStockRow) => row.country)
            .filter((v): v is string => Boolean(v))
        )
      ),
    [data]
  );

  // 搜尋、篩選與排序
  const filteredData = useMemo(
    () =>
      data.filter((row: StockRow | USStockRow) => {
        if (marketTypeFilter && row.market_type !== marketTypeFilter)
          return false;
        if (industryTypeFilter && row.industry_type !== industryTypeFilter)
          return false;
        // 美股專屬篩選
        if (activeTab === "us-stock") {
          if (
            sectorTypeFilter &&
            (row as USStockRow).sector_type !== sectorTypeFilter
          )
            return false;
          if (countryFilter && (row as USStockRow).country !== countryFilter)
            return false;
          // if (ipoYearFilter && String(row.ipo_year) !== ipoYearFilter)
          //   return false;
        }
        if ((dateStart || dateEnd) && row.date) {
          const dateStr = formatDate(row.date);
          if (dateStart && dateStr < dateStart) return false;
          if (dateEnd && dateStr > dateEnd) return false;
        }
        if (!search.trim()) return true;
        return currentTab.columns.some((col) => {
          const value = row[col.key as keyof typeof row];
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
      activeTab,
      sectorTypeFilter,
      countryFilter,
      // ipoYearFilter,
    ]
  );

  const sortedData = useMemo(
    () =>
      sortKey
        ? [...filteredData].sort((a, b) => {
            const aValue = a[sortKey as keyof typeof a] || "";
            const bValue = b[sortKey as keyof typeof b] || "";
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
    setPage(1); // 排序時自動跳到第一頁
  };

  // 日期格式化函式
  function formatDate(dateStr?: string) {
    if (!dateStr) return "-";
    const d = dateStr.trim();
    if (/^\d{8}$/.test(d)) {
      return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    }
    if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(d)) {
      return d.replace(/\//g, "-");
    }
    const dateObj = new Date(d);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString().slice(0, 10);
    }
    return d;
  }

  // 跳頁功能，onBlur 也觸發
  const handleJumpPage = useCallback(() => {
    const num = Number(jumpPage);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      setPage(num);
    }
    setJumpPage("");
  }, [jumpPage, totalPages]);

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center py-10">
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-7xl border border-white/20 relative overflow-hidden">
          {/* 背景裝飾 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-100/30 to-indigo-200/30 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-linear-to-tr from-purple-100/30 to-pink-200/30 rounded-full translate-y-24 -translate-x-24 blur-3xl"></div>

          {/* 返回按鈕 */}
          <button
            className="absolute left-4 top-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 hover:bg-white hover:scale-105 text-gray-700 hover:text-blue-600 border border-gray-200 shadow-lg transition-all duration-200 backdrop-blur-sm z-50"
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
            <span className="font-medium">返回</span>
          </button>

          <div className="flex justify-center mb-8 relative z-10 mt-4">
            {tabConfigs.map((tab) => (
              <button
                key={tab.key}
                className={`relative px-6 py-3 mx-1 rounded-t-2xl font-semibold border-b-3 transition-all duration-300 focus:outline-none group ${
                  activeTab === tab.key
                    ? `bg-linear-to-b ${tab.color} text-white border-transparent shadow-lg transform -translate-y-1`
                    : "bg-white/70 text-gray-600 border-transparent hover:bg-white hover:text-gray-800 hover:shadow-md"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
                {activeTab !== tab.key && (
                  <div className="absolute inset-0 bg-linear-to-b from-white/50 to-white/20 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
            ))}
          </div>

          <div className="relative z-10">
            <h1
              className={`text-3xl font-bold bg-linear-to-r ${currentTab.color} bg-clip-text text-transparent mb-8 text-center`}
            >
              {currentTab.title}
            </h1>

            {/* 搜尋、篩選與每頁顯示筆數 */}
            <div className="bg-linear-to-r from-gray-50 to-blue-50/50 rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
              <div className="flex flex-wrap justify-between items-end mb-4 gap-4">
                <div className="flex items-end gap-4 flex-wrap">
                  {/* 市場類別篩選 */}
                  {currentTab.columns.some(
                    (col) => col.key === "market_type"
                  ) && (
                    <FilterSelect
                      label="市場類別"
                      value={marketTypeFilter}
                      options={marketTypeOptions}
                      onChange={(v) => {
                        setMarketTypeFilter(v);
                        setPage(1);
                      }}
                    />
                  )}
                  {/* 產業類別篩選 */}
                  {currentTab.columns.some(
                    (col) => col.key === "industry_type"
                  ) && (
                    <FilterSelect
                      label="產業類別"
                      value={industryTypeFilter}
                      options={industryTypeOptions}
                      onChange={(v) => {
                        setIndustryTypeFilter(v);
                        setPage(1);
                      }}
                    />
                  )}
                  {/* 美股專屬篩選 */}
                  {activeTab === "us-stock" && (
                    <>
                      <FilterSelect
                        label="產業類股"
                        value={sectorTypeFilter}
                        options={sectorTypeOptions}
                        onChange={(v) => {
                          setSectorTypeFilter(v);
                          setPage(1);
                        }}
                      />
                      <FilterSelect
                        label="國家"
                        value={countryFilter}
                        options={countryOptions}
                        onChange={(v) => {
                          setCountryFilter(v);
                          setPage(1);
                        }}
                      />
                    </>
                  )}
                  {/* 日期範圍篩選 */}
                  {currentTab.columns.some((col) => col.key === "date") && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-600 text-xs font-medium">
                        日期範圍
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
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
                        <span className="text-gray-400 text-sm font-medium">
                          至
                        </span>
                        <input
                          type="date"
                          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
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
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-end gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-600 text-xs font-medium">
                      每頁顯示
                    </span>
                    <div className="flex items-center gap-1">
                      <select
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setPage(1);
                        }}
                      >
                        {[10, 20, 50, 100, 200, 500].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-500 text-sm font-medium">
                        筆
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-gray-600 text-xs font-medium">
                      搜尋
                    </span>
                    <div className="relative">
                      <input
                        type="text"
                        className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                        placeholder="輸入關鍵字搜尋..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <svg
                        className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin border-t-blue-500"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-300"></div>
                </div>
                <div className="mt-4 text-blue-600 font-medium animate-pulse">
                  載入中...
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">❌</div>
                <div className="text-red-500 text-lg font-medium mb-2">
                  {error}
                </div>
                <div className="text-gray-500">請檢查網路連線或稍後再試</div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
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
                        <tr
                          className={`bg-linear-to-r ${currentTab.color} text-white`}
                        >
                          {currentTab.columns.map((col) => (
                            <th
                              key={col.key}
                              className="px-3 py-4 font-bold whitespace-nowrap border-b-2 border-white/20 cursor-pointer select-none hover:bg-white/10 transition-all duration-200"
                              onClick={() => handleSort(col.key)}
                            >
                              <span className="flex items-center justify-center gap-2">
                                <span>{col.label}</span>
                                <div className="flex flex-col">
                                  <svg
                                    className={`w-3 h-3 transition-colors ${
                                      sortKey === col.key && sortOrder === "asc"
                                        ? "text-yellow-300"
                                        : "text-white/50"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                  </svg>
                                  <svg
                                    className={`w-3 h-3 transition-colors ${
                                      sortKey === col.key &&
                                      sortOrder === "desc"
                                        ? "text-yellow-300"
                                        : "text-white/50"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    style={{ transform: "rotate(180deg)" }}
                                  >
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                  </svg>
                                </div>
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pagedData.map((row, idx) => (
                          <tr
                            key={row.symbol + row.name}
                            className={`border-b border-gray-100 hover:bg-blue-50/70 transition-all duration-200 ${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            }`}
                          >
                            {currentTab.columns.map((col) => {
                              let value = row[col.key as keyof typeof row];
                              if (col.key === "date" && value) {
                                value = formatDate(value as string);
                              }
                              return (
                                <td
                                  key={col.key}
                                  className="px-3 py-3 border-b border-gray-50 whitespace-nowrap overflow-hidden text-ellipsis"
                                >
                                  {value !== undefined &&
                                  value !== null &&
                                  value !== "" ? (
                                    <span className="font-medium text-gray-700">
                                      {value}
                                    </span>
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
                </div>

                {/* 分頁按鈕 */}
                <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
                  <button
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    首頁
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    上一頁
                  </button>

                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-600 text-sm font-medium">
                      第
                    </span>
                    <span className="text-blue-600 font-bold">{page}</span>
                    <span className="text-gray-600 text-sm font-medium">
                      / {totalPages} 頁
                    </span>
                  </div>

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
                    onBlur={handleJumpPage}
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                    placeholder="跳頁"
                  />
                  <button
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
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
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    下一頁
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                  >
                    末頁
                  </button>
                </div>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-2">
              <div className="text-sm text-gray-500">
                共{" "}
                <span className="font-bold text-blue-600">
                  {filteredData.length}
                </span>{" "}
                筆資料
              </div>
              <div className="text-xs text-gray-400">資料更新：2025-06-26</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default FinancialCodeTabs;
