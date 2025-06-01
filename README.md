# Financial Analysis 金融走勢智慧分析平台

本專案是一個現代化的金融市場分析平台，提供股票、加密貨幣等多元市場的數據分析、技術指標、基本面分析與投資組合管理功能。

## 主要功能

- **市場總覽**：即時顯示股票、加密貨幣等市場的關鍵指標與走勢。
- **AI 智能預測**：運用機器學習模型分析市場走勢，提供投資建議與風險提醒。
- **股票分析**：個股基本面、技術面、產業分析與策略建議。
- **加密貨幣分析**：主流幣種行情、技術指標、DeFi/NFT 市場追蹤。
- **投資組合管理**：資產配置、績效追蹤、AI 建議、風險指標。
- **社群討論**：整合多個投資討論社群與熱門貼文。

## 技術棧

- **前端框架**：
  - React 19 (Next.js 15)
  - TypeScript
- **UI 樣式**：Tailwind CSS / Headless UI
- **Icon**：Heroicons
- **圖表與動畫**：
  - Chart.js / react-chartjs-2
  - Framer Motion
  - GSAP
- **部署平台**：GitHub Pages

## 專案結構簡介

- `src/pages/`：各大功能頁面（市場分析、投資組合、社群等）
- `src/components/`：可重用的 UI 元件
- `src/data/`：模擬資料與資料結構定義
- `src/styles/`：全域 CSS 樣式
- `next.config.js`：Next.js 設定檔

## 資料架構

### 市場分析資料

- 股票市場：基本面、技術面、籌碼面指標
- 加密貨幣：價格、交易量、市值等資訊
- 全球市場：各區域指數、匯率、商品期貨

### 投資組合資料

- 資產配置：各類資產權重與變化
- 績效分析：報酬率、風險指標
- 交易紀錄：歷史交易資料
- AI 建議：智能投資建議與風險提醒

## 啟動方式

1. 安裝依賴

   ```bash
   npm install
   ```

2. 開發模式啟動

   ```bash
   npm run dev
   ```

3. 靜態匯出

   ```bash
   npm run build
   npm run export
   ```

## 備註

- 本專案為前端靜態網站，所有數據為假資料或模擬資料，僅供學術與展示用途。
- 若需部署至 GitHub Pages，請確認 `next.config.js` 的 `basePath` 與 `assetPrefix` 設定正確。
