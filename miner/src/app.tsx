import React from "react";
import { render } from "ink";
import { noEscape } from "@theminingco/core";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import Root from "./components/root.js";
import { connectToSocket } from "./modules/socket.js";

export const options = yargs(hideBin(process.argv))
    .option("debug", { alias: "d", type: "boolean", describe: "Run the miner in debug mode", default: process.env.DEBUG === "true" })
    .option("manager", { alias: "m", type: "string", describe: "The manager to connect to", default: process.env.MINER_URL ?? "" })
    .help()
    .parseSync();

noEscape();
connectToSocket();
render(<Root />, { exitOnCtrlC: false });