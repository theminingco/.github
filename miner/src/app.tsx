import React from "react";
import { render } from "ink";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import Root from "./components/root.js";
import { connectToSocket } from "./utility/socket.js";

const options = yargs(hideBin(process.argv))
    .option("manager", { alias: "m", type: "string", describe: "The manager to connect to", default: process.env.MANAGER_URL ?? "" })
    .help()
    .parseSync();

connectToSocket(options.manager);

render(<Root />, { exitOnCtrlC: false });