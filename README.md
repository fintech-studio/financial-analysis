# 🚀 FinTech 金融走勢智慧分析平台

<!-- > 東吳大學 2025 金融走勢智慧分析專題 -->

一個全方位的金融科技平台，運用前沿 AI 技術與大數據分析，整合 Next.js 前端、Python 技術分析與 MS SQL Server 資料庫，提供技術分析、基本面分析、K 線型態偵測、交易訊號分析與 AI 預測等功能，為投資者提供精準的市場洞察與智慧投資決策。

## ✨ 核心功能

### 📊 市場分析工具

- **技術分析**：完整的技術指標計算與圖表分析
- **基本面分析**：財務報表、營收獲利與基本面數據分析
- **交易訊號分析**：交易建議與買賣點分析
- **型態識別**：K 線型態偵測與訊號分析
- **金融代號查詢**：多市場金融商品資訊查詢

### 🤖 AI 功能

- **AI 預測**：機器學習模型預測股價走勢
- **AI 助理**：智能投資顧問與策略建議

### 🎯 附屬功能

- **新聞分析**：AI 精選與分析全球財經新聞
- **Python 程式圖形化介面**：簡易操作的技術分析工具
- **資料庫管理**：MS SQL Server 資料庫操作介面
- **多市場支援**：台股、美股、ETF、指數、外匯、加密貨幣與期貨

## 🛠️ 技術架構

### 前端技術

- **React 19** - 最新版本的 React 框架
- **Next.js 15** - 全端 React 框架，支援 SSR/SSG
- **TypeScript** - 型別安全的 JavaScript
- **Tailwind CSS 4.x** - 現代化 CSS 框架

### UI/UX 組件

- **Headless UI** - 無樣式 UI 組件庫
- **Heroicons** - 精美的 SVG 圖標集
- **Ant Design** - 企業級 UI 設計語言
- **GSAP** - 強大的動畫工具
- **Framer Motion** - 高效能動畫庫

### 數據視覺化

- **Chart.js** - 靈活的圖表庫
- **Lightweight Charts** - 專業金融圖表
- **React Sparklines** - 迷你圖表組件

### 後端與資料庫

- **MS SQL Server** - 關聯式資料庫
- **Python** - 技術分析與數據處理引擎
- **Express.js** - Node.js Web 框架
- **Axios** - HTTP 客戶端

## 📁 專案結構

```
financial-analysis/
├── 📁 .github/workflows/              # GitHub Actions CI/CD
├── 📁 public/                         # 靜態資源
│   ├── 📁 kline-patterns/             # K線型態圖片資源
│   ├── 📁 python-app/                 # Python 程式
│   │   ├── 📁Technical-Indicators/    # 技術指標分析系統
│   │   └── 📁Trade-Signals/           # 交易訊號分析
│   └── 📄favicon.ico                  # 網站圖標
├── 📁 src/                            # 主要源碼
│   ├── 📁 components/                 # React 組件
│   ├── 📁 controllers/                # MVC 控制器
│   ├── 📁 hooks/                      # React Hooks
│   ├── 📁 models/                     # 資料模型
│   ├── 📁 pages/                      # Next.js 頁面路由
│   │   ├── 📁api/                     # API 路由
│   ├── 📁 services/                   # 業務邏輯服務
│   └── 📁 styles/                     # 全域樣式
│   ├── 📁 types/                      # TypeScript 型別定義
│   ├── 📁 utils/                      # 工具函數
├── 📄 .env                            # 環境變數配置
├── 📄 next.config.js                  # Next.js 配置
└── 📄 package.json                    # 專案依賴與腳本
├── 📄 tailwind.config.js              # Tailwind CSS 配置
├── 📄 tsconfig.json                   # TypeScript 配置
```

## 🚀 快速開始

### 📋 環境需求

- **Node.js** 22.x 或更高版本
- **npm** 或 **yarn** 套件管理器
- **MS SQL Server** 2017 或更高版本
- **Python** 3.10 或更高版本
- **Ollama** (用於本地 LLM 模型)

### ⚡ 安裝與啟動

1. **複製專案**

   ```bash
   git clone https://github.com/fintech-studio/financial-analysis.git
   cd financial-analysis
   ```

2. **安裝依賴**

   ```bash
   npm install
   ```

3. **環境配置**

   ```bash
   # 複製環境變數範本
   cp .env .env.local

   # 編輯 .env.local
   # 配置資料庫連接、API 端點等
   ```

4. **啟動開發伺服器**

   ```bash
   npm run dev
   ```

   開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 🔧 可用腳本

```bash
# 開發模式（使用 Turbopack 加速）
npm run dev

# 建置生產版本
npm run build

# 建置靜態版本（用於 GitHub Pages）
npm run build:static

# 啟動生產伺服器
npm start

# TypeScript 型別檢查
npm run tsc

# 程式碼審查
npm run lint
```

## 🔧 配置說明

### 環境變數

```env
# 資料庫配置
DB_SERVER = localhost            # 資料庫伺服器地址
DB_PORT = 1433                   # 資料庫連接埠
DB_WEBUSER = username            # 資料庫使用者名稱
DB_WEBUSER_PASSWORD = password   # 資料庫使用者密碼
DB_DATABASE = master             # 資料庫名稱

# Python API 端點 (用於 AI 預測)
PY_API_HOST = http://localhost:8080

# Ollama AI API 端點
OLLAMA_LOCAL = http://localhost:11434/api/chat
```

## 🐍 Python 程式配置

### 技術分析系統

位於 `public/python-app/Technical-Indicators/` & `public/python-app/Trade-Signals/`，提供完整的股票技術分析功能：

```bash
# 進入 Python 應用目錄
cd public/python-app/Technical-Indicators/
cd public/python-app/Trade-Signals/

# 安裝 Python 依賴
pip install -r requirements.txt

# 環境變數配置
cp .env .env.local  # 複製環境變數範本

# 編輯 .env.local
# 配置資料庫連接等
```

### 基本使用 (命令行介面)

> 若使用圖形化介面，可於網站上操作，請忽略此說明。

詳細基本使用說明請參考以下專案：

- [技術指標分析系統](https://github.com/HaoXun97/technical-indicators)

- [交易訊號分析系統](https://github.com/HaoXun97/trade-signals)

## 🌐 GitHub Pages 自動部署

專案已配置完整的 CI/CD 流程：

1. **推送觸發**：推送到 `main` 分支自動觸發部署
2. **自動建置**：GitHub Actions 執行建置腳本
3. **靜態部署**：自動部署到 `gh-pages` 分支
4. **即時更新**：網站自動更新

---

## ⚠️ 免責聲明

本專案僅供學術研究與技術展示用途。實際投資請諮詢專業金融顧問。開發者不對任何投資損失承擔責任。

---

<div align="center">
  <strong>🎓 金融走勢智慧分析專題</strong>
  <!-- <p>東吳大學 2025 金融走勢智慧分析專題</p> -->
  <p>&copy; 2025 FinTech Studio. All rights reserved.</p>
</div>
