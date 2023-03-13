# ⛏ The Mining Company


## Getting Started

Getting set up with this repository is very easy.
* Install python3 and virtualenv `brew install python@3.10 virtualenv`.
* Create a virtual python environment `virtualenv .venv`.
* Activate the virual environment `source .venv/bin/activate`.
* Install the python requirements `pip3 install -r requirements.txt`.
* Run one of the commands such as `python3 -m server.api`.

## Commands

The repository is set up very easiliy. Each file works as a standalone script that can be called using `python3 -m MODULE`. You can pass the `-h` option to get more information about the script.

### Example

An example workflow for creating, training and serving a model could be:

* Generate a new dataset using `python3 -m data.generate`.
* Create a fresh model using `python3 -m perceptron.create`.
* Train the model `python3 -m perceptron.train`.
* Test the model on a test set `python3 -m perceptron.test`.
* Run inference on a newly created sample `python3 -m perceptron.infer`.
* Start an inference api `python3 -m server.api`.

## Third-party tools

* Machine learning models are trained using [PyTorch](https://pytorch.org).
* Server API is created using [FastAPI](https://fastapi.tiangolo.com).

*Copyright © 2023 ⛏ The Mining Company*
