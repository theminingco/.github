# ⛏ The Mining Company

This repository consists of several components:
* `Core` - a package that contains shared logic and models.
* `Manager` - a command line utility for the manager app.
* `Miner` - a command line utility for the miner app.

All components are tied together using [Nx](https://nx.dev).

## Getting Started

Getting set up with this repository is very easy.
* Install node (18) - `brew install node`.
* Clone this repository `git clone https://github.com/theminingco/.github`.
* Install dependencies using npm - `npm install`.
* Run one of the commands below - `npm run start`.

## Commands

There are also commands that will run for all components. These can be run from the root of the repository. Basically this will try to run a command with a similar name for each individual component, skipping the component if that specific command is not present.

Below is a (non-exhaustive) list of available commands:
* `npm run build` - transpile the [TypeScript](https://www.typescriptlang.org) code for deployment or serving.
* `npm run start` - start up the app in development mode.
* `npm run deploy` - deploy the app package to [npm](https://www.npmjs.com).
* `npm run test` - runs the [Jest](https://jestjs.io) unit tests.
* `npm run lint` - runs [ESLint](https://eslint.org) to check for bugs and code conventions.

If you look closely, the commands in the root of the repository just call individual commands specified in the component's `package.json` file. These commands should not be run by themselves as it will not resolve the right dependencies and will not execute the prerequisites. Instead you can specify which app to run with `--projects manager` or `--projects miner`.

*This repository is not open source. Copyright (c) 2023 The Mining Company*
