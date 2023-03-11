"""This module contains all the code related to getting all available symbols."""
from argparse import ArgumentParser
from binance.spot import Spot
from util.stick import print_sticks

client = Spot()

def get_candle_sticks(symbol: str, interval: str, limit: int, **_) -> None:
    """The entrypoint of the sticks module."""
    klines = client.klines(symbol, interval, limit=limit)
    return klines

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-s", "--symbol", type=str, default="BTCUSDT")
    parser.add_argument("-i", "--interval", type=str, choices=[""], default="15m")
    parser.add_argument("-n", "--limit", type=int, default=10)
    args = parser.parse_args()

    sticks = get_candle_sticks(**vars(args))
    sticks = [ (float(stick[1]), float(stick[4])) for stick in sticks ]
    print_sticks(sticks)
