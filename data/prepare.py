"""This module contains all the code related to preparing the dataset."""

def prepare_dataset(**_) -> None:
    """The entrypoint of the perpare module."""
    print("prepare")

if __name__ == "__main__":
    from argparse import ArgumentParser
    parser = ArgumentParser()
    args = parser.parse_args()
    prepare_dataset(**vars(args))
