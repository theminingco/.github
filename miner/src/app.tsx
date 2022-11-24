import React from "react";
import { render } from "ink";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import Root from "./components/root.js";
import { connectToSocket } from "./modules/socket.js";

export const options = yargs(hideBin(process.argv))
    .option("manager", { alias: "m", type: "string", describe: "The manager to connect to", default: process.env.MANAGER_URL ?? "" })
    .option("debug", { alias: "d", type: "boolean", describe: "Run the miner in debug mode", default: process.env.DEBUG ?? false })
    .help()
    .parseSync();

connectToSocket();

render(<Root />, { exitOnCtrlC: false });