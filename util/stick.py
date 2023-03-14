"""This module contains all the code related to printing ascii box plots."""
from argparse import ArgumentParser
from os import popen
from random import randint
from math import floor, log10
from torch import Tensor, tensor, minimum, maximum, float32, zeros
from torch import min as tmin
from torch import max as tmax
from torch import round as tround

def _print_legend(lowest: Tensor, highest: Tensor, length: int) -> None:
    """Print a legend for candlesitcks."""
    def _round_sig(x: Tensor):
        decimals = 3 - int(floor(log10(abs(x))))
        return tround(x, decimals=decimals)
    length = int(length / 2) * 2
    middle = (lowest + highest) / 2
    low_price = f"{_round_sig(lowest)}"
    mid_price = f"{_round_sig(middle)}"
    high_price =  f"{_round_sig(highest)}"
    space =  " " * int(length - len(low_price) - len(mid_price) - len(high_price))
    space_splitter = int(len(space) / 2)
    print(f"{low_price}{space[:space_splitter]}{mid_price}{space[space_splitter:]}{high_price}")

def _print_stick(stick: Tensor, step: float, offset: float) -> None:
    """Print a single candlestick."""
    stick_start = minimum(stick[0], stick[1])
    stick_end = maximum(stick[0], stick[1])
    prefix = "\x1b[32m" if stick[0] < stick[1] else "\x1b[31m"
    space = " " * int((stick[2] - offset) / step)
    pre_stick = "-" * int((stick_start - stick[2]) / step)
    stick_space = "=" * int((stick_end - stick_start) / step)
    post_stick = "-" * int((stick[3] - stick_end) / step)
    suffix = "\x1b[0m"
    print(f"{prefix}{space}{pre_stick}[{stick_space}]{post_stick}{suffix}")

def print_sticks(sticks: Tensor, length: int = None) -> None:
    """Print one or more candlesticks and an accompanying legend."""
    _, columns = popen("stty size", "r").read().split()
    length = int(columns) if length is None or length == 0 else length
    lowest = tmin(sticks[:,2])
    highest = tmax(sticks[:,3])
    _print_legend(lowest, highest, length)
    step = (highest - lowest) / length
    for stick in sticks:
        _print_stick(stick, step, lowest)

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-n", "--amount", default=10, type=int)
    args = parser.parse_args()

    data = zeros((args.amount, 4), dtype=float32)
    previous = tensor(randint(5, 5000), dtype=float32)
    for n in range(args.amount):
        opening = previous + randint(-20, 20)
        closing = previous + randint(-200, 200)
        lowing = minimum(opening, closing) + randint(-20, -1)
        highing = maximum(opening, closing) + randint(1, 20)
        data[n] = tensor([opening, closing, lowing, highing], dtype=float32)
        previous = closing

    print_sticks(tensor(data))
