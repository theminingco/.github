# ⛏ The Mining Company

Keep on digging...

## Getting Started

* Install NodeJS using `brew install node`.
* Clone this repository using `git clone https://github.com/theminingco/.github`.
* Install the dependencies using `yarn install`.
* Run one of the commands below to get started such as `yarn build`.

## Components

This repository consists of a couple of different components that can be run independently of each other. The following is a (non-exhaustive) list of the components and their purpose. The components are tied together using the [Nx](https://nx.dev) build system.

* [Web App](web/README.md)
* [Command Line Interface (cli)](cli/README.md)
* [Lambda Runner](lambda/README.md)
* [Core Library](core/README.md)
* [Tests](tests/README.md)
* [Linter](lint/README.md)

## Commands

All commands should be run from the root of the repository. The commands will try to run a command with the same name for each individual component, skipping the component if that specific command does not exist.

Below is a (non-exhaustive) list of available commands:
* **`yarn build`** - compile the components for deployment or serving.
* **`yarn start`** - start up one (or more) of the components.
* **`yarn clean`** - clean up all local build products, useful for when builds are failing.
* **`yarn test`** - run the tests for all components.
* **`yarn lint`** - run linter to check for bugs and code conventions.

If you look closely, the commands just call individual commands specified in the component's `package.json` file. These commands should not be run by themselves as it will not resolve the right dependencies and will not execute the prerequisites. Instead you can specify which package to run with `yarn start web`, `yarn start cli`, etc.

*Copyright © 2023 ⛏ The Mining Company*

