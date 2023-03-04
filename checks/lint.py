"""This module contains all the code related to running the code linter."""
from glob import glob
from sys import exit as sysexit
from pylint.lint import Run

def run_linter(**_) -> None:
    """The entrypoint of the lint module."""
    files = glob("./**/*.py")
    proc = Run(files, do_exit=False)
    if proc.linter.stats.global_note < 10:
        sysexit(1)

if __name__ == "__main__":
    from argparse import ArgumentParser
    parser = ArgumentParser()
    args = parser.parse_args()
    run_linter(**vars(args))
