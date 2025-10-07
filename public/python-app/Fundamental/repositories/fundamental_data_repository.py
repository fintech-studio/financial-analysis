import pyodbc
from config.database_config import DatabaseConfig

class FundamentalDataRepository:
    """基本面數據儲存庫類"""
    def __init__(self):
        config = DatabaseConfig()
        self.conn_str = config.get_connection_string()

    def _get_table_name(self, market: str):
        return f'fundamental_data_{market}'

    def _ensure_table(self, market: str):
        table = self._get_table_name(market)
        # CPI/NFP 資料表
        if market in ['cpi_us', 'nfp_us']:
            with pyodbc.connect(self.conn_str) as conn:
                cursor = conn.cursor()
                cursor.execute(f"""
                    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='{table}' AND xtype='U')
                    CREATE TABLE {table} (
                        date NVARCHAR(20) PRIMARY KEY,
                        value FLOAT,
                        lastUpdate DATETIME DEFAULT GETDATE()
                    )
                """)
                conn.commit()
            return

        with pyodbc.connect(self.conn_str) as conn:
            cursor = conn.cursor()
            cursor.execute(f"""
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='{table}' AND xtype='U')
                CREATE TABLE {table} (
                    symbol NVARCHAR(50) PRIMARY KEY,
                    shortName NVARCHAR(255),
                    sector NVARCHAR(255),
                    industry NVARCHAR(255),
                    marketCap BIGINT,
                    trailingPE FLOAT,
                    forwardPE FLOAT,
                    priceToBook FLOAT,
                    dividendYield FLOAT,
                    beta FLOAT,
                    country NVARCHAR(50),
                    currency NVARCHAR(10),
                    exchange NVARCHAR(50),
                    priceToSales FLOAT,
                    enterpriseToRevenue FLOAT,
                    enterpriseToEbitda FLOAT,
                    pegRatio FLOAT,
                    debtToEquity FLOAT,
                    returnOnEquity FLOAT,
                    returnOnAssets FLOAT,
                    profitMargins FLOAT,
                    operatingMargins FLOAT,
                    grossMargins FLOAT,
                    revenueGrowth FLOAT,
                    earningsGrowth FLOAT,
                    currentRatio FLOAT,
                    quickRatio FLOAT,
                    totalCash BIGINT,
                    totalDebt BIGINT,
                    totalRevenue BIGINT,
                    netIncomeToCommon BIGINT,
                    bookValue FLOAT,
                    sharesOutstanding BIGINT,
                    fiftyTwoWeekHigh FLOAT,
                    fiftyTwoWeekLow FLOAT,
                    averageVolume BIGINT,
                    dividendRate FLOAT,
                    payoutRatio FLOAT,
                    exDividendDate NVARCHAR(20),
                    lastUpdate DATETIME DEFAULT GETDATE()
                )
            """)
            conn.commit()

    def save_fundamental_data(self, market: str, data: dict):
        self._ensure_table(market)
        table = self._get_table_name(market)
        with pyodbc.connect(self.conn_str) as conn:
            cursor = conn.cursor()
            # --- CPI/NFP更新區塊 ---
            if market in ['cpi_us', 'nfp_us']:
                cursor.execute(f"SELECT value FROM {table} WHERE date=?", data['date'])
                row = cursor.fetchone()
                if row:
                    # 若 value 不同則匯入新資料
                    if float(row[0]) != float(data['value']):
                        cursor.execute(
                            f"UPDATE {table} SET value=?, lastUpdate=GETDATE() WHERE date=?",
                            data['value'], data['date']
                        )
                        conn.commit()
                    return
                cursor.execute(
                    f"INSERT INTO {table} (date, value) VALUES (?, ?)",
                    data['date'], data['value']
                )
                conn.commit()
                return
            # --- 股票更新區塊 ---
            symbol = data['symbol']
            cursor.execute(f"SELECT * FROM {table} WHERE symbol=?", symbol)
            row = cursor.fetchone()
            if row:
                # 檢查是否有變動（只比對主要財務欄位）
                columns = list(data.keys())
                db_values = [row[i] for i in range(len(columns))]
                new_values = [data[k] for k in columns]
                if db_values != new_values:
                    # 有變動則更新
                    set_clause = ','.join([f"{col}=?" for col in columns])
                    cursor.execute(
                        f"UPDATE {table} SET {set_clause}, lastUpdate=GETDATE() WHERE symbol=?",
                        *new_values, symbol
                    )
                    conn.commit()
                return
            else:
                # INSERT
                columns = ','.join(data.keys())
                placeholders = ','.join(['?' for _ in data])
                values = list(data.values())
                cursor.execute(
                    f"INSERT INTO {table} ({columns}) VALUES ({placeholders})",
                    *values
                )
            conn.commit()