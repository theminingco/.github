"""This module contains all the code related to unit tests."""

def main(args):
    """The entrypoint of the unit test module."""
    print(args)

if __name__ == "__main__":
    from argparse import ArgumentParser
    parser = ArgumentParser()
    main(parser.parse_args())
