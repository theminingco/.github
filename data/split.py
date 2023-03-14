"""This module contains all the code related splitting datasets into train, validate and test sets."""
from argparse import ArgumentParser
from glob import glob
from os import makedirs
from shutil import move
from random import random
from multiprocessing import cpu_count
from tqdm.contrib.concurrent import process_map

class DataSplitter:
    """A class for splitting data into train validation and test data."""

    def __init__(self, path: str, val_percentage: float = 0.1, tst_percentage: float = 0.1) -> None:
        self.path = path
        self.val_percentage = val_percentage
        self.tst_percentage = tst_percentage

        for name in ["trn", "val", "tst"]:
            makedirs(f"{path}/{name}", exist_ok=True)

    def _split_item(self, file: str) -> None:
        """Take a single file and move it to either trn, val or tst."""
        rand = random()

        folder = "trn"
        if rand < self.val_percentage:
            folder = "val"
        elif rand > 1 - self.tst_percentage:
            folder = "tst"

        destination = f"{self.path}/{folder}"
        move(file, destination)

    def split(self, threads: int = cpu_count()) -> None:
        """Split all data files into train, test or validate subsets."""
        files = glob(f"{self.path}/*.pt")
        process_map(self._split_item, files, max_workers=threads)


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-p", "--path", type=str, default=".tmp/data")
    parser.add_argument("-t", "--threads", type=int, default=cpu_count())
    parser.add_argument("--val-percentage", type=float, default=0.1)
    parser.add_argument("--tst-percentage", type=float, default=0.1)
    args = parser.parse_args()

    splitter = DataSplitter(args.path, args.val_percentage, args.tst_percentage)
    splitter.split(args.threads)
