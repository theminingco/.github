"""This module contains the logic to get the available symbols from Binance."""
from argparse import ArgumentParser
from typing import List
from os import getenv
from binance.spot import Spot

client = Spot(api_key=getenv("BINANCE_KEY"), api_secret=getenv("BINANCE_SECRET"))

def get_available_symbols() -> List[str]:
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

    ids = get_available_symbols()

    print(f"{len(ids)} symbols found trading with USDT")
