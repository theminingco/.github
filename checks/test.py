"""This module contains all the code related to unit tests."""
from __future__ import print_function
from sys import modules, exit
from os import devnull
from contextlib import redirect_stdout
from os.path import dirname, splitext, basename
from inspect import getmembers, isfunction
from glob import glob
from importlib import import_module
from traceback import format_exception
from typing import List

check = "\x1b[32m✓\x1b[0m"
cross = "\x1b[31m✗\x1b[0m"

def run_tests(verbose: bool, stop_on_failure: bool, module: List[str], **_):
    if module is None:
        module = glob("**/*.py")
        module = [ splitext(file)[0] for file in module ]
        module = [ file.replace("/", ".") for file in module ]
    results = [ run_test_module(file, verbose, stop_on_failure) for file in module ]
    print(f"{sum(results)}/{len(results)} modules sucessfully tested")
    exit_code = 0 if sum(results) == len(results) else 1
    exit(exit_code)

def run_test_module(module, verbose, stop_on_failure):
    try:
        print(f"Import: {module}", end="\r")
        import_module(module)
        methods = [ method[1] for method in getmembers(modules[module], isfunction) if method[0].startswith("test") ]
        if len(methods) == 0:
            return
        print(f"Testing: {module}")
        results = [ run_test_method(method, verbose, stop_on_failure) for method in methods ]
        print(f"{sum(results)}/{len(results)} tests completed")
        print()
        return True if sum(results) == len(results) else False
    except Exception as e:
        print(f"Import {module} failed:")
        print("".join(format_exception(None, e, e.__traceback__)))
        if stop_on_failure:
            exit(1)
        return False

def run_test_method(function, verbose, stop_on_failure):
    try:
        name = function.__name__.replace("_", " ").capitalize()
        print(f"  [ ] {name}", end="\r")
        if verbose:
            function()
        else:
            with open(devnull, "w") as f, redirect_stdout(f):
                function()
        print(f"  [{check}] {name}")
        return True
    except Exception as e:
        print(f"  [{cross}] {name}")
        if verbose:
            print("".join(format_exception(None, e, e.__traceback__)))
        if stop_on_failure:
            exit(1)
        return False

if __name__ == "__main__":
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument("-v", "--verbose", action="store_true")
    parser.add_argument("-x", "--stop-on-failure", action="store_true")
    parser.add_argument("-m", "--module", type=str, nargs="*")
    args = parser.parse_args()

    run_tests(**vars(args))
