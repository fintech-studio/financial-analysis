import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TableCellsIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
  EyeIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

interface StockData {
  symbol: string;
  datetime: string;
  open_price?: number;
  high_price?: number;
  low_price?: number;
  close_price: number;
  volume?: number;
  [key: string]: any;
}

interface DataTableProps {
  data: StockData[];
  timeframe: "1d" | "1h";
  symbol: string;
}

interface ColumnConfig {
  key: string;
  name: string;
  type:
    | "datetime"
    | "price"
    | "price_high"
    | "price_low"
    | "price_close"
    | "volume"
    | "indicator";
  width?: string;
  format?: (value: any) => string;
}

const COLUMNS: ColumnConfig[] = [
  { key: "datetime", name: "時間", type: "datetime", width: "w-40" },
  { key: "open_price", name: "開盤", type: "price", width: "w-24" },
  { key: "high_price", name: "最高", type: "price_high", width: "w-24" },
  { key: "low_price", name: "最低", type: "price_low", width: "w-24" },
  { key: "close_price", name: "收盤", type: "price_close", width: "w-24" },
  { key: "volume", name: "成交量", type: "volume", width: "w-32" },
  { key: "rsi_5", name: "RSI(5)", type: "indicator", width: "w-20" },
  { key: "rsi_7", name: "RSI(7)", type: "indicator", width: "w-20" },
  { key: "rsi_10", name: "RSI(10)", type: "indicator", width: "w-20" },
  { key: "rsi_14", name: "RSI(14)", type: "indicator", width: "w-20" },
  { key: "rsi_21", name: "RSI(21)", type: "indicator", width: "w-20" },
  { key: "dif", name: "DIF", type: "indicator", width: "w-20" },
  { key: "macd", name: "MACD", type: "indicator", width: "w-20" },
  {
    key: "macd_histogram",
    name: "MACD Histogram",
    type: "indicator",
    width: "w-20",
  },
  { key: "rsv", name: "RSV", type: "indicator", width: "w-20" },
  { key: "k_value", name: "K值", type: "indicator", width: "w-20" },
  { key: "d_value", name: "D值", type: "indicator", width: "w-20" },
  { key: "j_value", name: "J值", type: "indicator", width: "w-20" },
  { key: "ma5", name: "MA5", type: "indicator", width: "w-20" },
  { key: "ma10", name: "MA10", type: "indicator", width: "w-20" },
  { key: "ma20", name: "MA20", type: "indicator", width: "w-20" },
  { key: "ma60", name: "MA60", type: "indicator", width: "w-20" },
  { key: "ema12", name: "EMA12", type: "indicator", width: "w-20" },
  { key: "ema26", name: "EMA26", type: "indicator", width: "w-20" },
  { key: "bb_upper", name: "布林上軌", type: "indicator", width: "w-20" },
  { key: "bb_middle", name: "布林中軌", type: "indicator", width: "w-20" },
  { key: "bb_lower", name: "布林下軌", type: "indicator", width: "w-20" },
  { key: "atr", name: "ATR平均真實波幅", type: "indicator", width: "w-20" },
  { key: "cci", name: "CCI商品通道指標", type: "indicator", width: "w-20" },
  { key: "willr", name: "威廉指標", type: "indicator", width: "w-20" },
  { key: "mom", name: "動量指標", type: "indicator", width: "w-20" },
];

const DataTable: React.FC<DataTableProps> = ({ data, timeframe, symbol }) => {
  const [sortColumn, setSortColumn] = useState<string>("datetime");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "datetime",
    "open_price",
    "high_price",
    "low_price",
    "close_price",
    "volume",
    "rsi_14",
    "ma5",
    "macd",
    "k_value",
    "d_value",
  ]);

  // 格式化函數
  const formatValue = (value: any, column: ColumnConfig): string => {
    if (value === null || value === undefined || value === "") return "—";

    switch (column.type) {
      case "datetime":
        return formatDate(value as string);
      case "volume":
        return formatVolume(value);
      case "price":
      case "price_high":
      case "price_low":
      case "price_close":
        return Number(value)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      case "indicator":
        return Number(value)
          .toFixed(3)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      default:
        return String(value);
    }
  };
  const formatDate = (dateString: string): string => {
    try {
      // 創建 Date 對象
      let date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return dateString;
      }

      // 使用 UTC 方法手動格式化，避免瀏覽器的自動時區轉換
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const hour = String(date.getUTCHours()).padStart(2, "0");
      const minute = String(date.getUTCMinutes()).padStart(2, "0");

      return timeframe === "1h"
        ? `${year}/${month}/${day} ${hour}:${minute}`
        : `${year}/${month}/${day}`;
    } catch {
      return dateString;
    }
  };

  const formatVolume = (volume: any): string => {
    const num = Number(volume);
    if (isNaN(num)) return "—";
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // 排序數據
  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortColumn, sortDirection]);

  // 分頁數據
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const exportToCSV = () => {
    const headers = COLUMNS.filter((col) => visibleColumns.includes(col.key))
      .map((col) => col.name)
      .join(",");

    const rows = sortedData
      .map((row) =>
        COLUMNS.filter((col) => visibleColumns.includes(col.key))
          .map((col) => formatValue(row[col.key], col))
          .join(",")
      )
      .join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock_data_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
      >
        <div className="text-center py-20">
          <TableCellsIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            無可顯示的數據
          </h3>
          <p className="text-gray-400">請先查詢股票數據</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Table Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <TableCellsIcon className="h-5 w-5 text-gray-600" />
            </div>
            {/* <div> */}
            <h3 className="pt-2 text-2xl font-semibold text-gray-900">
              {symbol}
            </h3>
            <p className="text-sm text-gray-500">
              {timeframe === "1d" ? "日線" : "小時線"} • {data.length} 筆數據 •{" "}
              {formatDate(data[data.length - 1].datetime)} ~{" "}
              {formatDate(data[0].datetime)}
            </p>
            {/* </div> */}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-all duration-200 flex items-center ${
                showFilters
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              title="顯示/隱藏篩選器"
            >
              <FunnelIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-normal">篩選</span>
            </button>

            <button
              onClick={exportToCSV}
              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all duration-200 flex items-center"
              title="匯出 CSV"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span className="text-sm font-normal">下載 CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex flex-wrap items-center gap-4">
                {/* Items per page */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600">
                    每頁顯示:
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Column visibility */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    顯示欄位:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {COLUMNS.map((column) => (
                      <button
                        key={column.key}
                        onClick={() => toggleColumnVisibility(column.key)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          visibleColumns.includes(column.key)
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {column.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {COLUMNS.filter((col) => visibleColumns.includes(col.key)).map(
                (column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${
                      column.width || ""
                    }`}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.name}</span>
                      {sortColumn === column.key && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-blue-500"
                        >
                          {sortDirection === "asc" ? (
                            <ArrowUpIcon className="h-3 w-3" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3" />
                          )}
                        </motion.div>
                      )}
                    </div>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedData.map((row, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-blue-50 transition-colors"
              >
                {COLUMNS.filter((col) => visibleColumns.includes(col.key)).map(
                  (column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 whitespace-nowrap text-sm ${
                        column.type === "datetime"
                          ? "text-gray-700 font-medium"
                          : column.type === "indicator"
                          ? "text-blue-600 font-mono"
                          : "text-gray-700"
                      }`}
                    >
                      {formatValue(row[column.key], column)}
                    </td>
                  )
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              顯示 {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, sortedData.length)} 筆， 共{" "}
              {sortedData.length} 筆記錄
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                首頁
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一頁
              </button>
              <span className="px-3 py-1 text-sm">
                第 {currentPage} / {totalPages} 頁
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一頁
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                末頁
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DataTable;
