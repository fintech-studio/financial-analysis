import React, { useState, useMemo } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  PlusIcon,
  MinusIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowsRightLeftIcon,
  EyeIcon,
  TagIcon,
  ChartPieIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

// 簡易折線圖元件 (不使用 Chart.js，為了輕量化)
const MiniChart = ({ data, color }) => {
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
const HoldingDetail = ({ holding, onClose }) => {
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

const HoldingsTable = ({ holdings, onSelectHolding, selectedHolding }) => {
  const [sortField, setSortField] = useState("marketValue");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showDetail, setShowDetail] = useState(false);
  const [detailHolding, setDetailHolding] = useState(null);

  // 產生一些隨機的價格歷史數據供迷你圖表使用
  const priceHistories = useMemo(() => {
    return holdings.reduce((acc, holding) => {
      const baseValue = Math.abs(parseFloat(holding.totalReturn.percentage));
      const trend = parseFloat(holding.totalReturn.percentage) >= 0;
      // 生成15個隨機數據點，整體趨勢向上或向下
      let history = [];
      let value = 100;
      for (let i = 0; i < 15; i++) {
        // 生成 -3 到 +3 之間的隨機變化，但整體趨勢保持
        const change = Math.random() * 6 - 3 + (trend ? 1 : -1);
        value = Math.max(50, Math.min(150, value + change));
        history.push(value);
      }
      acc[holding.symbol] = history;
      return acc;
    }, {});
  }, [holdings]);

  // 持股分類
  const holdingTypes = useMemo(() => {
    const types = {
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

  const handleSort = (field) => {
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
      if (
        [
          "marketValue",
          "totalReturn",
          "weight",
          "price",
          "quantity",
          "costBasis",
          "returnPercentage",
        ].includes(sortField)
      ) {
        if (sortField === "returnPercentage") {
          const aValue = parseFloat(a.totalReturn.percentage);
          const bValue = parseFloat(b.totalReturn.percentage);
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        } else {
          const aValue =
            typeof a[sortField] === "string" && a[sortField].includes("%")
              ? parseFloat(a[sortField])
              : a[sortField];
          const bValue =
            typeof b[sortField] === "string" && b[sortField].includes("%")
              ? parseFloat(b[sortField])
              : b[sortField];
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
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
  }, [holdings, sortField, sortDirection, searchTerm, filterType]);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUpIcon className="h-4 w-4 ml-1 inline" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 ml-1 inline" />
    );
  };

  // 處理查看詳情
  const handleViewDetail = (holdingSymbol) => {
    const holding = holdings.find((h) => h.symbol === holdingSymbol);
    setDetailHolding(holding);
    setShowDetail(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">持倉明細</h3>
              <span className="text-sm text-gray-500">
                ({sortedHoldings.length} 項資產)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* 類型過濾器 */}
              <div className="flex space-x-2">
                {Object.entries(holdingTypes).map(([type, data]) => (
                  <button
                    key={type}
                    className={`px-3 py-1 text-xs rounded-full flex items-center ${
                      filterType === type
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                    }`}
                    onClick={() => setFilterType(type)}
                  >
                    {type === "stock" && (
                      <TagIcon className="h-3.5 w-3.5 mr-1" />
                    )}
                    {type === "etf" && (
                      <ChartPieIcon className="h-3.5 w-3.5 mr-1" />
                    )}
                    {type === "crypto" && (
                      <CurrencyDollarIcon className="h-3.5 w-3.5 mr-1" />
                    )}
                    {type === "bond" && (
                      <DocumentIcon className="h-3.5 w-3.5 mr-1" />
                    )}
                    {data.label} <span className="ml-1">({data.count})</span>
                  </button>
                ))}
              </div>

              {/* 搜尋框 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋資產..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                {searchTerm && (
                  <button
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchTerm("")}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  onClick={() => handleSort("price")}
                >
                  當前價格 <SortIcon field="price" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  趨勢
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("quantity")}
                >
                  持有數量 <SortIcon field="quantity" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("marketValue")}
                >
                  市值 <SortIcon field="marketValue" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("returnPercentage")}
                >
                  收益率 <SortIcon field="returnPercentage" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("weight")}
                >
                  權重 <SortIcon field="weight" />
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedHoldings.map((holding) => (
                <tr
                  key={holding.symbol}
                  className={`${
                    selectedHolding === holding.symbol
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  } cursor-pointer`}
                  onClick={() => onSelectHolding(holding.symbol)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {holding.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {holding.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {holding.price}
                    <span
                      className={`ml-1 text-xs ${
                        holding.priceChange >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      ({holding.priceChange >= 0 ? "+" : ""}
                      {holding.priceChange}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <MiniChart
                      data={priceHistories[holding.symbol]}
                      color={
                        parseFloat(holding.totalReturn.percentage) >= 0
                          ? "#10B981"
                          : "#EF4444"
                      }
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {holding.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {holding.marketValue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`font-medium ${
                        parseFloat(holding.totalReturn.percentage) >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {holding.totalReturn.percentage}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      {parseFloat(holding.totalReturn.value) >= 0 ? "+" : ""}
                      {holding.totalReturn.value}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {holding.weight}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="圖表分析"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectHolding(holding.symbol);
                        }}
                      >
                        <ChartBarIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        title="詳細資訊"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(holding.symbol);
                        }}
                      >
                        <InformationCircleIcon className="h-5 w-5" />
                      </button>
                      <div className="relative group">
                        <button
                          className="text-gray-400 hover:text-gray-600"
                          title="更多操作"
                        >
                          <EllipsisHorizontalIcon className="h-5 w-5" />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                          <button className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">
                            買入
                          </button>
                          <button className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">
                            賣出
                          </button>
                          <button className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">
                            設置提醒
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {sortedHoldings.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    沒有找到匹配的持倉資產
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 表格底部摘要 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              顯示 {sortedHoldings.length} 項資產，總計：
              <span className="font-medium text-gray-900 ml-1">
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
            <div className="text-sm text-gray-500">
              總收益：
              <span className="font-medium ml-1 text-green-600">
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
