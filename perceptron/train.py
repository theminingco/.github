"""This module contains all the code related to training the model."""
from argparse import ArgumentParser

def train_model() -> None:
    """The entrypoint of the train module."""
    print("train")

if __name__ == "__main__":
    parser = ArgumentParser()
    args = parser.parse_args()

    train_model()
