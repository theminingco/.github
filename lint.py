"""This module contains all the code related to running the code linter."""
from glob import glob
from sys import exit as sysexit
from pylint.lint import Run

def main(args):
    """The entrypoint of the lint module."""
    _ = args
    files = glob("./*.py")
    proc = Run(files, do_exit=False)
    if proc.linter.stats.global_note < 10:
        sysexit(1)
