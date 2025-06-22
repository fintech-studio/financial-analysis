import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

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
  onSearch: () => void;
}

const POPULAR_STOCKS = [
  { symbol: "2330", name: "台積電", type: "TW" },
  { symbol: "2454", name: "聯發科", type: "TW" },
  { symbol: "2317", name: "鴻海", type: "TW" },
  { symbol: "0050", name: "元大台灣50", type: "TW" },
  { symbol: "AAPL", name: "Apple", type: "US" },
  { symbol: "TSLA", name: "Tesla", type: "US" },
  { symbol: "NVDA", name: "NVIDIA", type: "US" },
  { symbol: "MSFT", name: "Microsoft", type: "US" },
];

// 防抖 Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const SearchBar: React.FC<SearchBarProps> = ({
  symbol,
  onSymbolChange,
  timeframe,
  onTimeframeChange,
  loading = false,
  onSearch,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(symbol);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 使用防抖來優化搜尋體驗
  const debouncedInputValue = useDebounce(inputValue, 300);

  // 過濾熱門股票
  const filteredStocks = useMemo(() => {
    if (!debouncedInputValue.trim()) return [];
    return POPULAR_STOCKS.filter(
      (stock) =>
        stock.symbol
          .toLowerCase()
          .includes(debouncedInputValue.toLowerCase()) ||
        stock.name.toLowerCase().includes(debouncedInputValue.toLowerCase())
    );
  }, [debouncedInputValue]);

  // 同步外部 symbol 變化
  useEffect(() => {
    setInputValue(symbol);
  }, [symbol]);

  // 處理選擇建議
  function handleStockSelect(selectedSymbol: string) {
    setInputValue(selectedSymbol);
    onSymbolChange(selectedSymbol);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  }

  // 處理輸入變化
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toUpperCase();
    setInputValue(value);
    setShowSuggestions(!!value.trim());
    setSelectedSuggestionIndex(-1);
  }

  // 處理鍵盤事件
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || filteredStocks.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!loading && inputValue.trim()) {
          onSymbolChange(inputValue);
          onSearch();
        }
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < filteredStocks.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : filteredStocks.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0) {
        handleStockSelect(filteredStocks[selectedSuggestionIndex].symbol);
      } else if (!loading && inputValue.trim()) {
        onSymbolChange(inputValue);
        onSearch();
        setShowSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }

  // 處理建議點擊
  function handleSuggestionClick(symbol: string) {
    handleStockSelect(symbol);
  }

  // 處理 focus/blur
  function handleFocus() {
    setIsFocused(true);
    if (inputValue.trim() && filteredStocks.length > 0) {
      setShowSuggestions(true);
    }
  }
  function handleBlur() {
    setIsFocused(false);
    setTimeout(() => setShowSuggestions(false), 150);
  }

  // 熱門股票按鈕 focus 時自動填入
  function handleHotStockMouseDown(symbol: string) {
    setInputValue(symbol);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col xl:flex-row gap-4 items-end">
          {/* 股票搜尋 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
              股票代號
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="輸入股票代號 (例: 2330, AAPL)"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                disabled={loading}
                aria-autocomplete="list"
                aria-controls="stock-suggestions"
                aria-activedescendant={
                  selectedSuggestionIndex >= 0
                    ? `suggestion-${selectedSuggestionIndex}`
                    : undefined
                }
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <ArrowPathIcon className="w-5 h-5 text-gray-500 animate-spin" />
                </div>
              )}
            </div>
            {/* 建議列表 */}
            <AnimatePresence>
              {showSuggestions && filteredStocks.length > 0 && (
                <motion.div
                  ref={suggestionsRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
                  id="stock-suggestions"
                  role="listbox"
                >
                  {filteredStocks.map((stock, index) => (
                    <button
                      key={stock.symbol}
                      id={`suggestion-${index}`}
                      onClick={() => handleSuggestionClick(stock.symbol)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        index === selectedSuggestionIndex ? "bg-gray-50" : ""
                      }`}
                      role="option"
                      aria-selected={index === selectedSuggestionIndex}
                    >
                      <div className="font-medium text-gray-900">
                        {stock.symbol}
                        <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {stock.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{stock.name}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* 時間週期 */}
          <div className="min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              時間週期
            </label>
            <div className="flex bg-gray-100 p-1 rounded-md">
              {[
                { value: "1d", label: "日線" },
                { value: "1h", label: "小時" },
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
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            onClick={() => {
              onSymbolChange(inputValue);
              onSearch();
            }}
            disabled={loading || !inputValue.trim()}
            className="px-8 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium min-w-[100px]"
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
        {/* 熱門股票 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3 flex items-center">
            <SparklesIcon className="w-4 h-4 mr-1" />
            熱門股票
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_STOCKS.map((stock) => (
              <motion.button
                key={stock.symbol}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseDown={() => handleHotStockMouseDown(stock.symbol)}
                onClick={() => handleStockSelect(stock.symbol)}
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
