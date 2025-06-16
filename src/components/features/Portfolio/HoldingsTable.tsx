import React, { useState, useMemo } from "react";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FunnelIcon,
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
  weight?: string; // 改為可選，因為權重是動態計算的
  costBasis: string;
  assetType: AssetType; // 新增資產類型字段
}

// 資產類型枚舉
type AssetType =
  | "tw_stock"
  | "us_stock"
  | "etf"
  | "crypto"
  | "bond"
  | "reit"
  | "commodity";

interface MiniChartProps {
  data: number[];
  color?: string;
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
  reit: HoldingType;
  commodity: HoldingType;
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
type FilterType =
  | "all"
  | "stock"
  | "etf"
  | "crypto"
  | "bond"
  | "reit"
  | "commodity";

// 簡化的迷你圖表元件
const MiniChart: React.FC<MiniChartProps> = ({ data, color = "#6366f1" }) => {
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
    <svg width={60} height={20} className="overflow-visible">
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

const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings: initialHoldings,
  onSelectHolding,
  selectedHolding,
}) => {
  // 模擬持倉數據 - 如果沒有傳入初始數據，使用這些測試數據
  const mockHoldings: Holding[] = [
    {
      symbol: "2330",
      name: "台積電",
      price: "NT$ 585.00",
      priceChange: 1.75,
      quantity: "1000",
      marketValue: "NT$ 585,000",
      totalReturn: {
        value: "NT$ 85,000",
        percentage: "+17.0%",
      },
      costBasis: "NT$ 500,000",
      assetType: "tw_stock",
    },
    {
      symbol: "NVDA",
      name: "輝達",
      price: "US$ 875.28",
      priceChange: 3.25,
      quantity: "50",
      marketValue: "NT$ 1,360,850",
      totalReturn: {
        value: "NT$ 485,350",
        percentage: "+55.4%",
      },
      costBasis: "NT$ 875,500",
      assetType: "us_stock",
    },
    {
      symbol: "AAPL",
      name: "蘋果公司",
      price: "US$ 192.35",
      priceChange: 2.43,
      quantity: "100",
      marketValue: "NT$ 598,400",
      totalReturn: {
        value: "NT$ 76,200",
        percentage: "+14.6%",
      },
      costBasis: "NT$ 522,200",
      assetType: "us_stock",
    },
    {
      symbol: "VTI",
      name: "Vanguard整體股市ETF",
      price: "US$ 245.73",
      priceChange: 0.82,
      quantity: "200",
      marketValue: "NT$ 1,528,530",
      totalReturn: {
        value: "NT$ 228,530",
        percentage: "+17.6%",
      },
      costBasis: "NT$ 1,300,000",
      assetType: "etf",
    },
    {
      symbol: "MSFT",
      name: "微軟",
      price: "US$ 424.73",
      priceChange: 1.18,
      quantity: "80",
      marketValue: "NT$ 1,056,280",
      totalReturn: {
        value: "NT$ 156,280",
        percentage: "+17.4%",
      },
      costBasis: "NT$ 900,000",
      assetType: "us_stock",
    },
    {
      symbol: "BTC",
      name: "比特幣",
      price: "US$ 67,542.30",
      priceChange: 4.75,
      quantity: "25.5",
      marketValue: "NT$ 1,050,690",
      totalReturn: {
        value: "NT$ 200,690",
        percentage: "+23.6%",
      },
      costBasis: "NT$ 850,000",
      assetType: "crypto",
    },
    {
      symbol: "META",
      name: "Meta Platforms",
      price: "US$ 502.31",
      priceChange: 1.67,
      quantity: "70",
      marketValue: "NT$ 1,093,540",
      totalReturn: {
        value: "NT$ 143,540",
        percentage: "+15.1%",
      },
      costBasis: "NT$ 950,000",
      assetType: "us_stock",
    },
    {
      symbol: "SPY",
      name: "SPDR S&P 500 ETF",
      price: "US$ 521.23",
      priceChange: 0.95,
      quantity: "100",
      marketValue: "NT$ 1,620,830",
      totalReturn: {
        value: "NT$ 220,830",
        percentage: "+15.8%",
      },
      costBasis: "NT$ 1,400,000",
      assetType: "etf",
    },
    {
      symbol: "GOOGL",
      name: "Alphabet",
      price: "US$ 166.54",
      priceChange: 1.35,
      quantity: "150",
      marketValue: "NT$ 777,030",
      totalReturn: {
        value: "NT$ 77,030",
        percentage: "+11.0%",
      },
      costBasis: "NT$ 700,000",
      assetType: "us_stock",
    },
    {
      symbol: "TLT",
      name: "iShares 20年期美國公債ETF",
      price: "US$ 94.27",
      priceChange: -0.45,
      quantity: "400",
      marketValue: "NT$ 1,171,836",
      totalReturn: {
        value: "NT$ 71,836",
        percentage: "+6.5%",
      },
      costBasis: "NT$ 1,100,000",
      assetType: "bond",
    },
    {
      symbol: "VNQ",
      name: "Vanguard Real Estate ETF",
      price: "US$ 89.45",
      priceChange: 0.78,
      quantity: "300",
      marketValue: "NT$ 833,850",
      totalReturn: {
        value: "NT$ 83,850",
        percentage: "+11.2%",
      },
      costBasis: "NT$ 750,000",
      assetType: "reit",
    },
    {
      symbol: "AMD",
      name: "超微半導體",
      price: "US$ 158.73",
      priceChange: 4.12,
      quantity: "120",
      marketValue: "NT$ 592,248",
      totalReturn: {
        value: "NT$ 92,248",
        percentage: "+18.4%",
      },
      costBasis: "NT$ 500,000",
      assetType: "us_stock",
    },
    {
      symbol: "2317",
      name: "鴻海",
      price: "NT$ 108.50",
      priceChange: -0.92,
      quantity: "2000",
      marketValue: "NT$ 217,000",
      totalReturn: {
        value: "NT$ 17,000",
        percentage: "+8.5%",
      },
      costBasis: "NT$ 200,000",
      assetType: "tw_stock",
    },
    {
      symbol: "TSLA",
      name: "特斯拉",
      price: "US$ 248.42",
      priceChange: -2.15,
      quantity: "60",
      marketValue: "NT$ 463,235",
      totalReturn: {
        value: "-NT$ 36,765",
        percentage: "-7.4%",
      },
      costBasis: "NT$ 500,000",
      assetType: "us_stock",
    },
    {
      symbol: "2454",
      name: "聯發科",
      price: "NT$ 765.00",
      priceChange: -1.42,
      quantity: "300",
      marketValue: "NT$ 229,500",
      totalReturn: {
        value: "-NT$ 10,500",
        percentage: "-4.4%",
      },
      costBasis: "NT$ 240,000",
      assetType: "tw_stock",
    },
    {
      symbol: "ETH",
      name: "以太坊",
      price: "US$ 3,845.67",
      priceChange: 2.89,
      quantity: "2",
      marketValue: "NT$ 239,200",
      totalReturn: {
        value: "NT$ 39,200",
        percentage: "+19.6%",
      },
      costBasis: "NT$ 200,000",
      assetType: "crypto",
    },
    {
      symbol: "2882",
      name: "國泰金",
      price: "NT$ 61.80",
      priceChange: 0.65,
      quantity: "3000",
      marketValue: "NT$ 185,400",
      totalReturn: {
        value: "NT$ 15,400",
        percentage: "+9.1%",
      },
      costBasis: "NT$ 170,000",
      assetType: "tw_stock",
    },
    {
      symbol: "DOT",
      name: "波卡幣",
      price: "US$ 6.82",
      priceChange: -2.18,
      quantity: "2000",
      marketValue: "NT$ 424,240",
      totalReturn: {
        value: "-NT$ 75,760",
        percentage: "-15.2%",
      },
      costBasis: "NT$ 500,000",
      assetType: "crypto",
    },
    {
      symbol: "2308",
      name: "台達電",
      price: "NT$ 312.00",
      priceChange: 1.95,
      quantity: "500",
      marketValue: "NT$ 156,000",
      totalReturn: {
        value: "NT$ 6,000",
        percentage: "+4.0%",
      },
      costBasis: "NT$ 150,000",
      assetType: "tw_stock",
    },
    {
      symbol: "0050",
      name: "元大台灣50",
      price: "NT$ 142.30",
      priceChange: 0.35,
      quantity: "1000",
      marketValue: "NT$ 142,300",
      totalReturn: {
        value: "NT$ 17,300",
        percentage: "+13.8%",
      },
      costBasis: "NT$ 125,000",
      assetType: "etf",
    },
    {
      symbol: "2002",
      name: "中鋼",
      price: "NT$ 30.15",
      priceChange: -1.15,
      quantity: "5000",
      marketValue: "NT$ 150,750",
      totalReturn: {
        value: "-NT$ 14,250",
        percentage: "-8.6%",
      },
      costBasis: "NT$ 165,000",
      assetType: "tw_stock",
    },
    {
      symbol: "1216",
      name: "統一",
      price: "NT$ 68.50",
      priceChange: 1.48,
      quantity: "1500",
      marketValue: "NT$ 102,750",
      totalReturn: {
        value: "NT$ 12,750",
        percentage: "+14.2%",
      },
      costBasis: "NT$ 90,000",
      assetType: "tw_stock",
    },
    {
      symbol: "006208",
      name: "富邦台50",
      price: "NT$ 85.40",
      priceChange: 0.47,
      quantity: "1200",
      marketValue: "NT$ 102,480",
      totalReturn: {
        value: "NT$ 12,480",
        percentage: "+13.9%",
      },
      costBasis: "NT$ 90,000",
      assetType: "etf",
    },
    {
      symbol: "2412",
      name: "中華電",
      price: "NT$ 124.50",
      priceChange: -0.4,
      quantity: "800",
      marketValue: "NT$ 99,600",
      totalReturn: {
        value: "NT$ 4,600",
        percentage: "+4.8%",
      },
      costBasis: "NT$ 95,000",
      assetType: "tw_stock",
    },
    {
      symbol: "2891",
      name: "中信金",
      price: "NT$ 35.85",
      priceChange: -0.28,
      quantity: "2500",
      marketValue: "NT$ 89,625",
      totalReturn: {
        value: "NT$ 4,625",
        percentage: "+5.4%",
      },
      costBasis: "NT$ 85,000",
      assetType: "tw_stock",
    },
    {
      symbol: "ADA",
      name: "艾達幣",
      price: "US$ 0.48",
      priceChange: 3.45,
      quantity: "10000",
      marketValue: "NT$ 149,280",
      totalReturn: {
        value: "NT$ 29,280",
        percentage: "+24.4%",
      },
      costBasis: "NT$ 120,000",
      assetType: "crypto",
    },
    {
      symbol: "00679B",
      name: "元大美債20年",
      price: "NT$ 36.78",
      priceChange: 0.22,
      quantity: "3000",
      marketValue: "NT$ 110,340",
      totalReturn: {
        value: "NT$ 10,340",
        percentage: "+10.3%",
      },
      costBasis: "NT$ 100,000",
      assetType: "bond",
    },
    {
      symbol: "2883",
      name: "開發金REIT",
      price: "NT$ 14.85",
      priceChange: -0.34,
      quantity: "5000",
      marketValue: "NT$ 74,250",
      totalReturn: {
        value: "NT$ 4,250",
        percentage: "+6.1%",
      },
      costBasis: "NT$ 70,000",
      assetType: "reit",
    },
    {
      symbol: "1301",
      name: "台塑",
      price: "NT$ 85.20",
      priceChange: -0.93,
      quantity: "800",
      marketValue: "NT$ 68,160",
      totalReturn: {
        value: "NT$ 3,160",
        percentage: "+4.9%",
      },
      costBasis: "NT$ 65,000",
      assetType: "tw_stock",
    },
    // 新增商品類別
    {
      symbol: "GLD",
      name: "SPDR黃金ETF",
      price: "US$ 198.42",
      priceChange: 2.15,
      quantity: "150",
      marketValue: "NT$ 925,950",
      totalReturn: {
        value: "NT$ 125,950",
        percentage: "+15.7%",
      },
      costBasis: "NT$ 800,000",
      assetType: "commodity",
    },
    {
      symbol: "USO",
      name: "美國原油基金",
      price: "US$ 72.18",
      priceChange: -1.85,
      quantity: "200",
      marketValue: "NT$ 448,518",
      totalReturn: {
        value: "-NT$ 51,482",
        percentage: "-10.3%",
      },
      costBasis: "NT$ 500,000",
      assetType: "commodity",
    },
  ];

  // 實際使用的持倉數據 - 優先使用傳入的數據，否則使用模擬數據
  const holdings =
    initialHoldings && initialHoldings.length > 0
      ? initialHoldings
      : mockHoldings;

  const [sortField, setSortField] = useState<SortField>("marketValue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // 計算總市值和每個資產的權重
  const holdingsWithWeight = useMemo(() => {
    // 計算總市值
    const totalMarketValue = holdings.reduce((acc, holding) => {
      const value = parseFloat(holding.marketValue.replace(/[^0-9.-]+/g, ""));
      return acc + value;
    }, 0);

    // 為每個持倉添加計算出的權重
    return holdings.map((holding) => {
      const marketValue = parseFloat(
        holding.marketValue.replace(/[^0-9.-]+/g, "")
      );
      const weight =
        totalMarketValue > 0
          ? ((marketValue / totalMarketValue) * 100).toFixed(1) + "%"
          : "0.0%";

      return {
        ...holding,
        weight,
      };
    });
  }, [holdings]);

  // 產生一些隨機的價格歷史數據供迷你圖表使用
  const priceHistories: Record<string, number[]> = useMemo(() => {
    return holdingsWithWeight.reduce((acc, holding) => {
      const totalReturnValue = parseFloat(holding.totalReturn.percentage);
      const isPositiveTrend = totalReturnValue >= 0;

      // 根據不同的資產類型和收益率生成不同的趨勢模式
      let history: number[] = [];
      let baseValue = 100;

      // 為每個資產生成一個基於其代號的種子，確保相同資產每次都生成相同的圖表
      const seed = holding.symbol
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const random = (index: number) => {
        const x = Math.sin(seed + index) * 10000;
        return x - Math.floor(x);
      };

      for (let i = 0; i < 15; i++) {
        let changeIntensity = Math.abs(totalReturnValue) / 10; // 根據收益率調整波動強度
        changeIntensity = Math.max(0.5, Math.min(3, changeIntensity)); // 限制在合理範圍

        // 生成變化值
        let change = (random(i) - 0.5) * changeIntensity * 2;

        // 根據總收益趨勢調整整體方向
        if (isPositiveTrend) {
          change += 0.3; // 正收益傾向向上
        } else {
          change -= 0.3; // 負收益傾向向下
        }

        // 加入一些週期性變化，讓圖表更自然
        const cyclicalChange = Math.sin(i / 3) * 0.5;
        change += cyclicalChange;

        baseValue += change;
        // 確保值在合理範圍內
        baseValue = Math.max(70, Math.min(130, baseValue));
        history.push(baseValue);
      }

      acc[holding.symbol] = history;
      return acc;
    }, {} as Record<string, number[]>);
  }, [holdingsWithWeight]);

  // 持股分類
  const holdingTypes: HoldingTypes = useMemo(() => {
    const types: HoldingTypes = {
      all: { label: "全部", count: holdingsWithWeight.length },
      stock: { label: "股票", count: 0 },
      etf: { label: "ETF", count: 0 },
      crypto: { label: "加密貨幣", count: 0 },
      bond: { label: "債券", count: 0 },
      reit: { label: "REIT", count: 0 },
      commodity: { label: "商品", count: 0 },
    };

    holdingsWithWeight.forEach((holding) => {
      // 基於 assetType 字段進行分類
      switch (holding.assetType) {
        case "tw_stock":
        case "us_stock":
          types.stock.count++;
          break;
        case "etf":
          types.etf.count++;
          break;
        case "crypto":
          types.crypto.count++;
          break;
        case "bond":
          types.bond.count++;
          break;
        case "reit":
          types.reit.count++;
          break;
        case "commodity":
          types.commodity.count++;
          break;
        default:
          types.stock.count++; // 預設歸類為股票
          break;
      }
    });

    return types;
  }, [holdingsWithWeight]);

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
    let filtered = [...holdingsWithWeight].filter((holding) => {
      // 搜尋條件
      const matchesSearch =
        holding.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        holding.symbol.toLowerCase().includes(searchTerm.toLowerCase());

      // 類型過濾 - 使用 assetType 字段
      let matchesType = true;
      if (filterType !== "all") {
        switch (filterType) {
          case "stock":
            matchesType =
              holding.assetType === "tw_stock" ||
              holding.assetType === "us_stock";
            break;
          case "etf":
            matchesType = holding.assetType === "etf";
            break;
          case "crypto":
            matchesType = holding.assetType === "crypto";
            break;
          case "bond":
            matchesType = holding.assetType === "bond";
            break;
          case "reit":
            matchesType = holding.assetType === "reit";
            break;
          case "commodity":
            matchesType = holding.assetType === "commodity";
            break;
          default:
            matchesType = true;
            break;
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
  }, [holdingsWithWeight, sortField, sortDirection, searchTerm, filterType]);

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUpIcon className="h-4 w-4 ml-1 inline" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 ml-1 inline" />
    );
  };

  // 根據資產類型獲取對應的單位
  const getAssetUnit = (assetType: AssetType): string => {
    switch (assetType) {
      case "tw_stock":
      case "us_stock":
        return "股";
      case "etf":
        return "張";
      case "crypto":
        return "顆";
      case "bond":
        return "張";
      case "reit":
        return "單位";
      case "commodity":
        return "單位";
      default:
        return "單位";
    }
  };

  // 格式化價格顯示
  const formatPrice = (price: string, assetType: AssetType): string => {
    // 移除現有的貨幣符號
    const numericPrice = price.replace(/^(NT\$|US\$)\s*/, "");

    // 根據資產類型決定貨幣符號
    switch (assetType) {
      case "tw_stock":
      case "etf":
      case "bond":
      case "reit":
        // 台灣相關資產使用 NT$
        return `NT$ ${numericPrice}`;
      case "us_stock":
      case "commodity":
        // 美股和商品使用 US$
        return `US$ ${numericPrice}`;
      case "crypto":
        // 加密貨幣使用 US$
        return `US$ ${numericPrice}`;
      default:
        // 預設使用原始價格，如果沒有貨幣符號則加上 NT$
        return price.includes("$") ? price : `NT$ ${numericPrice}`;
    }
  };

  // 格式化數量顯示
  const formatQuantity = (quantity: string, assetType: AssetType): string => {
    const numericQuantity = parseFloat(quantity);
    const unit = getAssetUnit(assetType);

    // 根據資產類型決定小數位數
    if (assetType === "crypto") {
      // 加密貨幣可能有小數，顯示到合適的小數位
      if (numericQuantity < 1) {
        return `${numericQuantity.toFixed(4)} ${unit}`;
      } else if (numericQuantity < 100) {
        return `${numericQuantity.toFixed(2)} ${unit}`;
      } else {
        return `${Math.floor(numericQuantity).toLocaleString()} ${unit}`;
      }
    } else {
      // 其他資產類型通常是整數
      return `${Math.floor(numericQuantity).toLocaleString()} ${unit}`;
    }
  };

  // 簡化的資產類型樣式
  const getAssetTypeStyle = (holding: Holding) => {
    switch (holding.assetType) {
      case "etf":
        return {
          color: "text-purple-600",
          bg: "bg-purple-50",
          dot: "bg-purple-500",
          label: "ETF",
          labelBg: "bg-purple-100",
          labelText: "text-purple-700",
        };
      case "crypto":
        return {
          color: "text-orange-600",
          bg: "bg-orange-50",
          dot: "bg-orange-500",
          label: "加密貨幣",
          labelBg: "bg-orange-100",
          labelText: "text-orange-700",
        };
      case "bond":
        return {
          color: "text-green-600",
          bg: "bg-green-50",
          dot: "bg-green-500",
          label: "債券",
          labelBg: "bg-green-100",
          labelText: "text-green-700",
        };
      case "reit":
        return {
          color: "text-red-600",
          bg: "bg-red-50",
          dot: "bg-red-500",
          label: "REIT",
          labelBg: "bg-red-100",
          labelText: "text-red-700",
        };
      case "commodity":
        return {
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          dot: "bg-yellow-500",
          label: "商品",
          labelBg: "bg-yellow-100",
          labelText: "text-yellow-700",
        };
      case "us_stock":
        return {
          color: "text-blue-600",
          bg: "bg-blue-50",
          dot: "bg-blue-500",
          label: "美股",
          labelBg: "bg-blue-100",
          labelText: "text-blue-700",
        };
      case "tw_stock":
        return {
          color: "text-indigo-600",
          bg: "bg-indigo-50",
          dot: "bg-indigo-500",
          label: "台股",
          labelBg: "bg-indigo-100",
          labelText: "text-indigo-700",
        };
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-50",
          dot: "bg-gray-500",
          label: "其他",
          labelBg: "bg-gray-100",
          labelText: "text-gray-700",
        };
    }
  };

  // 計算分頁資訊
  const totalPages = Math.ceil(sortedHoldings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, sortedHoldings.length);

  // 重置頁面當篩選或搜尋改變時
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // 計算當前頁面顯示的持倉
  const paginatedHoldings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedHoldings.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedHoldings, currentPage, itemsPerPage]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* 簡化的頭部 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">持倉明細</h2>
            <p className="text-sm text-gray-500 mt-1">
              {sortedHoldings.length} 項資產
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 修改為標籤樣式的篩選器 */}
            <div className="flex items-center gap-2">
              {Object.entries(holdingTypes).map(([type, data]) => {
                // 為每個篩選器類型定義對應的顏色
                const getFilterTypeStyle = (
                  filterType: string,
                  isActive: boolean
                ) => {
                  if (!isActive) {
                    // 未選中狀態統一為灰色
                    return {
                      style:
                        "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200",
                    };
                  }

                  // 選中狀態才顯示對應顏色
                  switch (filterType) {
                    case "all":
                      return {
                        style: "bg-blue-600 text-white border-blue-600",
                      };
                    case "stock":
                      return {
                        style: "bg-indigo-500 text-white border-indigo-500",
                      };
                    case "etf":
                      return {
                        style: "bg-purple-500 text-white border-purple-500",
                      };
                    case "crypto":
                      return {
                        style: "bg-orange-500 text-white border-orange-500",
                      };
                    case "bond":
                      return {
                        style: "bg-green-500 text-white border-green-500",
                      };
                    case "reit":
                      return {
                        style: "bg-red-500 text-white border-red-500",
                      };
                    case "commodity":
                      return {
                        style: "bg-yellow-500 text-white border-yellow-500",
                      };
                    default:
                      return {
                        style: "bg-gray-500 text-white border-gray-500",
                      };
                  }
                };

                const isActive = filterType === type;
                const style = getFilterTypeStyle(type, isActive);

                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as FilterType)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${style.style}`}
                  >
                    {data.label} ({data.count})
                  </button>
                );
              })}
            </div>

            {/* 簡化的搜尋框 */}
            <div className="relative">
              <input
                type="text"
                placeholder="搜尋..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
              {searchTerm && (
                <button
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm("")}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 簡化的表格 */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider w-60">
                資產
              </th>
              <th
                className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 w-32"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center gap-1">
                  價格
                  <SortIcon field="price" />
                </div>
              </th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                趨勢
              </th>
              <th
                className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 w-40"
                onClick={() => handleSort("marketValue")}
              >
                <div className="flex items-center justify-end gap-1">
                  市值
                  <SortIcon field="marketValue" />
                </div>
              </th>
              <th
                className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 w-32"
                onClick={() => handleSort("totalReturn")}
              >
                <div className="flex items-center justify-end gap-1">
                  收益
                  <SortIcon field="totalReturn" />
                </div>
              </th>
              <th
                className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 w-28"
                onClick={() => handleSort("weight")}
              >
                <div className="flex items-center justify-end gap-1">
                  權重
                  <SortIcon field="weight" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedHoldings.map((holding) => {
              const style = getAssetTypeStyle(holding);
              const isPositive =
                parseFloat(holding.totalReturn.percentage) >= 0;

              return (
                <tr
                  key={holding.symbol}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedHolding === holding.symbol ? "bg-blue-50" : ""
                  }`}
                  onClick={() => onSelectHolding(holding.symbol)}
                >
                  <td className="py-4 px-6 w-60">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-md font-medium ${style.labelBg} ${style.labelText} whitespace-nowrap`}
                          >
                            {style.label}
                          </span>
                          <span className="font-medium text-gray-900 whitespace-nowrap">
                            {holding.symbol}
                          </span>
                        </div>
                        <div
                          className="text-sm text-gray-500 truncate mt-1"
                          title={holding.name}
                        >
                          {holding.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 w-32">
                    <div>
                      <div className="font-medium text-gray-900 whitespace-nowrap">
                        {formatPrice(holding.price, holding.assetType)}
                      </div>
                      <div
                        className={`text-sm whitespace-nowrap ${
                          holding.priceChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {holding.priceChange >= 0 ? "+" : ""}
                        {holding.priceChange.toFixed(2)}%
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 w-24">
                    <div className="flex justify-center">
                      <MiniChart
                        data={priceHistories[holding.symbol]}
                        color={
                          priceHistories[holding.symbol] &&
                          priceHistories[holding.symbol][0] <
                            priceHistories[holding.symbol][
                              priceHistories[holding.symbol].length - 1
                            ]
                            ? "#10b981" // 綠色：趨勢向上
                            : "#ef4444" // 紅色：趨勢向下
                        }
                      />
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right w-40">
                    <div className="font-medium text-gray-900 whitespace-nowrap">
                      {holding.marketValue.replace("NT$ ", "NT$ ")}
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      持有:{" "}
                      {formatQuantity(holding.quantity, holding.assetType)}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right w-32">
                    <div
                      className={`font-medium whitespace-nowrap ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {holding.totalReturn.percentage}
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {holding.totalReturn.value}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right w-28">
                    <div className="font-medium text-gray-900 whitespace-nowrap">
                      {holding.weight}
                    </div>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full ml-auto mt-1">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            parseFloat(holding.weight),
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 空狀態 */}
        {sortedHoldings.length === 0 && (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              {searchTerm || filterType !== "all"
                ? "找不到符合的資產"
                : "尚無持倉"}
            </h3>
            <p className="text-sm text-gray-500">
              {searchTerm || filterType !== "all"
                ? "試試其他搜尋條件"
                : "開始建立您的投資組合"}
            </p>
          </div>
        )}
      </div>

      {/* 分頁控制 */}
      {totalPages > 1 && (
        <div className="bg-white px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              顯示 {startIndex} 到 {endIndex} 筆，共 {sortedHoldings.length}{" "}
              筆資料
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一頁
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // 只顯示當前頁面附近的頁碼
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 text-sm rounded-md ${
                            currentPage === page
                              ? "bg-blue-500 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一頁
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 簡化的底部摘要 */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            總市值:{" "}
            <span className="font-semibold text-gray-900">
              NT${" "}
              {holdings
                .reduce((acc, curr) => {
                  const value = parseFloat(
                    curr.marketValue.replace(/[^0-9.-]+/g, "")
                  );
                  return acc + value;
                }, 0)
                .toLocaleString()}
            </span>
          </span>
          <span className="text-gray-600">
            總收益:{" "}
            <span
              className={`font-semibold ${
                holdings.reduce((acc, curr) => {
                  const value = parseFloat(
                    curr.totalReturn.value.replace(/[^0-9.-]+/g, "")
                  );
                  return acc + value;
                }, 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              NT${" "}
              {holdings
                .reduce((acc, curr) => {
                  const value = parseFloat(
                    curr.totalReturn.value.replace(/[^0-9.-]+/g, "")
                  );
                  return acc + value;
                }, 0)
                .toLocaleString()}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default HoldingsTable;
