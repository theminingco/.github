"""This module contains all the code related to testing the model."""
from argparse import ArgumentParser

def evaluate_model() -> None:
    """The entrypoint of the test module."""
    print("test")

if __name__ == "__main__":
    parser = ArgumentParser()
    args = parser.parse_args()

    evaluate_model(**vars(args))