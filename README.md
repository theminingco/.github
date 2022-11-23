# ⛏ The Mining Company

This repository consists of several components:
* `Manager` - a command line utility for the manager app.
* `Miner` - a command line utility for the miner app.

All components are tied together using [Nx](https://nx.dev).

## Getting Started

Getting set up with this repository is very easy.
* Install node (18) - `brew install node`.
* Clone this repository `git clone https://github.com/jewel-cash/.github`.
* Install dependencies using npm - `npm install`.
* Run one of the commands below - `npm run start`.

## Commands

Each component has inividual commands specified in the component's `package.json` file. These commands can easily be run by directing your terminal window to the root folder of that component.

There are also commands that will run for all components. These can be run from the root of the repository. Basically this will try to run a command with a similar name for each individual component, skipping the component if that specific command is not present.

Below is a (non-exhaustive) list of available commands:
* `npm run build` - compile the TypeScript code for deployment or serving.
* `npm run test` - runs the [Jest](https://jestjs.io) unit tests.
* `npm run lint` - runs [ESLint](https://eslint.org) to check for bugs and code conventions.

*This repository is not open source. Copyright (c) 2023 The Mining Company*
