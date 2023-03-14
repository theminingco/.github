"""This module contains all the code related to preparing the dataset."""
from argparse import ArgumentParser
from multiprocessing import cpu_count
from os import makedirs
from os.path import splitext, basename
from shutil import rmtree
from glob import glob
from time import time
from functools import partial
from tqdm.contrib.concurrent import process_map
from torch import save
from data.sticks import get_candle_sticks
from data.symbols import get_available_symbols

class DataGenerator:
    """A class for generating data."""

    def __init__(self, path: str) -> None:
        makedirs(path, exist_ok=True)

        self.path = path
        self.lowest_timestamp = { }
        self.process = None

        existing_files = glob(f"{path}/**/*.csv")
        for existing_file in existing_files:
            path, _ = splitext(existing_file)
            parts = basename(path).split("-")
            if len(parts) < 2:
                continue
            symbol = parts[0]
            timestamp = int(parts[1])

            if symbol not in self.lowest_timestamp or self.lowest_timestamp[symbol] < timestamp:
                self.lowest_timestamp[symbol] = timestamp

    def _generate_sample(self, interval: str, size: int, symbol: str):
        """Generate a single sample for a symbol."""
        end_time = self.lowest_timestamp[symbol] if symbol in self.lowest_timestamp else int(time() * 1000)
        if end_time == 0:
            return
        sticks = get_candle_sticks(symbol, interval, size, end_time - 1)
        if len(sticks) != size:
            self.lowest_timestamp[symbol] = 0
            return

        filename = f"{self.path}/{symbol}-{sticks[0][10]}.pt"
        save(sticks, filename)

        self.lowest_timestamp[symbol] = sticks[0][10]

    def start_generating(self, interval: str = "15m", size: int = 512, iterations: int = 10, threads: int = cpu_count()) -> None:
        """Start generating new samples."""
        symbols = get_available_symbols()

        func = partial(self._generate_sample, interval, size)
        for n in range(iterations):
            desc = f"{n+1:0{len(str(iterations))}d}"
            process_map(func, symbols, max_workers=threads, desc=desc)

if __name__ == "__main__":
    interval_choices = ["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"]
    parser = ArgumentParser()
    parser.add_argument("-p", "--path", type=str, default=".tmp/data")
    parser.add_argument("-s", "--size", type=int, default=512)
    parser.add_argument("-i", "--interval", type=str, choices=interval_choices, default="15m")
    parser.add_argument("-n", "--iterations", type=int, default=1)
    parser.add_argument("-t", "--threads", type=int, default=cpu_count())
    parser.add_argument("-f", "--fresh", action="store_true")
    args = parser.parse_args()

    if args.fresh:
        rmtree(args.path)

    generator = DataGenerator(args.path)
    generator.start_generating(args.interval, args.size, args.iterations, args.threads)
