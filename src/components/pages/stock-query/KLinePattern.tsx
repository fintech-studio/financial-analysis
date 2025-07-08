import React, { useState, useEffect, useMemo, memo } from "react";
import type { MarketType } from "./SearchBar";
import {
  ViewfinderCircleIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";

interface KLinePatternData {
  pattern_signals?: string;
  // 你可以根據實際資料結構擴充更多欄位
  [key: string]: unknown;
}

interface KLinePatternProps {
  data: KLinePatternData[];
  loading: boolean;
  error: string | null;
  symbol: string;
  timeframe: "1d" | "1h";
  market: MarketType;
}

// 單一型態卡片，memo 避免不必要重渲染
const PatternCard = memo(
  ({
    pattern,
    description,
    englishName,
    imageUrl,
    zoomPattern,
    setZoomPattern,
  }: {
    pattern: string;
    description: string;
    englishName?: string;
    imageUrl: string;
    zoomPattern: string | null;
    setZoomPattern: (p: string | null) => void;
  }) => {
    const [imgError, setImgError] = useState(false);
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-row items-center transition-shadow duration-300 hover:shadow-xl min-h-[140px]">
        {/* 文字區塊 */}
        <div className="flex-1 flex flex-col justify-center pr-4">
          <span className="text-xl font-bold text-gray-800 mb-1">
            {pattern}
          </span>
          {englishName && (
            <span className="text-xs text-gray-500 mb-2">{englishName}</span>
          )}
          <div className="text-gray-700 text-sm leading-relaxed min-h-[48px]">
            {description || "此形態暫無詳細說明。"}
          </div>
        </div>
        {/* 圖片區塊 */}
        <div className="flex-shrink-0 flex items-center justify-center w-28 h-28 relative">
          {!imgError ? (
            <Image
              src={imageUrl}
              alt={pattern + " 圖例"}
              width={96}
              height={96}
              className="max-h-24 max-w-24 object-contain rounded-lg shadow border border-gray-200 bg-white cursor-zoom-in"
              style={{ display: "block" }}
              onClick={() => setZoomPattern(pattern)}
              onError={() => setImgError(true)}
            />
          ) : (
            <ViewfinderCircleIcon className="h-16 w-16 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
          {/* 放大圖浮層 */}
          {zoomPattern === pattern && (
            <div
              className="pattern-zoom-popover absolute z-40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 rounded-xl shadow-2xl border-4 border-white flex items-center justify-center cursor-zoom-out"
              style={{
                minWidth: "200px",
                minHeight: "200px",
                maxWidth: "320px",
                maxHeight: "320px",
              }}
              onClick={() => setZoomPattern(null)}
            >
              <Image
                src={imageUrl}
                alt={pattern + " 放大圖例"}
                width={288}
                height={288}
                className="max-h-72 max-w-72 object-contain rounded-xl"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);
PatternCard.displayName = "PatternCard";

const KLinePattern: React.FC<KLinePatternProps> = ({
  data,
  loading,
  error,
  symbol,
  timeframe,
}) => {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [zoomPattern, setZoomPattern] = useState<string | null>(null);

  // 用 useMemo 優化資料計算
  const latest = useMemo(
    () => (data && data.length > 0 ? data[0] : null),
    [data]
  );
  const patterns = useMemo(
    () =>
      latest
        ? (latest.pattern_signals || "")
            .split(/[,，]/)
            .map((p: string) => p.trim())
            .filter(Boolean)
        : [],
    [latest]
  );

  useEffect(() => {
    if (patterns.length > 0 && !selectedPattern) {
      setSelectedPattern(patterns[0]);
    }
  }, [patterns]);

  // 取得型態對應圖片路徑
  const getPatternImageUrl = (pattern: string) => {
    const fileName = pattern.replace(/\s+/g, "");
    return `/kline-patterns/${fileName}.png`;
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
      {/* 主要內容區塊卡片式排版 */}
      {patterns.length === 0 ? (
        <div className="text-center py-8">
          <ViewfinderCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">目前未辨識到明顯的 K 線形態</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patterns.map((pattern: string, idx: number) => (
            <PatternCard
              key={pattern + idx}
              pattern={pattern}
              description={patternDescriptions[pattern] || ""}
              englishName={patternEnglishNames[pattern]}
              imageUrl={getPatternImageUrl(pattern)}
              zoomPattern={zoomPattern}
              setZoomPattern={setZoomPattern}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 常見型態說明，可自行擴充
const patternDescriptions: Record<string, string> = {
  兩隻烏鴉:
    "第一天長陽，第二天高開收陰，第三天再次高開繼續收陰，收盤比前一日收盤價低，預示股價下跌。",
  三隻烏鴉:
    "連續三根陰線，每日收盤價都下跌且接近最低價，每日開盤價都在上根K線實體內，預示股價下跌。",
  南方三星:
    "三日K線皆陰，第一日有長下影線，第二日K線整體小於第一日，第三日無下影線實體信號，成交價格都在第一日振幅之內，預示下跌趨勢反轉，股價上升。",
  三白兵:
    "三日K線皆陽，每日收盤價變高且接近最高價，開盤價在前一日實體上半部，預示股價上升。",
  大敵當前:
    "三日都收陽，每日收盤價都比前一日高，開盤價都在前一日實體以內，實體變短，上影線變長。",
  捉腰帶線:
    "下跌趨勢中，第一日陰線，第二日開盤價為最低價，陽線，收盤價接近最高價，預示價格上漲。",
  脫離: "以看漲脫離為例，下跌趨勢中，第一日長陰線，第二日跳空陰線，延續趨勢開始震盪，第五日長陽線，收盤價在第一天收盤價與第二天開盤價之間，預示價格上漲。",
  藏嬰吞沒:
    "下跌趨勢中，前兩日陰線無影線，第二日開盤、收盤價皆低於第二日，第三日倒錘頭，第四日開盤價高於前一日最高價，收盤價低於前一日最低價，預示著底部反轉。",
  反擊線: "二日K線模式，與分離線類似。",
  烏雲蓋頂:
    "第一日長陽，第二日開盤價高於前一日最高價，收盤價處於前一日實體中部以下，預示著股價下跌。",
  十字: "開盤價與收盤價基本相同。",
  十字星: "開盤價與收盤價基本相同，上下影線不會很長，預示著當前趨勢反轉。",
  蜻蜓十字: "開盤後價格一路走低，之後收復，收盤價與開盤價相同，預示趨勢反轉。",
  十字暮星: "基本模式為暮星，第二日收盤價和開盤價相同，預示頂部反轉。",
  暮星: "與晨星相反，上升趨勢中,第一日陽線，第二日價格振幅較小，第三日陰線，預示頂部反轉。",
  缺口上漲:
    "上升趨勢向上跳空，下跌趨勢向下跳空,第一日與第二日有相同開盤價，實體長度差不多，則趨勢持續。",
  墓碑十字: "開盤價與收盤價相同，上影線長，無下影線，預示底部反轉。",
  錘頭: "實體較短，無上影線，下影線大於實體長度兩倍，處於下跌趨勢底部，預示反轉",
  上吊線: "形狀與錘子類似，處於上升趨勢的頂部，預示著趨勢反轉。",
  孕線: "分多頭孕線與空頭孕線，兩者相反，以多頭孕線為例，在下跌趨勢中，第一日K線長陰，第二日開盤價收盤價在第一日價格振幅之內，為陽線，預示趨勢反轉，股價上升。",
  十字孕線: "與孕線類似，若第二日K線是十字線，便稱為十字孕線，預示著趨勢反轉。",
  風高浪大線: "具有極長的上/下影線與短的實體，預示著趨勢反轉。",
  "Hikkake 陷阱":
    "與孕線類似，第二日價格在前一日實體範圍內,第三日收盤價高於前兩日，反轉失敗，趨勢繼續。",
  "Hikkake Modified":
    "與Hikkake陷阱類似，上升趨勢中，第三日跳空高開；下跌趨勢中，第三日跳空低開，反轉失敗，趨勢繼續。",
  家鴿: "與孕線類似，不同的的是二日K線顏色相同，第二日最高價、最低價都在第一日實體之內，預示著趨勢反轉。",
  三胞胎烏鴉:
    "上漲趨勢中，三日都為陰線，長度大致相等，每日開盤價等於前一日收盤價，收盤價接近當日最低價，預示價格下跌。",
  頸內線:
    "下跌趨勢中，第一日長陰線，第二日開盤價較低，收盤價略高於第一日收盤價，陽線，實體較短，預示著下跌繼續。",
  倒錘頭:
    "上影線較長，長度為實體2倍以上，無下影線，在下跌趨勢底部，預示著趨勢反轉。",
  反沖形態: "與分離線類似，兩日K線為禿線，顏色相反，存在跳空缺口。",
  "反沖-長短判斷": "與反沖形態類似，較長缺影線決定價格的漲跌。",
  梯形底部:
    "下跌趨勢中，前三日陰線，開盤價與收盤價皆低於前一日開盤、收盤價，第四日倒錘頭，第五日開盤價高於前一日開盤價，陽線，收盤價高於前幾日價格振幅，預示著底部反轉。",
  長腿十字: "開盤價與收盤價相同居當日價格中部，上下影線長，表達市場不確定性。",
  長蠟燭: "K線實體長，無上下影線。",
  匹配低點:
    "下跌趨勢中，第一日長陰線，第二日陰線，收盤價與前一日相同，預示底部確認，該價格為支撐位。",
  鋪墊: "上漲趨勢中，第一日陽線，第二日跳空高開影線，第三、四日短實體影線，第五日陽線，收盤價高於前四日，預示趨勢持續。",
  十字晨星: "基本模式為晨星，第二日K線為十字星，預示底部反轉。",
  晨星: "下跌趨勢，第一日陰線，第二日價格振幅較小，第三天陽線，預示底部反轉。",
  頸上線:
    "下跌趨勢中，第一日長陰線，第二日開盤價較低，收盤價與前一日最低價相同，陽線，實體較短，預示著延續下跌趨勢。",
  刺穿形態:
    "下跌趨勢中，第一日陰線，第二日收盤價低於前一日最低價，收盤價處在第一日實體上部，預示著底部反轉。",
  黃包車夫: "與長腿十字線類似，若實體正好處於價格振幅中點，稱為黃包車夫。",
  分離線:
    "上漲趨勢中，第一日陰線，第二日陽線，第二日開盤價與第一日相同且為最低價，預示著趨勢繼續。",
  射擊星: "上影線至少為實體長度兩倍，沒有下影線，預示著股價下跌。",
  短蠟燭: "實體短，無上下影線",
  紡錘線: "實體小",
  停滯形態:
    "上漲趨勢中，第二日長陽線，第三日開盤於前一日收盤價附近，短陽線，預示著上漲結束。",
  三明治:
    "第一日長陰線，第二日陽線，開盤價高於前一日收盤價，第三日開盤價高於前兩日最高價，收盤價於第一日收盤價相同。",
  探水竿: "大致與蜻蜓十字相同，下影線長度長。",
  跳空並列月缺:
    "分上漲和下跌，以上升為例，前兩日陽線，第二日跳空，第三日陰線，收盤價於缺口中，上升趨勢持續。",
  向上突破:
    "與頸上線類似，下跌趨勢中，第一日長陰線，第二日開盤價跳空，收盤價略低於前一日實體中部，與頸上線相比實體較長，預示著趨勢持續。",
  三星: "由三個十字組成，第二日十字必須高於或者低於第一日和第三日，預示著反轉。",
  奇特三河床:
    "下跌趨勢中，第一日長陰線，第二日為錘頭，最低價創新低，第三日開盤價低於第二日收盤價，收陽線，收盤價不高於第二日收盤價，預示著反轉，第二日下影線越長可能性越大。",
  向上跳空兩隻烏鴉:
    "第一日陽線，第二日跳空以高於第一日最高價開盤，收陰線，第三日開盤價高於第二日，收陰線，與第一日比仍有缺口。",
  光頭: "最低價低於開盤價，收盤價等於最高價，預示著趨勢持續。",
  光腳: "最高價高於開盤價，收盤價等於最低價，預示著趨勢持續。",
  上漲光頭光腳:
    "上下兩頭都沒有影線的實體，陽線預示著牛市持續或者熊市反轉，陰線相反。",
  下跌光頭光腳:
    "上下兩頭都沒有影線的實體，陰線預示著熊市持續或者牛市反轉，陽線相反。",
  三內部上漲:
    "三日K線模式，母子信號+長K線，以三內部上漲為例，K線為陰陽陽，第三天收盤價高於第一天開盤價，第二天K線在第一天K線內部，預示著股價上漲。",
  三內部下跌:
    "三日K線模式，母子信號+長K線，以三內部下跌為例，K線為陽陰陰，第三天收盤價低於第一天開盤價，第二天K線在第一天K線內部，預示著股價下跌。",
  三線打擊上漲:
    "四日K線模式，前三根陽線，每日收盤價都比前一日高，開盤價在前一日實體內，第四日市場高開，收盤價低於第一日開盤價，預示股價下跌。",
  三線打擊下跌:
    "四日K線模式，前三根陰線，每日收盤價都比前一日低，開盤價在前一日實體內，第四日市場低開，收盤價高於第一日開盤價，預示股價上漲。",
  三外部上漲:
    "三日K線模式，與三內部上漲和下跌類似，K線為陰陽陽，但第一日與第二日的K線形態相反，以三外部上漲為例，第一日K線在第二日K線內部，預示著股價上漲。",
  三外部下跌:
    "三日K線模式，與三內部上漲和下跌類似，K線為陽陰陰，但第一日與第二日的K線形態相反，以三外部下跌為例，第一日K線在第二日K線內部，預示著股價下跌。",
  棄嬰上漲:
    "第二日價格跳空且收十字星（開盤價與收盤價接近，最高價最低價相差不大），預示趨勢反轉，發生在頂部下跌，底部上漲。",
  棄嬰下跌:
    "第二日價格跳空且收十字星（開盤價與收盤價接近，最高價最低價相差不大），預示趨勢反轉，發生在頂部上漲，底部下跌。",
  上升三法:
    "上漲趨勢中，第一日長陽線，中間三日價格在第一日範圍內小幅震盪，第五日長陽線，收盤價高於第一日收盤價，預示股價上升。",
  下降三法:
    "下跌趨勢中，第一日長陰線，中間三日價格在第一日範圍內小幅震盪，第五日長陰線，收盤價低於第一日收盤價，預示股價下跌。",
  上升跳空三法:
    "上漲趨勢中，第一日長陽線，第二日短陽線，第三日跳空陽線，第四日陰線，開盤價與收盤價於前兩日實體內，第五日長陽線，收盤價高於第一日收盤價，預示股價上升。",
  下降跳空三法:
    "下跌趨勢中，第一日長陰線，第二日短陰線，第三日跳空陰線，第四日陽線，開盤價與收盤價於前兩日實體內，第五日長陰線，收盤價低於第一日收盤價，預示股價下跌。",
  多頭吞沒:
    "第一日為陰線，第二日陽線，第一日的開盤價和收盤價在第二日開盤價收盤價之內，但不能完全相同。",
  空頭吞沒:
    "第一日為陽線，第二日陰線，第一日的開盤價和收盤價在第二日開盤價收盤價之內，但不能完全相同。",
};

// 常見型態英文名稱對照，可自行擴充
const patternEnglishNames: Record<string, string> = {
  兩隻烏鴉: "Two Crows",
  三隻烏鴉: "Three Black Crows",
  南方三星: "Three Stars in the South",
  三白兵: "Three White Soldiers",
  大敵當前: "Advance Block",
  捉腰帶線: "Belt Hold",
  脫離: "Breakaway",
  藏嬰吞沒: "Concealing Baby Swallow",
  反擊線: "Counterattack",
  烏雲蓋頂: "Dark Cloud Cover",
  十字: "Doji",
  十字星: "Doji Star",
  蜻蜓十字: "Dragonfly Doji",
  十字暮星: "Evening Doji Star",
  暮星: "Evening Star",
  缺口上漲: "Up-Gap Side-by-Side White Lines",
  墓碑十字: "Gravestone Doji",
  錘頭: "Hammer",
  上吊線: "Hanging Man",
  孕線: "Harami",
  十字孕線: "Harami Cross",
  風高浪大線: "High Wave Candle",
  "Hikkake 陷阱": "Hikkake",
  "Hikkake Modified": "Hikkake Modified",
  家鴿: "Homing Pigeon",
  三胞胎烏鴉: "Identical Three Crows",
  頸內線: "In-Neck Pattern",
  倒錘頭: "Inverted Hammer",
  反沖形態: "Kicking",
  "反沖-長短判斷": "Kicking - Bull/Bear Determined by the Longer Marubozu",
  梯形底部: "Ladder Bottom",
  長腿十字: "Long-Legged Doji",
  長蠟燭: "Long Line Candle",
  匹配低點: "Matching Low",
  鋪墊: "Mat Hold",
  十字晨星: "Morning Doji Star",
  晨星: "Morning Star",
  頸上線: "On-Neck Pattern",
  刺穿形態: "Piercing Pattern",
  黃包車夫: "Rickshaw Man",
  分離線: "Separation Line",
  射擊星: "Shooting Star",
  短蠟燭: "Short Line Candle",
  紡錘線: "Spinning Top",
  停滯形態: "Stalled Pattern",
  三明治: "Stick Sandwich",
  探水竿: "Takuri (Dragonfly Doji with very long lower shadow)",
  跳空並列月缺: "Tasuki Gap",
  向上突破: "	Thrusting Pattern",
  三星: "Tristar Pattern",
  奇特三河床: "Unique 3 River",
  向上跳空兩隻烏鴉: "Upside Gap Two Crows",
  光頭: "Headlight",
  光腳: "Footlight",
  上漲光頭光腳: "Bullish Headlight",
  下跌光頭光腳: "Bearish Headlight",
  三內部上漲: "Three Inside Up",
  三內部下跌: "Three Inside Down",
  三線打擊上漲: "Three Line Strike Up",
  三線打擊下跌: "Three Line Strike Down",
  三外部上漲: "Three Outside Up",
  三外部下跌: "Three Outside Down",
  棄嬰上漲: "Abandoned Baby Bullish",
  棄嬰下跌: "Abandoned Baby Bearish",
  上升三法: "Rising Three Methods",
  下降三法: "Falling Three Methods",
  上升跳空三法: "Upside Gap Three Methods",
  下降跳空三法: "Downside Gap Three Methods",
  多頭吞沒: "Bullish Engulfing",
  空頭吞沒: "Bearish Engulfing",
};

export default KLinePattern;
