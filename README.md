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
* Run one of the commands such as `python3 api.py`.

## Commands

The repository is set up very easiliy. Each file works as a standalone script that can be called using `python3 FILE.py`. You can pass the `-h` option to get more information about the script.

*Copyright © 2023 jewl.app*
