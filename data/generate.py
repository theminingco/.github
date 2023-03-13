"""This module contains all the code related to preparing the dataset."""
from argparse import ArgumentParser
from os import makedirs
from os.path import splitext
from shutil import rmtree
from glob import glob
from time import time
from data.sticks import get_candle_sticks
from data.symbols import get_available_symbols
from util.progress import print_bar
from util.stick import write_sticks

def check_existing_files(path: str) -> dict[str, int]:
    """Check any existing files to make sure the same sample is not generated twice."""
    lowest_timestamp = { }

    existing_files = glob(f"{path}/*.csv")
    for existing_file in existing_files:
        name = splitext(existing_file)[0]
        parts = name.split("-")
        if len(parts) < 2:
            continue

        if parts[0] not in lowest_timestamp or lowest_timestamp[parts[0]] < int(parts[2]):
            lowest_timestamp[parts[0]] = int(parts[1])

    return lowest_timestamp

def generate_samples(lowest_timestamp: dict[str, int], interval: str, size: int, path: str):
    """Start generating new samples. This method loops endlessly until interrupeted."""
    symbols = get_available_symbols()
    total = len(symbols)

    print_bar(0, total, prefix="", suffix="")
    counter = 0
    while True:
        for n, symbol in enumerate(symbols):
            end_time = lowest_timestamp[symbol] if symbol in lowest_timestamp else int(time() * 1000)
            if end_time == 0:
                continue
            sticks = get_candle_sticks(symbol, interval, size, end_time - 1)
            if len(sticks) != size:
                lowest_timestamp[symbol] = 0
                continue

            filename = f"{path}/{symbol}-{sticks[0].open_time}.csv"
            write_sticks(sticks, filename)

            lowest_timestamp[symbol] = sticks[0].open_time
            counter += 1
            print_bar(n, total, prefix="", suffix=f" {counter}")

def generate_dataset(path: str, interval: str = "15m", size: int = 512, fresh: bool = False, **_) -> None:
    """The entrypoint of the generate module."""
    if fresh:
        rmtree(path)
    makedirs(path, exist_ok=True)

    lowest_timestamp = check_existing_files(path)
    generate_samples(lowest_timestamp, interval, size, path)


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-p", "--path", type=str, default=".tmp/data")
    parser.add_argument("-s", "--size", type=int, default=512)
    parser.add_argument("-f", "--fresh", action="store_true")
    args = parser.parse_args()

    try:
        generate_dataset(**vars(args))
    except KeyboardInterrupt:
        print()
