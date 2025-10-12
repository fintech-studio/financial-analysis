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
        cpi_series = self.fred.get_series('CPIAUCSL')
        latest_date = cpi_series.index[-1]
        latest_value = cpi_series.iloc[-1]
        return {
            'date': latest_date.strftime("%Y/%m/%d"),
            'value': float(latest_value)
        }

    def get_nfp_us(self):
        """取得美國NFP資料 (非農就業人口)"""
        if not self.fred:
            raise Exception("FRED API Key 未設定")
        nfp_series = self.fred.get_series('PAYEMS')
        latest_date = nfp_series.index[-1]
        latest_value = nfp_series.iloc[-1]
        return {
            'date': latest_date.strftime("%Y/%m/%d"),
            'value': float(latest_value)
        }

    def get_cpi_us_range(self, start_date, end_date):
        """取得美國CPI指定期間資料"""
        if not self.fred:
            raise Exception("FRED API Key 未設定")
        # 轉換日期格式 yyyy/mm/dd -> yyyy-mm-dd
        start = datetime.strptime(start_date, "%Y/%m/%d")
        end = datetime.strptime(end_date, "%Y/%m/%d")
        cpi_series = self.fred.get_series('CPIAUCSL')
        # 篩選期間
        filtered = cpi_series[(cpi_series.index >= start) & (cpi_series.index <= end)]
        result = []
        for date, value in filtered.items():
            result.append({
                'date': date.strftime("%Y/%m/%d"),
                'value': float(value)
            })
        return result

    def get_nfp_us_range(self, start_date, end_date):
        """取得美國NFP指定期間資料"""
        if not self.fred:
            raise Exception("FRED API Key 未設定")
        start = datetime.strptime(start_date, "%Y/%m/%d")
        end = datetime.strptime(end_date, "%Y/%m/%d")
        nfp_series = self.fred.get_series('PAYEMS')
        filtered = nfp_series[(nfp_series.index >= start) & (nfp_series.index <= end)]
        result = []
        for date, value in filtered.items():
            result.append({
                'date': date.strftime("%Y/%m/%d"),
                'value': float(value)
            })
        return result