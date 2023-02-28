"""This module contains all the code related to running inference with a model."""

def main(args):
    """The entrypoint of the inference module."""
    print(args)

if __name__ == "__main__":
    from argparse import ArgumentParser
    parser = ArgumentParser()
    main(parser.parse_args())
