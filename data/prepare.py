"""This module contains all the code related to preparing the dataset."""
from argparse import ArgumentParser
from glob import glob
from torch import load, Tensor
from torch.utils.data import DataLoader, Dataset
from torch.nn.functional import pad, normalize

class DataFrame(Dataset):
    """A class for loading minibatches in parallel."""

    def __init__(self, path: str, batch_size: int = 256, shuffle: bool = True, device: str = "cpu") -> None:
        self.device = device
        self.files = glob(f"{path}/*.pt")
        self.batch_size = batch_size
        self.shuffle = shuffle
        self.loader = iter(DataLoader(self, batch_size=batch_size, shuffle=shuffle))

    def __len__(self) -> int:
        """Get the amount of data in the set."""
        return len(self.files)

    def __getitem__(self, index: int) -> Tensor:
        """Return a tensor for a given index."""
        file = self.files[index]
        sticks = load(file).to(self.device)
        sticks = normalize(sticks, dim=1)
        return pad(sticks, (0, 4))

    def __next__(self) -> Tensor:
        """Get the next batch."""
        try:
            next_batch = next(self.loader)
        except StopIteration:
            self.loader = iter(DataLoader(self, batch_size=self.batch_size, shuffle=self.shuffle))
            next_batch = next(self.loader)
        return next_batch

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-p", "--path", type=str, default=".tmp/data/trn")
    parser.add_argument("-n", "--batch-size", type=int, default=256)

    args = parser.parse_args()

    dataset = DataFrame(args.path, args.batch_size)
    batch = next(dataset)
    print(batch.size())
