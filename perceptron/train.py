"""This module contains all the code related to training the model."""

def train_model() -> None:
    """The entrypoint of the train module."""
    print("train")

if __name__ == "__main__":
    from argparse import ArgumentParser

    parser = ArgumentParser()
    args = parser.parse_args()

    train_model(**vars(args))
