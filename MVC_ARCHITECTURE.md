# 金融分析平台 MVC 架構重構指南

## 概述

本專案已成功從傳統的組件架構轉換為標準的 MVC（Model-View-Controller）架構，以提升代碼的可維護性、可測試性和可擴展性。

## 架構結構

### 📁 Models (數據模型層)

位置：`src/models/`

**職責：**

- 定義數據結構和介面
- 處理業務數據邏輯
- 管理數據狀態

**主要文件：**

- `UserModel.ts` - 用戶數據模型
- `StockModel.ts` - 股票數據模型
- `PortfolioModel.ts` - 投資組合模型
- `index.ts` - 模型統一導出

### 📁 Controllers (控制器層)

位置：`src/controllers/`

**職責：**

- 處理業務邏輯
- 協調 Model 和 View 之間的互動
- 處理用戶請求和響應

**主要文件：**

- `UserController.ts` - 用戶相關業務邏輯
- `StockController.ts` - 股票操作業務邏輯
- `PortfolioController.ts` - 投資組合管理邏輯
- `index.ts` - 控制器統一導出

### 📁 Services (服務層)

位置：`src/services/`

**職責：**

- 處理外部 API 調用
- 數據轉換和處理
- 通用服務功能

**主要文件：**

- `ApiService.ts` - 通用 HTTP 請求服務
- `index.ts` - 服務統一導出

### 📁 Views (視圖層)

位置：`src/pages/` 和 `src/components/`

**職責：**

- 渲染用戶界面
- 處理用戶交互事件
- 調用控制器處理業務邏輯

## 使用方式

### 1. 在頁面組件中使用控制器

\`\`\`tsx
import { UserController } from '../controllers/UserController';
import { PortfolioController } from '../controllers/PortfolioController';

const MyPage: React.FC = () => {
const userController = new UserController();
const portfolioController = new PortfolioController();

const handleLogin = async (email: string, password: string) => {
try {
const result = await userController.login({ email, password });
// 處理登入成功
} catch (error) {
// 處理錯誤
}
};

const loadPortfolio = async (userId: string) => {
try {
const portfolio = await portfolioController.getPortfolio(userId);
// 更新頁面狀態
} catch (error) {
// 處理錯誤
}
};

// ... 組件邏輯
};
\`\`\`

### 2. 控制器中使用模型

\`\`\`tsx
export class UserController {
private userModel: UserModel;

constructor() {
this.userModel = UserModel.getInstance();
}

async getUserProfile(userId: string): Promise<User> {
const user = await this.userModel.getUserById(userId);
if (!user) {
throw new Error('用戶不存在');
}
return user;
}
}
\`\`\`

### 3. 模型中的數據管理

\`\`\`tsx
export class StockModel {
private static instance: StockModel;
private stocks: Map<string, Stock> = new Map();

static getInstance(): StockModel {
if (!StockModel.instance) {
StockModel.instance = new StockModel();
}
return StockModel.instance;
}

async getStock(symbol: string): Promise<Stock | null> {
// 數據獲取邏輯
}
}
\`\`\`

## 重構後的優勢

### 1. **職責分離**

- Model 專注於數據管理
- Controller 處理業務邏輯
- View 專注於界面渲染

### 2. **提升可維護性**

- 代碼結構清晰明確
- 易於定位和修改問題
- 降低組件間的耦合度

### 3. **增強可測試性**

- 業務邏輯與 UI 分離
- 可以獨立測試控制器和模型
- Mock 和測試更容易實現

### 4. **更好的可擴展性**

- 新功能可以輕鬆添加到對應層級
- 支持多個控制器協作
- 便於功能模組化

### 5. **統一的錯誤處理**

- 控制器層統一處理錯誤
- 更好的錯誤追蹤和調試
- 一致的錯誤響應格式

## 資料流向

```
用戶操作 → View (React 組件) → Controller (業務邏輯) → Model (數據處理) → 返回結果
```

## 最佳實踐

### 1. **控制器使用**

- 每個頁面或功能模組使用對應的控制器
- 控制器方法應該包含完整的錯誤處理
- 使用 async/await 處理異步操作

### 2. **模型設計**

- 使用單例模式確保數據一致性
- 定義清晰的介面和類型
- 實現數據驗證和業務規則

### 3. **服務層**

- 統一管理外部 API 調用
- 實現請求重試和錯誤處理
- 提供數據轉換功能

### 4. **錯誤處理**

- 控制器層捕獲並處理所有異常
- 提供用戶友好的錯誤訊息
- 記錄詳細的錯誤日誌

## 遷移指南

如果您需要將現有組件遷移到新的 MVC 架構：

1. **識別業務邏輯** - 將組件中的業務邏輯提取到控制器
2. **創建數據模型** - 定義相關的數據結構和操作
3. **更新組件** - 讓組件調用控制器而不是直接處理業務邏輯
4. **測試驗證** - 確保功能正常運作

## 範例參考

請參考 `src/pages/DashboardExample.tsx` 了解如何在實際組件中使用新的 MVC 架構。

## 技術債務清理

重構完成後，建議進行以下清理工作：

- 移除舊的數據處理邏輯
- 更新相關的測試檔案
- 優化 import 語句
- 統一代碼風格和命名規範
