import React, { useState, useCallback } from "react";
import { DatabaseConfig } from "@/services/DatabaseService";
import DatabaseLoginPage from "./DatabaseLogin";
import DatabaseManagementPage from "./DatabaseManagement";

const DatabaseTestPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [databaseConfig, setDatabaseConfig] = useState<DatabaseConfig | null>(
    null
  );

  // 處理登入成功
  const handleLoginSuccess = useCallback((config: DatabaseConfig) => {
    setDatabaseConfig(config);
    setIsLoggedIn(true);
  }, []);

  // 處理登出
  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setDatabaseConfig(null);
  }, []);

  // 根據登入狀態顯示不同頁面
  if (!isLoggedIn || !databaseConfig) {
    return <DatabaseLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <DatabaseManagementPage config={databaseConfig} onLogout={handleLogout} />
  );
};

export default DatabaseTestPage;
