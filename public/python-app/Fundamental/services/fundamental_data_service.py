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

    def fetch_and_store_cpi_us_range(self, start_date, end_date):
        """取得並儲存美國CPI指定期間資料"""
        data_list = self.provider.get_cpi_us_range(start_date, end_date)
        self.repository.save_fundamental_data('cpi_us', data_list)
        return data_list

    def fetch_and_store_nfp_us_range(self, start_date, end_date):
        """取得並儲存美國NFP指定期間資料"""
        data_list = self.provider.get_nfp_us_range(start_date, end_date)
        self.repository.save_fundamental_data('nfp_us', data_list)
        return data_list

    def fetch_and_store_oil_price(self):
        """取得並儲存最新WTI原油價格"""
        data = self.provider.get_oil_price()
        self.repository.save_fundamental_data('oil', data)
        return data

    def fetch_and_store_oil_price_range(self, start_date, end_date):
        """取得並儲存WTI原油價格指定期間資料"""
        data_list = self.provider.get_oil_price_range(start_date, end_date)
        self.repository.save_fundamental_data('oil', data_list)
        return data_list

    def fetch_and_store_gold_price(self):
        """取得並儲存最新黃金期貨價格"""
        data = self.provider.get_gold_price()
        self.repository.save_fundamental_data('gold', data)
        return data

    def fetch_and_store_gold_price_range(self, start_date, end_date):
        """取得並儲存黃金期貨指定期間價格"""
        data_list = self.provider.get_gold_price_range(start_date, end_date)
        self.repository.save_fundamental_data('gold', data_list)
        return data_list