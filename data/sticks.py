"""This module contains all the code related to getting all available symbols."""
from argparse import ArgumentParser
from os import getenv
from typing import List
from binance.spot import Spot
from util.stick import Stick, print_sticks

client = Spot(api_key=getenv("BINANCE_KEY"), api_secret=getenv("BINANCE_SECRET"))

def get_candle_sticks(symbol: str, interval: str = "15m", limit: int = 512, end_time: int = None) -> List[Stick]:
    """The entrypoint of the sticks module."""
    chain = hash(symbol)
    klines = client.klines(symbol, interval, limit=limit, endTime=end_time)
    sticks = []
    for kline in klines:
        stick = Stick(
            open_time=int(kline[0]),
            open_price=float(kline[1]),
            high_price=float(kline[2]),
            low_price=float(kline[3]),
            close_price=float(kline[4]),
            volume=float(kline[5]),
            close_time=int(kline[6]),
            quote_volume=float(kline[7]),
            num_trades=int(kline[8]),
            taker_base_volume=float(kline[9]),
            taker_quote_volume=float(kline[10]),
            chain=chain
        )
        sticks.append(stick)
    return sticks

if __name__ == "__main__":
    interval_choices = ["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"]
    parser = ArgumentParser()
    parser.add_argument("-s", "--symbol", type=str, default="BTCUSDT")
    parser.add_argument("-i", "--interval", type=str, choices=interval_choices, default="15m")
    parser.add_argument("-n", "--limit", type=int, default=10)
    args = parser.parse_args()

    candle_sticks = get_candle_sticks(args.symbol, args.interval, args.limit)
    print_sticks(candle_sticks)
