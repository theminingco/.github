"""This module contains all the code related to printing ascii progress bars."""
from argparse import ArgumentParser
from time import sleep

def print_bar(n, total, suffix: str | None, length=25, **_):
    """Print an updatable progressbar to the terminal."""
    iteration = f"{n:0{len(str(total))}d}"
    filled_length = int(length * n // total)
    progress_bar = ">" + " " * (length-1)
    progress_bar = "-" * filled_length + progress_bar[:length-filled_length]

    if suffix is None or suffix == "":
        perc = int(round((n / total) * 100))
        suffix = f"{perc}%"

    line = f"{iteration}/{total} [{progress_bar}] - {suffix}"

    print(line, end="\r")
    if n == total:
        print()

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-n", "--iterations", type=int, default=100)
    parser.add_argument("-l", "--length", type=int, default=25)
    parser.add_argument("-s", "--suffix", type=str)
    args = parser.parse_args()

    print_bar(0, args.iterations, **vars(args))
    for k in range(args.iterations):
        sleep(0.1)
        print_bar(k+1, args.iterations, **vars(args))