from providers.fundamental_data_provider import FundamentalDataProvider
from repositories.fundamental_data_repository import FundamentalDataRepository

class FundamentalDataService:
    """基本面數據服務類"""
    def __init__(self):
        self.provider = FundamentalDataProvider()
        self.repository = FundamentalDataRepository()

    def _get_ticker_with_suffix(self, ticker: str, market: str):
        suffix_map = {
            'tw': '.TW',
            'two': '.TWO',
            'us': '',        # 美股通常不加後綴
            'etf': '',       # ETF依市場而定，暫不處理
            'index': '',     # 指數依市場而定，暫不處理
            'crypto': '-USD',# yfinance加-USD
            'forex': '=X',   # yfinance加=X
            'futures': '',   # 期貨依市場而定，暫不處理
        }
        suffix = suffix_map.get(market, '')
        if suffix and not ticker.endswith(suffix):
            return ticker + suffix
        return ticker

    def fetch_and_store(self, ticker: str, market: str):
        ticker_with_suffix = self._get_ticker_with_suffix(ticker, market)
        data = self.provider.get_fundamental_data(ticker_with_suffix)
        self.repository.save_fundamental_data(market, data)
        return data

    def fetch_and_store_cpi_us(self):
        """取得並儲存美國CPI資料"""
        data = self.provider.get_cpi_us()
        self.repository.save_fundamental_data('cpi_us', data)
        return data

    def fetch_and_store_nfp_us(self):
        """取得並儲存美國NFP資料"""
        data = self.provider.get_nfp_us()
        self.repository.save_fundamental_data('nfp_us', data)
        return data