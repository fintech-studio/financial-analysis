import yfinance as yf
from datetime import datetime
from fredapi import Fred
import os
from dotenv import load_dotenv

class FundamentalDataProvider:
    """基本面數據提供類"""
    def __init__(self):
        load_dotenv(dotenv_path=".env.local")
        fred_api_key = os.getenv("FRED_API_KEY")
        self.fred = Fred(api_key=fred_api_key) if fred_api_key else None

    def get_fundamental_data(self, ticker: str):
        stock = yf.Ticker(ticker)
        info = stock.info
        
        # 基本資訊
        data = {
            'symbol': info.get('symbol', ticker),
            'shortName': info.get('shortName'),
            'sector': info.get('sector'),
            'industry': info.get('industry'),
            'country': info.get('country'),
            'currency': info.get('currency'),
            'exchange': info.get('exchange'),
            
            # 估值指標
            'marketCap': info.get('marketCap'),
            'trailingPE': info.get('trailingPE'),
            'forwardPE': info.get('forwardPE'),
            'priceToBook': info.get('priceToBook'),
            'priceToSales': info.get('priceToSalesTrailing12Months'),
            'enterpriseToRevenue': info.get('enterpriseToRevenue'),
            'enterpriseToEbitda': info.get('enterpriseToEbitda'),
            'pegRatio': info.get('pegRatio'),
            
            # 財務健康度
            'debtToEquity': info.get('debtToEquity'),
            'currentRatio': info.get('currentRatio'),
            'quickRatio': info.get('quickRatio'),
            'totalCash': info.get('totalCash'),
            'totalDebt': info.get('totalDebt'),
            
            # 獲利能力
            'returnOnEquity': info.get('returnOnEquity'),
            'returnOnAssets': info.get('returnOnAssets'),
            'profitMargins': info.get('profitMargins'),
            'operatingMargins': info.get('operatingMargins'),
            'grossMargins': info.get('grossMargins'),
            
            # 成長性
            'revenueGrowth': info.get('revenueGrowth'),
            'earningsGrowth': info.get('earningsGrowth'),
            'totalRevenue': info.get('totalRevenue'),
            'netIncomeToCommon': info.get('netIncomeToCommon'),
            
            # 股利資訊
            'dividendYield': info.get('dividendYield'),
            'dividendRate': info.get('dividendRate'),
            'payoutRatio': info.get('payoutRatio'),
            'exDividendDate': str(info.get('exDividendDate', '')),
            
            # 股票資訊
            'beta': info.get('beta'),
            'bookValue': info.get('bookValue'),
            'sharesOutstanding': info.get('sharesOutstanding'),
            'fiftyTwoWeekHigh': info.get('fiftyTwoWeekHigh'),
            'fiftyTwoWeekLow': info.get('fiftyTwoWeekLow'),
            'averageVolume': info.get('averageVolume'),
        }
        return data

    def get_cpi_us(self):
        """取得美國CPI資料 (消費者物價指數)"""
        if not self.fred:
            raise Exception("FRED API Key 未設定")
        import pandas as pd
        cpi_series = self.fred.get_series('CPIAUCSL')
        # 計算年增率與月增率
        yoy_series = cpi_series.pct_change(periods=12) * 100
        mom_series = cpi_series.pct_change(periods=1) * 100
        latest_date = cpi_series.index[-1]
        latest_value = cpi_series.iloc[-1]
        yoy = yoy_series.iloc[-1]
        mom = mom_series.iloc[-1]
        return {
            'date': latest_date.strftime("%Y/%m/%d"),
            'value': float(latest_value),
            'YoY(%)': float(yoy) if pd.notnull(yoy) else None,
            'MoM(%)': float(mom) if pd.notnull(mom) else None
        }

    def get_nfp_us(self):
        """取得美國NFP資料 (非農就業人口)"""
        if not self.fred:
            raise Exception("FRED API Key 未設定")
        import pandas as pd
        nfp_series = self.fred.get_series('PAYEMS')
        mom_change_series = nfp_series.diff(periods=1)
        yoy_change_series = nfp_series.diff(periods=12)
        latest_date = nfp_series.index[-1]
        latest_value = nfp_series.iloc[-1]
        mom_change = mom_change_series.iloc[-1]
        yoy_change = yoy_change_series.iloc[-1]
        return {
            'date': latest_date.strftime("%Y/%m/%d"),
            'value': float(latest_value),
            'MoM_Change': float(mom_change) if pd.notnull(mom_change) else None,
            'YoY_Change': float(yoy_change) if pd.notnull(yoy_change) else None
        }

    def get_cpi_us_range(self, start_date, end_date):
        """取得美國CPI指定期間資料，並計算年增率與月增率"""
        if not self.fred:
            raise Exception("FRED API Key 未設定")
        import pandas as pd
        start = datetime.strptime(start_date, "%Y/%m/%d")
        end = datetime.strptime(end_date, "%Y/%m/%d")
        cpi_series = self.fred.get_series('CPIAUCSL')
        yoy_series = cpi_series.pct_change(periods=12) * 100
        mom_series = cpi_series.pct_change(periods=1) * 100
        filtered = cpi_series[(cpi_series.index >= start) & (cpi_series.index <= end)]
        result = []
        for date, value in filtered.items():
            yoy = yoy_series.get(date, None)
            mom = mom_series.get(date, None)
            result.append({
                'date': date.strftime("%Y/%m/%d"),
                'value': float(value),
                'YoY(%)': float(yoy) if pd.notnull(yoy) else None,
                'MoM(%)': float(mom) if pd.notnull(mom) else None
            })
        return result

    def get_nfp_us_range(self, start_date, end_date):
        """取得美國NFP指定期間資料，並計算月變化量與年變化量"""
        if not self.fred:
            raise Exception("FRED API Key 未設定")
        import pandas as pd
        start = datetime.strptime(start_date, "%Y/%m/%d")
        end = datetime.strptime(end_date, "%Y/%m/%d")
        nfp_series = self.fred.get_series('PAYEMS')
        mom_change_series = nfp_series.diff(periods=1)
        yoy_change_series = nfp_series.diff(periods=12)
        filtered = nfp_series[(nfp_series.index >= start) & (nfp_series.index <= end)]
        result = []
        for date, value in filtered.items():
            mom_change = mom_change_series.get(date, None)
            yoy_change = yoy_change_series.get(date, None)
            result.append({
                'date': date.strftime("%Y/%m/%d"),
                'value': float(value),
                'MoM_Change': float(mom_change) if pd.notnull(mom_change) else None,
                'YoY_Change': float(yoy_change) if pd.notnull(yoy_change) else None
            })
        return result

    def get_oil_price(self):
        """取得最新WTI原油價格 (DCOILWTICO)"""
        if not self.fred:
            raise Exception("FRED API Key 未設定")
        import pandas as pd
        oil_series = self.fred.get_series('DCOILWTICO')
        # 過濾掉缺失值
        oil_series = oil_series.dropna()
        latest_date = oil_series.index[-1]
        latest_value = oil_series.iloc[-1]
        return {
            'date': latest_date.strftime("%Y/%m/%d"),
            'symbol': 'DCOILWTICO',
            'value': float(latest_value)
        }

    def get_oil_price_range(self, start_date, end_date):
        """取得WTI原油價格指定期間資料 (DCOILWTICO)"""
        if not self.fred:
            raise Exception("FRED API Key 未設定")
        import pandas as pd
        start = datetime.strptime(start_date, "%Y/%m/%d")
        end = datetime.strptime(end_date, "%Y/%m/%d")
        oil_series = self.fred.get_series('DCOILWTICO')
        oil_series = oil_series.dropna()
        filtered = oil_series[(oil_series.index >= start) & (oil_series.index <= end)]
        result = []
        for date, value in filtered.items():
            result.append({
                'date': date.strftime("%Y/%m/%d"),
                'symbol': 'DCOILWTICO',
                'value': float(value)
            })
        return result

    def get_gold_price(self):
        """取得最新黃金期貨價格 (GC=F)"""
        import pandas as pd
        ticker = yf.Ticker("GC=F")
        hist = ticker.history(period="max")
        hist = hist.dropna(subset=["Close"])
        if hist.empty:
            raise Exception("無法取得黃金期貨價格")
        latest_row = hist.iloc[-1]
        latest_date = hist.index[-1]
        latest_value = latest_row["Close"]
        return {
            'date': latest_date.strftime("%Y/%m/%d"),
            'symbol': 'GC=F',
            'value': float(latest_value)
        }

    def get_gold_price_range(self, start_date, end_date):
        """取得黃金期貨指定期間價格 (GC=F)"""
        import pandas as pd
        # 轉換日期格式 yyyy/mm/dd -> yyyy-mm-dd
        start = datetime.strptime(start_date, "%Y/%m/%d").strftime("%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y/%m/%d").strftime("%Y-%m-%d")
        ticker = yf.Ticker("GC=F")
        hist = ticker.history(start=start, end=end)
        hist = hist.dropna(subset=["Close"])
        result = []
        for date, row in hist.iterrows():
            result.append({
                'date': date.strftime("%Y/%m/%d"),
                'symbol': 'GC=F',
                'value': float(row["Close"])
            })
        return result