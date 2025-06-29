# K 線型態分析組件 (KLinePattern)

## 概述

這是一個專業的 K 線技術分析組件，能夠識別和分析超過 60 種專業 K 線型態，為股票交易決策提供全面的技術分析支援。

## 主要特色

### 🎯 全面識別

- **60+ 種專業 K 線型態**：涵蓋日本燭台分析、西方技術分析的所有經典型態
- **多層次組合**：單根、雙根、三根 K 線組合及複雜形態學型態
- **精確數學計算**：基於實體、影線、缺口的精確比例關係
- **實時多型態識別**：可同時發現多種型態並智能排序

### 📊 智能分析

- **信號強度分級**：強烈 (Strong) / 中等 (Moderate) / 微弱 (Weak)
- **型態類型分類**：反轉 (Reversal) / 延續 (Continuation) / 猶豫 (Indecision)
- **可靠度評分**：0-100 分的量化評估系統
- **看漲看跌指示**：清楚的方向性指引與風險提示

### 🎨 現代界面

- **美觀設計**：現代化的漸變背景和卡片式設計
- **直觀指示器**：顏色編碼和圖標指示
- **響應式布局**：適配各種螢幕尺寸
- **進階功能**：型態篩選、統計概覽、實時分析歷史

### 🔧 靈活配置

- **自訂型態**：支援添加自訂型態識別邏輯
- **回調支援**：型態檢測完成後的回調函數
- **實時分析**：記錄分析歷史並顯示趨勢
- **進階篩選**：按類型、強度、可靠度進行篩選

## 支援的 K 線型態 (60+ 種)

### 🔴 反轉型態 (Reversal Patterns)

**單根 K 線型態：**

- **錘子線 (Hammer)** - 強烈看漲反轉訊號
- **上吊線 (Hanging Man)** - 中等看跌反轉訊號
- **射擊之星 (Shooting Star)** - 強烈看跌反轉訊號
- **倒錘子線 (Inverted Hammer)** - 中等看漲反轉訊號
- **墓碑線 (Gravestone Doji)** - 強烈看跌反轉訊號
- **蜻蜓線 (Dragonfly Doji)** - 強烈看漲反轉訊號
- **流星線 (Falling Star)** - 強烈看跌反轉訊號

**雙根 K 線型態：**

- **多頭吞噬 (Bullish Engulfing)** - 強烈看漲反轉訊號
- **空頭吞噬 (Bearish Engulfing)** - 強烈看跌反轉訊號
- **穿刺線 (Piercing Line)** - 中等看漲反轉訊號
- **烏雲蓋頂 (Dark Cloud Cover)** - 中等看跌反轉訊號
- **孕線 (Harami)** - 中等反轉訊號
- **十字孕線 (Harami Cross)** - 強烈反轉訊號
- **鑷子頂 (Tweezers Top)** - 中等看跌反轉訊號
- **鑷子底 (Tweezers Bottom)** - 中等看漲反轉訊號
- **帶身懷六甲 (Pregnant Pattern)** - 中等反轉訊號

**三根 K 線型態：**

- **早晨之星 (Morning Star)** - 強烈看漲反轉訊號
- **黃昏之星 (Evening Star)** - 強烈看跌反轉訊號
- **三白兵 (Three White Soldiers)** - 強烈看漲反轉訊號
- **三隻烏鴉 (Three Black Crows)** - 強烈看跌反轉訊號
- **三川底部 (Three River Bottom)** - 強烈看漲反轉訊號
- **三川頂部 (Three River Top)** - 強烈看跌反轉訊號
- **棄嬰底部 (Abandoned Baby Bottom)** - 極強看漲反轉訊號
- **棄嬰頂部 (Abandoned Baby Top)** - 極強看跌反轉訊號
- **三空陰線 (Three Gaps Down)** - 強烈看漲反轉訊號
- **三空陽線 (Three Gaps Up)** - 強烈看跌反轉訊號

**形態學型態：**

- **頭肩頂 (Head and Shoulders)** - 強烈看跌反轉訊號
- **頭肩底 (Inverse Head and Shoulders)** - 強烈看漲反轉訊號
- **雙頂 (Double Top)** - 強烈看跌反轉訊號
- **雙底 (Double Bottom)** - 強烈看漲反轉訊號
- **三山 (Three Mountains)** - 強烈看跌反轉訊號
- **三川 (Three Rivers)** - 強烈看漲反轉訊號
- **島狀反轉 (Island Reversal)** - 強烈反轉訊號
- **V 型反轉 (V-Shaped Reversal)** - 強烈反轉訊號
- **圓弧頂 (Rounding Top)** - 中等看跌反轉訊號
- **圓弧底 (Rounding Bottom)** - 中等看漲反轉訊號
- **楔形 (Wedge)** - 中等反轉訊號
- **鑽石型態 (Diamond Pattern)** - 中等反轉訊號
- **塔型頂 (Tower Top)** - 強烈看跌反轉訊號
- **塔型底 (Tower Bottom)** - 強烈看漲反轉訊號

### 🔵 延續型態 (Continuation Patterns)

- **長陽線 (Bullish Marubozu)** - 強烈看漲延續訊號
- **長陰線 (Bearish Marubozu)** - 強烈看跌延續訊號
- **均線 (Marubozu)** - 強烈趨勢延續訊號
- **跳空缺口 (Gap)** - 中等延續訊號
- **窗口缺口 (Window)** - 中等延續訊號
- **三法 (Three Methods)** - 中等延續訊號
- **上升三角形 (Ascending Triangle)** - 中等看漲延續訊號
- **下降三角形 (Descending Triangle)** - 中等看跌延續訊號
- **對稱三角形 (Symmetrical Triangle)** - 微弱延續訊號
- **旗桿型態 (Flagpole)** - 強烈延續訊號
- **杯柄型態 (Cup and Handle)** - 中等看漲延續訊號
- **三角旗形 (Pennant)** - 中等延續訊號
- **矩形整理 (Rectangle)** - 微弱延續訊號
- **上升通道 (Rising Channel)** - 中等看漲延續訊號
- **下降通道 (Falling Channel)** - 中等看跌延續訊號
- **階梯型態 (Steps Pattern)** - 中等延續訊號
- **向上跳空並列陰線 (Upside Gap Side-by-Side Black Lines)** - 中等看漲延續訊號
- **向下跳空並列陽線 (Downside Gap Side-by-Side White Lines)** - 中等看跌延續訊號

### ⚪ 猶豫型態 (Indecision Patterns)

- **十字星 (Doji)** - 中等市場猶豫訊號
- **長腿十字 (Long-Legged Doji)** - 中等市場猶豫訊號
- **紡錘頂 (Spinning Top)** - 微弱市場猶豫訊號
- **高浪線 (High Wave)** - 中等市場猶豫訊號
- **一字線 (Four Price Doji)** - 微弱市場猶豫訊號
- **喇叭口 (Broadening Formation)** - 微弱市場猶豫訊號

## 使用方法

### 基本用法

```tsx
import KLinePattern, { KLineData } from "./components/Stock/KLinePattern";

const candlestickData: KLineData[] = [
  {
    date: "2024-01-01",
    open: 100,
    high: 110,
    low: 95,
    close: 105,
    volume: 1000000,
  },
  // ... 更多K線數據
];

function App() {
  return (
    <div>
      <KLinePattern candlestickData={candlestickData} />
    </div>
  );
}
```

### 進階用法

```tsx
import KLinePattern, { Pattern } from "./components/Stock/KLinePattern";

// 自訂型態
const customPatterns: Pattern[] = [
  {
    name: "自訂型態",
    enName: "Custom Pattern",
    type: PatternType.REVERSAL,
    strength: SignalStrength.MODERATE,
    bullish: true,
    reliability: 70,
    check: (data, prevData) => {
      // 自訂檢測邏輯
      return true;
    },
    description: "自訂的型態說明",
    detail: "詳細的型態分析",
  },
];

function AdvancedApp() {
  const handlePatternDetected = (patterns: Pattern[]) => {
    console.log("檢測到型態:", patterns);
    // 可以發送通知或更新狀態
  };

  return (
    <div>
      <KLinePattern
        candlestickData={candlestickData}
        showAdvancedMetrics={true}
        maxPatternsToShow={10}
        enablePatternFiltering={true}
        showDetailByDefault={false}
        customPatterns={customPatterns}
        onPatternDetected={handlePatternDetected}
        highlightStrongSignals={true}
        showPatternRanking={true}
        enableRealTimeAnalysis={true}
      />
    </div>
  );
}
```

### Props 配置

```typescript
interface KLinePatternProps {
  candlestickData: KLineData[]; // 必需：K線數據陣列
  showAdvancedMetrics?: boolean; // 顯示進階指標 (預設: false)
  maxPatternsToShow?: number; // 最大顯示型態數 (預設: 5)
  enablePatternFiltering?: boolean; // 啟用型態篩選 (預設: true)
  showDetailByDefault?: boolean; // 預設展開詳情 (預設: false)
  customPatterns?: Pattern[]; // 自訂型態陣列 (預設: [])
  onPatternDetected?: (patterns: Pattern[]) => void; // 型態檢測回調
  highlightStrongSignals?: boolean; // 高亮強訊號 (預設: true)
  showPatternRanking?: boolean; // 顯示型態排名 (預設: true)
  enableRealTimeAnalysis?: boolean; // 啟用實時分析 (預設: false)
}
```

### 數據格式

```typescript
interface KLineData {
  date?: string; // 日期 (可選)
  open: number; // 開盤價
  high: number; // 最高價
  low: number; // 最低價
  close: number; // 收盤價
  volume?: number; // 成交量 (可選)
}
```

## 型態識別邏輯

### 1. 錘子線 (Hammer)

```typescript
check: (data: KLineData) => {
  const body = getBodySize(data);
  const lowerShadow = getLowerShadow(data);
  const upperShadow = getUpperShadow(data);
  const totalRange = getTotalRange(data);

  return (
    body < totalRange * 0.3 && // 實體小於總範圍30%
    lowerShadow > body * 2 && // 下影線大於實體2倍
    upperShadow < body * 0.5 && // 上影線小於實體50%
    totalRange > 0 // 有價格波動
  );
};
```

### 2. 多頭吞噬 (Bullish Engulfing)

```typescript
check: (data: KLineData, prevData?: KLineData) => {
  if (!prevData) return false;

  return (
    isRed(prevData) && // 前一根為陰線
    isGreen(data) && // 當前為陽線
    data.open < prevData.close && // 當前開盤低於前收盤
    data.close > prevData.open && // 當前收盤高於前開盤
    getBodySize(data) > getBodySize(prevData) * 1.2 // 實體大於前一根1.2倍
  );
};
```

### 3. 早晨之星 (Morning Star)

```typescript
check: (data: KLineData, prevData?: KLineData, prev2Data?: KLineData) => {
  if (!prevData || !prev2Data) return false;

  return (
    isRed(prev2Data) &&
    isBig(prev2Data) && // 第一根長陰線
    isSmall(prevData) && // 第二根小實體
    isGreen(data) && // 第三根陽線
    data.close > (prev2Data.open + prev2Data.close) / 2 // 收盤超過第一根中點
  );
};
```

## 組件功能

### 主要顯示區域

- **型態名稱**：中英文對照顯示
- **方向指示**：↗️ 看漲 / ↘️ 看跌 / ↔️ 中性
- **型態類型**：反轉/延續/猶豫標籤
- **信號強度**：強烈/中等/微弱指示
- **可靠度**：進度條顯示 0-100%評分

### 詳細信息區域（可展開）

- **詳細說明**：型態的技術分析解釋
- **其他型態**：同時識別到的其他型態
- **K 線數據**：當前 K 線的 OHLC 數據

### 視覺設計

- **顏色編碼**：
  - 反轉型態：紅色系
  - 延續型態：藍色系
  - 猶豫型態：灰色系
- **強度指示**：
  - 強烈：紅色
  - 中等：黃色
  - 微弱：灰色

## 技術實現

### 輔助函數

```typescript
const getBodySize = (data: KLineData): number =>
  Math.abs(data.close - data.open);
const getUpperShadow = (data: KLineData): number =>
  data.high - Math.max(data.open, data.close);
const getLowerShadow = (data: KLineData): number =>
  Math.min(data.open, data.close) - data.low;
const getTotalRange = (data: KLineData): number => data.high - data.low;
const isRed = (data: KLineData): boolean => data.close < data.open;
const isGreen = (data: KLineData): boolean => data.close > data.open;
```

### 型態排序

組件會按照以下規則對匹配的型態進行排序：

1. **信號強度**：強烈 > 中等 > 微弱
2. **可靠度**：高可靠度優先顯示
3. **綜合評分**：強度權重 × 100 + 可靠度

## 注意事項

1. **數據質量**：確保輸入的 K 線數據準確完整
2. **趨勢背景**：型態分析需要結合整體趨勢判斷
3. **風險控制**：技術分析僅供參考，需要配合其他分析方法
4. **實時更新**：K 線數據變化時，型態識別會自動更新

## 擴展性

組件設計具有良好的擴展性：

- **新增型態**：在 `patterns` 陣列中添加新的型態定義
- **自定義邏輯**：修改型態的 `check` 函數實現自定義識別邏輯
- **樣式定制**：通過 Tailwind CSS 類名輕鬆定制外觀
- **國際化**：支持中英文雙語顯示

## 依賴項

- React 18+
- TypeScript 4.5+
- Tailwind CSS 3.0+

## 版本歷史

- **v2.0.0** - 完全重構，新增智能分析和現代化界面
- **v1.0.0** - 基礎版本，支持基本型態識別
