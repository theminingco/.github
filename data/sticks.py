"""This module contains all the code related to getting all available symbols."""
from argparse import ArgumentParser
from os import getenv
from typing import List
from binance.spot import Spot
from util.stick import print_sticks
from torch import zeros, float32, tensor, Tensor

client = Spot(api_key=getenv("BINANCE_KEY"), api_secret=getenv("BINANCE_SECRET"))

def get_candle_sticks(symbol: str, interval: str = "15m", limit: int = 512, end_time: int = None) -> Tensor:
    """The entrypoint of the sticks module."""
    chain = hash(symbol)
    klines = client.klines(symbol, interval, limit=limit, endTime=end_time)
    sticks = zeros((limit, 12), dtype=float32)
    for n, kline in enumerate(klines):
        sticks[n] = tensor([
            float(kline[1]),    # 0: open price
            float(kline[4]),    # 1: close price
            float(kline[3]),    # 2: low price
            float(kline[2]),    # 3: high price
            float(kline[5]),    # 4: volume
            float(kline[7]),    # 5: quote volume
            float(kline[8]),    # 6: number of trades
            float(kline[9]),    # 7: taker base volume
            float(kline[10]),   # 8: taker quote volume
            float(chain),       # 9: chain
            float(kline[0]),    # 10: open time
            float(kline[6])     # 11: close time
        ], dtype=float32)
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
