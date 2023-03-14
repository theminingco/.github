"""This module contains all the code related to preparing the dataset."""
from argparse import ArgumentParser
from glob import glob
from torch import load
from torch.utils.data import DataLoader, Dataset
from torch.nn.functional import pad, normalize

class DataFrame(Dataset):
    """A class for loading minibatches in parallel."""

    def __init__(self, path: str, device: str = "cpu"):
        self.device = device
        self.files = glob(f"{path}/*.pt")

    def __len__(self):
        """Get the amount of data in the set."""
        return len(self.files)

    def __getitem__(self, index: int):
        """Return a tensor for a given index."""
        file = self.files[index]
        sticks = load(file).to(self.device)
        sticks = normalize(sticks, dim=1)
        return pad(sticks, (0, 4))

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
