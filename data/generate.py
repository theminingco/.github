"""A script for generating data."""
from argparse import ArgumentParser
from importlib import import_module
from multiprocessing import cpu_count
from os import getenv
from os.path import isdir
from shutil import rmtree

_name = getenv("MODEL", "fox").lower()

def generate_samples(path: str, amount: int, threads: int):
    """Generate samples."""
    try:
        provider = import_module(f"provider.{_name}")
        provider.generate_samples(path, amount, threads)
    except ImportError:
        print(f"Provider {_name} not found.")
        return

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-p", "--path", type=str, default=".tmp/data")
    parser.add_argument("-n", "--amount", type=int, default=512)
    parser.add_argument("-t", "--threads", type=int, default=cpu_count())
    parser.add_argument("-f", "--fresh", action="store_true")
    args = parser.parse_args()

    if args.fresh and isdir(args.path):
        rmtree(args.path)

    generate_samples(args.path, args.amount, args.threads)
