"""This module contains all the code related to preparing the dataset."""

def main(args):
    """The entrypoint of the perpare module."""
    print(args)

if __name__ == "__main__":
    from argparse import ArgumentParser
    parser = ArgumentParser()
    main(parser.parse_args())
