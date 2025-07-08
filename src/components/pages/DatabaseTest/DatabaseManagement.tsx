import React, { useState, useCallback, memo, useMemo } from "react";
import { DatabaseController } from "@/controllers/DatabaseController";
import { useMvcController } from "@/hooks/useMvcController";
import { DatabaseConfig } from "@/services/DatabaseService";
import { AuthService } from "@/services/AuthService";

// ===================== 型別定義 =====================
interface DatabaseQueryResult {
  success: boolean;
  data?: any[];
  count?: number;
  recordCount?: number;
  executionTime?: number;
  error?: string;
  message?: string;
}

interface DatabaseManagementPageProps {
  config: DatabaseConfig;
  onLogout: () => void;
}

interface QueryTemplate {
  label: string;
  query: string;
  category: string;
  color: string;
}

// ===================== 常數 =====================
const QUERY_TEMPLATES: QueryTemplate[] = [
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
      "SELECT TOP 100 *\nFROM stock_data_1D\nWHERE symbol = 'AAPL' ORDER BY datetime DESC;",
    category: "query",
    color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
  },
  {
    label: "RSI 比較",
    query:
      "SELECT TOP 100 symbol, datetime, rsi_14, close_price\nFROM stock_data_1D\nWHERE datetime = (SELECT MAX(datetime) FROM stock_data_1D)\nORDER BY datetime DESC, symbol;",
    category: "analysis",
    color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
  },
  {
    label: "日期範圍",
    query:
      "SELECT TOP 100 *\nFROM stock_data_1H\nWHERE datetime BETWEEN '2025-06-20T09:00:00' AND '2025-12-31'\nORDER BY datetime ASC;",
    category: "query",
    color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
  },
  {
    label: "特定股票",
    query:
      "SELECT TOP 100 *\nFROM stock_data_1D\nWHERE symbol = 'AAPL'\nORDER BY datetime DESC;",
    category: "query",
    color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
  },
  {
    label: "技術指標異常",
    query:
      "SELECT SYMBOL, DATETIME, OPEN_PRICE, HIGH_PRICE, LOW_PRICE, CLOSE_PRICE, VOLUME, RSI_14\nFROM stock_data_1D\nWHERE datetime = (SELECT MAX(datetime) FROM stock_data_1D) AND (rsi_14 < 30 OR rsi_14 > 70)\nORDER BY datetime DESC;",
    category: "analysis",
    color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
  },
  {
    label: "統計股票數量",
    query:
      "SELECT symbol, COUNT(*) as record_count\nFROM stock_data_1D\nGROUP BY symbol\nORDER BY symbol ASC;",
    category: "stats",
    color: "bg-green-100 hover:bg-green-200 text-green-700",
  },
  {
    label: "⚠️ 修改數據",
    query:
      "-- 危險操作 --\nUPDATE TABLE_NAME\nSET open_price='0.00', high_price='0.00', low_price='0.00', close_price='0.00', volume='0'\nWHERE id = 0",
    category: "danger",
    color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
  },
  {
    label: "⚠️ 新增數據",
    query:
      "-- 危險操作 --\nINSERT INTO TABLE_NAME (symbol, datetime, open_price, high_price, low_price, close_price, volume)\nVALUES ('SYMBOL', '2030-01-01T00:00:00', '0.00', '0.00', '0.00', '0.00', '0');",
    category: "danger",
    color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
  },
  {
    label: "⚠️ 刪除數據",
    query: "-- 危險操作 --\nDELETE FROM TABLE_NAME\nWHERE id = 0",
    category: "danger",
    color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
  },
  {
    label: "⚠️ 新增資料表",
    query:
      "-- 危險操作 --\nCREATE TABLE TABLE_NAME (\n  id INT PRIMARY KEY,\n  symbol VARCHAR(10),\n  datetime DATETIME,\n  open_price DECIMAL(10, 2),\n  high_price DECIMAL(10, 2),\n  low_price DECIMAL(10, 2),\n  close_price DECIMAL(10, 2),\n  volume INT\n);",
    category: "danger",
    color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
  },
  {
    label: "⚠️ 清空資料表",
    query: "-- 危險操作 --\nTRUNCATE TABLE TABLE_NAME",
    category: "danger",
    color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
  },
  {
    label: "⚠️ 刪除資料表",
    query: "-- 危險操作 --\nDROP TABLE IF EXISTS TABLE_NAME",
    category: "danger",
    color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
  },
  {
    label: "⚠️ 新增資料庫",
    query: "-- 危險操作 --\nCREATE DATABASE DATABASE_NAME;",
    category: "danger",
    color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
  },
  {
    label: "⚠️ 刪除資料庫",
    query: "-- 危險操作 --\nDROP DATABASE IF EXISTS DATABASE_NAME",
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
    label: "查詢資料庫屬性",
    query: "select  * from sys.database_files",
    category: "stats",
    color: "bg-green-100 hover:bg-green-200 text-green-700",
  },
];

// ===================== 小型元件 =====================
const QueryTemplates = memo(
  ({
    templates,
    onSelect,
  }: {
    templates: QueryTemplate[];
    onSelect: (q: string) => void;
  }) => (
    <div className="flex flex-wrap gap-2">
      {templates.map((tpl) => (
        <button
          key={tpl.label}
          type="button"
          className={`px-3 py-1 rounded text-xs font-medium border ${tpl.color}`}
          onClick={() => onSelect(tpl.query)}
        >
          {tpl.label}
        </button>
      ))}
    </div>
  )
);
QueryTemplates.displayName = "QueryTemplates";

const TableList = memo(
  ({
    tables,
    selected,
    onSelect,
  }: {
    tables: string[];
    selected: string;
    onSelect: (t: string) => void;
  }) => (
    <div className="max-h-80 overflow-y-auto space-y-1">
      {tables.map((tableName) => (
        <button
          key={tableName}
          onClick={() => onSelect(tableName)}
          className={`w-full text-left px-3 py-2 rounded border border-gray-100 hover:bg-blue-50 ${
            selected === tableName ? "bg-blue-100 font-bold" : ""
          }`}
        >
          {tableName}
        </button>
      ))}
    </div>
  )
);
TableList.displayName = "TableList";

const ResultTable = memo(({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">暫無數據</div>;
  }
  const columns = Object.keys(data[0]);
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
          {data.slice(0, 100).map((row, index) => (
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
      {data.length > 100 && (
        <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 border-t">
          顯示前 100 筆記錄，總共 {data.length} 筆
        </div>
      )}
    </div>
  );
});
ResultTable.displayName = "ResultTable";

// ===================== 主元件 =====================
const DatabaseManagementPage: React.FC<DatabaseManagementPageProps> = ({
  config,
  onLogout,
}) => {
  // 確保 database 欄位有值，預設 master
  const initialConfig = {
    ...config,
    database:
      config.database && config.database.trim() ? config.database : "master",
  };
  const [query, setQuery] = useState("SELECT TOP 10 * FROM sys.tables");
  const [tableList, setTableList] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [, setShowDbSwitcher] = useState(false);
  const [databaseList, setDatabaseList] = useState<string[]>([]);
  const [currentConfig, setCurrentConfig] =
    useState<DatabaseConfig>(initialConfig);
  // 分頁狀態
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const authService = AuthService.getInstance();
  const currentUser = authService.getCurrentUser();
  const databaseController = useMemo(() => new DatabaseController(), []);

  // 查詢操作
  const {
    data: queryResult,
    loading: queryLoading,
    error: queryError,
    execute: executeQuery,
  } = useMvcController<DatabaseQueryResult>();
  // 表列表操作
  const {
    loading: tableListLoading,
    execute: executeGetTableList,
    error: tableListError,
  } = useMvcController<string[]>();

  // 自動載入資料表
  React.useEffect(() => {
    executeGetTableList(async () => {
      const result = await databaseController.getTableList(currentConfig);
      setTableList(result.data || []);
      return result.data || [];
    });
  }, [currentConfig, executeGetTableList, databaseController]);

  // 查詢時自動回到首頁
  const handleExecuteQuery = useCallback(async () => {
    if (!query.trim()) {
      alert("請輸入 SQL 查詢語句");
      return;
    }
    setPage(1);
    await executeQuery(() =>
      databaseController.executeQuery(currentConfig, query.trim())
    );
  }, [query, currentConfig, executeQuery, databaseController]);

  // 載入資料表
  const handleGetTableList = useCallback(async () => {
    await executeGetTableList(async () => {
      const result = await databaseController.getTableList(currentConfig);
      setTableList(result.data || []);
      return result.data || [];
    });
  }, [currentConfig, executeGetTableList, databaseController]);

  // 選擇資料表
  const handleSelectTable = useCallback((tableName: string) => {
    setSelectedTable(tableName);
    setPage(1);
    setQuery((prevQuery) => {
      // 若為空或預設語句，直接給預設查詢
      if (
        !prevQuery.trim() ||
        /^SELECT TOP 10 \* FROM \[?.*\]?$/i.test(prevQuery.trim())
      ) {
        return `SELECT TOP 10 * FROM [${tableName}]`;
      }
      // 正則尋找 FROM ...
      const fromRegex = /FROM\s+\[?([\w.]+)\]?/i;
      if (fromRegex.test(prevQuery)) {
        // 只替換第一個 FROM ...
        return prevQuery.replace(fromRegex, `FROM [${tableName}]`);
      }
      // 沒有 FROM，則在第一個 SELECT ... 之後插入 FROM
      const selectRegex = /(SELECT[\s\S]*?)(WHERE|ORDER BY|GROUP BY|$)/i;
      const match = prevQuery.match(selectRegex);
      if (match) {
        const [selectPart] = match;
        return prevQuery.replace(
          selectPart,
          `${selectPart} FROM [${tableName}] `
        );
      }
      // fallback
      return `SELECT TOP 10 * FROM [${tableName}]`;
    });
  }, []);

  // 套用查詢模板
  const handleSelectTemplate = useCallback((tplQuery: string) => {
    setQuery(tplQuery);
  }, []);

  // 載入資料庫列表
  const handleGetDatabaseList = useCallback(async () => {
    try {
      const result = await databaseController.getDatabaseList(currentConfig);
      setDatabaseList(result.data || []);
      setShowDbSwitcher(true);
    } catch {
      alert("獲取資料庫列表失敗");
    }
  }, [currentConfig, databaseController]);

  // 切換資料庫
  const handleSwitchDatabase = useCallback((dbName: string) => {
    setCurrentConfig((prev) => ({ ...prev, database: dbName || "master" }));
    setShowDbSwitcher(false);
    setTableList([]);
    setSelectedTable("");
    setQuery("SELECT TOP 10 * FROM sys.tables");
  }, []);

  // 分頁資料
  const pagedData = React.useMemo(() => {
    if (!queryResult?.data) return [];
    const start = (page - 1) * pageSize;
    return queryResult.data.slice(start, start + pageSize);
  }, [queryResult, page, pageSize]);
  const totalRows = queryResult?.data?.length || 0;
  const totalPages = Math.ceil(totalRows / pageSize) || 1;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 標題區塊 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                SQL Server 資料庫管理
              </h1>
              <div className="mt-2 space-y-1">
                <p className="text-gray-600">
                  已連接到: {currentConfig.server}:{currentConfig.port} /{" "}
                  {currentConfig.database}
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">資料庫帳號:</span>
                    <span className="font-medium text-blue-600">
                      {currentConfig.user}
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
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 w-36"
              >
                {tableListLoading ? "載入中..." : "重新載入資料表"}
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  快速模板
                </label>
                <QueryTemplates
                  templates={QUERY_TEMPLATES}
                  onSelect={handleSelectTemplate}
                />
              </div>
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
              <button
                onClick={handleExecuteQuery}
                disabled={queryLoading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {queryLoading ? "執行中..." : "執行查詢"}
              </button>
            </div>
          </div>

          {/* 資料表列表與資料庫切換 */}
          <div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">目前資料庫：</span>
                  <span className="font-semibold text-blue-700">
                    {currentConfig.database}
                  </span>
                  <button
                    onClick={handleGetDatabaseList}
                    className="ml-2 px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 rounded border border-yellow-300 text-yellow-800"
                  >
                    變更
                  </button>
                </div>
                {databaseList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {databaseList.map((db) => (
                      <button
                        key={db}
                        onClick={() => handleSwitchDatabase(db)}
                        className={`px-2 py-1 rounded text-xs border ${
                          currentConfig.database === db
                            ? "bg-blue-100 border-blue-400 font-bold"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        {db}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                資料表列表 ({tableList.length})
              </h3>
              {tableListError && (
                <div className="bg-red-50 border border-red-200 rounded p-2 mb-2 text-red-700 text-xs">
                  載入資料表失敗：{tableListError}
                </div>
              )}
              {tableList.length === 0 ? (
                <div className="text-center py-4 text-gray-400">尚未載入</div>
              ) : (
                <TableList
                  tables={tableList}
                  selected={selectedTable}
                  onSelect={handleSelectTable}
                />
              )}
            </div>
          </div>
        </div>

        {/* 查詢結果區塊 */}
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
                    查詢成功，返回 {queryResult.data?.length ?? 0} 筆記錄
                    {queryResult.executionTime && (
                      <span className="ml-2">
                        ・執行時間: {queryResult.executionTime}ms
                      </span>
                    )}
                  </div>
                </div>
                <ResultTable data={pagedData} />
                {/* 分頁按鈕 */}
                {totalRows > pageSize && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                      className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                    >
                      首頁
                    </button>
                    <button
                      className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      上一頁
                    </button>
                    <span className="text-xs text-gray-600">
                      第 {page} / {totalPages} 頁
                    </span>
                    <button
                      className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      下一頁
                    </button>
                    <button
                      className="px-2 py-1 rounded border text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                    >
                      末頁
                    </button>
                  </div>
                )}
              </div>
            ) : queryResult ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <div className="text-red-800 text-sm">
                  {queryResult.error ||
                    queryResult.message ||
                    "查詢失敗: 未知錯誤"}
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
