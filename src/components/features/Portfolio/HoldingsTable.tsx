import React, { useState, useMemo } from "react";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TagIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  SparklesIcon,
  PlusIcon,
  MinusIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";

// 類型定義
interface Holding {
  symbol: string;
  name: string;
  price: string;
  priceChange: number;
  quantity: string;
  marketValue: string;
  totalReturn: {
    value: string;
    percentage: string;
  };
  weight: string;
  costBasis: string;
}

interface MiniChartProps {
  data: number[];
  color?: string;
}

interface HoldingDetailProps {
  holding: Holding | null;
  onClose: () => void;
}

interface HoldingsTableProps {
  holdings: Holding[];
  onSelectHolding: (symbol: string) => void;
  selectedHolding?: string;
}

interface HoldingType {
  label: string;
  count: number;
}

interface HoldingTypes {
  all: HoldingType;
  stock: HoldingType;
  etf: HoldingType;
  crypto: HoldingType;
  bond: HoldingType;
}

type SortField =
  | "symbol"
  | "name"
  | "price"
  | "quantity"
  | "marketValue"
  | "weight"
  | "costBasis"
  | "totalReturn";
type SortDirection = "asc" | "desc";
type FilterType = "all" | "stock" | "etf" | "crypto" | "bond";

// 簡易折線圖元件 (不使用 Chart.js，為了輕量化)
const MiniChart: React.FC<MiniChartProps> = ({ data, color }) => {
  const normalizedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    // 避免除以零
    if (range === 0) return data.map(() => 50);

    return data.map((val) => {
      // 轉換為0到100的範圍內，反轉以便較高的值在上方
      return 100 - Math.round(((val - min) / range) * 100);
    });
  }, [data]);

  // 繪製SVG折線圖
  if (!normalizedData.length) return <div className="h-10"></div>;

  const width = 80;
  const height = 30;
  const points = normalizedData
    .map((point, i) => {
      // 計算在SVG中的x坐標，將數據點平均分布在寬度上
      const x = (i / (normalizedData.length - 1)) * width;
      // y坐標，將標準化數據映射到SVG高度
      const y = (point / 100) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const trend =
    normalizedData[0] > normalizedData[normalizedData.length - 1]
      ? "down"
      : "up";
  const strokeColor = trend === "up" ? color || "#10B981" : "#EF4444";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// 股票詳情面板
const HoldingDetail: React.FC<HoldingDetailProps> = ({ holding, onClose }) => {
  if (!holding) return null;

  const priceChangeClass =
    holding.priceChange >= 0 ? "text-green-500" : "text-red-500";
  const returnClass =
    parseFloat(holding.totalReturn.percentage) >= 0
      ? "text-green-500"
      : "text-red-500";

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
          <div className="flex items-center">
            <TagIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">資產詳情</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {holding.name}
              </h3>
              <div className="text-gray-500">{holding.symbol}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{holding.price}</div>
              <div className={priceChangeClass}>
                {holding.priceChange >= 0 ? "+" : ""}
                {holding.priceChange}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="text-sm text-gray-500">市值</div>
                <div className="text-lg font-semibold">
                  {holding.marketValue}
                </div>
              </div>

              <div className="border-b pb-4">
                <div className="text-sm text-gray-500">持有數量</div>
                <div className="text-lg font-semibold">
                  {holding.quantity}股
                </div>
              </div>

              <div className="border-b pb-4">
                <div className="text-sm text-gray-500">成本</div>
                <div className="text-lg font-semibold">{holding.costBasis}</div>
              </div>

              <div className="border-b pb-4">
                <div className="text-sm text-gray-500">總收益</div>
                <div className={`text-lg font-semibold ${returnClass}`}>
                  {holding.totalReturn.value} ({holding.totalReturn.percentage})
                </div>
              </div>

              <div className="border-b pb-4">
                <div className="text-sm text-gray-500">投資組合權重</div>
                <div className="text-lg font-semibold">{holding.weight}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <SparklesIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <div className="text-sm font-medium text-blue-700">
                    AI 分析
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  基於目前市場趨勢與產業分析，{holding.name}（{holding.symbol}）
                  {parseFloat(holding.totalReturn.percentage) >= 15
                    ? "已經有不錯的收益，可考慮適度獲利了結一部分倉位，降低風險。"
                    : parseFloat(holding.totalReturn.percentage) <= -10
                    ? "處於虧損狀態，建議評估基本面是否改變，決定是否止損或加碼攤平成本。"
                    : "表現穩健，可持續持有，並在價格回檔時考慮增持。"}
                </p>
                <div className="mt-3 flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      parseFloat(holding.totalReturn.percentage) >= 15
                        ? "bg-green-100 text-green-800"
                        : parseFloat(holding.totalReturn.percentage) <= -10
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {parseFloat(holding.totalReturn.percentage) >= 15
                      ? "考慮獲利了結"
                      : parseFloat(holding.totalReturn.percentage) <= -10
                      ? "評估風險"
                      : "持續持有"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <PlusIcon className="h-4 w-4 mr-1" /> 買入
                </button>
                <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                  <MinusIcon className="h-4 w-4 mr-1" /> 賣出
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <EyeIcon className="h-4 w-4 mr-1" /> 詳細資訊
                </button>
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <ArrowsRightLeftIcon className="h-4 w-4 mr-1" /> 交易歷史
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  onSelectHolding,
  selectedHolding,
}) => {
  const [sortField, setSortField] = useState<SortField>("marketValue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [detailHolding, setDetailHolding] = useState<Holding | null>(null);

  // 產生一些隨機的價格歷史數據供迷你圖表使用
  const priceHistories: Record<string, number[]> = useMemo(() => {
    return holdings.reduce((acc, holding) => {
      const baseValue = Math.abs(parseFloat(holding.totalReturn.percentage));
      const trend = parseFloat(holding.totalReturn.percentage) >= 0;
      // 生成15個隨機數據點，整體趨勢向上或向下
      let history: number[] = [];
      let value = 100;
      for (let i = 0; i < 15; i++) {
        // 生成 -3 到 +3 之間的隨機變化，但整體趨勢保持
        const change = Math.random() * 6 - 3 + (trend ? 1 : -1);
        value = Math.max(50, Math.min(150, value + change));
        history.push(value);
      }
      acc[holding.symbol] = history;
      return acc;
    }, {} as Record<string, number[]>);
  }, [holdings]);

  // 持股分類
  const holdingTypes: HoldingTypes = useMemo(() => {
    const types: HoldingTypes = {
      all: { label: "全部", count: holdings.length },
      stock: { label: "股票", count: 0 },
      etf: { label: "ETF", count: 0 },
      crypto: { label: "加密貨幣", count: 0 },
      bond: { label: "債券", count: 0 },
    };

    holdings.forEach((holding) => {
      // 基於股票代號來簡單分類
      if (holding.symbol.includes("0") && holding.symbol.length <= 4) {
        types.etf.count++;
      } else if (
        holding.symbol.includes("BTC") ||
        holding.symbol.includes("ETH") ||
        holding.name.includes("幣")
      ) {
        types.crypto.count++;
      } else if (holding.name.includes("債") || holding.name.includes("債券")) {
        types.bond.count++;
      } else {
        types.stock.count++;
      }
    });

    return types;
  }, [holdings]);

  const handleSort = (field: SortField): void => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedHoldings = useMemo(() => {
    // 先過濾類型
    let filtered = [...holdings].filter((holding) => {
      // 搜尋條件
      const matchesSearch =
        holding.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        holding.symbol.toLowerCase().includes(searchTerm.toLowerCase());

      // 類型過濾
      let matchesType = true;
      if (filterType !== "all") {
        if (filterType === "stock") {
          matchesType =
            !(holding.symbol.includes("0") && holding.symbol.length <= 4) &&
            !holding.symbol.includes("BTC") &&
            !holding.symbol.includes("ETH") &&
            !holding.name.includes("幣") &&
            !holding.name.includes("債");
        } else if (filterType === "etf") {
          matchesType =
            holding.symbol.includes("0") && holding.symbol.length <= 4;
        } else if (filterType === "crypto") {
          matchesType =
            holding.symbol.includes("BTC") ||
            holding.symbol.includes("ETH") ||
            holding.name.includes("幣");
        } else if (filterType === "bond") {
          matchesType =
            holding.name.includes("債") || holding.name.includes("債券");
        }
      }

      return matchesSearch && matchesType;
    });

    // 然後排序
    return filtered.sort((a, b) => {
      // 數值欄位特殊處理
      // 數值欄位特殊處理
      if (
        [
          "marketValue",
          "totalReturn",
          "weight",
          "price",
          "quantity",
          "costBasis",
        ].includes(sortField)
      ) {
        if (sortField === "totalReturn") {
          const aValue = parseFloat(a.totalReturn.percentage);
          const bValue = parseFloat(b.totalReturn.percentage);
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        } else {
          const aValue = a[sortField as keyof Holding];
          const bValue = b[sortField as keyof Holding];
          const aNumeric =
            typeof aValue === "string" && aValue.includes("%")
              ? parseFloat(aValue)
              : parseFloat(String(aValue).replace(/[^0-9.-]+/g, ""));
          const bNumeric =
            typeof bValue === "string" && bValue.includes("%")
              ? parseFloat(bValue)
              : parseFloat(String(bValue).replace(/[^0-9.-]+/g, ""));
          return sortDirection === "asc"
            ? aNumeric - bNumeric
            : bNumeric - aNumeric;
        }
      }

      // 字串欄位
      const aValue = a[sortField as keyof Holding] as string;
      const bValue = b[sortField as keyof Holding] as string;
      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [holdings, sortField, sortDirection, searchTerm, filterType]);

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUpIcon className="h-4 w-4 ml-1 inline" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 ml-1 inline" />
    );
  };

  // 處理查看詳情
  const handleViewDetail = (holdingSymbol: string): void => {
    const holding = holdings.find((h) => h.symbol === holdingSymbol);
    setDetailHolding(holding || null);
    setShowDetail(true);
  };

  return (
    <>
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* 表格頭部 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>

          <div className="flex flex-wrap justify-between items-center gap-4 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  持倉明細
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  共 {sortedHoldings.length} 項資產 • 總市值{" "}
                  {holdings
                    .reduce((acc, curr) => {
                      const value = parseFloat(
                        curr.marketValue.replace(/[^0-9.-]+/g, "")
                      );
                      return acc + value;
                    }, 0)
                    .toLocaleString()}{" "}
                  NT$
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* 類型過濾器 */}
              <div className="flex space-x-2">
                {Object.entries(holdingTypes).map(([type, data]) => (
                  <button
                    key={type}
                    className={`px-4 py-2 text-sm rounded-full flex items-center transition-all duration-200 transform hover:scale-105 ${
                      filterType === type
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                        : "bg-white/70 text-gray-600 hover:bg-white border border-gray-200 hover:shadow-md"
                    }`}
                    onClick={() => setFilterType(type as FilterType)}
                  >
                    {type === "stock" && <TagIcon className="h-4 w-4 mr-2" />}
                    {type === "etf" && (
                      <ChartPieIcon className="h-4 w-4 mr-2" />
                    )}
                    {type === "crypto" && (
                      <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    )}
                    {type === "bond" && (
                      <DocumentIcon className="h-4 w-4 mr-2" />
                    )}
                    {data.label}{" "}
                    <span className="ml-1 bg-white/30 px-2 py-0.5 rounded-full text-xs">
                      ({data.count})
                    </span>
                  </button>
                ))}
              </div>

              {/* 搜尋框 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋資產..."
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-2xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                {searchTerm && (
                  <button
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setSearchTerm("")}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 表格內容 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort("symbol")}
                >
                  <div className="flex items-center space-x-1">
                    <span>代號</span>
                    <SortIcon field="symbol" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center space-x-1">
                    <span>名稱</span>
                    <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center space-x-1">
                    <span>當前價格</span>
                    <SortIcon field="price" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  趨勢
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort("quantity")}
                >
                  <div className="flex items-center space-x-1">
                    <span>持有數量</span>
                    <SortIcon field="quantity" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort("marketValue")}
                >
                  <div className="flex items-center space-x-1">
                    <span>市值</span>
                    <SortIcon field="marketValue" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort("totalReturn")}
                >
                  <div className="flex items-center space-x-1">
                    <span>收益率</span>
                    <SortIcon field="totalReturn" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleSort("weight")}
                >
                  <div className="flex items-center space-x-1">
                    <span>權重</span>
                    <SortIcon field="weight" />
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedHoldings.map((holding, index) => (
                <tr
                  key={holding.symbol}
                  className={`transition-all duration-200 cursor-pointer ${
                    selectedHolding === holding.symbol
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500"
                      : "hover:bg-gray-50"
                  } ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                  onClick={() => onSelectHolding(holding.symbol)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                        {holding.symbol}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {holding.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {holding.price}
                      </div>
                      <div
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          holding.priceChange >= 0
                            ? "text-emerald-700 bg-emerald-100"
                            : "text-red-700 bg-red-100"
                        }`}
                      >
                        {holding.priceChange >= 0 ? "+" : ""}
                        {holding.priceChange.toFixed(2)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <MiniChart
                        data={priceHistories[holding.symbol]}
                        color={
                          parseFloat(holding.totalReturn.percentage) >= 0
                            ? "#10B981"
                            : "#EF4444"
                        }
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {holding.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {holding.marketValue}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`text-sm font-bold px-3 py-1 rounded-full ${
                          parseFloat(holding.totalReturn.percentage) >= 0
                            ? "text-emerald-700 bg-emerald-100"
                            : "text-red-700 bg-red-100"
                        }`}
                      >
                        {holding.totalReturn.value}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          parseFloat(holding.totalReturn.percentage) >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        ({holding.totalReturn.percentage})
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-semibold text-gray-900 mr-2">
                        {holding.weight}
                      </div>
                      <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${parseFloat(holding.weight)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(holding.symbol);
                        }}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-all duration-200 font-medium"
                      >
                        詳情
                      </button>
                      <button
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* 當沒有數據時顯示 */}
              {sortedHoldings.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <ChartBarIcon className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-gray-500">
                          {searchTerm || filterType !== "all"
                            ? "沒有符合條件的資產"
                            : "尚無持倉資料"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {searchTerm || filterType !== "all"
                            ? "請嘗試調整搜尋條件或篩選器"
                            : "開始您的投資之旅"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 表格底部摘要 */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="text-sm text-gray-600">
                總市值:{" "}
                <span className="text-lg font-bold text-gray-900">
                  {holdings
                    .reduce((acc, curr) => {
                      const value = parseFloat(
                        curr.marketValue.replace(/[^0-9.-]+/g, "")
                      );
                      return acc + value;
                    }, 0)
                    .toLocaleString()}
                  NT$
                </span>
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-sm text-gray-600">
                總收益:{" "}
                <span
                  className={`text-lg font-bold px-3 py-1 rounded-full ${
                    holdings.reduce((acc, curr) => {
                      const value = parseFloat(
                        curr.totalReturn.value.replace(/[^0-9.-]+/g, "")
                      );
                      return acc + value;
                    }, 0) >= 0
                      ? "text-emerald-700 bg-emerald-100"
                      : "text-red-700 bg-red-100"
                  }`}
                >
                  {holdings
                    .reduce((acc, curr) => {
                      const value = parseFloat(
                        curr.totalReturn.value.replace(/[^0-9.-]+/g, "")
                      );
                      return acc + value;
                    }, 0)
                    .toLocaleString()}
                  NT$
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 資產詳情彈窗 */}
      {showDetail && (
        <HoldingDetail
          holding={detailHolding}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
};

export default HoldingsTable;
