import React, { useState, useCallback, memo } from "react";
import { DatabaseController } from "@/controllers/DatabaseController";
import { useMvcController } from "@/hooks/useMvcController";
import { DatabaseConfig } from "@/services/DatabaseService";

interface DatabaseLoginPageProps {
  onLoginSuccess: (config: DatabaseConfig) => void;
}

// Input 欄位元件
const InputField = memo(
  ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    required?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        {...props}
      />
    </div>
  )
);

const PasswordField = memo(
  ({
    label,
    value,
    onChange,
    showPassword,
    onToggle,
    required = false,
    ...props
  }: {
    label: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    showPassword: boolean;
    onToggle: () => void;
    required?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="密碼"
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          {...props}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? "隱藏" : "顯示"}
        </button>
      </div>
    </div>
  )
);

const DatabaseList = memo(
  ({
    databaseList,
    selected,
    onSelect,
  }: {
    databaseList: string[];
    selected: string;
    onSelect: (dbName: string) => void;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        選擇資料庫
      </label>
      <div className="max-h-32 overflow-y-auto border border-gray-200 rounded">
        {databaseList.map((dbName) => (
          <button
            key={dbName}
            onClick={() => onSelect(dbName)}
            className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 hover:bg-gray-50 ${
              selected === dbName ? "bg-blue-50 text-blue-900" : ""
            }`}
          >
            {dbName}
          </button>
        ))}
      </div>
    </div>
  )
);

const DatabaseLoginPage: React.FC<DatabaseLoginPageProps> = ({
  onLoginSuccess,
}) => {
  const [config, setConfig] = useState<DatabaseConfig>({
    user: "",
    password: "",
    server: "localhost",
    database: "",
    port: 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [databaseList, setDatabaseList] = useState<string[]>([]);

  // MVC 控制器
  const databaseController = new DatabaseController();

  // 使用 MVC Hook 管理連接測試
  const { loading: connectionLoading, execute: executeConnectionTest } =
    useMvcController<{ success: boolean; message: string }>();
  // 使用 MVC Hook 管理資料庫列表
  const { loading: databaseListLoading, execute: executeGetDatabaseList } =
    useMvcController<string[]>();

  // 快速登入 - 自動填入測試資料
  const handleQuickLogin = useCallback(() => {
    setConfig({
      user: "webtest",
      password: "webtestPass123!",
      server: "localhost",
      database: "TEST_DATABASE",
      port: 1433,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    });
  }, []);

  // 測試並登入資料庫
  const handleLogin = useCallback(async () => {
    // 若未輸入資料庫名稱，預設為 master
    const loginConfig = {
      ...config,
      database:
        config.database && config.database.trim() ? config.database : "master",
    };
    if (!validateConfig(loginConfig)) return;
    await executeConnectionTest(async () => {
      const result = await databaseController.testConnection(loginConfig);
      setConnectionStatus(result);
      if (result.success) {
        setTimeout(() => {
          onLoginSuccess(loginConfig);
        }, 1000);
      }
      return result;
    });
  }, [config, executeConnectionTest, onLoginSuccess]);

  // 獲取資料庫列表
  const handleGetDatabaseList = useCallback(async () => {
    if (!config.server) {
      alert("請先填寫伺服器地址");
      return;
    }
    if (!config.user || !config.password) {
      alert("請填寫使用者名稱和密碼");
      return;
    }
    await executeGetDatabaseList(async () => {
      try {
        const result = await databaseController.getDatabaseList(config);
        setDatabaseList(result.data || []);
        return result.data || [];
      } catch (error: any) {
        alert(`獲取資料庫列表失敗: ${error.message}`);
        throw error;
      }
    });
  }, [config, executeGetDatabaseList]);

  // 驗證配置
  const validateConfig = useCallback(
    (cfg: DatabaseConfig = config): boolean => {
      if (!cfg.server) {
        alert("請填寫伺服器地址");
        return false;
      }
      if (!cfg.user || !cfg.password) {
        alert("請填寫使用者名稱和密碼");
        return false;
      }
      // database 可為空，因為預設會用 master
      return true;
    },
    [config]
  );

  // 從資料庫列表選擇資料庫
  const handleSelectDatabase = useCallback((dbName: string) => {
    setConfig((prev) => ({ ...prev, database: dbName }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          {/* 標題 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              資料庫登入
            </h1>
            <p className="text-gray-600">請輸入您的 SQL Server 連接資訊</p>
          </div>

          {/* 快速登入按鈕 */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">開發模式</p>
                <p className="text-xs text-blue-700">快速填入測試登入資訊</p>
              </div>
              <button
                onClick={handleQuickLogin}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                快速登入
              </button>
            </div>
          </div>

          {/* 表單 */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="伺服器地址"
                required
                value={config.server}
                onChange={(e) =>
                  setConfig({ ...config, server: e.target.value })
                }
                placeholder="localhost"
              />
              <InputField
                label="連接埠號"
                type="number"
                value={config.port}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    port: parseInt(e.target.value) || 1433,
                  })
                }
                placeholder="1433"
              />
            </div>
            <InputField
              label="使用者名稱"
              required
              value={config.user || ""}
              onChange={(e) => setConfig({ ...config, user: e.target.value })}
              placeholder="SQL Server 帳號"
            />
            <PasswordField
              label="密碼"
              required
              value={config.password || ""}
              onChange={(e) =>
                setConfig({ ...config, password: e.target.value })
              }
              showPassword={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                資料庫名稱 *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.database || ""}
                  onChange={(e) =>
                    setConfig({ ...config, database: e.target.value })
                  }
                  placeholder="資料庫名稱"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleGetDatabaseList}
                  disabled={databaseListLoading}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  {databaseListLoading ? "..." : "📋"}
                </button>
              </div>
            </div>
            {databaseList.length > 0 && (
              <DatabaseList
                databaseList={databaseList}
                selected={config.database || ""}
                onSelect={handleSelectDatabase}
              />
            )}
            {connectionStatus && (
              <div
                className={`p-3 rounded ${
                  connectionStatus.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div
                  className={`text-sm ${
                    connectionStatus.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {connectionStatus.message}
                </div>
              </div>
            )}
            <button
              onClick={handleLogin}
              disabled={connectionLoading}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {connectionLoading ? "連接中..." : "登入資料庫"}
            </button>
          </div>

          {/* 提示資訊 */}
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="text-sm font-medium text-gray-900 mb-2">連接提示</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 確保 SQL Server 服務已啟動</li>
              <li>• 預設連接埠號為 1433</li>
              <li>• 需要啟用 SQL Server 驗證模式</li>
              <li>• 確認帳戶有資料庫連接權限</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseLoginPage;
