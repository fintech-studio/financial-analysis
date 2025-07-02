import React, { useState, useEffect } from "react";
import { useStockData } from "@/hooks/useStockData";
import type { MarketType } from "./SearchBar";
import {
  ViewfinderCircleIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

interface KLinePatternProps {
  symbol: string;
  timeframe: "1d" | "1h";
  market: MarketType;
}

const KLinePattern: React.FC<KLinePatternProps> = ({
  symbol,
  timeframe,
  market,
}) => {
  const { data, loading, error } = useStockData(symbol, timeframe, market);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  // 解析型態與 latest 必須在 hooks 之上
  const latest = data && data.length > 0 ? data[0] : null;
  const patterns = latest
    ? (latest.pattern_signals || "")
        .split(/[,，]/)
        .map((p: string) => p.trim())
        .filter(Boolean)
    : [];

  // 預設選中第一個型態
  useEffect(() => {
    if (patterns.length > 0 && !selectedPattern) {
      setSelectedPattern(patterns[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patterns]);

  // 輔助：格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const hour = String(date.getUTCHours()).padStart(2, "0");
      const minute = String(date.getUTCMinutes()).padStart(2, "0");
      const second = String(date.getUTCSeconds()).padStart(2, "0");
      return timeframe === "1h"
        ? `${year}-${month}-${day} ${hour}:${minute}:${second}`
        : `${year}-${month}-${day}`;
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mt-4">
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 bg-gray-300 rounded"></div>
            <div className="h-6 w-32 bg-gray-300 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-4">
        <div className="flex items-center gap-2 text-red-600">
          <ExclamationTriangleIcon className="h-6 w-6" />
          <span className="font-medium">載入錯誤</span>
        </div>
        <p className="text-red-500 mt-2">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-4">
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">查無 K 線形態資料</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mt-4 hover:shadow-xl transition-shadow duration-300">
      {/* 標題區域 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gray-500 p-2 rounded-lg">
            <ViewfinderCircleIcon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 pt-2">K 線形態分析</h3>
          {patterns.length !== 0 ? (
            <span className="text-sm text-gray-500">
              已辨識出的型態：{patterns.length} 種
            </span>
          ) : null}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">型態辨識</div>
          <div className="text-sm font-medium text-gray-700">
            {symbol} · {timeframe === "1d" ? "日線" : "小時線"}
          </div>
        </div>
      </div>

      {/* 主要內容區塊重新排版 */}
      {patterns.length === 0 ? (
        <div className="text-center py-8">
          <ViewfinderCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">目前未辨識到明顯的 K 線形態</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* 上方型態橫向按鈕列 */}
          <div className="flex flex-wrap gap-3 justify-center">
            {patterns.map((pattern: string, idx: number) => (
              <button
                key={pattern + idx}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 focus:outline-none ${
                  selectedPattern === pattern
                    ? "bg-gray-500 text-white border-gray-500 shadow"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedPattern(pattern)}
                type="button"
              >
                {pattern}
              </button>
            ))}
          </div>

          {/* 下方說明區塊 */}
          <div className="bg-gray-50 rounded-lg p-6 min-h-[80px] text-center">
            <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center justify-center gap-2">
              {selectedPattern}
            </h4>
            <div className="text-gray-700 leading-relaxed">
              {selectedPattern
                ? patternDescriptions[selectedPattern] || "此形態暫無詳細說明。"
                : "請點選上方型態以查看說明"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 常見型態說明，可自行擴充
const patternDescriptions: Record<string, string> = {
  兩隻烏鴉:
    "兩隻烏鴉是一種看跌反轉形態，通常出現在上升趨勢中。它由兩根連續的陰線組成，且第二根陰線的收盤價低於第一根陰線的收盤價。",
  三芝烏鴉:
    "三芝烏鴉是一種強烈的看跌反轉形態，由三根連續的陰線組成。每根陰線的收盤價都低於前一根，顯示出賣壓持續增加。",
  南方三星:
    "南方三星是一種看漲反轉形態，通常出現在下跌趨勢中。它由三根連續的陽線組成，且每根陽線的收盤價都高於前一根，顯示出買壓持續增加。",
  三白兵:
    "三白兵是一種看漲反轉形態，由三根連續的陽線組成。每根陽線的收盤價都高於前一根，顯示出買壓持續增加。",
  大敵當前:
    "大敵當前是一種看跌反轉形態，通常出現在上升趨勢中。它由一根長陰線和兩根較短的陽線組成，顯示出賣壓強勁。",
  捉腰帶線:
    "捉腰帶線是一種看漲反轉形態，通常出現在下跌趨勢中。它由一根長陽線和一根較短的陰線組成，顯示出買壓強勁。",
  脫離: "脫離是一種看漲反轉形態，通常出現在下跌趨勢中。它由一根長陽線和一根較短的陰線組成，顯示出買壓強勁。",
  藏嬰吞沒:
    "藏嬰吞沒是一種看漲反轉形態，通常出現在下跌趨勢中。它由一根較小的陰線被一根較大的陽線完全吞沒，顯示出買壓強勁。",
  反擊線:
    "反擊線是一種看漲反轉形態，通常出現在下跌趨勢中。它由一根長陽線和一根較短的陰線組成，顯示出買壓強勁。",
  烏雲蓋頂:
    "烏雲蓋頂是一種看跌反轉形態，通常出現在上升趨勢中。它由一根長陰線和一根較短的陽線組成，顯示出賣壓強勁。",
  十字: "十字是一種中性形態，通常出現在趨勢轉折點。它的開盤價和收盤價幾乎相同，顯示出市場猶豫不決。",
  十字星:
    "十字星是一種中性形態，通常出現在趨勢轉折點。它的開盤價和收盤價幾乎相同，顯示出市場猶豫不決。",
  蜻蜓十字:
    "蜻蜓十字是一種看漲反轉形態，通常出現在下跌趨勢中。它的開盤價和收盤價幾乎相同，且下影線較長，顯示出買壓強勁。",
  十字暮星:
    "十字暮星是一種看跌反轉形態，通常出現在上升趨勢中。它的開盤價和收盤價幾乎相同，顯示出賣壓強勁。",
  暮星: "暮星是一種看跌反轉形態，通常出現在上升趨勢中。它的開盤價和收盤價幾乎相同，顯示出賣壓強勁。",
  缺口上漲:
    "缺口上漲是一種看漲形態，通常出現在上升趨勢中。它由一根長陽線和一根較短的陰線組成，顯示出買壓強勁。",
  墓碑十字:
    "墓碑十字是一種看跌反轉形態，通常出現在上升趨勢中。它的開盤價和收盤價幾乎相同，顯示出賣壓強勁。",
  錘頭: "錘頭是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  上吊線:
    "上吊線是一種看跌反轉形態，通常出現在上升趨勢中。它的下影線較長，顯示出賣壓強勁。",
  孕線: "孕線是一種看漲反轉形態，通常出現在下跌趨勢中。它由一根較小的陰線被一根較大的陽線完全包圍，顯示出買壓強勁。",
  十字孕線:
    "十字孕線是一種看漲反轉形態，通常出現在下跌趨勢中。它的開盤價和收盤價幾乎相同，顯示出市場猶豫不決。",
  風高浪大線:
    "風高浪大線是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  "Hikkake 陷阱":
    "Hikkake 陷阱是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  "Hikkake Modified":
    "Hikkake Modified 是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  家鴿: "家鴿是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  三胞胎烏鴉:
    "三胞胎烏鴉是一種看跌反轉形態，通常出現在上升趨勢中。它由三根連續的陰線組成，顯示出賣壓持續增加。",
  頸內線:
    "頸內線是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  倒錘頭:
    "倒錘頭是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  反沖形態:
    "反沖形態是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  "反沖-長短判斷":
    "反沖-長短判斷是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  梯形底部:
    "梯形底部是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  長腿十字:
    "長腿十字是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  長蠟燭:
    "長蠟燭是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  匹配低點:
    "匹配低點是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  鋪墊: "鋪墊是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  十字晨星:
    "十字晨星是一種看漲反轉形態，通常出現在下跌趨勢中。它由一根十字線和兩根陽線組成，顯示出買壓強勁。",
  晨星: "晨星是一種看漲反轉形態，通常出現在下跌趨勢中。它由一根陰線、一根小實體的十字線和一根陽線組成，顯示出買壓強勁。",
  頸上線:
    "頸上線是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  刺穿形態:
    "刺穿形態是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  黃包車夫:
    "黃包車夫是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  分離線:
    "分離線是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  射擊星:
    "射擊星是一種看跌反轉形態，通常出現在上升趨勢中。它的上影線較長，顯示出賣壓強勁。",
  短蠟燭:
    "短蠟燭是一種中性形態，通常出現在趨勢轉折點。它的實體較小，顯示出市場猶豫不決。",
  紡錘線:
    "紡錘線是一種中性形態，通常出現在趨勢轉折點。它的上影線和下影線較長，顯示出市場猶豫不決。",
  停滯形態:
    "停滯形態是一種中性形態，通常出現在趨勢轉折點。它的實體較小，顯示出市場猶豫不決。",
  三明治:
    "三明治是一種中性形態，通常出現在趨勢轉折點。它由一根長實體的陽線、一根小實體的陰線和一根長實體的陽線組成，顯示出市場猶豫不決。",
  探水竿:
    "探水竿是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  跳空並列月缺:
    "跳空並列月缺是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  向上突破:
    "向上突破是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  三星: "三星是一種看漲反轉形態，通常出現在下跌趨勢中。它由三根連續的陽線組成，顯示出買壓持續增加。",
  奇特三河床:
    "奇特三河床是一種看漲反轉形態，通常出現在下跌趨勢中。它由一根長陽線和兩根較短的陰線組成，顯示出買壓強勁。",
  向上跳空兩隻烏鴉:
    "向上跳空兩隻烏鴉是一種看跌反轉形態，通常出現在上升趨勢中。它由兩根連續的陰線組成，且第二根陰線的收盤價高於第一根陰線的開盤價。",
  光頭: "光頭是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  光腳: "光腳是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  上漲光頭光腳:
    "上漲光頭光腳是一種看漲反轉形態，通常出現在下跌趨勢中。它的下影線較長，顯示出買壓強勁。",
  下跌光頭光腳:
    "下跌光頭光腳是一種看跌反轉形態，通常出現在上升趨勢中。它的上影線較長，顯示出賣壓強勁。",
  三內部上漲:
    "三內部上漲是一種看漲反轉形態，通常出現在下跌趨勢中。它由三根連續的陽線組成，顯示出買壓持續增加。",
  三內部下跌:
    "三內部下跌是一種看跌反轉形態，通常出現在上升趨勢中。它由三根連續的陰線組成，顯示出賣壓持續增加。",
  三線打擊上漲:
    "三線打擊上漲是一種看漲反轉形態，通常出現在下跌趨勢中。它由三根連續的陽線組成，顯示出買壓持續增加。",
  三線打擊下跌:
    "三線打擊下跌是一種看跌反轉形態，通常出現在上升趨勢中。它由三根連續的陰線組成，顯示出賣壓持續增加。",
  三外部上漲:
    "三外部上漲是一種看漲反轉形態，通常出現在下跌趨勢中。它由三根連續的陽線組成，顯示出買壓持續增加。",
  三外部下跌:
    "三外部下跌是一種看跌反轉形態，通常出現在上升趨勢中。它由三根連續的陰線組成，顯示出賣壓持續增加。",
  棄嬰上漲:
    "棄嬰上漲是一種看漲反轉形態，通常出現在下跌趨勢中。它由一根長陽線和兩根較短的陰線組成，顯示出買壓強勁。",
  棄嬰下跌:
    "棄嬰下跌是一種看跌反轉形態，通常出現在上升趨勢中。它由一根長陰線和兩根較短的陽線組成，顯示出賣壓強勁。",
  上升三法:
    "上升三法是一種看漲形態，通常出現在上升趨勢中。它由三根連續的陽線組成，顯示出買壓持續增加。",
  下降三法:
    "下降三法是一種看跌形態，通常出現在下降趨勢中。它由三根連續的陰線組成，顯示出賣壓持續增加。",
  上升跳空三法:
    "上升跳空三法是一種看漲形態，通常出現在上升趨勢中。它由三根連續的陽線組成，顯示出買壓持續增加。",
  下降跳空三法:
    "下降跳空三法是一種看跌形態，通常出現在下降趨勢中。它由三根連續的陰線組成，顯示出賣壓持續增加。",
  多頭吞沒:
    "多頭吞沒是一種看漲反轉形態，通常出現在下跌趨勢中。它由一根較小的陰線被一根較大的陽線完全吞沒，顯示出買壓強勁。",
  空頭吞沒:
    "空頭吞沒是一種看跌反轉形態，通常出現在上升趨勢中。它由一根較小的陽線被一根較大的陰線完全吞沒，顯示出賣壓強勁。",
};

export default KLinePattern;
