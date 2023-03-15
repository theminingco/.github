"""The sticks module is responsible for fetching candle sticks from the Binance API."""""
from argparse import ArgumentParser
from os import getenv
from binance.spot import Spot
from torch import zeros, float32, tensor, Tensor
from util.hash import cyclic_redundancy_check

client = Spot(api_key=getenv("BINANCE_KEY"), api_secret=getenv("BINANCE_SECRET"))

def get_candle_sticks(symbol: str, interval: str = "15m", limit: int = 512, end_time: int = None) -> Tensor:
    """The entrypoint of the sticks module."""
    chain = cyclic_redundancy_check(symbol)
    klines = client.klines(symbol, interval, limit=limit, endTime=end_time)
    sticks = zeros((limit, 8), dtype=float32)
    for n, kline in enumerate(klines):
        open_price = float(kline[1]) + 1e-12
        high_price = float(kline[2]) + 1e-12
        low_price = float(kline[3]) + 1e-12
        close_price = float(kline[4]) + 1e-12
        base_volume = float(kline[5]) + 1e-12
        quote_volume = float(kline[7]) + 1e-12
        number_of_trades = float(kline[8]) + 1e-12
        taker_base_volume = float(kline[9]) + 1e-12
        taker_quote_volume = float(kline[10]) + 1e-12
        sticks[n] = tensor([
            low_price / high_price,             # 0: low to high ratio
            open_price / high_price,            # 1: open to high ratio
            close_price / high_price,           # 2: close to high ratio
            number_of_trades / 1e6,             # 3: trade percentage
            taker_base_volume / base_volume,    # 4: taker base volume percentage
            taker_quote_volume / quote_volume,  # 5: taker quote volume percentage
            chain,                              # 6: hashed chain
            float(0),                           # 7: padding
        ], dtype=float32)
    return sticks

if __name__ == "__main__":
    interval_choices = ["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"]
    parser = ArgumentParser()
    parser.add_argument("-s", "--symbol", type=str, default="BTCUSDT")
    parser.add_argument("-i", "--interval", type=str, choices=interval_choices, default="15m")
    parser.add_argument("-n", "--limit", type=int, default=10)
    args = parser.parse_args()

    candle_sticks, timestamps = get_candle_sticks(args.symbol, args.interval, args.limit)
    total = candle_sticks.size(0)
    for k in range(total):
        perc = candle_sticks[k][2] - candle_sticks[k][1]
        color = ""
        if perc > 0:
            color = "\x1b[32m"
        elif perc < 0:
            color = "\x1b[31m"
        suffix = "\x1b[0m"
        print(f"{color}{abs(perc):.2%}{suffix}")
