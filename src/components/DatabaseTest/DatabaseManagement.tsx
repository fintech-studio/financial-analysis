import React, { useState } from "react";
import { DatabaseController } from "@/controllers/DatabaseController";
import { useMvcController } from "@/hooks/useMvcController";
import { DatabaseConfig } from "@/services/DatabaseService";
import { AuthService } from "@/services/AuthService";

// 內聯類型定義
interface DatabaseQueryResult {
  success: boolean;
  data?: any[];
  count?: number;
  recordCount?: number;
  executionTime?: number;
  error?: string;
}

interface DatabaseManagementPageProps {
  config: DatabaseConfig;
  onLogout: () => void;
}

const DatabaseManagementPage: React.FC<DatabaseManagementPageProps> = ({
  config,
  onLogout,
}) => {
  const [query, setQuery] = useState("SELECT TOP 10 * FROM sys.tables");
  const [tableList, setTableList] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");

  // 獲取當前登入用戶
  const authService = AuthService.getInstance();
  const currentUser = authService.getCurrentUser();

  // MVC 控制器
  const databaseController = new DatabaseController();

  // 使用 MVC Hook 管理查詢操作
  const {
    data: queryResult,
    loading: queryLoading,
    error: queryError,
    execute: executeQuery,
  } = useMvcController<DatabaseQueryResult>();

  // 使用 MVC Hook 管理表列表
  const { loading: tableListLoading, execute: executeGetTableList } =
    useMvcController<string[]>();

  // 執行數據庫查詢
  const handleExecuteQuery = async () => {
    if (!query.trim()) {
      alert("請輸入 SQL 查詢語句");
      return;
    }

    await executeQuery(() =>
      databaseController.executeQuery(config, query.trim())
    );
  };

  // 獲取表列表
  const handleGetTableList = async () => {
    await executeGetTableList(async () => {
      const result = await databaseController.getTableList(config);
      setTableList(result.data || []);
      return result.data || [];
    });
  };

  // 從表列表選擇表並生成查詢
  const handleSelectTable = (tableName: string) => {
    setSelectedTable(tableName);
    setQuery(`SELECT TOP 10 * FROM [${tableName}]`);
  };

  // 渲染查詢結果表格
  const renderTable = () => {
    if (!queryResult?.data || queryResult.data.length === 0) {
      return <div className="text-center py-8 text-gray-500">暫無數據</div>;
    }

    const columns = Object.keys(queryResult.data[0]);

    return (
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queryResult.data.slice(0, 100).map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {columns.map((column) => (
                  <td key={column} className="px-4 py-3 text-sm text-gray-900">
                    {row[column] === null ? (
                      <span className="text-gray-400 italic">NULL</span>
                    ) : typeof row[column] === "boolean" ? (
                      <span
                        className={
                          row[column] ? "text-green-600" : "text-red-600"
                        }
                      >
                        {row[column] ? "TRUE" : "FALSE"}
                      </span>
                    ) : (
                      String(row[column])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {queryResult.data.length > 100 && (
          <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 border-t">
            顯示前 100 筆記錄，總共 {queryResult.data.length} 筆
          </div>
        )}
      </div>
    );
  };

  // 簡化的查詢模板
  const queryTemplates = [
    {
      label: "系統表",
      query: "SELECT TOP 10 *\nFROM sys.tables",
      category: "system",
      color: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    },
    {
      label: "資料庫",
      query: "SELECT name\nFROM sys.databases",
      category: "system",
      color: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    },
    {
      label: "查詢最新",
      query:
        "SELECT TOP 100 *\nFROM stock_data\nWHERE symbol = 'AAPL' ORDER BY date DESC;",
      category: "query",
      color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
    },
    {
      label: "RSI 比較",
      query:
        "SELECT TOP 100 symbol, date, rsi_14, close_price\nFROM stock_data\nWHERE symbol IN ('2330', 'AAPL') AND date >= DATEADD(MONTH, -3, GETDATE())\nORDER BY date DESC, symbol;",
      category: "analysis",
      color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
    },
    {
      label: "日期範圍",
      query:
        "SELECT TOP 100 *\nFROM stock_data\nWHERE date BETWEEN '2025-01-01' AND '2025-12-31'\nORDER BY date DESC;",
      category: "query",
      color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
    },
    {
      label: "特定股票",
      query:
        "SELECT TOP 100 *\nFROM stock_data\nWHERE symbol = 'AAPL'\nORDER BY date DESC;",
      category: "query",
      color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
    },
    {
      label: "技術指標異常",
      query:
        "SELECT *\nFROM stock_data\nWHERE date = (SELECT MAX(date) FROM stock_data) AND (rsi_14 < 30 OR rsi_14 > 70)\nORDER BY date DESC;",
      category: "analysis",
      color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
    },
    {
      label: "統計股票數量",
      query:
        "SELECT symbol, COUNT(*) as record_count\nFROM stock_data\nGROUP BY symbol\nORDER BY symbol ASC;",
      category: "stats",
      color: "bg-green-100 hover:bg-green-200 text-green-700",
    },
    {
      label: "⚠️ 修改數據",
      query:
        "-- 危險操作\nUPDATE stock_data\nSET open_price='0.00'\nWHERE id = 0",
      category: "danger",
      color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
    },
    {
      label: "⚠️ 新增數據",
      query:
        "-- 危險操作\nINSERT INTO stock_data (symbol, date, open_price, high_price, low_price, close_price, volume)\nVALUES ('SYMBOL', '2030-01-01', '0.00', '0.00', '0.00', '0.00', 0);",
      category: "danger",
      color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
    },
    {
      label: "⚠️ 刪除數據",
      query: "-- 危險操作\nDELETE FROM stock_data\nWHERE id = 0",
      category: "danger",
      color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
    },
    {
      label: "⚠️ 新增資料表",
      query:
        "-- 危險操作\nCREATE TABLE TABLE_NAME (\n  id INT PRIMARY KEY,\n  symbol VARCHAR(10),\n  date DATE,\n  open_price DECIMAL(10, 2),\n  high_price DECIMAL(10, 2),\n  low_price DECIMAL(10, 2),\n  close_price DECIMAL(10, 2),\n  volume INT\n);",
      category: "danger",
      color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
    },
    {
      label: "⚠️ 清空資料表",
      query: "-- 危險操作\nTRUNCATE TABLE stock_data",
      category: "danger",
      color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
    },
    {
      label: "⚠️ 刪除資料表",
      query: "-- 危險操作\nDROP TABLE IF EXISTS TABLE_NAME",
      category: "danger",
      color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
    },
    {
      label: "⚠️ 新增資料庫",
      query: "-- 危險操作\nCREATE DATABASE DATABASE_NAME;",
      category: "danger",
      color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
    },
    {
      label: "⚠️ 刪除資料庫",
      query: "-- 危險操作\nDROP DATABASE IF EXISTS DATABASE_NAME",
      category: "danger",
      color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
    },
    {
      label: "統計資料表大小",
      query:
        "SELECT t.name AS table_name,\n       SUM(p.rows) AS row_count,\n       SUM(a.total_pages) * 8 AS total_size_kb,\n       SUM(a.used_pages) * 8 AS used_size_kb,\n       (SUM(a.total_pages) - SUM(a.used_pages)) * 8 AS unused_size_kb\nFROM sys.tables t\nINNER JOIN sys.indexes i ON t.object_id = i.object_id\nINNER JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id\nINNER JOIN sys.allocation_units a ON p.partition_id = a.container_id\nWHERE t.is_ms_shipped = 0 AND i.type <= 1\nGROUP BY t.name\nORDER BY total_size_kb DESC;",
      category: "stats",
      color: "bg-green-100 hover:bg-green-200 text-green-700",
    },
    {
      label: "查詢資料庫大小",
      query:
        "SELECT DB_NAME(database_id) AS DatabaseName,\n       Name AS Logical_Name,\n       type_desc,\n       Physical_Name,\n       size * 8 / 1024 AS size_mb,\n       (size - FILEPROPERTY(name, 'SpaceUsed')) * 8 / 1024 AS free_space_mb\nFROM sys.master_files\nORDER BY size_mb DESC;",
      category: "stats",
      color: "bg-green-100 hover:bg-green-200 text-green-700",
    },
    {
      label: "查詢資料庫檔案",
      query: "select  * from sys.database_files",
      category: "stats",
      color: "bg-green-100 hover:bg-green-200 text-green-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 頁面標題 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                SQL Server 資料庫管理
              </h1>
              <div className="mt-2 space-y-1">
                <p className="text-gray-600">
                  已連接到: {config.server}:{config.port} / {config.database}
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">資料庫帳號:</span>
                    <span className="font-medium text-blue-600">
                      {config.user}
                    </span>
                  </div>
                  {currentUser && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">登入用戶:</span>
                      <span className="font-medium text-green-600">
                        {currentUser.name}
                      </span>
                      <span className="text-gray-400">
                        ({currentUser.email})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGetTableList}
                disabled={tableListLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {tableListLoading ? "載入中..." : "載入資料表"}
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                登出
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SQL 查詢區域 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                SQL 查詢
              </h2>

              {/* 快速模板 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  快速模板
                </label>
                <div className="flex flex-wrap gap-2">
                  {queryTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(template.query)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SQL 編輯器 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SQL 語句
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="輸入 SQL 查詢語句..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              {/* 執行按鈕 */}
              <button
                onClick={handleExecuteQuery}
                disabled={queryLoading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {queryLoading ? "執行中..." : "執行查詢"}
              </button>
            </div>
          </div>

          {/* 資料表列表 */}
          <div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                資料表列表 ({tableList.length})
              </h3>
              {tableList.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-3">
                    尚未載入資料表列表
                  </p>
                  <button
                    onClick={handleGetTableList}
                    disabled={tableListLoading}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    {tableListLoading ? "載入中..." : "載入資料表列表"}
                  </button>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-1">
                  {tableList.map((tableName) => (
                    <button
                      key={tableName}
                      onClick={() => handleSelectTable(tableName)}
                      className={`w-full text-left px-2 py-1 text-sm rounded ${
                        selectedTable === tableName
                          ? "bg-blue-100 text-blue-900"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {tableName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 查詢結果 */}
        {(queryResult || queryLoading || queryError) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              查詢結果
            </h2>

            {queryLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">正在執行查詢...</div>
              </div>
            ) : queryError ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <div className="text-red-800 text-sm">
                  查詢失敗: {queryError}
                </div>
              </div>
            ) : queryResult?.success ? (
              <div>
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                  <div className="text-green-800 text-sm">
                    查詢成功，返回 {queryResult.count} 筆記錄
                    {queryResult.executionTime && (
                      <span className="ml-2">
                        ・執行時間: {queryResult.executionTime}ms
                      </span>
                    )}
                  </div>
                </div>
                {renderTable()}
              </div>
            ) : queryResult ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <div className="text-red-800 text-sm">
                  查詢失敗: {queryResult.error || "未知錯誤"}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseManagementPage;
