#!/usr/bin/env python3
"""
測試資料庫配置
"""

import os
from config.database_config import DatabaseConfig


def test_config():
    """測試資料庫配置"""
    print("=== 測試資料庫配置 ===")

    # 創建配置物件
    db_config = DatabaseConfig()

    # 顯示除錯資訊
    db_config.debug_config()

    print("\n=== 環境變數檢查 ===")
    print(f"OS db_username: {repr(os.getenv('db_username'))}")
    print(f"OS db_password: {repr(os.getenv('db_password'))}")
    print(f"OS use_windows_auth: {repr(os.getenv('use_windows_auth'))}")
    print(f"OS username (系統): {repr(os.getenv('username'))}")


if __name__ == "__main__":
    test_config()
