import pandas as pd
import pyodbc


def get_trading_signals(
    server, database, table, user, password, chunk_size=50000
):
    import pyodbc

    conn_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={server};DATABASE={database};UID={user};PWD={password};"
        f"Trusted_Connection=no;Connection Timeout=30;"
        f"Application Name=TechnicalAnalysis"
    )

    try:
        with pyodbc.connect(conn_str) as conn:
            conn.setdecoding(pyodbc.SQL_CHAR, encoding='utf-8')
            conn.setdecoding(pyodbc.SQL_WCHAR, encoding='utf-8')

            count_query = f"SELECT COUNT(*) FROM {table} WHERE Trade_Signal IS NOT NULL"
            cursor = conn.cursor()
            row_count = cursor.execute(count_query).fetchval()
            print(f"資料表 {table} 共有 {row_count:,} 筆資料", flush=True)

            if row_count <= chunk_size:
                query = f"SELECT * FROM {table} ORDER BY datetime"
                df = pd.read_sql(query, conn)
                print(f"已一次讀取全部 {len(df):,} 筆資料", flush=True)
            else:
                print("資料量較大，使用分塊讀取...", flush=True)
                date_range_query = (
                    f"SELECT MIN(datetime) as min_date, "
                    f"MAX(datetime) as max_date FROM {table}"
                )
                date_range = pd.read_sql(date_range_query, conn)
                min_date = date_range['min_date'].iloc[0]
                max_date = date_range['max_date'].iloc[0]

                chunks = []
                current_date = min_date
                end_date = max_date

                while current_date <= end_date:
                    next_date = (
                        pd.to_datetime(current_date) + pd.DateOffset(months=3)
                    )
                    chunk_query = (
                        "SELECT * FROM {} WHERE datetime >= '{}' "
                        "AND datetime < '{}' WHERE Trade_Signal IS NOT NULL ORDER BY datetime"
                    ).format(table, current_date, next_date)
                    chunk = pd.read_sql(chunk_query, conn)
                    chunks.append(chunk)
                    print(
                        f"已讀取 {current_date} 至 {next_date} 期間的 "
                        f"{len(chunk):,} 筆資料", flush=True
                    )
                    current_date = next_date

                df = pd.concat(chunks, ignore_index=True)
                print(f"共讀取 {len(df):,} 筆資料", flush=True)

        if 'datetime' in df.columns:
            df['datetime'] = pd.to_datetime(df['datetime'], errors='coerce')
        df = df.sort_values('datetime').reset_index(drop=True)
        return df

    except Exception as e:
        print(f"讀取資料時發生錯誤: {str(e)}", flush=True)
        return pd.DataFrame()


def get_previous_stock_records_by_date(server, database, user, password, symbol, target_date, table="stock_data_1d"):
    """取得指定股票在指定日期之前的最新一筆價格資料"""
    conn_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={server};DATABASE={database};UID={user};PWD={password};"
        f"Trusted_Connection=no;Connection Timeout=30;"
        f"Application Name=TechnicalAnalysis"
    )

    query = f"""
        SELECT TOP 1 *
        FROM {table}
        WHERE symbol = ? AND datetime < ?
        ORDER BY datetime DESC
    """

    try:
        with pyodbc.connect(conn_str) as conn:
            df = pd.read_sql(query, conn, params=[symbol, target_date])
            if df.empty:
                print(f"查無 {symbol} 在 {target_date} 之前的資料")
                return []

            candlesticks = []
            for i in range(len(df)):
                datetime = df.loc[i, 'datetime']
                open_price = df.loc[i, 'open_price']
                high_price = df.loc[i, 'high_price']
                low_price = df.loc[i, 'low_price']
                close_price = df.loc[i, 'close_price']

                candlesticks.append({"datetime": datetime, "open_price": open_price, "high_price": high_price, "low_price": low_price, "close_price": close_price})

            # 技術指標
            rsi_5 = df["rsi_5"].tolist()
            rsi_7 = df["rsi_7"].tolist()
            rsi_10 = df["rsi_10"].tolist()
            rsi_14 = df["rsi_14"].tolist()
            rsi_21 = df["rsi_21"].tolist()
            macd = df["macd"].tolist()
            dif = df["dif"].tolist()
            macd_histogram = df["macd_histogram"].tolist()
            rsv = df["rsv"].tolist()
            k_value = df["k_value"].tolist()
            d_value = df["d_value"].tolist()
            j_value = df["j_value"].tolist()
            ma5 = df["ma5"].tolist()
            ma10 = df["ma10"].tolist()
            ma20= df["ma20"].tolist()
            ma60 = df["ma60"].tolist()
            ema12 = df["ema12"].tolist()
            ema26 = df["ema26"].tolist()
            bb_upper = df["bb_upper"].tolist()
            bb_middle = df["bb_middle"].tolist()
            bb_lower = df["bb_lower"].tolist()
            atr = df["atr"].tolist()
            cci = df["cci"].tolist()
            willr = df["willr"].tolist()
            mom = df["mom"].tolist()

            technical_indicator = {
                "rsi_5": rsi_5,
                "rsi_7": rsi_7,
                "rsi_10": rsi_10,
                "rsi_14": rsi_14,
                "rsi_21": rsi_21,
                "macd": macd,
                "dif": dif,
                "macd_histogram": macd_histogram,
                "rsv": rsv,
                "k_value": k_value,
                "d_value": d_value,
                "j_value": j_value,
                "ma5": ma5,
                "ma10": ma10,
                "ma20": ma20,
                "ma60": ma60,
                "ema12": ema12,
                "ema26": ema26,
                "bb_upper": bb_upper,
                "bb_middle": bb_middle,
                "bb_lower": bb_lower,
                "atr": atr,
                "cci": cci,
                "willr": willr,
                "mom": mom,
            }

            return {"candlesticks": candlesticks, "technical_indicator": technical_indicator}

    except Exception as e:
        print(f"讀取資料時發生錯誤: {str(e)}")
        raise Exception(e)


def get_after_stock_records_by_date(server, database, user, password, symbol, target_date, table="stock_data_1d"):
    """取得指定股票在指定日期之後的第一筆價格資料"""
    conn_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={server};DATABASE={database};UID={user};PWD={password};"
        f"Trusted_Connection=no;Connection Timeout=30;"
        f"Application Name=TechnicalAnalysis"
    )

    query = f"""
        SELECT TOP 1 *
        FROM {table}
        WHERE symbol = ? AND datetime > ?
        ORDER BY datetime ASC
    """

    try:
        with pyodbc.connect(conn_str) as conn:
            df = pd.read_sql(query, conn, params=[symbol, target_date])
            if df.empty:
                print(f"查無 {symbol} 在 {target_date} 之後的資料")
                return []

            candlesticks = []
            for i in range(len(df)):
                datetime = df.loc[i, 'datetime']
                open_price = df.loc[i, 'open_price']
                high_price = df.loc[i, 'high_price']
                low_price = df.loc[i, 'low_price']
                close_price = df.loc[i, 'close_price']

                candlesticks.append(
                    {"datetime": datetime, "open_price": open_price, "high_price": high_price, "low_price": low_price,
                     "close_price": close_price})

            return {"candlesticks": candlesticks}

    except Exception as e:
            print(f"讀取資料時發生錯誤: {str(e)}")
            return {}
