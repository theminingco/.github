from os import getenv
from argparse import ArgumentParser
from multiprocessing import cpu_count
from os import makedirs
from os.path import splitext, basename
from shutil import rmtree
from glob import glob
from time import time
from functools import partial
from typing import Dict, List, Tuple
from torch import zeros, float32, tensor, Tensor, save, load, sum as reduce_sum
from tqdm.contrib.concurrent import process_map
from binance.spot import Spot
from util.hash import cyclic_redundancy_check
from util.time import parse_time

_client = Spot(api_key=getenv("BINANCE_KEY"), api_secret=getenv("BINANCE_SECRET"))
_symbols = set(["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "AVAXUSDT", "ADAUSDT", "ATOMUSDT", "DOTUSDT", "TRXUSDT", "ALGOUSDT", "XTZUSDT"])
_interval = "1h"
_size = 128

def _get_candle_sticks(symbol: str, end_time: int = None) -> Tensor:
    """The entrypoint of the sticks module."""
    chain = cyclic_redundancy_check(symbol)
    klines = _client.klines(symbol, _interval, limit=_size, endTime=end_time)
    sticks = zeros((_size, 8), dtype=float32)
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

def _generate_sample(path: str, symbol_and_timestamp: Tuple[str, int]):
    """Generate a single sample."""
    stamp = symbol_and_timestamp[1] * 1000
    sticks = _get_candle_sticks(symbol_and_timestamp[0], stamp)

    if reduce_sum(sticks) == 0:
        return
    filename = f"{path}/{symbol_and_timestamp[0]}-{symbol_and_timestamp[1]}.pt"
    save((sticks[:-1], sticks[1:]), filename)

def _lowest_timestamps(path: str) -> Dict[str, List[int]]:
    """Get the lowest timestamp for a symbol."""
    existing_files = sorted(glob(f"{path}/*.pt", recursive=True))
    lowest_timestamps = { symbol: [] for symbol in _symbols }
    for existing_file in existing_files:
        path, _ = splitext(existing_file)
        parts = basename(path).split("-")
        if len(parts) < 2:
            continue
        symbol = parts[0]
        timestamp = int(parts[1])

        if symbol not in _symbols:
            continue

        lowest_timestamps[symbol] = lowest_timestamps[symbol] + [timestamp]

    return lowest_timestamps

def _next_index(keys: List[str], timestamps: Dict[str, List[int]]) -> int:
    """Get the next index for the keys."""
    if len(keys) == 0:
        return None
    current = len(timestamps[keys[0]])
    for index, key in enumerate(keys):
        if len(timestamps[key]) != current:
            return index
        current = len(timestamps[key])
    return len(keys)

def _symbols_and_timestamps(path: str, amount: int) -> List[Tuple[str, int]]:
    """Get the symbols and timestamps for the samples."""
    lowest_timestamp = _lowest_timestamps(path)
    keys = sorted(lowest_timestamp, key=lambda k: len(lowest_timestamp[k]))

    result = []
    rugged = True
    while amount > 0:
        index = _next_index(keys, lowest_timestamp) if rugged else len(keys)
        rugged = index != len(keys)
        current = len(lowest_timestamp[keys[index - 1]])
        target = len(lowest_timestamp[keys[index]]) if rugged else current + 1
        for _ in range(target - current):
            for key in keys[:index]:
                last_timestamp = lowest_timestamp[key][-1] if len(lowest_timestamp[key]) > 0 else int(time())
                timestamp = last_timestamp - int(parse_time(_interval).total_seconds()) * _size
                result.append((key, timestamp))
                lowest_timestamp[key] = lowest_timestamp[key] + [timestamp]

        amount -= (target - current) * index

    return result

def generate_samples(path: str, amount: int, threads: int = cpu_count()) -> None:
    """Start generating new samples."""
    if path is not None and path != "":
        makedirs(path, exist_ok=True)

    symbols_and_timestamps = _symbols_and_timestamps(path, amount)
    func = partial(_generate_sample, path)
    process_map(func, symbols_and_timestamps, max_workers=threads, leave=False, chunksize=1)


if __name__ == "__main__":
    parser = ArgumentParser()
    args = parser.parse_args()

    generate_samples(".tmp/ephemeral", 1)
    files = glob(".tmp/ephemeral/*.pt")
    for file in files:
        sample = load(file)
        print(sample)
    rmtree(".tmp/ephemeral")
