"""This module contains all the code related to unit tests."""

def run_unit_tests(**_) -> None:
    """The entrypoint of the unit test module."""
    print("unit tests")

if __name__ == "__main__":
    from argparse import ArgumentParser
    parser = ArgumentParser()
    args = parser.parse_args()
    run_unit_tests(**vars(args))
