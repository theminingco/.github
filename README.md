# ⛏ The Mining Company

*A decentralized investment club powered by the Solana blockchain that enables members to collaboratively explore investment opportunities, making collective decisions transparently and securely.*

## Getting Started

* Install NodeJS using `brew install node`.
* Clone this repository using `git clone https://github.com/theminingco/.github`.
* Install the dependencies using `npm install`.
* Run one of the commands below to get started such as `npm run build`.

## Components

This repository consists of a couple of different components that can be run independently of each other. The following is a (non-exhaustive) list of the components and their purpose. The components are tied together using the [Nx](https://nx.dev) build system.

* **Web App** - the [React](https://reactjs.org) static site for ⛏ The Mining Company, bundled and optimized using [Parcel](https://parceljs.org), deployed to [Firebase Hosting](https://firebase.google.com/docs/hosting).
* **Command Line Interface (cli)** - a [NodeJS](https://nodejs.org) cli for ⛏ The Mining Company that contains some useful scripts.
* **Lambda Runner** - a serverless worker that supports the web app, deployed to [Firebase Cloud Functions](https://firebase.google.com/docs/functions).
* **Core Library** - an [npm](https://www.npmjs.com) package containing shared logic and models.

## Commands

All commands should be run from the root of the repository. The commands will try to run a command with the same name for each individual component, skipping the component if that specific command does not exist.

Below is a (non-exhaustive) list of available commands:
* **`npm run build`** - compile the components for deployment or serving.
* **`npm run start`** - start up one (or more) of the components.
* **`npm run clean`** - clean up all local build products, useful for when builds are failing.
* **`npm run lint`** - run linter to check for bugs and code conventions.

If you look closely, the commands just call individual commands specified in the component's `package.json` file. These commands should not be run by themselves as it will not resolve the right dependencies and will not execute the prerequisites. Instead you can specify which app to run with `-- web`, `-- cli`, etc.

*Copyright © 2023 ⛏ The Mining Company*

