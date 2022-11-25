#!/usr/bin/env node

import React from "react";
import { render } from "ink";
import { noEscape } from "@theminingco/core";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import Root from "./components/root.js";
import { openWebSocket } from "./modules/socket.js";

export const options = yargs(hideBin(process.argv))
    .option("debug", { alias: "d", type: "boolean", describe: "Run the miner in debug mode", default: process.env.DEBUG === "true" })
    .option("port", { alias: "p", type: "number", describe: "The port to bind the server on.", default: parseInt(process.env.MANAGER_PORT ?? "") })
    .help()
    .parseSync();

noEscape();
openWebSocket();
render(<Root />, { exitOnCtrlC: false });