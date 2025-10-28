import db

class Question:
    id: int
    symbol: str
    name: str
    candlestick_data: list[dict]
    correct_ans: str
    explanation: str



def gen_question(server, database, table, user, password):
    records_with_trading_signal = db.get_trading_signals(server, database, table, user, password)

    # 隨機取一樣
    record = records_with_trading_signal.sample(n=1).to_dict("records")[0]
    assert isinstance(record, dict)

    trading_signal = record["trading_signal"]
    symbol = record["symbol"]
    target_date = record["datetime"]
    if "買" in trading_signal:
        correct_ans = "buy"
    else:
        correct_ans = "sell"

    explanations = []
    for k,v in record.items():
        if k in ["Sell_Signals", "Buy_Signals","Signal_Strength", "Trade_Signal", "close_price", "symbol", "datetime", "id"]:
            continue
        if k is not None:
            explanations.append(v)

    previous_prices = db.get_previous_stock_records_by_date(server=server, database=database, user=user, password=password, symbol=symbol, target_date=target_date).get("candlesticks")
    assert isinstance(previous_prices, list)
    after_prices = db.get_after_stock_records_by_date(server=server, database=database, user=user, password=password, symbol=symbol, target_date=target_date).get("candlesticks")
    assert isinstance(after_prices, list)

    previous_indicates = db.get_previous_stock_records_by_date(server=server, database=database, user=user, password=password, symbol=symbol, target_date=target_date).get("candlesticks").get("technical_indicator")

    return {"previous_prices": previous_prices, "after_prices": after_prices, "previous_indicates": previous_indicates, "explanations": explanations, "correct_ans":correct_ans}