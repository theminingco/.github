"""This module contains all the code related to getting all available symbols."""
from argparse import ArgumentParser
from typing import List
from binance.spot import Spot

client = Spot()

def get_available_symbols(**_) -> List[str]:
    """The entrypoint of the symbol module."""
    exchange_info = client.exchange_info()
    symbols = []
    for info in exchange_info["symbols"]:
        if info["baseAsset"] != "USDT" and info["quoteAsset"] != "USDT":
            continue
        symbols.append(info["symbol"])
    return symbols

if __name__ == "__main__":
    parser = ArgumentParser()
    args = parser.parse_args()

    ids = get_available_symbols(**vars(args))

    print(f"{len(ids)} symbols found trading with USDT")
