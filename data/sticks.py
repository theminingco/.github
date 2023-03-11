"""This module contains all the code related to getting all available symbols."""
from argparse import ArgumentParser
from typing import List
from binance.spot import Spot
from util.stick import Stick, print_sticks

client = Spot()

def get_candle_sticks(symbol: str, interval: str, limit: int, **_) -> List[Stick]:
    """The entrypoint of the sticks module."""
    klines = client.klines(symbol, interval, limit=limit)
    sticks = []
    for kline in klines:
        stick = Stick(
            float(kline[1]),
            float(kline[2]),
            float(kline[3]),
            float(kline[4]),
            float(kline[5]),
            float(kline[7]),
            float(kline[8]),
            float(kline[9]),
            float(kline[10])
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

    candle_sticks = get_candle_sticks(**vars(args))
    print_sticks(candle_sticks)
