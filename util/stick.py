"""This module contains all the code related to printing ascii box plots."""
from argparse import ArgumentParser
from typing import List, Tuple
from random import randint
from numpy import amin, amax

def print_legend(minimum: float, maximum: float, length=50):
    """Print a legend for candlesitcks."""
    length = int(length / 2) * 2
    middle = (minimum + maximum) / 2
    legend = f"{minimum}"
    legend = legend + " " * int(length / 2 - len(legend))
    legend = legend + f"{middle}"
    legend = legend + " " * (length - len(legend))
    legend = legend + f"{maximum}"
    print(legend)

def print_stick(open_price: float, close_price: float, step: float, offset: float):
    """Print a single candlestick."""
    minimum = amin([open_price, close_price]) - offset
    maximum = amax([open_price, close_price]) - offset
    offset = int(minimum / step)
    length = amax([int((maximum - minimum) / step), 1])
    prefix = "\x1b[32m" if open_price < close_price else "\x1b[31m"
    space = " " * offset
    stick = "=" * length
    suffix = "\x1b[0m"

    print(f"{prefix}{space}{stick}{suffix}")

def print_sticks(sticks: List[Tuple[float, float]], length=50, **_):
    """Print one or more candlesticks and an accompanying legend."""
    minimum, maximum = amin(sticks), amax(sticks)
    print_legend(minimum, maximum, length)
    step = (maximum - minimum) / length
    for stick in sticks:
        print_stick(stick[0], stick[1], step, minimum)

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-n", "--amount", default=10, type=int)
    parser.add_argument("-l", "--length", default=50, type=int)
    args = parser.parse_args()

    sticks = []
    previous = randint(5, 5000)
    for n in range(args.amount):
        opening = previous + randint(-20, 20)
        closing = previous + randint(-200, 200)
        sticks.append((opening, closing))
        previous = closing

    print_sticks(sticks, **vars(args))
