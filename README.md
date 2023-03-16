# ⛏ The Mining Company


## Getting Started

Getting set up with this repository is very easy.
* Install python3 and virtualenv `brew install python@3.10 virtualenv`.
* Create a virtual python environment `virtualenv .venv`.
* Activate the virual environment `source .venv/bin/activate`.
* Install theminingco as an editable package `pip install -e .`.
* Check if the installation worked `tmc`.

## Commands

The repository is set up very easiliy. Each file works as a standalone script that can be called using `tmc MODULE`. You can pass the `-h` option to get more information about the script.

### Example

An example workflow for creating, training and serving a model could be:

* Generate a new dataset using `tmc data.generate`.
* Create a fresh model using `tmc perceptron.create`.
* Train the model `tmc perceptron.train`.
* Test the model on a test set `tmc perceptron.test`.
* Run inference on a newly created sample `tmc perceptron.infer`.
* Start an inference api `tmc server.api`.

*Copyright © 2023 ⛏ The Mining Company*
