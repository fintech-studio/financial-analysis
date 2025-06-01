import React, { useState, useEffect, useMemo } from "react";
import { Tab } from "@headlessui/react";
import {
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  BarsArrowUpIcon,
  BarsArrowDownIcon,
  PlusCircleIcon,
  ShareIcon,
  TableCellsIcon,
  DocumentTextIcon,
  XMarkIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

// TypeScript 類型定義
interface Stock {
  symbol: string;
  name: string;
  price: number | string;
  changePercent: string;
  pe: number | string;
  pb: number | string;
  dividend: string;
  volume: string;
  industry: string;
  marketCap: string;
  recommendation: string;
  trend: string;
  [key: string]: any;
}

interface FilterState {
  priceMin: string;
  priceMax: string;
  peMin: string;
  peMax: string;
  pbMin: string;
  pbMax: string;
  dividendMin: string;
  volumeMin: string;
  industry: string;
  marketCap: string;
  trend: string;
  financialHealth: string;
}

interface TechFilterState {
  maStatus: string;
  rsiMin: string;
  rsiMax: string;
  pattern: string;
  macdSignal: string;
  bollingerPosition: string;
  volumeChange: string;
}

interface PresetFilter {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  filters?: Partial<FilterState>;
  techFilters?: Partial<TechFilterState>;
}

interface SavedScreen {
  id: number;
  name: string;
  date: string;
  filters?: FilterState;
  techFilters?: TechFilterState;
}

interface OptionItem {
  id: string;
  name: string;
}

interface ScreenerProps {
  favoriteStocks?: string[];
  toggleFavoriteStock?: (symbol: string) => void;
}

type SortField =
  | "symbol"
  | "price"
  | "changePercent"
  | "pe"
  | "pb"
  | "dividend"
  | "volume";
type SortDirection = "asc" | "desc";
type ActiveTab = "preset" | "custom" | "saved";

const Screener: React.FC<ScreenerProps> = ({
  favoriteStocks,
  toggleFavoriteStock,
}) => {
  // 確保 favoriteStocks 是陣列
  const validFavoriteStocks: string[] = Array.isArray(favoriteStocks)
    ? favoriteStocks
    : [];

  // 主要狀態管理
  const [activeTab, setActiveTab] = useState<ActiveTab>("preset");
  const [savedScreens, setSavedScreens] = useState<SavedScreen[]>([]);
  const [screenName, setScreenName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showTechFilters, setShowTechFilters] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState<boolean>(false);
  const [visibleResults, setVisibleResults] = useState<number>(10);
  const [hasMoreResults, setHasMoreResults] = useState<boolean>(false);

  // 篩選狀態
  const [filters, setFilters] = useState<FilterState>({
    priceMin: "",
    priceMax: "",
    peMin: "",
    peMax: "",
    pbMin: "",
    pbMax: "",
    dividendMin: "",
    volumeMin: "",
    industry: "all",
    marketCap: "all",
    trend: "all",
    financialHealth: "all",
  });

  const [techFilters, setTechFilters] = useState<TechFilterState>({
    maStatus: "all",
    rsiMin: "",
    rsiMax: "",
    pattern: "all",
    macdSignal: "all",
    bollingerPosition: "all",
    volumeChange: "all",
  });

  // 結果與排序
  const [screenResults, setScreenResults] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>("symbol");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);

  // 預設選股策略
  const presetFilters: PresetFilter[] = [
    {
      id: "value",
      name: "價值型投資",
      description: "高股息低本益比",
      icon: <BookmarkIcon className="h-5 w-5 text-blue-500" />,
      filters: {
        peMax: "12",
        dividendMin: "3",
      },
    },
    {
      id: "growth",
      name: "成長型投資",
      description: "高成長潛力股",
      icon: <ChartBarIcon className="h-5 w-5 text-green-500" />,
      filters: {
        industry: "tech",
        peMin: "15",
      },
    },
    {
      id: "momentum",
      name: "動能投資",
      description: "技術突破股",
      icon: <BarsArrowUpIcon className="h-5 w-5 text-purple-500" />,
      techFilters: {
        maStatus: "golden_cross",
        pattern: "breakthrough",
      },
    },
    {
      id: "volume",
      name: "放量突破股",
      description: "資金流入標的",
      icon: <ChartBarIcon className="h-5 w-5 text-orange-500" />,
      filters: {
        volumeMin: "1000000000",
        trend: "up",
      },
    },
    {
      id: "dividend",
      name: "高股息ETF",
      description: "穩定配息收益型",
      icon: <BookmarkIcon className="h-5 w-5 text-cyan-500" />,
      filters: {
        dividendMin: "5",
        industry: "finance",
      },
    },
    {
      id: "reversal",
      name: "技術反轉股",
      description: "超賣反彈機會",
      icon: <BarsArrowDownIcon className="h-5 w-5 text-red-500" />,
      techFilters: {
        rsiMin: "20",
        rsiMax: "30",
      },
    },
  ];

  // 選項數據
  const industries: OptionItem[] = [
    { id: "all", name: "全部產業" },
    { id: "tech", name: "科技業" },
    { id: "finance", name: "金融業" },
    { id: "industrial", name: "工業" },
    { id: "consumer", name: "消費" },
    { id: "healthcare", name: "醫療保健" },
    { id: "energy", name: "能源" },
    { id: "materials", name: "原物料" },
    { id: "utilities", name: "公用事業" },
    { id: "communication", name: "電信服務" },
    { id: "realestate", name: "不動產" },
  ];

  const marketCapOptions: OptionItem[] = [
    { id: "all", name: "不限市值" },
    { id: "mega", name: "巨型股 (>5000億)" },
    { id: "large", name: "大型股 (1000-5000億)" },
    { id: "mid", name: "中型股 (100-1000億)" },
    { id: "small", name: "小型股 (20-100億)" },
    { id: "micro", name: "微型股 (<20億)" },
  ];

  const patterns: OptionItem[] = [
    { id: "all", name: "不限形態" },
    { id: "golden_cross", name: "黃金交叉" },
    { id: "death_cross", name: "死亡交叉" },
    { id: "breakthrough", name: "突破" },
    { id: "support", name: "支撐" },
    { id: "resistance", name: "阻力" },
    { id: "head_shoulders", name: "頭肩頂/底" },
    { id: "double_top", name: "雙重頂/底" },
    { id: "triangle", name: "三角形整理" },
    { id: "gap_up", name: "跳空缺口" },
    { id: "island_reversal", name: "島狀反轉" },
  ];

  // 模擬已保存的篩選設定
  useEffect(() => {
    setSavedScreens([
      { id: 1, name: "長期投資組合", date: "2025/05/01" },
      { id: 2, name: "短線交易清單", date: "2025/05/15" },
      { id: 3, name: "高殖利率股票", date: "2025/05/18" },
    ]);
  }, []);

  // 加載更多結果
  const loadMoreResults = (): void => {
    setVisibleResults((prev) => prev + 10);
    if (visibleResults + 10 >= screenResults.length) {
      setHasMoreResults(false);
    }
  };

  // 處理過濾條件變更
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setActivePreset(null);
  };

  // 處理技術指標過濾條件變更
  const handleTechFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setTechFilters((prev) => ({ ...prev, [name]: value }));
    setActivePreset(null);
  };

  // 應用預設篩選條件
  const applyPreset = (preset: PresetFilter): void => {
    resetFilters();

    if (preset.filters) {
      setFilters((prev) => ({ ...prev, ...preset.filters }));
    }

    if (preset.techFilters) {
      setTechFilters((prev) => ({ ...prev, ...preset.techFilters }));
      setShowTechFilters(true);
    }

    setActivePreset(preset.id);
  };

  // 儲存目前的篩選條件
  const saveCurrentScreen = (): void => {
    if (!screenName) return;

    setIsSaving(true);

    setTimeout(() => {
      const newScreen: SavedScreen = {
        id: Date.now(),
        name: screenName,
        date: new Date().toLocaleDateString("zh-TW"),
        filters: { ...filters },
        techFilters: { ...techFilters },
      };

      setSavedScreens((prev) => [newScreen, ...prev]);
      setScreenName("");
      setIsSaving(false);
    }, 600);
  };

  // 載入已保存的篩選條件
  const loadSavedScreen = (screen: SavedScreen): void => {
    if (screen.filters) {
      setFilters({ ...screen.filters });
    }
    if (screen.techFilters) {
      setTechFilters({ ...screen.techFilters });
    }
    setShowTechFilters(true);
    setActivePreset(null);
    setActiveTab("custom");
  };

  // 重置篩選條件
  const resetFilters = (): void => {
    setFilters({
      priceMin: "",
      priceMax: "",
      peMin: "",
      peMax: "",
      pbMin: "",
      pbMax: "",
      dividendMin: "",
      volumeMin: "",
      industry: "all",
      marketCap: "all",
      trend: "all",
      financialHealth: "all",
    });

    setTechFilters({
      maStatus: "all",
      rsiMin: "",
      rsiMax: "",
      pattern: "all",
      macdSignal: "all",
      bollingerPosition: "all",
      volumeChange: "all",
    });

    setActivePreset(null);
  };

  // 執行選股篩選
  const executeScreening = (): void => {
    setIsLoading(true);
    setSelectedStocks([]);
    setVisibleResults(10);

    // 模擬API呼叫和篩選結果
    setTimeout(() => {
      const mockResults: Stock[] = [
        {
          symbol: "2330",
          name: "台積電",
          price: "580.00",
          changePercent: "+1.8%",
          pe: "25.4",
          pb: "6.8",
          dividend: "2.3%",
          volume: "35,862張",
          industry: "半導體",
          marketCap: "15.1兆",
          recommendation: "買入",
          trend: "up",
        },
        {
          symbol: "2317",
          name: "鴻海",
          price: "105.50",
          changePercent: "-1.2%",
          pe: "10.2",
          pb: "1.8",
          dividend: "3.8%",
          volume: "42,356張",
          industry: "電子零組件",
          marketCap: "1,450億",
          recommendation: "買入",
          trend: "down",
        },
        // ...更多模擬數據
      ];

      setScreenResults(mockResults);
      setHasMoreResults(mockResults.length > 10);
      setIsLoading(false);
    }, 1200);
  };

  // 處理排序
  const handleSort = (field: SortField): void => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // 處理選取股票
  const handleSelectStock = (symbol: string): void => {
    setSelectedStocks((prev) => {
      if (prev.includes(symbol)) {
        return prev.filter((s) => s !== symbol);
      } else {
        return [...prev, symbol];
      }
    });
  };

  // 建立自選組合
  const createPortfolio = (): void => {
    alert(`已將 ${selectedStocks.length} 支股票加入投資組合！`);
    setSelectedStocks([]);
  };

  // 排序結果
  const sortedResults = useMemo(() => {
    if (screenResults.length === 0) return [];

    return [...screenResults].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      const numA = parseFloat(String(aVal).replace(/[^\d.-]/g, ""));
      const numB = parseFloat(String(bVal).replace(/[^\d.-]/g, ""));

      return sortDirection === "asc" ? numA - numB : numB - numA;
    });
  }, [screenResults, sortField, sortDirection]);

  // 顯示的結果（分頁）
  const displayResults = useMemo(() => {
    return sortedResults.slice(0, visibleResults);
  }, [sortedResults, visibleResults]);

  // 排序圖標組件
  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <BarsArrowUpIcon className="h-4 w-4 ml-1 inline" />
    ) : (
      <BarsArrowDownIcon className="h-4 w-4 ml-1 inline" />
    );
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題和描述 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FunnelIcon className="h-6 w-6 text-blue-600 mr-2" />
            智慧選股工具
          </h2>
          <p className="mt-1 text-gray-600">
            使用多種條件快速篩選市場中符合您投資需求的股票
          </p>
        </div>

        {selectedStocks.length > 0 && (
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-blue-700">
              已選擇 {selectedStocks.length} 個股票
            </span>
            <button
              onClick={createPortfolio}
              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
            >
              <PlusCircleIcon className="h-4 w-4 mr-1" />
              建立組合
            </button>
            <button
              onClick={() => setSelectedStocks([])}
              className="text-blue-600 hover:text-blue-800"
            >
              清除
            </button>
          </div>
        )}
      </div>

      {/* 分頁標籤 */}
      <Tab.Group
        onChange={(index: number) =>
          setActiveTab(
            index === 0 ? "preset" : index === 1 ? "custom" : "saved"
          )
        }
        defaultIndex={0}
      >
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-50 p-1">
          <Tab
            className={({ selected }) => `
              w-full py-3 text-sm font-medium leading-5 rounded-lg
              ${
                selected
                  ? "bg-white shadow text-blue-700"
                  : "text-blue-600 hover:bg-white/[0.5] hover:text-blue-700"
              }
              flex items-center justify-center
            `}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            常用策略
          </Tab>
          <Tab
            className={({ selected }) => `
              w-full py-3 text-sm font-medium leading-5 rounded-lg
              ${
                selected
                  ? "bg-white shadow text-blue-700"
                  : "text-blue-600 hover:bg-white/[0.5] hover:text-blue-700"
              }
              flex items-center justify-center
            `}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
            自訂篩選
          </Tab>
          <Tab
            className={({ selected }) => `
              w-full py-3 text-sm font-medium leading-5 rounded-lg
              ${
                selected
                  ? "bg-white shadow text-blue-700"
                  : "text-blue-600 hover:bg-white/[0.5] hover:text-blue-700"
              }
              flex items-center justify-center
            `}
          >
            <BookmarkIcon className="h-4 w-4 mr-2" />
            已儲存篩選
          </Tab>
        </Tab.List>

        <Tab.Panels>
          {/* 常用策略面板 */}
          <Tab.Panel>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presetFilters.map((preset) => (
                  <div
                    key={preset.id}
                    className={`p-5 rounded-lg border transition-all ${
                      activePreset === preset.id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:shadow"
                    } cursor-pointer`}
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="flex items-center mb-2">
                      {preset.icon}
                      <h4 className="font-medium text-gray-900 ml-2">
                        {preset.name}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {preset.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* 執行篩選按鈕 */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={executeScreening}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2 align-middle"></span>
                      篩選中...
                    </>
                  ) : (
                    "套用策略並開始選股"
                  )}
                </button>
              </div>
            </div>
          </Tab.Panel>

          {/* 自訂篩選面板 */}
          <Tab.Panel>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={resetFilters}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" /> 重置條件
                </button>

                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                    showAdvancedFilters
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
                  進階篩選
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </button>

                <button
                  onClick={() => setShowTechFilters(!showTechFilters)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                    showTechFilters
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  技術指標
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </button>
              </div>

              {/* 基本篩選條件 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* 價格區間 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    股價區間
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="priceMin"
                      placeholder="最小值"
                      value={filters.priceMin}
                      onChange={handleFilterChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <span className="flex items-center text-gray-500">~</span>
                    <input
                      type="text"
                      name="priceMax"
                      placeholder="最大值"
                      value={filters.priceMax}
                      onChange={handleFilterChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* 本益比區間 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    本益比區間
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="peMin"
                      placeholder="最小值"
                      value={filters.peMin}
                      onChange={handleFilterChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <span className="flex items-center text-gray-500">~</span>
                    <input
                      type="text"
                      name="peMax"
                      placeholder="最大值"
                      value={filters.peMax}
                      onChange={handleFilterChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* 股息殖利率 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    股息殖利率 (%)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="dividendMin"
                      placeholder="最小值"
                      value={filters.dividendMin}
                      onChange={handleFilterChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <span className="flex items-center text-gray-500">
                      以上
                    </span>
                  </div>
                </div>

                {/* 產業類別 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    產業類別
                  </label>
                  <select
                    name="industry"
                    value={filters.industry}
                    onChange={handleFilterChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {industries.map((industry) => (
                      <option key={industry.id} value={industry.id}>
                        {industry.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 公司規模 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    公司規模
                  </label>
                  <select
                    name="marketCap"
                    value={filters.marketCap}
                    onChange={handleFilterChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {marketCapOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 成交量 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    成交量 (億)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="volumeMin"
                      placeholder="最小值"
                      value={filters.volumeMin}
                      onChange={handleFilterChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <span className="flex items-center text-gray-500">
                      以上
                    </span>
                  </div>
                </div>
              </div>

              {/* 技術指標條件 */}
              {showTechFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-base font-medium text-gray-900 mb-4">
                    技術指標篩選
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* 均線狀態 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        均線狀態
                      </label>
                      <select
                        name="maStatus"
                        value={techFilters.maStatus}
                        onChange={handleTechFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="all">不限</option>
                        <option value="ma5_above_ma20">5日線站上20日線</option>
                        <option value="ma5_below_ma20">5日線跌破20日線</option>
                        <option value="ma20_above_ma60">
                          20日線站上60日線
                        </option>
                        <option value="golden_cross">黃金交叉</option>
                        <option value="death_cross">死亡交叉</option>
                      </select>
                    </div>

                    {/* RSI 指標 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RSI 指標
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          name="rsiMin"
                          placeholder="最小值"
                          value={techFilters.rsiMin}
                          onChange={handleTechFilterChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <span className="flex items-center text-gray-500">
                          ~
                        </span>
                        <input
                          type="text"
                          name="rsiMax"
                          placeholder="最大值"
                          value={techFilters.rsiMax}
                          onChange={handleTechFilterChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* 技術形態 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        技術形態
                      </label>
                      <select
                        name="pattern"
                        value={techFilters.pattern}
                        onChange={handleTechFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        {patterns.map((pattern) => (
                          <option key={pattern.id} value={pattern.id}>
                            {pattern.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* MACD 指標 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MACD 指標
                      </label>
                      <select
                        name="macdSignal"
                        value={techFilters.macdSignal}
                        onChange={handleTechFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="all">不限</option>
                        <option value="golden_cross">黃金交叉</option>
                        <option value="death_cross">死亡交叉</option>
                        <option value="above_zero">位於零軸之上</option>
                        <option value="below_zero">位於零軸之下</option>
                      </select>
                    </div>

                    {/* 布林通道 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        布林通道位置
                      </label>
                      <select
                        name="bollingerPosition"
                        value={techFilters.bollingerPosition}
                        onChange={handleTechFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="all">不限</option>
                        <option value="above_upper">突破上軌</option>
                        <option value="below_lower">跌破下軌</option>
                        <option value="near_upper">接近上軌</option>
                        <option value="near_lower">接近下軌</option>
                        <option value="middle">位於中軌附近</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 進階篩選條件 */}
              {showAdvancedFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-base font-medium text-gray-900 mb-4">
                    進階篩選條件
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* 財務健康度 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        財務健康度
                      </label>
                      <select
                        name="financialHealth"
                        value={filters.financialHealth}
                        onChange={handleFilterChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="all">不限</option>
                        <option value="excellent">優良</option>
                        <option value="good">良好</option>
                        <option value="average">一般</option>
                        <option value="weak">較弱</option>
                      </select>
                    </div>

                    {/* 股價淨值比區間 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        股價淨值比區間
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          name="pbMin"
                          placeholder="最小值"
                          value={filters.pbMin}
                          onChange={handleFilterChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <span className="flex items-center text-gray-500">
                          ~
                        </span>
                        <input
                          type="text"
                          name="pbMax"
                          placeholder="最大值"
                          value={filters.pbMax}
                          onChange={handleFilterChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 儲存篩選設定 */}
              <div className="mt-6 flex items-center gap-4 border-t border-gray-200 pt-6">
                <input
                  type="text"
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  placeholder="命名並保存這個篩選設定..."
                  className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <button
                  onClick={saveCurrentScreen}
                  disabled={!screenName || isSaving}
                  className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-md disabled:bg-gray-400 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  {isSaving ? "儲存中..." : "儲存設定"}
                </button>
              </div>

              {/* 執行篩選按鈕 */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={executeScreening}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2 align-middle"></span>
                      篩選中...
                    </>
                  ) : (
                    "執行選股篩選"
                  )}
                </button>
              </div>
            </div>
          </Tab.Panel>

          {/* 已儲存篩選面板 */}
          <Tab.Panel>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                已儲存的篩選條件
              </h3>

              {savedScreens.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedScreens.map((screen) => (
                    <div
                      key={screen.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow cursor-pointer transition-all"
                      onClick={() => loadSavedScreen(screen)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {screen.name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            儲存於: {screen.date}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              // 實作分享功能
                            }}
                          >
                            <ShareIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-gray-400 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              // 實作刪除功能
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <TableCellsIcon className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-gray-500">您還沒有儲存任何篩選條件</p>
                  <p className="text-sm text-gray-500 mt-1">
                    在「自訂篩選」標籤中設定條件後可以儲存
                  </p>
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* 篩選結果 */}
      {(sortedResults.length > 0 || isLoading) && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 結果標題與摘要 */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">篩選結果</h3>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  共找到 {sortedResults.length} 檔符合條件的股票
                </span>

                {sortedResults.length > 0 && (
                  <div className="flex gap-2">
                    <button className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      匯出
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 結果表格 */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">
                  正在根據您的條件搜尋符合的股票...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  這可能需要幾秒鐘時間
                </p>
              </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={
                            selectedStocks.length === sortedResults.length &&
                            sortedResults.length > 0
                          }
                          onChange={() => {
                            if (
                              selectedStocks.length === sortedResults.length
                            ) {
                              setSelectedStocks([]);
                            } else {
                              setSelectedStocks(
                                sortedResults.map((stock) => stock.symbol)
                              );
                            }
                          }}
                        />
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                        追蹤
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("symbol")}
                      >
                        代號/名稱 <SortIcon field="symbol" />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("price")}
                      >
                        股價 <SortIcon field="price" />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("changePercent")}
                      >
                        漲跌幅 <SortIcon field="changePercent" />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("pe")}
                      >
                        本益比 <SortIcon field="pe" />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("pb")}
                      >
                        淨值比 <SortIcon field="pb" />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("dividend")}
                      >
                        殖利率 <SortIcon field="dividend" />
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("volume")}
                      >
                        成交量 <SortIcon field="volume" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        建議
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {displayResults.map((stock) => (
                      <tr
                        key={stock.symbol}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedStocks.includes(stock.symbol)}
                            onChange={() => handleSelectStock(stock.symbol)}
                          />
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <button
                            className={`${
                              validFavoriteStocks.includes(stock.symbol)
                                ? "text-yellow-500"
                                : "text-gray-300 hover:text-yellow-500"
                            }`}
                            onClick={() =>
                              toggleFavoriteStock &&
                              toggleFavoriteStock(stock.symbol)
                            }
                          >
                            {validFavoriteStocks.includes(stock.symbol) ? (
                              <StarIconSolid className="h-5 w-5" />
                            ) : (
                              <StarIcon className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {stock.symbol}
                            </div>
                            <div className="text-sm text-gray-500">
                              {stock.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stock.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-medium ${
                              stock.changePercent.startsWith("+")
                                ? "text-green-600"
                                : stock.changePercent.startsWith("-")
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {stock.changePercent}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stock.pe}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stock.pb}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {stock.dividend}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stock.volume}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              stock.recommendation === "買入"
                                ? "bg-green-100 text-green-800"
                                : stock.recommendation === "持有"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {stock.recommendation}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              title="圖表分析"
                            >
                              <ChartBarIcon className="h-5 w-5" />
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              title="查看詳情"
                            >
                              <DocumentTextIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 載入更多按鈕 */}
                {hasMoreResults && (
                  <div className="flex justify-center p-4">
                    <button
                      onClick={loadMoreResults}
                      className="px-4 py-2 bg-white text-blue-600 text-sm font-medium border border-gray-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      載入更多結果
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Screener;
