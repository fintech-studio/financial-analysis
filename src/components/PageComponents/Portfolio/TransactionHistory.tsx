import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Bar } from "react-chartjs-2";
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
import { PortfolioController } from "@/controllers/PortfolioController";
import { useMvcController } from "@/hooks/useMvcController";
import type {
  Transaction,
  TransactionStats,
  SortField,
  SortDirection,
  FilterType,
  PeriodType,
  TransactionHistoryProps,
} from "@/types/portfolio";

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

// Chart.js 專用型別
interface ChartJsData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// 修正 ChartDataConfig 型別
interface ChartDataConfig {
  monthlyChart: ChartJsData;
  symbolChart: ChartJsData;
}

// 交易詳情模態框 - 重新設計

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions: initialTransactions,
}) => {
  // MVC 控制器
  const portfolioController = PortfolioController.getInstance();

  // 模擬交易數據 - 如果沒有傳入初始數據，使用這些測試數據
  const mockTransactions: Transaction[] = useMemo(
    () => [
      {
        id: "tx_001",
        date: "2024-06-15",
        type: "買入",
        symbol: "2330",
        name: "台積電",
        quantity: 1000,
        price: "NT$ 585.00",
        total: "NT$ 585,000",
        exchange: "台灣證券交易所",
        note: "分批建倉第一筆",
      },
      {
        id: "tx_002",
        date: "2024-06-10",
        type: "買入",
        symbol: "2317",
        name: "鴻海",
        quantity: 2000,
        price: "NT$ 108.50",
        total: "NT$ 217,000",
        exchange: "台灣證券交易所",
        note: "看好電動車趨勢",
      },
      {
        id: "tx_003",
        date: "2024-06-08",
        type: "賣出",
        symbol: "AAPL",
        name: "蘋果公司",
        quantity: 50,
        price: "US$ 195.89",
        total: "NT$ 304,850",
        exchange: "NASDAQ",
        note: "獲利了結",
      },
      {
        id: "tx_004",
        date: "2024-06-05",
        type: "買入",
        symbol: "0050",
        name: "元大台灣50",
        quantity: 1000,
        price: "NT$ 142.30",
        total: "NT$ 142,300",
        exchange: "台灣證券交易所",
        note: "定期定額投資",
      },
      {
        id: "tx_005",
        date: "2024-06-03",
        type: "買入",
        symbol: "NVDA",
        name: "輝達",
        quantity: 20,
        price: "US$ 1,208.88",
        total: "NT$ 751,500",
        exchange: "NASDAQ",
        note: "看好AI晶片前景",
      },
      {
        id: "tx_006",
        date: "2024-05-28",
        type: "賣出",
        symbol: "2454",
        name: "聯發科",
        quantity: 500,
        price: "NT$ 765.00",
        total: "NT$ 382,500",
        exchange: "台灣證券交易所",
        note: "減倉操作",
      },
      {
        id: "tx_007",
        date: "2024-05-25",
        type: "買入",
        symbol: "MSFT",
        name: "微軟",
        quantity: 30,
        price: "US$ 424.73",
        total: "NT$ 396,050",
        exchange: "NASDAQ",
        note: "長期持有",
      },
      {
        id: "tx_008",
        date: "2024-05-20",
        type: "買入",
        symbol: "2882",
        name: "國泰金",
        quantity: 3000,
        price: "NT$ 61.80",
        total: "NT$ 185,400",
        exchange: "台灣證券交易所",
        note: "金融股配息",
      },
      {
        id: "tx_009",
        date: "2024-05-15",
        type: "買入",
        symbol: "TSLA",
        name: "特斯拉",
        quantity: 25,
        price: "US$ 178.79",
        total: "NT$ 138,950",
        exchange: "NASDAQ",
        note: "電動車龍頭",
      },
      {
        id: "tx_010",
        date: "2024-05-10",
        type: "賣出",
        symbol: "2308",
        name: "台達電",
        quantity: 800,
        price: "NT$ 312.00",
        total: "NT$ 249,600",
        exchange: "台灣證券交易所",
        note: "技術分析賣點",
      },
      {
        id: "tx_011",
        date: "2024-05-05",
        type: "買入",
        symbol: "6505",
        name: "台塑化",
        quantity: 2000,
        price: "NT$ 95.50",
        total: "NT$ 191,000",
        exchange: "台灣證券交易所",
        note: "傳產價值投資",
      },
      {
        id: "tx_012",
        date: "2024-05-01",
        type: "買入",
        symbol: "GOOGL",
        name: "Alphabet",
        quantity: 15,
        price: "US$ 166.54",
        total: "NT$ 77,630",
        exchange: "NASDAQ",
        note: "科技股布局",
      },
      {
        id: "tx_013",
        date: "2024-04-28",
        type: "買入",
        symbol: "2891",
        name: "中信金",
        quantity: 2500,
        price: "NT$ 35.85",
        total: "NT$ 89,625",
        exchange: "台灣證券交易所",
        note: "金融股分散",
      },
      {
        id: "tx_014",
        date: "2024-04-25",
        type: "賣出",
        symbol: "2412",
        name: "中華電",
        quantity: 1000,
        price: "NT$ 124.50",
        total: "NT$ 124,500",
        exchange: "台灣證券交易所",
        note: "電信股整理",
      },
      {
        id: "tx_015",
        date: "2024-04-20",
        type: "買入",
        symbol: "SPY",
        name: "SPDR S&P 500 ETF",
        quantity: 20,
        price: "US$ 521.23",
        total: "NT$ 324,150",
        exchange: "NYSE",
        note: "美股ETF配置",
      },
      {
        id: "tx_016",
        date: "2024-04-15",
        type: "買入",
        symbol: "1303",
        name: "南亞",
        quantity: 1500,
        price: "NT$ 78.90",
        total: "NT$ 118,350",
        exchange: "台灣證券交易所",
        note: "化工類股",
      },
      {
        id: "tx_017",
        date: "2024-04-10",
        type: "買入",
        symbol: "META",
        name: "Meta Platforms",
        quantity: 12,
        price: "US$ 502.31",
        total: "NT$ 187,350",
        exchange: "NASDAQ",
        note: "社群媒體龍頭",
      },
      {
        id: "tx_018",
        date: "2024-04-05",
        type: "賣出",
        symbol: "2881",
        name: "富邦金",
        quantity: 2000,
        price: "NT$ 82.70",
        total: "NT$ 165,400",
        exchange: "台灣證券交易所",
        note: "金融股調整",
      },
      {
        id: "tx_019",
        date: "2024-04-01",
        type: "買入",
        symbol: "2002",
        name: "中鋼",
        quantity: 5000,
        price: "NT$ 30.15",
        total: "NT$ 150,750",
        exchange: "台灣證券交易所",
        note: "鋼鐵股逢低承接",
      },
      {
        id: "tx_020",
        date: "2024-03-28",
        type: "買入",
        symbol: "AMD",
        name: "超微半導體",
        quantity: 35,
        price: "US$ 180.72",
        total: "NT$ 196,550",
        exchange: "NASDAQ",
        note: "半導體競爭者",
      },
    ],
    []
  );

  // 使用 MVC Hook 管理交易數據
  const { data: transactions, execute: executePortfolioAction } =
    useMvcController<Transaction[]>();

  // 狀態管理
  const [sortField] = useState<SortField>("date");
  const [sortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("all");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const itemsPerPage = 10;

  // 載入交易數據
  const loadTransactions = useCallback(async () => {
    const userId = "user_001"; // 應該從認證上下文獲取
    await executePortfolioAction(async () => {
      // 優先使用傳入的數據，否則使用模擬數據
      if (initialTransactions && initialTransactions.length > 0) {
        return initialTransactions;
      }

      try {
        const portfolioTransactions =
          await portfolioController.getTransactionHistory(userId);
        // 轉換Portfolio模型的Transaction到組件期望的Transaction格式
        return portfolioTransactions.map((t) => ({
          ...t,
          name: t.symbol + " 股票", // 添加缺失的name屬性
          total: `NT$ ${(t.quantity * t.price).toLocaleString()}`, // 轉換為字符串格式
          price: `NT$ ${t.price.toLocaleString()}`, // 將price也轉換為字符串格式
          type: t.type === "buy" ? "買入" : ("賣出" as "買入" | "賣出"), // 修復類型轉換
        }));
      } catch {
        console.log("使用模擬交易數據");
        return mockTransactions;
      }
    });
  }, [
    executePortfolioAction,
    initialTransactions,
    mockTransactions,
    portfolioController,
  ]);

  // 初始化數據
  useEffect(() => {
    if (initialTransactions && initialTransactions.length > 0) {
      // 如果有初始數據，直接使用
      // 由於我們無法直接設置 useMvcController 的 data，我們將使用本地狀態
    } else {
      // 否則使用模擬數據或從控制器載入
      loadTransactions();
    }
  }, [initialTransactions, loadTransactions]);

  // 實際使用的交易數據 - 優先使用從controller載入的數據，否則使用模擬數據
  const actualTransactions = transactions || mockTransactions;

  // 日期範圍過濾
  const getDateRangeFilter = (
    period: PeriodType
  ): ((transaction: Transaction) => boolean) => {
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

    return (transaction: Transaction): boolean => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= today;
    };
  };

  const filteredTransactions = useMemo((): Transaction[] => {
    // 使用實際的交易數據，優先使用從controller載入的數據，否則使用模擬數據
    const dataToFilter = transactions || actualTransactions;

    if (!dataToFilter || dataToFilter.length === 0) return actualTransactions;

    const dateRangeFilter = getDateRangeFilter(selectedPeriod);

    const filtered = [...dataToFilter].filter((transaction) => {
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
        return sortDirection === "asc"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }

      // 數值欄位特殊處理
      if (["quantity", "price", "total"].includes(sortField)) {
        const aValue =
          typeof a[sortField] === "string"
            ? parseFloat((a[sortField] as string).replace(/[^0-9.-]+/g, ""))
            : Number(a[sortField]);
        const bValue =
          typeof b[sortField] === "string"
            ? parseFloat((b[sortField] as string).replace(/[^0-9.-]+/g, ""))
            : Number(b[sortField]);
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // 字串欄位
      const aValue = String(a[sortField]);
      const bValue = String(b[sortField]);

      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [
    transactions,
    actualTransactions,
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
  const transactionStats = useMemo((): TransactionStats => {
    // 使用實際的交易數據進行統計計算
    const dataForStats = transactions || actualTransactions;

    if (!dataForStats || dataForStats.length === 0) {
      return {
        basic: { 買入: { count: 0, total: 0 }, 賣出: { count: 0, total: 0 } },
        monthly: [],
        symbols: [],
        netCashFlow: 0,
      };
    }

    // 基本統計
    const stats = {
      買入: { count: 0, total: 0 },
      賣出: { count: 0, total: 0 },
    };

    // 時間序列資料
    const monthlyData: Record<string, { 買入: number; 賣出: number }> = {};
    const symbolData: Record<
      string,
      {
        name: string;
        買入: number;
        賣出: number;
        count: number;
      }
    > = {};

    dataForStats.forEach((transaction) => {
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
  }, [transactions, actualTransactions]);

  // 準備圖表資料
  const chartData = useMemo((): ChartDataConfig => {
    const monthlyLabels = transactionStats.monthly.map(([month]) => month);
    const buyData = transactionStats.monthly.map(([, data]) => data.買入);
    const sellData = transactionStats.monthly.map(([, data]) => data.賣出);

    // 月度交易金額圖表
    const monthlyChart: ChartJsData = {
      labels: monthlyLabels,
      datasets: [
        {
          label: "買入",
          data: buyData,
          backgroundColor: "rgba(34, 197, 94, 0.6)",
          borderColor: "rgb(34, 197, 94)",
          // borderWidth: 1,
        },
        {
          label: "賣出",
          data: sellData,
          backgroundColor: "rgba(239, 68, 68, 0.6)",
          borderColor: "rgb(239, 68, 68)",
          // borderWidth: 1,
        },
      ],
    };

    // 交易分布圓餅圖
    const symbolChart: ChartJsData = {
      labels: transactionStats.symbols.slice(0, 5).map((item) => item.symbol),
      datasets: [
        {
          label: "交易金額",
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
          borderColor: "rgba(0, 0, 0, 0.1)",
          // borderWidth: 1,
        },
      ],
    };

    return { monthlyChart, symbolChart };
  }, [transactionStats]);

  const handleViewTransaction = (transaction: Transaction): void => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* 簡約頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">交易歷史</h1>
          <p className="text-gray-600 text-sm mt-1">投資交易記錄與統計</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全部時間</option>
          <option value="last7days">最近7天</option>
          <option value="last30days">最近30天</option>
          <option value="last90days">最近90天</option>
          <option value="thisYear">本年度</option>
        </select>
      </div>

      {/* 簡約統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-gray-500 text-xs font-medium">總交易</div>
          <div className="text-xl font-bold text-gray-900 mt-1">
            {filteredTransactions.length}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-gray-500 text-xs font-medium">買入總額</div>
          <div className="text-xl font-bold text-green-600 mt-1">
            {(transactionStats.basic.買入.total / 1000).toFixed(0)}K
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-gray-500 text-xs font-medium">賣出總額</div>
          <div className="text-xl font-bold text-red-600 mt-1">
            {(transactionStats.basic.賣出.total / 1000).toFixed(0)}K
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-gray-500 text-xs font-medium">淨現金流</div>
          <div
            className={`text-xl font-bold mt-1 ${
              transactionStats.netCashFlow >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {transactionStats.netCashFlow >= 0 ? "+" : ""}
            {(transactionStats.netCashFlow / 1000).toFixed(0)}K
          </div>
        </div>
      </div>

      {/* 簡約圖表區塊 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          月度交易趨勢
        </h3>
        <div className="h-64">
          <Bar
            data={chartData.monthlyChart}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false } },
                y: {
                  grid: { color: "rgba(0, 0, 0, 0.05)" },
                  ticks: {
                    callback: function (value: string | number): string {
                      return Number(value).toLocaleString();
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* 簡約表格 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* 簡約表格控制項 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">交易記錄</h3>
              <span className="text-sm text-gray-500">
                {filteredTransactions.length} 筆
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="text-sm border border-gray-300 rounded px-3 py-1"
              >
                <option value="all">全部</option>
                <option value="買入">買入</option>
                <option value="賣出">賣出</option>
              </select>

              <input
                type="text"
                placeholder="搜尋..."
                className="text-sm border border-gray-300 rounded px-3 py-1 w-32 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 簡約表格內容 */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  類型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  股票
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  數量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  價格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  總額
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        transaction.type === "買入"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.symbol}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.price}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {transaction.total}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleViewTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}

              {currentTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    沒有找到交易記錄
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 簡約分頁 */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              第 {currentPage} 頁，共 {totalPages} 頁
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
              >
                上一頁
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
              >
                下一頁
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 簡約交易詳情模態框 */}
      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  交易詳情
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
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
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">交易日期</div>
                  <div className="font-medium">{selectedTransaction.date}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">交易類型</div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      selectedTransaction.type === "買入"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedTransaction.type}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">股票代號</div>
                  <div className="font-medium">
                    {selectedTransaction.symbol}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">股票名稱</div>
                  <div className="font-medium">{selectedTransaction.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">數量</div>
                  <div className="font-medium">
                    {selectedTransaction.quantity.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">價格</div>
                  <div className="font-medium">{selectedTransaction.price}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-500">總額</div>
                  <div className="text-lg font-bold">
                    {selectedTransaction.total}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
