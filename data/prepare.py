"""This module contains all the code related to preparing the dataset."""
from argparse import ArgumentParser
from glob import glob
from dataclasses import fields
from typing import List
from torch import tensor, float32
from torch.utils.data import DataLoader, Dataset
from util.stick import Stick, read_sticks

class DataFrame(Dataset):
    """A class for loading minibatches in parallel."""

    def __init__(self, path: str, device: str = "cpu"):
        self.device = device
        self.files = glob(f"{path}/*.csv")
        self.fields = [ field.name for field in fields(Stick) ]

    def __len__(self):
        """Get the amount of data in the set."""
        return len(self.files)

    def _get_elem(self, stick: Stick) -> List:
        """Transform a Stick instance to an array."""
        return [
            stick.open_price,
            stick.high_price,
            stick.low_price,
            stick.close_price,
            stick.volume,
            float(stick.num_trades),
            float(stick.chain),
            float(0)
        ]

    def __getitem__(self, index: int):
        """Return a tensor for a given index."""
        file = self.files[index]
        sticks = read_sticks(file)
        sticks = [ self._get_elem(stick) for stick in sticks ]
        return tensor(sticks, dtype=float32, device=self.device)

def prepare_dataset(path: str, batch_size: int = 256, shuffle: bool = True, device: str = "cpu") -> None:
    """The entrypoint of the perpare module."""
    frame = DataFrame(path, device)
    loader = DataLoader(frame, batch_size=batch_size, shuffle=shuffle)
    return iter(loader)

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-p", "--path", type=str, default=".tmp/data/trn")
    parser.add_argument("-n", "--batch-size", type=int, default=256)
    args = parser.parse_args()

    dataset = prepare_dataset(args.path, args.batch_size)
    batch = next(dataset)
    print(batch.size())
