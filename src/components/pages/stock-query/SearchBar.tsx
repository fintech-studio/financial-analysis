import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// 常數與型別
export const MARKET_OPTIONS = [
  {
    value: "market_stock_tw",
    label: "台股",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "market_stock_us",
    label: "美股",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  {
    value: "market_etf",
    label: "ETF",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    value: "market_index",
    label: "指數",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    value: "market_forex",
    label: "外匯",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    value: "market_crypto",
    label: "加密貨幣",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    value: "market_futures",
    label: "期貨",
    color: "bg-pink-100 text-pink-700 border-pink-200",
  },
] as const;
export type MarketType = (typeof MARKET_OPTIONS)[number]["value"];

const POPULAR_STOCKS = [
  { symbol: "2330", name: "台積電", type: "上市", market: "market_stock_tw" },
  { symbol: "9950", name: "萬國通", type: "上櫃", market: "market_stock_tw" },
  { symbol: "AAPL", name: "Apple", type: "US", market: "market_stock_us" },
  { symbol: "TSLA", name: "Tesla", type: "US", market: "market_stock_us" },
  {
    symbol: "000001.SS",
    name: "上證綜合指數",
    type: "CN",
    market: "market_index",
  },
  {
    symbol: "^DJI",
    name: "道瓊工業指數",
    type: "US",
    market: "market_index",
  },
  {
    symbol: "^GSPC",
    name: "標普500指數",
    type: "US",
    market: "market_index",
  },
  {
    symbol: "^N225",
    name: "日經225指數",
    type: "JP",
    market: "market_index",
  },
  {
    symbol: "^TWII",
    name: "台灣加權指數",
    type: "TW",
    market: "market_index",
  },
  {
    symbol: "^TWOII",
    name: "台灣櫃買指數",
    type: "TWO",
    market: "market_index",
  },
  { symbol: "0050", name: "元大台灣50", type: "ETF", market: "market_etf" },
  {
    symbol: "00878",
    name: "國泰永續高股息",
    type: "ETF",
    market: "market_etf",
  },
  { symbol: "TWD=X", name: "美元/台幣", type: "外匯", market: "market_forex" },
  {
    symbol: "JPYTWD=X",
    name: "日圓/台幣",
    type: "外匯",
    market: "market_forex",
  },
  { symbol: "CL=F", name: "原油", type: "期貨", market: "market_futures" },
  { symbol: "GC=F", name: "黃金", type: "期貨", market: "market_futures" },
  {
    symbol: "BTC-USD",
    name: "比特幣",
    type: "Crypto",
    market: "market_crypto",
  },
  {
    symbol: "ETH-USD",
    name: "以太坊",
    type: "Crypto",
    market: "market_crypto",
  },
  {
    symbol: "SOL-USD",
    name: "索拉納",
    type: "Crypto",
    market: "market_crypto",
  },
] as const;

const CATEGORY_TO_MARKET_TYPE: Record<string, MarketType> = {
  market_stock_tw: "market_stock_tw",
  market_stock_us: "market_stock_us",
  market_etf: "market_etf",
  market_index: "market_index",
  market_forex: "market_forex",
  market_crypto: "market_crypto",
  market_futures: "market_futures",
  // 中文對應
  台股: "market_stock_tw",
  美股: "market_stock_us",
  ETF: "market_etf",
  指數: "market_index",
  外匯: "market_forex",
  加密貨幣: "market_crypto",
  期貨: "market_futures",
};

// 防抖 Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// 建議搜尋自訂 hook
function useMarketSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<MarketSuggestion[]>([]);
  const [fetching, setFetching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setFetching(true);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    fetch(`/api/market_data?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setSuggestions(Array.isArray(data) ? data.slice(0, 50) : []);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setSuggestions([]);
      })
      .finally(() => setFetching(false));
    return () => controller.abort();
  }, [query]);
  return { suggestions, fetching };
}

interface SearchBarProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
  timeframe: "1d" | "1h";
  onTimeframeChange: (timeframe: "1d" | "1h") => void;
  dataPeriod?: "YTD" | "1M" | "3M" | "6M" | "1Y" | "ALL";
  onDataPeriodChange?: (
    period: "YTD" | "1M" | "3M" | "6M" | "1Y" | "ALL"
  ) => void;
  loading?: boolean;
  market: MarketType;
  onMarketChange: (market: MarketType) => void;
  onSymbolAndMarketChange?: (symbol: string, market: MarketType) => void;
}

interface MarketSuggestion {
  market_category: string;
  symbol: string;
  name: string;
  market_type?: string | null;
}

const SearchBar: React.FC<SearchBarProps> = ({
  symbol,
  onSymbolChange,
  timeframe,
  onTimeframeChange,
  loading = false,
  market,
  onMarketChange,
  onSymbolAndMarketChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(symbol);
  const debouncedInputValue = useDebounce(inputValue, 300);
  const { suggestions, fetching } = useMarketSuggestions(debouncedInputValue);
  const marketOptions = useMemo(() => MARKET_OPTIONS, []);
  const hotStocks = useMemo(() => POPULAR_STOCKS, []);

  // 同步外部 symbol 變化
  useEffect(() => {
    setInputValue(symbol);
  }, [symbol]);

  // 查詢時自動根據 symbol 決定市場
  const handleSearch = useCallback(async () => {
    if (!inputValue.trim()) return;
    try {
      const res = await fetch(
        `/api/market_data?q=${encodeURIComponent(inputValue)}`
      );
      const data: MarketSuggestion[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        const mappedMarket = CATEGORY_TO_MARKET_TYPE[first.market_category];
        if (mappedMarket && mappedMarket !== market) {
          onMarketChange(mappedMarket);
        }
      }
    } catch {
      // ignore
    } finally {
      onSymbolChange(inputValue);
    }
  }, [inputValue, market, onMarketChange, onSymbolChange]);

  // 處理選擇建議
  const handleStockSelect = useCallback(
    (selectedSymbol: string, selectedMarketTypeOrCategory?: string) => {
      setInputValue(selectedSymbol);
      if (selectedMarketTypeOrCategory) {
        const mappedMarket =
          CATEGORY_TO_MARKET_TYPE[selectedMarketTypeOrCategory];
        if (mappedMarket && mappedMarket !== market) {
          onMarketChange(mappedMarket);
        }
      }
      onSymbolChange(selectedSymbol);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    },
    [market, onMarketChange, onSymbolChange]
  );

  // 處理輸入變化
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase();
      setInputValue(value);
      setShowSuggestions(!!value.trim());
      setSelectedSuggestionIndex(-1);
    },
    []
  );

  // 處理鍵盤事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) {
        if (e.key === "Enter") {
          e.preventDefault();
          if (!loading && inputValue.trim()) {
            handleSearch();
          }
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const s = suggestions[selectedSuggestionIndex];
          handleStockSelect(s.symbol, s.market_type as MarketType);
        } else if (!loading && inputValue.trim()) {
          onSymbolChange(inputValue);
          setShowSuggestions(false);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    },
    [
      showSuggestions,
      suggestions,
      selectedSuggestionIndex,
      loading,
      inputValue,
      handleSearch,
      handleStockSelect,
      onSymbolChange,
    ]
  );

  // 處理建議點擊
  const handleSuggestionClick = useCallback(
    (s: MarketSuggestion) => {
      const targetMarket = s.market_type || s.market_category;
      const mappedMarket =
        targetMarket && CATEGORY_TO_MARKET_TYPE[targetMarket];
      if (onSymbolAndMarketChange && mappedMarket) {
        onSymbolAndMarketChange(s.symbol, mappedMarket);
      } else {
        if (mappedMarket && mappedMarket !== market) {
          onMarketChange(mappedMarket);
        }
        onSymbolChange(s.symbol);
      }
      setInputValue(s.symbol);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    },
    [market, onMarketChange, onSymbolChange, onSymbolAndMarketChange]
  );

  // 處理 focus/blur
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (inputValue.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [inputValue, suggestions]);
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setTimeout(() => setShowSuggestions(false), 150);
  }, []);

  // 熱門股票按鈕 focus 時自動填入
  const handleHotStockMouseDown = useCallback((symbol: string) => {
    setInputValue(symbol);
  }, []);

  // 渲染 suggestion label
  const renderSuggestionLabel = useCallback(
    (s: MarketSuggestion) => (
      <span className="ml-2 px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded">
        {s.market_category}
        {s.market_type && (
          <>
            <span className="mx-1 text-gray-400">-</span>
            <span className="text-xs text-blue-700">
              {marketOptions.find((m) => m.value === s.market_type)?.label ||
                s.market_type}
            </span>
          </>
        )}
      </span>
    ),
    [marketOptions]
  );

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-4">
        {/* 上方區塊：搜尋列與選項 */}
        <div className="flex flex-col gap-6 xl:flex-row xl:gap-4 xl:items-end">
          {/* 股票搜尋 */}
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
              金融代號
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="輸入金融代號 (例: 2330, AAPL, 0050, CL=F)"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-900 focus:outline-none"
                disabled={loading}
                aria-autocomplete="list"
                aria-controls="stock-suggestions"
                aria-activedescendant={
                  selectedSuggestionIndex >= 0
                    ? `suggestion-${selectedSuggestionIndex}`
                    : undefined
                }
              />
              {(loading || fetching) && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <ArrowPathIcon className="w-5 h-5 text-gray-500 animate-spin" />
                </div>
              )}
              {/* 建議列表 */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                    id="stock-suggestions"
                    role="listbox"
                  >
                    {suggestions.map((s, index) => (
                      <button
                        key={s.symbol + (s.market_type || "")}
                        id={`suggestion-${index}`}
                        onClick={() => handleSuggestionClick(s)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          index === selectedSuggestionIndex ? "bg-gray-50" : ""
                        }`}
                        role="option"
                        aria-selected={index === selectedSuggestionIndex}
                      >
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          <span>{s.symbol}</span>
                          {renderSuggestionLabel(s)}
                        </div>
                        <div className="text-sm text-gray-500">{s.name}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {/* 市場選擇 */}
          <div className="max-w-[320px] flex flex-col items-start">
            <div className="flex flex-wrap w-full">
              {/* 將市場選項分成兩行，每行最多4個 */}
              <div className="flex w-full gap-2 mb-2">
                {marketOptions.slice(0, 4).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onMarketChange(opt.value as MarketType)}
                    className={`flex-1 flex items-center gap-1 px-3 py-1 rounded-md font-medium text-sm border transition-all duration-150
                    ${
                      market === opt.value
                        ? `${opt.color} shadow`
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }
                  `}
                    disabled={loading}
                    aria-pressed={market === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex w-full gap-2">
                {marketOptions.slice(4).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onMarketChange(opt.value as MarketType)}
                    className={`flex-1 flex items-center gap-1 px-3 py-1 rounded-md font-medium text-sm border transition-all duration-150
                    ${
                      market === opt.value
                        ? `${opt.color} shadow`
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    }
                  `}
                    disabled={loading}
                    aria-pressed={market === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* 時間週期 */}
          <div className="min-w-[140px] flex flex-col items-start">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              時間週期
            </label>
            <div className="flex bg-gray-100 p-1 rounded-md w-full">
              {[
                { value: "1d", label: "日線" },
                { value: "1h", label: "小時線" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onTimeframeChange(option.value as "1d" | "1h")}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-all duration-200 ${
                    timeframe === option.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {/* 查詢按鈕 */}
          <div className="w-[120px] flex flex-col items-end justify-end">
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              onClick={handleSearch}
              disabled={loading || !inputValue.trim()}
              className="px-4 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium w-full"
              type="button"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  查詢中
                </div>
              ) : (
                "查詢"
              )}
            </motion.button>
          </div>
        </div>
        {/* 熱門股票區塊 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3 flex items-center">
            <SparklesIcon className="w-4 h-4 mr-1" />
            熱門股票
          </p>
          <div className="flex flex-wrap gap-2">
            {hotStocks.map((stock) => (
              <motion.button
                key={stock.symbol}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseDown={() => handleHotStockMouseDown(stock.symbol)}
                onClick={() =>
                  handleStockSelect(stock.symbol, stock.market as MarketType)
                }
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center gap-1"
                type="button"
              >
                <span className="font-medium">{stock.symbol}</span>
                <span className="text-gray-500">{stock.name}</span>
                <span className="px-1 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                  {stock.type}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
