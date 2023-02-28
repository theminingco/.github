# jewl.app

## The app

This repository consists of several components repersenting individual subcommands:
* `core` - shared code and logic.
* `prepare` - prepare the dataset for training creating a train, test, validation split.
* `train` - train a model on a specific dataset for a specific number of iterations.
* `test` - test the trained model agains the test dataset.
* `infer` - run inference on newly generated samples.
* `api` - run an inference api.

## Getting Started

Getting set up with this repository is very easy.
* Install python3 and virtualenv `brew install python@3.11 virtualenv`.
* Create a virtual python environment `virtualenv .venv`.
* Activate the virual environment `source .venv/bin/activate`.
* Install the python requirements `pip3 install -r requirements.txt`.
* Run one of the commands such as `./run -h`.

## Commands

The repository is set up very easiliy. There is an entrypoint file called `run` which handles all command-line argument parsing. This file has a set of subcommands. To get a list of subcommands run `./run -h`.

Each subcommand corresponds to a file in the repository. If you look closely in the `run` file you can see that most subcommand just resolve the submodule and calls the `main()` function inside that submodule.

*Copyright © 2023 jewl.app*
