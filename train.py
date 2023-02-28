"""This module contains all the code related to training the model."""

def main(args):
    """The entrypoint of the train module."""
    print(args)

if __name__ == "__main__":
    from argparse import ArgumentParser
    parser = ArgumentParser()
    main(parser.parse_args())
