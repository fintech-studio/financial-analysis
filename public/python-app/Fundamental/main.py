import sys
import argparse
from services.fundamental_data_service import FundamentalDataService

def format_number(value, format_type='general'):
    """格式化數字顯示"""
    if value is None:
        return 'N/A'
    
    if format_type == 'currency':
        if value >= 1e12:
            return f"${value/1e12:.2f}兆"
        elif value >= 1e9:
            return f"${value/1e9:.2f}十億"
        elif value >= 1e6:
            return f"${value/1e6:.2f}百萬"
        else:
            return f"${value:,.0f}"
    elif format_type == 'percentage':
        return f"{value*100:.2f}%" if value else 'N/A'
    elif format_type == 'ratio':
        return f"{value:.2f}" if value else 'N/A'
    else:
        return str(value) if value else 'N/A'

def display_fundamental_data(symbol, data):
    """顯示基本面資料"""
    print(f"\n{'='*60}")
    print(f"  {symbol} - {data.get('shortName', 'N/A')} 基本面分析")
    print(f"{'='*60}")
    
    # 基本資訊
    print("\n📊 基本資訊:")
    print(f"  產業: {data.get('industry', 'N/A')}")
    print(f"  板塊: {data.get('sector', 'N/A')}")
    print(f"  國家: {data.get('country', 'N/A')}")
    print(f"  交易所: {data.get('exchange', 'N/A')}")
    print(f"  貨幣: {data.get('currency', 'N/A')}")
    
    # 估值指標
    print("\n💰 估值指標:")
    print(f"  市值: {format_number(data.get('marketCap'), 'currency')}")
    print(f"  本益比 (P/E): {format_number(data.get('trailingPE'), 'ratio')}")
    print(f"  預估本益比: {format_number(data.get('forwardPE'), 'ratio')}")
    print(f"  股價淨值比 (P/B): {format_number(data.get('priceToBook'), 'ratio')}")
    print(f"  股價營收比 (P/S): {format_number(data.get('priceToSales'), 'ratio')}")
    print(f"  PEG比率: {format_number(data.get('pegRatio'), 'ratio')}")
    
    # 財務健康度
    print("\n🏥 財務健康度:")
    print(f"  負債權益比: {format_number(data.get('debtToEquity'), 'ratio')}")
    print(f"  流動比率: {format_number(data.get('currentRatio'), 'ratio')}")
    print(f"  速動比率: {format_number(data.get('quickRatio'), 'ratio')}")
    print(f"  總現金: {format_number(data.get('totalCash'), 'currency')}")
    print(f"  總負債: {format_number(data.get('totalDebt'), 'currency')}")
    
    # 獲利能力
    print("\n📈 獲利能力:")
    print(f"  股東權益報酬率 (ROE): {format_number(data.get('returnOnEquity'), 'percentage')}")
    print(f"  資產報酬率 (ROA): {format_number(data.get('returnOnAssets'), 'percentage')}")
    print(f"  淨利率: {format_number(data.get('profitMargins'), 'percentage')}")
    print(f"  營業利益率: {format_number(data.get('operatingMargins'), 'percentage')}")
    print(f"  毛利率: {format_number(data.get('grossMargins'), 'percentage')}")
    
    # 成長性
    print("\n🚀 成長性:")
    print(f"  營收成長率: {format_number(data.get('revenueGrowth'), 'percentage')}")
    print(f"  盈餘成長率: {format_number(data.get('earningsGrowth'), 'percentage')}")
    print(f"  總營收: {format_number(data.get('totalRevenue'), 'currency')}")
    
    # 股利資訊
    print("\n💵 股利資訊:")
    print(f"  股利率: {format_number(data.get('dividendYield'), 'percentage')}")
    print(f"  股利金額: {format_number(data.get('dividendRate'), 'ratio')}")
    print(f"  配息率: {format_number(data.get('payoutRatio'), 'percentage')}")
    print(f"  除息日: {data.get('exDividendDate', 'N/A')}")
    
    # 股票資訊
    print("\n📊 股票資訊:")
    print(f"  Beta值: {format_number(data.get('beta'), 'ratio')}")
    print(f"  每股淨值: {format_number(data.get('bookValue'), 'ratio')}")
    print(f"  52週最高: {format_number(data.get('fiftyTwoWeekHigh'), 'ratio')}")
    print(f"  52週最低: {format_number(data.get('fiftyTwoWeekLow'), 'ratio')}")
    print(f"  平均成交量: {format_number(data.get('averageVolume'))}")

def main():
    parser = argparse.ArgumentParser(description='基本面資料查詢工具')
    parser.add_argument('symbols', nargs='*', help='股票代號列表 (例: 2330 AAPL)')
    parser.add_argument('--tw', action='store_true', help='台股市場')
    parser.add_argument('--us', action='store_true', help='美股市場')
    parser.add_argument('--two', action='store_true', help='台灣興櫃市場')
    parser.add_argument('--etf', action='store_true', help='ETF')
    parser.add_argument('--index', action='store_true', help='指數')
    parser.add_argument('--crypto', action='store_true', help='加密貨幣')
    parser.add_argument('--forex', action='store_true', help='外匯')
    parser.add_argument('--futures', action='store_true', help='期貨')
    parser.add_argument('--cpi', action='store_true', help='查詢美國CPI')
    parser.add_argument('--nfp', action='store_true', help='查詢美國NFP')
    parser.add_argument('--start_date', type=str, help='查詢起始日期 (yyyy/mm/dd)')
    parser.add_argument('--end_date', type=str, help='查詢結束日期 (yyyy/mm/dd)')
    #parser.add_argument('--help-markets', action='store_true', help='顯示支援的市場類型')
    
    args = parser.parse_args()

    # CPI/NFP 查詢 (優先處理)
    if args.cpi:
        service = FundamentalDataService()
        try:
            if args.start_date and args.end_date:
                print(f"正在獲取美國CPI期間資料: {args.start_date} ~ {args.end_date}")
                cpi_list = service.fetch_and_store_cpi_us_range(args.start_date, args.end_date)
                print("✓ 美國CPI期間資料:")
                for cpi_data in cpi_list:
                    print(f"  日期={cpi_data['date']} 數值={cpi_data['value']}（指數）")
                print("CPI期間資料已成功儲存")
            else:
                print("正在獲取美國CPI...")
                cpi_data = service.fetch_and_store_cpi_us()
                print(f"✓ 美國CPI最新資料: 日期={cpi_data['date']} 數值={cpi_data['value']}（指數）")
                print("CPI已成功儲存")
        except Exception as e:
            print(f"✗ 美國CPI獲取失敗: {str(e)}")
        return

    if args.nfp:
        service = FundamentalDataService()
        try:
            if args.start_date and args.end_date:
                print(f"正在獲取美國NFP期間資料: {args.start_date} ~ {args.end_date}")
                nfp_list = service.fetch_and_store_nfp_us_range(args.start_date, args.end_date)
                print("✓ 美國NFP期間資料:")
                for nfp_data in nfp_list:
                    print(f"  日期={nfp_data['date']} 數值={nfp_data['value']}（千人）")
                print("NFP期間資料已成功儲存")
            else:
                print("正在獲取美國NFP...")
                nfp_data = service.fetch_and_store_nfp_us()
                print(f"✓ 美國NFP最新資料: 日期={nfp_data['date']} 數值={nfp_data['value']}（千人）")
                print("NFP已成功儲存")
        except Exception as e:
            print(f"✗ 美國NFP獲取失敗: {str(e)}")
        return

    if not args.symbols:
        print("請提供至少一個股票代號")
        print("範例: python main.py 2330 --tw")
        print("      python main.py AAPL --us")
        print("      python main.py --nfp")
        return
    
    # 確定市場類型
    market = None
    if args.tw:
        market = 'tw'
    elif args.us:
        market = 'us'
    elif args.two:
        market = 'two'
    elif args.etf:
        market = 'etf'
    elif args.index:
        market = 'index'
    elif args.crypto:
        market = 'crypto'
    elif args.forex:
        market = 'forex'
    elif args.futures:
        market = 'futures'
    else:
        print("請指定市場類型 (例: --tw, --us, --crypto)")
        return
    
    service = FundamentalDataService()
    
    for symbol in args.symbols:
        try:
            print(f"正在處理 {symbol} ({market})...")
            result = service.fetch_and_store(symbol, market)
            print(f"✓ {symbol} 基本面資料已成功儲存")
            
            # 使用新的顯示函數
            display_fundamental_data(symbol, result)
            
        except Exception as e:
            print(f"✗ {symbol} 處理失敗: {str(e)}")

def show_help():
    """顯示幫助資訊"""
    help_text = """
🚀 基本面分析系統 - 使用說明

基本用法:
  python main.py [股票代號...][市場選項]

市場選項:
  --tw        台股 
  --two       台股上櫃
  --us        美股
  --forex     外匯(資料可能不完整)
  --crypto    加密貨幣(資料可能不完整)

功能選項:
  --help                顯示此幫助資訊
  --nfp                 NFP（Nonfarm Payrolls, 非農就業人數）
  --cpi                 CPI（Consumer Price Index, 消費者物價指數）
  --start_date yyyy/mm/dd  查詢起始日期（僅CPI/NFP有效）
  --end_date yyyy/mm/dd    查詢結束日期（僅CPI/NFP有效）

使用範例:
  python main.py --us AAPL # 查詢美股AAPL
  python main.py AAPL --us # 查詢美股AAPL
  python main.py --us AAPL TSLA  # 查詢美股AAPL、 TSLA 
  python main.py AAPL TSLA --us  # 查詢美股AAPL、TSLA
  python main.py 2330 --tw # 查詢台股2330
  python main.py --tw 2330 2317  # 查詢台股2330、2317
  python main.py 2330 2317 --tw  # 查詢台股2330、2317
  python main.py --nfp # NFP（Nonfarm Payrolls, 非農就業人數)
  python main.py --cpi --start_date 2008/08/01 --end_date 2025/10/01 # 查詢CPI指定期間
  python main.py --nfp --start_date 2010/01/01 --end_date 2024/06/01 # 查詢NFP指定期間
"""
    print(help_text, flush=True)


if __name__ == '__main__':
    # 檢查是否為幫助模式
    if len(sys.argv) > 1 and sys.argv[1] in ["--help", "-h", "help"]:
        show_help()
    else:
        main()