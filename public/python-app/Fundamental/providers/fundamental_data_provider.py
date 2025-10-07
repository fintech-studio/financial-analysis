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
            'date': str(latest_date.date()),
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
            'date': str(latest_date.date()),
            'value': float(latest_value)
        }