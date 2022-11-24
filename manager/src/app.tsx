import React from "react";
import { render } from "ink";
import { noEscape } from "core";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import Root from "./components/root.js";
import { openWebSocket } from "./modules/socket.js";

export const options = yargs(hideBin(process.argv))
    .option("port", { alias: "p", type: "number", describe: "The port to bind the server on.", default: process.env.WS_PORT ?? "" })
    .help()
    .parseSync();

noEscape();
openWebSocket();
render(<Root />, { exitOnCtrlC: false });