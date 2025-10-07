import os
from dotenv import load_dotenv


class DatabaseConfig:
    """資料庫配置類"""

    def __init__(self):
        load_dotenv(dotenv_path=".env.local")
        self.server = os.getenv("DB_SERVER")
        self.database = os.getenv("DB_NAME", "fundamental_data")
        self.username = os.getenv("DB_USER")
        self.password = os.getenv("DB_PASSWORD")
        self.driver = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")

    def get_connection_string(self):
        return (
            f"DRIVER={{{self.driver}}};"
            f"SERVER={self.server};"
            f"DATABASE={self.database};"
            f"UID={self.username};"
            f"PWD={self.password}"
        )