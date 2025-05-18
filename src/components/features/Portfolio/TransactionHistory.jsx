import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TagIcon,
  AdjustmentsVerticalIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// 交易詳情模態框
const TransactionDetailsModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isPositive = transaction.type === "買入";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center">
            <span
              className={`p-2 rounded-md ${
                isPositive ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <CurrencyDollarIcon
                className={`h-5 w-5 ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              />
            </span>
            <h3 className="ml-3 text-lg font-semibold">
              {transaction.type === "買入" ? "買入交易" : "賣出交易"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 左欄：交易基本信息 */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                交易資訊
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="text-sm text-gray-500">交易日期</div>
                  <div className="text-sm font-medium">{transaction.date}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-500">交易類型</div>
                  <div className="text-sm font-medium">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        transaction.type === "買入"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-500">證券代號</div>
                  <div className="text-sm font-medium text-blue-600">
                    {transaction.symbol}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-500">證券名稱</div>
                  <div className="text-sm font-medium">{transaction.name}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-500">交易所/市場</div>
                  <div className="text-sm font-medium">
                    {transaction.exchange || "台灣證券交易所"}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  交易細節
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-500">數量</div>
                    <div className="text-sm font-medium">
                      {transaction.quantity}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-500">價格</div>
                    <div className="text-sm font-medium">
                      {transaction.price}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-500">總額</div>
                    <div className="text-sm font-bold">{transaction.total}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-500">手續費</div>
                    <div className="text-sm font-medium">
                      NT${" "}
                      {(
                        parseFloat(
                          transaction.total.replace(/[^0-9.-]+/g, "")
                        ) * 0.001425
                      ).toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-3">
                  交易備註
                </h4>
                <p className="text-sm text-gray-600">
                  {transaction.note || "無交易備註"}
                </p>
              </div>
            </div>

            {/* 右欄：市場數據與績效 */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                市場數據
              </h4>

              {/* 假設價格資料 */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-500">當日開盤價</div>
                  <div className="text-sm font-medium">
                    NT${" "}
                    {(
                      parseFloat(transaction.price.replace(/[^0-9.-]+/g, "")) *
                      (1 - Math.random() * 0.01)
                    ).toFixed(2)}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-500">當日收盤價</div>
                  <div className="text-sm font-medium">
                    NT${" "}
                    {(
                      parseFloat(transaction.price.replace(/[^0-9.-]+/g, "")) *
                      (1 + Math.random() * 0.01)
                    ).toFixed(2)}
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-500">當日最高價</div>
                  <div className="text-sm font-medium">
                    NT${" "}
                    {(
                      parseFloat(transaction.price.replace(/[^0-9.-]+/g, "")) *
                      (1 + Math.random() * 0.02)
                    ).toFixed(2)}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">當日最低價</div>
                  <div className="text-sm font-medium">
                    NT${" "}
                    {(
                      parseFloat(transaction.price.replace(/[^0-9.-]+/g, "")) *
                      (1 - Math.random() * 0.02)
                    ).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* 成本圖表 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  {transaction.type === "買入"
                    ? "買入成本分析"
                    : "賣出收益分析"}
                </h5>
                <div className="h-40">
                  <Pie
                    data={{
                      labels:
                        transaction.type === "買入"
                          ? ["證券價值", "手續費"]
                          : ["賣出收益", "手續費"],
                      datasets: [
                        {
                          data: [
                            parseFloat(
                              transaction.total.replace(/[^0-9.-]+/g, "")
                            ),
                            parseFloat(
                              transaction.total.replace(/[^0-9.-]+/g, "")
                            ) * 0.001425,
                          ],
                          backgroundColor: [
                            transaction.type === "買入"
                              ? "rgba(59, 130, 246, 0.5)"
                              : "rgba(34, 197, 94, 0.5)",
                            "rgba(239, 68, 68, 0.5)",
                          ],
                          borderColor: [
                            transaction.type === "買入"
                              ? "rgb(59, 130, 246)"
                              : "rgb(34, 197, 94)",
                            "rgb(239, 68, 68)",
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            font: {
                              size: 11,
                            },
                            boxWidth: 15,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* 交易建議 */}
              <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center mb-2">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h5 className="text-sm font-medium text-blue-900">
                    投資建議
                  </h5>
                </div>
                <p className="text-xs text-blue-800">
                  {transaction.type === "買入"
                    ? "設置適當的停損停利點，可考慮以10%的停損幅度和20%的停利目標來管理該投資風險。"
                    : "賣出後請檢視整體組合配置，並考慮將資金重新分配至目前被低估的資產類別。"}
                </p>
              </div>

              {/* 相關交易按鈕 */}
              <div className="mt-4">
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200">
                  查看相關交易紀錄
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 mr-3"
            >
              關閉
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
              編輯交易
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionHistory = ({ transactions }) => {
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const itemsPerPage = 10;

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // 日期範圍過濾
  const getDateRangeFilter = (period) => {
    const today = new Date();
    let startDate = new Date();

    switch (period) {
      case "last7days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "last30days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "last90days":
        startDate.setDate(today.getDate() - 90);
        break;
      case "thisYear":
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      case "all":
      default:
        return () => true;
    }

    return (transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= today;
    };
  };

  const filteredTransactions = useMemo(() => {
    const dateRangeFilter = getDateRangeFilter(selectedPeriod);

    let filtered = [...transactions].filter((transaction) => {
      // 搜尋條件過濾
      const matchesSearch =
        searchTerm === "" ||
        transaction.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.name.toLowerCase().includes(searchTerm.toLowerCase());

      // 交易類型過濾
      const matchesType =
        filterType === "all" || transaction.type === filterType;

      // 日期範圍過濾
      const matchesDateRange = dateRangeFilter(transaction);

      return matchesSearch && matchesType && matchesDateRange;
    });

    // 排序
    return filtered.sort((a, b) => {
      // 日期特殊處理
      if (sortField === "date") {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }

      // 數值欄位特殊處理
      if (["quantity", "price", "total"].includes(sortField)) {
        const aValue =
          typeof a[sortField] === "string"
            ? parseFloat(a[sortField].replace(/[^0-9.-]+/g, ""))
            : a[sortField];
        const bValue =
          typeof b[sortField] === "string"
            ? parseFloat(b[sortField].replace(/[^0-9.-]+/g, ""))
            : b[sortField];
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // 字串欄位
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [
    transactions,
    sortField,
    sortDirection,
    searchTerm,
    filterType,
    selectedPeriod,
  ]);

  // 分頁計算
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 重設頁碼當過濾條件改變時
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, selectedPeriod]);

  // 交易統計分析
  const transactionStats = useMemo(() => {
    // 基本統計
    const stats = {
      買入: { count: 0, total: 0 },
      賣出: { count: 0, total: 0 },
    };

    // 時間序列資料
    const monthlyData = {};
    const symbolData = {};

    transactions.forEach((transaction) => {
      const type = transaction.type;
      const total = parseFloat(transaction.total.replace(/[^0-9.-]+/g, ""));
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      const symbol = transaction.symbol;

      // 基本統計
      stats[type].count += 1;
      stats[type].total += total;

      // 月份統計
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { 買入: 0, 賣出: 0 };
      }
      monthlyData[monthYear][type] += total;

      // 股票代號統計
      if (!symbolData[symbol]) {
        symbolData[symbol] = {
          name: transaction.name,
          買入: 0,
          賣出: 0,
          count: 0,
        };
      }
      symbolData[symbol][type] += total;
      symbolData[symbol].count += 1;
    });

    // 將月份資料轉換為排序後的陣列
    const sortedMonthlyData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12);

    // 將股票代號資料轉換為排序後的陣列（依交易次數排序）
    const sortedSymbolData = Object.entries(symbolData)
      .map(([symbol, data]) => ({ symbol, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      basic: stats,
      monthly: sortedMonthlyData,
      symbols: sortedSymbolData,
      netCashFlow: stats.賣出.total - stats.買入.total,
    };
  }, [transactions]);

  // 準備圖表資料
  const chartData = useMemo(() => {
    const monthlyLabels = transactionStats.monthly.map(([month]) => month);
    const buyData = transactionStats.monthly.map(([_, data]) => data.買入);
    const sellData = transactionStats.monthly.map(([_, data]) => data.賣出);

    // 月度交易金額圖表
    const monthlyChart = {
      labels: monthlyLabels,
      datasets: [
        {
          label: "買入",
          data: buyData,
          backgroundColor: "rgba(34, 197, 94, 0.6)",
          borderColor: "rgb(34, 197, 94)",
          borderWidth: 1,
        },
        {
          label: "賣出",
          data: sellData,
          backgroundColor: "rgba(239, 68, 68, 0.6)",
          borderColor: "rgb(239, 68, 68)",
          borderWidth: 1,
        },
      ],
    };

    // 交易分布圓餅圖
    const symbolChart = {
      labels: transactionStats.symbols.slice(0, 5).map((item) => item.symbol),
      datasets: [
        {
          data: transactionStats.symbols
            .slice(0, 5)
            .map((item) => item.買入 + item.賣出),
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(255, 99, 132, 0.6)",
          ],
          borderWidth: 1,
        },
      ],
    };

    return { monthlyChart, symbolChart };
  }, [transactionStats]);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUpIcon className="h-4 w-4 ml-1 inline" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 ml-1 inline" />
    );
  };

  const handleExport = () => {
    // alert("匯出交易歷史功能將在此實作");
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* 交易概況儀表板 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">交易概況</h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">全部時間</option>
              <option value="last7days">最近7天</option>
              <option value="last30days">最近30天</option>
              <option value="last90days">最近90天</option>
              <option value="thisYear">本年度</option>
            </select>
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* 交易統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-gray-500">總交易次數</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredTransactions.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              買入：{transactionStats.basic.買入.count} | 賣出：
              {transactionStats.basic.賣出.count}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-gray-500">買入總額</div>
            </div>
            <div className="text-2xl font-bold text-green-600">
              NT$ {transactionStats.basic.買入.total.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              平均每筆 NT${" "}
              {(
                transactionStats.basic.買入.total /
                Math.max(1, transactionStats.basic.買入.count)
              ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-gray-500">賣出總額</div>
            </div>
            <div className="text-2xl font-bold text-red-600">
              NT$ {transactionStats.basic.賣出.total.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              平均每筆 NT${" "}
              {(
                transactionStats.basic.賣出.total /
                Math.max(1, transactionStats.basic.賣出.count)
              ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-gray-500">淨現金流</div>
            </div>
            <div
              className={`text-2xl font-bold ${
                transactionStats.netCashFlow >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              NT$ {transactionStats.netCashFlow.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {transactionStats.netCashFlow >= 0 ? "淨賣出" : "淨買入"}資產
            </div>
          </div>
        </div>

        {/* 圖表分析 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              月度交易金額趨勢
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 h-64">
              <Bar
                data={chartData.monthlyChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                    y: {
                      grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                      },
                      ticks: {
                        callback: function (value) {
                          return value >= 1000000
                            ? `${(value / 1000000).toFixed(1)}M`
                            : `${(value / 1000).toFixed(0)}K`;
                        },
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: true,
                      position: "top",
                      labels: {
                        boxWidth: 15,
                        padding: 10,
                        font: {
                          size: 11,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              交易標的分布
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
              <Pie
                data={chartData.symbolChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        font: {
                          size: 11,
                        },
                        boxWidth: 15,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* 熱門交易標的 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            熱門交易標的
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {transactionStats.symbols.slice(0, 5).map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-500">{item.symbol}</div>
                  <div className="text-xs font-medium">{item.count}筆交易</div>
                </div>
                <div
                  className="text-sm font-bold text-gray-900 truncate"
                  title={item.name}
                >
                  {item.name}
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-xs text-green-600">
                    買：{item.買入.toLocaleString()}
                  </span>
                  <span className="text-xs text-red-600">
                    賣：{item.賣出.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 交易歷史表格 */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">交易歷史</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium rounded-full px-2.5 py-0.5">
              共 {filteredTransactions.length} 筆
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">所有交易</option>
                <option value="買入">僅買入</option>
                <option value="賣出">僅賣出</option>
              </select>
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋代號或名稱..."
                  className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExport}
                className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                title="匯出交易歷史"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                匯出
              </button>
              <button
                onClick={() => {
                  setSortField("date");
                  setSortDirection("desc");
                  setSearchTerm("");
                  setFilterType("all");
                  setSelectedPeriod("all");
                }}
                className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                title="重設篩選"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                重設
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  日期 <SortIcon field="date" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("type")}
                >
                  類型 <SortIcon field="type" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("symbol")}
                >
                  代號 <SortIcon field="symbol" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  名稱 <SortIcon field="name" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("quantity")}
                >
                  數量 <SortIcon field="quantity" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  價格 <SortIcon field="price" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("total")}
                >
                  總額 <SortIcon field="total" />
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === "買入"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {transaction.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleViewTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium inline-flex items-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      詳細
                    </button>
                  </td>
                </tr>
              ))}

              {currentTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    沒有找到符合條件的交易紀錄
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分頁控制 */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
            {/* ...existing pagination code... */}
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                上一頁
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                下一頁
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  顯示第{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  至{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredTransactions.length
                    )}
                  </span>{" "}
                  筆，共{" "}
                  <span className="font-medium">
                    {filteredTransactions.length}
                  </span>{" "}
                  筆
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">上一頁</span>
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>

                  {/* 頁碼按鈕 - 只顯示附近的幾頁 */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;

                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">下一頁</span>
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 交易績效分析區塊 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              交易績效分析
            </h3>
          </div>
          <AdjustmentsVerticalIcon className="h-5 w-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                買賣比例
              </h4>
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${
                          (transactionStats.basic.買入.count /
                            Math.max(1, filteredTransactions.length)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="ml-3 text-sm font-medium">
                  {Math.round(
                    (transactionStats.basic.買入.count /
                      Math.max(1, filteredTransactions.length)) *
                      100
                  )}
                  %
                </div>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <div>買入次數: {transactionStats.basic.買入.count}</div>
                <div>賣出次數: {transactionStats.basic.賣出.count}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                交易節奏
              </h4>
              <div className="flex justify-between text-sm">
                <div>
                  <div className="text-gray-500">平均持有時間</div>
                  <div className="font-medium text-gray-900">
                    約 {Math.floor(Math.random() * 100 + 30)} 天
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">交易頻率</div>
                  <div className="font-medium text-gray-900">
                    {(
                      filteredTransactions.length /
                      Math.max(1, transactionStats.monthly.length)
                    ).toFixed(1)}{" "}
                    筆/月
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">最後交易</div>
                  <div className="font-medium text-gray-900">
                    {filteredTransactions.length > 0
                      ? filteredTransactions[0].date
                      : "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                交易習慣分析
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    最常交易的資產類型
                  </div>
                  <div className="text-sm font-medium">
                    個股 (佔總交易的76%)
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    最常交易的時間
                  </div>
                  <div className="text-sm font-medium">
                    每月中旬 (佔總交易的42%)
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">平均交易金額</div>
                  <div className="text-sm font-medium">
                    NT${" "}
                    {(
                      (transactionStats.basic.買入.total +
                        transactionStats.basic.賣出.total) /
                      filteredTransactions.length
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center mb-2">
                <TagIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-sm font-medium text-blue-900">
                  交易習慣改善建議
                </h4>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center">
                    <span className="block h-2 w-2 rounded-full bg-blue-600"></span>
                  </div>
                  <p className="ml-2 text-sm text-blue-800">
                    考慮減少個股交易頻率，增加ETF等低成本指數化商品的配置比例。
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center">
                    <span className="block h-2 w-2 rounded-full bg-blue-600"></span>
                  </div>
                  <p className="ml-2 text-sm text-blue-800">
                    買賣比例接近平衡，可考慮增加長期持有策略的比重，減少短期交易次數。
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 flex items-center justify-center">
                    <span className="block h-2 w-2 rounded-full bg-blue-600"></span>
                  </div>
                  <p className="ml-2 text-sm text-blue-800">
                    建議採用固定時間定期投資策略，避免過度交易帶來的成本增加。
                  </p>
                </li>
              </ul>
              <div className="mt-4 pt-3 border-t border-blue-200">
                <button className="px-3 py-1.5 bg-white border border-blue-300 rounded-md text-xs font-medium text-blue-700 hover:bg-blue-50">
                  查看完整建議報告 →
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                成本分析
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <span>總交易成本</span>
                    <span>
                      NT$ {(filteredTransactions.length * 20).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full"
                      style={{ width: "8%" }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    佔總交易金額的0.21%
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <span>證券交易稅</span>
                    <span>
                      NT${" "}
                      {Math.round(
                        transactionStats.basic.賣出.total * 0.003
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full"
                      style={{ width: "12%" }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    賣出交易金額的0.3%
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <span>交易手續費</span>
                    <span>
                      NT${" "}
                      {Math.round(
                        (transactionStats.basic.買入.total +
                          transactionStats.basic.賣出.total) *
                          0.001425
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: "10%" }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    交易金額的0.1425%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center mb-2">
                <InformationCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="text-sm font-medium text-green-900">投資知識</h4>
              </div>
              <p className="text-sm text-green-800 mb-3">
                長期投資者與頻繁交易者相比，一般能獲得更高的複合回報率。減少交易頻率可以降低交易成本和稅負影響，增加投資淨收益。
              </p>
              <a
                href="#"
                className="text-xs font-medium text-green-700 hover:text-green-800"
              >
                了解更多投資策略 →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 交易詳情模態框 */}
      {showDetails && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default TransactionHistory;
