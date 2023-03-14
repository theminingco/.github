"""This module contains all the code related to printing ascii box plots."""
from argparse import ArgumentParser
from dataclasses import dataclass, fields, asdict
from os import popen, makedirs
from os.path import dirname
from typing import List
from random import randint
from math import floor, log10
from csv import DictReader, DictWriter
from numpy import amin, amax

@dataclass
class Stick:
    """A dataclass for a Kline candlestick."""
    open_time: int = 0
    open_price: float = 0
    high_price: float = 0
    low_price: float = 0
    close_price: float = 0
    close_time: int = 0
    volume: float = 0
    quote_volume: float = 0
    num_trades: int = 0
    taker_base_volume: float = 0
    taker_quote_volume: float = 0
    chain: int = 0

def _print_legend(minimum: float, maximum: float, length: int) -> None:
    """Print a legend for candlesitcks."""
    def _round_sig(x: float):
        return round(x, 3 - int(floor(log10(abs(x)))) - 1)
    length = int(length / 2) * 2
    middle = round((minimum + maximum) / 2, 2)
    low_price = f"{_round_sig(minimum)}"
    mid_price = f"{_round_sig(middle)}"
    high_price =  f"{_round_sig(maximum)}"
    space =  " " * int(length - len(low_price) - len(mid_price) - len(high_price))
    space_splitter = int(len(space) / 2)
    print(f"{low_price}{space[:space_splitter]}{mid_price}{space[space_splitter:]}{high_price}")

def _print_stick(stick: Stick, step: float, offset: float) -> None:
    """Print a single candlestick."""
    stick_start = amin([stick.open_price, stick.close_price])
    stick_end = amax([stick.open_price, stick.close_price])
    prefix = "\x1b[32m" if stick.open_price < stick.close_price else "\x1b[31m"
    space = " " * int((stick.low_price - offset) / step)
    pre_stick = "-" * int((stick_start - stick.low_price) / step)
    stick_space = "=" * int((stick_end - stick_start) / step)
    post_stick = "-" * int((stick.high_price - stick_end) / step)
    suffix = "\x1b[0m"
    print(f"{prefix}{space}{pre_stick}[{stick_space}]{post_stick}{suffix}")

def print_sticks(sticks: List[Stick], length: int = None) -> None:
    """Print one or more candlesticks and an accompanying legend."""
    _, columns = popen("stty size", "r").read().split()
    length = int(columns) if length is None or length == 0 else length
    minimum = amin([ stick.low_price for stick in sticks ])
    maximum = amax([ stick.high_price for stick in sticks ])
    _print_legend(minimum, maximum, length)
    step = (maximum - minimum) / length
    for stick in sticks:
        _print_stick(stick, step, minimum)

def write_sticks(sticks: List[Stick], path: str) -> None:
    """Write one or more candlesitcks to a file."""
    if len(sticks) == 0:
        return
    makedirs(dirname(path), exist_ok=True)
    with open(path, "w+", encoding="utf8") as f:
        legend = [ field.name for field in fields(Stick) ]
        writer = DictWriter(f, legend)
        writer.writeheader()
        for stick in sticks:
            writer.writerow(asdict(stick))

def read_sticks(file: str) -> List[Stick]:
    """Read one or more sticks from a csv file."""
    with open(file, "r", encoding="utf8") as f:
        reader = DictReader(f)
        sticks = []
        for row in reader:
            for field in fields(Stick):
                row[field.name] = field.type(row[field.name])
            sticks.append(Stick(**row))
        return sticks

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-n", "--amount", default=10, type=int)
    args = parser.parse_args()

    data = []
    previous = randint(5, 5000)
    for n in range(args.amount):
        opening = previous + randint(-20, 20)
        closing = previous + randint(-200, 200)
        lowing = amin([opening, closing]) + randint(-20, -1)
        highing = amax([opening, closing]) + randint(1, 20)
        sticker = Stick(
            open_price=float(opening),
            high_price=float(highing),
            low_price=float(lowing),
            close_price=float(closing)
        )
        data.append(sticker)
        previous = closing

    print_sticks(data, args.length)

def test_io_sticks():
    """Test the write_sticks function."""
    sticks = [
        Stick(open_price=1, high_price=2, low_price=0, close_price=1),
        Stick(open_price=2, high_price=3, low_price=1, close_price=2),
        Stick(open_price=3, high_price=4, low_price=2, close_price=3),
        Stick(open_price=4, high_price=5, low_price=3, close_price=4),
        Stick(open_price=5, high_price=6, low_price=4, close_price=5)
    ]
    write_sticks(sticks, ".tmp/test.csv")
    assert read_sticks(".tmp/test.csv") == sticks
